/**
 * Tipe Data dan Model Pelacak Anggaran & Realisasi Kegiatan ZI/RB
 * DIPA Badan Pusat Statistik Kabupaten Kepulauan Sitaro Tahun Anggaran 2026
 * Pemenuhan Bukti Dukung Pilar 4 (Akuntabilitas Kinerja) dan Efisiensi Pembangunan ZI-WBK
 */

export type StatusPelaksanaanAnggaran =
  | 'TERENCANA'
  | 'SEDANG_BERJALAN'
  | 'SELESAI';

export interface ItemAnggaranZI {
  id: string;
  kode_mak: string;
  nama_kegiatan: string;
  pilar_id: number; // 1 s.d. 6
  pagu_anggaran_rp: number;
  realisasi_anggaran_rp: number;
  sisa_anggaran_rp: number;
  persentase_penyerapan: number;
  status_pelaksanaan: StatusPelaksanaanAnggaran;
  tanggal_kegiatan: string; // YYYY-MM-DD
  no_spj_atau_bukti: string;
  keterangan: string;
  tahun?: number;
  penanggung_jawab?: string;
}

export interface BudgetSummary {
  total_pagu_rp: number;
  total_realisasi_rp: number;
  total_sisa_rp: number;
  persentase_penyerapan_total: number;
  status_efektivitas: string;
  total_kegiatan: number;
  kegiatan_selesai: number;
  kegiatan_berjalan: number;
  kegiatan_terencana: number;
}

export const PILAR_ZI_INFO: Record<
  number,
  { nama: string; warna: string; deskripsi: string }
> = {
  1: {
    nama: 'Pilar 1: Manajemen Perubahan',
    warna:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    deskripsi:
      'Internalisasi budaya kerja, agen perubahan, dan komitmen pimpinan'
  },
  2: {
    nama: 'Pilar 2: Penataan Tatalaksana',
    warna:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    deskripsi: 'Standarisasi SOP, keterbukaan informasi, dan SPBE terintegrasi'
  },
  3: {
    nama: 'Pilar 3: Penataan Manajemen SDM',
    warna:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    deskripsi:
      'Pengembangan kompetensi, pola mutasi, dan penegakan disiplin ASN'
  },
  4: {
    nama: 'Pilar 4: Penguatan Akuntabilitas',
    warna:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    deskripsi:
      'Keterlibatan pimpinan, efisiensi anggaran, dan pelaporan SAKIP/LAKIP'
  },
  5: {
    nama: 'Pilar 5: Penguatan Pengawasan',
    warna:
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    deskripsi:
      'Pengendalian gratifikasi, kepatuhan LHKPN, dan saluran WBS aktif'
  },
  6: {
    nama: 'Pilar 6: Pelayanan Publik',
    warna:
      'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    deskripsi: 'Inovasi PST, sarana ramah difabel, survei SKM/SPAK berkala'
  }
};

export const STATUS_PELAKSANAAN_LABELS: Record<
  StatusPelaksanaanAnggaran,
  { label: string; badgeClass: string }
> = {
  TERENCANA: {
    label: 'Terencana',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  },
  SEDANG_BERJALAN: {
    label: 'Sedang Berjalan',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
  },
  SELESAI: {
    label: 'Selesai / Terserap Penuh',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
  }
};

/**
 * Format angka ke mata uang Rupiah
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Hitung ringkasan anggaran dan efektivitas penyerapan
 */
export function calculateBudgetSummary(items: ItemAnggaranZI[]): BudgetSummary {
  const total_pagu_rp = items.reduce(
    (acc, curr) => acc + (curr.pagu_anggaran_rp || 0),
    0
  );
  const total_realisasi_rp = items.reduce(
    (acc, curr) => acc + (curr.realisasi_anggaran_rp || 0),
    0
  );
  const total_sisa_rp = total_pagu_rp - total_realisasi_rp;
  const persentase_penyerapan_total =
    total_pagu_rp > 0
      ? Number(((total_realisasi_rp / total_pagu_rp) * 100).toFixed(2))
      : 0;

  let status_efektivitas = 'Perlu Akselerasi';
  if (persentase_penyerapan_total >= 85) {
    status_efektivitas = 'Sangat Efektif (Optimal)';
  } else if (persentase_penyerapan_total >= 65) {
    status_efektivitas = 'Efektif (Sesuai Target On-Track)';
  } else if (persentase_penyerapan_total >= 40) {
    status_efektivitas = 'Cukup Efektif (Progresif)';
  }

  const kegiatan_selesai = items.filter(
    (i) => i.status_pelaksanaan === 'SELESAI'
  ).length;
  const kegiatan_berjalan = items.filter(
    (i) => i.status_pelaksanaan === 'SEDANG_BERJALAN'
  ).length;
  const kegiatan_terencana = items.filter(
    (i) => i.status_pelaksanaan === 'TERENCANA'
  ).length;

  return {
    total_pagu_rp,
    total_realisasi_rp,
    total_sisa_rp,
    persentase_penyerapan_total,
    status_efektivitas,
    total_kegiatan: items.length,
    kegiatan_selesai,
    kegiatan_berjalan,
    kegiatan_terencana
  };
}

/**
 * Mock data realistis 6 pos kegiatan ZI/RB DIPA BPS Kabupaten Kepulauan Sitaro Tahun 2026
 * Mengacu pada program dukungan reformasi birokrasi, PST ramah difabel, survei, seragam, dan pembinaan TPI
 */
export const DEFAULT_MOCK_BUDGET_ITEMS: ItemAnggaranZI[] = [
  {
    id: 'ZI-BDG-2026-001',
    kode_mak: '2899.BMA.006.051.A.521211',
    nama_kegiatan:
      'Sosialisasi & Internalisasi Pembangunan ZI Menuju WBK Seluruh Pegawai BPS Kab. Sitaro',
    pilar_id: 1,
    pagu_anggaran_rp: 8500000,
    realisasi_anggaran_rp: 8500000,
    sisa_anggaran_rp: 0,
    persentase_penyerapan: 100,
    status_pelaksanaan: 'SELESAI',
    tanggal_kegiatan: '2026-02-18',
    no_spj_atau_bukti: 'SPJ-ZI/001/BPS-7108/II/2026',
    keterangan:
      'Konsumsi rapat pembentukan tim kerja, banner komitmen bersama ZI-WBK, dan cetak lembar pakta integritas pegawai',
    tahun: 2026,
    penanggung_jawab: 'Ketua Tim Kerja ZI (Kasubbag Umum)'
  },
  {
    id: 'ZI-BDG-2026-002',
    kode_mak: '2899.BMA.006.052.A.522191',
    nama_kegiatan:
      'Pelaksanaan Survei Kepuasan Masyarakat (SKM) & Survei Persepsi Anti Korupsi (SPAK) Triwulanan PST',
    pilar_id: 6,
    pagu_anggaran_rp: 12000000,
    realisasi_anggaran_rp: 6200000,
    sisa_anggaran_rp: 5800000,
    persentase_penyerapan: 51.67,
    status_pelaksanaan: 'SEDANG_BERJALAN',
    tanggal_kegiatan: '2026-04-10',
    no_spj_atau_bukti: 'SPJ-ZI/004/BPS-7108/IV/2026',
    keterangan:
      'Pencetakan stand QR kuesioner digital, souvenir responden PST triwulan I & II, dan tabulasi indeks kepuasan triwulanan',
    tahun: 2026,
    penanggung_jawab: 'Koordinator Tim Pelayanan Publik (Pilar 6)'
  },
  {
    id: 'ZI-BDG-2026-003',
    kode_mak: '2899.BMA.006.053.A.532111',
    nama_kegiatan:
      'Pengadaan Sarana & Prasarana Ramah Difabel & Kelompok Rentan PST Sitaro',
    pilar_id: 6,
    pagu_anggaran_rp: 14500000,
    realisasi_anggaran_rp: 14500000,
    sisa_anggaran_rp: 0,
    persentase_penyerapan: 100,
    status_pelaksanaan: 'SELESAI',
    tanggal_kegiatan: '2026-03-24',
    no_spj_atau_bukti: 'SPJ-ZI/003/BPS-7108/III/2026',
    keterangan:
      'Pengadaan kursi roda lipat standar medis, guiding block portabel, tongkat tunanetra, dan peremajaan ramp akses kursi roda',
    tahun: 2026,
    penanggung_jawab: 'Pejabat Pembuat Komitmen (PPK) BPS Sitaro'
  },
  {
    id: 'ZI-BDG-2026-004',
    kode_mak: '2899.BMA.006.054.A.521811',
    nama_kegiatan:
      'Pengadaan Seragam, Rompi & Pin Identitas Duta Layanan & Tim Kerja ZI/RB',
    pilar_id: 5,
    pagu_anggaran_rp: 7500000,
    realisasi_anggaran_rp: 7500000,
    sisa_anggaran_rp: 0,
    persentase_penyerapan: 100,
    status_pelaksanaan: 'SELESAI',
    tanggal_kegiatan: '2026-02-28',
    no_spj_atau_bukti: 'SPJ-ZI/002/BPS-7108/II/2026',
    keterangan:
      'Rompi duta layanan PST Sitaro, selempang agen perubahan, pin anti korupsi, dan lanyard identitas tim ZI',
    tahun: 2026,
    penanggung_jawab: 'Koordinator Pilar 1 & Pilar 5'
  },
  {
    id: 'ZI-BDG-2026-005',
    kode_mak: '2899.BMA.006.055.A.524111',
    nama_kegiatan:
      'Pembinaan & Pendampingan Evaluasi Pembangunan ZI oleh Tim Penilai Internal (TPI) BPS Sulut',
    pilar_id: 4,
    pagu_anggaran_rp: 9800000,
    realisasi_anggaran_rp: 5400000,
    sisa_anggaran_rp: 4400000,
    persentase_penyerapan: 55.1,
    status_pelaksanaan: 'SEDANG_BERJALAN',
    tanggal_kegiatan: '2026-05-15',
    no_spj_atau_bukti: 'SPJ-ZI/005/BPS-7108/V/2026',
    keterangan:
      'Perjalanan dinas dan akomodasi tim pembina TPI BPS Provinsi Sulawesi Utara ke Ondong Sitaro serta pelaksanaan desk evaluasi LKE',
    tahun: 2026,
    penanggung_jawab: 'Koordinator Pilar 4 (Akuntabilitas Kinerja)'
  },
  {
    id: 'ZI-BDG-2026-006',
    kode_mak: '2899.BMA.006.056.A.521219',
    nama_kegiatan:
      'Workshop Penguatan Pengendalian Gratifikasi, WBS, & Penilaian Risiko SPIP Satker',
    pilar_id: 5,
    pagu_anggaran_rp: 6500000,
    realisasi_anggaran_rp: 0,
    sisa_anggaran_rp: 6500000,
    persentase_penyerapan: 0,
    status_pelaksanaan: 'TERENCANA',
    tanggal_kegiatan: '2026-08-20',
    no_spj_atau_bukti: '-',
    keterangan:
      'Penyusunan peta risiko korupsi satker dan sosialisasi saluran WBS KemenPAN-RB bagi stakeholder mitra statistik BPS Sitaro',
    tahun: 2026,
    penanggung_jawab: 'Koordinator Pilar 5 (Penguatan Pengawasan)'
  }
];
