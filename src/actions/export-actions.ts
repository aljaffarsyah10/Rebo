/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getActivePeriode, getAllPeriode } from '@/lib/api/rebo';
import { getCurrentUserSession } from '@/lib/auth/session';
import type {
  LkeExportData,
  LkeExportIndicatorRow,
  LkeExportPilarSummary
} from '@/lib/export/lke-excel';
import type { PeriodeEvaluasi, StatusKelengkapan } from '@/types/rebo';
import { STATUS_KELENGKAPAN_MAP } from '@/types/rebo';

/**
 * Server Action: Mengumpulkan seluruh data instrumen evaluasi LKE Zona Integritas
 * untuk diekspor ke format Excel resmi standar KemenPAN-RB & BPS RI.
 */
export async function getLkeExportData(
  periodeId?: string
): Promise<{ success: boolean; data?: LkeExportData; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Akses Ditolak: Silakan login terlebih dahulu untuk mengunduh Kertas Kerja LKE.'
      };
    }

    const supabase = await createClient();

    // 1. Dapatkan periode evaluasi target
    const allPeriodes = await getAllPeriode();
    let currentPeriode: PeriodeEvaluasi | null = null;

    if (periodeId) {
      currentPeriode = allPeriodes.find((p) => p.id === periodeId) || null;
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

    // 2. Fetch seluruh pilar berjenjang
    const { data: pilarsData, error: pilarsError } = await supabase
      .from('pilar')
      .select(
        `id_pilar,
         nama_pilar,
         id_area,
         area (id_area, nama_area),
         subpilar (
           id_subpilar,
           nama_subpilar,
           id_pilar,
           pertanyaan (
             id_pertanyaan,
             deskripsi_pertanyaan,
             uraian_buktidukung,
             kategoriPenilaian (id_kategori, uraian_kategori, nilai)
           )
         )`
      )
      .order('id_pilar', { ascending: true });

    if (pilarsError) {
      console.error('[EXPORT-ACTIONS] Error fetching pilars:', pilarsError);
      throw new Error(`Gagal memuat data pilar: ${pilarsError.message}`);
    }

    // 3. Fetch data pertanyaan_periode untuk periode ini (V2)
    const { data: ppData } = await supabase
      .from('pertanyaan_periode')
      .select('*, dokumen_bukti (*)')
      .eq('id_periode', currentPeriode.id);

    const ppMap = new Map<string, any>();
    (ppData || []).forEach((row) => {
      ppMap.set(String(row.id_pertanyaan), row);
    });

    // 4. Fetch fallback data dari buktiDukung (V1) jika ada
    const { data: legacyBuktiData } = await supabase
      .from('buktiDukung')
      .select('*');

    const legacyMap = new Map<string, any>();
    (legacyBuktiData || []).forEach((row) => {
      legacyMap.set(String(row.id_pertanyaan), row);
    });

    // 5. Fetch pilarHasil untuk Aspek Hasil
    let totalHasil = 0;
    try {
      const { data: pilarHasilRows } = await supabase
        .from('pilarHasil')
        .select('skor_pilarHasil');

      if (pilarHasilRows && pilarHasilRows.length > 0) {
        totalHasil = pilarHasilRows.reduce(
          (sum: number, r: any) => sum + (Number(r.skor_pilarHasil) || 0),
          0
        );
      }
    } catch (phErr: any) {
      console.warn(
        '[EXPORT-ACTIONS] Notice fetching pilarHasil:',
        phErr?.message
      );
    }

    // 6. Susun baris indikator dan ringkasan per pilar
    const indicatorRows: LkeExportIndicatorRow[] = [];
    const pilarSummaries: LkeExportPilarSummary[] = [];

    let runningNo = 1;

    (pilarsData || []).forEach((pilar: any) => {
      const pilarIdStr = String(pilar.id_pilar);
      const pilarNama = pilar.nama_pilar || `Pilar ${pilarIdStr}`;
      const kodePilar = pilar.kode_pilar || `Pilar ${pilarIdStr}`;
      const areaObj = pilar.area || {};
      const areaName =
        areaObj.nama_area ||
        (pilar.id_area === 2 ? 'Area Reform' : 'Area Pemenuhan');

      let pilarTotalPertanyaan = 0;
      let pilarNilaiMaksimal = 0;
      let pilarNilaiMandiri = 0;
      let pilarNilaiVerifikasi = 0;

      const subpilars = pilar.subpilar || [];
      subpilars.sort((a: any, b: any) =>
        String(a.id_subpilar).localeCompare(String(b.id_subpilar), undefined, {
          numeric: true
        })
      );

      subpilars.forEach((sub: any, subIndex: number) => {
        const subIdStr = String(sub.id_subpilar);
        const subNama = sub.nama_subpilar || `Subpilar ${subIdStr}`;

        const questions = sub.pertanyaan || [];
        questions.forEach((q: any, qIndex: number) => {
          const qIdStr = String(q.id_pertanyaan);
          pilarTotalPertanyaan += 1;

          // 1. Kategori pilihan & nilai maksimal
          const kategoriList = q.kategoriPenilaian || [];
          let maxNilai = 0;
          if (kategoriList.length > 0) {
            maxNilai = Math.max(
              ...kategoriList.map((k: any) => Number(k.nilai) || 0)
            );
          }
          pilarNilaiMaksimal += maxNilai;

          // 2. Data pengisian pertanyaan_periode (V2) atau fallback (V1)
          const pp = ppMap.get(qIdStr);
          const legacy = legacyMap.get(qIdStr);

          let status: StatusKelengkapan = 0;
          let mandiriVal = 0;
          let verifVal = 0;
          let selectedKategoriId: string | null = null;
          let catatanOp = '';
          let catatanCoord = '';
          let verifiedBy = '';
          let verifiedAt = '';
          let gdriveUrl: string | null = null;
          let totalDocs = 0;

          if (pp) {
            const rawStatus = Number(pp.status_kelengkapan);
            status = (
              [0, 1, 2, 3].includes(rawStatus) ? rawStatus : 0
            ) as StatusKelengkapan;
            mandiriVal = Number(pp.nilai_mandiri) || 0;
            verifVal = Number(pp.nilai_verifikasi) || 0;
            selectedKategoriId = pp.id_kategori || null;
            catatanOp = pp.catatan_operator || '';
            catatanCoord = pp.catatan_koordinator || '';
            verifiedBy = pp.verified_by || '';
            verifiedAt = pp.verified_at
              ? new Date(pp.verified_at).toISOString().split('T')[0]
              : '';
            gdriveUrl = pp.gdrive_folder_url || null;

            const docs = pp.dokumen_bukti || [];
            totalDocs = docs.length;
            if (!gdriveUrl && docs.length > 0 && docs[0]?.file_url) {
              gdriveUrl = docs[0].file_url;
            }
          } else if (legacy) {
            const rawLegacyStatus = Number(legacy.status_kelengkapan);
            status = (
              [0, 1, 2, 3].includes(rawLegacyStatus) ? rawLegacyStatus : 0
            ) as StatusKelengkapan;
            mandiriVal = Number(legacy.nilai_mandiri) || 0;
            verifVal =
              Number(legacy.nilai_verifikasi) ||
              Number(legacy.nilai_akhir) ||
              0;
            selectedKategoriId = legacy.id_kategori || null;
            catatanOp = legacy.catatan_user || legacy.catatan_operator || '';
            catatanCoord = legacy.catatan_koordinator || '';
            gdriveUrl = legacy.link_bukti || null;
          }

          pilarNilaiMandiri += mandiriVal;
          pilarNilaiVerifikasi += verifVal;

          // Uraian kategori terpilih
          let selectedKategoriLabel = '';
          if (selectedKategoriId && kategoriList.length > 0) {
            const matched = kategoriList.find(
              (k: any) => String(k.id_kategori) === String(selectedKategoriId)
            );
            if (matched) {
              selectedKategoriLabel = matched.uraian_kategori;
            }
          }

          // Kode indikator berjenjang e.g. 1.1.1
          const kodeIndikator = `${pilarIdStr}.${subIndex + 1}.${qIndex + 1}`;

          const deskripsi =
            q.deskripsi_pertanyaan ||
            q.uraian_pertanyaan ||
            q.uraian_singkat ||
            `Pertanyaan #${qIdStr}`;

          indicatorRows.push({
            no: runningNo++,
            area: areaName,
            pilarId: pilarIdStr,
            pilarNama,
            pilarKode: kodePilar,
            subpilarId: subIdStr,
            subpilarNama: subNama,
            kodeIndikator,
            pertanyaanId: qIdStr,
            deskripsi,
            kategoriPenilaian: selectedKategoriLabel,
            nilaiMaksimal: Number(maxNilai.toFixed(2)),
            nilaiMandiri: Number(mandiriVal.toFixed(2)),
            nilaiVerifikasi: Number(verifVal.toFixed(2)),
            selisih: Number((verifVal - mandiriVal).toFixed(2)),
            status,
            statusLabel: STATUS_KELENGKAPAN_MAP[status]?.label || 'Belum Diisi',
            gdriveUrl,
            totalDokumen: totalDocs,
            catatanOperator: catatanOp,
            catatanKoordinator: catatanCoord,
            verifiedBy,
            verifiedAt
          });
        });
      });

      const persenMandiri =
        pilarNilaiMaksimal > 0
          ? Number(((pilarNilaiMandiri / pilarNilaiMaksimal) * 100).toFixed(2))
          : 0;

      const persenVerifikasi =
        pilarNilaiMaksimal > 0
          ? Number(
              ((pilarNilaiVerifikasi / pilarNilaiMaksimal) * 100).toFixed(2)
            )
          : 0;

      pilarSummaries.push({
        pilarId: pilarIdStr,
        kodePilar,
        namaPilar: pilarNama,
        area: areaName,
        totalPertanyaan: pilarTotalPertanyaan,
        nilaiMaksimal: Number(pilarNilaiMaksimal.toFixed(2)),
        nilaiMandiri: Number(pilarNilaiMandiri.toFixed(2)),
        nilaiVerifikasi: Number(pilarNilaiVerifikasi.toFixed(2)),
        persenMandiri,
        persenVerifikasi
      });
    });

    const exportPayload: LkeExportData = {
      periode: currentPeriode,
      rows: indicatorRows,
      pilarSummaries,
      totalHasil: Number(totalHasil.toFixed(2)),
      exportedAt: new Date(),
      exportedBy: session.fullName || session.email || 'Admin BPS Sitaro'
    };

    return {
      success: true,
      data: exportPayload
    };
  } catch (err: any) {
    console.error(
      '[EXPORT-ACTIONS] Unexpected error in getLkeExportData:',
      err
    );
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menyusun data LKE.'
    };
  }
}
