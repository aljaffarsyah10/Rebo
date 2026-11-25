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
