/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { canVerifyBukti, isAdmin, isTPI } from '@/lib/auth/rbac';
import { getActivePeriode, getAllPeriode } from '@/lib/api/rebo';
import { revalidatePath } from 'next/cache';
import {
  STATUS_KELENGKAPAN,
  getEffectiveZIAPPStatus,
  type PeriodeEvaluasi,
  type StatusKelengkapan,
  type ZIAPPSyncItem,
  type ZIAPPSyncPayload,
  type ZIAPPSyncStatus,
  type ZIAPPSyncSummary
} from '@/types/rebo';

// ==============================================================================
// 1. Helper: Resolve Active Evaluation Period
// ==============================================================================

async function resolveTargetPeriode(
  periodeId?: string
): Promise<PeriodeEvaluasi> {
  const allPeriodes = await getAllPeriode();
  if (periodeId) {
    const found = allPeriodes.find((p) => p.id === periodeId);
    if (found) return found;
  }

  const active = await getActivePeriode();
  return (
    active || {
      id: 'default-periode-2026',
      tahun: 2026,
      nama_periode: 'Evaluasi PMPRB 2026',
      is_active: true,
      is_locked: false
    }
  );
}

// ==============================================================================
// 2. Server Action: Ringkasan Sinkronisasi ZIAPP
// ==============================================================================

export async function getZIAPPSyncSummaryAction(periodeId?: string): Promise<{
  success: boolean;
  data?: ZIAPPSyncSummary;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const currentPeriode = await resolveTargetPeriode(periodeId);

    // Fetch struktur indikator lengkap
    const { data: subpilarData, error: subError } = await supabase
      .from('subpilar')
      .select(
        `
        id_subpilar,
        nama_subpilar,
        id_pilar,
        pilar (id_pilar, nama_pilar),
        pertanyaan (
          id_pertanyaan,
          deskripsi_pertanyaan,
          uraian_buktidukung,
          kategoriPenilaian (id_kategori, uraian_kategori, nilai)
        )
      `
      )
      .order('id_subpilar', { ascending: true });

    if (subError) {
      console.error('[ZIAPP-SYNC] Error fetching subpilar:', subError);
      return {
        success: false,
        error: `Gagal memuat struktur indikator: ${subError.message}`
      };
    }

    // Fetch pertanyaan_periode untuk periode ini
    const { data: ppData, error: ppError } = await supabase
      .from('pertanyaan_periode')
      .select('*, dokumen_bukti (*)')
      .eq('id_periode', currentPeriode.id);

    if (ppError) {
      console.warn(
        '[ZIAPP-SYNC] Notice querying pertanyaan_periode:',
        ppError.message
      );
    }

    const ppMap = new Map<string, any>();
    (ppData || []).forEach((row) => {
      ppMap.set(String(row.id_pertanyaan), row);
    });

    // Fallback data legacy buktiDukung
    const { data: legacyBuktiData } = await supabase
      .from('buktiDukung')
      .select('*');

    const legacyMap = new Map<string, any>();
    (legacyBuktiData || []).forEach((row) => {
      legacyMap.set(String(row.id_pertanyaan), row);
    });

    let totalIndikator = 0;
    let totalDraft = 0;
    let totalVerifiedInternal = 0;
    let totalReadyForZIAPP = 0;
    let totalSyncedToZIAPP = 0;

    const readyItems: ZIAPPSyncItem[] = [];
    const syncedItems: ZIAPPSyncItem[] = [];

    (subpilarData || []).forEach((subpilar: any) => {
      const pilarObj = subpilar.pilar || {};
      const pilarIdStr = String(pilarObj.id_pilar || subpilar.id_pilar || '1');
      const pilarNama = pilarObj.nama_pilar || `Pilar ${pilarIdStr}`;
      const subpilarIdStr = String(subpilar.id_subpilar);
      const subpilarNama =
        subpilar.nama_subpilar || `Subpilar ${subpilarIdStr}`;

      const questions = subpilar.pertanyaan || [];
      questions.forEach((q: any, qIdx: number) => {
        totalIndikator++;
        const qIdStr = String(q.id_pertanyaan);
        const pp = ppMap.get(qIdStr);
        const legacy = legacyMap.get(qIdStr);

        let statusCode: StatusKelengkapan = 0;
        let mandiriVal = 0;
        let verifVal = 0;
        let catatanKoord: string | null = null;
        let verifiedBy: string | null = null;
        let verifiedAt: string | null = null;
        let gdriveUrl: string | null = null;
        let dokumenFiles: any[] = [];
        let explicitZiappStatus: ZIAPPSyncStatus | null = null;
        let ziappSyncedAt: string | null = null;
        let ziappSyncedBy: string | null = null;

        if (pp) {
          statusCode = (pp.status_kelengkapan ?? 0) as StatusKelengkapan;
          mandiriVal = Number(pp.nilai_mandiri ?? 0);
          verifVal = Number(pp.nilai_verifikasi ?? 0);
          catatanKoord = pp.catatan_koordinator || null;
          verifiedBy = pp.verified_by || null;
          verifiedAt = pp.verified_at || null;
          gdriveUrl = pp.gdrive_folder_url || null;
          explicitZiappStatus = pp.ziapp_status || null;
          ziappSyncedAt = pp.ziapp_synced_at || null;
          ziappSyncedBy = pp.ziapp_synced_by || null;

          if (Array.isArray(pp.dokumen_bukti)) {
            dokumenFiles = pp.dokumen_bukti.map((d: any) => ({
              id: d.id,
              nama_dokumen: d.nama_dokumen,
              file_url: d.file_url,
              tipe_dokumen: d.tipe_dokumen || null
            }));
          }
        } else if (legacy) {
          statusCode = (
            typeof legacy.status_kelengkapan === 'number'
              ? legacy.status_kelengkapan
              : 0
          ) as StatusKelengkapan;
          mandiriVal = Number(legacy.nilai_mandiri ?? legacy.nilai_akhir ?? 0);
          verifVal = Number(legacy.nilai_verifikasi ?? 0);
          catatanKoord = legacy.catatan_koordinator || null;
          verifiedBy = legacy.verified_by || null;
          verifiedAt = legacy.verified_at || null;
          gdriveUrl = legacy.gdrive_folder_url || legacy.link_bukti || null;
          explicitZiappStatus = legacy.ziapp_status || null;
          ziappSyncedAt = legacy.ziapp_synced_at || null;
          ziappSyncedBy = legacy.ziapp_synced_by || null;
        }

        const effectiveStatus = getEffectiveZIAPPStatus(
          statusCode,
          explicitZiappStatus
        );

        if (effectiveStatus === 'DRAFT') totalDraft++;
        else if (effectiveStatus === 'VERIFIED_INTERNAL')
          totalVerifiedInternal++;
        else if (effectiveStatus === 'READY_FOR_ZIAPP') totalReadyForZIAPP++;
        else if (effectiveStatus === 'SYNCED_TO_ZIAPP') totalSyncedToZIAPP++;

        const publicLinks: string[] = [];
        if (gdriveUrl) publicLinks.push(gdriveUrl);
        dokumenFiles.forEach((doc) => {
          if (doc.file_url && !publicLinks.includes(doc.file_url)) {
            publicLinks.push(doc.file_url);
          }
        });

        const syncItem: ZIAPPSyncItem = {
          id_pertanyaan: qIdStr,
          kode_indikator: `IND-${pilarIdStr}.${subpilarIdStr}.${qIdx + 1}`,
          pilar_id: pilarIdStr,
          pilar_kode: `Pilar ${pilarIdStr}`,
          pilar_nama: pilarNama,
          subpilar_id: subpilarIdStr,
          subpilar_nama: subpilarNama,
          uraian_pertanyaan:
            q.deskripsi_pertanyaan ||
            q.uraian_pertanyaan ||
            `Indikator ${qIdStr}`,
          uraian_singkat: q.deskripsi_pertanyaan?.slice(0, 100) || '',
          uraian_buktidukung: q.uraian_buktidukung || '',
          nilai_mandiri: mandiriVal,
          nilai_verifikasi: verifVal,
          catatan_koordinator: catatanKoord,
          gdrive_folder_url: gdriveUrl,
          public_drive_links: publicLinks,
          dokumen_files: dokumenFiles,
          ziapp_status: effectiveStatus,
          ziapp_synced_at: ziappSyncedAt,
          ziapp_synced_by: ziappSyncedBy,
          verified_by: verifiedBy,
          verified_at: verifiedAt
        };

        if (effectiveStatus === 'READY_FOR_ZIAPP') {
          readyItems.push(syncItem);
        } else if (effectiveStatus === 'SYNCED_TO_ZIAPP') {
          syncedItems.push(syncItem);
        }
      });
    });

    const persentaseSiapKirim =
      totalIndikator > 0
        ? Number(((totalReadyForZIAPP / totalIndikator) * 100).toFixed(1))
        : 0;

    const persentaseTersinkron =
      totalIndikator > 0
        ? Number(((totalSyncedToZIAPP / totalIndikator) * 100).toFixed(1))
        : 0;

    return {
      success: true,
      data: {
        periodeId: currentPeriode.id,
        periodeNama: currentPeriode.nama_periode,
        tahun: currentPeriode.tahun,
        totalIndikator,
        totalDraft,
        totalVerifiedInternal,
        totalReadyForZIAPP,
        totalSyncedToZIAPP,
        persentaseSiapKirim,
        persentaseTersinkron,
        readyItems,
        syncedItems
      }
    };
  } catch (err: any) {
    console.error('[ZIAPP-SYNC] getZIAPPSyncSummaryAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengambil ringkasan status ZIAPP.'
    };
  }
}

// ==============================================================================
// 3. Server Action: Tandai Indikator Siap Kirim ke ZIAPP
// ==============================================================================

export async function markAsReadyForZIAPPAction(
  idPertanyaan: number | string,
  idPeriode?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}> {
  try {
    const qIdStr = String(idPertanyaan);
    const session = await getCurrentUserSession();

    if (!session.userId) {
      return {
        success: false,
        error: 'Sesi berakhir atau belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const supabase = await createClient();

    // 1. Dapatkan informasi pilar pertanyaan
    const { data: qData } = await supabase
      .from('pertanyaan')
      .select(
        'id_pertanyaan, deskripsi_pertanyaan, id_subpilar, subpilar (id_subpilar, id_pilar, pilar (id_pilar, nama_pilar))'
      )
      .eq('id_pertanyaan', qIdStr)
      .maybeSingle();

    let targetPilarId: string | null = null;
    let targetPilarNama = 'Pilar RB';
    let targetDeskripsi = `Indikator ${qIdStr}`;

    if (qData) {
      if (qData.deskripsi_pertanyaan) {
        targetDeskripsi = qData.deskripsi_pertanyaan;
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

    // 2. Validasi RBAC: Hanya Koordinator Pilar pemilik, TPI, atau Admin
    const hasAccess =
      canVerifyBukti(session.role, session.assignedPilarId, targetPilarId) ||
      isAdmin(session.role) ||
      isTPI(session.role);

    if (!hasAccess) {
      return {
        success: false,
        error:
          'Akses ditolak: Anda tidak memiliki wewenang untuk menandai indikator ini siap kirim ke ZIAPP.'
      };
    }

    // 3. Cari periode evaluasi target
    const currentPeriode = await resolveTargetPeriode(idPeriode);

    // 4. Periksa apakah indikator sudah berstatus 'Disetujui' (Status 2)
    const { data: ppData } = await supabase
      .from('pertanyaan_periode')
      .select('*')
      .eq('id_periode', currentPeriode.id)
      .eq('id_pertanyaan', qIdStr)
      .maybeSingle();

    let isApproved =
      ppData?.status_kelengkapan === STATUS_KELENGKAPAN.DISETUJUI;

    // Fallback cek di tabel legacy jika pertanyaan_periode belum ada
    if (!ppData) {
      const { data: legacyData } = await supabase
        .from('buktiDukung')
        .select('*')
        .eq('id_pertanyaan', qIdStr)
        .maybeSingle();

      if (legacyData?.status_kelengkapan === 2) {
        isApproved = true;
      }
    }

    if (!isApproved) {
      return {
        success: false,
        error:
          'Indikator belum disetujui internal (Status harus "Disetujui" terlebih dahulu sebelum siap dikirim ke ZIAPP).'
      };
    }

    const now = new Date().toISOString();
    const userName =
      session.fullName ||
      session.email ||
      (isAdmin(session.role) ? 'Super Admin' : 'Koordinator Pilar');

    let idPertanyaanPeriode = ppData?.id;

    // 5. Update atau Insert pertanyaan_periode dengan ziapp_status = 'READY_FOR_ZIAPP'
    if (ppData?.id) {
      const { error: ppUpdateErr } = await supabase
        .from('pertanyaan_periode')
        .update({
          ziapp_status: 'READY_FOR_ZIAPP',
          updated_at: now
        })
        .eq('id', ppData.id);

      if (ppUpdateErr) {
        console.warn(
          '[ZIAPP-SYNC] Notice updating ziapp_status in pertanyaan_periode:',
          ppUpdateErr.message
        );
      }
    } else {
      const { data: newPP } = await supabase
        .from('pertanyaan_periode')
        .insert({
          id_periode: currentPeriode.id,
          id_pertanyaan: qIdStr,
          status_kelengkapan: STATUS_KELENGKAPAN.DISETUJUI,
          nilai_mandiri: 0,
          nilai_verifikasi: 0,
          ziapp_status: 'READY_FOR_ZIAPP',
          created_at: now,
          updated_at: now
        })
        .select('id')
        .maybeSingle();

      if (newPP?.id) idPertanyaanPeriode = newPP.id;
    }

    // Graceful fallback ke legacy buktiDukung
    try {
      await supabase
        .from('buktiDukung')
        .update({
          ziapp_status: 'READY_FOR_ZIAPP',
          updated_at: now
        })
        .eq('id_pertanyaan', qIdStr);
    } catch (legErr) {
      console.warn('[ZIAPP-SYNC] Notice legacy buktiDukung:', legErr);
    }

    // 6. Catat riwayat ke audit_log
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: 'MARK_READY_ZIAPP',
        old_state: {
          ziapp_status: ppData?.ziapp_status || 'VERIFIED_INTERNAL'
        },
        new_state: {
          ziapp_status: 'READY_FOR_ZIAPP',
          marked_by: userName,
          marked_at: now,
          pilar_id: targetPilarId,
          pilar_nama: targetPilarNama,
          deskripsi: targetDeskripsi
        },
        user_id: session.userId,
        user_name: userName,
        role: session.role
      });
    } catch (auditErr) {
      console.warn('[ZIAPP-SYNC] Notice recording audit log:', auditErr);
    }

    // 7. Revalidasi path
    if (targetPilarId) {
      revalidatePath(`/rebo/formRB/${targetPilarId}`);
    }
    revalidatePath('/rebo/monitoring');
    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      message: `Indikator ${qIdStr} berhasil ditandai "Siap Kirim ke ZIAPP".`,
      data: {
        id_pertanyaan: qIdStr,
        ziapp_status: 'READY_FOR_ZIAPP'
      }
    };
  } catch (err: any) {
    console.error('[ZIAPP-SYNC] markAsReadyForZIAPPAction error:', err);
    return {
      success: false,
      error:
        err?.message || 'Terjadi kesalahan sistem saat menandai siap ZIAPP.'
    };
  }
}

// ==============================================================================
// 4. Server Action: Tandai Indikator Telah Tersinkron ke ZIAPP
// ==============================================================================

export async function markAsSyncedToZIAPPAction(
  idPertanyaan: number | string,
  idPeriode?: string,
  notes?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}> {
  try {
    const qIdStr = String(idPertanyaan);
    const session = await getCurrentUserSession();

    if (!session.userId) {
      return {
        success: false,
        error: 'Sesi berakhir atau belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const supabase = await createClient();
    const currentPeriode = await resolveTargetPeriode(idPeriode);
    const now = new Date().toISOString();
    const operatorName =
      session.fullName || session.email || 'Operator / Ekstensi ZIAPP';

    // Ambil pertanyaan_periode
    const { data: ppData } = await supabase
      .from('pertanyaan_periode')
      .select('*')
      .eq('id_periode', currentPeriode.id)
      .eq('id_pertanyaan', qIdStr)
      .maybeSingle();

    let idPertanyaanPeriode = ppData?.id;

    if (ppData?.id) {
      await supabase
        .from('pertanyaan_periode')
        .update({
          ziapp_status: 'SYNCED_TO_ZIAPP',
          ziapp_synced_at: now,
          ziapp_synced_by: operatorName,
          updated_at: now
        })
        .eq('id', ppData.id);
    } else {
      const { data: newPP } = await supabase
        .from('pertanyaan_periode')
        .insert({
          id_periode: currentPeriode.id,
          id_pertanyaan: qIdStr,
          status_kelengkapan: STATUS_KELENGKAPAN.DISETUJUI,
          nilai_mandiri: 0,
          nilai_verifikasi: 0,
          ziapp_status: 'SYNCED_TO_ZIAPP',
          ziapp_synced_at: now,
          ziapp_synced_by: operatorName,
          created_at: now,
          updated_at: now
        })
        .select('id')
        .maybeSingle();

      if (newPP?.id) idPertanyaanPeriode = newPP.id;
    }

    // Fallback legacy
    try {
      await supabase
        .from('buktiDukung')
        .update({
          ziapp_status: 'SYNCED_TO_ZIAPP',
          ziapp_synced_at: now,
          ziapp_synced_by: operatorName,
          updated_at: now
        })
        .eq('id_pertanyaan', qIdStr);
    } catch (legErr) {
      console.warn('[ZIAPP-SYNC] Notice legacy buktiDukung:', legErr);
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: 'SYNCED_TO_ZIAPP',
        old_state: {
          ziapp_status: ppData?.ziapp_status || 'READY_FOR_ZIAPP'
        },
        new_state: {
          ziapp_status: 'SYNCED_TO_ZIAPP',
          ziapp_synced_at: now,
          ziapp_synced_by: operatorName,
          notes: notes || 'Berhasil disinkronkan ke Web Pusat ZIAPP'
        },
        user_id: session.userId,
        user_name: operatorName,
        role: session.role
      });
    } catch (auditErr) {
      console.warn('[ZIAPP-SYNC] Notice recording audit log:', auditErr);
    }

    // Revalidasi
    revalidatePath('/rebo/monitoring');
    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      message: `Indikator ${qIdStr} berhasil ditandai "Tersinkron ke ZIAPP".`,
      data: {
        id_pertanyaan: qIdStr,
        ziapp_status: 'SYNCED_TO_ZIAPP',
        ziapp_synced_at: now,
        ziapp_synced_by: operatorName
      }
    };
  } catch (err: any) {
    console.error('[ZIAPP-SYNC] markAsSyncedToZIAPPAction error:', err);
    return {
      success: false,
      error:
        err?.message ||
        'Terjadi kesalahan sistem saat memperbarui status sinkronisasi.'
    };
  }
}

// ==============================================================================
// 5. Server Action: Generate JSON Payload Standard Siap Impor/Sync ZIAPP
// ==============================================================================

export async function generateZIAPPSyncPayloadAction(
  periodeId?: string
): Promise<{
  success: boolean;
  payload?: ZIAPPSyncPayload;
  error?: string;
}> {
  try {
    const summaryRes = await getZIAPPSyncSummaryAction(periodeId);
    if (!summaryRes.success || !summaryRes.data) {
      return {
        success: false,
        error: summaryRes.error || 'Gagal memuat ringkasan data ZIAPP.'
      };
    }

    const summary = summaryRes.data;
    // Seluruh item yang siap kirim atau sudah tersinkron
    const syncableItems = [...summary.readyItems, ...summary.syncedItems];

    const payload: ZIAPPSyncPayload = {
      metadata: {
        source: 'REBO-BPS-SITARO-V2',
        satker: 'BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
        kode_satker: '7108',
        generated_at: new Date().toISOString(),
        periode: {
          id: summary.periodeId,
          tahun: summary.tahun,
          nama_periode: summary.periodeNama
        },
        total_items: syncableItems.length,
        total_ready: summary.totalReadyForZIAPP,
        total_synced: summary.totalSyncedToZIAPP,
        version: '2.0.0'
      },
      items: syncableItems
    };

    return {
      success: true,
      payload
    };
  } catch (err: any) {
    console.error('[ZIAPP-SYNC] generateZIAPPSyncPayloadAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menghasilkan payload sinkronisasi ZIAPP.'
    };
  }
}
