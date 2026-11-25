/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { canEditBukti } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  STATUS_KELENGKAPAN,
  type DokumenBukti,
  type PertanyaanPeriode,
  type StatusKelengkapan
} from '@/types/rebo';
import {
  sendWhatsAppMessage,
  formatBuktiSubmittedNotification
} from '@/lib/notifications/whatsapp';
import { getVerifikatorContacts } from '@/lib/notifications/contacts';

// ==============================================================================
// 1. Zod Validation Schemas
// ==============================================================================

const dokumenItemSchema = z.object({
  id: z.string().optional(),
  nama_dokumen: z.string().trim().min(1, 'Nama berkas dokumen wajib diisi.'),
  file_url: z
    .string()
    .trim()
    .url(
      'URL berkas bukti harus berupa tautan yang valid (contoh: https://drive.google.com/...)'
    ),
  tipe_dokumen: z.string().optional().nullable()
});

const submitBuktiSchema = z.object({
  id_pertanyaan: z.string().min(1, 'ID Pertanyaan wajib diisi.'),
  id_periode: z.string().optional(),
  id_kategori: z.string().optional().nullable(),
  catatan_operator: z.string().optional().nullable(),
  dokumen_list: z.array(dokumenItemSchema).default([]),
  submit_for_review: z.boolean().default(false)
});

export type DokumenItemInput = z.infer<typeof dokumenItemSchema>;
export type SubmitBuktiInput = z.infer<typeof submitBuktiSchema>;

export interface SubmitBuktiResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: PertanyaanPeriode | null;
  newStatus?: StatusKelengkapan;
}

// ==============================================================================
// 2. Server Action: Submit Bukti & Penilaian Mandiri
// ==============================================================================

/**
 * Menyimpan pengajuan bukti dukung LKE:
 * - Menyimpan opsi kategori penilaian mandiri dan menghitung skor mandiri realtime.
 * - Mengelola multi-dokumen berkas bukti (insert/update).
 * - Mengubah status menjadi 1 (Menunggu Review) jika submit_for_review = true.
 * - Melindungi catatan koordinator & status persetujuan dari manipulasi operator.
 * - Melakukan sinkronisasi fallback ke tabel legacy buktiDukung.
 * - Mencatat riwayat ke audit_log.
 */
export async function submitBuktiAction(
  input: SubmitBuktiInput
): Promise<SubmitBuktiResult> {
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
    const parseResult = submitBuktiSchema.safeParse(input);
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

    // 3. Dapatkan pilar pemilik pertanyaan untuk memvalidasi izin edit RBAC
    const { data: qData, error: qError } = await supabase
      .from('pertanyaan')
      .select(
        'id_pertanyaan, deskripsi_pertanyaan, id_subpilar, subpilar (id_subpilar, id_pilar, pilar (id_pilar, nama_pilar))'
      )
      .eq('id_pertanyaan', validated.id_pertanyaan)
      .maybeSingle();

    if (qError) {
      console.warn(
        '[BUKTI-ACTIONS] Error fetching pertanyaan relation:',
        qError.message
      );
    }

    const targetPilarId = (qData as any)?.subpilar?.id_pilar
      ? String((qData as any).subpilar.id_pilar)
      : null;

    // 4. Verifikasi izin edit pengguna
    const hasEditPermission = canEditBukti(
      session.role,
      session.assignedPilarId,
      targetPilarId
    );

    if (!hasEditPermission) {
      return {
        success: false,
        error: `Akses ditolak: Anda tidak memiliki wewenang untuk mengubah bukti pada Pilar ${targetPilarId || 'ini'}.`
      };
    }

    // 5. Tentukan periode evaluasi target
    let targetPeriodeId = validated.id_periode;
    if (!targetPeriodeId || targetPeriodeId === 'default-periode-2025') {
      const { data: activePeriode } = await supabase
        .from('periode_evaluasi')
        .select('id, tahun, is_locked, is_active')
        .eq('is_active', true)
        .order('tahun', { ascending: false })
        .limit(1)
        .maybeSingle();

      targetPeriodeId = activePeriode?.id;

      if (activePeriode?.is_locked) {
        return {
          success: false,
          error: `Periode evaluasi ${activePeriode.tahun} telah dikunci (Read-Only). Perubahan tidak diperbolehkan.`
        };
      }
    } else {
      // Cek apakah periode yang dipilih dikunci
      const { data: pCheck } = await supabase
        .from('periode_evaluasi')
        .select('id, tahun, is_locked')
        .eq('id', targetPeriodeId)
        .maybeSingle();

      if (pCheck?.is_locked) {
        return {
          success: false,
          error: `Periode evaluasi ${pCheck.tahun} telah dikunci (Read-Only). Perubahan tidak diperbolehkan.`
        };
      }
    }

    // 6. Hitung nilai mandiri berdasarkan kategori penilaian terpilih
    let nilaiMandiri = 0;
    if (validated.id_kategori) {
      const { data: katData } = await supabase
        .from('kategoriPenilaian')
        .select('nilai')
        .eq('id_kategori', validated.id_kategori)
        .maybeSingle();

      if (katData && typeof katData.nilai === 'number') {
        nilaiMandiri = katData.nilai;
      }
    }

    // 7. Ambil data pertanyaan_periode yang ada saat ini
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

    // 8. Tentukan status kelengkapan baru
    // Operator hanya dapat mengajukan verifikasi (status 1) atau menyimpan draf
    // Status 2 (Disetujui) dan status 3 (Perlu Revisi) adalah wewenang koordinator/TPI
    let newStatus: StatusKelengkapan;
    if (validated.submit_for_review) {
      newStatus = STATUS_KELENGKAPAN.MENUNGGU_REVIEW; // 1
    } else {
      // Jika simpan draf, pertahankan status sebelumnya jika ada, default ke 0 (Belum Diisi)
      newStatus =
        (existingPP?.status_kelengkapan as StatusKelengkapan) ??
        STATUS_KELENGKAPAN.BELUM_DIISI;
    }

    let idPertanyaanPeriode: string | undefined = existingPP?.id;

    // 8.1 Dapatkan data profil operator pengunggah untuk Worker-Tracking
    let operatorName =
      session.fullName || session.email || session.userId || 'Operator Tim';
    let operatorPhone: string | null = null;

    if (session.userId) {
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('full_name, no_wa, telepon')
          .eq('id', session.userId)
          .maybeSingle();

        if (userProfile) {
          if (userProfile.full_name) {
            operatorName = userProfile.full_name;
          }
          operatorPhone = userProfile.no_wa || userProfile.telepon || null;
        }
      } catch (userErr: any) {
        console.warn(
          '[BUKTI-ACTIONS] Notice fetching user profile for worker-tracking:',
          userErr?.message
        );
      }
    }

    // 9. Simpan / Perbarui tabel pertanyaan_periode
    if (targetPeriodeId) {
      const now = new Date().toISOString();
      const ppPayload: any = {
        id_periode: targetPeriodeId,
        id_pertanyaan: validated.id_pertanyaan,
        id_kategori: validated.id_kategori || null,
        nilai_mandiri: nilaiMandiri,
        catatan_operator: validated.catatan_operator || null,
        status_kelengkapan: newStatus,
        submitted_by_user_id: session.userId,
        submitted_by_name: operatorName,
        submitted_by_phone: operatorPhone,
        updated_at: now
      };

      if (existingPP?.id) {
        // Catatan koordinator dan nilai_verifikasi sengaja TIDAK dimasukkan agar tidak tertimpa
        const { data: updatedPP, error: ppUpdateErr } = await supabase
          .from('pertanyaan_periode')
          .update(ppPayload)
          .eq('id', existingPP.id)
          .select('id')
          .maybeSingle();

        if (ppUpdateErr) {
          console.warn(
            '[BUKTI-ACTIONS] Warning updating pertanyaan_periode:',
            ppUpdateErr.message
          );
        } else if (updatedPP?.id) {
          idPertanyaanPeriode = updatedPP.id;
        }
      } else {
        ppPayload.nilai_verifikasi = 0;
        const { data: insertedPP, error: ppInsertErr } = await supabase
          .from('pertanyaan_periode')
          .insert(ppPayload)
          .select('id')
          .maybeSingle();

        if (ppInsertErr) {
          console.warn(
            '[BUKTI-ACTIONS] Warning inserting pertanyaan_periode:',
            ppInsertErr.message
          );
        } else if (insertedPP?.id) {
          idPertanyaanPeriode = insertedPP.id;
        }
      }
    }

    // 10. Kelola Dokumen Bukti (Multi-Evidence) dengan Worker-Tracking
    if (
      idPertanyaanPeriode &&
      validated.dokumen_list &&
      validated.dokumen_list.length > 0
    ) {
      for (const item of validated.dokumen_list) {
        if (
          item.id &&
          !item.id.startsWith('temp-') &&
          !item.id.startsWith('legacy-')
        ) {
          // Update dokumen yang sudah tersimpan
          await supabase
            .from('dokumen_bukti')
            .update({
              nama_dokumen: item.nama_dokumen,
              file_url: item.file_url,
              tipe_dokumen: item.tipe_dokumen || null,
              submitted_by_user_id: session.userId,
              submitted_by_name: operatorName,
              submitted_by_phone: operatorPhone
            })
            .eq('id', item.id);
        } else {
          // Insert dokumen baru
          await supabase.from('dokumen_bukti').insert({
            id_pertanyaan_periode: idPertanyaanPeriode,
            nama_dokumen: item.nama_dokumen,
            file_url: item.file_url,
            tipe_dokumen: item.tipe_dokumen || null,
            uploaded_by: operatorName,
            submitted_by_user_id: session.userId,
            submitted_by_name: operatorName,
            submitted_by_phone: operatorPhone,
            uploaded_at: new Date().toISOString()
          });
        }
      }
    }

    // 11. Sinkronisasi Fallback Kompatibilitas ke tabel legacy buktiDukung
    try {
      const firstDocUrl = validated.dokumen_list[0]?.file_url || null;
      const legacyPayload = {
        id_pertanyaan: validated.id_pertanyaan,
        id_kategori: validated.id_kategori || null,
        link_bukti: firstDocUrl || existingPP?.gdrive_folder_url || null,
        nilai_akhir: nilaiMandiri,
        catatan_user: validated.catatan_operator || null,
        status_kelengkapan: newStatus,
        submitted_by_user_id: session.userId,
        submitted_by_name: operatorName,
        submitted_by_phone: operatorPhone,
        status:
          newStatus === 1
            ? 'Menunggu Review'
            : newStatus === 2
              ? 'Disetujui'
              : newStatus === 3
                ? 'Perlu Revisi'
                : 'Belum Diisi',
        updated_at: new Date().toISOString()
      };

      const { data: legacyRow } = await supabase
        .from('buktiDukung')
        .select('id_bukti')
        .eq('id_pertanyaan', validated.id_pertanyaan)
        .maybeSingle();

      if (legacyRow?.id_bukti) {
        await supabase
          .from('buktiDukung')
          .update(legacyPayload)
          .eq('id_pertanyaan', validated.id_pertanyaan);
      } else {
        await supabase.from('buktiDukung').insert(legacyPayload);
      }
    } catch (legacyErr: any) {
      console.warn(
        '[BUKTI-ACTIONS] Notice updating legacy buktiDukung fallback:',
        legacyErr?.message
      );
    }

    // 12. Catat ke audit_log
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: validated.submit_for_review
          ? 'SUBMIT_FOR_REVIEW'
          : 'SUBMIT_EVIDENCE',
        old_state: existingPP
          ? {
              status_kelengkapan: existingPP.status_kelengkapan,
              id_kategori: existingPP.id_kategori,
              nilai_mandiri: existingPP.nilai_mandiri,
              catatan_operator: existingPP.catatan_operator
            }
          : null,
        new_state: {
          status_kelengkapan: newStatus,
          id_kategori: validated.id_kategori,
          nilai_mandiri: nilaiMandiri,
          catatan_operator: validated.catatan_operator,
          dokumen_count: validated.dokumen_list.length,
          submit_for_review: validated.submit_for_review
        },
        user_id: session.userId,
        user_name: session.fullName || session.email || 'Operator Tim',
        role: session.role || 'operator',
        created_at: new Date().toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[BUKTI-ACTIONS] Notice recording audit log:',
        auditErr?.message
      );
    }

    // 13. Revalidasi cache halaman
    revalidatePath('/rebo/formRB');
    if (targetPilarId) {
      revalidatePath(`/rebo/formRB/${targetPilarId}`);
    }
    revalidatePath('/rebo/monitoring');

    // 14. Ambil snapshot data terbaru untuk respon langsung ke UI
    let freshData: any = null;
    if (idPertanyaanPeriode) {
      const { data: fullPP } = await supabase
        .from('pertanyaan_periode')
        .select('*, dokumen_bukti (*)')
        .eq('id', idPertanyaanPeriode)
        .maybeSingle();

      freshData = fullPP;
    }

    const successMessage = validated.submit_for_review
      ? 'Bukti dukung dan penilaian mandiri berhasil disimpan serta diajukan untuk review koordinator.'
      : 'Draf bukti dukung dan penilaian mandiri berhasil disimpan.';

    // 15. Notifikasi WhatsApp otomatis ke Tim Verifikator jika diajukan untuk review
    if (validated.submit_for_review) {
      try {
        const qDesc =
          (qData as any)?.deskripsi_pertanyaan ||
          `Indikator ${validated.id_pertanyaan}`;
        const pName =
          (qData as any)?.subpilar?.pilar?.nama_pilar ||
          (targetPilarId ? `Pilar ${targetPilarId}` : 'Pilar ZI/RB');
        const operatorName =
          session.fullName || session.email || 'Operator Tim Kerja';

        const msg = formatBuktiSubmittedNotification({
          indikatorKode: String(validated.id_pertanyaan),
          namaIndikator: qDesc,
          pilarNama: pName,
          namaOperator: operatorName,
          totalDokumen: validated.dokumen_list.length
        });

        // Ambil kontak tim verifikator aktif
        const verifikatorContacts = await getVerifikatorContacts();

        if (verifikatorContacts && verifikatorContacts.length > 0) {
          const sendResults = await Promise.allSettled(
            verifikatorContacts.map((phone) =>
              sendWhatsAppMessage({
                phone,
                message: msg
              })
            )
          );

          const delivered = sendResults.map((r, idx) => ({
            phone: verifikatorContacts[idx],
            status:
              r.status === 'fulfilled'
                ? r.value.success
                  ? 'SENT'
                  : 'FAILED'
                : 'ERROR',
            error:
              r.status === 'fulfilled'
                ? r.value.error || null
                : String((r as any).reason)
          }));

          // Catat pengiriman ke tabel public.audit_log (action: NOTIF_WA_SUBMIT)
          try {
            await supabase.from('audit_log').insert({
              id_pertanyaan_periode: idPertanyaanPeriode || null,
              action: 'NOTIF_WA_SUBMIT',
              old_state: null,
              new_state: {
                recipients: verifikatorContacts,
                total_recipients: verifikatorContacts.length,
                indikator: validated.id_pertanyaan,
                pilar: pName,
                total_dokumen: validated.dokumen_list.length,
                results: delivered
              },
              user_id: session.userId,
              user_name: operatorName,
              role: session.role || 'operator',
              created_at: new Date().toISOString()
            });
          } catch (auditErr: any) {
            console.warn(
              '[BUKTI-ACTIONS] Notice recording audit log for NOTIF_WA_SUBMIT:',
              auditErr?.message
            );
          }
        }
      } catch (waErr: any) {
        console.warn(
          '[WA-NOTIFICATION] Warning creating submission notification:',
          waErr?.message || waErr
        );
      }
    }

    return {
      success: true,
      message: successMessage,
      data: freshData,
      newStatus
    };
  } catch (error: any) {
    console.error('[BUKTI-ACTIONS] submitBuktiAction exception:', error);
    return {
      success: false,
      error:
        error?.message ||
        'Terjadi kesalahan pada server saat memproses bukti dukung.'
    };
  }
}

/** Alias untuk submitBuktiAction agar kompatibel dengan penamaan saveBuktiAction */
export async function saveBuktiAction(
  input: SubmitBuktiInput
): Promise<SubmitBuktiResult> {
  return submitBuktiAction(input);
}

// ==============================================================================
// 3. Server Action: Hapus Dokumen Bukti Spesifik
// ==============================================================================

/**
 * Menghapus satu berkas dokumen bukti tertentu dari tabel `dokumen_bukti`.
 * Melakukan verifikasi hak akses RBAC sebelum melakukan penghapusan.
 */
export async function deleteDokumenBukti(dokumenId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!dokumenId) {
      return { success: false, error: 'ID Dokumen tidak valid.' };
    }

    const session = await getCurrentUserSession();
    if (!session.userId) {
      return { success: false, error: 'Silakan masuk terlebih dahulu.' };
    }

    const supabase = await createClient();

    // 1. Ambil info dokumen beserta pertanyaan & pilar untuk pengecekan hak akses
    const { data: docData, error: docError } = await supabase
      .from('dokumen_bukti')
      .select(
        `
        id,
        nama_dokumen,
        file_url,
        id_pertanyaan_periode,
        pertanyaan_periode (
          id,
          id_pertanyaan,
          pertanyaan (
            id_pertanyaan,
            id_subpilar,
            subpilar (id_subpilar, id_pilar)
          )
        )
      `
      )
      .eq('id', dokumenId)
      .maybeSingle();

    if (docError || !docData) {
      return {
        success: false,
        error: 'Berkas dokumen bukti tidak ditemukan di database.'
      };
    }

    const targetPilarId = (docData as any)?.pertanyaan_periode?.pertanyaan
      ?.subpilar?.id_pilar
      ? String((docData as any).pertanyaan_periode.pertanyaan.subpilar.id_pilar)
      : null;

    // 2. Periksa RBAC
    const hasPermission = canEditBukti(
      session.role,
      session.assignedPilarId,
      targetPilarId
    );

    if (!hasPermission) {
      return {
        success: false,
        error: `Akses ditolak: Anda tidak memiliki wewenang untuk menghapus berkas pada Pilar ${targetPilarId || 'ini'}.`
      };
    }

    // 3. Hapus data dokumen bukti
    const { error: deleteError } = await supabase
      .from('dokumen_bukti')
      .delete()
      .eq('id', dokumenId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // 4. Catat riwayat audit
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: docData.id_pertanyaan_periode,
        action: 'DELETE_EVIDENCE',
        old_state: {
          dokumen_id: docData.id,
          nama_dokumen: docData.nama_dokumen,
          file_url: docData.file_url
        },
        new_state: null,
        user_id: session.userId,
        user_name: session.fullName || session.email || 'Operator',
        role: session.role || 'operator',
        created_at: new Date().toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[BUKTI-ACTIONS] Notice recording audit log for delete:',
        auditErr?.message
      );
    }

    // 5. Revalidasi cache
    revalidatePath('/rebo/formRB');
    if (targetPilarId) {
      revalidatePath(`/rebo/formRB/${targetPilarId}`);
    }

    return {
      success: true,
      message: `Berkas "${docData.nama_dokumen}" berhasil dihapus.`
    };
  } catch (err: any) {
    console.error('[BUKTI-ACTIONS] deleteDokumenBukti exception:', err);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menghapus berkas.'
    };
  }
}

// ==============================================================================
// 4. Server Action: Fetch Dokumen Bukti List untuk Indikator
// ==============================================================================

/**
 * Mengambil daftar seluruh dokumen bukti untuk satu pertanyaan_periode.
 */
export async function getDokumenBuktiList(
  idPertanyaanPeriode: string
): Promise<DokumenBukti[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('dokumen_bukti')
      .select('*')
      .eq('id_pertanyaan_periode', idPertanyaanPeriode)
      .order('uploaded_at', { ascending: true });

    if (error) {
      console.warn('[BUKTI-ACTIONS] getDokumenBuktiList error:', error.message);
      return [];
    }

    return (data as DokumenBukti[]) || [];
  } catch (err: any) {
    console.warn(
      '[BUKTI-ACTIONS] getDokumenBuktiList exception:',
      err?.message
    );
    return [];
  }
}
