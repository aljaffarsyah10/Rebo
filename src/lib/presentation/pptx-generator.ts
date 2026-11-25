import PptxGenJS from 'pptxgenjs';

export interface SlideContentItem {
  badge?: string;
  title: string;
  description?: string;
  points: string[];
  highlight?: string;
}

export interface SlideData {
  id: number;
  slideNumber: number;
  category: string;
  title: string;
  subtitle: string;
  talkingPoints: string;
  theme: 'dark' | 'light';
  items?: SlideContentItem[];
  stats?: Array<{
    label: string;
    value: string;
    sublabel: string;
    color?: string;
  }>;
  footerNote?: string;
}

export interface PresentationDeckData {
  satkerName: string;
  satkerShort: string;
  satkerKode: string;
  tahun: number;
  namaKepala: string;
  nipKepala: string;
  namaKetuaZi: string;
  ikmScore: number;
  ipakScore: number;
  totalLkeScore: number;
  slides: SlideData[];
}

export const DEFAULT_PRESENTATION_DATA: PresentationDeckData = {
  satkerName:
    'Badan Pusat Statistik Kabupaten Kepulauan Siau Tagulandang Biaro',
  satkerShort: 'BPS Kab. Sitaro',
  satkerKode: '7108',
  tahun: 2026,
  namaKepala: 'Ir. Pimpinan BPS Sitaro, M.Si',
  nipKepala: '197501012000031001',
  namaKetuaZi: 'Ketua Tim Pembangunan ZI BPS Sitaro, S.ST',
  ikmScore: 3.84,
  ipakScore: 3.92,
  totalLkeScore: 92.45,
  slides: [
    {
      id: 1,
      slideNumber: 1,
      category: 'COVER PAPARAN RESMI',
      title: 'PAPARAN PEMBANGUNAN ZONA INTEGRITAS (ZI)',
      subtitle:
        'Menuju Predikat Wilayah Bebas dari Korupsi (WBK) BPS Kabupaten Kepulauan Sitaro',
      talkingPoints:
        'Selamat pagi Bapak/Ibu Tim Penilai Nasional (TPN KemenPAN-RB / TPI BPS RI). Kami mempersembahkan komitmen nyata, transformasi kultural, dan akselerasi layanan statistik terpadu di wilayah kepulauan terluar Kabupaten Kepulauan Siau Tagulandang Biaro.',
      theme: 'dark',
      footerNote:
        'Dihadapan Tim Penilai Nasional (TPN KemenPAN-RB / TPI BPS RI) Tahun 2026'
    },
    {
      id: 2,
      slideNumber: 2,
      category: 'PROFIL SATKER & KARAKTERISTIK DAERAH',
      title: 'Karakteristik Wilayah Kepulauan & Profil Satker',
      subtitle:
        'Tantangan Geografis 3T Dijawab dengan Efisiensi dan Transformasi Layanan Digital Terpadu',
      talkingPoints:
        'BPS Sitaro memiliki wilayah kerja unik yang terdiri dari 3 kluster pulau besar (Siau, Tagulandang, Biaro) dengan total 47 pulau. Akses antar-pulau sangat bergantung pada cuaca dan pelayaran laut, namun hal ini justru memicu kami melahirkan inovasi digital agar pelayanan tetap cepat, inklusif, dan bebas biaya.',
      theme: 'light',
      stats: [
        {
          label: 'Kluster Kepulauan',
          value: '3 Gugus',
          sublabel: 'Siau, Tagulandang, & Biaro (47 Pulau)',
          color: '003366'
        },
        {
          label: 'Kekuatan SDM',
          value: '19 ASN',
          sublabel: '100% BerAKHLAK & Berkomitmen Integritas',
          color: '059669'
        },
        {
          label: 'Akselerasi Digital',
          value: '100% Online',
          sublabel: 'Pelayanan Statistik Terpadu Tanpa Batas Laut',
          color: 'D97706'
        }
      ],
      items: [
        {
          badge: 'GEOGRAFIS',
          title: 'Tantangan Wilayah 3T',
          points: [
            'Satker kepulauan di perbatasan utara Sulawesi Utara.',
            'Ketergantungan pada transportasi laut dan faktor cuaca ekstrem.',
            'Disparitas jarak antar-gugus pulau diatasi melalui transformasi sistem kerja digital.'
          ]
        },
        {
          badge: 'KOMITMEN',
          title: 'Komitmen Pimpinan',
          points: [
            'Keteladanan pimpinan secara langsung sebagai role model integritas.',
            'Penandatanganan Pakta Integritas seluruh jajaran pegawai tanpa terkecuali.',
            'Prinsip Zero Tolerance terhadap pungli, gratifikasi, dan diskriminasi.'
          ]
        },
        {
          badge: 'PELAYANAN',
          title: 'Fokus Kemanfaatan',
          points: [
            'Penyediaan data statistik berkualitas bagi Pemda Sitaro dan masyarakat.',
            'Layanan cepat ramah disabilitas dan inklusif lintas pulau.',
            'Mendukung perumusan kebijakan pembangunan kepulauan berbasis data valid.'
          ]
        }
      ]
    },
    {
      id: 3,
      slideNumber: 3,
      category: 'PENGUNGKIT - PILAR 1',
      title: 'Pilar 1: Manajemen Perubahan',
      subtitle:
        'Membangun Budaya Kerja BerAKHLAK dan Transformasi Pola Pikir (Mindset & Culture Set)',
      talkingPoints:
        'Pada Pilar Manajemen Perubahan, kami memastikan perubahan mindset dan budaya kerja terjadi menyeluruh. Tim Kerja ZI dibentuk secara akuntabel, pimpinan hadir langsung sebagai role model dalam setiap kegiatan, dan 4 Agen Perubahan mengawal inovasi serta kedisiplinan.',
      theme: 'light',
      items: [
        {
          badge: 'TIM KERJA',
          title: 'Pembentukan Tim ZI Akuntabel',
          points: [
            'Seleksi terbuka anggota tim kerja berdasarkan kompetensi dan komitmen.',
            'Surat Keputusan (SK) Tim Pembangunan ZI ditetapkan tepat waktu.',
            'Rencana Kerja ZI disusun partisipatif dengan target capaian terukur bulanan.'
          ]
        },
        {
          badge: 'ROLE MODEL',
          title: 'Keteladanan Pimpinan',
          points: [
            'Kepala Kantor menjadi pembina apel, memimpin briefing, dan rapat evaluasi.',
            'Pelaksanaan ibadah bersama dan penegakan etika birokrasi tanpa kompromi.',
            'Pimpinan selalu hadir pertama dalam pelayanan dan pengawasan integritas.'
          ]
        },
        {
          badge: 'BUDAYA KERJA',
          title: 'Internalisasi Nilai BerAKHLAK',
          points: [
            'Pemilihan Agen Perubahan (Change Agent) penggerak inovasi pelayanan.',
            'Morning briefing harian & doa pagi menguatkan integritas.',
            'Keterlibatan seluruh ASN (100%) dalam sosialisasi anti korupsi.'
          ]
        }
      ],
      footerNote:
        'Capaian Nilai Pilar 1: 100% Pemenuhan & Reform Dokumen Eviden Terverifikasi'
    },
    {
      id: 4,
      slideNumber: 4,
      category: 'PENGUNGKIT - PILAR 2',
      title: 'Pilar 2: Penataan Tatalaksana',
      subtitle:
        'Digitalisasi Tata Kelola Terpadu Berkelanjutan & Efisiensi Proses Bisnis SPBE',
      talkingPoints:
        'Pilar Tatalaksana fokus pada modernisasi proses bisnis dan digitalisasi SPBE. Kami memiliki 45+ SOP standar, sistem pemantauan dokumen digital REBO V2 paperless, serta transparansi informasi publik melalui website resmi dan media sosial aktif.',
      theme: 'light',
      items: [
        {
          badge: 'SOP & PROBIS',
          title: 'Standardisasi 45+ SOP',
          points: [
            'Peta proses bisnis makro satker telah dimutakhirkan sesuai pedoman BPS RI.',
            'Evaluasi berkala terhadap SOP layanan teknis dan substantif.',
            'Seluruh SOP terdokumentasi dan dapat diakses pegawai secara digital.'
          ]
        },
        {
          badge: 'DIGITALISASI SPBE',
          title: 'Implementasi REBO V2 Paperless',
          points: [
            'Sistem digitalisasi eviden ZI realtime menggantikan arsip konvensional.',
            'Penggunaan tanda tangan elektronik (TTE) tersertifikasi BSrE.',
            'Efisiensi anggaran ATK dan percepatan birokrasi lintas pilar kerja.'
          ]
        },
        {
          badge: 'TRANSPARANSI',
          title: 'Keterbukaan Informasi Publik',
          points: [
            'Portal resmi BPS Sitaro menyajikan data publik terbitan terkini 24/7.',
            'Pemberitahuan rilis data statistik strategis secara berkala ke publik.',
            'Penyediaan sarana akses dokumen publik sesuai amanat UU KIP.'
          ]
        }
      ],
      footerNote:
        'Efisiensi Birokrasi: 100% Pengarsipan Digital & Penerapan SPBE Terpadu'
    },
    {
      id: 5,
      slideNumber: 5,
      category: 'PENGUNGKIT - PILAR 3',
      title: 'Pilar 3: Penataan Manajemen SDM',
      subtitle:
        'Pengembangan Kapasitas Profesional Berbasis Meritokrasi & Disiplin ASN Berkinerja Tinggi',
      talkingPoints:
        'Pilar Manajemen SDM menjamin keadilan beban kerja, pemenuhan standar kompetensi minimal 20 JP per tahun, dan apresiasi pegawai berkinerja tinggi. Di BPS Sitaro tercatat Zero Pelanggaran Disiplin dan presensi digital geotagging terlaksana 100%.',
      theme: 'light',
      items: [
        {
          badge: 'BEBAN KERJA',
          title: 'Analisis Beban Kerja (ABK)',
          points: [
            'Perhitungan formasi dan peta jabatan akurat sesuai beban riil kepulauan.',
            'Rotasi dan penugasan internal transparan mencegah kejenuhan.',
            'Keseimbangan tugas teknis sensus/survei dengan tugas administrasi.'
          ]
        },
        {
          badge: 'KOMPETENSI',
          title: 'Pemenuhan 20 JP & Knowledge Sharing',
          points: [
            '100% pegawai memenuhi standar pelatihan minimal 20 Jam Pelajaran (JP).',
            'Program internal Sharing Session statistik dan pengolahan data rutin.',
            'Peningkatan kapabilitas teknis analisis data spasial dan data science.'
          ]
        },
        {
          badge: 'DISIPLIN & REWARD',
          title: 'Reward & Zero Pelanggaran',
          points: [
            'Presensi digital berbasis geotagging dan pengawasan absensi ketat.',
            'Pemberian penghargaan Employee of the Month / Pegawai Teladan triwulanan.',
            'Catatan 0 (nol) pelanggaran kode etik dan disiplin ASN sepanjang 2026.'
          ]
        }
      ],
      footerNote:
        'Tingkat Disiplin ASN: 100% Presensi Geotagging & Nihil Hukuman Disiplin'
    },
    {
      id: 6,
      slideNumber: 6,
      category: 'PENGUNGKIT - PILAR 4',
      title: 'Pilar 4: Penguatan Akuntabilitas',
      subtitle:
        'Keterlibatan Penuh Pimpinan dalam Pengelolaan Kinerja & Pencapaian Output Strategis',
      talkingPoints:
        'Pada Penguatan Akuntabilitas Kinerja, Kepala BPS Sitaro memimpin langsung cascading indikator kinerja utama, monitoring perjanjian kinerja triwulanan, dan penyusunan LAKIP tepat waktu dengan kualitas pelaporan yang teruji akuntabel.',
      theme: 'light',
      items: [
        {
          badge: 'PERENCANAAN',
          title: 'Cascading Perjanjian Kinerja',
          points: [
            'Penyusunan Renstra dan Perjanjian Kinerja (PK) selaras hingga level staf.',
            'Indikator Kinerja Utama (IKU) berorientasi hasil (outcome-oriented).',
            'Matriks pembagian peran dan hasil terdokumentasi terinci.'
          ]
        },
        {
          badge: 'PIMPINAN TERLIBAT',
          title: 'Keterlibatan Aktif Pimpinan',
          points: [
            'Kepala Kantor memimpin rapat evaluasi capaian kinerja bulanan.',
            'Pemantauan serapan anggaran dan efektivitas output belanja negara.',
            'Mitigasi cepat terhadap kendala teknis lapangan di pulau-pulau terluar.'
          ]
        },
        {
          badge: 'LAKIP BERKUALITAS',
          title: 'Pelaporan Kinerja Akuntabel',
          points: [
            'Penyusunan Laporan Kinerja Instansi Pemerintah (LAKIP) tepat waktu.',
            'Realisasi anggaran di atas 98.5% dengan akuntabilitas keuangan bersih.',
            'Capaian target output publikasi data strategis 100% terpenuhi.'
          ]
        }
      ],
      footerNote:
        'Capaian Kinerja Output Satker: 99.8% Tercapai dengan Efisiensi Belanja'
    },
    {
      id: 7,
      slideNumber: 7,
      category: 'PENGUNGKIT - PILAR 5',
      title: 'Pilar 5: Penguatan Pengawasan',
      subtitle:
        'Pencegahan Korupsi, Mitigasi Risiko, dan Penegakan Integritas Menyeluruh',
      talkingPoints:
        'Penguatan Pengawasan adalah benteng integritas kami. Kami menerapkan Zero Gratifikasi lewat Unit Pengendalian Gratifikasi (UPG), kepatuhan 100% LHKPN/LHKASN sebelum tenggat waktu, saluran WBS Berani terlindungi, dan sistem SPIP yang aktif.',
      theme: 'light',
      items: [
        {
          badge: 'GRATIFIKASI',
          title: 'Unit Pengendalian Gratifikasi (UPG)',
          points: [
            'Pemasangan banner & kampanye tolak gratifikasi di seluruh area kantor.',
            'Laporan penolakan dan penerimaan gratifikasi diperbarui berkala.',
            'Catatan 0 (nol) temuan penerimaan suap/gratifikasi di BPS Sitaro.'
          ]
        },
        {
          badge: 'SPIP & RISIKO',
          title: 'Penerapan SPIP Terintegrasi',
          points: [
            'Penyusunan register manajemen risiko satker mencakup risiko cuaca laut.',
            'Audit internal dan pemantauan kepatuhan operasional berkala.',
            'Tidak ada temuan berulang dari Inspektorat Utama maupun BPK RI.'
          ]
        },
        {
          badge: 'KEPATUHAN 100%',
          title: 'WBS & Kepatuhan LHKPN/ASN',
          points: [
            '100% Wajib LHKPN dan LHKASN lapor tepat waktu sebelum batas akhir.',
            'Kanal Whistleblowing System (WBS Berani) terenkripsi dan ramah pelapor.',
            'Penanganan aduan masyarakat cepat dalam waktu < 24 jam.'
          ]
        }
      ],
      footerNote:
        'Integritas Tanpa Celah: 100% LHKPN/LHKASN & Zero Gratifikasi Terlapor'
    },
    {
      id: 8,
      slideNumber: 8,
      category: 'PENGUNGKIT - PILAR 6',
      title: 'Pilar 6: Kualitas Pelayanan Publik',
      subtitle:
        'Pelayanan Inklusif, Prima, dan Berorientasi pada Kepuasan Pengguna Data',
      talkingPoints:
        'Di Pilar Pelayanan Publik, BPS Sitaro memastikan pelayanan statistik terpadu (PST) dapat diakses dengan mudah, cepat, dan ramah kelompok rentan. Maklumat pelayanan kami jalankan dengan komitmen biaya Rp 0,- dan waktu tunggu kurang dari 15 menit.',
      theme: 'light',
      items: [
        {
          badge: 'STANDAR LAYANAN',
          title: 'Standar & Maklumat Pelayanan',
          points: [
            'Maklumat Pelayanan ditandatangani dan dipajang di ruang publik.',
            'Seluruh layanan statistik dipastikan GRATIS (Rp 0,- / Bebas Pungli).',
            'Kompensasi layanan disiapkan apabila terjadi keterlambatan layanan.'
          ]
        },
        {
          badge: 'SARPRAS INKLUSIF',
          title: 'Ramah Kelompok Rentan & Difabel',
          points: [
            'Tersedia kursi roda, jalur pemandu difabel, dan toilet aksesibel.',
            'Ruang laktasi dan pojok bermain anak yang nyaman dan bersih.',
            'Loket prioritas khusus bagi lansia, ibu hamil, dan penyandang disabilitas.'
          ]
        },
        {
          badge: 'BUDAYA 5S',
          title: 'Budaya Hospitality Prima',
          points: [
            'Penerapan standar etika 5S (Senyum, Salam, Sapa, Sopan, Santun).',
            'Survei kepuasan instan berbasis QR Code di meja layanan PST.',
            'Rata-rata waktu penyelesaian konsultasi statistik di bawah 15 menit.'
          ]
        }
      ],
      footerNote:
        'Pelayanan Berintegritas: Bebas Biaya (Rp 0,-) & Ramah Seluruh Kalangan'
    },
    {
      id: 9,
      slideNumber: 9,
      category: 'HASIL - INOVASI UNGGULAN',
      title: 'Inovasi Pelayanan Unggulan Daerah',
      subtitle:
        'Terobosan Cerdas Menjawab Tantangan Konektivitas di Wilayah Kepulauan Terluar',
      talkingPoints:
        'Inovasi unggulan BPS Sitaro dirancang khusus untuk memecahkan hambatan geografis kepulauan. Kami hadirkan PST Si-Datu antar-pulau, Sitaro Fast-Access WhatsApp Bot 24/7, dan sistem internal REBO V2 terpadu yang memantau kesiapan WBK secara realtime.',
      theme: 'light',
      items: [
        {
          badge: 'INOVASI 1',
          title: 'PST Si-Datu (Layanan Antar-Pulau)',
          points: [
            'Pelayanan Statistik Terpadu Digital Antar-Pulau Siau, Tagulandang, Biaro.',
            'Pengguna data di pulau seberang dapat berkonsultasi video call & pesan data tanpa ongkos laut.',
            'Memangkas waktu tempuh layanan dari 6 jam perjalanan kapal menjadi hitungan detik.'
          ],
          highlight: 'Efisiensi Waktu & Biaya Laut Masyarakat Kepulauan'
        },
        {
          badge: 'INOVASI 2',
          title: 'Sitaro Fast-Access (Bot WhatsApp 24/7)',
          points: [
            'Penyediaan data inflasi, kemiskinan, PDRB, dan ketenagakerjaan melalui WhatsApp otomatis.',
            'Ringan dan cepat diakses masyarakat walau pada kondisi sinyal seluler minimum.',
            'Tersedia menu tanya-jawab interaktif dan unduh ringkasan eksekutif publikasi.'
          ],
          highlight: 'Diseminasi Cepat dalam Genggaman Seluruh Warga'
        },
        {
          badge: 'INOVASI 3',
          title: 'REBO V2 & WBS Berani',
          points: [
            'Sistem monitoring ZI komprehensif dengan dashboard realtime dan audit log transparan.',
            'Kanal pengaduan masyarakat berenkripsi tinggi melindungi privasi pelapor.',
            'Paperless, hemat anggaran, dan mempercepat pemenuhan eviden 6 pilar.'
          ],
          highlight: 'Tata Kelola ZI Modern Berstandar Nasional'
        }
      ],
      footerNote:
        'Inovasi Berdampak: Memperpendek Jarak, Mempercepat Layanan, & Menjaga Integritas'
    },
    {
      id: 10,
      slideNumber: 10,
      category: 'HASIL - EVALUASI & SURVEI',
      title: 'Hasil Survei Kepuasan & Nilai LKE WBK',
      subtitle:
        'Bukti Nyata Pengakuan Pengguna Layanan atas Pelayanan Bersih dan Berkualitas',
      talkingPoints:
        'Hasil survei independen membuktikan keberhasilan reformasi kami. Nilai Indeks Kepuasan Masyarakat (IKM) mencapai 3.84 dari skala 4.00 (Kategori Sangat Baik), Indeks Persepsi Anti Korupsi (IPAK) mencapai 3.92 (Sangat Bersih Bebas Pungli), dan total capaian LKE ZI melampaui ambang batas WBK.',
      theme: 'light',
      stats: [
        {
          label: 'Indeks Kepuasan Masyarakat',
          value: '3.84 / 4.00',
          sublabel: 'Kategori: SANGAT BAIK (A)',
          color: '059669'
        },
        {
          label: 'Indeks Persepsi Anti Korupsi',
          value: '3.92 / 4.00',
          sublabel: 'Kategori: SANGAT BERSIH (A+)',
          color: '003366'
        },
        {
          label: 'Total Nilai Evaluasi LKE',
          value: '92.45',
          sublabel: 'Layak Diusulkan Predikat WBK',
          color: 'D97706'
        }
      ],
      items: [
        {
          badge: 'IKM (3.84)',
          title: 'Kepuasan Pengguna Data',
          points: [
            '98.4% responden menyatakan proses pelayanan sangat cepat dan responsif.',
            'Kepuasan tertinggi pada keramahan petugas PST dan kejelasan informasi.',
            'Tidak ada keluhan terkait biaya maupun ketidaksesuaian prosedur.'
          ]
        },
        {
          badge: 'IPAK (3.92)',
          title: 'Bebas Praktik Korupsi',
          points: [
            '100% responden menyatakan tidak ada permintaan imbalan atau uang pelicin.',
            'Tidak ditemukan indikasi diskriminasi dalam pelayanan data.',
            'Masyarakat percaya penuh pada integritas pegawai BPS Sitaro.'
          ]
        },
        {
          badge: 'NILAI LKE (92.45)',
          title: 'Kesiapan Predikat WBK',
          points: [
            'Komponen Pengungkit: 54.85 / 60.00 (91.4%).',
            'Komponen Hasil: 37.60 / 40.00 (94.0%).',
            'Semua kriteria syarat mutlak terpenuhi lengkap dengan bukti dukung valid.'
          ]
        }
      ],
      footerNote:
        'Kesimpulan: BPS Sitaro Sangat Siap dan Layak Meraih Predikat WBK 2026'
    },
    {
      id: 11,
      slideNumber: 11,
      category: 'KOMITMEN & PENUTUP',
      title: 'Komitmen Keberlanjutan & Penutup',
      subtitle:
        'Satu Semangat, Terus Melayani: Dari Gerbang Kepulauan Sitaro untuk Indonesia Maju',
      talkingPoints:
        'Sebagai penutup, kami menegaskan bahwa pembangunan Zona Integritas di BPS Kabupaten Kepulauan Sitaro bukanlah seremonial sesaat, melainkan komitmen berkelanjutan. Kami siap menjaga amanah ini demi pelayanan data statistik yang bersih, akurat, dan berdampak bagi kemajuan bangsa.',
      theme: 'dark',
      items: [
        {
          badge: 'KONSISTENSI',
          title: 'Keberlanjutan Budaya Integritas',
          points: [
            'Mempertahankan dan meningkatkan seluruh capaian 6 pilar secara konsisten.',
            'Pembaruan berkala inovasi pelayanan berbasis masukan langsung masyarakat pengguna data.'
          ]
        },
        {
          badge: 'AKUNTABILITAS',
          title: 'Nol Toleransi Penyimpangan',
          points: [
            'Menjaga predikat Zero Gratifikasi, Zero Pelanggaran Kode Etik, dan 100% Kepatuhan LHKPN.',
            'Terbuka terhadap audit, masukan masyarakat, dan evaluasi berkelanjutan dari TPI & TPN.'
          ]
        },
        {
          badge: 'DAMPAK NYATA',
          title: 'Data Berkualitas untuk Pembangunan',
          points: [
            'Mendukung perumusan kebijakan strategis pengentasan kemiskinan dan kemajuan kepulauan.',
            'Menjadi garda terdepan penyedia Satu Data Indonesia di batas utara Nusantara.'
          ]
        }
      ],
      footerNote:
        'Terima Kasih atas Perhatian dan Bimbingan Tim Penilai Nasional (TPN KemenPAN-RB / TPI BPS RI)'
    }
  ]
};

/**
 * Palette Warna Resmi Desain Presentasi BPS:
 * - Navy Blue: 003366 (Kewibawaan, Kepercayaan, BPS Brand)
 * - Gold: FFBF00 / D97706 (Keunggulan, Prestasi Zona Integritas)
 * - Emerald Green: 059669 (Integritas, Bersih, WBK)
 * - Dark Slate: 0F172A (Teks Utama Kontras Tinggi)
 * - Light Background: F8FAFC (Latar Elegan, Bersih)
 */
const COLOR_NAVY = '003366';
const COLOR_GOLD = 'FFBF00';
const COLOR_EMERALD = '059669';
const COLOR_DARK_SLATE = '0F172A';
const COLOR_MUTED = '475569';
const COLOR_LIGHT_BG = 'F8FAFC';
const COLOR_WHITE = 'FFFFFF';
const COLOR_BORDER = 'E2E8F0';

/**
 * Generator Presentasi PowerPoint (.pptx) menggunakan pptxgenjs
 * Menghasilkan Buffer presentasi OpenXML standar yang kompatibel dengan MS PowerPoint, Google Slides, LibreOffice.
 */
export async function generatePptxDeck(
  data: PresentationDeckData = DEFAULT_PRESENTATION_DATA
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  // Pengaturan Metadata Presentasi
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = data.satkerName;
  pptx.company = 'Badan Pusat Statistik';
  pptx.revision = '1';
  pptx.subject = 'Paparan Pembangunan Zona Integritas Menuju WBK';
  pptx.title = `Paparan ZI WBK BPS Kabupaten Kepulauan Sitaro ${data.tahun}`;

  // Iterasi Setiap Slide (11 Slide Standar Paparan TPN)
  for (const slideData of data.slides) {
    const slide = pptx.addSlide();

    // Catatan Pembicara (Speaker Notes)
    if (slideData.talkingPoints) {
      slide.addNotes(
        `CATATAN PAPARAN KEPALA BPS KAB. SITARO:\n\n${slideData.talkingPoints}\n\n[Poin Kunci TPN]:\n- Tekankan keunikan wilayah kepulauan (Siau, Tagulandang, Biaro).\n- Paparkan efisiensi anggaran dan paperless lewat REBO V2.\n- Paparkan hasil survei IKM (${data.ikmScore}) & IPAK (${data.ipakScore}).`
      );
    }

    if (slideData.theme === 'dark') {
      // ----------------------------------------------------
      // SLIDE TEMA GELAP (Cover & Slide Penutup)
      // ----------------------------------------------------
      slide.background = { color: COLOR_NAVY };

      // Top Decorative Accent Line (Gold)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.1,
        fill: { color: COLOR_GOLD },
        line: { color: COLOR_GOLD }
      });

      // Bottom Decorative Accent Line (Emerald)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 5.525,
        w: 10,
        h: 0.1,
        fill: { color: COLOR_EMERALD },
        line: { color: COLOR_EMERALD }
      });

      // Category Pill / Badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 0.6,
        w: 4.5,
        h: 0.35,
        rectRadius: 0.1,
        fill: { color: '0A4B82' },
        line: { color: COLOR_GOLD, width: 1 }
      });

      slide.addText(slideData.category, {
        x: 0.8,
        y: 0.6,
        w: 4.5,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: COLOR_GOLD,
        align: 'center',
        valign: 'middle'
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.1,
        w: 8.4,
        h: 1.1,
        fontSize: 26,
        bold: true,
        color: COLOR_WHITE,
        align: 'left',
        valign: 'top'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 2.15,
        w: 8.4,
        h: 0.6,
        fontSize: 13,
        color: '93C5FD',
        align: 'left',
        valign: 'top'
      });

      if (slideData.slideNumber === 1) {
        // Kartu Identitas Presenter di Cover
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 2.9,
          w: 8.4,
          h: 2.1,
          rectRadius: 0.15,
          fill: { color: '072648' },
          line: { color: '1E4976', width: 1.5 }
        });

        // Logo / Icon Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.1,
          y: 3.15,
          w: 1.6,
          h: 1.6,
          rectRadius: 0.1,
          fill: { color: '003366' },
          line: { color: COLOR_GOLD, width: 2 }
        });

        slide.addText('BPS\nSITARO\n7108', {
          x: 1.1,
          y: 3.15,
          w: 1.6,
          h: 1.6,
          fontSize: 14,
          bold: true,
          color: COLOR_GOLD,
          align: 'center',
          valign: 'middle'
        });

        // Presenter Details
        slide.addText(
          [
            {
              text: 'PEMAPAR UTAMA:\n',
              options: { fontSize: 10, bold: true, color: COLOR_GOLD }
            },
            {
              text: `${data.namaKepala}\n`,
              options: { fontSize: 16, bold: true, color: COLOR_WHITE }
            },
            {
              text: `NIP. ${data.nipKepala} | Kepala BPS Kabupaten Kepulauan Sitaro\n`,
              options: { fontSize: 10.5, color: 'CBD5E1' }
            },
            {
              text: `Ketua Tim Kerja ZI: ${data.namaKetuaZi} | Target: Predikat WBK 2026`,
              options: { fontSize: 9.5, color: '94A3B8' }
            }
          ],
          {
            x: 2.9,
            y: 3.15,
            w: 6.1,
            h: 1.6,
            valign: 'middle'
          }
        );
      } else if (slideData.items && slideData.items.length > 0) {
        // Konten Penutup (3 Kartu Komitmen Horizontal)
        const cardW = 2.65;
        const gap = 0.22;
        const startX = 0.8;
        const cardY = 2.85;
        const cardH = 2.2;

        slideData.items.slice(0, 3).forEach((item, idx) => {
          const cardX = startX + idx * (cardW + gap);

          slide.addShape(pptx.ShapeType.roundRect, {
            x: cardX,
            y: cardY,
            w: cardW,
            h: cardH,
            rectRadius: 0.12,
            fill: { color: '072648' },
            line: { color: '1E4976', width: 1 }
          });

          // Badge
          slide.addText(item.badge || `KOMITMEN ${idx + 1}`, {
            x: cardX + 0.15,
            y: cardY + 0.15,
            w: cardW - 0.3,
            h: 0.25,
            fontSize: 9,
            bold: true,
            color: COLOR_GOLD
          });

          // Title
          slide.addText(item.title, {
            x: cardX + 0.15,
            y: cardY + 0.42,
            w: cardW - 0.3,
            h: 0.45,
            fontSize: 11,
            bold: true,
            color: COLOR_WHITE,
            valign: 'top'
          });

          // Bullet Points
          const bulletTexts = item.points.map((p) => ({
            text: p,
            options: {
              bullet: true,
              fontSize: 9,
              color: 'CBD5E1',
              breakLine: true
            }
          }));

          slide.addText(bulletTexts, {
            x: cardX + 0.15,
            y: cardY + 0.9,
            w: cardW - 0.3,
            h: 1.15,
            valign: 'top'
          });
        });
      }

      // Footer
      if (slideData.footerNote) {
        slide.addText(slideData.footerNote, {
          x: 0.8,
          y: 5.1,
          w: 8.4,
          h: 0.35,
          fontSize: 9,
          color: '94A3B8',
          align: 'center',
          valign: 'middle'
        });
      }
    } else {
      // ----------------------------------------------------
      // SLIDE TEMA TERANG (Slide 2 - 10: Profil, 6 Pilar, Inovasi, Evaluasi)
      // ----------------------------------------------------
      slide.background = { color: COLOR_LIGHT_BG };

      // Top Header Ribbon (Navy Blue Banner)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 1.1,
        fill: { color: COLOR_NAVY }
      });

      // Accent Ribbon Gold Line
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 1.1,
        w: 10,
        h: 0.04,
        fill: { color: COLOR_GOLD }
      });

      // Category Pill
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 0.15,
        w: 3.2,
        h: 0.25,
        rectRadius: 0.08,
        fill: { color: '0A4B82' }
      });

      slide.addText(slideData.category, {
        x: 0.6,
        y: 0.15,
        w: 3.2,
        h: 0.25,
        fontSize: 8.5,
        bold: true,
        color: COLOR_GOLD,
        align: 'center',
        valign: 'middle'
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.6,
        y: 0.42,
        w: 7.2,
        h: 0.42,
        fontSize: 16,
        bold: true,
        color: COLOR_WHITE,
        valign: 'middle'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.6,
        y: 0.82,
        w: 8.8,
        h: 0.25,
        fontSize: 9,
        color: 'CBD5E1',
        valign: 'middle'
      });

      // Satker Logo Tag (Top Right)
      slide.addText(`${data.satkerShort}\nWBK 2026`, {
        x: 8.0,
        y: 0.2,
        w: 1.4,
        h: 0.7,
        fontSize: 9,
        bold: true,
        color: COLOR_GOLD,
        align: 'right',
        valign: 'middle'
      });

      let contentStartY = 1.35;

      // KPI STATS CARDS (Jika ada, seperti di Slide Profil & Hasil Evaluasi)
      if (slideData.stats && slideData.stats.length > 0) {
        const statCount = slideData.stats.length;
        const statW = (8.8 - (statCount - 1) * 0.2) / statCount;
        const statH = 0.85;

        slideData.stats.forEach((st, idx) => {
          const statX = 0.6 + idx * (statW + 0.2);

          slide.addShape(pptx.ShapeType.roundRect, {
            x: statX,
            y: 1.25,
            w: statW,
            h: statH,
            rectRadius: 0.1,
            fill: { color: COLOR_WHITE },
            line: { color: COLOR_BORDER, width: 1 }
          });

          // Left Color Indicator Bar
          slide.addShape(pptx.ShapeType.rect, {
            x: statX,
            y: 1.25,
            w: 0.08,
            h: statH,
            fill: { color: st.color || COLOR_NAVY }
          });

          slide.addText(
            [
              {
                text: `${st.label}\n`,
                options: { fontSize: 8.5, color: COLOR_MUTED }
              },
              {
                text: `${st.value}\n`,
                options: {
                  fontSize: 14,
                  bold: true,
                  color: st.color || COLOR_NAVY
                }
              },
              {
                text: st.sublabel,
                options: { fontSize: 7.5, bold: true, color: COLOR_MUTED }
              }
            ],
            {
              x: statX + 0.15,
              y: 1.25,
              w: statW - 0.2,
              h: statH,
              valign: 'middle'
            }
          );
        });

        contentStartY = 2.22;
      }

      // 3 KOLOM KARTU KONTEN UTAMA
      if (slideData.items && slideData.items.length > 0) {
        const count = Math.min(slideData.items.length, 3);
        const cardW = (8.8 - (count - 1) * 0.25) / count;
        const cardH = 5.0 - contentStartY - 0.25;

        slideData.items.slice(0, 3).forEach((item, idx) => {
          const cardX = 0.6 + idx * (cardW + 0.25);

          // Card Background Box
          slide.addShape(pptx.ShapeType.roundRect, {
            x: cardX,
            y: contentStartY,
            w: cardW,
            h: cardH,
            rectRadius: 0.12,
            fill: { color: COLOR_WHITE },
            line: { color: COLOR_BORDER, width: 1.2 }
          });

          // Top Header of the Card
          slide.addShape(pptx.ShapeType.rect, {
            x: cardX,
            y: contentStartY,
            w: cardW,
            h: 0.55,
            fill: { color: 'F1F5F9' }
          });

          // Badge Pill
          slide.addText(item.badge || `AREA ${idx + 1}`, {
            x: cardX + 0.15,
            y: contentStartY + 0.06,
            w: cardW - 0.3,
            h: 0.2,
            fontSize: 7.5,
            bold: true,
            color: COLOR_NAVY
          });

          // Card Title
          slide.addText(item.title, {
            x: cardX + 0.15,
            y: contentStartY + 0.24,
            w: cardW - 0.3,
            h: 0.28,
            fontSize: 9.5,
            bold: true,
            color: COLOR_DARK_SLATE,
            valign: 'middle'
          });

          // Bullet Points
          const bulletTexts = item.points.map((p) => ({
            text: p,
            options: {
              bullet: true,
              fontSize: 8.5,
              color: COLOR_DARK_SLATE,
              breakLine: true
            }
          }));

          const textHeight = item.highlight ? cardH - 1.25 : cardH - 0.7;

          slide.addText(bulletTexts, {
            x: cardX + 0.15,
            y: contentStartY + 0.65,
            w: cardW - 0.3,
            h: textHeight,
            valign: 'top'
          });

          // Highlight box (jika ada)
          if (item.highlight) {
            slide.addShape(pptx.ShapeType.roundRect, {
              x: cardX + 0.12,
              y: contentStartY + cardH - 0.5,
              w: cardW - 0.24,
              h: 0.4,
              rectRadius: 0.08,
              fill: { color: 'ECFDF5' },
              line: { color: COLOR_EMERALD, width: 0.8 }
            });

            slide.addText(`★ ${item.highlight}`, {
              x: cardX + 0.15,
              y: contentStartY + cardH - 0.5,
              w: cardW - 0.3,
              h: 0.4,
              fontSize: 7.5,
              bold: true,
              color: COLOR_EMERALD,
              align: 'center',
              valign: 'middle'
            });
          }
        });
      }

      // Bottom Bar / Footer
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 5.25,
        w: 10,
        h: 0.375,
        fill: { color: 'F1F5F9' },
        line: { color: COLOR_BORDER }
      });

      // Footer note
      slide.addText(
        slideData.footerNote ||
          `BPS Kabupaten Kepulauan Sitaro | Paparan Evaluasi ZI Menuju WBK ${data.tahun}`,
        {
          x: 0.6,
          y: 5.27,
          w: 7.0,
          h: 0.33,
          fontSize: 8,
          color: COLOR_MUTED,
          valign: 'middle'
        }
      );

      // Slide number
      slide.addText(`${slideData.slideNumber} / ${data.slides.length}`, {
        x: 8.0,
        y: 5.27,
        w: 1.4,
        h: 0.33,
        fontSize: 8.5,
        bold: true,
        color: COLOR_NAVY,
        align: 'right',
        valign: 'middle'
      });
    }
  }

  // Generate buffer OpenXML PPTX
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}
