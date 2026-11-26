/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getActivePeriode, getAllPeriode } from '@/lib/api/rebo';
import { getCurrentUserSession } from '@/lib/auth/session';
import type {
  KanbanBoardData,
  KanbanIndicatorCard,
  PeriodeEvaluasi,
  StatusKelengkapan
} from '@/types/rebo';

/**
 * Server action untuk mengambil data Kanban Tindak Lanjut RB:
 * - Mengambil seluruh indikator LKE aktif pada periode terpilih
 * - Mengelompokkan indikator ke dalam 3 kolom:
 *   1. Perlu Revisi (To Do): status_kelengkapan === 3
 *   2. Menunggu Review (In Review): status_kelengkapan === 1
 *   3. Disetujui (Done): status_kelengkapan === 2
 * - Mendukung filter pilar (Semua Pilar atau Pilar 1 s.d. 6) dan pencarian teks
 */
export async function getKanbanBoardData(params?: {
  periodeId?: string;
  pilarId?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data: KanbanBoardData;
  periodes: PeriodeEvaluasi[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Tentukan periode evaluasi
    const allPeriodes = await getAllPeriode();
    let currentPeriode: PeriodeEvaluasi | null = null;

    if (params?.periodeId) {
      currentPeriode =
        allPeriodes.find((p) => p.id === params.periodeId) || null;
    }

    if (!currentPeriode) {
      currentPeriode = (await getActivePeriode()) || {
        id: 'default-periode-2026',
        tahun: 2026,
        nama_periode: 'Evaluasi PMPRB 2026',
        is_active: true,
        is_locked: false
      };
    }

    // 2. Fetch seluruh pertanyaan terstruktur via subpilar & pilar
    let subpilarQuery = supabase.from('subpilar').select(`
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
      `);

    if (params?.pilarId && params.pilarId !== 'ALL') {
      subpilarQuery = subpilarQuery.eq('id_pilar', params.pilarId);
    }

    const { data: subpilarData, error: subError } = await subpilarQuery.order(
      'id_subpilar',
      { ascending: true }
    );

    if (subError) {
      console.error('[KANBAN-ACTIONS] Error fetching subpilar:', subError);
      throw new Error(`Gagal memuat struktur indikator: ${subError.message}`);
    }

    // 3. Fetch data pertanyaan_periode untuk periode ini (V2)
    const { data: ppData, error: ppError } = await supabase
      .from('pertanyaan_periode')
      .select('*, dokumen_bukti (*)')
      .eq('id_periode', currentPeriode.id);

    if (ppError) {
      console.warn(
        '[KANBAN-ACTIONS] Notice querying pertanyaan_periode:',
        ppError.message
      );
    }

    const ppMap = new Map<string, any>();
    (ppData || []).forEach((row) => {
      ppMap.set(String(row.id_pertanyaan), row);
    });

    // 4. Fetch fallback data dari buktiDukung (V1)
    const { data: legacyBuktiData } = await supabase
      .from('buktiDukung')
      .select('*');

    const legacyMap = new Map<string, any>();
    (legacyBuktiData || []).forEach((row) => {
      legacyMap.set(String(row.id_pertanyaan), row);
    });

    // 5. Susun daftar kartu indikator
    const perluRevisiList: KanbanIndicatorCard[] = [];
    const menungguReviewList: KanbanIndicatorCard[] = [];
    const disetujuiList: KanbanIndicatorCard[] = [];

    const searchQuery = params?.search?.trim().toLowerCase() || '';

    (subpilarData || []).forEach((subpilar: any) => {
      const pilarObj = subpilar.pilar || {};
      const pilarIdStr = String(pilarObj.id_pilar || subpilar.id_pilar || '1');
      const pilarNama = pilarObj.nama_pilar || `Pilar ${pilarIdStr}`;
      const pilarKode = pilarObj.kode_pilar || `Pilar ${pilarIdStr}`;
      const subpilarIdStr = String(subpilar.id_subpilar);
      const subpilarNama =
        subpilar.nama_subpilar || `Subpilar ${subpilarIdStr}`;

      const questions = subpilar.pertanyaan || [];
      questions.forEach((q: any, qIdx: number) => {
        const qIdStr = String(q.id_pertanyaan);
        const pp = ppMap.get(qIdStr);
        const legacy = legacyMap.get(qIdStr);

        let status: StatusKelengkapan = 0;
        let mandiriVal = 0;
        let verifVal = 0;
        let catatanKoord: string | null = null;
        let catatanOper: string | null = null;
        let verifiedBy: string | null = null;
        let verifiedAt: string | null = null;
        let submittedByUserId: string | null = null;
        let submittedByName: string | null = null;
        let gdriveUrl: string | null = null;
        let dokumenFiles: any[] = [];

        if (pp) {
          const rawStatus = Number(pp.status_kelengkapan);
          status = (
            [0, 1, 2, 3].includes(rawStatus) ? rawStatus : 0
          ) as StatusKelengkapan;
          mandiriVal = Number(pp.nilai_mandiri) || 0;
          verifVal = Number(pp.nilai_verifikasi) || 0;
          catatanKoord = pp.catatan_koordinator || null;
          catatanOper = pp.catatan_operator || null;
          verifiedBy = pp.verified_by || null;
          verifiedAt = pp.verified_at || null;
          submittedByUserId = pp.submitted_by_user_id || null;
          submittedByName = pp.submitted_by_name || null;
          gdriveUrl = pp.gdrive_folder_url || null;
          dokumenFiles = (pp.dokumen_bukti || []).map((doc: any) => ({
            id: doc.id,
            nama_dokumen: doc.nama_dokumen || 'Dokumen Bukti',
            file_url: doc.file_url || '#',
            tipe_dokumen: doc.tipe_dokumen || null
          }));
        } else if (legacy) {
          const rawLegacyStatus = Number(legacy.status_kelengkapan);
          status = (
            [0, 1, 2, 3].includes(rawLegacyStatus) ? rawLegacyStatus : 0
          ) as StatusKelengkapan;
          mandiriVal = Number(legacy.nilai_mandiri) || 0;
          verifVal =
            Number(legacy.nilai_verifikasi) || Number(legacy.nilai_akhir) || 0;
          catatanKoord = legacy.catatan_koordinator || null;
          catatanOper = legacy.catatan_operator || legacy.catatan_user || null;
          submittedByUserId = legacy.submitted_by_user_id || null;
          submittedByName = legacy.submitted_by_name || null;
          gdriveUrl = legacy.gdrive_folder_url || legacy.link_bukti || null;
          if (legacy.link_bukti) {
            dokumenFiles = [
              {
                id: legacy.id_bukti || 'legacy-1',
                nama_dokumen: 'Bukti Dukung Utama',
                file_url: legacy.link_bukti,
                tipe_dokumen: 'Link Google Drive'
              }
            ];
          }
        }

        // Hitung nilai maksimal
        const kategoriList = q.kategoriPenilaian || [];
        let maxNilai = 0;
        if (kategoriList.length > 0) {
          maxNilai = Math.max(
            ...kategoriList.map((k: any) => Number(k.nilai) || 0)
          );
        }

        const kodeIndikator = `IND-${pilarIdStr}.${subpilarIdStr}.${qIdx + 1}`;
        const uraianSingkat =
          q.uraian_singkat || q.deskripsi_pertanyaan || `Indikator ${qIdStr}`;
        const uraianPertanyaan =
          q.uraian_pertanyaan || q.deskripsi_pertanyaan || uraianSingkat;

        const card: KanbanIndicatorCard = {
          id_pertanyaan: qIdStr,
          id_pertanyaan_periode: pp?.id,
          kode_indikator: kodeIndikator,
          uraian_pertanyaan: uraianPertanyaan,
          uraian_singkat: uraianSingkat,
          pilar_id: pilarIdStr,
          pilar_nama: pilarNama,
          pilar_kode: pilarKode,
          subpilar_id: subpilarIdStr,
          subpilar_nama: subpilarNama,
          status_kelengkapan: status,
          catatan_koordinator: catatanKoord,
          catatan_operator: catatanOper,
          verified_by: verifiedBy,
          verified_at: verifiedAt,
          submitted_by_user_id: submittedByUserId,
          submitted_by_name: submittedByName,
          nilai_mandiri: Number(mandiriVal.toFixed(2)),
          nilai_verifikasi: Number(verifVal.toFixed(2)),
          nilai_maksimal: Number(maxNilai.toFixed(2)),
          gdrive_folder_url: gdriveUrl,
          total_dokumen: dokumenFiles.length,
          dokumen_files: dokumenFiles,
          ziapp_status:
            pp?.ziapp_status || (status === 2 ? 'VERIFIED_INTERNAL' : 'DRAFT'),
          ziapp_synced_at: pp?.ziapp_synced_at || null,
          ziapp_synced_by: pp?.ziapp_synced_by || null
        };

        // Filter search jika ada
        if (searchQuery) {
          const matchText =
            `${kodeIndikator} ${uraianSingkat} ${uraianPertanyaan} ${pilarNama} ${subpilarNama} ${catatanKoord || ''} ${catatanOper || ''} ${verifiedBy || ''}`.toLowerCase();
          if (!matchText.includes(searchQuery)) {
            return;
          }
        }

        // Masukkan ke kolom sesuai status
        if (status === 3) {
          perluRevisiList.push(card);
        } else if (status === 1) {
          menungguReviewList.push(card);
        } else if (status === 2) {
          disetujuiList.push(card);
        }
      });
    });

    const totalCount =
      perluRevisiList.length + menungguReviewList.length + disetujuiList.length;

    return {
      success: true,
      periodes: allPeriodes,
      data: {
        periode: currentPeriode,
        cards: {
          perluRevisi: perluRevisiList,
          menungguReview: menungguReviewList,
          disetujui: disetujuiList
        },
        totalCount,
        counts: {
          perluRevisi: perluRevisiList.length,
          menungguReview: menungguReviewList.length,
          disetujui: disetujuiList.length
        }
      }
    };
  } catch (error: any) {
    console.error('[KANBAN-ACTIONS] getKanbanBoardData error:', error);
    return {
      success: false,
      error: error?.message || 'Terjadi kesalahan saat memuat Kanban board.',
      periodes: [],
      data: {
        periode: null,
        cards: {
          perluRevisi: [],
          menungguReview: [],
          disetujui: []
        },
        totalCount: 0,
        counts: {
          perluRevisi: 0,
          menungguReview: 0,
          disetujui: 0
        }
      }
    };
  }
}

/**
 * Server action untuk mengirim catatan klarifikasi singkat dari operator
 * pada kartu revisi Kanban:
 * - Menambahkan entri baru ke catatan_operator dengan nama pengguna dan timestamp
 * - Mengupdate tabel pertanyaan_periode dan legacy buktiDukung
 * - Mencatat ke tabel audit_log
 * - Melakukan revalidasi path cache
 */
export async function sendKlarifikasiAction(params: {
  idPertanyaan: string;
  idPeriode?: string;
  pesanKlarifikasi: string;
}): Promise<{
  success: boolean;
  message?: string;
  updatedCatatan?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Sesi berakhir atau pengguna belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const cleanMessage = (params.pesanKlarifikasi || '').trim();
    if (!cleanMessage) {
      return {
        success: false,
        error: 'Pesan klarifikasi tidak boleh kosong.'
      };
    }

    const supabase = await createClient();

    // 1. Dapatkan periode aktif jika idPeriode tidak disertakan
    let targetPeriodeId = params.idPeriode;
    if (!targetPeriodeId) {
      const activePeriode = await getActivePeriode();
      targetPeriodeId = activePeriode?.id || 'default-periode-2026';
    }

    // 2. Cari data pertanyaan_periode yang ada
    const { data: existingPP } = await supabase
      .from('pertanyaan_periode')
      .select('*')
      .eq('id_pertanyaan', params.idPertanyaan)
      .eq('id_periode', targetPeriodeId)
      .maybeSingle();

    const senderName = session.fullName || session.email || 'Operator Tim';
    const now = new Date();
    const formattedTime = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const newNoteEntry = `[${senderName} • ${formattedTime}]: ${cleanMessage}`;

    const existingNote = existingPP?.catatan_operator || '';
    const updatedCatatan = existingNote
      ? `${existingNote}\n\n${newNoteEntry}`
      : newNoteEntry;

    // 3. Update tabel pertanyaan_periode
    let idPertanyaanPeriode = existingPP?.id;
    if (existingPP?.id) {
      await supabase
        .from('pertanyaan_periode')
        .update({
          catatan_operator: updatedCatatan,
          updated_at: now.toISOString()
        })
        .eq('id', existingPP.id);
    } else {
      const { data: insertedPP } = await supabase
        .from('pertanyaan_periode')
        .insert({
          id_pertanyaan: params.idPertanyaan,
          id_periode: targetPeriodeId,
          catatan_operator: updatedCatatan,
          submitted_by_user_id: session.userId,
          submitted_by_name: senderName,
          status_kelengkapan: 3,
          updated_at: now.toISOString()
        })
        .select('id')
        .maybeSingle();
      idPertanyaanPeriode = insertedPP?.id;
    }

    // 4. Update tabel legacy buktiDukung untuk fallback
    try {
      const { data: legacyRow } = await supabase
        .from('buktiDukung')
        .select('id_bukti')
        .eq('id_pertanyaan', params.idPertanyaan)
        .maybeSingle();

      if (legacyRow?.id_bukti) {
        await supabase
          .from('buktiDukung')
          .update({
            catatan_user: updatedCatatan,
            updated_at: now.toISOString()
          })
          .eq('id_pertanyaan', params.idPertanyaan);
      }
    } catch (legacyErr: any) {
      console.warn(
        '[KANBAN-ACTIONS] Warning updating legacy buktiDukung:',
        legacyErr?.message
      );
    }

    // 5. Catat audit trail
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: 'KLARIFIKASI_REVISI',
        user_id: session.userId,
        user_name: senderName,
        role: session.role || 'operator',
        old_state: {
          catatan_operator: existingNote || null
        },
        new_state: {
          catatan_operator: updatedCatatan,
          pesan_klarifikasi: cleanMessage
        },
        created_at: now.toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[KANBAN-ACTIONS] Warning inserting audit_log:',
        auditErr?.message
      );
    }

    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/formRB');

    return {
      success: true,
      message:
        'Balasan klarifikasi berhasil disimpan dan dicatat dalam riwayat!',
      updatedCatatan
    };
  } catch (err: any) {
    console.error('[KANBAN-ACTIONS] sendKlarifikasiAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim klarifikasi.'
    };
  }
}

/**
 * Server action untuk sinkronisasi perpindahan kartu Kanban (Drag & Drop)
 * antar kolom:
 * - 3: Perlu Revisi (To Do)
 * - 1: Menunggu Review (In Progress / In Review)
 * - 2: Disetujui (Done)
 *
 * Mengupdate pertanyaan_periode dan fallback legacy buktiDukung,
 * mencatat audit trail, dan me-revalidate path cache.
 */
export async function updateKanbanCardStatusAction(params: {
  idPertanyaan: string;
  idPeriode?: string;
  newStatus: StatusKelengkapan;
  previousStatus?: StatusKelengkapan;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Sesi berakhir atau pengguna belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const supabase = await createClient();

    // 1. Tentukan target periode evaluasi
    let targetPeriodeId = params.idPeriode;
    if (!targetPeriodeId) {
      const activePeriode = await getActivePeriode();
      targetPeriodeId = activePeriode?.id || 'default-periode-2026';
    }

    // 2. Cari data pertanyaan_periode yang ada
    const { data: existingPP } = await supabase
      .from('pertanyaan_periode')
      .select('*')
      .eq('id_pertanyaan', params.idPertanyaan)
      .eq('id_periode', targetPeriodeId)
      .maybeSingle();

    const senderName = session.fullName || session.email || 'Tim RB';
    const now = new Date();

    const updatePayload: Record<string, any> = {
      status_kelengkapan: params.newStatus,
      updated_at: now.toISOString()
    };

    // Jika dipindah ke kolom Disetujui (2), otomatis set verifier info
    if (params.newStatus === 2) {
      updatePayload.verified_by = senderName;
      updatePayload.verified_at = now.toISOString();
      if (!existingPP?.nilai_verifikasi && existingPP?.nilai_mandiri) {
        updatePayload.nilai_verifikasi = existingPP.nilai_mandiri;
      }
    }

    let idPertanyaanPeriode = existingPP?.id;

    if (existingPP?.id) {
      const { error: ppUpdateError } = await supabase
        .from('pertanyaan_periode')
        .update(updatePayload)
        .eq('id', existingPP.id);

      if (ppUpdateError) {
        throw new Error(
          `Gagal memperbarui status pertanyaan_periode: ${ppUpdateError.message}`
        );
      }
    } else {
      const { data: insertedPP, error: ppInsertError } = await supabase
        .from('pertanyaan_periode')
        .insert({
          id_pertanyaan: params.idPertanyaan,
          id_periode: targetPeriodeId,
          status_kelengkapan: params.newStatus,
          submitted_by_user_id: session.userId,
          submitted_by_name: senderName,
          verified_by: params.newStatus === 2 ? senderName : null,
          verified_at: params.newStatus === 2 ? now.toISOString() : null,
          updated_at: now.toISOString()
        })
        .select('id')
        .maybeSingle();

      if (ppInsertError) {
        throw new Error(
          `Gagal membuat data pertanyaan_periode baru: ${ppInsertError.message}`
        );
      }
      idPertanyaanPeriode = insertedPP?.id;
    }

    // 3. Update tabel legacy buktiDukung untuk fallback
    try {
      const { data: legacyRow } = await supabase
        .from('buktiDukung')
        .select('id_bukti')
        .eq('id_pertanyaan', params.idPertanyaan)
        .maybeSingle();

      if (legacyRow?.id_bukti) {
        await supabase
          .from('buktiDukung')
          .update({
            status_kelengkapan: params.newStatus,
            updated_at: now.toISOString()
          })
          .eq('id_pertanyaan', params.idPertanyaan);
      }
    } catch (legacyErr: any) {
      console.warn(
        '[KANBAN-ACTIONS] Warning updating legacy buktiDukung status:',
        legacyErr?.message
      );
    }

    // 4. Catat audit trail perpindahan kartu Kanban
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: idPertanyaanPeriode || null,
        action: 'UPDATE_KANBAN_STATUS',
        user_id: session.userId,
        user_name: senderName,
        role: session.role || 'operator',
        old_state: {
          status_kelengkapan:
            params.previousStatus ?? existingPP?.status_kelengkapan ?? null
        },
        new_state: {
          status_kelengkapan: params.newStatus
        },
        created_at: now.toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[KANBAN-ACTIONS] Warning inserting audit_log:',
        auditErr?.message
      );
    }

    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/formRB');
    revalidatePath('/rebo/monitoring');

    return {
      success: true,
      message: 'Status indikator berhasil diperbarui.'
    };
  } catch (err: any) {
    console.error('[KANBAN-ACTIONS] updateKanbanCardStatusAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengubah status kartu di database.'
    };
  }
}
