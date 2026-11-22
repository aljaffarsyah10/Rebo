/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getActivePeriode, getAllPeriode } from '@/lib/api/rebo';
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
          nilai_mandiri: Number(mandiriVal.toFixed(2)),
          nilai_verifikasi: Number(verifVal.toFixed(2)),
          nilai_maksimal: Number(maxNilai.toFixed(2)),
          gdrive_folder_url: gdriveUrl,
          total_dokumen: dokumenFiles.length,
          dokumen_files: dokumenFiles
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
