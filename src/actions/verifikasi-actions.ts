/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { canVerifyBukti, isAdmin } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  STATUS_KELENGKAPAN,
  type PertanyaanPeriode,
  type StatusKelengkapan
} from '@/types/rebo';
import {
  sendWhatsAppMessage,
  formatBuktiRevisionNotification,
  formatBuktiApprovedNotification,
  createWhatsAppDeepLink,
  formatPhoneNumber
} from '@/lib/notifications/whatsapp';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';
import { invalidateCacheKey, CACHE_KEYS } from '@/lib/redis/cache';
import {
  getPilarContact,
  getDefaultNotificationReceiver
} from '@/lib/notifications/contacts';

// ==============================================================================
// 1. Zod Validation Schemas
// ==============================================================================

const verifikasiSchema = z
  .object({
    id_pertanyaan: z.string().min(1, 'ID Pertanyaan wajib diisi.'),
    id_periode: z.string().optional(),
    status_kelengkapan: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3)
    ]),
    nilai_verifikasi: z.coerce
      .number()
      .min(0, 'Nilai verifikasi tidak boleh kurang dari 0.'),
    catatan_koordinator: z.string().optional().nullable()
  })
  .refine(
    (data) => {
      // Aturan Bisnis Kritis: Jika status_kelengkapan === 3 (Perlu Revisi),
      // catatan_koordinator WAJIB diisi minimal 5 karakter tidak hanya spasi.
      if (data.status_kelengkapan === 3) {
        return (
          typeof data.catatan_koordinator === 'string' &&
          data.catatan_koordinator.trim().length >= 5
        );
      }
      return true;
    },
    {
      message:
        'Catatan koordinator/revisi wajib diisi minimal 5 karakter jika status diubah menjadi Perlu Revisi.',
      path: ['catatan_koordinator']
    }
  );

export type VerifikasiInput = z.infer<typeof verifikasiSchema>;

export interface SubmitVerifikasiResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: PertanyaanPeriode | null;
  newStatus?: StatusKelengkapan;
  nilaiVerifikasi?: number;
  catatanKoordinator?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  waDeepLink?: string;
}

// ==============================================================================
// 2. Server Action: Submit Verifikasi
// ==============================================================================

/**
 * Memproses verifikasi bukti dukung & penetapan skor verifikasi oleh Koordinator Pilar / TPI / Admin:
 * - Memvalidasi hak akses RBAC menggunakan `canVerifyBukti`.
 * - Memvalidasi status periode evaluasi (apakah terkunci).
 * - Menerapkan aturan bisnis: Catatan wajib diisi saat status 'Perlu Revisi' (3).
 * - Memperbarui tabel `pertanyaan_periode` (status_kelengkapan, nilai_verifikasi, catatan_koordinator, verified_by, verified_at).
 * - Sinkronisasi ke tabel legacy `buktiDukung` (status_kelengkapan, catatan_koordinator, nilai_akhir).
 * - Merekam riwayat mutasi ke tabel `audit_log` (APPROVE, REVISE, atau UPDATE_VERIFIKASI).
 * - Merevalidasi cache path `/rebo/formRB/[pilarId]`, `/rebo/monitoring`, dan `/rebo/overview`.
 */
export async function submitVerifikasiAction(
  input: VerifikasiInput
): Promise<SubmitVerifikasiResult> {
  try {
    // 1. Validasi sesi pengguna
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Sesi berakhir atau pengguna belum login. Silakan masuk terlebih dahulu.'
      };
    }

    // 2. Validasi input via Zod
    const parseResult = verifikasiSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors
        .map((e) => e.message)
        .join(', ');
      return {
        success: false,
        error: `Validasi gagal: ${errorMsg}`
      };
    }
    const validated = parseResult.data;

    const supabase = await createClient();

    // 3. Dapatkan pilar pemilik pertanyaan untuk memvalidasi hak verifikasi RBAC
    const { data: qData, error: qError } = await supabase
      .from('pertanyaan')
      .select(
        'id_pertanyaan, deskripsi_pertanyaan, id_subpilar, subpilar (id_subpilar, id_pilar, pilar (id_pilar, nama_pilar))'
      )
      .eq('id_pertanyaan', validated.id_pertanyaan)
      .maybeSingle();

    if (qError) {
      console.error(
        '[VERIFIKASI-ACTIONS] Error fetching pertanyaan info:',
        qError
      );
    }

    let targetPilarId: string | null = null;
    let targetPilarNama = 'Pilar RB';
    let targetPertanyaanDeskripsi = `Indikator ${validated.id_pertanyaan}`;

    if (qData) {
      if (qData.deskripsi_pertanyaan) {
        targetPertanyaanDeskripsi = qData.deskripsi_pertanyaan;
      }
      if (qData.subpilar) {
        const sp = qData.subpilar as any;
        targetPilarId = sp.id_pilar ? String(sp.id_pilar) : null;
        if (sp.pilar?.nama_pilar) {
          targetPilarNama = sp.pilar.nama_pilar;
        } else if (targetPilarId) {
          targetPilarNama = `Pilar ${targetPilarId}`;
        }
      }
    }

    // 4. Validasi hak akses RBAC
    const hasVerifyAccess = canVerifyBukti(
      session.role,
      session.assignedPilarId,
      targetPilarId
    );

    if (!hasVerifyAccess) {
      return {
        success: false,
        error: `Akses ditolak: Anda tidak memiliki wewenang untuk memverifikasi bukti pada Pilar ${targetPilarId ?? ''}. Hanya Koordinator Pilar, TPI, atau Super Admin yang diizinkan.`
      };
    }

    // 5. Tentukan periode evaluasi target
    let targetPeriodeId = validated.id_periode;
    if (!targetPeriodeId) {
      const { data: activePeriode } = await supabase
        .from('periode_evaluasi')
        .select('id, tahun, is_locked')
        .eq('is_active', true)
        .order('tahun', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activePeriode?.id) {
        targetPeriodeId = activePeriode.id;

        if (activePeriode.is_locked && !isAdmin(session.role)) {
          return {
            success: false,
            error:
              'Periode evaluasi ini telah dikunci (closed). Tindakan verifikasi tidak diizinkan.'
          };
        }
      }
    }

    const now = new Date().toISOString();
    const verifierName =
      session.fullName ||
      session.email ||
      (session.role === 'admin'
        ? 'Super Admin'
        : session.role === 'tpi'
          ? 'Tim Penilai Internal'
          : 'Koordinator Pilar');

    const cleanCatatan = validated.catatan_koordinator
      ? validated.catatan_koordinator.trim()
      : null;

    // 6. Ambil data pertanyaan_periode yang ada saat ini
    let existingPP: any = null;
    if (targetPeriodeId) {
      const { data: ppData } = await supabase
        .from('pertanyaan_periode')
        .select('*')
        .eq('id_periode', targetPeriodeId)
        .eq('id_pertanyaan', validated.id_pertanyaan)
        .maybeSingle();

      existingPP = ppData;
    }

    let idPertanyaanPeriode: string | undefined = existingPP?.id;

    // 7. Update atau Insert data pertanyaan_periode
    if (targetPeriodeId) {
      const ppPayload: any = {
        status_kelengkapan: validated.status_kelengkapan,
        nilai_verifikasi: validated.nilai_verifikasi,
        catatan_koordinator: cleanCatatan,
        verified_by: verifierName,
        verified_at: now,
        updated_at: now
      };

      if (existingPP?.id) {
        const { data: updatedPP, error: ppUpdateErr } = await supabase
          .from('pertanyaan_periode')
          .update(ppPayload)
          .eq('id', existingPP.id)
          .select('id')
          .maybeSingle();

        if (ppUpdateErr) {
          console.warn(
            '[VERIFIKASI-ACTIONS] Warning updating pertanyaan_periode:',
            ppUpdateErr.message
          );
        } else if (updatedPP?.id) {
          idPertanyaanPeriode = updatedPP.id;
        }
      } else {
        // Jika belum ada row pertanyaan_periode, buat baru
        const { data: insertedPP, error: ppInsertErr } = await supabase
          .from('pertanyaan_periode')
          .insert({
            id_periode: targetPeriodeId,
            id_pertanyaan: validated.id_pertanyaan,
            nilai_mandiri: 0,
            catatan_operator: null,
            ...ppPayload,
            created_at: now
          })
          .select('id')
          .maybeSingle();

        if (ppInsertErr) {
          console.warn(
            '[VERIFIKASI-ACTIONS] Warning inserting pertanyaan_periode:',
            ppInsertErr.message
          );
        } else if (insertedPP?.id) {
          idPertanyaanPeriode = insertedPP.id;
        }
      }
    }

    // 8. Fallback backward-compatibility: Update tabel legacy buktiDukung
    try {
      const legacyPayload: any = {
        status_kelengkapan: validated.status_kelengkapan,
        catatan_koordinator: cleanCatatan,
        nilai_akhir: validated.nilai_verifikasi,
        updated_at: now
      };

      const { data: existBukti } = await supabase
        .from('buktiDukung')
        .select('id_bukti')
        .eq('id_pertanyaan', validated.id_pertanyaan)
        .maybeSingle();

      if (existBukti?.id_bukti) {
        await supabase
          .from('buktiDukung')
          .update(legacyPayload)
          .eq('id_bukti', existBukti.id_bukti);
      } else {
        await supabase.from('buktiDukung').insert({
          id_pertanyaan: validated.id_pertanyaan,
          ...legacyPayload,
          created_at: now
        });
      }
    } catch (legacyErr: any) {
      console.warn(
        '[VERIFIKASI-ACTIONS] Notice updating legacy buktiDukung fallback:',
        legacyErr?.message
      );
    }

    // 9. Merekam ke tabel audit_log
    const actionType =
      validated.status_kelengkapan === STATUS_KELENGKAPAN.DISETUJUI
        ? 'APPROVE'
        : validated.status_kelengkapan === STATUS_KELENGKAPAN.PERLU_REVISI
          ? 'REVISE'
          : 'UPDATE_VERIFIKASI';

    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: actionType,
        old_state: existingPP
          ? {
              status_kelengkapan: existingPP.status_kelengkapan,
              nilai_verifikasi: existingPP.nilai_verifikasi,
              catatan_koordinator: existingPP.catatan_koordinator,
              verified_by: existingPP.verified_by,
              verified_at: existingPP.verified_at
            }
          : null,
        new_state: {
          status_kelengkapan: validated.status_kelengkapan,
          nilai_verifikasi: validated.nilai_verifikasi,
          catatan_koordinator: cleanCatatan,
          verified_by: verifierName,
          verified_at: now
        },
        user_id: session.userId,
        user_name: verifierName,
        role: session.role || 'koordinator',
        created_at: now
      });
    } catch (auditErr: any) {
      console.warn(
        '[VERIFIKASI-ACTIONS] Notice recording audit log:',
        auditErr?.message
      );
    }

    // 10. Revalidasi cache rute
    revalidatePath('/rebo/formRB');
    if (targetPilarId) {
      revalidatePath(`/rebo/formRB/${targetPilarId}`);
    }
    revalidatePath('/rebo/monitoring');
    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/kanban');

    // Invalidate Redis cache agar monitoring dan overview segera mengambil agregat skor terbaru
    invalidateCacheKey(
      CACHE_KEYS.PILAR_SCORES,
      CACHE_KEYS.MONITORING_GLOBAL
    ).catch(() => {});

    // 11. Ambil data terbaru untuk feedback langsung
    let freshData: any = null;
    if (idPertanyaanPeriode) {
      const { data: fullPP } = await supabase
        .from('pertanyaan_periode')
        .select('*, dokumen_bukti (*)')
        .eq('id', idPertanyaanPeriode)
        .maybeSingle();

      freshData = fullPP;
    }

    let successMessage = 'Hasil verifikasi berhasil disimpan.';
    if (validated.status_kelengkapan === STATUS_KELENGKAPAN.DISETUJUI) {
      successMessage = 'Bukti dukung berhasil disetujui (Approved).';
    } else if (
      validated.status_kelengkapan === STATUS_KELENGKAPAN.PERLU_REVISI
    ) {
      successMessage =
        'Status diubah menjadi Perlu Revisi. Catatan perbaikan telah dicatat.';
    }

    // 12. Notifikasi WhatsApp (Worker-Tracking & PIC Pilar)
    let waDeepLink: string | undefined = undefined;
    try {
      const qDesc = targetPertanyaanDeskripsi;
      const pName = targetPilarNama;
      const pilarNumber = targetPilarId ? parseInt(targetPilarId, 10) : 0;
      const picContact = await getPilarContact(pilarNumber);
      const generalRecipientPhone =
        picContact?.noWa ||
        process.env.WA_DEFAULT_RECEIVER ||
        getDefaultNotificationReceiver();

      // 12.1 Worker-Tracking: Identifikasi pegawai yang mengunggah berkas bukti dukung
      let workerUserId: string | null =
        existingPP?.submitted_by_user_id || null;
      let workerName: string | null = existingPP?.submitted_by_name || null;
      let workerPhone: string | null = existingPP?.submitted_by_phone || null;

      // Cari dari berkas dokumen_bukti terbaru jika pada pertanyaan_periode belum tercatat
      if (!workerPhone && idPertanyaanPeriode) {
        try {
          const { data: latestDoc } = await supabase
            .from('dokumen_bukti')
            .select(
              'submitted_by_user_id, submitted_by_name, submitted_by_phone'
            )
            .eq('id_pertanyaan_periode', idPertanyaanPeriode)
            .not('submitted_by_phone', 'is', null)
            .order('uploaded_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestDoc) {
            workerUserId = latestDoc.submitted_by_user_id || workerUserId;
            workerName = latestDoc.submitted_by_name || workerName;
            workerPhone = latestDoc.submitted_by_phone || workerPhone;
          }
        } catch (docErr: any) {
          console.warn(
            '[VERIFIKASI-ACTIONS] Error checking latestDoc worker:',
            docErr?.message
          );
        }
      }

      // Periksa preferensi notifikasi worker dari tabel users
      let workerNotifEnabled = true;
      if (workerUserId) {
        try {
          const { data: workerUser } = await supabase
            .from('users')
            .select(
              'no_wa, telepon, full_name, notif_wa_approval, notif_wa_revision'
            )
            .eq('id', workerUserId)
            .maybeSingle();

          if (workerUser) {
            if (workerUser.no_wa || workerUser.telepon) {
              workerPhone = workerUser.no_wa || workerUser.telepon;
            }
            if (workerUser.full_name) {
              workerName = workerUser.full_name;
            }
            if (
              validated.status_kelengkapan === STATUS_KELENGKAPAN.PERLU_REVISI
            ) {
              workerNotifEnabled = workerUser.notif_wa_revision !== false;
            } else if (
              validated.status_kelengkapan === STATUS_KELENGKAPAN.DISETUJUI
            ) {
              workerNotifEnabled = workerUser.notif_wa_approval !== false;
            }
          }
        } catch (uErr: any) {
          console.warn(
            '[VERIFIKASI-ACTIONS] Error checking worker notification pref:',
            uErr?.message
          );
        }
      }

      if (
        validated.status_kelengkapan === STATUS_KELENGKAPAN.PERLU_REVISI &&
        cleanCatatan
      ) {
        const msg = formatBuktiRevisionNotification({
          indikatorKode: String(validated.id_pertanyaan),
          namaIndikator: qDesc,
          pilarNama: pName,
          catatanKoordinator: cleanCatatan,
          catatanRevisi: cleanCatatan,
          catatanVerifikasi: cleanCatatan,
          namaKoordinator: verifierName,
          namaVerifikator: verifierName
        });

        // 1. Prioritaskan notifikasi langsung ke pengunggah bukti (Worker-Tracking via Redis Queue)
        let workerNotified = false;
        if (workerPhone && workerNotifEnabled) {
          const formattedWorkerPhone = formatPhoneNumber(workerPhone);
          waDeepLink = createWhatsAppDeepLink(formattedWorkerPhone, msg);

          // Masukkan ke Redis Message Queue secara non-blocking (< 20ms)
          const enqueueWorkerRes = await enqueueWhatsAppNotification({
            type: 'REVISI_BUKTI',
            targetPhone: formattedWorkerPhone,
            message: msg,
            metadata: {
              source: 'verifikasi_revisi_worker',
              worker_user_id: workerUserId,
              worker_name: workerName,
              pilar_id: targetPilarId,
              pilar_nama: pName,
              indikator: validated.id_pertanyaan,
              catatan_revisi: cleanCatatan,
              verifier: verifierName
            }
          });

          workerNotified = true;

          // Catat ke audit_log untuk notifikasi langsung ke worker
          try {
            await supabase.from('audit_log').insert({
              id_pertanyaan_periode: idPertanyaanPeriode || null,
              action: 'NOTIF_WA_REVISION_WORKER',
              old_state: null,
              new_state: {
                recipient: formattedWorkerPhone,
                worker_user_id: workerUserId,
                worker_name: workerName,
                pilar_id: targetPilarId,
                pilar_nama: pName,
                indikator: validated.id_pertanyaan,
                catatan_revisi: cleanCatatan,
                queued: enqueueWorkerRes.success,
                jobId: enqueueWorkerRes.jobId || null,
                error: enqueueWorkerRes.error || null
              },
              user_id: session.userId,
              user_name: verifierName,
              role: session.role || 'koordinator',
              created_at: new Date().toISOString()
            });
          } catch (auditErr: any) {
            console.warn(
              '[VERIFIKASI-ACTIONS] Notice recording audit log for NOTIF_WA_REVISION_WORKER:',
              auditErr?.message
            );
          }
        }

        // 2. Kirim juga ke kontak umum Koordinator Pilar jika nomor berbeda dari worker
        if (
          generalRecipientPhone &&
          (!workerNotified ||
            formatPhoneNumber(generalRecipientPhone) !==
              formatPhoneNumber(workerPhone || ''))
        ) {
          if (!waDeepLink) {
            waDeepLink = createWhatsAppDeepLink(generalRecipientPhone, msg);
          }

          // Masukkan ke Redis Message Queue secara non-blocking (< 20ms)
          const enqueueGenRes = await enqueueWhatsAppNotification({
            type: 'REVISI_BUKTI',
            targetPhone: generalRecipientPhone,
            message: msg,
            metadata: {
              source: 'verifikasi_revisi_koordinator',
              pic_name: picContact?.namaPic || null,
              pilar_id: targetPilarId,
              pilar_nama: pName,
              indikator: validated.id_pertanyaan,
              catatan_revisi: cleanCatatan,
              verifier: verifierName
            }
          });

          // Catat pengiriman ke tabel public.audit_log (action: NOTIF_WA_REVISION)
          try {
            await supabase.from('audit_log').insert({
              id_pertanyaan_periode: idPertanyaanPeriode || null,
              action: 'NOTIF_WA_REVISION',
              old_state: null,
              new_state: {
                recipient: generalRecipientPhone,
                pic_name: picContact?.namaPic || null,
                pilar_id: targetPilarId,
                pilar_nama: pName,
                indikator: validated.id_pertanyaan,
                catatan_revisi: cleanCatatan,
                queued: enqueueGenRes.success,
                jobId: enqueueGenRes.jobId || null,
                error: enqueueGenRes.error || null
              },
              user_id: session.userId,
              user_name: verifierName,
              role: session.role || 'koordinator',
              created_at: new Date().toISOString()
            });
          } catch (auditErr: any) {
            console.warn(
              '[VERIFIKASI-ACTIONS] Notice recording audit log for NOTIF_WA_REVISION:',
              auditErr?.message
            );
          }
        }
      } else if (
        validated.status_kelengkapan === STATUS_KELENGKAPAN.DISETUJUI
      ) {
        const msg = formatBuktiApprovedNotification({
          indikatorKode: String(validated.id_pertanyaan),
          namaIndikator: qDesc,
          pilarNama: pName,
          skor: validated.nilai_verifikasi,
          namaKoordinator: verifierName,
          namaVerifikator: verifierName
        });

        // 1. Prioritaskan notifikasi langsung ke pengunggah bukti (Worker-Tracking via Redis Queue)
        let workerNotified = false;
        if (workerPhone && workerNotifEnabled) {
          const formattedWorkerPhone = formatPhoneNumber(workerPhone);
          waDeepLink = createWhatsAppDeepLink(formattedWorkerPhone, msg);

          // Masukkan ke Redis Message Queue secara non-blocking (< 20ms)
          const enqueueWorkerRes = await enqueueWhatsAppNotification({
            type: 'APPROVAL_BUKTI',
            targetPhone: formattedWorkerPhone,
            message: msg,
            metadata: {
              source: 'verifikasi_approval_worker',
              worker_user_id: workerUserId,
              worker_name: workerName,
              pilar_id: targetPilarId,
              pilar_nama: pName,
              indikator: validated.id_pertanyaan,
              skor: validated.nilai_verifikasi,
              verifier: verifierName
            }
          });

          workerNotified = true;

          // Catat ke audit_log untuk notifikasi langsung ke worker
          try {
            await supabase.from('audit_log').insert({
              id_pertanyaan_periode: idPertanyaanPeriode || null,
              action: 'NOTIF_WA_APPROVED_WORKER',
              old_state: null,
              new_state: {
                recipient: formattedWorkerPhone,
                worker_user_id: workerUserId,
                worker_name: workerName,
                pilar_id: targetPilarId,
                pilar_nama: pName,
                indikator: validated.id_pertanyaan,
                skor: validated.nilai_verifikasi,
                queued: enqueueWorkerRes.success,
                jobId: enqueueWorkerRes.jobId || null,
                error: enqueueWorkerRes.error || null
              },
              user_id: session.userId,
              user_name: verifierName,
              role: session.role || 'koordinator',
              created_at: new Date().toISOString()
            });
          } catch (auditErr: any) {
            console.warn(
              '[VERIFIKASI-ACTIONS] Notice recording audit log for NOTIF_WA_APPROVED_WORKER:',
              auditErr?.message
            );
          }
        }

        // 2. Kirim juga ke kontak umum Koordinator Pilar jika nomor berbeda dari worker
        if (
          generalRecipientPhone &&
          (!workerNotified ||
            formatPhoneNumber(generalRecipientPhone) !==
              formatPhoneNumber(workerPhone || ''))
        ) {
          if (!waDeepLink) {
            waDeepLink = createWhatsAppDeepLink(generalRecipientPhone, msg);
          }

          // Masukkan ke Redis Message Queue secara non-blocking (< 20ms)
          const enqueueGenRes = await enqueueWhatsAppNotification({
            type: 'APPROVAL_BUKTI',
            targetPhone: generalRecipientPhone,
            message: msg,
            metadata: {
              source: 'verifikasi_approval_koordinator',
              pic_name: picContact?.namaPic || null,
              pilar_id: targetPilarId,
              pilar_nama: pName,
              indikator: validated.id_pertanyaan,
              skor: validated.nilai_verifikasi,
              verifier: verifierName
            }
          });

          // Catat pengiriman ke tabel public.audit_log (action: NOTIF_WA_APPROVED)
          try {
            await supabase.from('audit_log').insert({
              id_pertanyaan_periode: idPertanyaanPeriode || null,
              action: 'NOTIF_WA_APPROVED',
              old_state: null,
              new_state: {
                recipient: generalRecipientPhone,
                pic_name: picContact?.namaPic || null,
                pilar_id: targetPilarId,
                pilar_nama: pName,
                indikator: validated.id_pertanyaan,
                skor: validated.nilai_verifikasi,
                queued: enqueueGenRes.success,
                jobId: enqueueGenRes.jobId || null,
                error: enqueueGenRes.error || null
              },
              user_id: session.userId,
              user_name: verifierName,
              role: session.role || 'koordinator',
              created_at: new Date().toISOString()
            });
          } catch (auditErr: any) {
            console.warn(
              '[VERIFIKASI-ACTIONS] Notice recording audit log for NOTIF_WA_APPROVED:',
              auditErr?.message
            );
          }
        }
      }
    } catch (waErr: any) {
      console.warn(
        '[WA-NOTIFICATION] Warning handling verification notification:',
        waErr?.message || waErr
      );
    }

    return {
      success: true,
      message: successMessage,
      data: freshData,
      newStatus: validated.status_kelengkapan as StatusKelengkapan,
      nilaiVerifikasi: validated.nilai_verifikasi,
      catatanKoordinator: cleanCatatan,
      verifiedBy: verifierName,
      verifiedAt: now,
      waDeepLink
    };
  } catch (error: any) {
    console.error(
      '[VERIFIKASI-ACTIONS] submitVerifikasiAction exception:',
      error
    );
    return {
      success: false,
      error:
        error?.message ||
        'Terjadi kesalahan pada server saat memproses verifikasi.'
    };
  }
}
