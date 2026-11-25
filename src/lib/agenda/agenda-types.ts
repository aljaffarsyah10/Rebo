/**
 * Tipe Data dan Konfigurasi Kalender Jadwal Aksi & Rencana Kerja Tim ZI/RB
 * REBO V2 - BPS Kabupaten Kepulauan Siau Tagulandang Biaro
 */

export type AgendaKategori =
  | 'RAPAT_KOORDINASI'
  | 'SOSIALISASI'
  | 'DEADLINE_BUKTI'
  | 'MONEV_BERKALA'
  | 'EVALUASI_TPI';

export type AgendaStatus = 'TERJADWAL' | 'BERLANGSUNG' | 'SELESAI' | 'DITUNDA';

export interface AgendaAksiZI {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string; // Format YYYY-MM-DD
  tanggal_selesai?: string; // Format YYYY-MM-DD (opsional jika multi-hari)
  waktu: string; // Contoh: "09:00 - 11:30 WITA"
  lokasi: string; // Contoh: "Aula Sasahara BPS Sitaro / Hybrid Zoom"
  kategori: AgendaKategori;
  pilar_id?: string; // 'SEMUA' | '1' | '2' | '3' | '4' | '5' | '6'
  peserta_target: string; // Contoh: "Seluruh Tim Kerja RB & Koordinator Pilar"
  status: AgendaStatus;
  link_meeting_or_drive?: string;
  reminder_wa_sent?: boolean;
  reminder_wa_sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaKategoriConfig {
  key: AgendaKategori;
  label: string;
  badgeClass: string;
  bgLight: string;
  borderColor: string;
  dotColor: string;
  description: string;
}

export const AGENDA_KATEGORI_MAP: Record<AgendaKategori, AgendaKategoriConfig> =
  {
    RAPAT_KOORDINASI: {
      key: 'RAPAT_KOORDINASI',
      label: 'Rapat Koordinasi',
      badgeClass:
        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-400',
      dotColor: 'bg-blue-600',
      description:
        'Pertemuan internal pilar dan koordinasi tim kerja pembangunan ZI'
    },
    SOSIALISASI: {
      key: 'SOSIALISASI',
      label: 'Sosialisasi Internal',
      badgeClass:
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
      borderColor: 'border-cyan-400',
      dotColor: 'bg-cyan-600',
      description:
        'Penyampaian kebijakan, kode etik, dan pelatihan pemahaman ZI/RB'
    },
    DEADLINE_BUKTI: {
      key: 'DEADLINE_BUKTI',
      label: 'Batas Waktu Bukti',
      badgeClass:
        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-400',
      dotColor: 'bg-rose-600',
      description: 'Batas akhir submit bukti dukung LKE ke sistem REBO & ZIAPP'
    },
    MONEV_BERKALA: {
      key: 'MONEV_BERKALA',
      label: 'Monev Berkala ZI',
      badgeClass:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-400',
      dotColor: 'bg-amber-600',
      description:
        'Monitoring & evaluasi progres tindak lanjut berkala triwulanan'
    },
    EVALUASI_TPI: {
      key: 'EVALUASI_TPI',
      label: 'Evaluasi TPI / TPN',
      badgeClass:
        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-400',
      dotColor: 'bg-purple-600',
      description:
        'Desk evaluation & wawancara penilaian Tim Penilai Internal/Nasional'
    }
  };

export const AGENDA_PILAR_OPTIONS = [
  { value: 'SEMUA', label: 'Seluruh Pilar (Lintas Area ZI)' },
  { value: '1', label: 'Pilar 1 - Manajemen Perubahan' },
  { value: '2', label: 'Pilar 2 - Penataan Tatalaksana' },
  { value: '3', label: 'Pilar 3 - Penataan Manajemen SDM' },
  { value: '4', label: 'Pilar 4 - Penguatan Akuntabilitas' },
  { value: '5', label: 'Pilar 5 - Penguatan Pengawasan' },
  { value: '6', label: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik' }
];

export const AGENDA_STATUS_MAP: Record<
  AgendaStatus,
  { label: string; badgeClass: string }
> = {
  TERJADWAL: {
    label: 'Terjadwal',
    badgeClass:
      'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800'
  },
  BERLANGSUNG: {
    label: 'Sedang Berlangsung',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 animate-pulse'
  },
  SELESAI: {
    label: 'Selesai',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  },
  DITUNDA: {
    label: 'Ditunda / Reschedule',
    badgeClass:
      'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800'
  }
};

/**
 * Mock Data Realistis Agenda ZI/RB BPS Kabupaten Kepulauan Sitaro Tahun Berjalan (2026)
 */
export const DEFAULT_AGENDA_LIST: AgendaAksiZI[] = [
  {
    id: 'agenda-2026-01-kickoff',
    judul:
      'Rapat Koordinasi Kick-Off Pembangunan ZI & Penetapan Rencana Kerja 2026',
    deskripsi:
      'Penetapan SK Tim Kerja Pembangunan ZI Menuju WBK Tahun 2026, bedah target IKU, serta sosialisasi timeline penilaian mandiri bersama Kepala BPS Sitaro.',
    tanggal_mulai: '2026-01-15',
    waktu: '09:00 - 12:00 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro (Lt. 2)',
    kategori: 'RAPAT_KOORDINASI',
    pilar_id: 'SEMUA',
    peserta_target: 'Seluruh Pegawai & Pimpinan BPS Kab. Kepl. Sitaro',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-01-14T08:30:00Z',
    created_at: '2026-01-05T08:00:00Z'
  },
  {
    id: 'agenda-2026-02-sosialisasi-spbe',
    judul:
      'Workshop Penataan Tatalaksana, Standar Operasional Prosedur (SOP) & SPBE',
    deskripsi:
      'Review dan integrasi SOP pelayanan kepulauan serta sosialisasi arsitektur SPBE dalam mendukung tata kelola BPS Sitaro yang bebas kertas (paperless).',
    tanggal_mulai: '2026-02-12',
    waktu: '13:30 - 16:00 WITA',
    lokasi: 'Ruang Rapat Integritas & Zoom Online',
    kategori: 'SOSIALISASI',
    pilar_id: '2',
    peserta_target: 'Tim Kerja Pilar 2 (Tatalaksana) & Pengelola TI IPDS',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-02-11T09:00:00Z',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'agenda-2026-03-sosialisasi-etik-wbs',
    judul:
      'Sosialisasi Kode Etik ASN, Pengendalian Gratifikasi & Kanal WBS Mandiri',
    deskripsi:
      'Internalisasi nilai BerAKHLAK, penguatan whistleblowing system (WBS), serta penandatanganan pakta integritas bebas korupsi bersama seluruh mitra statistik Sitaro.',
    tanggal_mulai: '2026-03-05',
    waktu: '09:00 - 11:30 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro & Hybrid Zoom',
    kategori: 'SOSIALISASI',
    pilar_id: '5',
    peserta_target: 'Seluruh ASN, PPNPN, dan Koordinator Pilar 5 Pengawasan',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-03-04T08:15:00Z',
    created_at: '2026-02-15T08:00:00Z'
  },
  {
    id: 'agenda-2026-03-deadline-tw1',
    judul:
      'Batas Akhir (Deadline) Submit Bukti Dukung LKE Triwulan I Seluruh Pilar',
    deskripsi:
      'Cutoff pengunggahan seluruh dokumen bukti dukung LKE Pemenuhan dan Reform Triwulan I ke sistem REBO sebelum reviu oleh Verifikator Internal.',
    tanggal_mulai: '2026-03-27',
    waktu: '23:59 WITA (Sistem Auto-Lock)',
    lokasi: 'Portal REBO V2 Online',
    kategori: 'DEADLINE_BUKTI',
    pilar_id: 'SEMUA',
    peserta_target: 'Operator dan PIC Pilar 1 s.d. Pilar 6',
    status: 'SELESAI',
    link_meeting_or_drive: 'https://rebo.sitarokab.bps.go.id/rebo/formRB',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-03-26T07:45:00Z',
    created_at: '2026-02-28T08:00:00Z'
  },
  {
    id: 'agenda-2026-04-monev-tw1',
    judul:
      'Rapat Evaluasi & Monev Triwulan I Capaian Pembangunan ZI BPS Sitaro',
    deskripsi:
      'Pemaparan hasil verifikasi bukti Triwulan I, evaluasi catatan perbaikan LKE, serta tindak lanjut kartu Kanban revisi bukti dukung.',
    tanggal_mulai: '2026-04-10',
    waktu: '09:00 - 12:30 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro',
    kategori: 'MONEV_BERKALA',
    pilar_id: 'SEMUA',
    peserta_target: 'Koordinator 6 Pilar, Tim Verifikator, dan Kepala BPS',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-04-09T08:00:00Z',
    created_at: '2026-03-20T08:00:00Z'
  },
  {
    id: 'agenda-2026-05-review-sakip-kinerja',
    judul:
      'Review Penguatan Akuntabilitas (SAKIP) & Penyelarasan Kinerja Pegawai',
    deskripsi:
      'Penyusunan Cascading IKU, monitoring pengukuran capaian target perjanjian kinerja, serta pemutakhiran papan kendali monev pimpinan.',
    tanggal_mulai: '2026-05-18',
    waktu: '10:00 - 12:00 WITA',
    lokasi: 'Ruang Rapat Integritas',
    kategori: 'RAPAT_KOORDINASI',
    pilar_id: '4',
    peserta_target: 'Tim Kerja Pilar 4 Akuntabilitas & Subbagian Umum',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-05-17T09:30:00Z',
    created_at: '2026-05-01T08:00:00Z'
  },
  {
    id: 'agenda-2026-06-workshop-layanan-pst',
    judul:
      'Uji Coba Layanan PST Si-Datu & Sosialisasi Survei IKM/IPAK Triwulan II',
    deskripsi:
      'Pengujian alur layanan konsultasi statistik online bagi pemohon antar-pulau Tagulandang dan Biaro serta pemantauan survei kepuasan konsumen.',
    tanggal_mulai: '2026-06-15',
    waktu: '09:00 - 11:30 WITA',
    lokasi: 'Front Office Pelayanan Statistik Terpadu (PST)',
    kategori: 'SOSIALISASI',
    pilar_id: '6',
    peserta_target: 'Petugas Front Office PST, Tim Inovasi, & Tim Pilar 6',
    status: 'SELESAI',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: true,
    reminder_wa_sent_at: '2026-06-14T08:00:00Z',
    created_at: '2026-06-01T08:00:00Z'
  },
  {
    id: 'agenda-2026-06-deadline-tw2',
    judul:
      'Batas Akhir (Deadline) Submit Bukti Dukung LKE Semester I & Triwulan II',
    deskripsi:
      'Batas akhir finalisasi seluruh bukti dukung semester pertama sebelum evaluasi internal oleh Tim Penilai Internal (TPI) BPS RI.',
    tanggal_mulai: '2026-06-30',
    waktu: '23:59 WITA',
    lokasi: 'Portal REBO V2 Online',
    kategori: 'DEADLINE_BUKTI',
    pilar_id: 'SEMUA',
    peserta_target: 'Seluruh PIC dan Operator 6 Pilar ZI BPS Sitaro',
    status: 'TERJADWAL',
    link_meeting_or_drive: 'https://rebo.sitarokab.bps.go.id/rebo/formRB',
    reminder_wa_sent: false,
    created_at: '2026-06-05T08:00:00Z'
  },
  {
    id: 'agenda-2026-07-pembekalan-tpi',
    judul:
      'Pembekalan & Uji Petik Kesiapan Desk Evaluation Tim Penilai Internal (TPI)',
    deskripsi:
      'Simulasi penilaian dokumen dan verifikasi kesesuaian dokumen bukti dukung bersama perwakilan Inspektorat Wilayah / TPI BPS RI melalui Zoom.',
    tanggal_mulai: '2026-07-16',
    tanggal_selesai: '2026-07-17',
    waktu: '08:30 - 15:30 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro & Zoom Meeting',
    kategori: 'EVALUASI_TPI',
    pilar_id: 'SEMUA',
    peserta_target:
      'Kepala BPS Sitaro, Seluruh Koordinator 6 Pilar, dan Tim Verifikator',
    status: 'TERJADWAL',
    link_meeting_or_drive: 'https://meet.google.com/abc-defg-hij',
    reminder_wa_sent: false,
    created_at: '2026-06-10T08:00:00Z'
  },
  {
    id: 'agenda-2026-08-monev-tpi-tl',
    judul: 'Rapat Tindak Lanjut Hasil Catatan Reviu Desk Evaluation TPI',
    deskripsi:
      'Penyusunan matriks tindak lanjut perbaikan berkas bukti dukung yang disarankan oleh TPI sebelum pengajuan usulan WBK ke KemenPAN-RB.',
    tanggal_mulai: '2026-08-04',
    waktu: '09:00 - 12:00 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro',
    kategori: 'MONEV_BERKALA',
    pilar_id: 'SEMUA',
    peserta_target: 'Koordinator Pilar 1 s.d. 6 dan Admin REBO',
    status: 'TERJADWAL',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: false,
    created_at: '2026-06-15T08:00:00Z'
  },
  {
    id: 'agenda-2026-09-simulasi-tpn',
    judul:
      'Simulasi Wawancara Desk Evaluation Tim Penilai Nasional (TPN KemenPAN-RB)',
    deskripsi:
      'Gladi bersih paparan presentasi Kepala BPS Sitaro, demo inovasi unggulan PST Si-Datu, dan sesi tanya jawab kesiapan 6 pilar.',
    tanggal_mulai: '2026-09-10',
    waktu: '09:00 - 14:00 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro (Big Screen Display)',
    kategori: 'EVALUASI_TPI',
    pilar_id: 'SEMUA',
    peserta_target:
      'Seluruh Pejabat, Koordinator Pilar, dan Tim Inovasi Pelayanan',
    status: 'TERJADWAL',
    link_meeting_or_drive:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    reminder_wa_sent: false,
    created_at: '2026-06-20T08:00:00Z'
  }
];

/**
 * Format teks pesan notifikasi WhatsApp Pengingat Agenda H-1 / Instan
 */
export function formatAgendaWAReminder(agenda: AgendaAksiZI): string {
  const kategoriInfo = AGENDA_KATEGORI_MAP[agenda.kategori];
  const pilarOption = AGENDA_PILAR_OPTIONS.find(
    (p) => p.value === agenda.pilar_id
  );
  const pilarText = pilarOption
    ? pilarOption.label
    : 'Seluruh Tim Kerja Pembangunan ZI';

  // Format tanggal ke Bahasa Indonesia (contoh: Senin, 15 Januari 2026)
  let tanggalDisplay = agenda.tanggal_mulai;
  try {
    const d = new Date(agenda.tanggal_mulai + 'T00:00:00');
    tanggalDisplay = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (
      agenda.tanggal_selesai &&
      agenda.tanggal_selesai !== agenda.tanggal_mulai
    ) {
      const dEnd = new Date(agenda.tanggal_selesai + 'T00:00:00');
      tanggalDisplay += ` s.d. ${dEnd.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`;
    }
  } catch {
    tanggalDisplay = agenda.tanggal_mulai;
  }

  const appUrl = process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const meetingLink = agenda.link_meeting_or_drive
    ? agenda.link_meeting_or_drive
    : `${appUrl}/rebo/agenda`;

  return `🔔 *[REBO V2 - PENGINGAT AGENDA ZI/RB BPS SITARO]*

Halo Rekan Tim Kerja Pembangunan ZI/RB,

Mengingatkan kembali agenda kegiatan reformasi birokrasi yang akan datang:

📌 *Agenda:* ${agenda.judul}
🏷️ *Kategori:* ${kategoriInfo.label}
🏛️ *Pilar Terkait:* ${pilarText}
📅 *Hari/Tanggal:* ${tanggalDisplay}
⏰ *Waktu:* ${agenda.waktu}
📍 *Tempat/Lokasi:* ${agenda.lokasi}
👥 *Sasaran Peserta:* ${agenda.peserta_target}

📝 *Deskripsi / Instruksi:*
"${agenda.deskripsi}"

🔗 *Tautan Dokumen / Ruang Virtual:*
${meetingLink}

_Dimohon hadir tepat waktu serta mempersiapkan berkas bukti dukung yang relevan. Terima kasih atas integritas dan dedikasi rekan-rekan demi terwujudnya WBK di BPS Kepulauan Sitaro._

*Sistem REBO V2 - BPS Kabupaten Kepulauan Siau Tagulandang Biaro*`;
}
