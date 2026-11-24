/**
 * Kamus & Glosarium Digital ZI Terpadu
 * Sumber Acuan: Peraturan Menteri PAN-RB No. 90 Tahun 2021 & Juknis ZI BPS RI
 * BPS Kabupaten Kepulauan Siau Tagulandang Biaro
 */

export type GlosariumKategori =
  | 'Kelembagaan'
  | 'Komponen Pengungkit'
  | 'Komponen Hasil'
  | 'Penilaian & Predikat'
  | 'Singkatan Resmi';

export interface GlosariumItem {
  id: string;
  istilah: string;
  kepanjangan?: string;
  kategori: GlosariumKategori;
  definisi: string;
  dasarHukum: string;
  pilar?: string;
  highlight?: string;
}

export const GLOSARIUM_KATEGORI_LIST: Array<'Semua' | GlosariumKategori> = [
  'Semua',
  'Kelembagaan',
  'Komponen Pengungkit',
  'Komponen Hasil',
  'Penilaian & Predikat',
  'Singkatan Resmi'
];

export const GLOSARIUM_LIST: GlosariumItem[] = [
  {
    id: 'zi',
    istilah: 'Zona Integritas (ZI)',
    kepanjangan: 'Zona Integritas',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Sebutan atau predikat yang diberikan kepada instansi pemerintah yang pimpinan dan jajarannya mempunyai komitmen untuk mewujudkan Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM) melalui reformasi birokrasi, khususnya dalam hal pencegahan korupsi dan peningkatan kualitas pelayanan publik.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Komitmen Pimpinan & Satker'
  },
  {
    id: 'wbk',
    istilah: 'Wilayah Bebas dari Korupsi (WBK)',
    kepanjangan: 'Wilayah Bebas dari Korupsi',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Predikat yang diberikan kepada suatu unit kerja/satuan kerja yang memenuhi sebagian besar kriteria manajemen perubahan, penataan tatalaksana, sistem manajemen SDM, penguatan pengawasan, dan penguatan akuntabilitas kinerja dengan total nilai evaluasi akhir minimal 75.00 dan nilai komponen pengungkit minimal 45.00.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Target Utama Satker (Skor >= 75.00)'
  },
  {
    id: 'wbbm',
    istilah: 'WBBM',
    kepanjangan: 'Wilayah Birokrasi Bersih dan Melayani',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Predikat lanjutan yang diberikan kepada unit kerja yang sebelumnya telah berhasil meraih predikat WBK dan secara berkelanjutan mempertahankan komitmen integritas serta mewujudkan inovasi pelayanan prima dengan total nilai evaluasi akhir minimal 85.00.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Predikat Tertinggi (Skor >= 85.00)'
  },
  {
    id: 'pmprb',
    istilah: 'PMPRB',
    kepanjangan: 'Penilaian Mandiri Pelaksanaan Reformasi Birokrasi',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Instrumen dan model penilaian mandiri terstruktur secara elektronik yang digunakan oleh instansi pemerintah dan BPS RI untuk mengukur kemajuan serta keberhasilan pelaksanaan agenda reformasi birokrasi secara transparan, terpadu, dan akuntabel.',
    dasarHukum: 'PermenPAN-RB No. 26/2020 & Juknis BPS RI',
    highlight: 'Evaluasi Mandiri Terpadu'
  },
  {
    id: 'lke',
    istilah: 'LKE (Lembar Kerja Evaluasi)',
    kepanjangan: 'Lembar Kerja Evaluasi',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Instrumen kerja evaluatif standar yang memuat daftar pertanyaan indikator, kriteria pembobotan nilai, opsi pemenuhan, dan panduan bukti dukung fisik/digital yang wajib dipenuhi oleh satker dalam pembangunan Zona Integritas.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Kertas Kerja Baku Penilaian'
  },
  {
    id: 'tpi',
    istilah: 'TPI BPS RI',
    kepanjangan: 'Tim Penilai Internal Badan Pusat Statistik RI',
    kategori: 'Kelembagaan',
    definisi:
      'Tim yang dibentuk oleh Inspektorat Utama BPS RI untuk melakukan pembinaan, asistensi, reviu berkala bukti dukung LKE, desk evaluation, dan verifikasi lapangan terhadap unit kerja BPS yang diusulkan meraih predikat WBK/WBBM.',
    dasarHukum: 'Peraturan BPS RI & Pedoman ZI BPS',
    highlight: 'Inspektorat Utama BPS RI'
  },
  {
    id: 'tpn',
    istilah: 'TPN KemenPAN-RB',
    kepanjangan: 'Tim Penilai Nasional Reformasi Birokrasi',
    kategori: 'Kelembagaan',
    definisi:
      'Tim penilai lintas instansi tingkat nasional yang dipimpin oleh Kementerian PAN-RB bersama unsur Komisi Pemberantasan Korupsi (KPK) dan Ombudsman Republik Indonesia (ORI) untuk melakukan evaluasi faktual dan menetapkan predikat resmi WBK/WBBM.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'KemenPAN-RB + KPK + Ombudsman'
  },
  {
    id: 'tpp',
    istilah: 'TPP (Tim Penilai Pendahuluan)',
    kepanjangan: 'Tim Penilai Pendahuluan Tingkat Provinsi',
    kategori: 'Kelembagaan',
    definisi:
      'Tim penilai pada tingkat BPS Provinsi yang dibentuk untuk menyeleksi kelayakan administratif dan membina kesiapan BPS Kabupaten/Kota sebelum diajukan ke Tim Penilai Internal (TPI) BPS RI.',
    dasarHukum: 'Petunjuk Teknis Evaluasi ZI BPS',
    highlight: 'Seleksi Awal BPS Provinsi'
  },
  {
    id: 'spip',
    istilah: 'SPIP (Sistem Pengendalian Intern Pemerintah)',
    kepanjangan: 'Sistem Pengendalian Intern Pemerintah',
    kategori: 'Komponen Pengungkit',
    definisi:
      'Proses integral yang menyatu pada tindakan dan kegiatan yang dilakukan secara terus menerus oleh pimpinan dan seluruh pegawai untuk memberikan keyakinan memadai atas tercapainya tujuan organisasi melalui kegiatan yang efektif dan efisien, keandalan pelaporan keuangan, pengamanan aset negara, dan ketaatan terhadap peraturan.',
    dasarHukum: 'PP No. 60 Tahun 2008 & Pilar 5 Pengawasan',
    highlight: 'Matriks Mitigasi Risiko Pilar 5'
  },
  {
    id: 'capi',
    istilah: 'CAPI (Computer-Assisted Personal Interviewing)',
    kepanjangan: 'Computer-Assisted Personal Interviewing',
    kategori: 'Singkatan Resmi',
    definisi:
      'Metode pengumpulan data sensus dan survei statistik BPS berbasis aplikasi elektronik (gawai/tablet) yang menggantikan kuesioner kertas (PAPI) guna meningkatkan validitas data, mempercepat transmisi data, dan meminimalisir manipulasi hasil lapangan.',
    dasarHukum: 'Pilar 2 Penataan Tatalaksana BPS',
    highlight: 'Modernisasi Statistik Digital'
  },
  {
    id: 'pst',
    istilah: 'PST (Pelayanan Statistik Terpadu)',
    kepanjangan: 'Pelayanan Statistik Terpadu',
    kategori: 'Kelembagaan',
    definisi:
      'Gerai pelayanan satu pintu di BPS Kabupaten Kepulauan Sitaro yang melayani seluruh kebutuhan pengguna data, mulai dari konsultasi statistik, permohonan data mikro, rekomendasi kegiatan statistik sektoral, hingga perpustakaan publik.',
    dasarHukum: 'Pilar 6 Kualitas Pelayanan Publik',
    highlight: 'Front Office & Konsultasi Data'
  },
  {
    id: 'ikm',
    istilah: 'IKM (Indeks Kepuasan Masyarakat)',
    kepanjangan: 'Indeks Kepuasan Masyarakat',
    kategori: 'Komponen Hasil',
    definisi:
      'Hasil pengukuran kuantitatif berkala dari survei kepuasan masyarakat terhadap mutu penyelenggaraan pelayanan publik di PST BPS Kabupaten Kepulauan Sitaro berdasarkan 9 indikator pelayanan PermenPAN-RB No. 14/2017.',
    dasarHukum: 'PermenPAN-RB No. 14/2017 & Komponen Hasil ZI',
    highlight: 'Capaian Mutu Layanan (Skala 1 - 4)'
  },
  {
    id: 'ipak',
    istilah: 'IPAK (Indeks Persepsi Anti Korupsi)',
    kepanjangan: 'Indeks Persepsi Anti Korupsi',
    kategori: 'Komponen Hasil',
    definisi:
      'Indikator survei eksternal yang mengukur tingkat integritas unit kerja serta memastikan bersihnya proses pelayanan dari pungutan liar, suap, percaloan, dan gratifikasi oleh pengguna layanan publik.',
    dasarHukum: 'PermenPAN-RB No. 90/2021 & Komponen Hasil ZI',
    highlight: 'Syarat Mutlak Bebas Pungli & KKN'
  },
  {
    id: 'reviu_berjenjang',
    istilah: 'Reviu Berjenjang (Hierarchical QA)',
    kepanjangan: 'Alur Verifikasi Bertingkat Internal',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Mekanisme penjaminan mutu berjenjang pada aplikasi REBO di mana bukti dukung yang diunggah Operator Pilar diverifikasi oleh Koordinator Pilar, divalidasi oleh Tim Verifikator Internal, dan disahkan oleh Pimpinan sebelum diajukan ke portal ZIAPP Pusat.',
    dasarHukum: 'SOP Penjaminan Mutu LKE REBO',
    highlight: 'Operator -> Koordinator -> Verifikator'
  },
  {
    id: 'heuristik_qa',
    istilah: 'Heuristik QA (Quality Assurance Checklist)',
    kepanjangan: 'Pemeriksaan Otomatis Kelengkapan Bukti',
    kategori: 'Penilaian & Predikat',
    definisi:
      'Algoritma validasi otomatis pada sistem REBO yang mendeteksi kelengkapan minimal 5 dokumen standar baku (Undangan, Daftar Hadir, Notula, Laporan, Dokumentasi) serta memeriksa status izin Google Drive (publik) sebelum berkas disetujui.',
    dasarHukum: 'Pre-Audit QA Guard REBO BPS Sitaro',
    highlight: 'Validasi 5 Dokumen Kunci & Link GDrive'
  },
  {
    id: 'pengungkit',
    istilah: 'Komponen Pengungkit (Leverage)',
    kepanjangan: 'Komponen Pengungkit Tata Kelola Internal (60%)',
    kategori: 'Komponen Pengungkit',
    definisi:
      'Kelompok penilaian pembangunan ZI dengan bobot 60% yang mencakup 6 pilar utama: Manajemen Perubahan, Penataan Tatalaksana, Manajemen SDM, Penguatan Akuntabilitas, Penguatan Pengawasan, dan Peningkatan Pelayanan Publik.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Bobot 60% (Pilar 1 s.d. Pilar 6)'
  },
  {
    id: 'hasil',
    istilah: 'Komponen Hasil (Result)',
    kepanjangan: 'Komponen Hasil Kinerja & Pelayanan (40%)',
    kategori: 'Komponen Hasil',
    definisi:
      'Kelompok penilaian pembangunan ZI dengan bobot 40% yang menilai dampak nyata reformasi birokrasi, diukur melalui persepsi kepuasan layanan (IKM), persepsi anti korupsi (IPAK), serta capaian kinerja organisasi BPS.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Bobot 40% (Survei Eksternal & Capaian Kinerja)'
  },
  {
    id: 'pemenuhan',
    istilah: 'Area Pemenuhan (Fulfillment Area)',
    kepanjangan: 'Kepatuhan Regulasi & Kelengkapan Administrasi',
    kategori: 'Komponen Pengungkit',
    definisi:
      'Sub-komponen pengungkit yang menilai kepatuhan formal terhadap regulasi dasar, ketersediaan SK pembentukan tim kerja, dokumen rencana aksi, SOP operasional, dan instrumen formal birokrasi.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Kepatuhan Regulasi Dasar & SOP'
  },
  {
    id: 'reform',
    istilah: 'Area Reform (Reform Area)',
    kepanjangan: 'Inovasi, Dampak & Implementasi Berkelanjutan',
    kategori: 'Komponen Pengungkit',
    definisi:
      'Sub-komponen pengungkit yang menilai kualitas implementasi nyata, efektivitas perbaikan tata kelola, inovasi terobosan pelayanan, efisiensi proses bisnis, serta keberlanjutan perubahan budaya kerja ASN BerAKHLAK.',
    dasarHukum: 'PermenPAN-RB No. 90 Tahun 2021',
    highlight: 'Inovasi Terobosan & Dampak Perubahan'
  },
  {
    id: 'benturan_kepentingan',
    istilah: 'Benturan Kepentingan (Conflict of Interest)',
    kepanjangan: 'Konflik Kepentingan Tugas Kedinasan',
    kategori: 'Komponen Pengungkit',
    definisi:
      'Kondisi di mana pejabat atau pegawai memiliki atau patut diduga memiliki kepentingan pribadi terhadap setiap penggunaan wewenang kedinasan sehingga berpotensi mempengaruhi netralitas, independensi, dan objektivitas keputusan.',
    dasarHukum: 'PermenPAN-RB No. 37/2012 & Pilar 5 Pengawasan',
    highlight: 'Netralitas & Integritas Keputusan Dinas'
  },
  {
    id: 'upg',
    istilah: 'UPG (Unit Pengendalian Gratifikasi)',
    kepanjangan: 'Unit Pengendalian Gratifikasi BPS',
    kategori: 'Kelembagaan',
    definisi:
      'Unit pelaksana di lingkungan BPS yang bertugas mengelola sistem pengendalian gratifikasi, memproses pelaporan penerimaan atau penolakan gratifikasi, serta menyosialisasikan integritas anti suap kepada mitra dan pegawai.',
    dasarHukum: 'Peraturan KPK No. 2/2019 & Juknis UPG BPS',
    highlight: 'Pengendalian Gratifikasi & Anti Suap'
  },
  {
    id: 'wbs',
    istilah: 'WBS (Whistleblowing System)',
    kepanjangan: 'Sistem Pelaporan Pelanggaran Rahasia',
    kategori: 'Singkatan Resmi',
    definisi:
      'Aplikasi dan kanal pengaduan rahasia bagi pegawai internal maupun masyarakat untuk melaporkan dugaan pelanggaran hukum, suap, korupsi, atau kode etik dengan jaminan perlindungan penuh atas kerahasiaan identitas pelapor.',
    dasarHukum: 'Pilar 5 Penguatan Pengawasan BPS',
    highlight: 'Kanal Aduan Rahasia Terlindungi'
  },
  {
    id: 'agen_perubahan',
    istilah: 'Agen Perubahan (Agent of Change)',
    kepanjangan: 'Role Model Penggerak Perubahan Budaya Kerja',
    kategori: 'Kelembagaan',
    definisi:
      'Pegawai teladan yang terpilih melalui seleksi terbuka untuk menjadi panutan (role model) dalam berperilaku kerja, berintegritas tinggi, berprestasi, dan memimpin transformasi budaya organisasi BerAKHLAK di BPS Sitaro.',
    dasarHukum: 'PermenPAN-RB No. 27/2014 & Pilar 1 Perubahan',
    highlight: 'Keteladanan ASN BerAKHLAK'
  },
  {
    id: 'span_lapor',
    istilah: 'SP4N-LAPOR!',
    kepanjangan: 'Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional',
    kategori: 'Singkatan Resmi',
    definisi:
      'Layanan Aspirasi dan Pengaduan Online Rakyat; portal terpadu nasional yang menghubungkan instansi pemerintah untuk menerima, memverifikasi, dan menindaklanjuti keluhan dan masukan masyarakat terkait pelayanan publik.',
    dasarHukum: 'Perpres No. 76/2013 & Pilar 6 Pelayanan Publik',
    highlight: 'Portal Nasional Pengaduan Publik'
  }
];
