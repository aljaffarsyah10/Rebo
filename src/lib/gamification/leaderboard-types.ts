/**
 * Leaderboard & Gamifikasi 6 Pilar ZI/RB BPS Kabupaten Kepulauan Sitaro
 *
 * Tipe data, rumus kalkulasi peringkat sehat, predikat apresiasi,
 * dan pesan apresiasi WhatsApp resmi Kepala BPS Sitaro.
 */

export type LeaderboardPredikat =
  | 'TERCEPAT_SELESAI'
  | 'ZERO_REVISI'
  | 'SKOR_TERTINGGI'
  | 'ON_TRACK'
  | 'PERLU_DORONGAN';

export interface PilarLeaderboardItem {
  pilar_id: string | number;
  pilar_nama: string;
  pilar_kode: string; // "Pilar 1" s.d. "Pilar 6"
  koordinator_name: string;
  koordinator_phone: string;
  total_indikator: number;
  indikator_terisi: number;
  indikator_diverifikasi: number;
  indikator_revisi: number;
  persentase_selesai: number; // Disetujui / Total Indikator (%)
  tingkat_revisi_persen: number; // Revisi / Indikator Terisi (%)
  skor_riil: number;
  skor_maksimal: number;
  persentase_skor: number; // (skor_riil / skor_maksimal) * 100
  rank: number;
  status_predikat: LeaderboardPredikat;
  predikat_label: string;
  catatan_apresiasi?: string;
  tautan_form: string;
}

export interface LeaderboardSummary {
  periode_id: string;
  periode_nama: string;
  tahun: number;
  items: PilarLeaderboardItem[];
  tercepat_pilar: PilarLeaderboardItem;
  zero_revisi_pilar: PilarLeaderboardItem;
  skor_tertinggi_pilar: PilarLeaderboardItem;
  rata_rata_selesai: number;
  total_indikator_all: number;
  total_diverifikasi_all: number;
  total_revisi_all: number;
  updated_at: string;
}

/**
 * Data mock realistis dan dinamis capaian 6 Pilar BPS Sitaro Tahun 2026.
 * Digunakan sebagai fallback saat koneksi Supabase offline / kosong
 * dan sebagai baseline komparasi progresivitas pilar.
 */
export const MOCK_PILAR_LEADERBOARD_RAW: Omit<
  PilarLeaderboardItem,
  'rank' | 'status_predikat' | 'predikat_label' | 'persentase_skor'
>[] = [
  {
    pilar_id: 1,
    pilar_nama: 'Manajemen Perubahan',
    pilar_kode: 'Pilar 1',
    koordinator_name: 'Franky Pontoh, S.Si',
    koordinator_phone: '082190010001',
    total_indikator: 10,
    indikator_terisi: 10,
    indikator_diverifikasi: 10,
    indikator_revisi: 0,
    persentase_selesai: 100,
    tingkat_revisi_persen: 0.0,
    skor_riil: 7.85,
    skor_maksimal: 8.0,
    catatan_apresiasi:
      'Pilar pertama yang menuntaskan verifikasi 100% dengan catatan berkas tanpa revisi (Clean Sheet).',
    tautan_form: '/rebo/formRB/pemenuhan'
  },
  {
    pilar_id: 2,
    pilar_nama: 'Penataan Tatalaksana',
    pilar_kode: 'Pilar 2',
    koordinator_name: 'Meilany Janis, S.Stat',
    koordinator_phone: '082190010002',
    total_indikator: 12,
    indikator_terisi: 12,
    indikator_diverifikasi: 11,
    indikator_revisi: 1,
    persentase_selesai: 91.7,
    tingkat_revisi_persen: 8.3,
    skor_riil: 6.7,
    skor_maksimal: 7.0,
    catatan_apresiasi:
      'Digitalisasi SOP makro dan SPBE berjalan sangat pesat, tinggal 1 perbaikan bukti notulen reviu SOP.',
    tautan_form: '/rebo/formRB/pemenuhan'
  },
  {
    pilar_id: 3,
    pilar_nama: 'Penataan Sistem Manajemen SDM',
    pilar_kode: 'Pilar 3',
    koordinator_name: 'Christian Saselah, S.Tr.Stat',
    koordinator_phone: '082190010003',
    total_indikator: 16,
    indikator_terisi: 16,
    indikator_diverifikasi: 14,
    indikator_revisi: 0,
    persentase_selesai: 87.5,
    tingkat_revisi_persen: 0.0,
    skor_riil: 9.8,
    skor_maksimal: 10.0,
    catatan_apresiasi:
      'Konsistensi Zero Revision di seluruh bukti pola mutasi internal dan pengawasan presensi pegawai.',
    tautan_form: '/rebo/formRB/pemenuhan'
  },
  {
    pilar_id: 4,
    pilar_nama: 'Penguatan Akuntabilitas',
    pilar_kode: 'Pilar 4',
    koordinator_name: 'Debby Makawimbang, S.E',
    koordinator_phone: '082190010004',
    total_indikator: 14,
    indikator_terisi: 14,
    indikator_diverifikasi: 14,
    indikator_revisi: 0,
    persentase_selesai: 100,
    tingkat_revisi_persen: 0.0,
    skor_riil: 9.95,
    skor_maksimal: 10.0,
    catatan_apresiasi:
      'Skor capaian tertinggi (99.5% dari pagu maksimal) dengan dokumen SAKIP dan Renaksi terlengkap.',
    tautan_form: '/rebo/formRB/area'
  },
  {
    pilar_id: 5,
    pilar_nama: 'Penguatan Pengawasan',
    pilar_kode: 'Pilar 5',
    koordinator_name: 'Novita Salindeho, S.Si',
    koordinator_phone: '082190010005',
    total_indikator: 15,
    indikator_terisi: 14,
    indikator_diverifikasi: 12,
    indikator_revisi: 1,
    persentase_selesai: 80.0,
    tingkat_revisi_persen: 7.1,
    skor_riil: 11.2,
    skor_maksimal: 12.5,
    catatan_apresiasi:
      'Penegakan SPIP, Whistleblowing System (WBS), dan UPG beroperasi optimal dengan respon cepat.',
    tautan_form: '/rebo/formRB/area'
  },
  {
    pilar_id: 6,
    pilar_nama: 'Peningkatan Kualitas Pelayanan Publik',
    pilar_kode: 'Pilar 6',
    koordinator_name: 'Rivo Lahamendu, A.Md.Stat',
    koordinator_phone: '082190010006',
    total_indikator: 13,
    indikator_terisi: 12,
    indikator_diverifikasi: 10,
    indikator_revisi: 2,
    persentase_selesai: 76.9,
    tingkat_revisi_persen: 16.7,
    skor_riil: 9.3,
    skor_maksimal: 10.0,
    catatan_apresiasi:
      'Inovasi PST BPS Sitaro dan survei kepuasan digital berjalan aktif, perlu percepatan bukti sarpras.',
    tautan_form: '/rebo/formRB/area'
  }
];

/**
 * Kalkulasi peringkat transparan antar-pilar:
 * 1. Sorting utama: persentase_selesai DESC
 * 2. Sorting kedua: tingkat_revisi_persen ASC (Zero Revision diutamakan)
 * 3. Sorting ketiga: persentase_skor DESC (Skor riil vs maksimal tertinggi)
 */
export function calculateLeaderboardRanks(
  rawItems: Omit<
    PilarLeaderboardItem,
    'rank' | 'status_predikat' | 'predikat_label' | 'persentase_skor'
  >[]
): PilarLeaderboardItem[] {
  // Tambahkan persentase_skor
  const itemsWithScorePercent = rawItems.map((item) => {
    const persentase_skor =
      item.skor_maksimal > 0
        ? Math.round((item.skor_riil / item.skor_maksimal) * 1000) / 10
        : 0;
    return {
      ...item,
      persentase_skor
    };
  });

  // Urutkan dengan algoritma multi-faktor transparan
  const sorted = [...itemsWithScorePercent].sort((a, b) => {
    // 1. Progres verifikasi selesai
    if (b.persentase_selesai !== a.persentase_selesai) {
      return b.persentase_selesai - a.persentase_selesai;
    }
    // 2. Tingkat revisi (lebih kecil lebih baik)
    if (a.tingkat_revisi_persen !== b.tingkat_revisi_persen) {
      return a.tingkat_revisi_persen - b.tingkat_revisi_persen;
    }
    // 3. Persentase perolehan nilai LKE
    return b.persentase_skor - a.persentase_skor;
  });

  // Identifikasi pemenang kategori apresiasi khusus
  // a) Tercepat 100% verifikasi
  const tercepatCandidate = sorted.find((it) => it.persentase_selesai >= 100);

  // b) Zero revision leader (revisi = 0 dan indikator terisi terbanyak / selesai tertinggi)
  const zeroRevisionCandidates = [...sorted].filter(
    (it) => it.indikator_revisi === 0 && it.indikator_terisi > 0
  );
  zeroRevisionCandidates.sort((a, b) => {
    if (b.persentase_selesai !== a.persentase_selesai) {
      return b.persentase_selesai - a.persentase_selesai;
    }
    return b.total_indikator - a.total_indikator;
  });
  const zeroRevisionWinnerId = zeroRevisionCandidates[0]?.pilar_id;

  // c) Skor capaian tertinggi (persentase_skor atau skor_riil)
  const topScoreCandidates = [...sorted].sort(
    (a, b) => b.persentase_skor - a.persentase_skor
  );
  const topScoreWinnerId = topScoreCandidates[0]?.pilar_id;

  return sorted.map((item, index) => {
    const rank = index + 1;
    let status_predikat: LeaderboardPredikat = 'ON_TRACK';
    let predikat_label = 'On Track';

    if (tercepatCandidate && item.pilar_id === tercepatCandidate.pilar_id) {
      status_predikat = 'TERCEPAT_SELESAI';
      predikat_label = 'Speed Star (100% Tuntas)';
    } else if (item.pilar_id === zeroRevisionWinnerId) {
      status_predikat = 'ZERO_REVISI';
      predikat_label = 'Zero Revision Leader';
    } else if (item.pilar_id === topScoreWinnerId) {
      status_predikat = 'SKOR_TERTINGGI';
      predikat_label = 'Top Score Champion';
    } else if (item.persentase_selesai >= 75) {
      status_predikat = 'ON_TRACK';
      predikat_label = 'Progresif & Sesuai Target';
    } else {
      status_predikat = 'PERLU_DORONGAN';
      predikat_label = 'Perlu Akselerasi Bukti';
    }

    return {
      ...item,
      rank,
      status_predikat,
      predikat_label
    };
  });
}

/**
 * Menyusun ringkasan komprehensif leaderboard beserta highlight pemenang tiap kategori
 */
export function buildLeaderboardSummary(
  rankedItems: PilarLeaderboardItem[],
  periodeId: string = 'default-periode-2026',
  periodeNama: string = 'Evaluasi PMPRB 2026',
  tahun: number = 2026
): LeaderboardSummary {
  // Pemenang Tercepat
  const tercepat =
    rankedItems.find((it) => it.status_predikat === 'TERCEPAT_SELESAI') ||
    rankedItems.find((it) => it.persentase_selesai === 100) ||
    rankedItems[0];

  // Pemenang Zero Revisi
  const zeroRevisi =
    rankedItems.find((it) => it.status_predikat === 'ZERO_REVISI') ||
    rankedItems.find((it) => it.indikator_revisi === 0) ||
    [...rankedItems].sort(
      (a, b) => a.tingkat_revisi_persen - b.tingkat_revisi_persen
    )[0];

  // Pemenang Skor Tertinggi
  const skorTertinggi =
    rankedItems.find((it) => it.status_predikat === 'SKOR_TERTINGGI') ||
    [...rankedItems].sort((a, b) => b.persentase_skor - a.persentase_skor)[0];

  const total_indikator_all = rankedItems.reduce(
    (sum, it) => sum + it.total_indikator,
    0
  );
  const total_diverifikasi_all = rankedItems.reduce(
    (sum, it) => sum + it.indikator_diverifikasi,
    0
  );
  const total_revisi_all = rankedItems.reduce(
    (sum, it) => sum + it.indikator_revisi,
    0
  );
  const rata_rata_selesai =
    rankedItems.length > 0
      ? Math.round(
          (rankedItems.reduce((sum, it) => sum + it.persentase_selesai, 0) /
            rankedItems.length) *
            10
        ) / 10
      : 0;

  return {
    periode_id: periodeId,
    periode_nama: periodeNama,
    tahun,
    items: rankedItems,
    tercepat_pilar: tercepat,
    zero_revisi_pilar: zeroRevisi,
    skor_tertinggi_pilar: skorTertinggi,
    rata_rata_selesai,
    total_indikator_all,
    total_diverifikasi_all,
    total_revisi_all,
    updated_at: new Date().toISOString()
  };
}

/**
 * Format Pesan Apresiasi Resmi Kepala BPS Sitaro untuk dibagikan ke WhatsApp Tim Kerja
 */
export function generateWhatsAppLeaderboardMessage(
  summary: LeaderboardSummary
): string {
  const tanggalHariIni = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full'
  }).format(new Date());

  const podiumIcons = ['🥇', '🥈', '🥉'];

  const rankingText = summary.items
    .map((item, idx) => {
      const medal = idx < 3 ? podiumIcons[idx] : ` ${item.rank}.`;
      return `${medal} *${item.pilar_kode}: ${item.pilar_nama}*\n   👤 Koordinator: ${item.koordinator_name}\n   📊 Progres: ${item.persentase_selesai}% (${item.indikator_diverifikasi}/${item.total_indikator} diverifikasi)\n   🛡️ Revisi: ${item.tingkat_revisi_persen}% | Skor: ${item.skor_riil.toFixed(2)} (${item.persentase_skor}%)`;
    })
    .join('\n\n');

  return `🏆 *PAPAN APRESIASI & KEPATUHAN 6 PILAR ZI/RB BPS KABUPATEN KEPULAUAN SITARO*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *Per Tanggal:* ${tanggalHariIni}
🎯 *Siklus:* ${summary.periode_nama} (${summary.tahun})
📈 *Rata-rata Penyelesaian Satker:* ${summary.rata_rata_selesai}%

🌟 *PENGHARGAAN KHUSUS (SPECIAL RECOGNITION):*
⚡ *Speed Star (Tercepat 100%):* ${summary.tercepat_pilar.pilar_kode} - ${summary.tercepat_pilar.pilar_nama} (Koordinator: ${summary.tercepat_pilar.koordinator_name})
🛡️ *Zero Revision Leader:* ${summary.zero_revisi_pilar.pilar_kode} - ${summary.zero_revisi_pilar.pilar_nama} (Tingkat Revisi: ${summary.zero_revisi_pilar.tingkat_revisi_persen}%)
💎 *Top Score Champion:* ${summary.skor_tertinggi_pilar.pilar_kode} - ${summary.skor_tertinggi_pilar.pilar_nama} (Capaian: ${summary.skor_tertinggi_pilar.persentase_skor}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *KLASEMEN LENGKAP 6 PILAR:*
${rankingText}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 *Pesan Apresiasi Kepala BPS Sitaro:*
_"Terima kasih dan apresiasi setinggi-tingginya kepada seluruh Koordinator dan Anggota Tim Kerja 6 Pilar atas integritas, dedikasi, dan komitmen luar biasa dalam pengumpulan bukti dukung LKE. Mari kita pertahankan semangat kolaborasi sehat ini menuju BPS Kabupaten Kepulauan Sitaro berpredikat WBK & WBBM!"_

🌐 *Pantau langsung di Sistem REBO:* https://rebo.bps-sitaro.go.id/rebo/leaderboard
*BPS Kabupaten Kepulauan Sitaro — Melayani dengan Hati, Berintegritas Tanpa Henti*`;
}
