export type KategoriFasilitas =
  | 'FISIK_AKSESIBILITAS'
  | 'ALAT_BANTU'
  | 'RUANG_KHUSUS'
  | 'DOKUMEN_FORMAT_RAMAH'
  | 'SDM_PENDAMPING';

export type KondisiFasilitas = 'SANGAT_BAIK' | 'BAIK' | 'PERLU_PERBAIKAN';

export type PredikatInklusivitas =
  | 'A+ (Sangat Inklusif)'
  | 'A (Inklusif)'
  | 'B (Cukup)';

export interface FasilitasDifabelItem {
  id: string;
  nama_fasilitas: string;
  kategori: KategoriFasilitas;
  kondisi: KondisiFasilitas;
  lokasi_spesifik: string;
  deskripsi: string;
  standar_regulasi: string;
  foto_dokumentasi_url: string;
  is_tersedia: boolean;
  terakhir_diperiksa: string; // YYYY-MM-DD
  petugas_pemeriksa: string;
  spesifikasi_teknis?: string;
}

export interface FasilitasSummary {
  total_fasilitas: number;
  tersedia_count: number;
  persentase_pemenuhan: number; // e.g. 100
  predikat_inklusivitas: PredikatInklusivitas;
  kategori_breakdown: Record<
    KategoriFasilitas,
    { total: number; tersedia: number }
  >;
  kondisi_breakdown: Record<KondisiFasilitas, number>;
}

export const KATEGORI_FASILITAS_LABELS: Record<
  KategoriFasilitas,
  { label: string; deskripsi: string; color: string; badgeClass: string }
> = {
  FISIK_AKSESIBILITAS: {
    label: 'Fisik Aksesibilitas',
    deskripsi:
      'Jalur pemandu, ramp miring, selasar anti-selip, & pegangan rambat',
    color: 'emerald',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
  },
  ALAT_BANTU: {
    label: 'Alat Bantu Fisik & Audio',
    deskripsi:
      'Kursi roda ergonomis, alat bantu dengar digital, & kacamata pembesar',
    color: 'blue',
    badgeClass:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
  },
  RUANG_KHUSUS: {
    label: 'Ruang Fasilitas Khusus',
    deskripsi:
      'Ruang laktasi/menyusui nyaman & toilet khusus penyandang disabilitas/lansia',
    color: 'purple',
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
  },
  DOKUMEN_FORMAT_RAMAH: {
    label: 'Dokumen & Format Ramah',
    deskripsi:
      'Buku profil & formulir layanan format huruf Braille, audio, dan huruf besar',
    color: 'amber',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
  },
  SDM_PENDAMPING: {
    label: 'SDM Pendamping & JBI',
    deskripsi:
      'Petugas pendamping inklusif & juru bahasa isyarat tersertifikasi pelatihan',
    color: 'indigo',
    badgeClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
  }
};

export const KONDISI_FASILITAS_LABELS: Record<
  KondisiFasilitas,
  { label: string; badgeClass: string; dotColor: string }
> = {
  SANGAT_BAIK: {
    label: 'Sangat Baik',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
    dotColor: 'bg-emerald-500'
  },
  BAIK: {
    label: 'Baik',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
    dotColor: 'bg-blue-500'
  },
  PERLU_PERBAIKAN: {
    label: 'Perlu Perbaikan',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
    dotColor: 'bg-amber-500'
  }
};

/**
 * Kalkulasi ringkasan fasilitas dan tingkat inklusivitas
 */
export function calculateFasilitasSummary(
  items: FasilitasDifabelItem[]
): FasilitasSummary {
  const total_fasilitas = items.length;
  const tersedia_count = items.filter((f) => f.is_tersedia).length;
  const persentase_pemenuhan =
    total_fasilitas > 0
      ? Math.round((tersedia_count / total_fasilitas) * 100)
      : 0;

  let predikat_inklusivitas: PredikatInklusivitas = 'B (Cukup)';
  if (persentase_pemenuhan >= 95) {
    predikat_inklusivitas = 'A+ (Sangat Inklusif)';
  } else if (persentase_pemenuhan >= 80) {
    predikat_inklusivitas = 'A (Inklusif)';
  }

  const kategori_breakdown: Record<
    KategoriFasilitas,
    { total: number; tersedia: number }
  > = {
    FISIK_AKSESIBILITAS: { total: 0, tersedia: 0 },
    ALAT_BANTU: { total: 0, tersedia: 0 },
    RUANG_KHUSUS: { total: 0, tersedia: 0 },
    DOKUMEN_FORMAT_RAMAH: { total: 0, tersedia: 0 },
    SDM_PENDAMPING: { total: 0, tersedia: 0 }
  };

  const kondisi_breakdown: Record<KondisiFasilitas, number> = {
    SANGAT_BAIK: 0,
    BAIK: 0,
    PERLU_PERBAIKAN: 0
  };

  items.forEach((item) => {
    if (kategori_breakdown[item.kategori]) {
      kategori_breakdown[item.kategori].total += 1;
      if (item.is_tersedia) {
        kategori_breakdown[item.kategori].tersedia += 1;
      }
    }
    if (kondisi_breakdown[item.kondisi] !== undefined) {
      kondisi_breakdown[item.kondisi] += 1;
    }
  });

  return {
    total_fasilitas,
    tersedia_count,
    persentase_pemenuhan,
    predikat_inklusivitas,
    kategori_breakdown,
    kondisi_breakdown
  };
}

/**
 * 8 Mock Data Realistis Fasilitas Ramah Kelompok Rentan & Difabel BPS Kab. Kepulauan Sitaro Tahun 2026
 */
export const DEFAULT_MOCK_FASILITAS_DIFABEL: FasilitasDifabelItem[] = [
  {
    id: 'FAS-001',
    nama_fasilitas: 'Jalur Pemandu Taktil (Guiding Block)',
    kategori: 'FISIK_AKSESIBILITAS',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik:
      'Selasar Pelataran Depan menuju Pintu Masuk Utama Lobby PST Kantor BPS Sitaro',
    deskripsi:
      'Ubin taktil kuning cerah dengan tekstur garis lurus pengarah (go) dan kubah titik peringatan (stop) bersertifikasi SNI untuk memandu penyandang disabilitas netra & gangguan penglihatan dengan aman tanpa hambatan fisik.',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 & Permen PUPR No. 14/PRT/M/2017 tentang Persyaratan Kemudahan Bangunan Gedung',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-20',
    petugas_pemeriksa: 'Yosep Tatengkeng, S.ST',
    spesifikasi_teknis:
      'Keramik taktil warna kuning terang (warning yellow) 30x30 cm, ketahanan aus tinggi, tanpa sudut tajam, anti-slip.'
  },
  {
    id: 'FAS-002',
    nama_fasilitas: 'Ramp Miring & Handrail Akses Kursi Roda',
    kategori: 'FISIK_AKSESIBILITAS',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik:
      'Akses Pintu Masuk Utama Depan Gedung BPS Kabupaten Kepulauan Sitaro',
    deskripsi:
      'Jalur landai akses kursi roda dengan kemiringan terkontrol (< 6 derajat) dilengkapi pegangan rambat ganda (handrail stainless steel) setinggi 65 cm dan 80 cm serta tepi pengaman (curb) 10 cm pencegah roda tergelincir.',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 & UU No. 8/2016 Pasal 98 tentang Aksesibilitas Fasilitas Publik',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-18',
    petugas_pemeriksa: 'Megawaty Salindeho, S.Si',
    spesifikasi_teknis:
      'Lebar bersih ramp 120 cm, kemiringan 1:12, permukaan cor beton beralur anti-licin, handrail pipa stainless steel SUS 304.'
  },
  {
    id: 'FAS-003',
    nama_fasilitas: 'Kursi Roda Standard & Ergonomis PST',
    kategori: 'ALAT_BANTU',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik:
      'Foyer Pintu Masuk Ruang Pelayanan Statistik Terpadu (PST)',
    deskripsi:
      'Kursi roda lipat medis berbobot ringan dengan bantalan ergonomis, sabuk pengaman dada-pinggul, rem ganda manual, serta pijakan kaki lipat untuk pengunjung lansia, difabel daksa, atau pengguna berdaya tahan fisik terbatas.',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 & Surat Edaran MenPAN-RB No. 66/2020 tentang Penyediaan Sarana Prasarana Ramah Difabel',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-22',
    petugas_pemeriksa: 'Christian Makahinda',
    spesifikasi_teknis:
      'Rangka aluminium alloy kuat kapasitas beban 120 kg, ban mati PU padat (bebas bocor), sandaran tangan empuk.'
  },
  {
    id: 'FAS-004',
    nama_fasilitas: "Ruang Laktasi & Menyusui Nyaman (Mother's Room)",
    kategori: 'RUANG_KHUSUS',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik: 'Ruang Khusus Privat Sayap Kiri Koridor PST Lantai 1',
    deskripsi:
      'Ruangan tertutup privat berpenyejuk udara (AC), dilengkapi sofa laktasi empuk berpenyangga lengan, meja ganti popok higienis (baby changing station), wastafel air mengalir, sabun cair antiseptik, dispenser air hangat, dan lemari pendingin ASI.',
    standar_regulasi:
      'Permenkes No. 15/2013 tentang Tata Cara Penyediaan Fasilitas Khusus Menyusui & PermenPAN-RB No. 90/2021',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1594824813639-652a22285e6a?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-19',
    petugas_pemeriksa: 'Megawaty Salindeho, S.Si',
    spesifikasi_teknis:
      'Luas ruangan 3x3 meter, ventilasi & exhaust fan memadai, soket listrik untuk pompa ASI elektrik, privasi pintu berkunci indikator.'
  },
  {
    id: 'FAS-005',
    nama_fasilitas: 'Toilet Khusus Ramah Difabel & Lansia',
    kategori: 'RUANG_KHUSUS',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik: 'Koridor Sayap Kanan Akses PST Lantai 1',
    deskripsi:
      'Kamar mandi berukuran lega dengan radius putar kursi roda (150 cm), pintu geser lebar 90 cm dengan handel tuas, kloset duduk dengan pegangan pengaman (grab bar) lipat berbentuk L, tombol panggilan darurat (panic alarm button), dan lantai anti-slip.',
    standar_regulasi:
      'Permen PUPR No. 14/PRT/M/2017 & PermenPAN-RB No. 90/2021 Spesifikasi Toilet Aksesibel Instansi Pemerintah',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-17',
    petugas_pemeriksa: 'Yosep Tatengkeng, S.ST',
    spesifikasi_teknis:
      'Dimensi 2,2 m x 2,0 m, tombol panic alarm terkoneksi sirene meja resepsionis, wastafel gantung tinggi 75 cm mudah dijangkau kursi roda.'
  },
  {
    id: 'FAS-006',
    nama_fasilitas: 'Buku Profil & Formulir Layanan Huruf Braille',
    kategori: 'DOKUMEN_FORMAT_RAMAH',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik:
      'Meja Resepsionis PST & Lemari Khusus Aksesibilitas Publik',
    deskripsi:
      'Buku ringkasan indikator strategis Sitaro Dalam Angka, Maklumat Pelayanan, Standar Pelayanan PST, formulir registrasi tamu, dan formulir permohonan rekomendasi kegiatan statistik dalam format cetak huruf Braille emboss standar BPS RI.',
    standar_regulasi:
      'UU No. 8/2016 Pasal 19 (Hak Akses Komunikasi & Informasi) & PermenPAN-RB No. 90/2021',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-21',
    petugas_pemeriksa: 'Geraldy Tamuntuan, S.Tr.Stat',
    spesifikasi_teknis:
      'Kertas karton braille gramatur 150 gsm dengan dot emboss presisi, dilengkapi terjemahan teks cetak alfabet latin untuk pendamping.'
  },
  {
    id: 'FAS-007',
    nama_fasilitas:
      'Perangkat Alat Bantu Dengar Digital (Wireless Hearing Enhancer)',
    kategori: 'ALAT_BANTU',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik:
      'Meja Konsultasi Statistik No. 01 (Meja Prioritas Inklusif)',
    deskripsi:
      'Perangkat mikrofon pengarah nirkabel dan earphone/headphone penguat frekuensi vokal digital dengan peredam derau suara latar (noise reduction) untuk membantu pengunjung tuna rungu/tuli atau lansia dengan penurunan pendengaran.',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 Sarana Komunikasi Audio-Visual Kelompok Rentan',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-16',
    petugas_pemeriksa: 'Christian Makahinda',
    spesifikasi_teknis:
      'Digital sound amplifier frequency range 200 Hz - 5000 Hz, output max 125 dB dengan volume limiter pencegah distorsi suara.'
  },
  {
    id: 'FAS-008',
    nama_fasilitas:
      'Petugas Pendamping Ramah Disabilitas & Juru Bahasa Isyarat (JBI)',
    kategori: 'SDM_PENDAMPING',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik: 'Front Office Pelayanan PST & Unit Pendampingan Prioritas',
    deskripsi:
      'Petugas ASN PST BPS Kabupaten Kepulauan Sitaro yang telah dibekali sertifikasi orientasi etika berinteraksi dengan penyandang disabilitas serta penguasaan kosa kata dasar Bahasa Isyarat Indonesia (BISINDO) untuk melayani konsultasi statistik terpadu.',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 Poin Kesiapan Kompetensi SDM Pelayanan Ramah Kelompok Rentan',
    foto_dokumentasi_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    is_tersedia: true,
    terakhir_diperiksa: '2026-02-23',
    petugas_pemeriksa: 'Geraldy Tamuntuan, S.Tr.Stat',
    spesifikasi_teknis:
      '2 orang aparatur PST bersertifikat Pelatihan Hospitality & Inklusivitas Pelayanan Publik BPS RI.'
  }
];
