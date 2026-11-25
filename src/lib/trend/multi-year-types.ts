/**
 * Tipe Data & Mock Model untuk Analisis Tren Kinerja Antar-Tahun (Multi-Year Trend Analysis)
 * BPS Kabupaten Kepulauan Sitaro - Pembangunan Zona Integritas (WBK/WBBM)
 */

export interface PilarTrendScore {
  pilar_nama: string;
  skor_verifikasi: number;
  bobot_maksimal: number;
  delta_vs_prev?: number;
}

export interface AnnualLKETrendData {
  tahun: number;
  total_skor_mandiri: number;
  total_skor_verifikasi: number;
  total_skor_tpi: number;
  predikat_status: string;
  pilar_scores: Record<string, PilarTrendScore>;
  survei: {
    ikm: number;
    ipak: number;
    nps: number;
  };
  inovasi_count: number;
  catatan_perbaikan: string;
}

export interface MostImprovedPilarDetail {
  kode: string;
  nama: string;
  delta: number;
  persentase: number;
}

export interface ContinuousImprovementSummary {
  growth_total_skor: number;
  most_improved_pilar: MostImprovedPilarDetail;
  second_improved_pilar: MostImprovedPilarDetail;
  average_annual_growth: number;
  compliance_continuity_years: number;
  narasi_kesimpulan: string;
}

export interface PilarMatrixRow {
  kode: string;
  nama: string;
  bobot_maksimal: number;
  skor_2024: number;
  skor_2025: number;
  skor_2026: number;
  delta_total: number;
  growth_percentage: number;
  status_improvement: string;
}

export interface MultiYearTrendResult {
  trends: AnnualLKETrendData[];
  summary: ContinuousImprovementSummary;
  pilarMatrix: PilarMatrixRow[];
  chartData: {
    tahun: string;
    skor_mandiri: number;
    skor_verifikasi: number;
    skor_tpi: number;
    target_wbk: number;
    target_wbbm: number;
    ikm: number;
    ipak: number;
    inovasi: number;
  }[];
  pilarComparisonChart: {
    pilarKode: string;
    pilarNama: string;
    skor2024: number;
    skor2025: number;
    skor2026: number;
    bobotMaks: number;
  }[];
}

/**
 * Mock data realistis 3 tahun evaluasi BPS Kabupaten Kepulauan Sitaro:
 * - 2024: Total Skor 78.50, IKM 3.58, IPAK 3.65 (Tahap Awal Pencanangan ZI)
 * - 2025: Total Skor 86.20, IKM 3.72, IPAK 3.80 (Penguatan Inovasi & Digitalisasi SPBE)
 * - 2026: Total Skor 92.45, IKM 3.84, IPAK 3.92 (Tahap Prima Pengusulan Menuju WBBM)
 */
export const MOCK_MULTI_YEAR_TREND_DATA: AnnualLKETrendData[] = [
  {
    tahun: 2024,
    total_skor_mandiri: 83.25,
    total_skor_verifikasi: 78.5,
    total_skor_tpi: 78.1,
    predikat_status: 'Pencanangan Awal ZI Menuju WBK',
    pilar_scores: {
      pilar_1: {
        pilar_nama: 'Manajemen Perubahan',
        skor_verifikasi: 6.2,
        bobot_maksimal: 8.0
      },
      pilar_2: {
        pilar_nama: 'Penataan Tatalaksana',
        skor_verifikasi: 7.1,
        bobot_maksimal: 10.0
      },
      pilar_3: {
        pilar_nama: 'Penataan Sistem Manajemen SDM',
        skor_verifikasi: 7.6,
        bobot_maksimal: 10.0
      },
      pilar_4: {
        pilar_nama: 'Penguatan Akuntabilitas',
        skor_verifikasi: 7.8,
        bobot_maksimal: 10.0
      },
      pilar_5: {
        pilar_nama: 'Penguatan Pengawasan',
        skor_verifikasi: 7.9,
        bobot_maksimal: 10.0
      },
      pilar_6: {
        pilar_nama: 'Peningkatan Kualitas Pelayanan Publik',
        skor_verifikasi: 8.4,
        bobot_maksimal: 12.0
      }
    },
    survei: {
      ikm: 3.58,
      ipak: 3.65,
      nps: 78.0
    },
    inovasi_count: 3,
    catatan_perbaikan:
      'Fokus pemenuhan kelengkapan dokumen formal dasar, pembentukan tim kerja ZI lintas fungsi, dan penataan awal tata laksana pelayanan PST offline.'
  },
  {
    tahun: 2025,
    total_skor_mandiri: 89.4,
    total_skor_verifikasi: 86.2,
    total_skor_tpi: 85.9,
    predikat_status: 'Memenuhi Ambang Batas WBK (Predikat Terverifikasi)',
    pilar_scores: {
      pilar_1: {
        pilar_nama: 'Manajemen Perubahan',
        skor_verifikasi: 7.1,
        bobot_maksimal: 8.0,
        delta_vs_prev: 0.9
      },
      pilar_2: {
        pilar_nama: 'Penataan Tatalaksana',
        skor_verifikasi: 8.5,
        bobot_maksimal: 10.0,
        delta_vs_prev: 1.4
      },
      pilar_3: {
        pilar_nama: 'Penataan Sistem Manajemen SDM',
        skor_verifikasi: 8.4,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.8
      },
      pilar_4: {
        pilar_nama: 'Penguatan Akuntabilitas',
        skor_verifikasi: 8.7,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.9
      },
      pilar_5: {
        pilar_nama: 'Penguatan Pengawasan',
        skor_verifikasi: 8.8,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.9
      },
      pilar_6: {
        pilar_nama: 'Peningkatan Kualitas Pelayanan Publik',
        skor_verifikasi: 10.1,
        bobot_maksimal: 12.0,
        delta_vs_prev: 1.7
      }
    },
    survei: {
      ikm: 3.72,
      ipak: 3.8,
      nps: 85.5
    },
    inovasi_count: 7,
    catatan_perbaikan:
      'Percepatan digitalisasi SPBE lokal, integrasi aplikasi REBO V1, modernisasi fasilitas PST ramah disabilitas, dan penguatan sistem pengawasan berbasis Whistleblowing System (WBS).'
  },
  {
    tahun: 2026,
    total_skor_mandiri: 94.8,
    total_skor_verifikasi: 92.45,
    total_skor_tpi: 92.1,
    predikat_status: 'Tahap Prima Pengusulan Menuju WBBM (Sangat Memuaskan)',
    pilar_scores: {
      pilar_1: {
        pilar_nama: 'Manajemen Perubahan',
        skor_verifikasi: 7.65,
        bobot_maksimal: 8.0,
        delta_vs_prev: 0.55
      },
      pilar_2: {
        pilar_nama: 'Penataan Tatalaksana',
        skor_verifikasi: 9.6,
        bobot_maksimal: 10.0,
        delta_vs_prev: 1.1
      },
      pilar_3: {
        pilar_nama: 'Penataan Sistem Manajemen SDM',
        skor_verifikasi: 9.1,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.7
      },
      pilar_4: {
        pilar_nama: 'Penguatan Akuntabilitas',
        skor_verifikasi: 9.3,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.6
      },
      pilar_5: {
        pilar_nama: 'Penguatan Pengawasan',
        skor_verifikasi: 9.5,
        bobot_maksimal: 10.0,
        delta_vs_prev: 0.7
      },
      pilar_6: {
        pilar_nama: 'Peningkatan Kualitas Pelayanan Publik',
        skor_verifikasi: 11.5,
        bobot_maksimal: 12.0,
        delta_vs_prev: 1.4
      }
    },
    survei: {
      ikm: 3.84,
      ipak: 3.92,
      nps: 92.0
    },
    inovasi_count: 12,
    catatan_perbaikan:
      'Transformasi menyeluruh REBO V2 dengan fitur AI Assistant, Presentation Deck Generator, Voice Over Multi-Bahasa, integrasi sentimen PST, dan pemantauan continuous improvement berkelanjutan tanpa celah.'
  }
];

/**
 * Helper untuk menghitung ringkasan perbaikan berkelanjutan & matriks 6 pilar
 */
export function calculateMultiYearAnalysis(
  data: AnnualLKETrendData[] = MOCK_MULTI_YEAR_TREND_DATA
): MultiYearTrendResult {
  const sorted = [...data].sort((a, b) => a.tahun - b.tahun);
  const firstYear = sorted[0];
  const lastYear = sorted[sorted.length - 1];

  const growthTotal = Number(
    (lastYear.total_skor_verifikasi - firstYear.total_skor_verifikasi).toFixed(
      2
    )
  );

  const numberOfIntervals = sorted.length > 1 ? sorted.length - 1 : 1;
  const avgGrowth = Number((growthTotal / numberOfIntervals).toFixed(2));

  // Matriks 6 pilar
  const pilarKeys = [
    {
      key: 'pilar_1',
      kode: 'Pilar 1',
      defaultNama: 'Manajemen Perubahan',
      bobot: 8.0
    },
    {
      key: 'pilar_2',
      kode: 'Pilar 2',
      defaultNama: 'Penataan Tatalaksana',
      bobot: 10.0
    },
    {
      key: 'pilar_3',
      kode: 'Pilar 3',
      defaultNama: 'Penataan Sistem Manajemen SDM',
      bobot: 10.0
    },
    {
      key: 'pilar_4',
      kode: 'Pilar 4',
      defaultNama: 'Penguatan Akuntabilitas',
      bobot: 10.0
    },
    {
      key: 'pilar_5',
      kode: 'Pilar 5',
      defaultNama: 'Penguatan Pengawasan',
      bobot: 10.0
    },
    {
      key: 'pilar_6',
      kode: 'Pilar 6',
      defaultNama: 'Peningkatan Kualitas Pelayanan Publik',
      bobot: 12.0
    }
  ];

  const pilarMatrix: PilarMatrixRow[] = pilarKeys.map((p) => {
    const s2024 = firstYear.pilar_scores[p.key]?.skor_verifikasi || 0;
    const s2025 =
      sorted.length > 2
        ? sorted[1].pilar_scores[p.key]?.skor_verifikasi || 0
        : s2024;
    const s2026 = lastYear.pilar_scores[p.key]?.skor_verifikasi || 0;
    const delta = Number((s2026 - s2024).toFixed(2));
    const pct = s2024 > 0 ? Number(((delta / s2024) * 100).toFixed(1)) : 0;

    let status = 'Stabil Meningkat';
    if (pct >= 30) {
      status = 'Lonjakan Signifikan (Percontohan)';
    } else if (pct >= 20) {
      status = 'Peningkatan Sangat Baik';
    } else if (pct >= 10) {
      status = 'Konsisten Menguat';
    }

    return {
      kode: p.kode,
      nama: lastYear.pilar_scores[p.key]?.pilar_nama || p.defaultNama,
      bobot_maksimal: lastYear.pilar_scores[p.key]?.bobot_maksimal || p.bobot,
      skor_2024: s2024,
      skor_2025: s2025,
      skor_2026: s2026,
      delta_total: delta,
      growth_percentage: pct,
      status_improvement: status
    };
  });

  // Urutkan perbaikan pilar tertinggi
  const sortedPilarByDelta = [...pilarMatrix].sort(
    (a, b) => b.delta_total - a.delta_total
  );

  const mostImproved = {
    kode: sortedPilarByDelta[0]?.kode || 'Pilar 6',
    nama:
      sortedPilarByDelta[0]?.nama || 'Peningkatan Kualitas Pelayanan Publik',
    delta: sortedPilarByDelta[0]?.delta_total || 3.1,
    persentase: sortedPilarByDelta[0]?.growth_percentage || 36.9
  };

  const secondImproved = {
    kode: sortedPilarByDelta[1]?.kode || 'Pilar 2',
    nama: sortedPilarByDelta[1]?.nama || 'Penataan Tatalaksana',
    delta: sortedPilarByDelta[1]?.delta_total || 2.5,
    persentase: sortedPilarByDelta[1]?.growth_percentage || 35.2
  };

  const narasi = `Berdasarkan rekam jejak evaluasi multi-tahun 2024–2026, BPS Kabupaten Kepulauan Sitaro membuktikan adanya perbaikan berkelanjutan (Continuous Improvement) yang nyata dan terukur. Nilai evaluasi LKE terverifikasi melonjak sebesar +${growthTotal.toFixed(2)} poin (dari 78.50 pada 2024 menjadi 92.45 pada 2026), melampaui ambang batas WBK (75.00) dan predikat prima WBBM (85.00). Kenaikan tertinggi dicapai pada ${mostImproved.kode} (${mostImproved.nama}) dengan lonjakan +${mostImproved.delta.toFixed(2)} poin (+${mostImproved.persentase}%) didorong oleh optimalisasi layanan inklusif ramah rentan dan aplikasi inovasi publik, serta didukung ${secondImproved.kode} (${secondImproved.nama}) melalui integrasi SPBE dan sistem kerja digital terpadu REBO. Peningkatan ini linear dengan persepsi publik di mana Indeks Kepuasan Masyarakat (IKM) meningkat dari ${firstYear.survei.ikm.toFixed(2)} ke ${lastYear.survei.ikm.toFixed(2)} dan Indeks Persepsi Anti Korupsi (IPAK) melonjak dari ${firstYear.survei.ipak.toFixed(2)} ke ${lastYear.survei.ipak.toFixed(2)} (skala 4.00), mencerminkan birokrasi yang bersih, akuntabel, dan berdampak nyata bagi masyarakat kepulauan.`;

  const summary: ContinuousImprovementSummary = {
    growth_total_skor: growthTotal,
    most_improved_pilar: mostImproved,
    second_improved_pilar: secondImproved,
    average_annual_growth: avgGrowth,
    compliance_continuity_years: sorted.length,
    narasi_kesimpulan: narasi
  };

  const chartData = sorted.map((d) => ({
    tahun: String(d.tahun),
    skor_mandiri: d.total_skor_mandiri,
    skor_verifikasi: d.total_skor_verifikasi,
    skor_tpi: d.total_skor_tpi,
    target_wbk: 75.0,
    target_wbbm: 85.0,
    ikm: d.survei.ikm,
    ipak: d.survei.ipak,
    inovasi: d.inovasi_count
  }));

  const pilarComparisonChart = pilarMatrix.map((p) => ({
    pilarKode: p.kode,
    pilarNama: p.nama,
    skor2024: p.skor_2024,
    skor2025: p.skor_2025,
    skor2026: p.skor_2026,
    bobotMaks: p.bobot_maksimal
  }));

  return {
    trends: sorted,
    summary,
    pilarMatrix,
    chartData,
    pilarComparisonChart
  };
}
