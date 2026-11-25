/**
 * Standar Pelayanan & Maklumat Pelayanan Digital BPS Kabupaten Kepulauan Sitaro
 * Sesuai UU No. 25 Tahun 2009 tentang Pelayanan Publik
 * dan PermenPAN-RB No. 15 Tahun 2014 tentang Pedoman Standar Pelayanan
 * Untuk pemenuhan bukti dukung Zona Integritas (ZI-WBK) Pilar 6: Peningkatan Kualitas Pelayanan Publik
 */

export type KategoriLayanan =
  | 'KONSULTASI'
  | 'DATA_MIKRO'
  | 'PUBLIKASI'
  | 'REKOMENDASI';

export const KATEGORI_LAYANAN_LABELS: Record<
  KategoriLayanan,
  { label: string; badgeColor: string; description: string }
> = {
  KONSULTASI: {
    label: 'Konsultasi Statistik',
    badgeColor:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
    description:
      'Bimbingan metodologi, konsep statistik, dan metadata statistik sektoral.'
  },
  DATA_MIKRO: {
    label: 'Data Mikro & Spasial',
    badgeColor:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300',
    description:
      'Data mentah teranonymisasi dan peta digital wilayah kerja statistik.'
  },
  PUBLIKASI: {
    label: 'Publikasi & Pustaka',
    badgeColor:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
    description:
      'Buku statistik resmi daerah, serial sensus, dan bahan pustaka statistik.'
  },
  REKOMENDASI: {
    label: 'Rekomendasi ROMANTIK',
    badgeColor:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300',
    description:
      'Rekomendasi resmi kegiatan statistik sektoral OPD Pemkab (Satu Data Indonesia).'
  }
};

/**
 * 14 Komponen Standar Pelayanan Sesuai PermenPAN-RB No. 15/2014:
 * Service Delivery (Penyampaian):
 * 1. Persyaratan
 * 2. Prosedur/Alur
 * 3. Waktu Layanan
 * 4. Biaya/Tarif
 * 5. Produk Pelayanan
 * 6. Penanganan Pengaduan
 * Manufacturing (Pengelolaan Internal):
 * 7. Dasar Hukum
 * 8. Sarana & Prasarana
 * 9. Kompetensi Pelaksana
 * 10. Pengawasan Internal
 * 11. Jumlah Pelaksana
 * 12. Jaminan Pelayanan
 * 13. Jaminan Keamanan
 * 14. Evaluasi Kinerja
 * Ditambah: Kompensasi Keterlambatan Layanan
 */
export interface StandarPelayananItem {
  id: string;
  nama_produk_layanan: string;
  kategori: KategoriLayanan;
  persyaratan: string[];
  prosedur_alur: string[];
  waktu_layanan: string;
  biaya_tarif: string;
  produk_pelayanan: string;
  sarana_prasarana: string[];
  kompetensi_pelaksana: string;
  pengawasan_internal: string;
  penanganan_pengaduan: string;
  jumlah_pelaksana: number;
  jaminan_pelayanan: string;
  jaminan_keamanan: string;
  evaluasi_kinerja: string;
  kompensasi_keterlambatan: string;
  dasar_hukum: string;
}

export interface MaklumatPelayananData {
  teks_maklumat: string;
  pejabat_penandatangan: string;
  nip: string;
  tanggal_penetapan: string;
  nomor_sk_penetapan: string;
  status_pajang: boolean;
}

export interface TahapKompensasiLayanan {
  step: number;
  judul: string;
  durasi: string;
  penanggung_jawab: string;
  uraian_tindakan: string;
  kompensasi_diberikan: string;
  kanal: string;
}

export const ALUR_KOMPENSASI_DEFAULT: TahapKompensasiLayanan[] = [
  {
    step: 1,
    judul: 'Deteksi & Peringatan Otomatis Batas SLA',
    durasi: '10 Menit sebelum SLA berakhir',
    penanggung_jawab: 'Petugas Front Office / Operator SIMPEL PST',
    uraian_tindakan:
      'Sistem otomatis mendeteksi transaksi layanan yang mendekati ambang toleransi waktu penyelesaian (SLA) dan memicu notifikasi peringatan ke Koordinator PST & Subbag Umum.',
    kompensasi_diberikan:
      'Pemberitahuan transparan estimasi durasi tambahan kepada pengguna layanan.',
    kanal: 'Dashboard REBO V2 & Notifikasi WhatsApp Operator'
  },
  {
    step: 2,
    judul: 'Penerbitan Surat Permohonan Maaf Resmi',
    durasi: 'Maksimal 30 Menit pasca keterlambatan',
    penanggung_jawab: 'Kepala BPS Kabupaten Kepulauan Sitaro / Plh.',
    uraian_tindakan:
      'Penerbitan Surat Permohonan Maaf Resmi Instansi yang ditandatangani oleh Pimpinan Satker BPS Kabupaten Kepulauan Sitaro secara elektronik (TTE BSrE) dengan tembusan Ombudsman RI.',
    kompensasi_diberikan:
      'Surat permohonan maaf resmi berkop surat garuda BPS Sitaro bernomor register resmi.',
    kanal: 'Penyerahan Langsung / Email Resmi / WhatsApp'
  },
  {
    step: 3,
    judul: 'Pemberian Souvenir Data Statistik Eksklusif',
    durasi: 'Seketika pada saat layanan selesai diberikan',
    penanggung_jawab: 'Petugas Pengelola Ruang PST BPS Sitaro',
    uraian_tindakan:
      'Penyerahan paket kompensasi barang publikasi fisik dan cenderamata promosi statistik resmi BPS sebagai bentuk tanggung jawab moral dan integritas institusi.',
    kompensasi_diberikan:
      'Flashdisk 32GB berisi Ensiklopedia Statistik Sitaro + Goodie Bag ramah lingkungan + Buku Publikasi Eksklusif Daerah.',
    kanal: 'Lobi Meja Layanan PST BPS Sitaro'
  },
  {
    step: 4,
    judul: 'Layanan Pengantaran Bebas Biaya Antar-Pulau',
    durasi: 'Maksimal 1x24 Jam (Hari Kerja)',
    penanggung_jawab: 'Petugas Kurir Khusus BPS Sitaro / Mitra Logistik',
    uraian_tindakan:
      'Apabila pemohon berdomisili di pulau terluar atau seberang lautan (Kepulauan Tagulandang atau Biaro), dokumen/berkas diantar langsung ke alamat tanpa dipungut biaya transportasi laut.',
    kompensasi_diberikan:
      'Pengantaran berkas bebas biaya antar-pulau (Siau - Tagulandang - Biaro) hingga ke tangan pemohon.',
    kanal: 'Armada Penyeberangan Cepat & Kurir Satker'
  },
  {
    step: 5,
    judul: 'Audit Mutu Layanan & Sidang Kendali Kinerja',
    durasi: 'Rapat Evaluasi Rutin Mingguan (Setiap Senin)',
    penanggung_jawab: 'Tim SPIP & Pengawasan Zona Integritas Pilar 6',
    uraian_tindakan:
      'Pencatatan kasus keterlambatan ke dalam Register Kompensasi Layanan REBO V2 untuk dianalisis akar penyebabnya (Root Cause Analysis) agar hambatan teknis tidak terulang.',
    kompensasi_diberikan:
      'Jaminan perbaikan sistem kerja dan evaluasi performa pegawai pelaksana.',
    kanal: 'Aplikasi REBO V2 & Laporan Berkala KemenPAN-RB'
  }
];

export const DEFAULT_MAKLUMAT_PELAYANAN: MaklumatPelayananData = {
  teks_maklumat:
    'DENGAN INI, KAMI KELUARGA BESAR BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO MENYATAKAN SANGGUP MENYELENGGARAKAN PELAYANAN SESUAI STANDAR PELAYANAN YANG TELAH DITETAPKAN, SERTA SIAP MEMBERIKAN PELAYANAN YANG PROFESIONAL, INTEGRITAS, AMANAH, DAN BEBAS DARI SEGALA BENTUK PUNGLI SERTA GRATIFIKASI. APABILA KAMI TIDAK MENEPATI JANJI INI, KAMI SIAP MENERIMA SANKSI SESUAI PERATURAN PERUNDANG-UNDANGAN YANG BERLAKU DAN MEMBERIKAN KOMPENSASI PELAYANAN.',
  pejabat_penandatangan: 'Ir. Stella Mandagi, M.Si.',
  nip: '197501012000031001',
  tanggal_penetapan: '02 Januari 2026',
  nomor_sk_penetapan: 'KEP-02/71080/HM.210/2026',
  status_pajang: true
};

export const DEFAULT_STANDAR_PELAYANAN_LIST: StandarPelayananItem[] = [
  // 1. Konsultasi Statistik
  {
    id: 'sp-01',
    nama_produk_layanan: 'Layanan Konsultasi Statistik Terpadu',
    kategori: 'KONSULTASI',
    persyaratan: [
      'Membawa Identitas Diri yang sah (KTP-el/SIM/Paspor/Kartu Mahasiswa).',
      'Mengisi Buku Tamu Digital Pelayanan Statistik Terpadu (PST) / SIMPEL BPS.',
      'Menyiapkan materi konsultasi, kerangka acuan kerja, atau daftar pertanyaan teknis statistik.',
      'Bagi perwakilan instansi/lembaga, disarankan membawa Surat Tugas/Pengantar Resmi.'
    ],
    prosedur_alur: [
      'Pengunjung datang ke Ruang PST BPS Sitaro dan disambut ramah oleh Petugas Front Office.',
      'Pengunjung melakukan registrasi kedatangan pada terminal digital Buku Tamu / QR Code.',
      'Petugas Front Office mengidentifikasi kebutuhan dan menghubungkan pemohon dengan Statistisi Ahli / Pranata Komputer Konsultan.',
      'Sesi konsultasi teknis berlangsung di Ruang Konsultasi Statistik ber-AC dengan perlengkapan multimedia pendukung.',
      'Petugas mencatat lembar notula konsultasi dan menandatangani bersama pemohon.',
      'Pemohon mengisi Survei Kebutuhan Data (SKD) / Indeks Persepsi Kualitas Pelayanan (IPKP).'
    ],
    waktu_layanan:
      'Maksimal 60 Menit per sesi konsultasi (dapat dijadwalkan ulang bila membutuhkan telaah mendalam)',
    biaya_tarif: 'Rp 0,- (Gratis tanpa pungutan biaya apapun)',
    produk_pelayanan:
      'Rekomendasi teknis metodologi statistik, penjelasan konsep & definisi indikator, asistensi analisis data, serta Lembar Notula Konsultasi resmi.',
    sarana_prasarana: [
      'Ruang Konsultasi Nyaman & Inklusif ber-AC',
      'Layar Monitor Interaktif & PC All-in-One Klien',
      'Akses Wi-Fi High Speed BPS Sitaro',
      'Air Minum Mineral, Teh & Kopi Gratis di Ruang Tunggu',
      'Fasilitas ramah disabilitas (Jalur pemandu, kursi roda, toilet difabel)'
    ],
    kompetensi_pelaksana:
      'Statistisi Ahli Pertama/Muda dan Pranata Komputer BPS dengan sertifikasi kompetensi statistik resmi BPS-RI serta ramah dan komunikatif.',
    pengawasan_internal:
      'Pengawasan berjenjang oleh Penanggung Jawab PST, Kasubbag Umum, dan pemantauan kamera CCTV ruang layanan 24 jam.',
    penanganan_pengaduan:
      'Kanal Pengaduan: Kotak Saran PST, WhatsApp Pengaduan (0812-4455-7108), Website SP4N-LAPOR!, dan Portal Whistleblowing System (WBS) REBO V2.',
    jumlah_pelaksana: 3,
    jaminan_pelayanan:
      'Pelayanan diberikan dengan sikap RAMAH (Responsif, Akuntabel, Melayani, Adil, dan Humanis) tepat waktu sesuai janji maklumat.',
    jaminan_keamanan:
      'Informasi kerahasiaan materi penelitian dan identitas pemohon dijamin kerahasiaannya sesuai UU No. 16 Tahun 1997 tentang Statistik.',
    evaluasi_kinerja:
      'Evaluasi harian melalui kepuasan pengunjung SKD/IPKP dan rapat evaluasi mutu mingguan tim PST setiap hari Senin pagi.',
    kompensasi_keterlambatan:
      'Apabila waktu tunggu konsultasi melebihi 15 menit dari jadwal janji temu akibat kelalaian petugas: Pemohon diberikan Surat Permohonan Maaf Resmi Pimpinan, souvenir flashdisk 32GB materi statistik BPS Sitaro, dan prioritas layanan VIP.',
    dasar_hukum:
      'UU No. 16 Tahun 1997 tentang Statistik; UU No. 25 Tahun 2009 tentang Pelayanan Publik; PermenPAN-RB No. 15 Tahun 2014; Perban BPS No. 4 Tahun 2023.'
  },

  // 2. Data Mikro & Spasial
  {
    id: 'sp-02',
    nama_produk_layanan: 'Layanan Penyediaan Data Mikro & Peta Digital Spasial',
    kategori: 'DATA_MIKRO',
    persyaratan: [
      'KTP-el/Identitas Diri Pemohon yang masih berlaku.',
      'Surat Permohonan Resmi bertandatangan Dekan/Pimpinan Lembaga/Kepala OPD.',
      'Proposal Riset / Skripsi / Kerangka Acuan Kerja yang menyebutkan variabel dan tujuan penggunaan data.',
      'Menandatangani Surat Pernyataan Komitmen Penggunaan Data Mikro (tidak memindahtangankan raw data atau mencoba merekayasa identitas responden).'
    ],
    prosedur_alur: [
      'Pemohon mengajukan permohonan melalui PST BPS Sitaro atau portal online PST BPS Sitaro.',
      'Petugas Pengolah Data memverifikasi kelengkapan berkas dan ketersediaan variabel data mikro yang diminta.',
      'Pemeriksaan kriteria diskon tarif PNBP Rp 0,- (pendidikan, instansi pemerintah pembina data, atau riset non-komersial).',
      'Persetujuan resmi dari Kepala BPS Kabupaten Kepulauan Sitaro melalui sistem persetujuan terintegrasi.',
      'Penyiapan raw data teranonymisasi (format STATA/SPSS/CSV) dan Shapefile spasial berkoordinat WGS84.',
      'Penyerahan data terenkripsi melalui tautan aman atau media penyimpanan, diakhiri pengisian survei kepuasan.'
    ],
    waktu_layanan:
      'Maksimal 3 Hari Kerja setelah berkas dinyatakan lengkap dan diverifikasi',
    biaya_tarif:
      'Rp 0,- (Sesuai PP No. 86/2021 tentang PNBP BPS tarif Rp 0,- untuk mahasiswa, dosen, peneliti, dan instansi daerah).',
    produk_pelayanan:
      'Dataset Data Mikro Sensus/Survei (Susenas, Sakernas, Podes) teranonymisasi dan Peta Digital Wilayah Kerja Statistik (Wilkerstat) format Shapefile (SHP).',
    sarana_prasarana: [
      'Server Storage Berkecepatan Tinggi Terenkripsi SSL',
      'Software Pengolahan Statistik Berlisensi (SPSS, STATA, QGIS, ArcGIS)',
      'Akses Cloud Repository BPS Sitaro',
      'Unit Antivirus dan Enkripsi Data Berstandar ISO 27001'
    ],
    kompetensi_pelaksana:
      'Pranata Komputer Ahli dan Statistisi Ahli bersertifikasi pengolahan basis data dan Sistem Informasi Geografis (SIG).',
    pengawasan_internal:
      'Audit log akses basis data mikro oleh Tim Keamanan Informasi BPS Sitaro dan pengawasan berkala BPS Provinsi Sulut.',
    penanganan_pengaduan:
      'Pengaduan dapat disampaikan melalui menu WBS REBO V2, portal SP4N LAPOR, atau email resmi bps7108@bps.go.id.',
    jumlah_pelaksana: 2,
    jaminan_pelayanan:
      'Data disajikan lengkap dengan metadata standar nasional, bebas dari virus/malware, dan struktur data tervalidasi.',
    jaminan_keamanan:
      'Perlindungan data pribadi responden (anonymized) 100% terjaga dan file dienkripsi dengan password khusus pemohon.',
    evaluasi_kinerja:
      'Audit kepatuhan jangka waktu penyelesaian (SLA) bulanan oleh Tim Penjamin Kualitas BPS Sitaro.',
    kompensasi_keterlambatan:
      'Jika proses melebihi 3 hari kerja: Surat Permohonan Maaf Resmi Kepala BPS diterbitkan, dan data mikro dikirimkan dalam flashdisk fisik berkecepatan tinggi gratis langsung ke alamat pemohon di kepulauan Sitaro.',
    dasar_hukum:
      'UU No. 16 Tahun 1997; PP No. 86 Tahun 2021; Perka BPS No. 7 Tahun 2020 tentang Akses Data Mikro BPS; UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.'
  },

  // 3. Publikasi Statistik Daerah
  {
    id: 'sp-03',
    nama_produk_layanan:
      'Layanan Publikasi Statistik & Berita Resmi Statistik (BRS)',
    kategori: 'PUBLIKASI',
    persyaratan: [
      'Identitas Diri Pemohon (KTP/KTM/SIM).',
      'Mengisi Buku Tamu Elektronik PST atau mencatat formulir permintaan publikasi.',
      'Tidak dipersyaratkan surat izin khusus untuk publikasi berstatus terbuka bagi umum.'
    ],
    prosedur_alur: [
      'Pengguna memilih judul publikasi melalui e-Katalog PST atau website resmi sitarokab.bps.go.id.',
      'Petugas PST membantu pencarian buku publikasi cetak di lemari arsip atau menyiapkan softcopy PDF terbitan resmi.',
      'Pengguna dapat mengunduh langsung atau menyalin file publikasi melalui flashdisk/Bluetooth/email.',
      'Pengguna mengisi lembar SKD singkat mengenai kualitas penyajian buku publikasi BPS Sitaro.'
    ],
    waktu_layanan:
      'Seketika (Instant Download via web) / Maksimal 15 Menit untuk berkas cetak di lobi PST',
    biaya_tarif: 'Rp 0,- (Gratis tanpa dipungut biaya)',
    produk_pelayanan:
      'Buku Publikasi Cetak & Softcopy PDF resmi (Kabupaten Kepulauan Sitaro Dalam Angka, Produk Domestik Regional Bruto/PDRB, Indikator Kesejahteraan Rakyat, Statistik Gender).',
    sarana_prasarana: [
      'Rak Display Publikasi Terbuka di Lobi PST',
      'Komputer Pencarian Digital OPAC (Online Public Access Catalog)',
      'Ruang Baca Ber-AC dengan Sofa Ergonomis',
      'Printer dan Scanner Layanan Khusus Disabilitas/Peneliti'
    ],
    kompetensi_pelaksana:
      'Staf Fungsional Statistisi dan Pengelola Informasi Publik yang memahami katalog dan navigasi publikasi daerah.',
    pengawasan_internal:
      'Monitoring ketersediaan stok fisik publikasi dan stabilitas tautan unduhan website oleh Koordinator Fungsi IPDS.',
    penanganan_pengaduan:
      'Petugas meja pengaduan lobi PST, email bps7108@bps.go.id, dan fitur pengaduan online aplikasi REBO.',
    jumlah_pelaksana: 2,
    jaminan_pelayanan:
      'Publikasi yang disediakan merupakan edisi termutakhir dengan angka tetap yang telah divalidasi secara ilmiah.',
    jaminan_keamanan:
      'Dokumen PDF resmi dilengkapi tanda tangan digital (Digital Signature) dan watermark resmi BPS Sitaro.',
    evaluasi_kinerja:
      'Survei Kebutuhan Data tahunan dan pemantauan jumlah pengunduh publikasi setiap bulan.',
    kompensasi_keterlambatan:
      'Bila naskah publikasi yang dicari tidak tersedia di arsip lokal dalam 15 menit: Petugas PST menghubungi BPS Provinsi/Pusat dalam 1x24 jam dan mengirimkan cetakan resmi langsung ke rumah pemohon tanpa biaya.',
    dasar_hukum:
      'UU No. 16 Tahun 1997; UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik; Perban BPS No. 5 Tahun 2021.'
  },

  // 4. Rekomendasi Kegiatan Statistik Sektoral (ROMANTIK)
  {
    id: 'sp-04',
    nama_produk_layanan:
      'Layanan Rekomendasi Kegiatan Statistik Sektoral (ROMANTIK)',
    kategori: 'REKOMENDASI',
    persyaratan: [
      'Surat Permohonan Rekomendasi resmi dari Kepala Dinas / Badan / OPD Pemerintah Kabupaten Kepulauan Sitaro.',
      'Formulir Pemberitahuan Rancangan Kegiatan Statistik (Formulir FS3) yang telah diisi lengkap.',
      'Rancangan instrumen pengumpulan data (Kuesioner/Pedoman Wawancara).',
      'Rancangan desain metodologi sampel dan estimasi galat sampling (jika menggunakan metode survei).'
    ],
    prosedur_alur: [
      'OPD Pemkab mengunggah permohonan rekomendasi melalui portal romantik.web.bps.go.id atau menyerahkan berkas ke PST BPS Sitaro.',
      'Tim Pembina Statistik Sektoral BPS Sitaro memeriksa kelayakan rancangan metodologi, definisi variabel, dan klasifikasi baku (KBLI/KBKI).',
      'Sesi asistensi teknis dan konfirmasi jika terdapat duplikasi kegiatan statistik atau perbaikan instrumen.',
      'Tim Pembina menerbitkan Telaah Teknis Rekomendasi Statistik Sektoral.',
      'Kepala BPS Kabupaten Kepulauan Sitaro menandatangani Surat Keputusan Rekomendasi Statistik resmi (TTE BSrE).',
      'Surat Rekomendasi beserta Nomor Identitas Rekomendasi Nasional diserahkan kepada OPD pemohon.'
    ],
    waktu_layanan:
      'Maksimal 14 Hari Kerja terhitung sejak berkas rancangan dinyatakan lengkap',
    biaya_tarif: 'Rp 0,- (Gratis)',
    produk_pelayanan:
      'Surat Rekomendasi Kegiatan Statistik Sektoral resmi BPS dan Nomor Registrasi Nasional Satu Data Indonesia (SDI).',
    sarana_prasarana: [
      'Aplikasi Web ROMANTIK Terintegrasi Nasional',
      'Ruang Rapat Pembinaan Statistik Sektoral / Studio Podcast Statistik',
      'Dokumen Klasifikasi Baku Statistik Indonesia (KBLI, KBKI, Klasifikasi Jabatan)',
      'Fasilitas Video Conference Zoom Pro BPS Sitaro'
    ],
    kompetensi_pelaksana:
      'Tim Pembina Statistik Sektoral yang terdiri dari Statistisi Ahli Muda dan Ahli Madya bersertifikasi Pembina Data SDI.',
    pengawasan_internal:
      'Supervisi langsung oleh Direktur Diseminasi Statistik BPS-RI dan BPS Provinsi Sulawesi Utara.',
    penanganan_pengaduan:
      'Layanan aduan langsung ke Pembina Data Sektoral BPS Sitaro atau melalui Forum Satu Data Indonesia Kabupaten Kepulauan Sitaro.',
    jumlah_pelaksana: 4,
    jaminan_pelayanan:
      'Rekomendasi menjamin kegiatan statistik OPD terhindar dari duplikasi anggaran APBD dan memenuhi kaidah metodologi statistik nasional.',
    jaminan_keamanan:
      'Legalitas dokumen terverifikasi melalui Sertifikat Elektronik Badan Siber dan Sandi Negara (BSSN / BSrE).',
    evaluasi_kinerja:
      'Evaluasi Nilai Evaluasi Penyelenggaraan Statistik Sektoral (EPSS) Kabupaten Kepulauan Sitaro oleh KemenPAN-RB.',
    kompensasi_keterlambatan:
      'Bila proses telaah melebihi 14 hari kerja akibat kendala internal BPS: Tim Pembina BPS Sitaro akan mendatangi langsung kantor dinas terkait (jemput bola) untuk pendampingan intensif on-site hingga rekomendasi selesai.',
    dasar_hukum:
      'Perpres No. 39 Tahun 2019 tentang Satu Data Indonesia; Perban BPS No. 4 Tahun 2019; UU No. 25 Tahun 2009 tentang Pelayanan Publik.'
  },

  // 5. Layanan Perpustakaan Statistik
  {
    id: 'sp-05',
    nama_produk_layanan: 'Layanan Perpustakaan Statistik & Ruang Baca Inklusif',
    kategori: 'PUBLIKASI',
    persyaratan: [
      'Membawa kartu tanda pengenal diri (KTP/KTM/Kartu Pelajar).',
      'Mencatatkan nama dan institusi pada Buku Kunjungan Perpustakaan di meja resepsionis.',
      'Menitipkan tas, jaket, dan map di loker penitipan barang yang telah disediakan petugas.',
      'Menjaga ketertiban, ketenangan, dan dilarang merusak atau melipat koleksi pustaka statistik.'
    ],
    prosedur_alur: [
      'Pengunjung datang ke Ruang Perpustakaan PST BPS Sitaro dan melapor ke petugas jaga.',
      'Pengunjung menitipkan tas di loker dan menerima kunci/nomor loker.',
      'Pengunjung mencari koleksi buku melalui katalog rak terbuka atau terminal pencarian e-Library.',
      'Pengunjung membaca bahan pustaka di ruang baca yang tenang, sejuk, dan dilengkapi koneksi internet.',
      'Apabila memerlukan fotokopi/salinan bab tertentu, petugas membantu memindai (scan) tanpa merusak buku asli.',
      'Pengunjung mengembalikan buku ke meja sirkulasi dan mengisi lembar kesan & pesan pengunjung.'
    ],
    waktu_layanan:
      'Seketika selama jam kerja operasional PST (Senin-Kamis: 08.00-15.30 WITA, Jumat: 08.00-15.00 WITA)',
    biaya_tarif: 'Rp 0,- (Gratis tanpa pungutan biaya)',
    produk_pelayanan:
      'Akses membaca ratusan koleksi publikasi serial BPS, buku metodologi sensus, modul pelatihan statistik, jurnal ilmiah, dan e-Book statistik.',
    sarana_prasarana: [
      'Ruang Baca Ber-AC, Tenang, dan Ramah Kelompok Rentan',
      'Meja Baca Individual dengan Colokan Listrik & Lampu Baca',
      'Loker Penitipan Barang Aman dengan Kunci Mandiri',
      'Wi-Fi Dedikasi Edukasi & Riset Kecepatan 50 Mbps',
      'Terminal Komputer Akses Repository Digital BPS'
    ],
    kompetensi_pelaksana:
      'Petugas Pengelola Perpustakaan terlatih dalam sistem klasifikasi perpustakaan BPS dan etika pelayanan kepustakaan.',
    pengawasan_internal:
      'Inspeksi berkala inventaris buku oleh Kasubbag Umum dan perekaman CCTV area sirkulasi pustaka.',
    penanganan_pengaduan:
      'Kotak saran perpustakaan, formulir kepuasan pengunjung, serta nomor kontak WhatsApp Pengaduan BPS Sitaro.',
    jumlah_pelaksana: 2,
    jaminan_pelayanan:
      'Koleksi pustaka tertata rapi sesuai sistem klasifikasi baku BPS dan ruangan senantiasa bersih, higienis, dan nyaman.',
    jaminan_keamanan:
      'Barang bawaan pemohon aman tersimpan dalam loker berkunci dan diawasi petugas resepsionis.',
    evaluasi_kinerja:
      'Pencatatan indeks kepuasan pemustaka bulanan dan analisis tren kebutuhan bahan bacaan statistik di Sitaro.',
    kompensasi_keterlambatan:
      'Apabila judul buku serial yang dicari rusak atau sedang dalam perbaikan fisik: Petugas menyediakan salinan digital (PDF) lengkap dalam flashdisk promosi BPS tanpa biaya tambahan.',
    dasar_hukum:
      'UU No. 43 Tahun 2007 tentang Perpustakaan; UU No. 16 Tahun 1997 tentang Statistik; UU No. 25 Tahun 2009 tentang Pelayanan Publik.'
  }
];
