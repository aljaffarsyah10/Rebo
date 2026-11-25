/**
 * Model & Tipe Data Broadcast Pengumuman Internal Satu-Arah
 * BPS Kabupaten Kepulauan Sitaro - Platform REBO V2
 */

export type BroadcastTipe =
  | 'PENTING_URGENT'
  | 'ARAHAN_PIMPINAN'
  | 'DEADLINE_CUTOFF'
  | 'INFORMASI_UMUM';

export type BroadcastTargetAudiens =
  | 'SEMUA_TIM'
  | 'KOORDINATOR_PILAR'
  | 'VERIFIKATOR'
  | 'PILAR_TERTENTU';

export type BroadcastWAStatus =
  | 'BELUM_DIKIRIM'
  | 'SEBAGIAN_TERKIRIM'
  | 'SUKSES_SEMUA'
  | 'GAGAL';

export interface PengumumanBroadcast {
  id: string;
  judul: string;
  isi_pesan: string;
  tipe: BroadcastTipe;
  target_audiens: BroadcastTargetAudiens;
  target_pilar_id?: string | null; // '1' | '2' | '3' | '4' | '5' | '6' jika target_audiens === 'PILAR_TERTENTU'
  pengirim_nama: string;
  pengirim_jabatan: string;
  berlaku_sampai: string; // YYYY-MM-DD
  is_active_banner: boolean;
  wa_broadcast_status: BroadcastWAStatus;
  wa_sent_count: number;
  total_target_count: number;
  created_at: string;
  updated_at?: string;
}

export interface BroadcastFilterParams {
  tipe?: string;
  target?: string;
  search?: string;
  activeOnly?: boolean;
}

export interface BroadcastActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  waDeepLink?: string;
  stats?: {
    totalBroadcast: number;
    activeBannerCount: number;
    totalWaSent: number;
    totalTargetAudience: number;
  };
}

export const BROADCAST_TIPE_CONFIG: Record<
  BroadcastTipe,
  {
    label: string;
    badgeClass: string;
    bannerBgClass: string;
    bannerBorderClass: string;
    bannerTextClass: string;
    iconName: 'alert' | 'megaphone' | 'clock' | 'info';
  }
> = {
  PENTING_URGENT: {
    label: 'Penting & Mendesak',
    badgeClass:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800',
    bannerBgClass:
      'bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-slate-900/40',
    bannerBorderClass: 'border-red-300 dark:border-red-800/80',
    bannerTextClass: 'text-red-900 dark:text-red-200',
    iconName: 'alert'
  },
  ARAHAN_PIMPINAN: {
    label: 'Arahan Pimpinan',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800',
    bannerBgClass:
      'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900/40',
    bannerBorderClass: 'border-blue-300 dark:border-blue-800/80',
    bannerTextClass: 'text-blue-900 dark:text-blue-200',
    iconName: 'megaphone'
  },
  DEADLINE_CUTOFF: {
    label: 'Batas Waktu (Cut-Off)',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    bannerBgClass:
      'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900/40',
    bannerBorderClass: 'border-amber-300 dark:border-amber-800/80',
    bannerTextClass: 'text-amber-900 dark:text-amber-200',
    iconName: 'clock'
  },
  INFORMASI_UMUM: {
    label: 'Informasi Umum',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    bannerBgClass:
      'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/40',
    bannerBorderClass: 'border-emerald-300 dark:border-emerald-800/80',
    bannerTextClass: 'text-emerald-900 dark:text-emerald-200',
    iconName: 'info'
  }
};

export const TARGET_AUDIENS_OPTIONS: Array<{
  value: BroadcastTargetAudiens;
  label: string;
  description: string;
}> = [
  {
    value: 'SEMUA_TIM',
    label: 'Seluruh Pegawai & Tim Kerja ZI',
    description:
      'Menjangkau seluruh koordinator pilar, anggota tim, dan verifikator BPS Sitaro.'
  },
  {
    value: 'KOORDINATOR_PILAR',
    label: 'Khusus Koordinator 6 Pilar',
    description:
      'Ditujukan untuk 6 PIC utama penanggung jawab pilar pemenuhan dan reform.'
  },
  {
    value: 'VERIFIKATOR',
    label: 'Tim Verifikator & TPI Internal',
    description:
      'Ditujukan untuk tim penilai dan penelaah dokumen bukti dukung.'
  },
  {
    value: 'PILAR_TERTENTU',
    label: 'Pilar Tertentu Saja',
    description:
      'Hanya dikirimkan ke anggota & koordinator satu pilar yang dipilih.'
  }
];

export const PILAR_BROADCAST_OPTIONS = [
  { value: '1', label: 'Pilar 1 - Manajemen Perubahan' },
  { value: '2', label: 'Pilar 2 - Penataan Tatalaksana' },
  { value: '3', label: 'Pilar 3 - Penataan Manajemen SDM' },
  { value: '4', label: 'Pilar 4 - Penguatan Akuntabilitas' },
  { value: '5', label: 'Pilar 5 - Penguatan Pengawasan' },
  { value: '6', label: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik' }
];

/**
 * Format pesan WhatsApp broadcast resmi berkop BPS Kabupaten Kepulauan Sitaro
 */
export function formatBroadcastWAMessage(
  broadcast: PengumumanBroadcast,
  recipientName?: string,
  appUrl?: string
): string {
  const tipeMeta = BROADCAST_TIPE_CONFIG[broadcast.tipe] || {
    label: broadcast.tipe
  };
  const baseUrl =
    appUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://rebo-sitaro.bps.go.id';

  const penerimaText = recipientName
    ? recipientName
    : broadcast.target_audiens === 'KOORDINATOR_PILAR'
      ? 'Koordinator 6 Pilar ZI/RB'
      : broadcast.target_audiens === 'VERIFIKATOR'
        ? 'Tim Verifikator TPI Internal'
        : 'Seluruh Pegawai & Tim Kerja ZI/RB BPS Sitaro';

  const formattedTglBerlaku = new Date(
    broadcast.berlaku_sampai
  ).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `📢 *PENGUMUMAN RESMI BPS KABUPATEN KEPULAUAN SITARO*
*SISTEM REBO (REFORMASI BIROKRASI ONLINE) V2*
────────────────────────────
*Perihal:* [${tipeMeta.label.toUpperCase()}] ${broadcast.judul}
*Kepada Yth:* ${penerimaText}
*Pengirim:* ${broadcast.pengirim_nama} (${broadcast.pengirim_jabatan})
*Masa Berlaku:* s.d. ${formattedTglBerlaku}
────────────────────────────

${broadcast.isi_pesan}

────────────────────────────
📌 *Aksi & Tindak Lanjut:*
Mohon seluruh koordinator & tim terkait segera menindaklanjuti arahan ini.
Akses portal Beranda REBO:
🔗 ${baseUrl}/rebo/overview

_Pesan ini disiarkan secara resmi melalui Layanan Notifikasi Terpadu REBO V2 BPS Sitaro._`;
}

/**
 * 3 Mock Data Realistis Pengumuman Pimpinan BPS Sitaro
 */
export const DEFAULT_BROADCAST_LIST: PengumumanBroadcast[] = [
  {
    id: 'bc-001',
    judul: 'Arahan Kepala BPS Sitaro Menjelang Desk Evaluation TPI BPS RI',
    isi_pesan:
      'Kepada seluruh Koordinator 6 Pilar dan Tim Verifikator:\n' +
      '1. Pastikan seluruh 5 dokumen wajib (SK/Undangan, Notulen, Daftar Hadir, Foto Kegiatan, Laporan Hasil) telah lengkap dan tersinkronisasi di Google Drive.\n' +
      '2. Uji kembali tautan Drive agar berstatus "Anyone with the link can view" tanpa hambatan izin akses.\n' +
      '3. Koordinator pilar diharapkan menghadiri simulasi pemaparan LKE pada hari Kamis di Ruang Rapat Pimpinan.',
    tipe: 'ARAHAN_PIMPINAN',
    target_audiens: 'SEMUA_TIM',
    target_pilar_id: null,
    pengirim_nama: 'Ir. Jacky S. Pangkerego, M.Si',
    pengirim_jabatan: 'Kepala BPS Kabupaten Kepulauan Sitaro',
    berlaku_sampai: '2026-06-30',
    is_active_banner: true,
    wa_broadcast_status: 'SUKSES_SEMUA',
    wa_sent_count: 8,
    total_target_count: 8,
    created_at: '2026-02-15T08:30:00Z',
    updated_at: '2026-02-15T08:35:00Z'
  },
  {
    id: 'bc-002',
    judul: 'Peringatan Cutoff Pengunggahan Bukti Dukung Triwulan I',
    isi_pesan:
      'Diberitahukan kepada seluruh PIC 6 Pilar ZI:\n' +
      'Batas akhir (cutoff) pengunggahan dan perbaikan dokumen bukti dukung Triwulan I ditetapkan pada tanggal 31 Maret pukul 23:59 WITA.\n' +
      'Setelah waktu cutoff, sistem REBO akan membekukan penambahan berkas baru untuk pelaksanaan Reviu Berjenjang oleh Tim Verifikator Internal. Harap selesaikan seluruh kartu Kanban yang masih berstatus Dalam Proses.',
    tipe: 'DEADLINE_CUTOFF',
    target_audiens: 'KOORDINATOR_PILAR',
    target_pilar_id: null,
    pengirim_nama: 'Ketua Tim Pembangunan ZI',
    pengirim_jabatan: 'Koordinator Tim ZI/RB BPS Sitaro',
    berlaku_sampai: '2026-03-31',
    is_active_banner: false,
    wa_broadcast_status: 'SUKSES_SEMUA',
    wa_sent_count: 6,
    total_target_count: 6,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:05:00Z'
  },
  {
    id: 'bc-003',
    judul: 'Maklumat Kepatuhan Antigratifikasi & Penguatan Saluran WBS',
    isi_pesan:
      'Menegaskan kembali komitmen BPS Kabupaten Kepulauan Sitaro menuju Wilayah Bebas dari Korupsi (WBK):\n' +
      '1. Seluruh pegawai, PPNPN, dan mitra statistik dilarang keras menerima pemberian atau gratifikasi dalam bentuk apa pun terkait layanan publik di Pelayanan Statistik Terpadu (PST) maupun penugasan lapangan.\n' +
      '2. Apabila menemukan atau mengalami indikasi pelanggaran kode etik/gratifikasi, segera laporkan melalui Whistleblowing System (WBS) REBO yang dijamin kerahasiaannya.',
    tipe: 'PENTING_URGENT',
    target_audiens: 'SEMUA_TIM',
    target_pilar_id: null,
    pengirim_nama: 'Koordinator Tim Pengawasan',
    pengirim_jabatan: 'Inspektur Kepatuhan Internal (Pilar 5)',
    berlaku_sampai: '2026-12-31',
    is_active_banner: false,
    wa_broadcast_status: 'SUKSES_SEMUA',
    wa_sent_count: 8,
    total_target_count: 8,
    created_at: '2026-01-20T09:15:00Z',
    updated_at: '2026-01-20T09:20:00Z'
  }
];
