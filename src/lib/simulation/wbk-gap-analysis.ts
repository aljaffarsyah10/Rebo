/**
 * Utilitas Kalkulasi & Simulasi Gap Analysis Predikat WBK / WBBM
 * Berdasarkan Pedoman Evaluasi Pembangunan Zona Integritas (PermenPAN-RB)
 */

export const TARGET_WBK = 75.0;
export const TARGET_WBBM = 85.0;

export type WBKStatusPredikat =
  | 'MEMENUHI_WBBM'
  | 'MEMENUHI_WBK'
  | 'POTENSI_WBK_BUTUH_VERIFIKASI'
  | 'BELUM_MEMENUHI_WBK';

export interface QuickWinIndicator {
  id_pertanyaan: string;
  id_pilar: string;
  kode_pilar: string;
  nama_pilar: string;
  id_subpilar?: string;
  nama_subpilar?: string;
  deskripsi_pertanyaan: string;
  status_kelengkapan: number; // 0: Belum Diisi, 1: Menunggu Review, 2: Disetujui, 3: Perlu Revisi
  status_label: string;
  nilai_mandiri: number;
  nilai_verifikasi: number;
  nilai_maks: number;
  potensi_tambahan_skor: number; // nilai_maks - nilai_verifikasi
  link_form: string;
}

export interface WBKSimulationResult {
  totalSkorMandiri: number;
  totalSkorVerifikasi: number;
  totalNilaiMaks: number;
  persentaseMandiri: number;
  persentaseVerifikasi: number;
  gapToWBK: number;
  gapToWBBM: number;
  gapMandiriToWBK: number;
  status: WBKStatusPredikat;
  statusLabel: string;
  statusDescription: string;
  quickWins: QuickWinIndicator[];
  totalSkorPilarHasil?: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Belum Diisi',
  1: 'Menunggu Review',
  2: 'Disetujui',
  3: 'Perlu Revisi'
};

/**
 * Menghitung simulasi capaian predikat WBK/WBBM serta daftar Quick-Wins
 * Menerima `pilarsData` baik berupa list pilar lengkap (dengan subpilar/pertanyaan)
 * maupun list indikator yang sudah diekstrak.
 *
 * @param pilarsData Data pilar atau array indikator
 * @param skorHasil Skor komponen hasil (default: 0)
 */
export function calculateWBKSimulation(
  pilarsData: any[],
  skorHasil: number = 0
): WBKSimulationResult {
  const safePilars = Array.isArray(pilarsData) ? pilarsData : [];

  const candidateIndicators: QuickWinIndicator[] = [];
  let sumMandiri = 0;
  let sumVerifikasi = 0;
  let sumMaks = 0;

  // Cek apakah pilarsData berupa array indikator langsung
  const isDirectIndicators =
    safePilars.length > 0 &&
    (safePilars[0].id_pertanyaan !== undefined ||
      safePilars[0].deskripsi_pertanyaan !== undefined);

  if (isDirectIndicators) {
    safePilars.forEach((item: any) => {
      const qId = String(item.id_pertanyaan || '');
      const pId = String(item.id_pilar || '1');
      const pKode = item.kode_pilar || `Pilar ${pId}`;
      const pNama = item.nama_pilar || `Pilar ${pId}`;
      const subId = item.id_subpilar ? String(item.id_subpilar) : undefined;
      const subNama = item.nama_subpilar || undefined;
      const deskripsi =
        item.deskripsi_pertanyaan || item.uraian_pertanyaan || 'Indikator LKE';

      const status = Number(item.status_kelengkapan ?? 0);
      const mandiri = Number(item.nilai_mandiri || 0);
      const verif = Number(item.nilai_verifikasi || 0);
      const maks = Number(item.nilai_maks ?? item.nilai_maksimal ?? 0);

      const potensi = Math.max(0, Number((maks - verif).toFixed(4)));

      sumMandiri += mandiri;
      sumVerifikasi += verif;
      sumMaks += maks;

      candidateIndicators.push({
        id_pertanyaan: qId,
        id_pilar: pId,
        kode_pilar: pKode,
        nama_pilar: pNama,
        id_subpilar: subId,
        nama_subpilar: subNama,
        deskripsi_pertanyaan: deskripsi,
        status_kelengkapan: status,
        status_label: STATUS_LABELS[status] || 'Belum Diisi',
        nilai_mandiri: Number(mandiri.toFixed(2)),
        nilai_verifikasi: Number(verif.toFixed(2)),
        nilai_maks: Number(maks.toFixed(2)),
        potensi_tambahan_skor: Number(potensi.toFixed(2)),
        link_form: `/rebo/formRB/${pId}?indikator=${qId}#indikator-${qId}`
      });
    });
  } else {
    // Format berjenjang: pilar -> subpilar -> pertanyaan
    safePilars.forEach((pilar: any) => {
      const pId = String(pilar.id_pilar || '1');
      const pKode = pilar.kode_pilar || `Pilar ${pId}`;
      const pNama = pilar.nama_pilar || `Pilar ${pId}`;

      // Ambil skor langsung dari pilar jika ada dan belum dijumlahkan per pertanyaan
      let hasQuestions = false;

      const subpilars = pilar.subpilars || pilar.subpilar || [];
      if (Array.isArray(subpilars)) {
        subpilars.forEach((sub: any) => {
          const subId = String(sub.id_subpilar || '');
          const subNama = sub.nama_subpilar || `Subpilar ${subId}`;

          const questions = sub.pertanyaan || sub.questions || [];
          if (Array.isArray(questions) && questions.length > 0) {
            hasQuestions = true;
            questions.forEach((q: any) => {
              const qId = String(q.id_pertanyaan || '');
              const deskripsi =
                q.deskripsi_pertanyaan ||
                q.uraian_pertanyaan ||
                q.uraian_buktidukung ||
                'Indikator LKE';

              // Hitung nilai maks jika ada kategoriPenilaian
              let maxNilai = Number(q.nilai_maks ?? q.nilai_maksimal ?? 0);
              if (
                !maxNilai &&
                Array.isArray(q.kategoriPenilaian) &&
                q.kategoriPenilaian.length > 0
              ) {
                maxNilai = Math.max(
                  ...q.kategoriPenilaian.map((k: any) => Number(k.nilai) || 0)
                );
              }

              const status = Number(q.status_kelengkapan ?? 0);
              const mandiri = Number(q.nilai_mandiri || 0);
              const verif = Number(q.nilai_verifikasi || 0);
              const potensi = Math.max(
                0,
                Number((maxNilai - verif).toFixed(4))
              );

              sumMandiri += mandiri;
              sumVerifikasi += verif;
              sumMaks += maxNilai;

              candidateIndicators.push({
                id_pertanyaan: qId,
                id_pilar: pId,
                kode_pilar: pKode,
                nama_pilar: pNama,
                id_subpilar: subId,
                nama_subpilar: subNama,
                deskripsi_pertanyaan: deskripsi,
                status_kelengkapan: status,
                status_label: STATUS_LABELS[status] || 'Belum Diisi',
                nilai_mandiri: Number(mandiri.toFixed(2)),
                nilai_verifikasi: Number(verif.toFixed(2)),
                nilai_maks: Number(maxNilai.toFixed(2)),
                potensi_tambahan_skor: Number(potensi.toFixed(2)),
                link_form: `/rebo/formRB/${pId}?indikator=${qId}#indikator-${qId}`
              });
            });
          }
        });
      }

      // Jika pilar tidak memiliki subpilar dengan pertanyaan, ambil nilai agregat dari properti pilar
      if (!hasQuestions) {
        sumMandiri += Number(pilar.nilaiMandiri ?? pilar.nilai_mandiri ?? 0);
        sumVerifikasi += Number(
          pilar.nilaiVerifikasi ?? pilar.nilai_verifikasi ?? 0
        );
        sumMaks += Number(pilar.nilaiMaksimal ?? pilar.nilai_maksimal ?? 0);
      }
    });
  }

  // Tambahkan komponen hasil (pilarHasil) jika ada
  const totalSkorMandiri = Number((sumMandiri + skorHasil).toFixed(2));
  const totalSkorVerifikasi = Number((sumVerifikasi + skorHasil).toFixed(2));
  // Total nilai maks pengungkit (60) + hasil (40) jika ada komponen hasil
  const totalNilaiMaks = Number(
    (sumMaks + (skorHasil > 0 ? 40 : 0)).toFixed(2)
  );

  const persentaseMandiri =
    totalNilaiMaks > 0
      ? Math.min(100, Math.round((totalSkorMandiri / totalNilaiMaks) * 100))
      : 0;

  const persentaseVerifikasi =
    totalNilaiMaks > 0
      ? Math.min(100, Math.round((totalSkorVerifikasi / totalNilaiMaks) * 100))
      : 0;

  // Hitung gap ke ambang batas predikat
  const gapToWBK = Number(
    Math.max(0, TARGET_WBK - totalSkorVerifikasi).toFixed(2)
  );
  const gapToWBBM = Number(
    Math.max(0, TARGET_WBBM - totalSkorVerifikasi).toFixed(2)
  );
  const gapMandiriToWBK = Number(
    Math.max(0, TARGET_WBK - totalSkorMandiri).toFixed(2)
  );

  // Tentukan status capaian predikat
  let status: WBKStatusPredikat = 'BELUM_MEMENUHI_WBK';
  let statusLabel = 'Belum Memenuhi WBK';
  let statusDescription =
    'Skor verifikasi saat ini masih di bawah 75.00. Fokuskan tindak lanjut pada indikator prioritas (quick-wins) berbobot tinggi.';

  if (totalSkorVerifikasi >= TARGET_WBBM) {
    status = 'MEMENUHI_WBBM';
    statusLabel = 'Memenuhi Syarat WBBM';
    statusDescription =
      'Total skor verifikasi telah melampaui batas predikat Wilayah Birokrasi Bersih dan Melayani (≥ 85.00).';
  } else if (totalSkorVerifikasi >= TARGET_WBK) {
    status = 'MEMENUHI_WBK';
    statusLabel = 'Memenuhi Syarat WBK';
    statusDescription =
      'Total skor verifikasi telah memenuhi standar minimal predikat Wilayah Bebas dari Korupsi (≥ 75.00).';
  } else if (
    totalSkorMandiri >= TARGET_WBK &&
    totalSkorVerifikasi < TARGET_WBK
  ) {
    status = 'POTENSI_WBK_BUTUH_VERIFIKASI';
    statusLabel = 'Potensi WBK (Butuh Verifikasi)';
    statusDescription =
      'Skor usulan mandiri sudah memenuhi ambang batas WBK (≥ 75.00), namun skor verifikasi saat ini masih menunggu peninjauan dan persetujuan verifikator.';
  } else {
    status = 'BELUM_MEMENUHI_WBK';
    statusLabel = 'Belum Memenuhi WBK';
    statusDescription =
      'Skor verifikasi saat ini masih di bawah 75.00. Fokuskan tindak lanjut pada indikator prioritas (quick-wins) berbobot tinggi.';
  }

  // Identifikasi indikator prioritas (Quick-Wins)
  // Kriteria:
  // - Belum disetujui (status_kelengkapan !== 2 atau nilai_verifikasi < nilai_maks)
  // - Memiliki potensi tambahan skor > 0
  // - Diurutkan berdasarkan potensi_tambahan_skor terbesar secara menurun
  const quickWins: QuickWinIndicator[] = candidateIndicators
    .filter((item) => {
      const isNotFull =
        item.status_kelengkapan !== 2 ||
        item.nilai_verifikasi < item.nilai_maks;
      return isNotFull && item.potensi_tambahan_skor > 0;
    })
    .sort((a, b) => {
      // Urutkan potensi_tambahan_skor terbesar
      if (b.potensi_tambahan_skor !== a.potensi_tambahan_skor) {
        return b.potensi_tambahan_skor - a.potensi_tambahan_skor;
      }
      // Fallback ke nilai_maks terbesar
      return b.nilai_maks - a.nilai_maks;
    });

  return {
    totalSkorMandiri,
    totalSkorVerifikasi,
    totalNilaiMaks,
    persentaseMandiri,
    persentaseVerifikasi,
    gapToWBK,
    gapToWBBM,
    gapMandiriToWBK,
    status,
    statusLabel,
    statusDescription,
    quickWins,
    totalSkorPilarHasil: skorHasil
  };
}
