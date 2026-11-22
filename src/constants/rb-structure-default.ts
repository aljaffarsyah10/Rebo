export const DEFAULT_AREAS_DATA = [
  {
    id_area: 1,
    nama_area: 'Pemenuhan',
    pilar: [
      {
        id_pilar: 2,
        nama_pilar: 'Penataan Tatalaksana',
        subpilar: [
          {
            id_subpilar: 5,
            nama_subpilar: 'Prosedur Operasional Tetap (SOP) Kegiatan Utama',
            pertanyaan: [
              {
                id_pertanyaan: 13,
                deskripsi_pertanyaan:
                  'SOP mengacu pada peta proses bisnis instansi',
                uraian_buktidukung:
                  '(i) Dokumen SOP Teknis dan Non Teknis/Administrasi yg di ttd\r\n(ii) Dokumen SOP Inovasi yg di ttd',
                kategoriPenilaian: [
                  {
                    id_kategori: 38,
                    uraian_kategori:
                      'a. Jika semua SOP unit telah mengacu peta proses bisnis dan juga melakukan inovasi yang selaras;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 39,
                    uraian_kategori:
                      'b. Jika semua SOP unit telah mengacu peta proses bisnis;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 40,
                    uraian_kategori:
                      'c. Jika sebagian SOP unit telah mengacu peta proses bisnis;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 41,
                    uraian_kategori:
                      'd. Jika belum terdapat SOP unit yang mengacu peta proses bisnis.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 14,
                deskripsi_pertanyaan:
                  'Prosedur operasional tetap (SOP) telah diterapkan',
                uraian_buktidukung:
                  '(i) Dokumen monitoring pelaksanaan penerapan SOP sesuai Perka BPS Nomor 19 Tahun 2013 tentang pedoman penyusunan SOP Administrasi Pemerintaha di lingkungan BPS, halaman 47\r\n(ii) Dokumen SOP Inovasi yg di ttd',
                kategoriPenilaian: [
                  {
                    id_kategori: 42,
                    uraian_kategori:
                      'a. Jika unit telah menerapkan seluruh SOP yang ditetapkan organisasi dan juga melakukan inovasi pada SOP yang diterapkan;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 43,
                    uraian_kategori:
                      'b. Jika unit telah menerapkan seluruh SOP yang ditetapkan organisasi;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 44,
                    uraian_kategori:
                      'c. Jika unit telah menerapkan sebagian besar SOP yang ditetapkan organisasi;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 45,
                    uraian_kategori:
                      'd. Jika unit telah menerapkan sebagian kecil SOP yang ditetapkan organisasi;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 46,
                    uraian_kategori:
                      'e. Jika unit belum menerapkan SOP yang telah ditetapkan organisasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 15,
                deskripsi_pertanyaan:
                  'Prosedur operasional tetap (SOP) telah dievaluasi',
                uraian_buktidukung:
                  '(i) Bukti Pelaksanaan Rapat Evaluasi SOP (Undangan, Daftar Hadir, Notulen)\r\n(ii) Kertas Kerja Evaluasi SOP\r\n(iii) Dokumen SOP awal dan SOP Perbaikan',
                kategoriPenilaian: [
                  {
                    id_kategori: 47,
                    uraian_kategori:
                      'a. Jika seluruh SOP utama telah dievaluasi dan telah ditindaklanjuti berupa perbaikan SOP atau usulan perbaikan SOP;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 48,
                    uraian_kategori:
                      'b. Jika sebagian besar SOP utama telah dievaluasi dan telah ditindaklanjuti berupa perbaikan SOP atau usulan perbaikan SOP;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 49,
                    uraian_kategori:
                      'c. Jika sebagian besar SOP utama telah dievaluasi tetapi belum ditindaklanjuti;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 50,
                    uraian_kategori:
                      'd. Jika sebagian kecil SOP utama telah dievaluasi;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 51,
                    uraian_kategori: 'e. Jika SOP belum pernah dievaluasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 6,
            nama_subpilar: 'Sistem Pemerintahan Berbasis Elektronik (SPBE)',
            pertanyaan: [
              {
                id_pertanyaan: 18,
                deskripsi_pertanyaan:
                  'Pemberian pelayanan kepada publik sudah menggunakan teknologi informasi',
                uraian_buktidukung:
                  '(i) Daftar seluruh penerapan teknologi informasi yang digunakan satker terkait pelayanan publik (Misal Website, Romantik, Media Sosial, Layanan Pengaduan, dan atau Inovasi lain jika ada);\r\n(ii) Dokumen Screenshot aplikasi terkait pelayanan publik dan sudah berjalan (seperti Website, Romantik, Media Sosial, Layanan Pengaduan) yang dilengkapi dengan narasi penjelasan penggunaan/pemanfaatan aplikasi TI dalam pelayanan publik;\r\n(iii) Inovasi dilengkapi dengan Laporan Pemanfaatan Aplikasi yang berisi latar belakang/alasan pengembangan aplikasi, pemanfaatan aplikasi tersebut (dilengkapi dengan screenshot aplikasi) serta buku pedoman penggunaan aplikasi.',
                kategoriPenilaian: [
                  {
                    id_kategori: 58,
                    uraian_kategori:
                      'a. Jika unit memberikan pelayanan kepada publik dengan menggunakan teknologi informasi terpusat/unit sendiri dan terdapat inovasi;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 59,
                    uraian_kategori:
                      'b. Jika unit memberikan pelayanan kepada publik dengan menggunakan teknologi informasi secara terpusat;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 60,
                    uraian_kategori:
                      'c. Jika belum memberikan pelayanan kepada publik dengan menggunakan teknologi informasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 19,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan dan evaluasi terhadap pemanfaatan teknologi informasi dalam pengukuran kinerja unit, operasionalisasi SDM, dan pemberian layanan kepada publik',
                uraian_buktidukung:
                  '(i) Laporan monitoring dan evaluasi pemanfaatan TI (triwulanan/semesteran)\r\n(ii) Dokumentasi rapat monitoring dan evaluasi pemanfaatan TI',
                kategoriPenilaian: [
                  {
                    id_kategori: 61,
                    uraian_kategori:
                      'a. Jika laporan monitoring dan evaluasi terhadap pemanfaatan teknologi informasi dalam pengukuran kinerja unit, operasionalisasi SDM, dan pemberian layanan kepada publik sudah dilakukan secara berkala;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 62,
                    uraian_kategori:
                      'b. Jika laporan monitoring dan evaluasi terhadap pemanfaatan teknologi informasi dalam pengukuran kinerja unit, operasionalisasi SDM, dan pemberian layanan kepada publik sudah dilakukan tetapi tidak secara berkala;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 63,
                    uraian_kategori:
                      'c. Jika tidak terdapat monitoring dan evaluasi terhadap pemanfaatan teknologi informasi dalam pengukuran kinerja unit, operasionalisasi SDM, dan pemberian layanan kepada publik.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 16,
                deskripsi_pertanyaan:
                  'Sistem pengukuran kinerja unit sudah menggunakan teknologi informasi',
                uraian_buktidukung:
                  '(i) Daftar seluruh penerapan teknologi informasi yang digunakan satker terkait pengukuran kinerja unit (seperti Simonev, FRA, dan atau inovasi lainnya jika ada)\r\n(ii) Dokumen Screenshot aplikasi terkait pengukuran kinerja unit dan sudah berjalan (Simonev, FRA, dll) yang dilengkapi dengan narasi penjelasan penggunaan/pemanfaatan aplikasi TI dalam pengukuran kinerja unit\r\n(iii) Inovasi dilengkapi dengan Laporan Pemanfaatan Aplikasi yang berisi latar belakang/alasan pengembangan aplikasi, pemanfaatan aplikasi tersebut (dilengkapi dengan screenshot aplikasi) serta buku pedoman penggunaan aplikasi.',
                kategoriPenilaian: [
                  {
                    id_kategori: 52,
                    uraian_kategori:
                      'a. Jika unit memiliki sistem pengukuran kinerja (e-performance/ e-sakip) yang menggunakan teknologi informasi dan juga melakukan inovasi;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 53,
                    uraian_kategori:
                      'b. Jika unit memiliki sistem pengukuran kinerja (e-performance/ e-sakip) yang menggunakan teknologi informasi;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 54,
                    uraian_kategori:
                      'c. Jika belum memiliki sistem pengukuran kinerja (e-performance/ e-sakip) yang menggunakan teknologi informasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 17,
                deskripsi_pertanyaan:
                  'Operasionalisasi manajemen SDM sudah menggunakan teknologi informasi',
                uraian_buktidukung:
                  '(i) Daftar seluruh penerapan teknologi informasi yang digunakan satker terkait operasionalisasi manajemen SDM (Misal SIMPEG dan Sijafung, dan atau inovasi lain jika ada);\r\n(ii) Dokumen screenshot aplikasi terkait operasionalisasi manajemen SDM dan sudah berjalan (Misal SIMPEG dan Sijafung, dan/atau inovasi lain jika ada) yang dilengkapi dengan narasi penjelasan penggunaan/pemanfaatan aplikasi TI dalam operasionalisasi manajemen SDM; \r\n(iii) Inovasi dilengkapi dengan Laporan Pemanfaatan Aplikasi yang berisi latar belakang/alasan pengembangan aplikasi, pemanfaatan aplikasi tersebut (dilengkapi dengan screenshot aplikasi) serta buku pedoman penggunaan aplikasi.',
                kategoriPenilaian: [
                  {
                    id_kategori: 55,
                    uraian_kategori:
                      'a. Jika unit memiliki operasionalisasi manajemen SDM yang menggunakan teknologi informasi dan juga melakukan inovasi;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 56,
                    uraian_kategori:
                      'b. Jika unit memiliki operasionalisasi manajemen SDM yang menggunakan teknologi informasi secara terpusat;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 57,
                    uraian_kategori:
                      'c. Jika belum menggunakan teknologi informasi dalam operasionalisasi manajemen SDM.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 7,
            nama_subpilar: 'Keterbukaan Informasi Publik',
            pertanyaan: [
              {
                id_pertanyaan: 20,
                deskripsi_pertanyaan:
                  'Kebijakan tentang  keterbukaan informasi publik telah diterapkan',
                uraian_buktidukung:
                  '(i) SK Tim PPID Kabupaten Kepulauan Siau Tagulandang Biaro\r\n(ii) Daftar informasi publik satker yang dapat diakses\r\n(iii) Screen shot media pengelolaan informasi publik satker',
                kategoriPenilaian: [
                  {
                    id_kategori: 64,
                    uraian_kategori:
                      'a. Jika sudah terdapat Pejabat Pengelola Informasi Publik (PPID) yang menyebarkan seluruh informasi yang dapat diakses secara mutakhir dan lengkap;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 65,
                    uraian_kategori:
                      'b. Jika sudah terdapat PPID yang menyebarkan sebagian informasi yang dapat diakses secara mutakhir dan lengkap;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 66,
                    uraian_kategori:
                      'c. Jika belum ada PPID dan belum melakukan penyebaran informasi publik.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 21,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan evaluasi pelaksanaan kebijakan keterbukaan informasi publik',
                uraian_buktidukung:
                  '(i) Laporan monitoring dan evaluasi pelaksanaan kebijakan Keterbukaan Informasi Publik (Triwulanan/Semesteran)',
                kategoriPenilaian: [
                  {
                    id_kategori: 67,
                    uraian_kategori:
                      'a. Jika dilakukan monitoring dan evaluasi pelaksanaan kebijakan keterbukaan informasi publik dan telah ditindaklanjuti;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 68,
                    uraian_kategori:
                      'b. Jika monitoring dan evaluasi pelaksanaan kebijakan keterbukaan informasi publik telah dilakukan tetapi belum ditindaklanjuti;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 69,
                    uraian_kategori:
                      'c. Jika monitoring dan evaluasi pelaksanaan kebijakan keterbukaan informasi publik belum dilakukan.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 3,
        nama_pilar: 'Penataan Sistem Manajemen SDM Aparatur',
        subpilar: [
          {
            id_subpilar: 8,
            nama_subpilar:
              'Perencanaan Kebutuhan Pegawai sesuai dengan Kebutuhan Organisasi',
            pertanyaan: [
              {
                id_pertanyaan: 22,
                deskripsi_pertanyaan:
                  'Kebutuhan pegawai yang disusun oleh unit kerja mengacu kepada peta jabatan dan hasil analisis beban kerja untuk masing-masing jabatan',
                uraian_buktidukung:
                  '(i) Kepka 281 Tahun 2021 tentang ABK BPS\r\n(ii) Dokumen Komposisi SDM ABK dan existing pegawai BPS Kabupaten Kepulauan Siau Tagulandang Biaro\r\n(iii) Notulensi Hasil Rapat Pembina Kepegawaian mengenai rencana mutasi, penerimaan/pengadaan pegawai',
                kategoriPenilaian: [
                  {
                    id_kategori: 70,
                    uraian_kategori:
                      'Ya, jika kebutuhan pegawai yang disusun oleh unit kerja mengacu kepada peta jabatan dan hasil analisis beban kerja untuk masing-masing jabatan.',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 71,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 23,
                deskripsi_pertanyaan:
                  'Penempatan pegawai hasil rekrutmen murni mengacu kepada kebutuhan pegawai yang telah disusun per jabatan',
                uraian_buktidukung:
                  '(i) Analisis Kebutuhan Pegawai\r\n(ii) Surat Perintah melaksanakan tugas dari kepala unit kerja\r\n(iii) SK Penempatan dan Jabatan',
                kategoriPenilaian: [
                  {
                    id_kategori: 72,
                    uraian_kategori:
                      'a. Jika semua penempatan pegawai hasil rekrutmen murni mengacu kepada kebutuhan pegawai yang telah disusun per jabatan;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 73,
                    uraian_kategori:
                      'b. Jika sebagian besar penempatan pegawai hasil rekrutmen murni mengacu kepada kebutuhan pegawai yang telah disusun per jabatan;',
                    nilai: 0.0555556
                  },
                  {
                    id_kategori: 74,
                    uraian_kategori:
                      'c. Jika sebagian kecil penempatan pegawai hasil rekrutmen murni mengacu kepada kebutuhan pegawai yang telah disusun per jabatan;',
                    nilai: 0.0277778
                  },
                  {
                    id_kategori: 75,
                    uraian_kategori:
                      'd. Jika penempatan pegawai hasil rekrutmen murni tidak mengacu kepada kebutuhan pegawai yang telah disusun per jabatan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 24,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan dan evaluasi terhadap penempatan pegawai rekrutmen untuk memenuhi kebutuhan jabatan dalam organisasi telah memberikan perbaikan terhadap kinerja unit kerja',
                uraian_buktidukung:
                  '(i) Laporan Monitoring dengan menampilkan perubahan formasi antara ABK dan Existing Pegawai dengan matriks rekap setahun berapa yang masuk, berapa yang pindah atau rotasi jabatan, dst',
                kategoriPenilaian: [
                  {
                    id_kategori: 76,
                    uraian_kategori:
                      'Ya, jika sudah dilakukan monitoring dan evaluasi terhadap penempatan pegawai hasil rekrutmen untuk memenuhi kebutuhan jabatan dalam organisasi telah memberikan perbaikan terhadap kinerja unit kerja.',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 77,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 9,
            nama_subpilar: 'Pola Mutasi Internal',
            pertanyaan: [
              {
                id_pertanyaan: 25,
                deskripsi_pertanyaan:
                  'Dalam melakukan pengembangan karier pegawai, telah dilakukan mutasi pegawai antar jabatan',
                uraian_buktidukung:
                  '(i) SK Mutasi Internal Pegawai\r\n(ii) Notulensi Rapat Mutasi Internal',
                kategoriPenilaian: [
                  {
                    id_kategori: 78,
                    uraian_kategori:
                      'Ya, jika dilakukan mutasi pegawai antar jabatan sebagai wujud dari pengembangan karier pegawai.',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 79,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 26,
                deskripsi_pertanyaan:
                  'Dalam melakukan mutasi pegawai antar jabatan telah memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan',
                uraian_buktidukung:
                  '(i) Notulensi Rapat Mutasi Internal\r\n(ii) SK Mutasi Internal Pegawai\r\n(iii) Analisis Kesenjangan Kompetensi Seluruh Pegawai',
                kategoriPenilaian: [
                  {
                    id_kategori: 80,
                    uraian_kategori:
                      'a. Jika semua mutasi pegawai antar jabatan telah memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan organisasi dan juga unit kerja memberikan pertimbangan terkait hal ini;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 81,
                    uraian_kategori:
                      'b. Jika semua mutasi pegawai antar jabatan telah memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan organisasi;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 82,
                    uraian_kategori:
                      'c. Jika sebagian besar mutasi pegawai antar jabatan telah memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan organisasi;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 83,
                    uraian_kategori:
                      'd. Jika sebagian kecil semua mutasi pegawai antar jabatan telah memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan organisasi;',
                    nilai: 0.0416667
                  },
                  {
                    id_kategori: 84,
                    uraian_kategori:
                      'e. Jika mutasi pegawai antar jabatan belum memperhatikan kompetensi jabatan dan mengikuti pola mutasi yang telah ditetapkan organisasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 27,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan evaluasi terhadap kegiatan mutasi yang telah dilakukan dalam kaitannya dengan perbaikan kinerja',
                uraian_buktidukung:
                  '(i) Laporan Monitoring dan Evaluasi Pegawai yang mutasi/rotasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 85,
                    uraian_kategori:
                      'Ya, jika sudah dilakukan monitoring dan evaluasi terhadap kegiatan mutasi yang telah dilakukan dalam kaitannya dengan perbaikan kinerja.',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 86,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 10,
            nama_subpilar: 'Pengembangan Pegawai Berbasis Kompetensi',
            pertanyaan: [
              {
                id_pertanyaan: 28,
                deskripsi_pertanyaan:
                  'Unit Kerja melakukan Training Need Analysis Untuk pengembangan kompetensi',
                uraian_buktidukung:
                  '(i) Dokumen Analisis Kebutuhan Diklat/Bimtek/Pengmbangan pegawai (Training Need Analisis)',
                kategoriPenilaian: [
                  {
                    id_kategori: 87,
                    uraian_kategori:
                      'Ya, jika sudah dilakukan Training Need Analysis Untuk pengembangan kompetensi.',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 88,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 29,
                deskripsi_pertanyaan:
                  'Dalam menyusun rencana pengembangan kompetensi pegawai, telah mempertimbangkan hasil pengelolaan kinerja pegawai',
                uraian_buktidukung:
                  '(i) Analisis kesenjangan kompetensi seluruh pegawai\r\n(ii) Rencana pengembangan kompetensi pegawai\r\n(iii) Analisa kebutuhan diklat',
                kategoriPenilaian: [
                  {
                    id_kategori: 89,
                    uraian_kategori:
                      'a. Jika semua rencana pengembangan kompetensi pegawai mempertimbangkan hasil pengelolaan kinerja pegawai;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 90,
                    uraian_kategori:
                      'b. Jika sebagian besar rencana pengembangan kompetensi pegawai mempertimbangkan hasil pengelolaan kinerja pegawai;',
                    nilai: 0.138889
                  },
                  {
                    id_kategori: 91,
                    uraian_kategori:
                      'c. Jika sebagian kecil rencana pengembangan kompetensi pegawai mempertimbangkan hasil pengelolaan kinerja pegawai;',
                    nilai: 0.0694444
                  },
                  {
                    id_kategori: 92,
                    uraian_kategori:
                      'd. Jika belum ada rencana pengembangan kompetensi pegawai yang mempertimbangkan hasil pengelolaan kinerja pegawai.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 30,
                deskripsi_pertanyaan:
                  'Tingkat kesenjangan kompetensi pegawai yang ada dengan standar kompetensi yang ditetapkan untuk masing-masing jabatan',
                uraian_buktidukung:
                  '(i) Laporan Analisis Kesenjangan Kompetensi Jabatan Pegawai',
                kategoriPenilaian: [
                  {
                    id_kategori: 93,
                    uraian_kategori:
                      'a. Jika persentase kesenjangan kompetensi pegawai dengan standar kompetensi yang ditetapkan sebesar <25%;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 94,
                    uraian_kategori:
                      'b. Jika persentase kesenjangan kompetensi pegawai dengan standar kompetensi yang ditetapkan sebesar >25%-50%;',
                    nilai: 0.138889
                  },
                  {
                    id_kategori: 95,
                    uraian_kategori:
                      'c. Jika sebagian besar kompetensi pegawai dengan standar kompetensi yang ditetapkan untuk masing-masing jabatan >50% -75%;',
                    nilai: 0.0694444
                  },
                  {
                    id_kategori: 96,
                    uraian_kategori:
                      'd. Jika persentase kesenjangan kompetensi pegawai dengan standar kompetensi yang ditetapkan sebesar >75%-100%.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 31,
                deskripsi_pertanyaan:
                  'Pegawai di Unit Kerja telah memperoleh kesempatan/hak untuk mengikuti diklat maupun pengembangan kompetensi lainnya',
                uraian_buktidukung:
                  '(i) Dokumen  rekap  data  pegawai  yang  mengikuti pelatihan/diklat/pengembangan kompetensi lainnya dilengkapi dengan link bukti sertifikat/usulan diklat/undangan',
                kategoriPenilaian: [
                  {
                    id_kategori: 97,
                    uraian_kategori:
                      'a. Jika seluruh pegawai di Unit Kerja telah memperoleh kesempatan/hak untuk mengikuti diklat maupun pengembangan kompetensi lainnya;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 98,
                    uraian_kategori:
                      'b. Jika sebagian besar pegawai di Unit Kerja telah memperoleh kesempatan/hak untuk mengikuti diklat maupun pengembangan kompetensi lainnya;',
                    nilai: 0.138889
                  },
                  {
                    id_kategori: 99,
                    uraian_kategori:
                      'c. Jika sebagian kecil pegawai di Unit Kerja telah memperoleh kesempatan/hak untuk mengikuti diklat maupun pengembangan kompetensi lainnya;',
                    nilai: 0.0694444
                  },
                  {
                    id_kategori: 100,
                    uraian_kategori:
                      'd. Jika belum ada pegawai di Unit Kerja telah memperoleh kesempatan/hak untuk mengikuti diklat maupun pengembangan kompetensi lainnya.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 32,
                deskripsi_pertanyaan:
                  'Dalam pelaksanaan pengembangan kompetensi, unit kerja melakukan upaya pengembangan kompetensi kepada pegawai (seperti pengikutsertaan pada lembaga pelatihan, in-house training, coaching, atau mentoring)',
                uraian_buktidukung:
                  '(i) Laporan pelaksanaan Pelatihan/Diklat/Bimtek/Capacity building yang diselenggarakan oleh unit/satuan kerja terkait atau bukti usulan unit/satuan kerja perihal pengikutsertaan pegawai pada Pelatihan/Diklat/Bimtek/Capacity building (jika ada)',
                kategoriPenilaian: [
                  {
                    id_kategori: 101,
                    uraian_kategori:
                      'a. Jika unit kerja melakukan upaya pengembangan kompetensi kepada seluruh pegawai;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 102,
                    uraian_kategori:
                      'b. Jika unit kerja melakukan upaya pengembangan kompetensi kepada sebagian besar pegawai;',
                    nilai: 0.138889
                  },
                  {
                    id_kategori: 103,
                    uraian_kategori:
                      'c. Jika unit kerja melakukan upaya pengembangan kompetensi kepada sebagian kecil pegawai;',
                    nilai: 0.0694444
                  },
                  {
                    id_kategori: 104,
                    uraian_kategori:
                      'd. Jika unit kerja belum melakukan upaya pengembangan kompetensi kepada pegawai.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 33,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan evaluasi terhadap hasil pengembangan kompetensi dalam kaitannya dengan perbaikan kinerja',
                uraian_buktidukung:
                  '(i) Laporan monitoring berupa matriks rekap jumlah Pelatihan/Diklat/Bimtek/Capacity building/Coaching selama periode 1 tahun serta evaluasi peningkatan kinerja',
                kategoriPenilaian: [
                  {
                    id_kategori: 105,
                    uraian_kategori:
                      'a. Jika monitoring dan evaluasi terhadap hasil pengembangan kompetensi dalam kaitannya dengan perbaikan kinerja telah dilakukan secara berkala;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 106,
                    uraian_kategori:
                      'b. Jika monitoring dan evaluasi terhadap hasil pengembangan kompetensi dalam kaitannya dengan perbaikan kinerja telah dilakukan namun tidak secara berkala;',
                    nilai: 0.104167
                  },
                  {
                    id_kategori: 107,
                    uraian_kategori:
                      'c. Jika monitoring dan evaluasi terhadap hasil pengembangan kompetensi dalam kaitannya dengan perbaikan kinerja belum dilakukan.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 11,
            nama_subpilar: 'Penetapan Kinerja Individu',
            pertanyaan: [
              {
                id_pertanyaan: 36,
                deskripsi_pertanyaan:
                  'Pengukuran kinerja individu dilakukan secara periodik',
                uraian_buktidukung:
                  '(i) Dokumen SKP bulanan seluruh pegawai dari KipApp',
                kategoriPenilaian: [
                  {
                    id_kategori: 116,
                    uraian_kategori:
                      'a. Jika pengukuran kinerja individu dilakukan secara bulanan;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 117,
                    uraian_kategori:
                      'b. Jika pengukuran kinerja individu dilakukan secara triwulanan;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 118,
                    uraian_kategori:
                      'c. Jika pengukuran kinerja individu dilakukan secara semesteran;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 119,
                    uraian_kategori:
                      'd. Jika pengukuran kinerja individu dilakukan secara tahunan;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 120,
                    uraian_kategori:
                      'e. Jika pengukuran kinerja individu belum dilakukan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 34,
                deskripsi_pertanyaan:
                  'Terdapat penetapan kinerja individu yang terkait dengan perjanjian kinerja organisasi',
                uraian_buktidukung:
                  '(i) Dokumen SKP bulanan seluruh pegawai dari KipApp\r\n(ii) Seluruh dokumen Matriks Peran Hasil (MPH) dari aplikasi Kipapp yang ditandatangani pimpinan\r\n(iii) Dokumen penjelasan cascading indikator kinerja mulai dari Visi, misi, PK sampai IKI',
                kategoriPenilaian: [
                  {
                    id_kategori: 108,
                    uraian_kategori:
                      'a. Jika seluruh penetapan kinerja individu terkait dengan kinerja organisasi serta perjanjian kinerja selaras dengan sasaran kinerja pegawai (SKP);',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 109,
                    uraian_kategori:
                      'b. Jika sebagian besar penetapan kinerja individu terkait dengan kinerja organisasi;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 110,
                    uraian_kategori:
                      'c. Jika sebagian kecil penetapan kinerja individu terkait dengan kinerja organisasi;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 111,
                    uraian_kategori:
                      'd. Jika belum ada penetapan kinerja individu terkait dengan kinerja organisasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 35,
                deskripsi_pertanyaan:
                  'Ukuran kinerja individu telah memiliki kesesuaian dengan indikator kinerja individu level diatasnya',
                uraian_buktidukung:
                  '(i) Seluruh dokumen Matriks Peran Hasil (MPH) dari aplikasi Kipapp yang ditandatangani pimpinan',
                kategoriPenilaian: [
                  {
                    id_kategori: 112,
                    uraian_kategori:
                      'a. Jika seluruh ukuran kinerja individu telah memiliki kesesuaian dengan indikator kinerja individu level diatasnya serta menggambarkan logic model;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 113,
                    uraian_kategori:
                      'b. Jika sebagian besar ukuran kinerja individu telah memiliki kesesuaian dengan indikator kinerja individu level diatasnya;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 114,
                    uraian_kategori:
                      'c. Jika sebagian kecil ukuran kinerja individu telah memiliki kesesuaian dengan indikator kinerja individu level diatasnya;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 115,
                    uraian_kategori:
                      'd. Jika ukuran kinerja individu belum memiliki kesesuaian dengan indikator kinerja individu level diatasnya.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 37,
                deskripsi_pertanyaan:
                  'Hasil penilaian kinerja individu telah dijadikan dasar untuk pemberian reward',
                uraian_buktidukung:
                  '(i) Dokumen mekanisme pemberian reward pegawai (misalnya, Employee of the month)\r\n(ii) Kertas kerja pemberian reward\r\n(iii) Bukti reward (misalkan: sertifikat, dll)',
                kategoriPenilaian: [
                  {
                    id_kategori: 121,
                    uraian_kategori:
                      'Ya, jika hasil hasil penilaian kinerja individu telah dijadikan dasar untuk pemberian reward (Seperti: pengembangan karir individu, atau penghargaan)',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 122,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 12,
            nama_subpilar:
              'Penegakan Aturan Disiplin/Kode Etik/Kode Perilaku Pegawai',
            pertanyaan: [
              {
                id_pertanyaan: 38,
                deskripsi_pertanyaan:
                  'Aturan disiplin/kode etik/kode perilaku telah dilaksanakan/diimplementasikan',
                uraian_buktidukung:
                  '(i) Peraturan aturan disiplin/kode etik/kode perilaku, dll (internal);\r\n(ii) Laporan penegakan hukuman atas pelanggaran aturan disiplin/kode etik/kode perilaku\r\n(iii) Dokumen inovasi terkait aturan disiplin/kode etik/kode perilaku',
                kategoriPenilaian: [
                  {
                    id_kategori: 123,
                    uraian_kategori:
                      'a. Jika unit kerja telah mengimplementasikan seluruh aturan disiplin/kode etik/kode perilaku yang ditetapkan organisasi dan juga membuat inovasi terkait aturan disiplin/kode etik/kode perilaku yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 124,
                    uraian_kategori:
                      'b. Jika unit kerja telah mengimplementasikan seluruh aturan disiplin/kode etik/kode perilaku yang ditetapkan organisasi;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 125,
                    uraian_kategori:
                      'c. Jika unit kerja telah mengimplementasikan sebagian aturan disiplin/kode etik/kode perilaku yang ditetapkan organisasi;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 126,
                    uraian_kategori:
                      'd. Jika unit kerja belum mengimplementasikan aturan disiplin/kode etik/kode perilaku yang ditetapkan organisasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 13,
            nama_subpilar: 'Sistem Informasi Kepegawaian',
            pertanyaan: [
              {
                id_pertanyaan: 39,
                deskripsi_pertanyaan:
                  'Data informasi kepegawaian unit kerja telah dimutakhirkan secara berkala',
                uraian_buktidukung:
                  '(i) Laporan pemutakhiran data informasi kepegawaian yang ditandatangani oleh pimpinan\r\n(ii) Dokumen Entri Data Rekap Aktivitas dari SIMPEG',
                kategoriPenilaian: [
                  {
                    id_kategori: 127,
                    uraian_kategori:
                      'a. Jika data informasi kepegawaian unit kerja dapat diakses oleh pegawai dan dimutakhirkan setiap ada perubahan data pegawai;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 128,
                    uraian_kategori:
                      'b. Jika data informasi kepegawaian unit kerja dapat diakses oleh pegawai dan dimutakhirkan namun secara berkala;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 129,
                    uraian_kategori:
                      'c. Jika data informasi kepegawaian unit kerja belum dimutakhirkan.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 4,
        nama_pilar: 'Penguatan Akuntabilitas',
        subpilar: [
          {
            id_subpilar: 14,
            nama_subpilar: 'Keterlibatan Pimpinan',
            pertanyaan: [
              {
                id_pertanyaan: 41,
                deskripsi_pertanyaan:
                  'Unit kerja telah melibatkan secara langsung pimpinan saat penyusunan penetapan kinerja',
                uraian_buktidukung:
                  '(i) Undangan, notula disertai kertas kerja dasar hitung dalam penentuan target kinerja, daftar hadir, dan foto rapat penyusunan penetapan kinerja\r\n(ii) Dokumen PK 2024 yang ditandatangani oleh pimpinan\r\n(iii) Dokumen daftar link PK 2024 yang diupload di PPID\r\n(iv) Seluruh dokumen Matriks Peran Hasil (MPH) dari aplikasi Kipapp yang ditandatangani oleh pimpinan',
                kategoriPenilaian: [
                  {
                    id_kategori: 133,
                    uraian_kategori:
                      'a. Jika pimpinan selalu terlibat dalam seluruh tahapan penyusunan perjanjian kinerja;',
                    nilai: 0.833333
                  },
                  {
                    id_kategori: 134,
                    uraian_kategori:
                      'b. Jika pimpinan terlibat dalam sebagian tahapan penyusunan perjanjian kinerja;',
                    nilai: 0.416667
                  },
                  {
                    id_kategori: 135,
                    uraian_kategori:
                      'c. Jika tidak ada keterlibatan pimpinan dalam penyusunan perjanjian kinerja.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 42,
                deskripsi_pertanyaan:
                  'Pimpinan memantau pencapaian kinerja secara berkala',
                uraian_buktidukung:
                  '(i) Undangan, notula (disertai kendala, solusi, tindak lanjut, PIC tindak lanjut, dan batas waktu tindak lanjut), daftar hadir, foto rapat monitoring capaian kinerja (FRA triwulanan), sesuai pada Simonev',
                kategoriPenilaian: [
                  {
                    id_kategori: 136,
                    uraian_kategori:
                      'a. Jika pimpinan selalu terlibat dalam seluruh pemantauan pencapaian kinerja dan menindaklanjuti hasil pemantauan;',
                    nilai: 0.833333
                  },
                  {
                    id_kategori: 137,
                    uraian_kategori:
                      'b. Jika pimpinan unit kerja terlibat dalam seluruh pemantauan pencapaian kinerja tetapi tidak ada tindak lanjut hasil pemantauan;',
                    nilai: 0.555556
                  },
                  {
                    id_kategori: 138,
                    uraian_kategori:
                      'c. Jika pimpinan unit kerja terlibat dalam sebagian pemantauan pencapaian kinerja;',
                    nilai: 0.277778
                  },
                  {
                    id_kategori: 139,
                    uraian_kategori:
                      'd. Jika tidak ada keterlibatan pimpinan dalam pemantauan pencapaian kinerja.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 40,
                deskripsi_pertanyaan:
                  'Unit kerja telah melibatkan pimpinan secara langsung pada saat penyusunan perencanaan',
                uraian_buktidukung:
                  '(i) Undangan, notula, daftar hadir, foto rapat perencanaan kegiatan dan anggaran\r\n(ii) Dokumen perencanaan kegiatan dan anggaran yang memuat Perjanjian Kinerja (PK) 2024\r\n(iii) Dokumen daftar link PK 2024 yang diupload di PPID\r\n(iv) Dokumen perencanaan kegiatan dan anggaran yang memuat Petunjuk Operasional Kegiatan (POK)',
                kategoriPenilaian: [
                  {
                    id_kategori: 130,
                    uraian_kategori:
                      'a. Jika pimpinan selalu terlibat dalam seluruh tahapan penyusunan perencanaan;',
                    nilai: 0.833333
                  },
                  {
                    id_kategori: 131,
                    uraian_kategori:
                      'b. Jika pimpinan ikut terlibat dalam sebagian tahapan penyusunan perencanaan;',
                    nilai: 0.416667
                  },
                  {
                    id_kategori: 132,
                    uraian_kategori:
                      'c. Jika tidak ada keterlibatan pimpinan dalam penyusunan perencanaan (hanya menandatangani).',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 15,
            nama_subpilar: 'Pengelolaan Akuntabilitas Kinerja',
            pertanyaan: [
              {
                id_pertanyaan: 43,
                deskripsi_pertanyaan: 'Dokumen perencanaan kinerja sudah ada',
                uraian_buktidukung:
                  '(i) Rencana Strategis (Renstra) 2020–2024 dan Reviu Renstra 2020-2024\r\n(ii) Dokumen PK 2024 yang ditandatangani oleh pimpinan\r\n(iii) Dokumen daftar link Renstra 2020–2024, Reviu Renstra 2020–2024, dan PK 2024 yang diupload di PPID',
                kategoriPenilaian: [
                  {
                    id_kategori: 140,
                    uraian_kategori:
                      'Ya, jika unit kerja memiliki dokumen perencanaan kinerja lengkap.',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 141,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 44,
                deskripsi_pertanyaan:
                  'Perencanaan kinerja telah berorientasi hasil',
                uraian_buktidukung:
                  '(i) Dokumen PK 2024 yang ditandatangani oleh pimpinan\r\n(ii) Dokumen daftar link PK 2024 yang diupload di PPID\r\n(iii) Seluruh dokumen MPH dari aplikasi Kipapp yang ditandatangani oleh pimpinan',
                kategoriPenilaian: [
                  {
                    id_kategori: 142,
                    uraian_kategori:
                      'Ya, jika perencanaan kinerja telah berorientasi hasil.',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 143,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 45,
                deskripsi_pertanyaan:
                  'Terdapat penetapan Indikator Kinerja Utama (IKU)',
                uraian_buktidukung:
                  '(i) Dokumen Peraturan Kepala BPS Nomor 3 Tahun 2022 terkait Reviu IKU di Lingkungan BPS Tahun 2020-2024\r\n(ii) Surat terkait penyusunan Perjanjian Kinerja 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 144,
                    uraian_kategori: 'Ya, jika unit kerja memiliki IKU.',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 145,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 46,
                deskripsi_pertanyaan:
                  'Indikator kinerja telah telah memenuhi kriteria SMART',
                uraian_buktidukung:
                  '(i) Dokumen Laporan Kinerja 2024 yang ditandatangani oleh pimpinan\r\n(ii) Dokumen daftar link Laporan Kinerja 2024 yang diupload di PPID',
                kategoriPenilaian: [
                  {
                    id_kategori: 146,
                    uraian_kategori:
                      'a. Jika seluruh indikator kinerja telah SMART;',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 147,
                    uraian_kategori:
                      'b. Jika sebagian besar indikator kinerja telah SMART;',
                    nilai: 0.208333
                  },
                  {
                    id_kategori: 148,
                    uraian_kategori:
                      'c. Jika sebagian kecil indikator kinerja telah SMART;',
                    nilai: 0.104167
                  },
                  {
                    id_kategori: 149,
                    uraian_kategori:
                      'd. Jika belum ada indikator kinerja yang SMART.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 47,
                deskripsi_pertanyaan:
                  'Laporan kinerja telah disusun tepat waktu',
                uraian_buktidukung:
                  '(i) Dokumen Laporan Kinerja 2024 yang ditandatangani oleh pimpinan secara tepat waktu\r\n(ii) Dokumen daftar link Laporan Kinerja 2024 yang diupload di PPID\r\n(iii) Screenshot bukti unggah Laporan Kinerja 2024 secara tepat waktu',
                kategoriPenilaian: [
                  {
                    id_kategori: 150,
                    uraian_kategori:
                      'Ya, jika unit kerja telah menyusun laporan kinerja tepat waktu.',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 151,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 48,
                deskripsi_pertanyaan:
                  'Laporan kinerja telah memberikan informasi tentang kinerja',
                uraian_buktidukung:
                  '(i) Dokumen Laporan Kinerja 2024 yang ditandatangani oleh pimpinan\r\n(ii) Dokumen daftar link Laporan Kinerja 2024 yang diupload di PPID',
                kategoriPenilaian: [
                  {
                    id_kategori: 152,
                    uraian_kategori:
                      'a. Jika seluruh pelaporan kinerja telah memberikan informasi tentang kinerja;',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 153,
                    uraian_kategori:
                      'b. Jika sebagian pelaporan kinerja belum memberikan informasi tentang kinerja;',
                    nilai: 0.15625
                  },
                  {
                    id_kategori: 154,
                    uraian_kategori:
                      'c. Jika seluruh pelaporan kinerja belum memberikan informasi tentang kinerja.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 49,
                deskripsi_pertanyaan:
                  'Terdapat sistem informasi/mekanisme informasi kinerja',
                uraian_buktidukung:
                  '(i) Peraturan Kepala Badan Pusat Statistik Nomor 9 Tahun 2015 tentang Pedoman Penyusunan Sistem Akuntabilitas Kinerja Instansi Pemerintah di Lingkungan Badan Pusat Statistik\r\n(ii) SK Tim SAKIP Tahun 2024\r\n(iii) SOP Pengumpulan Data Kinerja sesuai dengan kondisi masing-masing satuan kerja yang ditandatangani oleh pimpinan (mengacu pada surat Sekretaris Utama terkait Pelaporan Capaian Kinerja Triwulanan Tahun 2024)',
                kategoriPenilaian: [
                  {
                    id_kategori: 155,
                    uraian_kategori:
                      'Ya, jika terdapat sistem informasi/mekanisme informasi kinerja.',
                    nilai: 0
                  },
                  {
                    id_kategori: 156,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 50,
                deskripsi_pertanyaan:
                  'Unit kerja telah berupaya meningkatkan kapasitas SDM yang menangani akuntabilitas kinerja',
                uraian_buktidukung:
                  '(i) SK Tim SAKIP Tahun 2024\r\n(ii) Dokumen daftar data individu seluruh anggota Tim SAKIP yang memuat data kompetensi dan sertifikat pembinaan terkait akuntabilitas kinerja (akumulasi kompetensi hingga tahun 2024)',
                kategoriPenilaian: [
                  {
                    id_kategori: 157,
                    uraian_kategori:
                      'a. Jika seluruh SDM pengelola akuntabilitas kinerja kompeten;',
                    nilai: 0.3125
                  },
                  {
                    id_kategori: 158,
                    uraian_kategori:
                      'b. Jika sebagian SDM pengelola akuntabilitas kinerja kompeten;',
                    nilai: 0.15625
                  },
                  {
                    id_kategori: 159,
                    uraian_kategori:
                      'c. Jika seluruh SDM pengelola akuntabilitas kinerja belum ada yang kompeten.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 5,
        nama_pilar: 'Penguatan Pengawasan',
        subpilar: [
          {
            id_subpilar: 16,
            nama_subpilar: 'Pengendalian Gratifikasi',
            pertanyaan: [
              {
                id_pertanyaan: 51,
                deskripsi_pertanyaan:
                  'Telah dilakukan public campaign tentang pengendalian gratifikasi',
                uraian_buktidukung:
                  '(i) Dokumentasi atau screenshoot banner/spanduk/media sosial yang menunjukan pengendalian gratifikasi telah dipublikasikan secara berkala (per bulan/triwulan/semester)\r\n(ii) Dokumen sosialisasi larangan gratifikasi dalam rapat internal maupun eksternal (undangan, notulen, daftar hadir)',
                kategoriPenilaian: [
                  {
                    id_kategori: 160,
                    uraian_kategori:
                      'a. Jika public campaign telah dilakukan secara berkala;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 161,
                    uraian_kategori:
                      'b. Jika public campaign dilakukan tidak secara berkala;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 162,
                    uraian_kategori: 'c. Jika belum dilakukan public campaign.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 52,
                deskripsi_pertanyaan:
                  'Pengendalian gratifikasi telah diimplementasikan',
                uraian_buktidukung:
                  '(i) SK terkait unit pengendalian gratifikasi (UPG)\r\n(ii) Mekanisme atau SOP terkait pengendalian gratifikasi\r\n(iii) Laporan implementasi pengendalian gratifikasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 163,
                    uraian_kategori:
                      'a. Jika Unit Pengendalian Gratifikasi, pengendalian gratifikasi telah menjadi bagian dari prosedur;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 164,
                    uraian_kategori:
                      'b. Jika Unit Pengendalian Gratifikasi, upaya pengendalian gratifikasi telah mulai dilakukan;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 165,
                    uraian_kategori:
                      'c. Jika telah membentuk Unit Pengendalian Gratifikasi tetapi belum terdapat prosedur pengendalian;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 166,
                    uraian_kategori:
                      'd. Jika belum memiliki Unit Pengendalian Gratifikasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 17,
            nama_subpilar:
              'Penerapan Sistem Pengendalian Intern Pemerintah (SPIP)',
            pertanyaan: [
              {
                id_pertanyaan: 53,
                deskripsi_pertanyaan: 'Telah dibangun lingkungan pengendalian',
                uraian_buktidukung:
                  '(i) Dokumen sosialisasi SPIP (undangan, notulen, materi/paparan, daftar hadir, dokumentasi/foto)\r\n(ii) SK tim SPIP\r\n(iii) Laporan penyelenggaraan SPIP',
                kategoriPenilaian: [
                  {
                    id_kategori: 167,
                    uraian_kategori:
                      'a. Jika unit kerja membangun seluruh lingkungan pengendalian sesuai dengan yang ditetapkan organisasi dan juga membuat inovasi terkait lingkungan pengendalian yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 168,
                    uraian_kategori:
                      'b. Jika unit kerja membangun seluruh lingkungan pengendalian sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.28125
                  },
                  {
                    id_kategori: 169,
                    uraian_kategori:
                      'c. Jika unit kerja membangun sebagian besar lingkungan pengendalian sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 170,
                    uraian_kategori:
                      'd. Jika unit kerja membangun sebagian kecil lingkungan pengendalian sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.09375
                  },
                  {
                    id_kategori: 171,
                    uraian_kategori:
                      'e. Jika unit kerja belum membangun lingkungan pengendalian.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 54,
                deskripsi_pertanyaan:
                  'Telah dilakukan penilaian risiko atas pelaksanaan kebijakan',
                uraian_buktidukung:
                  '(i) Laporan Manajemen Risiko yang memuat penilaian risiko\r\n(ii) Laporan terkait inovasi terkait lingkungan pengendalian yang sesuai dengan karakteristik unit kerja',
                kategoriPenilaian: [
                  {
                    id_kategori: 172,
                    uraian_kategori:
                      'a. Jika unit kerja melakukan penilaian risiko atas seluruh pelaksanaan kebijakan sesuai dengan yang ditetapkan organisasi dan juga membuat inovasi terkait lingkungan pengendalian yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 173,
                    uraian_kategori:
                      'b. Jika unit kerja melakukan penilaian risiko atas seluruh pelaksanaan kebijakan sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.28125
                  },
                  {
                    id_kategori: 174,
                    uraian_kategori:
                      'c. Jika melakukan penilaian risiko atas sebagian besar pelaksanaan kebijakan sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 175,
                    uraian_kategori:
                      'd. Jika melakukan penilaian risiko atas sebagian kecil pelaksanaan kebijakan sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.09375
                  },
                  {
                    id_kategori: 176,
                    uraian_kategori:
                      'e. Jika unit kerja belum melakukan penilaian risiko.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 55,
                deskripsi_pertanyaan:
                  'Telah dilakukan kegiatan pengendalian untuk meminimalisir risiko yang telah diidentifikasi',
                uraian_buktidukung:
                  '(i) Laporan Manajemen Risiko yang memuat kegiatan pengendalian risiko\r\n(ii) Laporan terkait inovasi dalam meminimalisir risiko',
                kategoriPenilaian: [
                  {
                    id_kategori: 177,
                    uraian_kategori:
                      'a. Jika unit kerja melakukan kegiatan pengendalian untuk meminimalisir resiko sesuai dengan yang ditetapkan organisasi dan juga membuat inovasi terkait kegiatan pengendalian untuk meminimalisir resiko yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 178,
                    uraian_kategori:
                      'b. Jika unit kerja melakukan kegiatan pengendalian untuk meminimalisir resiko sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 179,
                    uraian_kategori:
                      'c. Jika unit kerja belum melakukan kegiatan pengendalian untuk meminimalisir resiko.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 56,
                deskripsi_pertanyaan:
                  'SPI telah diinformasikan dan dikomunikasikan kepada seluruh pihak terkait',
                uraian_buktidukung:
                  '(i) Dokumentasi pelaksanaan internalisasi/sosialisasi SPI (SPIP, MR, dll) kepada seluruh pegawai (undangan, daftar hadir, notulen, dan naskah paparan)',
                kategoriPenilaian: [
                  {
                    id_kategori: 180,
                    uraian_kategori:
                      'a. Jika SPI telah diinformasikan dan dikomunikasikan kepada seluruh pihak terkait;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 181,
                    uraian_kategori:
                      'b. Jika SPI telah diinformasikan dan dikomunikasikan kepada sebagian pihak terkait;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 182,
                    uraian_kategori:
                      'c. Jika SPI belum diinformasikan dan dikomunikasikan kepada pihak terkait.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 18,
            nama_subpilar: 'Pengaduan Masyarakat',
            pertanyaan: [
              {
                id_pertanyaan: 57,
                deskripsi_pertanyaan:
                  'Kebijakan Pengaduan masyarakat telah diimplementasikan',
                uraian_buktidukung:
                  '(i) SK petugas Pengelola Pengaduan Masyarakat\r\n(ii) Dokumen kebijakan pengaduan\r\n(iii) Dokumentasi media/sarana pengaduan masyarakat yang dilengkapi dengan narasi\r\n(iv) Dokumentasi spanduk/banner/flyer informasi sarana penyampaian pengaduan yang dilengkapi dengan narasi\r\n(v) Laporan pengelolaan pengaduan',
                kategoriPenilaian: [
                  {
                    id_kategori: 183,
                    uraian_kategori:
                      'a. Jika unit kerja mengimplementasikan seluruh kebijakan pengaduan masyarakat sesuai dengan yang ditetapkan organisasi dan juga membuat inovasi terkait pengaduan masyarakat yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 184,
                    uraian_kategori:
                      'b. Jika unit kerja telah mengimplementasikan seluruh kebijakan pengaduan masyarakat sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 185,
                    uraian_kategori:
                      'c. Jika unit kerja belum mengimplementasikan kebijakan pengaduan masyarakat.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 58,
                deskripsi_pertanyaan: 'Pengaduan masyarakat ditindaklanjuti',
                uraian_buktidukung:
                  '(i) Laporan pengelolaan pengaduan dengan outline:\r\na. Rekapitulasi jumlah aduan per bulan (jenis aduan)\r\nb. Tindak lanjut aduan\r\nc. Kendala dan solusi dalam penanganan aduan',
                kategoriPenilaian: [
                  {
                    id_kategori: 186,
                    uraian_kategori:
                      'Ya, pengaduan masyarakat ditindaklanjuti.',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 187,
                    uraian_kategori: 'TIdak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 59,
                deskripsi_pertanyaan:
                  'Telah dilakukan monitoring dan evaluasi atas penanganan pengaduan masyarakat',
                uraian_buktidukung:
                  '(i) Laporan pengelolaan pengaduan dengan outline:\r\na. Rekapitulasi jumlah aduan per bulan (jenis aduan)\r\nb. Tindak lanjut aduan\r\nc. Kendala dan solusi dalam penanganan aduan\r\nd. Hasil evaluasi atas tindak lanjut penanganan pengaduan masyarakat\r\n(ii) Dokumentasi pelaksanaan rapat evaluasi dan monitoring (undangan, daftar hadir, notulen)',
                kategoriPenilaian: [
                  {
                    id_kategori: 188,
                    uraian_kategori:
                      'a. Jika penanganan pengaduan masyarakat dimonitoring dan evaluasi secara berkala;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 189,
                    uraian_kategori:
                      'b. Jika penanganan pengaduan masyarakat dimonitoring dan evaluasi tetapi tidak secara berkala;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 190,
                    uraian_kategori:
                      'c. Jika penanganan pengaduan masyarakat belum di monitoring dan evaluasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 60,
                deskripsi_pertanyaan:
                  'Hasil evaluasi atas penanganan pengaduan masyarakat telah ditindaklanjuti',
                uraian_buktidukung:
                  '(i) Laporan pengelolaan pengaduan dengan outline:\r\na. Rekapitulasi jumlah aduan per bulan (jenis aduan)\r\nb. Tindak lanjut aduan\r\nc. Kendala dan solusi dalam penanganan aduan\r\nd. Hasil evaluasi atas tindak lanjut penanganan pengaduan masyarakat',
                kategoriPenilaian: [
                  {
                    id_kategori: 191,
                    uraian_kategori:
                      'a. Jika seluruh hasil evaluasi atas penanganan pengaduan telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 192,
                    uraian_kategori:
                      'b. Jika sebagian hasil evaluasi atas penanganan pengaduan telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 193,
                    uraian_kategori:
                      'c. Jika hasil evaluasi atas penanganan pengaduan belum ditindaklanjuti.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 19,
            nama_subpilar: 'Whistle-Blowing System',
            pertanyaan: [
              {
                id_pertanyaan: 61,
                deskripsi_pertanyaan: 'Whistle-Blowing System telah diterapkan',
                uraian_buktidukung:
                  '(i) SK Tim WBS\r\n(ii) Keputusan Inspektur Utama No. B-146/BPS/8000/10/2019 Tahun 2019 tentang Sistem Pengelolaan Pengaduan di Lingkungan Badan Pusat Statistik\r\n(iii) Dokumentasi spanduk/banner/flyer/media/sarana WBS yang dilengkapi dengan narasi\r\n(iv) Screenshot aplikasi WBS\r\n(v) Laporan pengelolaan WBS',
                kategoriPenilaian: [
                  {
                    id_kategori: 194,
                    uraian_kategori:
                      'a. Jika unit kerja menerapkan seluruh kebijakan Whistle Blowing System sesuai dengan yang ditetapkan organisasi dan juga membuat inovasi terkait pelaksanaan Whistle Blowing System yang sesuai dengan karakteristik unit kerja;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 195,
                    uraian_kategori:
                      'b. Jika unit kerja menerapkan kebijakan Whistle Blowing System sesuai dengan yang ditetapkan organisasi;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 196,
                    uraian_kategori:
                      'c. Jika unit kerja belum menerapkan kebijakan Whistle Blowing System.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 62,
                deskripsi_pertanyaan:
                  'Telah dilakukan evaluasi atas penerapan Whistle Blowing System',
                uraian_buktidukung:
                  '(i) Laporan pengelolaan WBS dengan outline:\r\na. Rekapitulasi jumlah aduan per bulan (jenis aduan)\r\nb. Tindak lanjut WBS\r\nc. Kendala dan solusi dalam penanganan WBS',
                kategoriPenilaian: [
                  {
                    id_kategori: 197,
                    uraian_kategori:
                      'a. Jika penerapan Whistleblowing System dimonitoring dan evaluasi secara berkala;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 198,
                    uraian_kategori:
                      'b. Jika penerapan Whistle Blowing System dimonitoring dan evaluasi tidak secara berkala;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 199,
                    uraian_kategori:
                      'c. Jika penerapan Whistleblowing System belum di monitoring dan evaluasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 63,
                deskripsi_pertanyaan:
                  'Hasil evaluasi atas penerapan Whistle Blowing System telah ditindaklanjuti',
                uraian_buktidukung:
                  '(i) Laporan pengelolaan WBS dengan outline:\r\na. Rekapitulasi jumlah aduan per bulan (jenis aduan)\r\nb. Tindak lanjut WBS\r\nc. Kendala dan solusi dalam penanganan WBS\r\nd. Hasil evaluasi atas tindak lanjut penanganan WBS',
                kategoriPenilaian: [
                  {
                    id_kategori: 200,
                    uraian_kategori:
                      'a. Jika seluruh hasil evaluasi atas penerapan Whistle Blowing System telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 201,
                    uraian_kategori:
                      'b. Jika sebagian hasil evaluasi atas penerapan Whistle Blowing System telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 202,
                    uraian_kategori:
                      'c. Jika hasil evaluasi atas penerapan Whistle Blowing System belum ditindaklanjuti.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 20,
            nama_subpilar: 'Penanganan Benturan Kepentingan',
            pertanyaan: [
              {
                id_pertanyaan: 64,
                deskripsi_pertanyaan:
                  'Telah terdapat identifikasi/pemetaan benturan kepentingan dalam tugas fungsi utama',
                uraian_buktidukung:
                  '(i) Dokumen hasil identifikasi potensi benturan kepentingan dalam tugas fungsi utama untuk seluruh pegawai berdasarkan lampiran Perka BPS Nomor 36 Tahun 2023 tentang Pedoman Penanganan Benturan Kepentingan di Lingkungan Badan Pusat Statistik halaman 23\r\n(ii) Perka BPS Nomor 36 Tahun 2023 tentang Pedoman Penanganan Benturan Kepentingan di Lingkungan Badan Pusat Statistik',
                kategoriPenilaian: [
                  {
                    id_kategori: 203,
                    uraian_kategori:
                      'a. Jika terdapat identifikasi/pemetaan benturan kepentingan pada seluruh tugas fungsi utama;',
                    nilai: 0.3
                  },
                  {
                    id_kategori: 204,
                    uraian_kategori:
                      'b. Jika terdapat identifikasi/pemetaan benturan kepentingan tetapi pada sebagian besar tugas fungsi utama;',
                    nilai: 0.2
                  },
                  {
                    id_kategori: 205,
                    uraian_kategori:
                      'c. Jika terdapat identifikasi/pemetaan benturan kepentingan tetapi pada sebagian kecil tugas fungsi utama;',
                    nilai: 0.1
                  },
                  {
                    id_kategori: 206,
                    uraian_kategori:
                      'd. Jika belum terdapat identifikasi/pemetaan benturan kepentingan dalam tugas fungsi utama.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 65,
                deskripsi_pertanyaan:
                  'Penanganan Benturan Kepentingan telah disosialisasikan/internalisasi',
                uraian_buktidukung:
                  '(i) Dokumentasi internalisasi penanganan benturan kepentingan, antara lain: \r\n(1) rapat (undangan, daftar hadir, notulen, foto)\r\n(2) bimtek (laporan, foto)\r\n(3) apel pagi/sore (foto, teks arahan pimpinan)',
                kategoriPenilaian: [
                  {
                    id_kategori: 207,
                    uraian_kategori:
                      'a. Jika penanganan Benturan Kepentingan disosialisasikan/diinternalisasikan ke seluruh layanan;',
                    nilai: 0.3
                  },
                  {
                    id_kategori: 208,
                    uraian_kategori:
                      'b. Jika penanganan Benturan Kepentingan disosialisasikan/diinternalisasikan ke sebagian besar layanan;',
                    nilai: 0.2
                  },
                  {
                    id_kategori: 209,
                    uraian_kategori:
                      'c. Jika penanganan Benturan Kepentingan disosialisasikan/diinternalisasikan ke sebagian kecil layanan;',
                    nilai: 0.1
                  },
                  {
                    id_kategori: 210,
                    uraian_kategori:
                      'd. Jika penanganan Benturan Kepentingan belum disosialisasikan/diinternalisasikan ke seluruh layanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 66,
                deskripsi_pertanyaan:
                  'Penanganan Benturan Kepentingan telah diimplementasikan',
                uraian_buktidukung:
                  '(i) Dokumen surat pernyataan bebas dari benturan kepentingan untuk seluruh pegawai berdasarkan lampiran Perka BPS Nomor 36 Tahun 2023 tentang Pedoman Penanganan Benturan Kepentingan di Lingkungan Badan Pusat Statistik halaman 22\r\n(ii) Laporan Benturan Kepentingan berdasarkan lampiran Perka BPS Nomor 36 Tahun 2023 tentang Pedoman Penanganan Benturan Kepentingan di Lingkungan Badan Pusat Statistik halaman 24',
                kategoriPenilaian: [
                  {
                    id_kategori: 211,
                    uraian_kategori:
                      'a. Jika penanganan Benturan Kepentingan diimplementasikan ke seluruh layanan;',
                    nilai: 0.3
                  },
                  {
                    id_kategori: 212,
                    uraian_kategori:
                      'b. Jika penanganan Benturan Kepentingan diimplementasikan ke sebagian besar layanan;',
                    nilai: 0.2
                  },
                  {
                    id_kategori: 213,
                    uraian_kategori:
                      'c. Jika penanganan Benturan Kepentingan diimplementasikan ke sebagian kecil layanan;',
                    nilai: 0.1
                  },
                  {
                    id_kategori: 214,
                    uraian_kategori:
                      'd. Jika penanganan Benturan Kepentingan belum diimplementasikan ke seluruh layanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 67,
                deskripsi_pertanyaan:
                  'Telah dilakukan evaluasi atas Penanganan Benturan Kepentingan',
                uraian_buktidukung:
                  '(i) Laporan monitoring dan evaluasi penanganan benturan kepentingan berdasarkan lampiran Perka BPS Nomor 36 Tahun 2023 tentang Pedoman Penanganan Benturan Kepentingan di Lingkungan Badan Pusat Statistik halaman 25',
                kategoriPenilaian: [
                  {
                    id_kategori: 215,
                    uraian_kategori:
                      'a. Jika penanganan Benturan Kepentingan dievaluasi secara berkala oleh unit kerja;',
                    nilai: 0.3
                  },
                  {
                    id_kategori: 216,
                    uraian_kategori:
                      'b. Jika penanganan Benturan Kepentingan dievaluasi tetapi tidak secara berkala oleh unit kerja;',
                    nilai: 0.15
                  },
                  {
                    id_kategori: 217,
                    uraian_kategori:
                      'c. Jika penanganan Benturan Kepentingan belum dievaluasi oleh unit kerja.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 68,
                deskripsi_pertanyaan:
                  'Hasil evaluasi atas Penanganan Benturan Kepentingan telah ditindaklanjuti',
                uraian_buktidukung:
                  '(i) Laporan Bukti Tindak Lanjut Penanganan Benturan Kepentingan (mengacu pada rencana tindak lanjut di pertanyaan A.I.5.v.d)',
                kategoriPenilaian: [
                  {
                    id_kategori: 218,
                    uraian_kategori:
                      'a. Jika seluruh hasil evaluasi atas Penanganan Benturan Kepentingan telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.3
                  },
                  {
                    id_kategori: 219,
                    uraian_kategori:
                      'b. Jika sebagian hasil evaluasi atas Penanganan Benturan Kepentingan telah ditindaklanjuti oleh unit kerja;',
                    nilai: 0.15
                  },
                  {
                    id_kategori: 220,
                    uraian_kategori:
                      'c. Jika belum ada hasil evaluasi atas Penanganan Benturan Kepentingan yang ditindaklanjuti unit kerja.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 1,
        nama_pilar: 'Manajemen Perubahan',
        subpilar: [
          {
            id_subpilar: 1,
            nama_subpilar: 'Penyusunan Tim Kerja',
            pertanyaan: [
              {
                id_pertanyaan: 1,
                deskripsi_pertanyaan:
                  'Unit kerja telah membentuk tim untuk melakukan pembangunan Zona Integritas',
                uraian_buktidukung:
                  '(i) SK Tim Kerja Pembangunan ZI menuju WBK/WBBM Tahun 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 1,
                    uraian_kategori:
                      'Ya, jika Tim telah dibentuk di dalam unit kerja.',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 2,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 2,
                deskripsi_pertanyaan:
                  'Penentuan anggota Tim dipilih melalui prosedur/mekanisme yang jelas',
                uraian_buktidukung:
                  '(i) Notulen/laporan pelaksanaan rapat pembentukan Tim Kerja yang telah disahkan oleh kepala satker\r\n(ii) Mekanisme  yang  menjelaskan  tata  cara pemilihan anggota Tim\r\n(iii) Kertas kerja penentuan anggota Tim Kerja',
                kategoriPenilaian: [
                  {
                    id_kategori: 3,
                    uraian_kategori:
                      'a. Jika dengan prosedur/mekanisme yang jelas dan mewakili seluruh unsur dalam unit kerja;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 4,
                    uraian_kategori:
                      'b. Jika sebagian menggunakan prosedur yang mewakili sebagian besar unsur dalam unit kerja;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 5,
                    uraian_kategori: 'c. Jika tidak di seleksi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 2,
            nama_subpilar: 'Rencana Pembangunan Zona Integritas',
            pertanyaan: [
              {
                id_pertanyaan: 3,
                deskripsi_pertanyaan:
                  'Terdapat dokumen rencana kerja pembangunan Zona Integritas menuju WBK/WBBM',
                uraian_buktidukung:
                  '(i) Dokumen Rencana Kerja Pembangunan ZI tahun 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 6,
                    uraian_kategori:
                      'Ya, jika memiliki rencana kerja pembangunan Zona Integritas.',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 7,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 4,
                deskripsi_pertanyaan:
                  'Dalam dokumen pembangunan terdapat target-target prioritas yang relevan dengan tujuan pembangunan WBK/WBBM',
                uraian_buktidukung:
                  '(i) Dokumen Rencana Kerja Pembangunan ZI tahun 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 8,
                    uraian_kategori:
                      'a. Jika semua target-target prioritas relevan dengan tujuan pembangunan WBK/WBBM;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 9,
                    uraian_kategori:
                      'b. Jika sebagian target-target prioritas relevan dengan tujuan pembangunan WBK/WBBM;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 10,
                    uraian_kategori:
                      'c. Jika tidak ada target-target prioritas yang relevan dengan tujuan pembangunan WBK/WBBM.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 5,
                deskripsi_pertanyaan:
                  'Terdapat mekanisme atau media untuk mensosialisasikan pembangunan WBK/WBBM',
                uraian_buktidukung:
                  '(i) Laporan pelaksanaan sosialisasi online dan offline\r\n(ii) Laporan Pencanangan Pembangunan Zona Integritas\r\n(iii) Dokumen kelengkapan Internalisasi Pembangunan ZI dan RB',
                kategoriPenilaian: [
                  {
                    id_kategori: 11,
                    uraian_kategori:
                      'a. Jika telah dilakukan pengelolaan media/aktivitas interaktif yang efektif untuk menginformasikan pembangunan ZI kepada internal dan stakeholder secara berkala;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 12,
                    uraian_kategori:
                      'b. Jika pengelolaan media/aktivitas interaktif dilakukan secara terbatas dan tidak secara berkala;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 13,
                    uraian_kategori:
                      'c. Jika pengelolaan media/aktivitas interaktif belum dilakukan.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 3,
            nama_subpilar: 'Pemantauan dan Evaluasi Pembangunan WBK/WBBM',
            pertanyaan: [
              {
                id_pertanyaan: 6,
                deskripsi_pertanyaan:
                  'Seluruh kegiatan pembangunan sudah dilaksanakan sesuai dengan rencana',
                uraian_buktidukung:
                  '(i) Dokumen Rencana Kerja Pembangunan ZI\r\n(ii) Laporan Pelaksanaan Kegiatan Pembangunan ZI',
                kategoriPenilaian: [
                  {
                    id_kategori: 14,
                    uraian_kategori:
                      'a. Jika semua kegiatan pembangunan telah dilaksanakan sesuai dengan rencana;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 15,
                    uraian_kategori:
                      'b. Jika sebagian besar kegiatan pembangunan telah dilaksanakan sesuai dengan rencana;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 16,
                    uraian_kategori:
                      'c. Jika sebagian kecil kegiatan pembangunan telah dilaksanakan sesuai dengan rencana;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 17,
                    uraian_kategori:
                      'd. Jika belum ada kegiatan pembangunan yang dilakukan sesuai dengan rencana.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 7,
                deskripsi_pertanyaan:
                  'Terdapat monitoring dan evaluasi terhadap pembangunan Zona Integritas',
                uraian_buktidukung:
                  '(i) Laporan monitoring dan evaluasi pelaksanaan kegiatan;\r\n(ii) Undangan, daftar hadir, dan notulen pelaksanaan rapat evaluasi.',
                kategoriPenilaian: [
                  {
                    id_kategori: 18,
                    uraian_kategori:
                      'a. Jika monitoring dan evaluasi melibatkan pimpinan dan dilakukan secara berkala;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 19,
                    uraian_kategori:
                      'b. Jika monitoring dan evaluasi melibatkan pimpinan tetapi tidak secara berkala;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 20,
                    uraian_kategori:
                      'c. Jika monitoring dan evaluasi tidak melibatkan pimpinan dan tidak secara berkala;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 21,
                    uraian_kategori:
                      'd. Jika tidak terdapat monitoring dan evaluasi terhadap pembangunan zona integritas.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 8,
                deskripsi_pertanyaan:
                  'Hasil Monitoring dan Evaluasi telah ditindaklanjuti',
                uraian_buktidukung:
                  '(i) Notulen/laporan monitoring dan evaluasi yang memuat rekomendasi;\r\n(ii) Laporan hasil tindak lanjut rekomendasi;\r\n(iii) Dokumentasi pelaksanaan tindak lanjut',
                kategoriPenilaian: [
                  {
                    id_kategori: 22,
                    uraian_kategori:
                      'a. Jika semua catatan/rekomendasi hasil monitoring dan evaluasi tim internal atas persiapan dan pelaksanaan kegiatan Unit WBK/WBBM telah ditindaklanjuti;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 23,
                    uraian_kategori:
                      'b. Jika sebagian besar catatan/rekomendasi hasil monitoring dan evaluasi tim internal atas persiapan dan pelaksanaan kegiatan Unit WBK/WBBM telah ditindaklanjuti;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 24,
                    uraian_kategori:
                      'c. Jika sebagian kecil catatan/rekomendasi hasil monitoring dan evaluasi tim internal atas persiapan dan pelaksanaan kegiatan Unit WBK/WBBM telah ditindaklanjuti;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 25,
                    uraian_kategori:
                      'd. Jika catatan/rekomendasi hasil monitoring dan evaluasi tim internal atas persiapan dan pelaksanaan kegiatan Unit WBK/WBBM belum ditindaklanjuti.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 4,
            nama_subpilar: 'Perubahan pola pikir dan budaya kerja',
            pertanyaan: [
              {
                id_pertanyaan: 9,
                deskripsi_pertanyaan:
                  'Pimpinan berperan sebagai role model dalam pelaksanaan Pembangunan WBK/WBBM',
                uraian_buktidukung:
                  'Laporan tahunan penerapan nilai-nilai organisasi (BerAKHLAK) oleh pimpinan sebagai role model/change leader.',
                kategoriPenilaian: [
                  {
                    id_kategori: 26,
                    uraian_kategori:
                      'Ya, jika pimpinan menjadi contoh pelaksanaan nilai-nilai organisasi.',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 27,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 10,
                deskripsi_pertanyaan: 'Sudah ditetapkan agen perubahan',
                uraian_buktidukung:
                  '(i) SK Agen Perubahan/ Change Ambassador 2024\r\n(ii) Laporan Pelaksanaan Program Change Ambassador 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 28,
                    uraian_kategori:
                      'a. Jika agen perubahan telah ditetapkan dan berkontribusi terhadap perubahan pada unit kerjanya;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 29,
                    uraian_kategori:
                      'b. Jika agen perubahan telah ditetapkan namun belum berkontribusi terhadap perubahan pada unit kerjanya;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 30,
                    uraian_kategori: 'c. Jika belum terdapat agen perubahan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 11,
                deskripsi_pertanyaan:
                  'Telah dibangun budaya kerja dan pola pikir di lingkungan organisasi',
                uraian_buktidukung:
                  '(i) Laporan penerapan budaya kerja\r\n(ii) Matrik dampak penerapan perubahan budaya kerja dan pola pikir',
                kategoriPenilaian: [
                  {
                    id_kategori: 31,
                    uraian_kategori:
                      'a. Jika telah dilakukan upaya pembangunan budaya kerja dan pola pikir dan mampu mengurangi resistensi atas perubahan;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 32,
                    uraian_kategori:
                      'b. Jika telah dilakukan upaya pembangunan budaya kerja dan pola pikir tapi masih terdapat resistensi atas perubahan;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 33,
                    uraian_kategori:
                      'c. Jika belum terdapat upaya pembangunan budaya kerja dan pola pikir.x',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 12,
                deskripsi_pertanyaan:
                  'Anggota organisasi terlibat dalam pembangunan Zona Integritas menuju WBK/WBBM',
                uraian_buktidukung:
                  '(i) Dokumen pakta integritas;\r\n(ii) Dokumen pelaksanaan rapat Monev ZI triwulanan;\r\n(iii) Dokumen yang memuat usulan-usulan anggota dan tindak lanjutnya',
                kategoriPenilaian: [
                  {
                    id_kategori: 34,
                    uraian_kategori:
                      'a. Jika telah dilakukan upaya pembangunan budaya kerja dan pola pikir dan mampu mengurangi resistensi atas perubahan;',
                    nilai: 0.375
                  },
                  {
                    id_kategori: 35,
                    uraian_kategori:
                      'b. Jika sebagian besar anggota terlibat dalam pembangunan Zona Integritas menuju WBK/WBBM;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 36,
                    uraian_kategori:
                      'c. Jika sebagian kecil anggota terlibat dalam pembangunan Zona Integritas menuju WBK/WBBM;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 37,
                    uraian_kategori:
                      'd. Jika belum ada anggota terlibat dalam pembangunan Zona Integritas menuju WBK/WBBM.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 6,
        nama_pilar: 'Peningkatan Kualitas Pelayanan Publik',
        subpilar: [
          {
            id_subpilar: 21,
            nama_subpilar: 'Standar Pelayanan',
            pertanyaan: [
              {
                id_pertanyaan: 69,
                deskripsi_pertanyaan: 'Terdapat kebijakan standar pelayanan',
                uraian_buktidukung:
                  '(i) Perka BPS No.65 Tahun 2024 tentang Standar Pelayanan Statistik Terpadu\r\n(ii) Keputusan Pejabat Pengelola Informasi dan Dokumentasi Badan Pusat Statistik No. B-323/02400/HK.200/07/2022 tentang Standar Layanan Informasi Publik di lingkungan Badan Pusat Statistik \r\n(iii) Dokumen SK standar pelayanan publik',
                kategoriPenilaian: [
                  {
                    id_kategori: 221,
                    uraian_kategori:
                      'a. Terdapat penetapan Standar Pelayanan terhadap seluruh jenis pelayanan, dan sesuai asas serta komponen standar pelayanan publik yang berlaku;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 222,
                    uraian_kategori:
                      'b. Terdapat penetapan Standar Pelayanan terhadap sebagian jenis pelayanan, dan sesuai asas serta komponen standar pelayanan publik yang berlaku;',
                    nilai: 0.1875
                  },
                  {
                    id_kategori: 223,
                    uraian_kategori:
                      'c. Terdapat penetapan Standar Pelayanan terhadap seluruh jenis pelayanan, namun tidak sesuai asas serta komponen standar pelayanan publik yang berlaku;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 224,
                    uraian_kategori:
                      'd. Terdapat penetapan Standar Pelayanan terhadap sebagian jenis pelayanan, namun tidak sesuai asas serta komponen standar pelayanan publik yang berlaku;',
                    nilai: 0.0625
                  },
                  {
                    id_kategori: 225,
                    uraian_kategori: 'e. Standar Pelayanan belum ditetapkan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 70,
                deskripsi_pertanyaan: 'Standar pelayanan telah dimaklumatkan',
                uraian_buktidukung:
                  '(i) Dokumen maklumat standar pelayanan yang ditandatangani kepala satker paling lambat 7 hari setelah SK standar pelayanan terbit\r\n(ii) Capture/foto dokumen maklumat standar pelayanan di tempat pelayanan misal PST, website, dan media lainnya (social media)\r\n(iii) SK Maklumat Pelayanan',
                kategoriPenilaian: [
                  {
                    id_kategori: 226,
                    uraian_kategori:
                      'a. Standar pelayanan telah dimaklumatkan pada seluruh jenis pelayanan dan dipublikasikan di website dan media lainnya;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 227,
                    uraian_kategori:
                      'b. Standar pelayanan telah dimaklumatkan pada sebagian besar jenis pelayanan dan dipublikasikan minimal di website;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 228,
                    uraian_kategori:
                      'c. Standar pelayanan telah dimaklumatkan pada sebagian kecil jenis pelayanan dan belum dipublikasikan;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 229,
                    uraian_kategori:
                      'd. Standar pelayanan belum dimaklumatkan pada seluruh jenis pelayanan dan belum dipublikasikan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 71,
                deskripsi_pertanyaan:
                  'Dilakukan reviu dan perbaikan atas standar pelayanan',
                uraian_buktidukung:
                  '(i) Dokumentasi rapat reviu standar pelayanan yang dilakukan dengan melibatkan stakeholders dan masyarakat (dilengkapi Undangan, Daftar Hadir, Notulensi, Dokumentasi Rapat)\r\n(ii) Dokumen reviu standar pelayanan yang dilakukan dengan melibatkan stakeholders (antara lain: tokoh masyarakat, akademisi, dunia usaha, dan lembaga swadaya masyarakat), serta memanfaatkan masukan hasil SKM/SKD dan pengaduan masyarakat',
                kategoriPenilaian: [
                  {
                    id_kategori: 230,
                    uraian_kategori:
                      'a. Dilakukan reviu dan perbaikan atas standar pelayanan dan dilakukan dengan melibatkan stakeholders (antara lain : tokoh masyarakat, akademisi, dunia usaha, dan lembaga swadaya masyarakat), serta memanfaatkan masukan hasil SKM dan pengaduan masyarakat;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 231,
                    uraian_kategori:
                      'b. Dilakukan reviu dan perbaikan atas standar pelayanan dan dilakukan dengan memanfaatkan masukan hasil SKM dan pengaduan masyarakat, namun tanpa melibatkan stakeholders;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 232,
                    uraian_kategori:
                      'c. Dilakukan reviu dan perbaikan atas standar pelayanan, namun dilakukan tanpa memanfaatkan masukan hasil SKM dan pengaduan masyarakat, serta tanpa melibatkan stakeholders;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 233,
                    uraian_kategori:
                      'd. Belum dilakukan reviu dan perbaikan atas standar pelayanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 72,
                deskripsi_pertanyaan:
                  'Telah melakukan publikasi atas standar pelayanan dan maklumat pelayanan',
                uraian_buktidukung:
                  '(i) Dokumen bukti maklumat pelayanan telah dipublikasikan di berbagai media\r\n(ii) Dokumen bukti standar pelayanan telah dipublikasikan di berbagai media',
                kategoriPenilaian: [
                  {
                    id_kategori: 234,
                    uraian_kategori:
                      'Ya, telah melakukan publikasi atas standar pelayanan dan maklumat pelayanan.',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 235,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 22,
            nama_subpilar: 'Budaya Pelayanan Prima',
            pertanyaan: [
              {
                id_pertanyaan: 76,
                deskripsi_pertanyaan:
                  'Telah terdapat sistem pemberian kompensasi kepada penerima layanan bila layanan tidak sesuai standar',
                uraian_buktidukung:
                  '(i) Dokumen mekanisme pemberian kompensasi pada setiap jenis layanan\r\n(ii) Dokumentasi bukti pemberian kompensasi kepada penerima layanan (jika ada)',
                kategoriPenilaian: [
                  {
                    id_kategori: 249,
                    uraian_kategori:
                      'a. Telah terdapat sistem pemberian kompensasi bila layanan tidak sesuai standar bagi penerima layanan di seluruh jenis layanan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 250,
                    uraian_kategori:
                      'b. Telah terdapat sistem pemberian kompensasi bila layanan tidak sesuai standar bagi penerima layanan di sebagian besar jenis layanan;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 251,
                    uraian_kategori:
                      'c. Telah terdapat sistem pemberian kompensasi bila layanan tidak sesuai standar bagi penerima layanan di sebagian kecil jenis layanan;',
                    nilai: 0.0555556
                  },
                  {
                    id_kategori: 252,
                    uraian_kategori:
                      'd. Belum terdapat sistem pemberian kompensasi bila layanan tidak sesuai standar.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 77,
                deskripsi_pertanyaan:
                  'Terdapat sarana layanan terpadu/terintegrasi',
                uraian_buktidukung:
                  '(i) Aplikasi Layanan PST\r\n(ii) Layanan Berbasis Website\r\n(iii) Layanan Berbasis Aplikasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 253,
                    uraian_kategori:
                      'a. Jika seluruh pelayanan sudah dilakukan secara terpadu/terintegrasi;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 254,
                    uraian_kategori:
                      'b. Jika sebagian besar pelayanan sudah dilakukan secara terpadu/terintegrasi;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 255,
                    uraian_kategori:
                      'c. Jika sebagian kecil pelayanan sudah dilakukan secara terpadu/terintegrasi;',
                    nilai: 0.0555556
                  },
                  {
                    id_kategori: 256,
                    uraian_kategori:
                      'd. Jika tidak ada pelayanan yang dilakukan secara terpadu/terintegrasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 78,
                deskripsi_pertanyaan: 'Terdapat inovasi pelayanan',
                uraian_buktidukung:
                  '(i) Laporan  inovasi  pelayanan  publik  (Inovasi  tidak harus yang berupa pengembangan aplikasi berbasis IT, namun dapat berupa penambahan dekoratif pada ruang layanan, penyediaan layanan bagi disabilitas, pemberian layanan secara jemput bola seperti pojok statistik, road show/sosialisasi terkait pemberian layanan) yang dilegalisir oleh pimpinan\r\n(ii) Dokumen bukti bahwa inovasi telah direplikasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 257,
                    uraian_kategori:
                      'a. Jika unit kerja telah memiliki inovasi pelayanan yang berbeda dengan unit kerja lain dan mendekatkan pelayanan dengan masyarakat serta telah direplikasi;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 258,
                    uraian_kategori:
                      'b. Jika unit kerja telah memiliki inovasi pelayanan yang berbeda dengan unit kerja lain dan mendekatkan pelayanan dengan masyarakat;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 259,
                    uraian_kategori:
                      'c. Jika unit kerja memiliki inovasi yang merupakan replikasi dan pengembangan dari inovasi yang sudah ada;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 260,
                    uraian_kategori:
                      'd. Jika unit kerja telah memiliki inovasi akan tetapi merupakan pelaksanaan inovasi dari instansi pemerintah;',
                    nilai: 0.0416667
                  },
                  {
                    id_kategori: 261,
                    uraian_kategori:
                      'e. Jika unit kerja belum memiliki inovasi pelayanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 73,
                deskripsi_pertanyaan:
                  'Telah dilakukan berbagai upaya peningkatan kemampuan dan/atau kompetensi tentang penerapan budaya pelayanan prima',
                uraian_buktidukung:
                  '(i) Dokumen pelatihan/sosialisasi pelayanan prima kepada pegawai/petugas layanan, antara lain:\r\n- rapat (undangan, daftar hadir, notulen)\r\n(ii) laporan dan materi pelatihan/sosialisasi pelayanan prima kepada pegawai/petugas layanan\r\n(iii) Dokumen jadwal pelatihan/sosialisasi yang menunjukkan bahwa pelatihan/sosialisasi dilakukan secara berkelanjutan dan terjadwal\r\n(iv) Dokumen monitoring dan evaluasi atas kualitas layanan yang diberikan oleh pegawai/petugas layanan',
                kategoriPenilaian: [
                  {
                    id_kategori: 236,
                    uraian_kategori:
                      'a. Telah dilakukan pelatihan/sosialisasi pelayanan prima secara berkelanjutan dan terjadwal, sehingga seluruh petugas/pelaksana layanan memiliki kompetensi sesuai kebutuhan jenis layanan serta telah dan terdapat monev yang melihat kemampuan/kecakapan petugas/pelaksana layanan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 237,
                    uraian_kategori:
                      'b. Telah dilakukan pelatihan/sosialisasi pelayanan prima, dan seluruh petugas/pelaksana layanan memiliki kompetensi sesuai kebutuhan jenis layanan;',
                    nilai: 0.125
                  },
                  {
                    id_kategori: 238,
                    uraian_kategori:
                      'c. Telah dilakukan pelatihan/sosialisasi pelayanan prima, akan tetapi baru sebagian besar petugas/pelaksana layanan memiliki kompetensi sesuai kebutuhan jenis layanan ;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 239,
                    uraian_kategori:
                      'd. Telah dilakukan pelatihan/sosialisasi pelayanan prima namun secara terbatas, sehingga hanya sebagian kecil petugas/pelaksana layanan yang memiliki kompetensi sesuai kebutuhan jenis layanan;',
                    nilai: 0.0416667
                  },
                  {
                    id_kategori: 240,
                    uraian_kategori:
                      'e. Belum dilakukan pelatihan/sosialisasi pelayanan prima, dan seluruh petugas/pelaksana layanan belum memiliki kompetensi sesuai kebutuhan jenis layanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 74,
                deskripsi_pertanyaan:
                  'Informasi tentang pelayanan mudah diakses melalui berbagai media',
                uraian_buktidukung:
                  '(i) Dokumen Capture sarana informasi tentang pelayanan yang disediakan pada berbagai media\r\n(ii) Dokumen Capture sarana informasi tentang pelayanan yang disediakan telah terdaftar dan muncul pada SIPPN',
                kategoriPenilaian: [
                  {
                    id_kategori: 241,
                    uraian_kategori:
                      'a. Seluruh Informasi tentang pelayanan dapat diakses secara online (website/media sosial) dan terhubung dengan sistem informasi pelayanan publik nasional;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 242,
                    uraian_kategori:
                      'b. Seluruh Informasi tentang pelayanan dapat diakses secara online (website/media sosial), namun belum terhubung dengan sistem informasi pelayanan publik nasional;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 243,
                    uraian_kategori:
                      'c. Seluruh Informasi tentang pelayanan belum online, hanya dapat diakses di tempat layanan (intranet dan non elektronik);',
                    nilai: 0.0555556
                  },
                  {
                    id_kategori: 244,
                    uraian_kategori:
                      'd. Informasi tentang pelayanan sulit diakses.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 75,
                deskripsi_pertanyaan:
                  'Telah terdapat sistem pemberian penghargaan dan sanksi bagi petugas pemberi pelayanan',
                uraian_buktidukung:
                  '(i) Dokumen mekanisme reward dan punishment yang minimal memenuhi unsur penilaian disiplin, kinerja, dan hasil penilaian pengguna layanan\r\n(ii) Dokumen penghargaan atas pelaksanaan pelayanan yang baik secara tahunan',
                kategoriPenilaian: [
                  {
                    id_kategori: 245,
                    uraian_kategori:
                      'a. Telah terdapat kebijakan pemberian penghargaan dan sanksi yang minimal memenuhi unsur penilaian: disiplin, kinerja, dan hasil penilaian pengguna layanan, dan telah diterapkan secara rutin/berkelanjutan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 246,
                    uraian_kategori:
                      'b. Telah terdapat kebijakan pemberian penghargaan dan sanksi yang minimal memenuhi unsur penilaian: disiplin, kinerja, dan hasil penilaian pengguna layanan, namun belum diterapkan secara rutin/berkelanjutan;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 247,
                    uraian_kategori:
                      'c. Telah terdapat kebijakan pemberian penghargaan dan sanksi, namun belum memenuhi unsur penilaian minimal : disiplin, kinerja, dan hasil penilaian pengguna layanan;',
                    nilai: 0.0555556
                  },
                  {
                    id_kategori: 248,
                    uraian_kategori:
                      'd. Belum terdapat kebijakan pemberian penghargaan dan sanksi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 23,
            nama_subpilar: 'Pengelolaan Pengaduan',
            pertanyaan: [
              {
                id_pertanyaan: 79,
                deskripsi_pertanyaan:
                  'Terdapat media pengaduan dan konsultasi pelayanan yang terintegrasi dengan SP4N-Lapor!',
                uraian_buktidukung:
                  '(i) SK/surat tugas Tim/Petugas khusus yg menangani aduan\r\n(ii) Screenshot profil instansi BPS pada lapor.go.id\r\n(iii) Dokumentasi akses admin SP4N-LAPOR!\r\n(iv) Dokumentasi laporan dari kotak pengaduan ataupun media lainnya secara online dan offline',
                kategoriPenilaian: [
                  {
                    id_kategori: 262,
                    uraian_kategori:
                      'a. Terdapat media konsultasi dan pengaduan secara offline dan online, tersedia petugas khusus yang menangani, dan terintegrasi dengan SP4N-LAPOR!;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 263,
                    uraian_kategori:
                      'b. Terdapat media konsultasi dan pengaduan secara offline dan online, tersedia petugas khusus yang menangani namun belum terintegrasi dengan SP4N-LAPOR!;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 264,
                    uraian_kategori:
                      'c. Terdapat media konsultasi dan pengaduan secara offline dan online, namun belum tersedia petugas khusus yang menangani;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 265,
                    uraian_kategori:
                      'd. Hanya terdapat media konsultasi dan pengaduan secara offline;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 266,
                    uraian_kategori:
                      'e. Tidak terdapat media konsultasi dan pengaduan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 80,
                deskripsi_pertanyaan:
                  'Terdapat unit yang mengelola pengaduan dan konsultasi pelayanan',
                uraian_buktidukung:
                  '(i) Dokumentasi akses admin SP4N-LAPOR!\r\n(ii) Surat Keputusan/SK pengelola SP4N-LAPOR! di level unit kerja',
                kategoriPenilaian: [
                  {
                    id_kategori: 267,
                    uraian_kategori:
                      'a. Terdapat unit pengelola khusus untuk konsultasi dan pengaduan, serta surat penugasan pengelola SP4N-LAPOR! di level unit kerja;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 268,
                    uraian_kategori:
                      'b. Terdapat SK pengelola SP4N-LAPOR! di level instansi dan/atau surat penugasan pengelola SP4N-LAPOR! di level unit kerja, namun unit pengelola khusus untuk konsultasi dan pengaduan belum ada;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 269,
                    uraian_kategori:
                      'c. Belum terdapat unit pengelola khusus untuk konsultasi dan pengaduan, serta belum terdapat SK pengelola SP4N-LAPOR! di level instansi dan/atau surat penugasan pengelola SP4N-LAPOR! di level unit kerja.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 81,
                deskripsi_pertanyaan:
                  'Telah dilakukan evaluasi atas penanganan keluhan/masukan dan konsultasi',
                uraian_buktidukung:
                  '(i) Laporan evaluasi atas penanganan\r\nkeluhan/masukan dan konsultasi secara berkala',
                kategoriPenilaian: [
                  {
                    id_kategori: 270,
                    uraian_kategori:
                      'a. Evaluasi atas penanganan keluhan/masukan dan konsultasi dilakukan secara berkala;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 271,
                    uraian_kategori:
                      'b. Evaluasi atas penanganan keluhan/masukan dan konsultasi dilakukan tidak berkala;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 272,
                    uraian_kategori:
                      'c. Belum dilakukan evaluasi penanganan keluhan/masukan dan konsultasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 24,
            nama_subpilar: 'Penilaian Kepuasan terhadap Pelayanan',
            pertanyaan: [
              {
                id_pertanyaan: 82,
                deskripsi_pertanyaan:
                  'Telah dilakukan survei kepuasan masyarakat terhadap pelayanan',
                uraian_buktidukung: '(i) Laporan SKD per triwulan',
                kategoriPenilaian: [
                  {
                    id_kategori: 273,
                    uraian_kategori:
                      'a. Survei kepuasan masyarakat terhadap pelayanan dilakukan minimal 4 kali dalam setahun;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 274,
                    uraian_kategori:
                      'b. Survei kepuasan masyarakat terhadap pelayanan dilakukan minimal 3 kali dalam setahun;',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 275,
                    uraian_kategori:
                      'c. Survei kepuasan masyarakat terhadap pelayanan dilakukan minimal 2 kali dalam setahun;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 276,
                    uraian_kategori:
                      'd. Survei kepuasan masyarakat terhadap pelayanan dilakukan minimal 1 kali dalam setahun;',
                    nilai: 0.0833333
                  },
                  {
                    id_kategori: 277,
                    uraian_kategori:
                      'e. Belum dilakukan survei kepuasan masyarakat terhadap pelayanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 83,
                deskripsi_pertanyaan:
                  'Hasil survei kepuasan masyarakat dapat diakses secara terbuka',
                uraian_buktidukung:
                  '(i) Link publikasi SKD yang telah diterbitkan pada\r\nwebsite beserta screenshot-nya\r\n(ii) Dokumentasi Poster indeks kepuasan konsumen dan SKM/SKD triwulanan secara offline  dan online',
                kategoriPenilaian: [
                  {
                    id_kategori: 278,
                    uraian_kategori:
                      'a. Hasil survei kepuasan masyarakat dapat diakses secara online (website, media sosial, dll) dan offline;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 279,
                    uraian_kategori:
                      'b. Hasil survei kepuasan masyarakat hanya dapat diakses secara offline di tempat layanan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 280,
                    uraian_kategori:
                      'c. Hasil survei kepuasan masyarakat tidak dipublikasi.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 84,
                deskripsi_pertanyaan:
                  'Dilakukan tindak lanjut atas hasil survei kepuasan masyarakat',
                uraian_buktidukung:
                  '(i) Dokumen rencana tindak lanjut/rekomendasi hasil SKD\r\n(ii) Dokumentasi bukti tindak lanjut telah dilaksanakan',
                kategoriPenilaian: [
                  {
                    id_kategori: 281,
                    uraian_kategori:
                      'a. Jika dilakukan tindak lanjut atas seluruh hasil survei kepuasan masyarakat;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 282,
                    uraian_kategori:
                      'b. Jika dilakukan tindak lanjut atas sebagian besar hasil survei kepuasan masyarakat;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 283,
                    uraian_kategori:
                      'c. Jika dilakukan tindak lanjut atas sebagian kecil hasil survei kepuasan masyarakat;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 284,
                    uraian_kategori:
                      'd. Jika belum dilakukan tindak lanjut atas hasil survei kepuasan masyarakat.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 25,
            nama_subpilar: 'Pemanfaatan Teknologi Informasi',
            pertanyaan: [
              {
                id_pertanyaan: 85,
                deskripsi_pertanyaan:
                  'Telah menerapkan teknologi informasi dalam memberikan pelayanan',
                uraian_buktidukung:
                  '(i) Dokumentasi seluruh jenis pelayanan yang\r\ndilakukan dengan memanfaatkan teknologi informasi ataupun yang dilakukan secara online, misal:\r\n•      Perpustakaan: PST online, Allstat, data pada website.\r\n•      Konsultasi datang langsung: inovasi pelayanan satker.\r\n•      Konsultasi online: medsos (whatsapp),\r\nlivechat;\r\n•      Penjualan publikasi datang langsung: inovasi pelayanan satker.\r\n•      Penjualan publikasi online: silastik.\r\n•      Penjualan data mikro datang langsung: inovasi pelayanan satker.\r\n•      Penjualan data mikro online: silastik.\r\n•      Rekomendasi kegiatan statistik: romantik.',
                kategoriPenilaian: [
                  {
                    id_kategori: 285,
                    uraian_kategori:
                      'a. Terdapat pelayanan yang menggunakan teknologi informasi pada seluruh proses pemberian layanan;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 286,
                    uraian_kategori:
                      'b. Terdapat pelayanan yang menggunakan teknologi informasi pada sebagian besar proses pemberian layanan;',
                    nilai: 0.222222
                  },
                  {
                    id_kategori: 287,
                    uraian_kategori:
                      'c. Terdapat pelayanan yang menggunakan teknologi informasi pada sebagian kecil proses pemberian layanan;',
                    nilai: 0.111111
                  },
                  {
                    id_kategori: 288,
                    uraian_kategori:
                      'd. Terdapat pelayanan yang belum menggunakan teknologi informasi pada proses pemberian pelayanan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 86,
                deskripsi_pertanyaan:
                  'Telah membangun database pelayanan yang terintegrasi',
                uraian_buktidukung:
                  '(i) Dokumen narasi terkait sistem pelayanan BPS yang terintegrasi menggunakan PST, dimana databasenya tersentralisir dan jenis layanannya dapat berupa pemanfaatan website BPS, aplikasi mobile Allstat, dan layanan konsultasi offline yang menggunakan tabel dinamis, dll)',
                kategoriPenilaian: [
                  {
                    id_kategori: 289,
                    uraian_kategori:
                      'Ya, jika telah membangun database pelayanan yang terintegrasi.',
                    nilai: 0
                  },
                  {
                    id_kategori: 290,
                    uraian_kategori: 'Tidak',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 87,
                deskripsi_pertanyaan:
                  'Telah dilakukan perbaikan secara terus menerus',
                uraian_buktidukung:
                  '(i) Dokumen   monitoring   dan   evaluasi   perbaikan pelayanan TI per triwulanan (before-after)',
                kategoriPenilaian: [
                  {
                    id_kategori: 291,
                    uraian_kategori:
                      'a. Perbaikan dilakukan secara terus-menerus;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 292,
                    uraian_kategori:
                      'b. Perbaikan dilakukan tidak secara terus menerus;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 293,
                    uraian_kategori: 'c. Belum dilakukan perbaikan.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id_area: 2,
    nama_area: 'Reform',
    pilar: [
      {
        id_pilar: 8,
        nama_pilar: 'Penataan Tatalaksana',
        subpilar: [
          {
            id_subpilar: 29,
            nama_subpilar:
              'Peta Proses Bisnis Mempengaruhi Penyederhanaan Jabatan',
            pertanyaan: [
              {
                id_pertanyaan: 92,
                deskripsi_pertanyaan:
                  'Telah disusun peta proses bisnis dengan adanya penyederhanaan jabatan',
                uraian_buktidukung:
                  '(i) Peraturan BPS Nomor 7 Tahun 2020 Tentang Organisasi dan Tata Kerja BPS (BPS Pusat) serta Peraturan BPS Nomor 5 Tahun 2023 Tentang Organisasi dan Tata Kerja BPS Provinsi dan BPS Kabupaten/Kota (BPS Daerah);\r\n(ii) Surat perintah penyederhanaan organisasi di Surat Edaran (SE) Menteri PANRB Nomor 393 Tahun 2019 tentang langkah Strategis dan Konkret Penyederhanaan Birokrasi dan diperkuat oleh SE MenPANRB Nomor 15 tahun 2023 tentang tata cara penilaian Penyederhanaan Birokrasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 309,
                    uraian_kategori:
                      'a. Peta proses bisnis telah disusun dan mempengaruhi penyederhanaan seluruh jabatan;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 310,
                    uraian_kategori:
                      'b. Peta proses bisnis telah disusun dan mempengaruhi penyederhanaan sebagian besar (lebih dari 50%) jabatan;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 311,
                    uraian_kategori:
                      'c. Peta proses bisnis telah disusun dan mempengaruhi penyederhanaan sebagian kecil (kurang dari 50%) jabatan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 312,
                    uraian_kategori:
                      'd. Peta proses bisnis telah disusun dan belum mempengaruhi penyederhanaan jabatan.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 30,
            nama_subpilar:
              'Sistem Pemerintahan Berbasis Elektronik (SPBE) yang Terintegrasi',
            pertanyaan: [
              {
                id_pertanyaan: 93,
                deskripsi_pertanyaan:
                  'Implementasi SPBE telah terintegrasi dan mampu mendorong pelaksanaan pelayanan publik yang lebih cepat dan efisien',
                uraian_buktidukung:
                  '(i) Daftar Layanan pada pelayanan publik yang mengimplementasikan SPBE (disertai narasi dampak implementasi SPBE bagi pihak eksternal)\r\n(ii) Dokumen Narasi penjelasan SPBE\r\n(iii) Dokumen yang menyatakan bahwa SPBE telah terintegrasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 313,
                    uraian_kategori:
                      'a. Implementasi SPBE telah terintegrasi dan mampu mendorong pelaksanaan pelayanan publik yang lebih cepat dan efisien;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 314,
                    uraian_kategori:
                      'b. Implementasi SPBE telah mampu mendorong pelaksanaan pelayanan publik yang lebih cepat dan efisien, namun belum terintegrasi (parsial);',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 315,
                    uraian_kategori:
                      'c. Implementasi SPBE belum mendorong pelaksanaan pelayanan publik yang lebih cepat dan efisien.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 94,
                deskripsi_pertanyaan:
                  'Implementasi SPBE telah terintegrasi dan mampu mendorong pelaksanaan pelayanan internal organisasi yang lebih cepat dan efisien',
                uraian_buktidukung:
                  '(i) Daftar Layanan pada pelayanan internal organisasi yang mengimplementasikan SPBE dan disertai narasi dampak implementasi SPBE (hanya yang bersifat Internal, seperti: BOS, KipApp, Sipecut, dll\r\n(ii) Dokumen Narasi Penjelasan SPBE\r\n(iii) Dokumen yang menyatakan bahwa SPBE telah terintegrasi',
                kategoriPenilaian: [
                  {
                    id_kategori: 316,
                    uraian_kategori:
                      'a. Implementasi SPBE telah terintegrasi dan mampu mendorong pelaksanaan pelayanan internal unit kerja yang lebih cepat dan efisien;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 317,
                    uraian_kategori:
                      'b. Implementasi SPBE telah mampu mendorong pelaksanaan pelayanan internal unit kerja yang lebih cepat dan efisien, namun belum terintegrasi (parsial);',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 318,
                    uraian_kategori:
                      'c. Implementasi SPBE belum mendorong pelaksanaan pelayanan internal unit kerja yang lebih cepat dan efisien.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 31,
            nama_subpilar: 'Transformasi Digital Memberikan Nilai Manfaat',
            pertanyaan: [
              {
                id_pertanyaan: 95,
                deskripsi_pertanyaan:
                  'Transformasi digital pada bidang proses bisnis utama telah mampu memberikan nilai manfaat bagi unit kerja secara optimal',
                uraian_buktidukung:
                  '(i) Narasi alasan perubahan metode pencacahan dari PAPI menjadi CAPI\r\n(ii) Buku Pedoman penggunaan PAPI dan CAPI pada Sakernas \r\n(iii) Surat edaran Pusat terkait pencacahan menggunakan CAPI\r\n(iv) Screen shot Pemanfaatan CAPI pada berbagai survey\r\n(v) Dokumen evaluasi atas transformasi digital PAPI ke CAPI',
                kategoriPenilaian: [
                  {
                    id_kategori: 319,
                    uraian_kategori:
                      'a. Kriteria huruf b telah terpenuhi dan penerapan atau penggunaan dari manfaat/dampak dari transformasi digital pada bidang proses bisnis utama bagi unit kerja telah dilakukan validasi dan evaluasi serta ditindaklanjuti secara berkelanjutan;',
                    nilai: 0.666667
                  },
                  {
                    id_kategori: 320,
                    uraian_kategori:
                      'b. Kriteria huruf c telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang proses bisnis utama telah diterapkan/digunakan oleh unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 321,
                    uraian_kategori:
                      'c. Kriteria huruf d telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang proses bisnis utama telah mampu direalisasikan pada unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 322,
                    uraian_kategori:
                      'd. Kriteria huruf e telah terpenuhi dan kapabilitas prakiraan dan pelacakan terhadap sasaran dan target manfaat/dampak dari transformasi digital pada bidang proses bisnis utama;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 323,
                    uraian_kategori:
                      'e. Sasaran dan target manfaat/dampak dari transformasi digital pada bidang proses bisnis utama telah direncanakan, didefinisikan, dan ditetapkan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 96,
                deskripsi_pertanyaan:
                  'Transformasi digital pada bidang administrasi pemerintahan telah mampu memberikan nilai manfaat bagi unit kerja secara optimal',
                uraian_buktidukung:
                  '(i) Narasi pemanfaatan BOS dan Kipapp dari Buku Pedoman BOS dan Kipapp\r\n(ii) Buku Pedoman penggunaan BOS dan Kipapp\r\n(iii) Surat edaran Pusat terkait pemanfaatan BOS dan Kipapp\r\n(iv) Screen shot Pemanfaatan BOS dan Kipapp\r\n(v) Dokumen evaluasi atas pemanfaatan BOS dan KipApp',
                kategoriPenilaian: [
                  {
                    id_kategori: 324,
                    uraian_kategori:
                      'a. Kriteria huruf b telah terpenuhi dan penerapan atau penggunaan dari manfaat/dampak dari transformasi digital pada bidang administrasi pemerintahan bagi unit kerja telah dilakukan validasi dan evaluasi serta ditindaklanjuti secara berkelanjutan;',
                    nilai: 0.666667
                  },
                  {
                    id_kategori: 325,
                    uraian_kategori:
                      'b. Kriteria huruf c telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang administrasi pemerintahan telah diterapkan/digunakan oleh unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 326,
                    uraian_kategori:
                      'c. Kriteria huruf d telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang administrasi pemerintahan telah mampu direalisasikan pada unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 327,
                    uraian_kategori:
                      'd. Kriteria huruf e telah terpenuhi dan kapabilitas prakiraan dan pelacakan terhadap sasaran dan target manfaat/dampak dari transformasi digital pada bidang administrasi pemerintahan;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 328,
                    uraian_kategori:
                      'e. Sasaran dan target manfaat/dampak dari transformasi digital pada bidang administrasi pemerintahan telah direncanakan, didefinisikan, dan ditetapkan.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 97,
                deskripsi_pertanyaan:
                  'Transformasi digital pada bidang pelayanan publik telah mampu memberikan nilai manfaat bagi unit kerja secara optimal',
                uraian_buktidukung:
                  '(i) Narasi/Buku Pedoman pemanfaatan Website, Silasitik, Romantik, PPID, SIRUP, dll\r\n(ii) Screen shot pemanfaatan Website, Silasitik, Romantik, PPID, SIRUP, dll\r\n(iii) Dokumen evaluasi atas pemanfaatan Website, Silasitik, Romantik, PPID, SIRUP, dll',
                kategoriPenilaian: [
                  {
                    id_kategori: 329,
                    uraian_kategori:
                      'a. Kriteria huruf b telah terpenuhi dan penerapan atau penggunaan dari manfaat/dampak dari transformasi digital pada bidang pelayanan publik bagi unit kerja telah dilakukan validasi dan evaluasi serta ditindaklanjuti secara berkelanjutan;',
                    nilai: 0.666667
                  },
                  {
                    id_kategori: 330,
                    uraian_kategori:
                      'b. Kriteria huruf c telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang pelayanan publik telah diterapkan/digunakan oleh unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 331,
                    uraian_kategori:
                      'c. Kriteria huruf d telah terpenuhi dan manfaat/dampak dari transformasi digital pada bidang pelayanan publik telah mampu direalisasikan pada unit kerja sesuai dengan sasaran dan target manfaat/dampak;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 332,
                    uraian_kategori:
                      'd. Kriteria huruf e telah terpenuhi dan kapabilitas prakiraan dan pelacakan terhadap sasaran dan target manfaat/dampak dari transformasi digital pada bidang pelayanan publik;',
                    nilai: 0.166667
                  },
                  {
                    id_kategori: 333,
                    uraian_kategori:
                      'e. Sasaran dan target manfaat/dampak dari transformasi digital pada bidang pelayanan publik telah direncanakan, didefinisikan, dan ditetapkan.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 9,
        nama_pilar: 'Penataan Sistem Manajemen SDM Aparatur',
        subpilar: [
          {
            id_subpilar: 32,
            nama_subpilar: 'Kinerja Individu',
            pertanyaan: [
              {
                id_pertanyaan: 98,
                deskripsi_pertanyaan:
                  'Ukuran kinerja individu telah berorientasi hasil (outcome) sesuai pada levelnya',
                uraian_buktidukung:
                  '(i) Dokumen SKP tahunan seluruh pegawai dari KipApp\r\n(ii) Dokumen penjelasan cascading indikator kinerja mulai dari Visi, misi, PK sampai IKI',
                kategoriPenilaian: [
                  {
                    id_kategori: 334,
                    uraian_kategori:
                      'a. Seluruh ukuran kinerja individu telah berorientasi hasil (outcome) sesuai pada levelnya;',
                    nilai: 1.5
                  },
                  {
                    id_kategori: 335,
                    uraian_kategori:
                      'b. Sebagian ukuran kinerja individu telah berorientasi hasil (outcome) sesuai pada levelnya;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 336,
                    uraian_kategori:
                      'c. Tidak ada ukuran kinerja individu yang berorientasi hasil (outcome).',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 33,
            nama_subpilar: 'Assessment Pegawai',
            pertanyaan: [
              {
                id_pertanyaan: 99,
                deskripsi_pertanyaan:
                  'Hasil assement telah dijadikan pertimbangan untuk mutasi dan pengembangan karir pegawai',
                uraian_buktidukung:
                  '(i) Dokumen hasil assessment atau hasil uji kompetensi pegawai\r\n(ii) Surat usulan terkait mutasi dan/atau pengembangan karir pegawai  yang  didasarkan  pada  hasil assessment/uji kompetensisment/uji kompetensi',
                kategoriPenilaian: [
                  {
                    id_kategori: 337,
                    uraian_kategori:
                      'a. Seluruh hasil assessment dijadikan dasar mutasi internal dan pengembangan kompetensi pegawai;',
                    nilai: 1.5
                  },
                  {
                    id_kategori: 338,
                    uraian_kategori:
                      'b. Hasil assessment belum seluruhnya dijadikan mutasi internal dan pengembangan kompetensi pegawai;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 339,
                    uraian_kategori:
                      'c. Hasil assessment belum dijadikan dasar mutasi internal dan pengembangan kompetensi pegawai.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 34,
            nama_subpilar: 'Pelanggaran Disiplin Pegawai',
            pertanyaan: [
              {
                id_pertanyaan: 100,
                deskripsi_pertanyaan:
                  'Penurunan pelanggaran disiplin pegawai Persentase penurunan pelanggaran disiplin pegawai diperoleh dari Jumlah pelanggaran tahun sebelumnya dikurangi Jumlah pelanggaran tahun ini kemudian dibagi dengan Jumlah pelanggaran tahun sebelumnya. i.Jumlah pelanggaran tahun sebelumnya ii.Jumlah pelanggaran tahun ini iii.Jumlah pelanggaran yang telah diberikan sanksi/hukuman',
                uraian_buktidukung:
                  '(i) Laporan penanganan pelanggaran disiplin (rekap)\r\n(ii) SK Hukuman Disiplin (jika ada)',
                kategoriPenilaian: [
                  {
                    id_kategori: 340,
                    uraian_kategori: 'a. persentase pelanggaran 100%',
                    nilai: 2
                  },
                  {
                    id_kategori: 341,
                    uraian_kategori: 'b. persentase pelanggaran 50%',
                    nilai: 1
                  },
                  {
                    id_kategori: 342,
                    uraian_kategori: 'c. Tidak ada pelanggaran',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 10,
        nama_pilar: 'Penguatan Akuntabilitas',
        subpilar: [
          {
            id_subpilar: 35,
            nama_subpilar: 'Meningkatnya capaian kinerja unit kerja',
            pertanyaan: [
              {
                id_pertanyaan: 101,
                deskripsi_pertanyaan:
                  'Persentase Sasaran dengan capaian 100% atau lebih Persentase diperoleh dari Jumlah Sasaran Kinerja yang tercapai 100% atau lebih dibagi dengan Jumlah Sasaran Kinerja. -Jumlah Sasaran Kinerja - Jumlah Sasaran Kinerja yang tercapai 100% atau lebih \t',
                uraian_buktidukung:
                  '(i) Dokumen      Laporan      Kinerja      2024      yang ditandatangani  oleh  pimpinan  (Jumlah  Sasaran Kinerja = 4)\r\n(ii) Dokumen  daftar  link  Laporan  Kinerja  2024  yang diupload di PPID',
                kategoriPenilaian: [
                  {
                    id_kategori: 343,
                    uraian_kategori: 'a. Persentase sasaran kerja 100%',
                    nilai: 2
                  },
                  {
                    id_kategori: 344,
                    uraian_kategori: 'b. Persentase sasaran kerja 50%',
                    nilai: 1
                  },
                  {
                    id_kategori: 345,
                    uraian_kategori: 'c. 0% Persentase sasaran kerja',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 36,
            nama_subpilar: 'Pemberian Reward and Punishment',
            pertanyaan: [
              {
                id_pertanyaan: 102,
                deskripsi_pertanyaan:
                  'Hasil Capaian/Monitoring Perjanjian Kinerja telah dijadikan dasar sebagai pemberian reward and punishment bagi organisasi',
                uraian_buktidukung:
                  '(i) Dokumen      Laporan      Kinerja      2024      yang ditandatangani  oleh  pimpinan\r\n(ii) Dokumen  daftar  link  Laporan  Kinerja  2024  yang diupload di PPID\r\n(iii) Narasi  tentang  reward  untuk  organisasi/satker yang menerima kinerja di atas target, baik dari pihak internal maupun eksternal BPS (disertakan\r\npiagam/sertifikatnya)',
                kategoriPenilaian: [
                  {
                    id_kategori: 349,
                    uraian_kategori:
                      'd. Capaian Kinerja (Perjanjian kinerja) belum menjadi unsur dalam pemberian reward and punishment.',
                    nilai: 0
                  },
                  {
                    id_kategori: 346,
                    uraian_kategori:
                      'a. Seluruh capaian kinerja (Perjanjian Kinerja) merupakan unsur dalam pemberian reward and punishment;',
                    nilai: 1.5
                  },
                  {
                    id_kategori: 347,
                    uraian_kategori:
                      'b. Sebagian besar Capaian Kinerja (lebih dari 50% Perjanjian kinerja) merupakan unsur dalam pemberian reward and punishment;',
                    nilai: 1
                  },
                  {
                    id_kategori: 348,
                    uraian_kategori:
                      'c. Sebagian kecil Capaian Kinerja (kurang dari 50% Perjanjian kinerja) merupakan unsur dalam pemberian reward and punishment;',
                    nilai: 0.5
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 37,
            nama_subpilar: 'Kerangka Logis Kinerja',
            pertanyaan: [
              {
                id_pertanyaan: 103,
                deskripsi_pertanyaan:
                  'Apakah terdapat penjenjangan kinerja (Kerangka Logis Kinerja) yang mengacu pada kinerja utama  organisasi dan dijadikan dalam penentuan kinerja seluruh pegawai? ',
                uraian_buktidukung:
                  '(i) Dokumen   PK   2024   yang   ditandatangani   oleh pimpinan\r\n(ii) Dokumen daftar link PK 2024 yang diupload di PPID\r\n(iii) Seluruh dokumen MPH dari aplikasi Kipapp  yang ditandatangani oleh pimpinan',
                kategoriPenilaian: [
                  {
                    id_kategori: 350,
                    uraian_kategori:
                      'a. Terdapat Kerangka Logis kinerja yang mengacu pada kinerja utama organisasi dan digunakan dalam penjabaran kinerja seluruh pegawai;',
                    nilai: 1.5
                  },
                  {
                    id_kategori: 351,
                    uraian_kategori:
                      'b. Terdapat Kerangka Logis kinerja yang mengacu pada kinerja utama organisasi namun belum digunakan dalam penjabaran kinerja seluruh pegawai;',
                    nilai: 1
                  },
                  {
                    id_kategori: 352,
                    uraian_kategori:
                      'c. Kerangka Logis kinerja ada namun belum mengacu pada kinerja utama organisasi dan belum digunakan dalam penjabaran kinerja seluruh pegawai;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 353,
                    uraian_kategori: 'd. Kerangka Logis kinerja belum ada.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 11,
        nama_pilar: 'Penguatan Pengawasan',
        subpilar: [
          {
            id_subpilar: 38,
            nama_subpilar: 'Mekanisme Pengendalian',
            pertanyaan: [
              {
                id_pertanyaan: 104,
                deskripsi_pertanyaan:
                  'Telah dilakukan mekanisme pengendalian aktivitas secara berjenjang',
                uraian_buktidukung:
                  '(i) Laporan mekanisme pengendalian aktivitas secara berjenjang yang memuat: perencanaan penilaian risiko, pelaksanaan, monitoring, pelaporan dan telah menghasilkan peningkatan kinerja, mekanisme kerja baru yang lebih efektif, efisien, dan terkendali',
                kategoriPenilaian: [
                  {
                    id_kategori: 354,
                    uraian_kategori:
                      'a. Terdapat pengendalian aktivitas utama organisasi yang tersistem mulai dari perencanaan, penilaian risiko, pelaksanaan, monitoring, dan pelaporan oleh penanggung jawab aktivitas serta pimpinan unit kerja dan telah menghasilkan peningkatan kinerja, mekanisme kerja baru yang lebih efektif, efisien, dan terkendali;',
                    nilai: 2.5
                  },
                  {
                    id_kategori: 355,
                    uraian_kategori:
                      'b. Terdapat pengendalian aktivitas utama organisasi yang tersistem mulai dari perencanaan, penilaian risiko, pelaksanaan, monitoring, dan pelaporan oleh penanggung jawab aktivitas serta pimpinan unit kerja namun belum berdampak pada peningkatan kinerja unit kerja;',
                    nilai: 1.875
                  },
                  {
                    id_kategori: 356,
                    uraian_kategori:
                      'c. Terdapat pengendalian aktivitas utama organisasi yang tersistem mulai dari perencanaan, penilaian risiko, pelaksanaan, monitoring, dan pelaporan oleh penanggung jawab aktivitas;',
                    nilai: 1.25
                  },
                  {
                    id_kategori: 357,
                    uraian_kategori:
                      'd. Terdapat pengendalian aktivitas utama organisasi tetapi tidak tersistem;',
                    nilai: 0.625
                  },
                  {
                    id_kategori: 358,
                    uraian_kategori:
                      'e. Tidak terdapat pengendalian atas aktivitas utama organisasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 39,
            nama_subpilar: 'Penanganan Pengaduan Masyarakat',
            pertanyaan: [
              {
                id_pertanyaan: 105,
                deskripsi_pertanyaan:
                  'Persentase penanganan pengaduan masyarakat Penilaian ini menghitung realisasi penanganan pengaduan masyarakat yang harus diselesaikan. - Jumlah pengaduan masyarakat yang harus ditindaklanjuti - Jumlah pengaduan masyarakat yang sedang diproses - Jumlah pengaduan masyarakat yang  selesai ditindaklanjuti',
                uraian_buktidukung: '(i) Laporan Pengelolaan Pengaduan',
                kategoriPenilaian: [
                  {
                    id_kategori: 359,
                    uraian_kategori: 'a. Realisasi penanganan pengaduan 100%',
                    nilai: 3
                  },
                  {
                    id_kategori: 360,
                    uraian_kategori: 'b. Realisasi penanganan pengaduan 50%',
                    nilai: 1.5
                  },
                  {
                    id_kategori: 361,
                    uraian_kategori: 'c. Realisasi penanganan pengaduan 0%',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 40,
            nama_subpilar: 'Penyampaian Laporan Harta Kekayaan',
            pertanyaan: [
              {
                id_pertanyaan: 107,
                deskripsi_pertanyaan:
                  'Persentase penyampaian Non LHKPN Jumlah yang harus melaporkan (tidak wajib LHKPN)-Pejabat administrator (eselon III) -Pejabat Pengawas (eselon IV) -Jumlah Fungsional dan Pelaksana -Jumlah yang sudah melaporkan\t',
                uraian_buktidukung:
                  '(i) Lampiran surat Inspektur  Utama perihal Proses\r\nPelaporan LHKAN Periode 2024\r\n(ii) Daftar pegawai yang wajib mengisi SPT (ASN yang tidak wajib LHKPN) dan dilegalisasi oleh kepala satuan/unit kerja\r\n(iii) Screenshot bukti penyampaian  SPT',
                kategoriPenilaian: [
                  {
                    id_kategori: 365,
                    uraian_kategori: 'a. Persentase penyampaian NONLHKPN 100%',
                    nilai: 1
                  },
                  {
                    id_kategori: 366,
                    uraian_kategori: 'b. Persentase penyampaian NONLHKPN 50%',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 367,
                    uraian_kategori: 'c. Persentase penyampaian NONLHKPN 0%',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 106,
                deskripsi_pertanyaan:
                  'Persentase penyampaian LHKPN Jumlah yang harus melaporkan i.Kepala satuan kerja ii.Pejabat yang diwajibkan menyampaikan LHKPN iii.Lainnya Jumlah yang sudah melaporkan\t',
                uraian_buktidukung:
                  '(i) Lampiran  surat  Inspektur  Utama  perihal  Proses\r\nPelaporan LHKAN Periode 2024\r\n(ii) Daftar pegawai yang wajib mengisi LHKPN (nama pegawai, jabatan)  satuan  kerja  yang  dilegalisasi oleh kepala satuan/unit kerja (Jumlah yang harus melaporkan LHKPN = KPA, Bendahara, PPK, Pejabat Pengadaan. Untuk BPS Provinsi, jumlah yang harus melaporkan LHKPN termasuk pegawai BPS Provinsi yang ditugaskan menjadi Pejabat Pengadaan pada BPS Kabupaten/Kota) \r\n(iii) Screenshot bukti penyampaian  LHKPN',
                kategoriPenilaian: [
                  {
                    id_kategori: 362,
                    uraian_kategori: 'a. Persentase penyampaian LHKPN 100%',
                    nilai: 1
                  },
                  {
                    id_kategori: 363,
                    uraian_kategori: 'b. Persentase penyampaian LHKPN 50%',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 364,
                    uraian_kategori: 'c. Persentase penyampaian LHKPN 0%',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 12,
        nama_pilar: 'Peningkatan Kualitas Pelayanan Publik',
        subpilar: [
          {
            id_subpilar: 41,
            nama_subpilar: 'Upaya dan/atau Inovasi Pelayanan Publik',
            pertanyaan: [
              {
                id_pertanyaan: 108,
                deskripsi_pertanyaan:
                  'Upaya dan/atau inovasi telah mendorong perbaikan pelayanan publik pada 1. Kesesuaian Persyaratan 2. Kemudahan Sistem, Mekanisme, dan Prosedur 3. Kecepatan Waktu Penyelesaian 4. Kejelasan Biaya/Tarif, Gratis 5. Kualitas Produk Spesifikasi Jenis Pelayanan 6. Kompetensi Pelaksana/Web 7. Perilaku Pelaksana/Web 8. Kualitas Sarana dan prasarana 9. Penanganan Pengaduan, Saran dan Masukan',
                uraian_buktidukung:
                  '(i) Narasi yang menggambarkan dampak dari inovasi yang ada di satuan/unit kerja terhadap perbaikan pelayanan publik yang prima',
                kategoriPenilaian: [
                  {
                    id_kategori: 368,
                    uraian_kategori:
                      'a. Upaya dan/atau inovasi yang dilakukan telah mendorong perbaikan seluruh pelayanan publik yang prima (lebih Cepat dan mudah);',
                    nilai: 1.25
                  },
                  {
                    id_kategori: 369,
                    uraian_kategori:
                      'b. Upaya dan/atau inovasi yang dilakukan belum seluruhnya memberikan dampak pada perbaikan pelayanan publik yang prima (Cepat dan mudah);',
                    nilai: 0.833333
                  },
                  {
                    id_kategori: 370,
                    uraian_kategori:
                      'c. Upaya dan/atau inovasi yang dilakukan belum sesuai kebutuhan;',
                    nilai: 0.416667
                  },
                  {
                    id_kategori: 371,
                    uraian_kategori:
                      'd. Belum ada inovasi.Persentase diperoleh dari Jumlah perizinan/pelayanan yang telah dipermudah dibagi dengan Jumlah perizinan/pelayanan yang terdata/terdaftar.',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 109,
                deskripsi_pertanyaan:
                  'Upaya dan/atau inovasi pada perijinan/pelayanan telah dipermudah: 1. Waktu lebih cepat 2. Pelayanan Publik yang terpadu 3. Alur lebih pendek/singkat 4 Terintegrasi dengan aplikasi -Jumlah perizinan/pelayanan yang terdata/terdaftar - Jumlah perizinan/pelayanan yang telah dipermudah         ',
                uraian_buktidukung:
                  '(i) Dokumen daftar jumlah perijinan/pelayanan yang\r\nterdata/terdaftar di satuan/unit kerja (sesuai Perka\r\nBPS Nomor 65 Tahun 2024)\r\n(ii) Dokumen  daftar  jumlah  perijinan/pelayanan  di satuan/unit kerja yang telah dipermudah',
                kategoriPenilaian: [
                  {
                    id_kategori: 372,
                    uraian_kategori:
                      'a. Jumlah perizinan dipermudah dan didata 100%',
                    nilai: 1.25
                  },
                  {
                    id_kategori: 373,
                    uraian_kategori:
                      'b. Jumlah perizinan dipermudah dan didata 50%',
                    nilai: 0.625
                  },
                  {
                    id_kategori: 374,
                    uraian_kategori:
                      'c. Jumlah perizinan dipermudah dan didata 0%',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 42,
            nama_subpilar: 'Penanganan Pengaduan Pelayanan dan Konsultasi',
            pertanyaan: [
              {
                id_pertanyaan: 110,
                deskripsi_pertanyaan:
                  'Penanganan pengaduan pelayanan dilakukan melalui berbagai kanal/media secara responsif dan bertanggung jawab',
                uraian_buktidukung:
                  '(i) Laporan  monitoring,  evaluasi,  dan  tindak  lanjut\r\npenanganan   pengaduan   dari   berbagai   media layanan\r\n(ii) Dokumentasi   Penanganan   Pengaduan   secara offline dan online (jika ada aduan maka tampilkan screen   shoot   dari   berbagai   media   layanan pengaduan, seperti sarana pengaduan offline, WA,\r\nmedia sosial, atau email pengaduan)',
                kategoriPenilaian: [
                  {
                    id_kategori: 375,
                    uraian_kategori:
                      'a. Pengaduan pelayanan dan konsultasi telah direspon dengan cepat melalui berbagai kanal/media;',
                    nilai: 2.5
                  },
                  {
                    id_kategori: 376,
                    uraian_kategori:
                      'b. Pengaduan pelayanan dan konsultasi telah direspon dengan cepat melalui kanal/media yang terbatas;',
                    nilai: 1.66667
                  },
                  {
                    id_kategori: 377,
                    uraian_kategori:
                      'c. Pengaduan pelayanan dan konsultasi direspon lambat melalui berbagai kanal/media;',
                    nilai: 0.833333
                  },
                  {
                    id_kategori: 378,
                    uraian_kategori:
                      'd. Pengaduan pelayanan dan konsultasi direspon lambat dan kanal/media terbatas.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id_pilar: 7,
        nama_pilar: 'Manajemen Perubahan',
        subpilar: [
          {
            id_subpilar: 26,
            nama_subpilar: 'Komitmen dalam perubahan',
            pertanyaan: [
              {
                id_pertanyaan: 89,
                deskripsi_pertanyaan:
                  'Perubahan yang dibuat Agen Perubahan telah terintegrasi dalam sistem manajemen i.Jumlah Perubahan yang dibuat ii.Jumlah Perubahan yang telah diintegrasikan dalam sistem manajemen\t',
                uraian_buktidukung:
                  '(i) Laporan Kegiatan Change Ambassador 2024 yang memuat dokumentasi  dan  narasi pelaksanaan proyek perubahan.',
                kategoriPenilaian: [
                  {
                    id_kategori: 297,
                    uraian_kategori:
                      'a. Jumlah perubahan diintegrasikan dengan sistem',
                    nilai: 1
                  },
                  {
                    id_kategori: 298,
                    uraian_kategori:
                      'a. Jumlah perubahan diintegrasikan dengan sistem 50%',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 299,
                    uraian_kategori: 'c. tidak ada integrasi',
                    nilai: 0
                  }
                ]
              },
              {
                id_pertanyaan: 88,
                deskripsi_pertanyaan:
                  'Agen perubahan telah membuat perubahan yang konkret di Instansi (dalam 1 tahun) Misalkan dengan kebijakan 1 Agen 1 Perubahan Persentase diperoleh dari Jumlah Perubahan yang dibuat dibagi dengan Jumlah Agen Perubahan. i.Jumlah Agen Perubahan ii.Jumlah Perubahan yang dibuat\t',
                uraian_buktidukung:
                  '(i) SK Agen Perubahan/Change Ambassador 2024\r\n(ii) Laporan Kegiatan Change Ambassador 2024',
                kategoriPenilaian: [
                  {
                    id_kategori: 294,
                    uraian_kategori: 'a. agen perubahan 1 agen 1 perubahan',
                    nilai: 1
                  },
                  {
                    id_kategori: 295,
                    uraian_kategori: 'b. agen perubahan > perubahan',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 296,
                    uraian_kategori: 'c. tidak ada perubahan',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 27,
            nama_subpilar: 'Komitmen Pimpinan',
            pertanyaan: [
              {
                id_pertanyaan: 90,
                deskripsi_pertanyaan:
                  'Pimpinan memiliki komitmen terhadap pelaksanaan reformasi birokrasi, dengan adanya target capaian reformasi yang jelas di dokumen perencanaan',
                uraian_buktidukung:
                  '(i) Dokumen rencana kerja dan realisasi capaian nya',
                kategoriPenilaian: [
                  {
                    id_kategori: 300,
                    uraian_kategori:
                      'a. Target capaian zona integritas sudah ada di dokumen perencanaan unit kerja dan sebagian besar (diatas 80%) sudah tercapai;',
                    nilai: 1
                  },
                  {
                    id_kategori: 301,
                    uraian_kategori:
                      'b. Target capaian zona integritas sudah ada di dokumen perencanaan unit kerja dan sebagian (diatas 50%) sudah tercapai;',
                    nilai: 0.75
                  },
                  {
                    id_kategori: 302,
                    uraian_kategori:
                      'c. Target capaian zona integritas sudah ada di dokumen perencanaan unit kerja dan sebagian kecil (dibawah 50%) sudah tercapai;',
                    nilai: 0.5
                  },
                  {
                    id_kategori: 303,
                    uraian_kategori:
                      'd. Target capaian zona integritas sudah ada di dokumen perencanaan unit kerja, namun belum ada yang tercapai (masih dalam tahap pembangunan);',
                    nilai: 0.25
                  },
                  {
                    id_kategori: 304,
                    uraian_kategori:
                      'e. Tidak ada target capaian zona integritas di dokumen perencanaan unit kerja.',
                    nilai: 0
                  }
                ]
              }
            ]
          },
          {
            id_subpilar: 28,
            nama_subpilar: 'Membangun Budaya Kerja',
            pertanyaan: [
              {
                id_pertanyaan: 91,
                deskripsi_pertanyaan:
                  'Instansi membangun budaya kerja positif dan menerapkan nilai-nilai organisasi dalam pelaksanaan tugas sehari-hari',
                uraian_buktidukung:
                  '(i) Undangan, daftar hadir, Notulen dan dokumentasi internalisasi\r\n(ii) SOP kegiatan yang menghasilkan budaya  kerja positif, misalkan: SOP Apel Pagi, SOP Sharing Knowledge, dll',
                kategoriPenilaian: [
                  {
                    id_kategori: 305,
                    uraian_kategori:
                      'a. Budaya kerja dan nilai-nilai organisasi telah diinternalisasi ke seluruh anggota organisasi, dan penerapannya dituangkan dalam standar operasional pelaksanaan kegiatan/tugas;',
                    nilai: 1
                  },
                  {
                    id_kategori: 306,
                    uraian_kategori:
                      'b. Budaya kerja dan nilai-nilai organisasi telah diinternalisasi ke seluruh anggota organisasi, namun belum dituangkan dalam standar operasional pelaksanaan kegiatan/tugas;',
                    nilai: 0.666667
                  },
                  {
                    id_kategori: 307,
                    uraian_kategori:
                      'c. Budaya kerja dan nilai-nilai organisasi telah disusun, namun belum diinternalisasi ke seluruh anggota organisasi;',
                    nilai: 0.333333
                  },
                  {
                    id_kategori: 308,
                    uraian_kategori:
                      'd. Belum menyusun budaya kerja dan nilai-nilai organisasi.',
                    nilai: 0
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const DEFAULT_PILAR_HASIL_DATA = [
  {
    id_pilarHasil: 1,
    nama_pilarHasil: 'Birokrasi yang bersih dan Akuntabel',
    created_at: '2025-08-21T13:17:54.077443+00:00',
    id_aspek: 2,
    skor_pilarHasil: 27.5,
    uraian_pilarHasil:
      '(i) Nilai Survei Persepsi Korupsi (Survei Eksternal)\t\t\r\n(ii) Capaian Kinerja Lebih Baik dari pada Capaian Kinerja Sebelumnya'
  },
  {
    id_pilarHasil: 2,
    nama_pilarHasil: 'Pelayanan publik yang prima',
    created_at: '2025-08-21T13:18:38.507738+00:00',
    id_aspek: 2,
    skor_pilarHasil: 17.5,
    uraian_pilarHasil: 'Nilai Persepsi Kualitas Pelayanan (Survei Eksternal)'
  }
];
