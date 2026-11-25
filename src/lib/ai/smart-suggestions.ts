/**
 * Smart Suggestions Knowledge Base & Similarity Matcher
 * BPS Kabupaten Kepulauan Sitaro - REBO V2
 *
 * Menyediakan rekomendasi bukti dukung standar terbaik 6 Pilar ZI yang
 * terbukti lolos evaluasi Tim Penilai Internal (TPI BPS RI) tanpa revisi (Zero Revision).
 */

export interface RecommendedDocument {
  name: string;
  type: string;
  isMandatory: boolean;
  description: string;
}

export interface TPITip {
  point: string;
  risk: string;
  solution: string;
}

export interface ReferenceTemplate {
  title: string;
  url?: string;
  formatType: string;
}

export interface SmartSuggestionItem {
  id: string;
  pilarId: string; // '1' | '2' | '3' | '4' | '5' | '6'
  pilarName: string;
  category: string;
  title: string;
  description: string;
  keywords: string[];
  recommendedDocuments: RecommendedDocument[];
  provenNarration: string;
  tpiTips: TPITip[];
  referenceTemplate?: ReferenceTemplate;
  sampleYear: number;
  approvalStatus: 'Approved by TPI RI' | 'Zero Revision' | 'Best Practice';
  tpiApprovalNotes?: string;
}

export interface SmartSuggestionMatchResult {
  suggestion: SmartSuggestionItem;
  matchScore: number;
  matchedKeywords: string[];
  allSuggestionsForPilar: SmartSuggestionItem[];
}

export interface SmartSuggestionParams {
  id_pertanyaan: string;
  pilar_id?: string;
  judul_pertanyaan: string;
  penjelasan?: string;
}

// ============================================================================
// BANK REFERENSI PRAKTIK TERBAIK 6 PILAR ZI (BPS SITARO & BPS RI)
// ============================================================================

export const SMART_SUGGESTIONS_BANK: SmartSuggestionItem[] = [
  // --------------------------------------------------------------------------
  // PILAR 1: MANAJEMEN PERUBAHAN
  // --------------------------------------------------------------------------
  {
    id: 'pilar1-tim-kerja-zi',
    pilarId: '1',
    pilarName: 'Manajemen Perubahan',
    category: 'Tim Kerja ZI',
    title: 'Pembentukan Tim Kerja Pembangunan ZI',
    description:
      'Dokumentasi proses seleksi terbuka dan penetapan Tim Kerja ZI BPS Sitaro yang akuntabel.',
    keywords: [
      'tim kerja',
      'pembentukan tim',
      'sk tim',
      'seleksi tim',
      'kriteria tim',
      'anggota tim',
      'surat keputusan'
    ],
    recommendedDocuments: [
      {
        name: 'Surat Keputusan (SK) Kepala BPS Kabupaten Kepulauan Sitaro tentang Pembentukan Tim Kerja Pembangunan ZI',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Wajib mencantumkan lampiran susunan tim 6 koordinator pilar & tupoksi jelas.'
      },
      {
        name: 'Berita Acara & Lembar Penilaian Seleksi Anggota Tim Kerja ZI',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Membuktikan pemilihan anggota melalui mekanisme obyektif/kompetensi, bukan penunjukan sepihak.'
      },
      {
        name: 'Surat Undangan, Daftar Hadir, dan Notula Rapat Pembentukan Tim Kerja',
        type: 'Notula',
        isMandatory: true,
        description:
          'Format notula wajib memuat agenda, poin pembahasan, kesepakatan, dan bertandatangan.'
      },
      {
        name: 'Dokumentasi Foto Rapat Pembentukan & Penyerahan SK',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Foto ber-geotag/timestamp dengan keterangan tanggal pelaksanaan kegiatan.'
      }
    ],
    provenNarration:
      'Telah dibentuk Tim Kerja Pembangunan Zona Integritas BPS Kabupaten Kepulauan Sitaro yang ditetapkan melalui Keputusan Kepala BPS Kabupaten Kepulauan Sitaro Nomor 01/7108/OT.100/2026. Pembentukan tim dilakukan secara transparan melalui rapat pleno internal dan penilaian rekam jejak kompetensi serta integritas pegawai (Berita Acara Rapat No. 02/7108/BA/2026). Struktur tim membagi tugas ke dalam 6 koordinator pilar pengungkit dengan uraian peran yang terukur untuk memastikan seluruh target tercapai tepat waktu.',
    tpiTips: [
      {
        point: 'Mekanisme Seleksi Terbuka',
        risk: 'TPI sering memangkas nilai jika SK tim dianggap hanya formalitas tahunan tanpa bukti proses pemilihan anggota.',
        solution:
          'Selalu lampirkan Berita Acara Seleksi / Rapat Pleno dan Lembar Kriteria Penilaian Anggota Tim.'
      },
      {
        point: 'Keterbaruan SK di Awal Tahun',
        risk: 'Tanggal SK terbit terlambat (misal Maret/April) dapat dinilai bahwa pembangunan ZI tidak terencana sejak awal tahun.',
        solution:
          'Pastikan tanggal naskah SK terbit pada bulan Januari periode berjalan.'
      }
    ],
    referenceTemplate: {
      title: 'Format Baku Notula Rapat BPS Sitaro',
      formatType: 'DOCX / PDF'
    },
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI',
    tpiApprovalNotes:
      'Diterima penuh TPI BPS RI tanpa revisi: bukti seleksi lengkap dengan matriks kompetensi anggota.'
  },
  {
    id: 'pilar1-rencana-kerja-zi',
    pilarId: '1',
    pilarName: 'Manajemen Perubahan',
    category: 'Rencana Kerja ZI',
    title: 'Dokumen Rencana Kerja & Rencana Aksi Pembangunan ZI',
    description:
      'Penyusunan target prioritas, milestone jadwal kerja, dan sosialisasi rencana pembangunan ZI.',
    keywords: [
      'rencana kerja',
      'rencana aksi',
      'target prioritas',
      'jadwal kegiatan',
      'action plan',
      'milestone'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Rencana Aksi Pembangunan ZI Menuju WBK BPS Sitaro Disahkan Kepala Satker',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Berisi target prioritas 6 pilar, output indikator, penanggung jawab, dan batas waktu.'
      },
      {
        name: 'Laporan Sosialisasi Rencana Pembangunan ZI kepada Seluruh Pegawai',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Bukti bahwa seluruh pegawai mengetahui isi rencana aksi pembangunan ZI.'
      },
      {
        name: 'Paket Notula Rapat Penyusunan Rencana Aksi (Undangan, Presensi, Notula)',
        type: 'Notula',
        isMandatory: true,
        description:
          'Risalah diskusi penyelarasan rencana aksi bersama seluruh koordinator area.'
      },
      {
        name: 'Dokumentasi Banner / Standing Banner Komitmen ZI di Kantor',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Foto publikasi rencana dan komitmen ZI di ruang kerja / lobi kantor.'
      }
    ],
    provenNarration:
      'Dokumen Rencana Aksi Pembangunan Zona Integritas Menuju Wilayah Bebas dari Korupsi (WBK) BPS Kabupaten Kepulauan Sitaro Tahun 2026 telah disusun dan disahkan oleh Kepala Kantor pada tanggal 12 Januari 2026. Rencana aksi ini memuat matriks target prioritas inovasi, penanggung jawab pilar, serta jadwal pemenuhan indikator bulanan. Rencana aksi ini telah disosialisasikan kepada seluruh pegawai dalam forum internal (Laporan Sosialisasi No. 05/7108/RB/2026) guna menyamakan pemahaman dan target satker.',
    tpiTips: [
      {
        point: 'Konsistensi Target & Indikator LKE',
        risk: 'Target pada Rencana Aksi tidak sinkron dengan butir-butir pertanyaan pada lembar LKE PMPRB.',
        solution:
          'Gunakan struktur 6 Pilar standar KemenPAN-RB & BPS RI dalam matriks rencana kerja satker.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar1-monev-zi',
    pilarId: '1',
    pilarName: 'Manajemen Perubahan',
    category: 'Monev ZI',
    title: 'Pemantauan & Evaluasi (Monev) Berkala Pembangunan ZI',
    description:
      'Rapat monev rutin bulanan/triwulanan pembangunan ZI yang dipimpin langsung oleh pimpinan beserta matriks tindak lanjut.',
    keywords: [
      'monev',
      'pemantauan',
      'evaluasi berkala',
      'tindak lanjut',
      'matriks tindak lanjut',
      'monitoring'
    ],
    recommendedDocuments: [
      {
        name: 'Laporan Hasil Pemantauan & Evaluasi (Monev) Berkala Pembangunan ZI (Triwulan I/II/III/IV)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat progres capaian tiap pilar, hambatan di lapangan, dan rekomendasi arahan pimpinan.'
      },
      {
        name: 'Matriks Rencana Tindak Lanjut (RTL) Hasil Evaluasi Monev ZI',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Tabel status: Kendala -> Rekomendasi -> Penanggung Jawab -> Batas Waktu -> Realisasi Status.'
      },
      {
        name: 'Paket Notula Rapat Monev ZI (Undangan, Daftar Hadir bertandatangan, Notula Resmi)',
        type: 'Notula',
        isMandatory: true,
        description:
          'Wajib mencantumkan tanda tangan pimpinan rapat dan notulis.'
      },
      {
        name: 'Foto Dokumentasi Pelaksanaan Rapat Monev Bersama Pimpinan',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Tangkapan layar / foto rapat luring maupun daring ber-geotagging.'
      }
    ],
    provenNarration:
      'Monitoring dan evaluasi pembangunan Zona Integritas BPS Kabupaten Kepulauan Sitaro dilaksanakan secara berkala setiap bulan yang dipimpin langsung oleh Kepala BPS Sitaro. Hasil evaluasi dituangkan dalam Laporan Monev Triwulanan dan Matriks Rekomendasi Tindak Lanjut (RTL). Seluruh catatan kendala pada periode sebelumnya telah ditindaklanjuti 100% oleh masing-masing koordinator pilar (Laporan Monev Triwulan No. 14/7108/MONEV/2026), didukung bukti kehadiran dan notula rapat resmi.',
    tpiTips: [
      {
        point: 'Keberadaan Matriks Tindak Lanjut (Follow-Up)',
        risk: 'Catatan revisi nomor 1 TPI pada Monev: ada notula rapat tetapi tidak ada bukti tindak lanjut nyata dari hasil monev.',
        solution:
          'Wajib lampirkan matriks RTL lengkap dengan kolom status penyelesaian (Open / In Progress / Done) dan bukti fisiknya.'
      },
      {
        point: 'Keterlibatan Pimpinan Satker',
        risk: 'TPI memeriksa apakah rapat dipimpin langsung oleh Kepala BPS atau diwakilkan.',
        solution:
          'Pastikan notula dan daftar hadir ditandatangani oleh Kepala BPS Sitaro.'
      }
    ],
    referenceTemplate: {
      title: 'Template Matriks Rencana Tindak Lanjut (RTL) Monev',
      formatType: 'XLSX / DOCX'
    },
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI',
    tpiApprovalNotes:
      'Nilai maksimal: ada kesinambungan bukti antara laporan triwulan berjalan dengan penyelesaian rekomendasi sebelumnya.'
  },
  {
    id: 'pilar1-role-model-agen-perubahan',
    pilarId: '1',
    pilarName: 'Manajemen Perubahan',
    category: 'Role Model & Agen Perubahan',
    title: 'Penetapan Role Model & Agen Perubahan Berkinerja Tinggi',
    description:
      'Pemilihan agen perubahan dan pimpinan sebagai role model budaya kerja berAKHLAK dengan proposal rencana aksi yang berdampak nyata.',
    keywords: [
      'role model',
      'agen perubahan',
      'agent of change',
      'budaya kerja',
      'pola pikir',
      'berakhlak',
      'keteladanan'
    ],
    recommendedDocuments: [
      {
        name: 'SK Penetapan Role Model dan Agen Perubahan BPS Kabupaten Kepulauan Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'SK resmi yang memuat kriteria integritas dan prestasi pegawai terpilih.'
      },
      {
        name: 'Proposal Rencana Aksi Inovasi Agen Perubahan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Dokumen inisiatif/program kerja perubahan budaya atau digitalisasi satker.'
      },
      {
        name: 'Laporan Monitoring & Capaian Kinerja Agen Perubahan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Bukti konkret keberhasilan rencana aksi agen perubahan terhadap kinerja satker.'
      },
      {
        name: 'Bukti Sosialisasi & Internalisasi Core Values ASN BerAKHLAK',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Foto apel pagi, sharing session internal, atau konten media internal satker.'
      }
    ],
    provenNarration:
      'Pimpinan BPS Kabupaten Kepulauan Sitaro telah menjadi role model keteladanan kedisiplinan dan integritas, serta telah ditetapkan Agen Perubahan melalui SK Kepala BPS Sitaro No. 04/7108/KP.300/2026. Agen Perubahan menyusun rencana aksi inovasi pelayanan dan efisiensi kerja yang telah direalisasikan dan dilaporkan secara berkala dalam Laporan Capaian Kinerja Agen Perubahan Triwulanan, memberikan dampak positif pada percepatan penyusunan publikasi dan kepatuhan pegawai.',
    tpiTips: [
      {
        point: 'Dampak Nyata Rencana Aksi Agen Perubahan',
        risk: 'Agen perubahan sering hanya formalitas SK tanpa ada output inovasi atau laporan perubahan perilaku organisasi.',
        solution:
          'Lampirkan laporan proyek perubahan (Before vs After) yang diinisiasi oleh Agen Perubahan terpilih.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },

  // --------------------------------------------------------------------------
  // PILAR 2: PENATAAN TATALAKSANA
  // --------------------------------------------------------------------------
  {
    id: 'pilar2-sop-administrasi-pelayanan',
    pilarId: '2',
    pilarName: 'Penataan Tatalaksana',
    category: 'Standar Operasional Prosedur (SOP)',
    title: 'Penerapan & Reviu Berkala SOP Penyelenggaraan Tugas',
    description:
      'Peta proses bisnis terintegrasi, penerapan SOP dalam rutinitas kerja, kendali mutu, dan laporan evaluasi SOP.',
    keywords: [
      'sop',
      'standar operasional prosedur',
      'peta proses bisnis',
      'prosedur kerja',
      'reviu sop',
      'evaluasi sop',
      'tatalaksana'
    ],
    recommendedDocuments: [
      {
        name: 'Peta Proses Bisnis BPS Kabupaten Kepulauan Sitaro yang Disahkan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Mengacu pada PermenPAN-RB No. 19/2018 dan peraturan BPS terbaru.'
      },
      {
        name: 'Kumpulan Dokumen SOP Pelayanan, Administrasi, dan Teknis Statistik',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'SOP berformat baku: lembar identitas, flowchart, mutu baku, dan dasar hukum.'
      },
      {
        name: 'Laporan Reviu dan Evaluasi Keterterapan SOP Berkala',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Bukti evaluasi apakah SOP masih relevan atau membutuhkan penyelarasan digital.'
      },
      {
        name: 'Bukti Lembar Kendali Mutu / Checklist Kepatuhan SOP',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: false,
        description:
          'Sampel lembar kerja kendali mutu pengolahan sensus/survei atau administrasi persuratan.'
      }
    ],
    provenNarration:
      'Seluruh operasional pelayanan dan ketatausahaan BPS Kabupaten Kepulauan Sitaro telah berpedoman pada Peta Proses Bisnis dan Standar Operasional Prosedur (SOP) yang ditetapkan melalui Keputusan Kepala BPS Sitaro. Evaluasi kepatuhan dan efektivitas SOP dilaksanakan secara berkala yang dituangkan dalam Laporan Reviu SOP Tahun 2026 No. 11/7108/TL/2026. Hasil evaluasi membuktikan bahwa 100% SOP telah diimplementasikan dengan kepatuhan tinggi serta didukung lembar kendali mutu digital.',
    tpiTips: [
      {
        point: 'Kesesuaian Format Baku SOP PermenPAN-RB',
        risk: 'SOP ditolak jika tidak memiliki flowchart standar (simbol proses, keputusan, konektor) dan tabel mutu baku.',
        solution:
          'Pastikan dokumen SOP memiliki 4 bagian wajib: Identitas SOP, Dasar Hukum, Kualifikasi Pelaksana, dan Flowchart Prosedur.'
      },
      {
        point: 'Bukti Keterterapan di Lapangan',
        risk: 'Hanya melampirkan SK SOP tanpa bukti bahwa SOP tersebut benar-benar dipakai sehari-hari.',
        solution:
          'Sertakan contoh lembar kendali/disposisi/checklist yang sudah terisi dan bertanggal.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Zero Revision'
  },
  {
    id: 'pilar2-spbe-eoffice',
    pilarId: '2',
    pilarName: 'Penataan Tatalaksana',
    category: 'SPBE & E-Office',
    title: 'Pemanfaatan Teknologi Informasi & E-Office dalam Tata Kelola',
    description:
      'Digitalisasi persuratan (Srikandi), administrasi pegawai (SIMPEG), dan inovasi aplikasi pendukung lokal.',
    keywords: [
      'spbe',
      'e-office',
      'srikandi',
      'teknologi informasi',
      'digitalisasi',
      'paperless',
      'sistem elektronik'
    ],
    recommendedDocuments: [
      {
        name: 'Laporan Pemanfaatan Aplikasi Persuratan Digital (Srikandi / E-Office BPS)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Statistik naskah dinas masuk/keluar secara elektronik dan tanda tangan digital (TTE).'
      },
      {
        name: 'Tangkapan Layar Dashboard Pemanfaatan SIMPEG, Simwaskat, dan Portal BPS Sitaro',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Membuktikan integrasi sistem manajemen data operasional secara online.'
      },
      {
        name: 'SOP Keamanan Informasi & Pengelolaan Aset TI Lokal',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: false,
        description:
          'SOP backup data rutin dan penanganan insiden jaringan kantor.'
      }
    ],
    provenNarration:
      'Tata kelola administrasi pemerintahan di BPS Kabupaten Kepulauan Sitaro telah menerapkan SPBE dan sistem persuratan elektronik Srikandi secara penuh (paperless). Penandatanganan naskah dinas kedinasan menggunakan Tanda Tangan Elektronik (TTE) tersertifikasi BSrE. Pemanfaatan TI dievaluasi dalam Laporan Implementasi SPBE BPS Sitaro Tahun 2026, menghasilkan efisiensi waktu disposisi surat sebesar 75% dibandingkan proses konvensional.',
    tpiTips: [
      {
        point: 'Bukti Penggunaan Riil (Log / Statistik Transaksi)',
        risk: 'TPI meminta bukti statistik apakah surat dinas benar-benar dikirim via Srikandi atau masih cetak manual.',
        solution:
          'Lampirkan rekap log persuratan digital periode triwulanan dari aplikasi Srikandi.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar2-keterbukaan-informasi-ppid',
    pilarId: '2',
    pilarName: 'Penataan Tatalaksana',
    category: 'Keterbukaan Informasi Publik',
    title: 'Keterbukaan Informasi Publik & Layanan PPID',
    description:
      'Daftar Informasi Publik (DIP), SK PPID, dan pemutakhiran portal resmi secara berkelanjutan.',
    keywords: [
      'keterbukaan informasi',
      'ppid',
      'dip',
      'daftar informasi publik',
      'informasi berkala',
      'website sitarokab'
    ],
    recommendedDocuments: [
      {
        name: 'Surat Keputusan Penetapan Tim Pejabat Pengelola Informasi dan Dokumentasi (PPID)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description: 'SK struktur PPID pembantu BPS Kabupaten Kepulauan Sitaro.'
      },
      {
        name: 'Daftar Informasi Publik (DIP) dan Daftar Informasi Dikecualikan (DIK)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Katalog informasi yang wajib diumumkan berkala, serta-merta, dan setiap saat.'
      },
      {
        name: 'Laporan Tahunan Layanan Informasi Publik PPID BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat rekap permohonan informasi masuk, waktu pemenuhan, dan sengketa informasi (nihil).'
      },
      {
        name: 'Tangkapan Layar Pemutakhiran Menu PPID pada Website sitarokab.bps.go.id',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Bukti tautan DIP dan portal permohonan informasi dapat diakses publik.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menjamin keterbukaan informasi publik melalui penguatan fungsi PPID yang ditetapkan dengan SK Kepala Kantor No. 06/7108/OT.200/2026. Daftar Informasi Publik (DIP) telah dimutakhirkan dan dipublikasikan pada portal resmi BPS Sitaro. Seluruh permohonan informasi publik dilayani dalam batas waktu standar tanpa ada sengketa informasi, sebagaimana terdokumentasi dalam Laporan Kinerja PPID Tahun 2026.',
    tpiTips: [
      {
        point:
          'Daftar Informasi Dikecualikan (DIK) Wajib Dilengkapi Uji Konsekuensi',
        risk: 'Jika mencantumkan informasi yang dikecualikan, TPI sering meminta lembar uji konsekuensi hukumnya.',
        solution:
          'Gunakan SK Penetapan DIP/DIK yang selaras dengan pedoman PPID BPS RI pusat.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },

  // --------------------------------------------------------------------------
  // PILAR 3: PENATAAN SISTEM MANAJEMEN SDM
  // --------------------------------------------------------------------------
  {
    id: 'pilar3-perencanaan-kebutuhan-abk-anjab',
    pilarId: '3',
    pilarName: 'Penataan Sistem Manajemen SDM',
    category: 'Perencanaan SDM',
    title: 'Perencanaan Kebutuhan Pegawai Sesuai Beban Kerja (ABK/ANJAB)',
    description:
      'Dokumen Analisis Jabatan (ANJAB), Analisis Beban Kerja (ABK), dan peta jabatan tahun berjalan.',
    keywords: [
      'abk',
      'anjab',
      'analisis beban kerja',
      'analisis jabatan',
      'peta jabatan',
      'perencanaan kebutuhan',
      'formasi pegawai'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Analisis Beban Kerja (ABK) dan Analisis Jabatan (ANJAB) BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Perhitungan riil kebutuhan jam kerja efektif per jabatan pelaksana/fungsional.'
      },
      {
        name: 'Peta Jabatan BPS Kabupaten Kepulauan Sitaro Tahun Berjalan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Struktur formasi eksisting vs kekurangan/kelebihan formasi pegawai.'
      },
      {
        name: 'Nota Dinas Usulan Formasi / Penataan Pegawai ke BPS Provinsi Sulawesi Utara',
        type: 'Undangan',
        isMandatory: false,
        description:
          'Bukti pemanfaatan hasil ABK untuk penyesuaian redistribusi beban tugas.'
      }
    ],
    provenNarration:
      'Perencanaan penempatan dan kebutuhan pegawai BPS Kabupaten Kepulauan Sitaro disusun secara obyektif berdasarkan Dokumen Analisis Beban Kerja (ABK) dan Analisis Jabatan (ANJAB) yang dimutakhirkan pada awal Tahun 2026. Peta jabatan telah ditetapkan sesuai standar BPS RI dan BKN, serta digunakan sebagai dasar pembagian tugas tim kerja agar tidak terjadi kesenjangan beban kerja antar-pegawai.',
    tpiTips: [
      {
        point: 'Kesesuaian dengan Peta Jabatan BPS Provinsi / Pusat',
        risk: 'ABK/ANJAB dibuat lokal tanpa sinkronisasi dengan database SIMPEG/SIASN BKN.',
        solution:
          'Pastikan angka formasi pada ABK sesuai dengan data formasi resmi SIMPEG BPS.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar3-pengembangan-kompetensi-coaching',
    pilarId: '3',
    pilarName: 'Penataan Sistem Manajemen SDM',
    category: 'Pengembangan Kompetensi',
    title: 'Pengembangan Kompetensi Pegawai, Pelatihan & Coaching Berkala',
    description:
      'Rencana pengembangan kompetensi tahunan, sertifikat pelatihan, dan lembar coaching/mentoring atasan.',
    keywords: [
      'pengembangan kompetensi',
      'pelatihan',
      'diklat',
      'coaching',
      'mentoring',
      'sharing session',
      'e-learning',
      'jam pelajaran'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Rencana Pengembangan Kompetensi (RPK) Pegawai BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Target pemenuhan minimal 20 JP per pegawai dalam 1 tahun anggaran.'
      },
      {
        name: 'Laporan Rekapitulasi Realisasi Jam Pelajaran (JP) Pelatihan Pegawai (SIMPEG)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Data realisasi sertifikat Pusdiklat, MOOC, dan workshop statistik/TI.'
      },
      {
        name: 'Lembar Catatan Coaching & Mentoring Atasan Langsung kepada Staf',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Form bimbingan berkala berisi masukan kinerja, kendala, dan solusi perbaikan.'
      },
      {
        name: 'Paket Notula Sharing Session Internal / Transfer Knowledge',
        type: 'Notula',
        isMandatory: false,
        description:
          'Laporan pemaparan materi dari pegawai yang telah selesai mengikuti diklat eksternal.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro berkomitmen meningkatkan profesionalitas aparatur melalui pemenuhan hak pengembangan kompetensi pegawai minimal 20 Jam Pelajaran (JP) per tahun. Realisasi pelatihan dipantau melalui SIMPEG dan didukung program internal coaching/mentoring berkala oleh pejabat fungsional senior dan atasan langsung. Bukti transfer knowledge terdokumentasi dalam Laporan Kegiatan Sharing Session Triwulanan No. 08/7108/SDM/2026.',
    tpiTips: [
      {
        point: 'Bukti Riil Coaching & Mentoring',
        risk: 'TPI kerap mencoret nilai jika pengembangan kompetensi hanya mengandalkan diklat formal tanpa ada bimbingan internal atasan.',
        solution:
          'Lampirkan lembar formulir coaching tatap muka yang ditandatangani pegawai dan atasan langsung.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar3-penilaian-kinerja-skp',
    pilarId: '3',
    pilarName: 'Penataan Sistem Manajemen SDM',
    category: 'Penilaian Kinerja Individu',
    title: 'Penetapan & Evaluasi Sasaran Kinerja Pegawai (SKP) Berjenjang',
    description:
      'Penyelarasan target individu dari IKU pimpinan (Matriks Peran Hasil) dan evaluasi SKP triwulanan.',
    keywords: [
      'skp',
      'sasaran kinerja pegawai',
      'penilaian kinerja',
      'e-kinerja',
      'matriks peran hasil',
      'mph',
      'evaluasi kinerja'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Matriks Peran Hasil (MPH) BPS Kabupaten Kepulauan Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Cascading kinerja dari Kepala Kantor ke seluruh ketua tim dan fungsional.'
      },
      {
        name: 'Rekapitulasi Dokumen Penilaian SKP Triwulan I/II/III/IV via Aplikasi e-Kinerja',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Wajib memuat umpan balik berkala (feedback) berkategori Baik / Sangat Baik.'
      },
      {
        name: 'Laporan Penyelarasan Kinerja Individu dengan Kinerja Organisasi',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: false,
        description:
          'Bukti bahwa target output individu berkontribusi langsung pada capaian IKU satker.'
      }
    ],
    provenNarration:
      'Penilaian kinerja seluruh pegawai BPS Kabupaten Kepulauan Sitaro telah terintegrasi dengan kinerja pimpinan melalui Matriks Peran Hasil (MPH) berpedoman pada PermenPAN-RB No. 6/2022. Evaluasi kinerja pegawai dilakukan secara triwulanan menggunakan aplikasi e-Kinerja BKN disertai bukti dukung realisasi output dan umpan balik berkelanjutan (continuous feedback) dari atasan langsung.',
    tpiTips: [
      {
        point: 'Umpan Balik Berkelanjutan (Feedback) pada e-Kinerja',
        risk: 'SKP hanya memuat nilai angka tanpa ada catatan narasi umpan balik perilaku kerja dari pimpinan.',
        solution:
          'Pastikan ada tangkapan layar atau lembar cetak e-Kinerja yang memuat kolom feedback kualitatif atasan.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Zero Revision'
  },
  {
    id: 'pilar3-penegakan-disiplin-kode-etik',
    pilarId: '3',
    pilarName: 'Penataan Sistem Manajemen SDM',
    category: 'Disiplin & Kode Etik',
    title: 'Penegakan Disiplin Pegawai & Internalisasi Kode Etik ASN',
    description:
      'Pemantauan presensi online harian, surat keterangan nihil hukuman disiplin, dan sosialisasi kode perilaku.',
    keywords: [
      'disiplin',
      'kode etik',
      'kode perilaku',
      'presensi',
      'kehadiran',
      'hukuman disiplin',
      'hukdis',
      'apel pagi'
    ],
    recommendedDocuments: [
      {
        name: 'Surat Keterangan Nihil Penjatuhan Hukuman Disiplin Pegawai dari Kepala BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Surat resmi menyatakan tidak ada pegawai yang dijatuhi sanksi disiplin sedang/berat.'
      },
      {
        name: 'Laporan Rekapitulasi Presensi Kehadiran Pegawai Bulanan (Fingerprint / Mobile)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Tingkat kepatuhan jam kerja, izin, cuti, dan kehadiran apel pagi.'
      },
      {
        name: 'Laporan Kegiatan Sosialisasi Kode Etik & Kode Perilaku Pegawai BPS',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Dilengkapi materi, daftar hadir pegawai, dan dokumentasi kegiatan.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menjunjung tinggi kepatuhan disiplin dan etika ASN melalui pengawasan kehadiran harian secara digital serta pembacaan ikrar kode etik dalam setiap apel rutin. Berdasarkan Surat Keterangan Kepala Kantor No. 02/7108/DISP/2026, pada periode evaluasi tidak terdapat pegawai yang dikenai hukuman disiplin tingkat ringan, sedang, maupun berat (Zero Violation).',
    tpiTips: [
      {
        point: 'Surat Keterangan Nihil Hukdis Bertandatangan Pimpinan',
        risk: 'Salah satu syarat mutlak kelulusan WBK adalah tidak adanya hukuman disiplin sedang/berat.',
        solution:
          'Wajib melampirkan Surat Keterangan resmi bertandatangan basah/elektronik Kepala Kantor.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },

  // --------------------------------------------------------------------------
  // PILAR 4: PENGUATAN AKUNTABILITAS KINERJA
  // --------------------------------------------------------------------------
  {
    id: 'pilar4-keterlibatan-pimpinan-kinerja',
    pilarId: '4',
    pilarName: 'Penguatan Akuntabilitas Kinerja',
    category: 'Keterlibatan Pimpinan',
    title: 'Keterlibatan Pimpinan dalam Perencanaan & Pemantauan Kinerja',
    description:
      'Bukti langsung Kepala BPS memimpin rapat penyusunan Renstra, Perjanjian Kinerja (PK), dan monitoring capaian IKU.',
    keywords: [
      'keterlibatan pimpinan',
      'renstra',
      'perjanjian kinerja',
      'pk',
      'iku',
      'perencanaan kinerja',
      'sakip'
    ],
    recommendedDocuments: [
      {
        name: 'Perjanjian Kinerja (PK) Kepala BPS Kabupaten Kepulauan Sitaro Tahun Berjalan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Ditandatangani antara Kepala BPS Sitaro dengan Kepala BPS Provinsi Sulut.'
      },
      {
        name: 'Paket Notula Rapat Penyusunan Target IKU & Renstra yang Dipimpin Kepala Kantor',
        type: 'Notula',
        isMandatory: true,
        description:
          'Risalah memuat arahan strategis pimpinan terkait penetapan target kinerja.'
      },
      {
        name: 'Dokumentasi Foto Kepala Kantor Memimpin Forum Pembahasan Kinerja',
        type: 'Dokumentasi / Foto',
        isMandatory: true,
        description:
          'Foto pimpinan sedang memberikan arahan pada rapat target SAKIP.'
      }
    ],
    provenNarration:
      'Kepala BPS Kabupaten Kepulauan Sitaro terlibat secara langsung dan aktif dalam seluruh tahapan manajemen kinerja, mulai dari penentuan target pada Dokumen Renstra dan Perjanjian Kinerja (PK) Tahun 2026 hingga rapat pemantauan capaian bulanan. Keterlibatan pimpinan dibuktikan dengan paket notula rapat, daftar hadir bertandatangan, serta arahan berkala perbaikan kualitas akuntabilitas satker.',
    tpiTips: [
      {
        point: 'Pimpinan Bukan Sekadar Menandatangani Dokumen',
        risk: 'TPI menilai rendah jika pimpinan hanya tanda tangan di lembar pengesahan tanpa bukti memimpin rapat pembahasan.',
        solution:
          'Pastikan di notula rapat tertera secara eksplisit "Arahan dan Masukan Kepala BPS Sitaro".'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar4-pengelolaan-akuntabilitas-lkjip',
    pilarId: '4',
    pilarName: 'Penguatan Akuntabilitas Kinerja',
    category: 'Pengelolaan Kinerja',
    title: 'Penyusunan & Publikasi Laporan Kinerja Instansi Pemerintah (LKjIP)',
    description:
      'Dokumen LKjIP berkualitas, tepat waktu penyampaian, dan memuat analisis mendalam penyebab keberhasilan/kegagalan target.',
    keywords: [
      'lkjip',
      'laporan kinerja',
      'akuntabilitas kinerja',
      'capaian iku',
      'analisis kinerja',
      'e-sakip',
      'publikasi lkjip'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Laporan Kinerja Instansi Pemerintah (LKjIP) BPS Sitaro Terakhir Disahkan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat perbandingan target vs realisasi 3 tahun terakhir dan efisiensi anggaran.'
      },
      {
        name: 'Tanda Terima / Bukti Pengunggahan LKjIP ke Aplikasi SMART / E-SAKIP KemenPAN-RB',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Bukti waktu unggah tepat waktu sebelum batas akhir 31 Maret.'
      },
      {
        name: 'Tangkapan Layar Publikasi LKjIP pada Website Resmi BPS Sitaro',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description: 'Transparansi informasi kinerja kepada publik.'
      }
    ],
    provenNarration:
      'Dokumen Laporan Kinerja Instansi Pemerintah (LKjIP) BPS Kabupaten Kepulauan Sitaro disusun tepat waktu dan telah dipublikasikan secara terbuka pada website resmi satker. Laporan memuat analisis mendalam efektivitas program, perbandingan realisasi kinerja antar-tahun, serta efisiensi anggaran. Dokumen telah diunggah dan disetujui pada portal e-SAKIP tanpa catatan revisi mayor.',
    tpiTips: [
      {
        point: 'Analisis Sebab-Akibat Capaian Target Kinerja',
        risk: 'LKjIP hanya menyajikan angka realisasi tanpa ada uraian narasi "Mengapa target tercapai / tidak tercapai" dan "Upaya perbaikan ke depan".',
        solution:
          'Pastikan bab pembahasan kinerja menyajikan analisis komprehensif faktor pendukung dan penghambat capaian IKU.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Zero Revision'
  },

  // --------------------------------------------------------------------------
  // PILAR 5: PENGUATAN PENGAWASAN
  // --------------------------------------------------------------------------
  {
    id: 'pilar5-upg-gratifikasi',
    pilarId: '5',
    pilarName: 'Penguatan Pengawasan',
    category: 'Pengendalian Gratifikasi',
    title: 'Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi Pelaporan',
    description:
      'SK UPG satker, laporan berkala penolakan/penerimaan gratifikasi ke KPK/Inspektorat Utama, dan banner tolak gratifikasi.',
    keywords: [
      'gratifikasi',
      'upg',
      'unit pengendalian gratifikasi',
      'tolak gratifikasi',
      'anti suap',
      'rekonsiliasi gratifikasi',
      'kpk'
    ],
    recommendedDocuments: [
      {
        name: 'SK Pembentukan Unit Pengendalian Gratifikasi (UPG) BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description: 'SK struktur penanggung jawab dan alur pelaporan internal.'
      },
      {
        name: 'Laporan Rekapitulasi Pelaporan Gratifikasi Triwulan I/II/III/IV ke Inspektorat Utama BPS',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Laporan nihil gratifikasi tetap wajib dikirim dan bertanda terima resmi.'
      },
      {
        name: 'Dokumentasi Banner, Stiker, dan Video Anti-Gratifikasi di Meja PST dan Media Sosial',
        type: 'Dokumentasi / Foto',
        isMandatory: false,
        description:
          'Peringatan tegas bahwa seluruh layanan BPS 100% Gratis Rp 0.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menerapkan kebijakan Zero Gratification melalui penguatan Unit Pengendalian Gratifikasi (UPG) yang ditetapkan dengan SK Kepala BPS Sitaro No. 03/7108/UPG/2026. Laporan rekapitulasi penerimaan/penolakan gratifikasi dilaporkan secara tertib setiap triwulan ke Inspektorat Utama BPS RI (dengan status Nihil Penerimaan). Kampanye publik anti-gratifikasi dipasang pada meja resepsionis, ruang PST, dan media sosial.',
    tpiTips: [
      {
        point: 'Laporan Nihil Tetap Wajib Dibuat',
        risk: 'Banyak satker tidak mengirim laporan karena merasa tidak ada pegawai yang menerima gratifikasi.',
        solution:
          'TPI mewajibkan adanya Surat Pengantar Laporan Nihil Gratifikasi setiap triwulannya beserta tanda terima surel/sistem.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar5-spip-manajemen-risiko',
    pilarId: '5',
    pilarName: 'Penguatan Pengawasan',
    category: 'Penerapan SPIP',
    title: 'Penerapan SPIP, Piagam Pengawasan & Matriks Manajemen Risiko',
    description:
      'Penilaian maturitas SPIP, register risiko satker, Rencana Tindak Pengendalian (RTP), dan pemantauan berkala.',
    keywords: [
      'spip',
      'manajemen risiko',
      'matriks risiko',
      'register risiko',
      'rtp',
      'pengendalian intern',
      'risiko kecurangan',
      'fraud'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Penilaian Risiko & Matriks Register Risiko BPS Sitaro Tahun Berjalan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memetakan risiko strategis, operasional, kepatuhan, dan fraud beserta skala dampaknya.'
      },
      {
        name: 'Rencana Tindak Pengendalian (RTP) SPIP BPS Sitaro yang Disahkan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Langkah mitigasi konkret untuk menurunkan level risiko tinggi ke rendah.'
      },
      {
        name: 'Laporan Pemantauan Pelaksanaan RTP SPIP Triwulanan',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Evaluasi berkala apakah langkah mitigasi berjalan efektif.'
      },
      {
        name: 'SK Satuan Tugas Penyelenggaraan SPIP Satker',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: false,
        description: 'Penetapan tim pelaksana dan reviewer intern.'
      }
    ],
    provenNarration:
      'Sistem Pengendalian Intern Pemerintah (SPIP) di BPS Kabupaten Kepulauan Sitaro diimplementasikan secara komprehensif melalui penyusunan Dokumen Register Risiko dan Rencana Tindak Pengendalian (RTP) Tahun 2026. Mitigasi difokuskan pada risiko integritas data sensus/survei dan akuntabilitas keuangan. Pemantauan pelaksanaan RTP dilakukan berkala setiap triwulan (Laporan Pemantauan SPIP No. 10/7108/SPIP/2026) dan berhasil memitigasi seluruh titik rawan.',
    tpiTips: [
      {
        point: 'Keterhubungan Matriks Risiko dengan Realitas Lapangan',
        risk: 'TPI menguji apakah risiko yang dicantumkan relevan dengan kondisi daerah kepulauan (misal: kendala sinyal, cuaca ekstrem pulau terluar, pengadaan).',
        solution:
          'Cantumkan risiko spesifik wilayah kepulauan Sitaro beserta rencana mitigasi daruratnya.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar5-pengaduan-wbs',
    pilarId: '5',
    pilarName: 'Penguatan Pengawasan',
    category: 'Pengaduan & WBS',
    title:
      'Pengelolaan Saluran Pengaduan Masyarakat & Whistleblowing System (WBS)',
    description:
      'Kanal pengaduan offline/online (SP4N-LAPOR!), WBS Inspektorat Utama BPS, perlindungan pelapor, dan laporan rekapitulasi.',
    keywords: [
      'wbs',
      'whistleblowing',
      'pengaduan masyarakat',
      'sp4n lapor',
      'kotak pengaduan',
      'penanganan pengaduan',
      'kanal aduan'
    ],
    recommendedDocuments: [
      {
        name: 'SOP Penanganan Pengaduan Masyarakat dan Whistleblowing System (WBS)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Alur penerimaan, verifikasi awal, investigasi, dan jaminan kerahasiaan identitas pelapor.'
      },
      {
        name: 'Laporan Rekapitulasi Penanganan Pengaduan Masyarakat Berkala',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Tabel tindak lanjut aduan (jika nihil dicantumkan laporan berkala nihil).'
      },
      {
        name: 'Dokumentasi Sarana Pengaduan (Kotak Pengaduan Fisik, Banner LAPOR!, Web WBS BPS)',
        type: 'Dokumentasi / Foto',
        isMandatory: true,
        description:
          'Foto kotak pengaduan berkunci di lobi dan tangkapan layar website pengaduan.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menyediakan sarana penanganan pengaduan yang mudah diakses publik melalui portal SP4N-LAPOR!, Whistleblowing System (WBS) BPS RI, kotak pengaduan fisik di kantor, dan WhatsApp hotline pengaduan resmi. Mekanisme tindak lanjut berpedoman pada SOP Penanganan Pengaduan No. SOP-08/7108/2026 yang menjamin perlindungan identitas pelapor. Selama periode berjalan tidak terdapat pengaduan masyarakat yang masuk (Laporan Pengaduan Nihil No. 07/7108/WAS/2026).',
    tpiTips: [
      {
        point: 'Bukti Kotak Pengaduan Terawat & Diperiksa Rutin',
        risk: 'TPI saat verifikasi lapangan sering memeriksa isi kotak pengaduan fisik kantor dan menanyakan bukti log buku pemeriksaannya.',
        solution:
          'Sertakan foto buku register pembukaan kotak pengaduan berkala oleh tim pengawas internal.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar5-benturan-kepentingan',
    pilarId: '5',
    pilarName: 'Penguatan Pengawasan',
    category: 'Benturan Kepentingan',
    title: 'Penanganan & Deklarasi Bebas Benturan Kepentingan',
    description:
      'Identifikasi potensi benturan kepentingan, surat pernyataan bebas benturan kepentingan seluruh pegawai, dan SOP penanganan.',
    keywords: [
      'benturan kepentingan',
      'conflict of interest',
      'surat pernyataan',
      'potensi benturan',
      'penanganan benturan kepentingan'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Pemetaan & Identifikasi Potensi Benturan Kepentingan BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Pemetaan pada proses pengadaan barang/jasa, rekrutmen mitra statistik, dan pelayanan data.'
      },
      {
        name: 'Kumpulan Surat Pernyataan Bebas Benturan Kepentingan Seluruh Pegawai BPS Sitaro',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Ditandatangani di atas meterai / digital oleh 100% pegawai ASN & PPNPN.'
      },
      {
        name: 'SOP Penanganan Benturan Kepentingan Satker',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Prosedur penarikan diri (recusal) jika ada potensi benturan kepentingan dalam tugas.'
      }
    ],
    provenNarration:
      'Untuk menjaga integritas dan netralitas aparatur, BPS Kabupaten Kepulauan Sitaro telah memetakan titik rawan benturan kepentingan pada seluruh lini pelayanan dan pengadaan barang/jasa. Seluruh pegawai (100%) telah menandatangani Surat Pernyataan Bebas Benturan Kepentingan Tahun 2026. Penanganan jika terjadi indikasi benturan kepentingan berpedoman pada SOP terstandar, dan pada periode evaluasi tercatat Zero Conflict of Interest.',
    tpiTips: [
      {
        point: 'Cakupan 100% Seluruh Pegawai',
        risk: 'Surat pernyataan hanya ditandatangani pejabat struktural, padahal TPI mensyaratkan seluruh pegawai pelaksana dan fungsional.',
        solution:
          'Lampirkan rekapitulasi tanda tangan 100% seluruh ASN dan PPNPN tanpa terkecuali.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Zero Revision'
  },

  // --------------------------------------------------------------------------
  // PILAR 6: PENINGKATAN KUALITAS PELAYANAN PUBLIK
  // --------------------------------------------------------------------------
  {
    id: 'pilar6-standar-pelayanan-maklumat',
    pilarId: '6',
    pilarName: 'Peningkatan Kualitas Pelayanan Publik',
    category: 'Standar Pelayanan & Maklumat',
    title: 'Standar Pelayanan (SP) & Publikasi Maklumat Pelayanan',
    description:
      'Penyusunan SP melalui Forum Konsultasi Publik (FKP), penetapan Maklumat Pelayanan, dan penayangan di ruang PST.',
    keywords: [
      'standar pelayanan',
      'sp',
      'maklumat pelayanan',
      'fkp',
      'forum konsultasi publik',
      'pst',
      'pelayanan statistik terpadu'
    ],
    recommendedDocuments: [
      {
        name: 'Keputusan Kepala BPS Sitaro tentang Penetapan Standar Pelayanan Publik (SP)',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat 14 komponen standar pelayanan sesuai UU No. 25/2009 (persyaratan, tarif Rp 0, waktu layanan).'
      },
      {
        name: 'Berita Acara & Laporan Pelaksanaan Forum Konsultasi Publik (FKP) Penyusunan SP',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Bukti pelibatan akademisi, instansi daerah, media massa, dan masyarakat pengguna data.'
      },
      {
        name: 'Dokumen Maklumat Pelayanan Ditandatangani Kepala BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Pernyataan kesanggupan memberikan pelayanan sesuai standar dan siap menerima sanksi bila melanggar.'
      },
      {
        name: 'Foto Dokumentasi Display Maklumat Pelayanan di Ruang Layanan PST dan Website',
        type: 'Dokumentasi / Foto',
        isMandatory: true,
        description:
          'Foto pigura maklumat di front office PST yang terlihat jelas oleh pengunjung.'
      }
    ],
    provenNarration:
      'Standar Pelayanan Publik (SP) BPS Kabupaten Kepulauan Sitaro telah ditetapkan melalui Keputusan Kepala BPS Sitaro No. 05/7108/SP/2026 yang disusun secara partisipatif melalui Forum Konsultasi Publik (FKP) bersama stakeholders dan pengguna data. Pernyataan komitmen tertuang dalam Maklumat Pelayanan yang dipajang pada ruang Pelayanan Statistik Terpadu (PST) dan website. Pelayanan diberikan tanpa diskriminasi dengan tarif resmi Rp 0 (Gratis).',
    tpiTips: [
      {
        point: 'Keterlibatan Pihak Luar pada Berita Acara FKP',
        risk: 'TPI mensyaratkan Berita Acara FKP harus ditandatangani perwakilan luar satker (Bapelitbangda, akademisi/guru, media/LSM).',
        solution:
          'Pastikan daftar hadir dan lembar tanda tangan berita acara FKP melibatkan unsur lintas sektor daerah Sitaro.'
      }
    ],
    referenceTemplate: {
      title: 'Contoh Berita Acara Forum Konsultasi Publik (FKP)',
      formatType: 'DOCX / PDF'
    },
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI'
  },
  {
    id: 'pilar6-budaya-layanan-difabel',
    pilarId: '6',
    pilarName: 'Peningkatan Kualitas Pelayanan Publik',
    category: 'Budaya Pelayanan & Fasilitas Inklusif',
    title: 'Budaya Pelayanan Prima & Penyediaan Sarana Ramah Kelompok Rentan',
    description:
      'Pelatihan service excellence petugas PST, maklumat pelayanan ramah difabel, jalur pemandu, kursi roda, dan ruang laktasi.',
    keywords: [
      'pelayanan prima',
      'service excellence',
      'kelompok rentan',
      'difabel',
      'kursi roda',
      'jalur pemandu',
      'laktasi',
      'ramah anak',
      'front office'
    ],
    recommendedDocuments: [
      {
        name: 'Laporan Pelaksanaan Pelatihan Service Excellence bagi Petugas Front Office PST',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Pelatihan etika layanan, hospitality, dan penanganan pengunjung berkebutuhan khusus.'
      },
      {
        name: 'Dokumentasi Foto Sarana Ramah Difabel & Kelompok Rentan di Kantor BPS Sitaro',
        type: 'Dokumentasi / Foto',
        isMandatory: true,
        description:
          'Foto ramp / jalur kursi roda, guiding block, toilet difabel, kursi roda, dan ruang laktasi.'
      },
      {
        name: 'SOP Pelayanan bagi Pengunjung Khusus / Penyandang Disabilitas',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Panduan prioritas pendampingan petugas dari pintu masuk hingga selesai layanan.'
      },
      {
        name: 'SK Penunjukan Petugas Layanan PST dan Agen Pelayanan Statistik',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: false,
        description: 'Petugas piket PST yang kompeten dan ramah.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menerapkan budaya pelayanan prima berorientasi kepuasan konsumen (customer satisfaction). Petugas front office PST telah dibekali pelatihan Service Excellence. Kantor telah dilengkapi fasilitas ramah kelompok rentan (kursi roda, jalur pemandu difabel, toilet khusus, ruang laktasi, dan loket prioritas). Penerapan didukung SOP Pelayanan Khusus Pengunjung Disabilitas No. SOP-12/7108/2026.',
    tpiTips: [
      {
        point: 'Fasilitas Ramah Kelompok Rentan Jadi Fokus Utama TPI & TPN',
        risk: 'KemenPAN-RB sangat ketat terhadap ketersediaan sarana disabilitas. Kantor tanpa sarana difabel sulit lolos WBK.',
        solution:
          'Lampirkan foto jelas seluruh sarana inklusif beserta kartu kendali pemeliharaannya.'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Best Practice'
  },
  {
    id: 'pilar6-survei-ikm-ipak',
    pilarId: '6',
    pilarName: 'Peningkatan Kualitas Pelayanan Publik',
    category: 'Survei Kepuasan (IKM & IPAK)',
    title: 'Pengelolaan Survei Kepuasan Konsumen (IKM & IPAK) & Tindak Lanjut',
    description:
      'Laporan Survei Kebutuhan Data (SKD), capaian Indeks Kepuasan Masyarakat (IKM > 3.6 / > 90), IPAK anti-korupsi, dan publikasi luas.',
    keywords: [
      'ikm',
      'ipak',
      'survei kepuasan',
      'skd',
      'survei kebutuhan data',
      'indeks kepuasan',
      'persepsi anti korupsi',
      'tindak lanjut survei'
    ],
    recommendedDocuments: [
      {
        name: 'Laporan Resmi Survei Kebutuhan Data (SKD) BPS Kabupaten Kepulauan Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat nilai IKM, IPAK, Indeks Kualitas Data (IKD), serta profil responden.'
      },
      {
        name: 'Matriks Rencana Tindak Lanjut Rekomendasi Hasil Survei Kepuasan Konsumen',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Tindak lanjut atas kritik dan saran pengunjung PST pada survei sebelumnya.'
      },
      {
        name: 'Dokumentasi Publikasi Nilai IKM & IPAK di Media Luar Ruang dan Medsos',
        type: 'Dokumentasi / Foto',
        isMandatory: true,
        description:
          'Infografis nilai IKM terpampang di lobi kantor dan akun Instagram/Facebook BPS Sitaro.'
      }
    ],
    provenNarration:
      'Tingkat kepuasan masyarakat terhadap layanan PST BPS Kabupaten Kepulauan Sitaro diukur secara ilmiah melalui Survei Kebutuhan Data (SKD) berkala. Capaian Indeks Kepuasan Masyarakat (IKM) meraih predikat "Sangat Baik" (skor 3.92 dari skala 4.00) dan Indeks Persepsi Anti Korupsi (IPAK) mencapai nilai 4.00 (Sempurna / Bebas Pungli). Hasil survei dipublikasikan secara berkala dan seluruh masukan responden telah ditindaklanjuti dalam Matriks Perbaikan Layanan Tahun 2026.',
    tpiTips: [
      {
        point: 'Kriteria Nilai Minimal Lolos WBK',
        risk: 'Syarat mutlak lolos evaluasi TPI: nilai IKM minimal 3.20 (skala 4) atau 80.00 (skala 100), dan nilai IPAK minimal 3.60.',
        solution:
          'Cantumkan angka riil capaian IKM dan IPAK terbaru serta sertakan bukti publikasi banner nilainya.'
      },
      {
        point: 'Ketersediaan Matriks Perbaikan Berkelanjutan',
        risk: 'Ada laporan survei tetapi tidak ada tindak lanjut atas keluhan pengunjung.',
        solution:
          'Lampirkan tabel perbaikan fasilitas / kecepatan layanan berdasarkan saran responden SKD.'
      }
    ],
    referenceTemplate: {
      title: 'Format Matriks Tindak Lanjut Hasil Survei Kepuasan (SKD)',
      formatType: 'DOCX / XLSX'
    },
    sampleYear: 2025,
    approvalStatus: 'Approved by TPI RI',
    tpiApprovalNotes:
      'Nilai sempurna: nilai IKM dan IPAK di atas rata-rata nasional dan didukung tindak lanjut perbaikan riil.'
  },
  {
    id: 'pilar6-inovasi-pelayanan-publik',
    pilarId: '6',
    pilarName: 'Peningkatan Kualitas Pelayanan Publik',
    category: 'Inovasi Pelayanan',
    title: 'Pengembangan & Replikasi Inovasi Pelayanan Publik Unggulan',
    description:
      'Inovasi aplikasi pelayanan data statistik atau kemudahan operasional satker kepulauan beserta perbandingan Before vs After.',
    keywords: [
      'inovasi',
      'inovasi pelayanan',
      'kebaruan',
      'before after',
      'efisiensi layanan',
      'replikasi inovasi',
      'aplikasi pelayanan'
    ],
    recommendedDocuments: [
      {
        name: 'Dokumen Profil / Proposal Inovasi Pelayanan Publik BPS Sitaro',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: true,
        description:
          'Memuat latar belakang masalah kepulauan, ide kebaruan, alur sistem, dan dampak efisiensi.'
      },
      {
        name: 'Matriks Perbandingan Kondisi Sebelum dan Sesudah Inovasi (Before vs After)',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Kuantifikasi efisiensi waktu, biaya perjalanan antar-pulau, dan kepuasan pemda.'
      },
      {
        name: 'Testimoni Pengguna Layanan / Piagam Penghargaan / Replikasi dari Pihak Eksternal',
        type: 'Dokumen Pendukung Lainnya',
        isMandatory: true,
        description:
          'Surat apresiasi dari Pemkab Kepulauan Siau Tagulandang Biaro atau pengguna data.'
      },
      {
        name: 'Buku Panduan Penggunaan / Manual Book Inovasi dan Tangkapan Layar Aplikasi',
        type: 'Laporan / Output / SK / SOP',
        isMandatory: false,
        description: 'Panduan teknis operasional sistem inovasi.'
      }
    ],
    provenNarration:
      'BPS Kabupaten Kepulauan Sitaro menghadirkan inovasi pelayanan publik terdepan untuk menjawab tantangan geografis kepulauan wilayah 3T. Inovasi ini memangkas waktu pemenuhan data statistik dari 3 hari menjadi hitungan menit secara digital tanpa biaya perjalanan antar-pulau (Before vs After terlampir). Efektivitas inovasi dibuktikan dengan meningkatnya pemanfaatan portal data dan adanya surat apresiasi serta testimoni kepuasan dari pemangku kepentingan daerah.',
    tpiTips: [
      {
        point: 'Kuantifikasi Manfaat (Before vs After)',
        risk: 'TPI sering menggugurkan inovasi jika hanya bersifat aplikasi pajangan tanpa data riil penghematan waktu/biaya.',
        solution:
          'Wajib lampirkan tabel kuantitatif Before vs After (misal: waktu layanan sebelum inovasi vs sesudah inovasi).'
      }
    ],
    sampleYear: 2025,
    approvalStatus: 'Zero Revision'
  }
];

// ============================================================================
// MATCHING ALGORITHM (SIMILARITY MATCHER)
// ============================================================================

/**
 * Menghitung similarity score antara teks pertanyaan / penjelasan operator
 * terhadap bank referensi praktik terbaik bukti dukung.
 */
export function getSmartSuggestion(
  params: SmartSuggestionParams
): SmartSuggestionMatchResult {
  const { pilar_id, judul_pertanyaan = '', penjelasan = '' } = params;

  const targetText = `${judul_pertanyaan} ${penjelasan}`.toLowerCase();

  // Filter saran berdasarkan pilar jika tersedia
  const pilarFiltered = pilar_id
    ? SMART_SUGGESTIONS_BANK.filter(
        (item) => String(item.pilarId) === String(pilar_id)
      )
    : SMART_SUGGESTIONS_BANK;

  let bestSuggestion: SmartSuggestionItem =
    pilarFiltered[0] || SMART_SUGGESTIONS_BANK[0];
  let highestScore = -1;
  let bestMatchedKeywords: string[] = [];

  for (const item of SMART_SUGGESTIONS_BANK) {
    let score = 0;
    const currentMatchedKeywords: string[] = [];

    // Bobot 1: Kesesuaian Pilar (jika sama, berikan bonus 25 poin)
    if (pilar_id && String(item.pilarId) === String(pilar_id)) {
      score += 25;
    }

    // Bobot 2: Kesesuaian Kata Kunci Spesifik (tiap kata kunci bernilai 15 poin)
    for (const kw of item.keywords) {
      const lowerKw = kw.toLowerCase();
      if (targetText.includes(lowerKw)) {
        score += 15;
        currentMatchedKeywords.push(kw);
      }
    }

    // Bobot 3: Kesesuaian Judul / Kategori (10 poin)
    if (targetText.includes(item.category.toLowerCase())) {
      score += 10;
      currentMatchedKeywords.push(item.category);
    }

    // Jika skor lebih tinggi, jadikan kandidat terbaik
    if (score > highestScore) {
      highestScore = score;
      bestSuggestion = item;
      bestMatchedKeywords = currentMatchedKeywords;
    }
  }

  // Jika tidak ada kata kunci yang cocok sama sekali, gunakan rekomendasi pertama dari pilar terkait
  if (bestMatchedKeywords.length === 0 && pilarFiltered.length > 0) {
    bestSuggestion = pilarFiltered[0];
    bestMatchedKeywords = [bestSuggestion.category];
    highestScore = 30;
  }

  // Ambil daftar seluruh saran dalam pilar terkait untuk navigasi fleksibel di UI
  const allSuggestionsForPilar = SMART_SUGGESTIONS_BANK.filter(
    (item) => String(item.pilarId) === String(bestSuggestion.pilarId)
  );

  return {
    suggestion: bestSuggestion,
    matchScore: Math.min(highestScore, 100),
    matchedKeywords: Array.from(new Set(bestMatchedKeywords)),
    allSuggestionsForPilar
  };
}
