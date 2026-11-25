/**
 * Model & Tipe Data Notulen Rapat Digital Tim ZI/RB BPS Kabupaten Kepulauan Sitaro
 * Sesuai Standar Tata Naskah Dinas BPS RI
 */

export type StatusKesepakatan =
  | 'BELUM_DIKERJAKAN'
  | 'SEDANG_PROSES'
  | 'SELESAI';

export interface KesepakatanRapatItem {
  id: string;
  notulen_id?: string;
  poin_kesepakatan: string;
  pilar_id: string; // 'SEMUA' | '1' | '2' | '3' | '4' | '5' | '6'
  pic_user_id?: string;
  pic_name: string;
  pic_phone: string;
  tenggat_waktu: string; // YYYY-MM-DD
  status: StatusKesepakatan;
  kanban_card_id?: string;
  wa_sent: boolean;
  wa_sent_at?: string;
}

export interface NotulenRapat {
  id: string;
  judul_rapat: string;
  nomor_notula: string; // contoh: 'ND-05/BPS/7108/02/2026'
  tanggal: string; // YYYY-MM-DD
  waktu_mulai: string; // contoh: '09:00'
  waktu_selesai: string; // contoh: '12:00'
  tempat: string;
  agenda_id?: string;
  pilar_id: string; // 'SEMUA' | '1' | '2' | '3' | '4' | '5' | '6'
  pimpinan_rapat: string;
  notulis: string;
  peserta_hadir: string[];
  ringkasan_pembahasan: string;
  kesepakatan_items: KesepakatanRapatItem[];
  created_at: string;
  updated_at?: string;
}

export interface NotulenFilterParams {
  pilarId?: string;
  tahun?: number;
  search?: string;
}

export interface NotulenActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  waDeepLink?: string;
  stats?: {
    totalNotulen: number;
    totalKesepakatan: number;
    kesepakatanSelesai: number;
    ditugaskanKanban: number;
    waTerkirim: number;
  };
}

export const NOTULEN_PILAR_OPTIONS = [
  { value: 'SEMUA', label: 'Seluruh Pilar (Pleno ZI/RB)' },
  { value: '1', label: 'Pilar 1 - Manajemen Perubahan' },
  { value: '2', label: 'Pilar 2 - Penataan Tatalaksana' },
  { value: '3', label: 'Pilar 3 - Penataan Manajemen SDM' },
  { value: '4', label: 'Pilar 4 - Penguatan Akuntabilitas' },
  { value: '5', label: 'Pilar 5 - Penguatan Pengawasan' },
  { value: '6', label: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik' }
];

export const STATUS_KESEPAKATAN_CONFIG: Record<
  StatusKesepakatan,
  { label: string; badgeColor: string; bgClass: string; textClass: string }
> = {
  BELUM_DIKERJAKAN: {
    label: 'Belum Dikerjakan',
    badgeColor:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-200',
    bgClass: 'bg-slate-50 border-slate-200',
    textClass: 'text-slate-600'
  },
  SEDANG_PROSES: {
    label: 'Sedang Proses',
    badgeColor:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-600'
  },
  SELESAI: {
    label: 'Selesai',
    badgeColor:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-600'
  }
};

/**
 * Daftar Pegawai BPS Sitaro yang sering menjadi PIC kesepakatan notula rapat
 */
export const DAFTAR_PEGAWAI_SITARO = [
  {
    nama: 'Inke Margareth Tambeo, SST., M.Ec.Dev.',
    jabatan: 'Kepala BPS Kabupaten Kepulauan Sitaro',
    phone: '082190010000',
    pilarDefault: 'SEMUA'
  },
  {
    nama: 'Gloria Pangemanan, S.Tr.Stat.',
    jabatan: 'Pranata Komputer / Tim Inovasi IT',
    phone: '082190010008',
    pilarDefault: '2'
  },
  {
    nama: 'Marselus Tatengkeng, S.E.',
    jabatan: 'Koordinator Pilar 1 Manajemen Perubahan',
    phone: '082190010001',
    pilarDefault: '1'
  },
  {
    nama: 'Steven Luntungan, S.Si.',
    jabatan: 'Koordinator Pilar 2 Penataan Tatalaksana',
    phone: '082190010002',
    pilarDefault: '2'
  },
  {
    nama: 'Novita Derek, S.E.',
    jabatan: 'Koordinator Pilar 3 Penataan Sistem Manajemen SDM',
    phone: '082190010003',
    pilarDefault: '3'
  },
  {
    nama: 'Christian Makauntung, S.Tr.Stat.',
    jabatan: 'Koordinator Pilar 4 Penguatan Akuntabilitas',
    phone: '082190010004',
    pilarDefault: '4'
  },
  {
    nama: 'Feiby Salindeho, S.Stat.',
    jabatan: 'Koordinator Pilar 5 Penguatan Pengawasan',
    phone: '082190010005',
    pilarDefault: '5'
  },
  {
    nama: 'Anggreiny Kalalo, S.Si.',
    jabatan: 'Koordinator Pilar 6 Peningkatan Kualitas Pelayanan Publik',
    phone: '082190010006',
    pilarDefault: '6'
  },
  {
    nama: 'Hendra Manopo',
    jabatan: 'Staf Subbagian Umum / Tim Sarpras & IT',
    phone: '082190010007',
    pilarDefault: 'SEMUA'
  }
];

/**
 * Mock data realistis 4 notula rapat tim ZI BPS Sitaro 2026:
 * 1. Kick-off ZI & Penetapan Rencana Aksi
 * 2. Evaluasi SPIP, WBS & Pengawasan
 * 3. Monev Triwulan I & Tindak Lanjut Revisi LKE
 * 4. Persiapan Desk Evaluation & Simulasi Wawancara TPI
 */
export const DEFAULT_NOTULEN_LIST: NotulenRapat[] = [
  {
    id: 'notulen-2026-01-kickoff',
    judul_rapat:
      'Rapat Kick-Off Pembangunan Zona Integritas Menuju WBK Tahun 2026 & Penetapan Rencana Aksi',
    nomor_notula: 'ND-01/BPS/7108/01/2026',
    tanggal: '2026-01-15',
    waktu_mulai: '09:00',
    waktu_selesai: '12:00',
    tempat: 'Aula Sasahara BPS Sitaro (Lt. 2)',
    agenda_id: 'agenda-2026-01-kickoff',
    pilar_id: 'SEMUA',
    pimpinan_rapat:
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS Kabupaten Kepulauan Sitaro)',
    notulis: 'Gloria Pangemanan, S.Tr.Stat.',
    peserta_hadir: [
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS)',
      'Marselus Tatengkeng, S.E. (Pilar 1)',
      'Steven Luntungan, S.Si. (Pilar 2)',
      'Novita Derek, S.E. (Pilar 3)',
      'Christian Makauntung, S.Tr.Stat. (Pilar 4)',
      'Feiby Salindeho, S.Stat. (Pilar 5)',
      'Anggreiny Kalalo, S.Si. (Pilar 6)',
      'Gloria Pangemanan, S.Tr.Stat. (Notulis)',
      'Hendra Manopo (Subbagian Umum)'
    ],
    ringkasan_pembahasan: `Rapat dibuka pukul 09.00 WITA oleh Kepala BPS Kabupaten Kepulauan Sitaro, Inke Margareth Tambeo, SST., M.Ec.Dev. Dalam arahannya, beliau menegaskan komitmen seluruh jajaran untuk meraih predikat Wilayah Bebas dari Korupsi (WBK) pada evaluasi tahun 2026.

Poin-poin utama pembahasan:
1. Evaluasi catatan penilaian TPI tahun sebelumnya mengenai kelengkapan dokumen pendukung dan ketepatan waktu pengumpulan eviden.
2. Penegasan target nilai evaluasi mandiri ZI minimal 85.00 dengan predikat Baik/Sangat Baik di semua aspek pemenuhan dan reform.
3. Penetapan struktur Tim Kerja ZI 2026 melalui pembaruan Surat Keputusan (SK) Kepala BPS Sitaro.
4. Optimalisasi platform digital REBO V2 untuk sentralisasi eviden, eliminasi berkas ganda, dan pemantauan berkala via Kanban.
5. Rencana pelaksanaan survei kepuasan masyarakat (IKM) dan indeks persepsi anti korupsi (IPAK) secara mandiri setiap triwulan.`,
    kesepakatan_items: [
      {
        id: 'kesepakatan-01-01',
        notulen_id: 'notulen-2026-01-kickoff',
        poin_kesepakatan:
          'Penyusunan dan penetapan SK Tim Kerja Pembangunan ZI Menuju WBK BPS Sitaro Tahun 2026 beserta rincian tupoksi 6 pilar perubahan.',
        pilar_id: '1',
        pic_user_id: 'user-pilar-1',
        pic_name: 'Marselus Tatengkeng, S.E.',
        pic_phone: '082190010001',
        tenggat_waktu: '2026-01-22',
        status: 'SELESAI',
        kanban_card_id: 'KANBAN-TL-01',
        wa_sent: true,
        wa_sent_at: '2026-01-15T13:00:00Z'
      },
      {
        id: 'kesepakatan-01-02',
        notulen_id: 'notulen-2026-01-kickoff',
        poin_kesepakatan:
          'Finalisasi dokumen rencana kerja tahunan dan target pemenuhan eviden 6 pilar pada portal REBO V2.',
        pilar_id: '2',
        pic_user_id: 'user-pilar-2',
        pic_name: 'Steven Luntungan, S.Si.',
        pic_phone: '082190010002',
        tenggat_waktu: '2026-01-26',
        status: 'SELESAI',
        kanban_card_id: 'KANBAN-TL-02',
        wa_sent: true,
        wa_sent_at: '2026-01-15T13:00:00Z'
      },
      {
        id: 'kesepakatan-01-03',
        notulen_id: 'notulen-2026-01-kickoff',
        poin_kesepakatan:
          'Sosialisasi timeline pengumpulan berkas LKE kepada seluruh pegawai ASN dan PPNPN BPS Sitaro.',
        pilar_id: '3',
        pic_user_id: 'user-pilar-3',
        pic_name: 'Novita Derek, S.E.',
        pic_phone: '082190010003',
        tenggat_waktu: '2026-01-30',
        status: 'SELESAI',
        kanban_card_id: 'KANBAN-TL-03',
        wa_sent: true,
        wa_sent_at: '2026-01-15T13:00:00Z'
      }
    ],
    created_at: '2026-01-15T12:30:00Z'
  },
  {
    id: 'notulen-2026-02-pengawasan',
    judul_rapat:
      'Rapat Evaluasi Implementasi SPIP, Mitigasi Risiko & Penguatan Pengawasan Internal BPS Sitaro',
    nomor_notula: 'ND-03/BPS/7108/03/2026',
    tanggal: '2026-03-05',
    waktu_mulai: '09:00',
    waktu_selesai: '11:30',
    tempat: 'Aula Sasahara BPS Sitaro & Hybrid Zoom',
    agenda_id: 'agenda-2026-03-sosialisasi-etik-wbs',
    pilar_id: '5',
    pimpinan_rapat:
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS Kabupaten Kepulauan Sitaro)',
    notulis: 'Feiby Salindeho, S.Stat.',
    peserta_hadir: [
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS)',
      'Feiby Salindeho, S.Stat. (Koordinator Pilar 5)',
      'Marselus Tatengkeng, S.E.',
      'Steven Luntungan, S.Si.',
      'Gloria Pangemanan, S.Tr.Stat.',
      'Hendra Manopo (Subbagian Umum)'
    ],
    ringkasan_pembahasan: `Rapat fokus membahas penguatan pilar 5 (Penguatan Pengawasan) meliputi maturitas Sistem Pengendalian Intern Pemerintah (SPIP), implementasi Whistleblowing System (WBS), serta penanganan benturan kepentingan dan pengendalian gratifikasi di lingkungan BPS Sitaro.

Poin penting pembahasan:
1. Hasil review daftar risiko instansi tahun 2026: perlunya penambahan risiko terkait keterlambatan logistik survei lapangan antar-pulau di wilayah perbatasan kepulauan.
2. Penegasan bahwa seluruh laporan gratifikasi dalam bentuk apapun wajib diinput melalui Unit Pengendalian Gratifikasi (UPG) dalam kurun waktu 7 hari kerja.
3. Evaluasi pemanfaatan kanal WBS daring di portal REBO V2: memastikan identitas pelapor terlindungi secara terenkripsi.
4. Rencana pembuatan media sosialisasi fisik di area publik dan meja Pelayanan Statistik Terpadu (PST).`,
    kesepakatan_items: [
      {
        id: 'kesepakatan-02-01',
        notulen_id: 'notulen-2026-02-pengawasan',
        poin_kesepakatan:
          'Pemutakhiran Piagam Manajemen Risiko BPS Sitaro 2026 dan penetapan RTP (Rencana Tindak Pengendalian) untuk 6 pilar.',
        pilar_id: '5',
        pic_user_id: 'user-pilar-5',
        pic_name: 'Feiby Salindeho, S.Stat.',
        pic_phone: '082190010005',
        tenggat_waktu: '2026-03-15',
        status: 'SELESAI',
        kanban_card_id: 'KANBAN-TL-04',
        wa_sent: true,
        wa_sent_at: '2026-03-05T12:00:00Z'
      },
      {
        id: 'kesepakatan-02-02',
        notulen_id: 'notulen-2026-02-pengawasan',
        poin_kesepakatan:
          'Pemasangan banner dan standing banner Kanal WBS & Tolak Gratifikasi di Ruang Pelayanan Statistik Terpadu (PST) dan lobi kantor.',
        pilar_id: '5',
        pic_user_id: 'user-it-umum',
        pic_name: 'Hendra Manopo',
        pic_phone: '082190010007',
        tenggat_waktu: '2026-03-20',
        status: 'SEDANG_PROSES',
        kanban_card_id: 'KANBAN-TL-05',
        wa_sent: true,
        wa_sent_at: '2026-03-05T12:00:00Z'
      }
    ],
    created_at: '2026-03-05T12:00:00Z'
  },
  {
    id: 'notulen-2026-03-monev-tw1',
    judul_rapat:
      'Rapat Monitoring dan Evaluasi (Monev) Triwulan I Capaian Pembangunan ZI & Penyelesaian Revisi LKE',
    nomor_notula: 'ND-05/BPS/7108/04/2026',
    tanggal: '2026-04-10',
    waktu_mulai: '09:00',
    waktu_selesai: '12:30',
    tempat: 'Aula Sasahara BPS Sitaro',
    agenda_id: 'agenda-2026-04-monev-tw1',
    pilar_id: 'SEMUA',
    pimpinan_rapat:
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS Kabupaten Kepulauan Sitaro)',
    notulis: 'Gloria Pangemanan, S.Tr.Stat.',
    peserta_hadir: [
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS)',
      'Marselus Tatengkeng, S.E. (Pilar 1)',
      'Steven Luntungan, S.Si. (Pilar 2)',
      'Novita Derek, S.E. (Pilar 3)',
      'Christian Makauntung, S.Tr.Stat. (Pilar 4)',
      'Feiby Salindeho, S.Stat. (Pilar 5)',
      'Anggreiny Kalalo, S.Si. (Pilar 6)',
      'Tim Verifikator Internal ZI/RB'
    ],
    ringkasan_pembahasan: `Monev Triwulan I bertujuan mereviu progres pengumpulan eviden pada papan kendali Kanban REBO V2. Dari total indikator pemenuhan dan reform, tercatat 87% eviden telah terunggah dengan status review. Namun, masih terdapat 4 kartu catatan perbaikan dari verifikator internal yang memerlukan kelengkapan tambahan.

Hasil evaluasi per area:
- Pilar 1 & 2 telah menyelesaikan 95% dokumen pendukung termasuk notula sosialisasi dan SOP mikro.
- Pilar 3 & 4 perlu melengkapi laporan rekapitulasi jam pelatihan pegawai serta laporan monev capaian IKU Triwulan I.
- Pilar 6 telah meluncurkan inovasi layanan 'PESONA SITARO' dan perlu menambah dokumentasi testimoni pengguna layanan kepulauan.`,
    kesepakatan_items: [
      {
        id: 'kesepakatan-03-01',
        notulen_id: 'notulen-2026-03-monev-tw1',
        poin_kesepakatan:
          'Penyelesaian 100% catatan klarifikasi kartu revisi Kanban oleh Pilar 3 dan Pilar 4 sebelum batas waktu 18 April 2026.',
        pilar_id: '4',
        pic_user_id: 'user-pilar-4',
        pic_name: 'Christian Makauntung, S.Tr.Stat.',
        pic_phone: '082190010004',
        tenggat_waktu: '2026-04-18',
        status: 'SEDANG_PROSES',
        kanban_card_id: 'KANBAN-TL-06',
        wa_sent: true,
        wa_sent_at: '2026-04-10T13:30:00Z'
      },
      {
        id: 'kesepakatan-03-02',
        notulen_id: 'notulen-2026-03-monev-tw1',
        poin_kesepakatan:
          'Pelaksanaan verifikasi tahap II oleh Tim Penilai Internal (TPI) terhadap seluruh dokumen bukti dukung pada portal REBO V2.',
        pilar_id: 'SEMUA',
        pic_user_id: 'user-tpi',
        pic_name: 'Tim Verifikator Internal ZI/RB',
        pic_phone: '082190010000',
        tenggat_waktu: '2026-04-22',
        status: 'BELUM_DIKERJAKAN',
        kanban_card_id: undefined,
        wa_sent: false
      }
    ],
    created_at: '2026-04-10T13:00:00Z'
  },
  {
    id: 'notulen-2026-04-persiapan-tpi',
    judul_rapat:
      'Rapat Persiapan Desk Evaluation & Simulasi Wawancara Tim Penilai Internal (TPI) ZI BPS RI',
    nomor_notula: 'ND-08/BPS/7108/06/2026',
    tanggal: '2026-06-08',
    waktu_mulai: '13:30',
    waktu_selesai: '16:30',
    tempat: 'Aula Sasahara BPS Sitaro & Studio Multimedia',
    agenda_id: undefined,
    pilar_id: 'SEMUA',
    pimpinan_rapat:
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS Kabupaten Kepulauan Sitaro)',
    notulis: 'Gloria Pangemanan, S.Tr.Stat.',
    peserta_hadir: [
      'Inke Margareth Tambeo, SST., M.Ec.Dev. (Kepala BPS)',
      'Marselus Tatengkeng, S.E. (Pilar 1)',
      'Steven Luntungan, S.Si. (Pilar 2)',
      'Novita Derek, S.E. (Pilar 3)',
      'Christian Makauntung, S.Tr.Stat. (Pilar 4)',
      'Feiby Salindeho, S.Stat. (Pilar 5)',
      'Anggreiny Kalalo, S.Si. (Pilar 6)',
      'Gloria Pangemanan, S.Tr.Stat.',
      'Hendra Manopo'
    ],
    ringkasan_pembahasan: `Rapat koordinasi tingkat pimpinan ini diselenggarakan guna mematangkan persiapan teknis dan substansi menghadapi desk evaluation dan wawancara evaluasi Zona Integritas oleh Tim Penilai Internal (TPI) Inspektorat Wilayah BPS RI.

Agenda pembahasan:
1. Penyusunan dan penajaman materi tayang (slide presentasi) Kepala BPS Sitaro dengan durasi maksimal 15 menit.
2. Penegasan narasi sebelum dan sesudah (before-after) pembangunan Zona Integritas, terutama dampak efisiensi layanan bagi masyarakat di pulau Siau, Tagulandang, dan Biaro.
3. Simulasi pertanyaan pendalaman TPI untuk masing-masing koordinator 6 pilar.
4. Uji coba infrastruktur hybrid meeting, kecepatan internet cadangan, dan kesiapan audio visual ruang presentasi.`,
    kesepakatan_items: [
      {
        id: 'kesepakatan-04-01',
        notulen_id: 'notulen-2026-04-persiapan-tpi',
        poin_kesepakatan:
          'Finalisasi video profil pembangunan Zona Integritas BPS Sitaro berdurasi maksimal 7 menit yang menampilkan inovasi kepulauan.',
        pilar_id: '6',
        pic_user_id: 'user-pilar-6',
        pic_name: 'Anggreiny Kalalo, S.Si.',
        pic_phone: '082190010006',
        tenggat_waktu: '2026-06-15',
        status: 'BELUM_DIKERJAKAN',
        kanban_card_id: undefined,
        wa_sent: false
      },
      {
        id: 'kesepakatan-04-02',
        notulen_id: 'notulen-2026-04-persiapan-tpi',
        poin_kesepakatan:
          'Penyusunan Lembar Paparan Eksekutif Kepala BPS Sitaro berbasis data LKE REBO V2 dan visualisasi radar capaian.',
        pilar_id: '2',
        pic_user_id: 'user-pilar-2',
        pic_name: 'Steven Luntungan, S.Si.',
        pic_phone: '082190010002',
        tenggat_waktu: '2026-06-17',
        status: 'BELUM_DIKERJAKAN',
        kanban_card_id: undefined,
        wa_sent: false
      }
    ],
    created_at: '2026-06-08T17:00:00Z'
  }
];

/**
 * Helper untuk format pesan WhatsApp resmi penugasan butir kesepakatan rapat
 */
export function formatNotulenTaskWAMessage(params: {
  picName: string;
  judulRapat: string;
  nomorNotula: string;
  poinKesepakatan: string;
  pilarLabel: string;
  tenggatWaktu: string;
  status: string;
}): string {
  const formattedDeadline = params.tenggatWaktu
    ? new Date(params.tenggatWaktu).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-';

  return [
    `📢 *PENUGASAN TINDAK LANJUT KESEPAKATAN RAPAT ZI BPS SITARO*`,
    ``,
    `Halo Sdr/i *${params.picName}*,`,
    `Berdasarkan hasil rapat tim kerja ZI/RB BPS Kabupaten Kepulauan Sitaro, Anda ditugaskan untuk menindaklanjuti butir kesepakatan berikut:`,
    ``,
    `📋 *Agenda Rapat*: ${params.judulRapat}`,
    `📄 *Nomor Notula*: ${params.nomorNotula}`,
    `🏛 *Pilar / Area*: ${params.pilarLabel}`,
    `🎯 *Rincian Tugas*:`,
    `"${params.poinKesepakatan}"`,
    `⏳ *Tenggat Waktu*: ${formattedDeadline}`,
    `📌 *Status*: ${params.status}`,
    ``,
    `🔗 *Cek Papan Kanban & Update Bukti*:`,
    `https://rebo.sitarokab.bps.go.id/rebo/kanban`,
    ``,
    `_Pemberitahuan otomatis dibuat oleh Sistem REBO V2 (BPS Kabupaten Kepulauan Sitaro)._`
  ].join('\n');
}

/**
 * Format nomor notula otomatis sesuai standar tata naskah dinas BPS
 * Contoh: ND-01/BPS/7108/01/2026
 */
export function generateNomorNotula(
  urutan: number,
  tanggalStr?: string
): string {
  const d = tanggalStr ? new Date(tanggalStr) : new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tahun = d.getFullYear();
  const paddedUrutan = String(urutan).padStart(2, '0');
  return `ND-${paddedUrutan}/BPS/7108/${bulan}/${tahun}`;
}
