/**
 * Tipe Data, Model, dan Mock Data Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi KPK
 * Badan Pusat Statistik (BPS) Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)
 *
 * Regulasi Rujukan:
 * - UU No. 20 Tahun 2001 jo. UU No. 31 Tahun 1999 tentang Tindak Pidana Korupsi
 * - Peraturan KPK No. 2 Tahun 2019 tentang Pelaporan Gratifikasi
 * - Peraturan BPS No. 60 Tahun 2016 tentang Pengendalian Gratifikasi di Lingkungan BPS
 * - Pemenuhan Indikator Komponen Pengawasan (Pilar 5 Zona Integritas Menuju WBK/WBBM)
 */

export type JenisLaporanGratifikasi =
  | 'PENOLAKAN_GRATIFIKASI'
  | 'PENERIMAAN_GRATIFIKASI';

export type BentukGratifikasi =
  | 'UANG_TUNAI'
  | 'BARANG_BINGKISAN'
  | 'VOUCHER_BELANJA'
  | 'FASILITAS_TRANSPORT'
  | 'MAKANAN_KONSUMSI'
  | 'LAINNYA';

export type StatusVerifikasiUPG =
  | 'MENUNGGU_VERIFIKASI'
  | 'TERVERIFIKASI_UPG'
  | 'DITERUSKAN_KE_KPK'
  | 'DITETAPKAN_MILIK_NEGARA'
  | 'DIKEMBALIKAN_KE_PEMBERI';

export interface LaporanGratifikasi {
  id: string;
  nomor_registrasi: string; // contoh: 'UPG-7108-2026-001'
  tanggal_pelaporan: string;
  nama_pelapor: string;
  nip_pelapor: string;
  jabatan_pelapor: string;
  jenis_laporan: JenisLaporanGratifikasi;
  bentuk_gratifikasi: BentukGratifikasi;
  estimasi_nilai_rp: number;
  pemberi_nama: string;
  pemberi_instansi_or_hubungan: string;
  peristiwa_kegiatan: string;
  kronologi_penolakan_atau_penerimaan: string;
  tempat_waktu_kejadian: string;
  status_verifikasi: StatusVerifikasiUPG;
  catatan_tim_upg: string;
  nomor_surat_rekonsiliasi_kpk?: string;
  tanggal_rekonsiliasi?: string;
  lampiran_foto_or_surat_url?: string;
  created_at?: string;
}

export interface UPGSummary {
  total_laporan: number;
  total_penolakan: number;
  total_penerimaan: number;
  total_nilai_dicegah_rp: number;
  status_rekonsiliasi_kpk: string;
  tahun: number;
  semester_aktif: string;
}

export const JENIS_LAPORAN_LABELS: Record<
  JenisLaporanGratifikasi,
  {
    label: string;
    description: string;
    badgeVariant:
      | 'default'
      | 'secondary'
      | 'outline'
      | 'destructive'
      | 'success';
    color: string;
  }
> = {
  PENOLAKAN_GRATIFIKASI: {
    label: 'Penolakan Gratifikasi',
    description:
      'Pencegahan proaktif penyuapan/gratifikasi secara tegas & santun oleh ASN',
    badgeVariant: 'success',
    color:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  },
  PENERIMAAN_GRATIFIKASI: {
    label: 'Penerimaan Gratifikasi',
    description:
      'Penerimaan cinderamata/plakat kedinasan yang dilaporkan untuk penetapan status kepemilikan',
    badgeVariant: 'secondary',
    color:
      'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  }
};

export const BENTUK_GRATIFIKASI_LABELS: Record<
  BentukGratifikasi,
  {
    label: string;
    icon: string;
  }
> = {
  UANG_TUNAI: {
    label: 'Uang Tunai / Amplop / Transfer',
    icon: 'Banknote'
  },
  BARANG_BINGKISAN: {
    label: 'Barang / Parcel / Bingkisan',
    icon: 'Gift'
  },
  VOUCHER_BELANJA: {
    label: 'Voucher Belanja / Diskon Khusus',
    icon: 'Ticket'
  },
  FASILITAS_TRANSPORT: {
    label: 'Fasilitas Transportasi / Akomodasi',
    icon: 'Car'
  },
  MAKANAN_KONSUMSI: {
    label: 'Makanan & Minuman Kadaluarsa Cepat',
    icon: 'Utensils'
  },
  LAINNYA: {
    label: 'Bentuk Lainnya / Plakat Kedinasan',
    icon: 'Award'
  }
};

export const STATUS_VERIFIKASI_LABELS: Record<
  StatusVerifikasiUPG,
  {
    label: string;
    description: string;
    badgeVariant:
      | 'default'
      | 'secondary'
      | 'outline'
      | 'destructive'
      | 'success';
    color: string;
  }
> = {
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    description:
      'Laporan baru masuk dari pegawai, belum ditelaah Tim UPG Satker',
    badgeVariant: 'secondary',
    color:
      'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800'
  },
  TERVERIFIKASI_UPG: {
    label: 'Terverifikasi UPG Satker',
    description:
      'Telah ditelaah Tim Kepatuhan Internal BPS Sitaro dan memenuhi syarat formil/materil',
    badgeVariant: 'default',
    color:
      'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
  },
  DITERUSKAN_KE_KPK: {
    label: 'Diteruskan ke KPK RI',
    description:
      'Telah didaftarkan pada sistem Pelaporan Gratifikasi Online (GOL KPK)',
    badgeVariant: 'outline',
    color:
      'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
  },
  DITETAPKAN_MILIK_NEGARA: {
    label: 'Ditetapkan Milik Negara',
    description:
      'Benda/souvenir kedinasan diinventarisasi sebagai aset BPS Kabupaten Kepulauan Sitaro',
    badgeVariant: 'success',
    color:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  },
  DIKEMBALIKAN_KE_PEMBERI: {
    label: 'Telah Ditolak / Dikembalikan',
    description:
      'Telah ditolak di tempat atau dikembalikan secara resmi kepada pihak pemberi',
    badgeVariant: 'success',
    color:
      'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
  }
};

/**
 * Mock Data Realistis 4 Laporan Penanganan Gratifikasi BPS Kabupaten Kepulauan Sitaro Tahun 2026
 */
export const DEFAULT_MOCK_LAPORAN_GRATIFIKASI: LaporanGratifikasi[] = [
  {
    id: 'upg-001-2026',
    nomor_registrasi: 'UPG-7108-2026-001',
    tanggal_pelaporan: '2026-03-24',
    nama_pelapor: 'Jendri Sasela, S.Si',
    nip_pelapor: '198904122012121002',
    jabatan_pelapor: 'Pranata Komputer Ahli Muda / Ketua Tim TI & Pengadaan',
    jenis_laporan: 'PENOLAKAN_GRATIFIKASI',
    bentuk_gratifikasi: 'BARANG_BINGKISAN',
    estimasi_nilai_rp: 750000,
    pemberi_nama: 'Hendra Wijaya (Direktur Operasional)',
    pemberi_instansi_or_hubungan:
      'CV Siau Mitra Mandiri (Penyedia ATK & Percetakan)',
    peristiwa_kegiatan: 'Menjelang Hari Raya Keagamaan Tahun 2026',
    kronologi_penolakan_atau_penerimaan:
      'Pihak penyedia mengantarkan parcel hari raya ke lobi kantor BPS Kabupaten Kepulauan Sitaro sebagai bingkisan kemitraan. Pelapor langsung menolak bingkisan tersebut di tempat secara santun dan tegas, serta menjelaskan bahwa BPS Sitaro sedang dalam proses pembangunan Zona Integritas menuju WBK yang melarang keras seluruh pegawai menerima bingkisan/parsel dalam bentuk apapun dari pihak ketiga/rekanan.',
    tempat_waktu_kejadian:
      'Lobi Kantor BPS Kabupaten Kepulauan Sitaro, Pukul 10.15 WITA',
    status_verifikasi: 'DIKEMBALIKAN_KE_PEMBERI',
    catatan_tim_upg:
      'Tindakan penolakan telah sesuai SOP Pengendalian Gratifikasi BPS No. 60/2016. Bukti penolakan telah dicatat dalam Buku Register Penolakan Gratifikasi Satker dan dipublikasikan pada papan transparansi UPG.',
    nomor_surat_rekonsiliasi_kpk: 'KPK/UPG-REK/7108/I/2026-014',
    tanggal_rekonsiliasi: '2026-06-30',
    lampiran_foto_or_surat_url: '/docs/upg/BA-Penolakan-Parcel-001.pdf',
    created_at: '2026-03-24T11:00:00Z'
  },
  {
    id: 'upg-002-2026',
    nomor_registrasi: 'UPG-7108-2026-002',
    tanggal_pelaporan: '2026-04-16',
    nama_pelapor: 'Meiske Mangangue, S.E.',
    nip_pelapor: '199208152015032001',
    jabatan_pelapor:
      'Statistisi Ahli Pertama / Petugas Pelayanan Statistik Terpadu (PST)',
    jenis_laporan: 'PENOLAKAN_GRATIFIKASI',
    bentuk_gratifikasi: 'UANG_TUNAI',
    estimasi_nilai_rp: 300000,
    pemberi_nama: 'Robertus Derek (Peneliti Independen / Mahasiswa S2)',
    pemberi_instansi_or_hubungan:
      'Pengguna Layanan Konsultasi Data Mikro PST BPS Sitaro',
    peristiwa_kegiatan:
      'Konsultasi Rekomendasi Statistik & Pembelian Data Mikro Sitaro Dalam Angka',
    kronologi_penolakan_atau_penerimaan:
      'Setelah selesai sesi asistensi pemanfaatan data statistik sektoral di ruang PST, pengguna layanan berniat memberikan amplop berisi uang tunai sebesar Rp 300.000 sebagai "uang terima kasih dan lelah". Petugas PST langsung menolak dengan sopan, mengembalikan amplop seketika, dan menunjukkan Maklumat Pelayanan serta banner "Seluruh Layanan Konsultasi PST BPS Bebas Biaya / Rp 0,-".',
    tempat_waktu_kejadian:
      'Front Office PST BPS Kabupaten Kepulauan Sitaro, Pukul 14.30 WITA',
    status_verifikasi: 'DIKEMBALIKAN_KE_PEMBERI',
    catatan_tim_upg:
      'Penolakan langsung terkonfirmasi melalui CCTV Ruang PST. Pengguna layanan diberikan formulir survei kepuasan IKM/IPAK dan mengapresiasi tinggi integritas petugas PST.',
    nomor_surat_rekonsiliasi_kpk: 'KPK/UPG-REK/7108/I/2026-015',
    tanggal_rekonsiliasi: '2026-06-30',
    lampiran_foto_or_surat_url: '/docs/upg/Form-Tolak-Gratifikasi-PST-002.pdf',
    created_at: '2026-04-16T15:10:00Z'
  },
  {
    id: 'upg-003-2026',
    nomor_registrasi: 'UPG-7108-2026-003',
    tanggal_pelaporan: '2026-05-19',
    nama_pelapor: 'Ronald Salindeho, S.Tr.Stat',
    nip_pelapor: '199501202018011001',
    jabatan_pelapor:
      'Statistisi Ahli Pertama / Tim Nerwilis & Statistik Sektoral',
    jenis_laporan: 'PENERIMAAN_GRATIFIKASI',
    bentuk_gratifikasi: 'LAINNYA',
    estimasi_nilai_rp: 250000,
    pemberi_nama: 'Ir. Frits Takasenseran (Kepala Dinas Pertanian)',
    pemberi_instansi_or_hubungan:
      'Dinas Pertanian dan Ketahanan Pangan Pemkab Sitaro',
    peristiwa_kegiatan:
      'Narasumber Sosialisasi Metadata Statistik Sektoral Pertanian Daerah',
    kronologi_penolakan_atau_penerimaan:
      'Pelapor bertugas resmi sebagai narasumber mewakili Kepala BPS Sitaro berdasarkan Surat Tugas No. B-142/71080/VS.100/05/2026. Di akhir acara, panitia memberikan plakat kayu jati ukir berlogo Pemkab Sitaro dan kain tenun khas daerah sebagai cinderamata resmi instansi. Karena pemberian dilakukan di podium depan forum umum, cinderamata diterima dan langsung diserahkan kepada Tim UPG Satker pada hari kerja yang sama untuk penetapan status.',
    tempat_waktu_kejadian:
      'Aula Bapelitbangda Kabupaten Kepulauan Sitaro, Pukul 12.00 WITA',
    status_verifikasi: 'DITETAPKAN_MILIK_NEGARA',
    catatan_tim_upg:
      'Cinderamata kedinasan resmi tidak dapat ditolak pada saat seremoni. Tim UPG Satker bersama Kuasa Pengguna Anggaran (KPA) menetapkan cinderamata plakat dan kain tenun tersebut dicatat sebagai aset inventaris kantor BPS Sitaro (pajangan ruang lobi PST) dan dilaporkan pada rekonsiliasi semesteran KPK RI.',
    nomor_surat_rekonsiliasi_kpk: 'KPK/UPG-REK/7108/I/2026-016',
    tanggal_rekonsiliasi: '2026-06-30',
    lampiran_foto_or_surat_url: '/docs/upg/BA-Serah-Terima-Plakat-003.pdf',
    created_at: '2026-05-19T14:45:00Z'
  },
  {
    id: 'upg-004-2026',
    nomor_registrasi: 'UPG-7108-2026-004',
    tanggal_pelaporan: '2026-08-10',
    nama_pelapor: 'Novita Kansil, S.E.',
    nip_pelapor: '199111052014022003',
    jabatan_pelapor: 'Pejabat Pembuat Komitmen (PPK) / Analis Tata Usaha',
    jenis_laporan: 'PENOLAKAN_GRATIFIKASI',
    bentuk_gratifikasi: 'VOUCHER_BELANJA',
    estimasi_nilai_rp: 500000,
    pemberi_nama: 'Marketing Hotel & Penginapan Tagulandang Indah',
    pemberi_instansi_or_hubungan:
      'Penyedia Akomodasi Tempat Pelatihan Petugas Survei BPS',
    peristiwa_kegiatan:
      'Reservasi Tempat dan Akomodasi Pelatihan Petugas Survei Lapangan 2026',
    kronologi_penolakan_atau_penerimaan:
      'Pihak manajemen penginapan menawarkan voucher belanja retail senilai Rp 500.000 secara personal kepada PPK sebagai "cashback/gift reservasi instansi". PPK menolak pemberian tersebut dengan menegaskan seluruh transaksi penginapan menggunakan tarif resmi SBM (Standar Biaya Masukan) dan pembayaran dilakukan via transfer CMS/LS tanpa penerimaan komisi pribadi.',
    tempat_waktu_kejadian:
      'Ruang PPK BPS Kabupaten Kepulauan Sitaro, Pukul 11.20 WITA',
    status_verifikasi: 'DIKEMBALIKAN_KE_PEMBERI',
    catatan_tim_upg:
      'Penolakan telah memenuhi standar kepatuhan pengadaan barang/jasa pemerintah. Telah dibuatkan surat imbauan kepada penyedia terkait larangan pemberian suap/gratifikasi/hadiah kepada pegawai BPS Sitaro.',
    nomor_surat_rekonsiliasi_kpk: 'KPK/UPG-REK/7108/II/2026-002',
    tanggal_rekonsiliasi: '2026-12-15',
    lampiran_foto_or_surat_url: '/docs/upg/BA-Penolakan-Voucher-004.pdf',
    created_at: '2026-08-10T13:00:00Z'
  }
];

export function calculateUPGSummary(
  items: LaporanGratifikasi[],
  tahun: number = 2026
): UPGSummary {
  const filtered = items.filter((item) => {
    const reportYear = new Date(item.tanggal_pelaporan).getFullYear();
    return reportYear === tahun;
  });

  const total_laporan = filtered.length;
  const total_penolakan = filtered.filter(
    (item) => item.jenis_laporan === 'PENOLAKAN_GRATIFIKASI'
  ).length;
  const total_penerimaan = filtered.filter(
    (item) => item.jenis_laporan === 'PENERIMAAN_GRATIFIKASI'
  ).length;

  const total_nilai_dicegah_rp = filtered.reduce((acc, curr) => {
    // Nilai gratifikasi yang berhasil dicegah / ditolak atau diamankan menjadi aset negara
    return acc + (Number(curr.estimasi_nilai_rp) || 0);
  }, 0);

  return {
    total_laporan,
    total_penolakan,
    total_penerimaan,
    total_nilai_dicegah_rp,
    status_rekonsiliasi_kpk: 'TERKONSILIASI PENUH (100% NIHIL TEMUAN)',
    tahun,
    semester_aktif: 'Semester I & II Tahun 2026'
  };
}
