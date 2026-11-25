/**
 * Tipe Data, Mock Data & Utilitas Matriks Kepatuhan Disiplin & Kode Etik ASN
 * Badan Pusat Statistik (BPS) Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)
 *
 * Pemenuhan Syarat Mutlak (Threshold Gatekeeper) MenPAN-RB & TPI Menuju Predikat WBK/WBBM
 * Sesuai Peraturan Pemerintah No. 94 Tahun 2021 tentang Disiplin Pegawai Negeri Sipil
 * Pilar 3 (Penataan Sistem Manajemen SDM Aparatur) & Pilar 5 (Penguatan Pengawasan)
 */

export type KategoriDisiplin =
  | 'PEMBINAAN_APEL'
  | 'INTERNALISASI_KODE_ETIK'
  | 'REKONSILIASI_PRESENSI'
  | 'SURAT_KETERANGAN_BEBAS_HUKDIS';

export interface CatatanDisiplinItem {
  id: string;
  tanggal: string;
  kategori: KategoriDisiplin;
  judul: string;
  deskripsi: string;
  tindak_lanjut: string;
  nomor_dokumen: string;
  lampiran_url?: string;
}

export interface DisiplinASNSummary {
  tahun: number;
  total_asn: number;
  hukuman_ringan_count: number;
  hukuman_sedang_count: number; // harus 0
  hukuman_berat_count: number; // harus 0
  pelanggaran_kode_etik_count: number; // harus 0
  status_nihil_hukuman_sedang_berat: boolean;
  persentase_kepatuhan_presensi: number; // e.g. 99.6%
  nomor_surat_keterangan_nihil: string;
  tanggal_surat_keterangan: string;
  pejabat_penandatangan: string;
  jabatan_penandatangan: string;
  nip_penandatangan: string;
  file_sk_nihil_url?: string;
  catatan_audit: string;
  updated_at?: string;
}

export const KATEGORI_DISIPLIN_LABELS: Record<
  KategoriDisiplin,
  {
    label: string;
    badgeVariant:
      | 'default'
      | 'secondary'
      | 'outline'
      | 'destructive'
      | 'success';
    color: string;
  }
> = {
  PEMBINAAN_APEL: {
    label: 'Pembinaan Apel Pagi',
    badgeVariant: 'secondary',
    color:
      'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
  },
  INTERNALISASI_KODE_ETIK: {
    label: 'Internalisasi Kode Etik',
    badgeVariant: 'default',
    color:
      'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
  },
  REKONSILIASI_PRESENSI: {
    label: 'Rekonsiliasi Presensi',
    badgeVariant: 'outline',
    color:
      'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  },
  SURAT_KETERANGAN_BEBAS_HUKDIS: {
    label: 'SK Bebas Hukdis',
    badgeVariant: 'success',
    color:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  }
};

export const DEFAULT_MOCK_DISIPLIN_SUMMARY: DisiplinASNSummary = {
  tahun: 2026,
  total_asn: 18,
  hukuman_ringan_count: 0,
  hukuman_sedang_count: 0,
  hukuman_berat_count: 0,
  pelanggaran_kode_etik_count: 0,
  status_nihil_hukuman_sedang_berat: true,
  persentase_kepatuhan_presensi: 99.6,
  nomor_surat_keterangan_nihil: 'B-089/71090/KP.320/01/2026',
  tanggal_surat_keterangan: '2026-01-15',
  pejabat_penandatangan: 'Inke Margareth Tambeo, SST., M.Ec.Dev.',
  jabatan_penandatangan:
    'Kepala Badan Pusat Statistik Kabupaten Kepulauan Sitaro',
  nip_penandatangan: '198403232007012003',
  file_sk_nihil_url:
    'https://sitarokab.bps.go.id/docs/sk-nihil-hukdis-2026.pdf',
  catatan_audit:
    'Berdasarkan audit berkala Tim Kepatuhan Internal BPS Kabupaten Kepulauan Sitaro dan verifikasi SIMPEG/Presensi Nasional, seluruh 18 ASN BPS Sitaro bersih dari sanksi hukuman disiplin sedang maupun berat sebagaimana diatur dalam PP No. 94 Tahun 2021, sehingga memenuhi syarat mutlak penilaian WBK/WBBM Tahun 2026.',
  updated_at: '2026-01-15T08:30:00Z'
};

export const DEFAULT_MOCK_CATATAN_DISIPLIN: CatatanDisiplinItem[] = [
  {
    id: 'disp-2026-001',
    tanggal: '2026-01-15',
    kategori: 'SURAT_KETERANGAN_BEBAS_HUKDIS',
    judul:
      'Penerbitan Surat Keterangan Nihil Hukuman Disiplin Sedang/Berat Tahun 2026',
    deskripsi:
      'Penerbitan Surat Keterangan resmi oleh Kepala BPS Kabupaten Kepulauan Sitaro Nomor B-089/71090/KP.320/01/2026 yang menerangkan bahwa seluruh 18 ASN BPS Sitaro bebas dari hukuman disiplin tingkat sedang dan berat.',
    tindak_lanjut:
      'Dokumen diarsipkan dalam e-Repository Bukti Dukung Zona Integritas Pilar 3 (Penataan SDM) dan Pilar 5 (Penguatan Pengawasan) sebagai bukti ambang batas mutlak WBK.',
    nomor_dokumen: 'B-089/71090/KP.320/01/2026',
    lampiran_url: 'https://sitarokab.bps.go.id/docs/sk-nihil-hukdis-2026.pdf'
  },
  {
    id: 'disp-2026-002',
    tanggal: '2026-01-22',
    kategori: 'INTERNALISASI_KODE_ETIK',
    judul:
      'Sosialisasi & Internalisasi Core Values ASN BerAKHLAK dan Netralitas ASN 2026',
    deskripsi:
      'Internalisasi nilai-nilai BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif) serta penguatan kode etik dan netralitas pegawai dalam pelaksanaan sensus dan survei resmi.',
    tindak_lanjut:
      'Seluruh 18 ASN menandatangani Pakta Integritas dan Ikrar Netralitas Pegawai BPS Kabupaten Kepulauan Sitaro.',
    nomor_dokumen: 'BA-004/71090/KP.330/01/2026',
    lampiran_url:
      'https://sitarokab.bps.go.id/docs/ba-internalisasi-kode-etik-2026.pdf'
  },
  {
    id: 'disp-2026-003',
    tanggal: '2026-01-12',
    kategori: 'PEMBINAAN_APEL',
    judul:
      'Apel Pagi Gabungan: Penguatan Disiplin Jam Kerja & Integritas Kerja Pegawai',
    deskripsi:
      'Pengarahan langsung oleh Kepala BPS Kabupaten Kepulauan Sitaro mengenai kepatuhan jam masuk dan pulang kerja, etika berkomunikasi kepada responden data, serta kewajiban pengisian Logbook Kinerja harian.',
    tindak_lanjut:
      'Monitoring berkala mingguan oleh Subbagian Umum terhadap logbook dan kehadiran seluruh staf teknis dan fungsional.',
    nomor_dokumen: 'B-012/71090/KP.310/01/2026',
    lampiran_url:
      'https://sitarokab.bps.go.id/docs/notula-apel-pagi-12-jan-2026.pdf'
  },
  {
    id: 'disp-2026-004',
    tanggal: '2026-02-02',
    kategori: 'REKONSILIASI_PRESENSI',
    judul:
      'Rapat Rekonsiliasi Presensi Bulanan & Verifikasi Ketidakhadiran Periode Januari 2026',
    deskripsi:
      'Rekonsiliasi data kehadiran elektronik (Mobile Absensi & Fingerprint BPS) pegawai BPS Sitaro periode Januari 2026. Capaian tingkat kepatuhan mencapai 99.6% tanpa adanya alpha maupun keterlambatan tanpa surat tugas.',
    tindak_lanjut:
      'Hasil rekonsiliasi diteruskan ke Bagian Kepegawaian BPS Provinsi Sulawesi Utara untuk penghitungan Tukin tepat waktu.',
    nomor_dokumen: 'ND-028/71090/KP.320/02/2026',
    lampiran_url:
      'https://sitarokab.bps.go.id/docs/nd-rekonsiliasi-presensi-jan-2026.pdf'
  }
];

export function validateDisiplinNihil(summary: DisiplinASNSummary): {
  isEligibleWBK: boolean;
  alasan: string;
} {
  if (summary.hukuman_sedang_count > 0 || summary.hukuman_berat_count > 0) {
    return {
      isEligibleWBK: false,
      alasan: `Terdapat catatan hukuman disiplin (${summary.hukuman_sedang_count} sedang, ${summary.hukuman_berat_count} berat). Syarat mutlak kelolosan WBK/WBBM gugur berdasarkan PermenPAN-RB No. 90/2021.`
    };
  }

  if (summary.pelanggaran_kode_etik_count > 0) {
    return {
      isEligibleWBK: false,
      alasan: `Terdapat ${summary.pelanggaran_kode_etik_count} catatan pelanggaran kode etik aktif yang belum tuntas direhabilitasi.`
    };
  }

  return {
    isEligibleWBK: true,
    alasan:
      '100% Memenuhi Syarat Mutlak WBK/WBBM (Nihil Hukuman Disiplin Sedang/Berat & Nihil Pelanggaran Kode Etik ASN).'
  };
}
