/**
 * Tipe Data, Konstanta, dan Utilitas Whistleblowing System (WBS)
 * Badan Pusat Statistik (BPS) Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)
 *
 * Mendukung pemenuhan bukti dukung ZI Pilar 5 (Penguatan Pengawasan)
 * Berdasarkan PermenPAN-RB & Sistem Pengendalian Intern Pemerintah (SPIP)
 */

export type KategoriWBS =
  | 'GRATIFIKASI_PUNGLI'
  | 'PELANGGARAN_KODE_ETIK'
  | 'BENTURAN_KEPENTINGAN'
  | 'PENYALAHGUNAAN_WEWENANG'
  | 'DISKOMUNIKASI_PELAYANAN';

export type StatusWBS =
  | 'DITERIMA'
  | 'VERIFIKASI_AWAL'
  | 'INVESTIGASI'
  | 'SELESAI'
  | 'DITOLAK';

export interface LaporanPengaduanWBS {
  id: string;
  ticket_code: string; // Contoh: 'WBS-2026-7841'
  tanggal_lapor: string;
  kategori: KategoriWBS;
  subjek: string;
  rincian_kejadian: string;
  lokasi_kejadian: string;
  perkiraan_tanggal_kejadian: string;
  terlapor_nama_or_unit: string;
  is_anonim: boolean;
  pelapor_nama?: string;
  pelapor_kontak?: string;
  lampiran_bukti_url?: string;
  status: StatusWBS;
  catatan_tim_kepatuhan?: string;
  tindak_lanjut?: string;
  notifikasi_tim_sent: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateWBSInput {
  kategori: KategoriWBS;
  subjek: string;
  rincian_kejadian: string;
  lokasi_kejadian: string;
  perkiraan_tanggal_kejadian: string;
  terlapor_nama_or_unit: string;
  is_anonim: boolean;
  pelapor_nama?: string;
  pelapor_kontak?: string;
  lampiran_bukti_url?: string;
}

export interface WBSStats {
  total: number;
  diterima: number;
  verifikasiAwal: number;
  investigasi: number;
  selesai: number;
  ditolak: number;
  anonimCount: number;
  nonAnonimCount: number;
}

export interface WBSFilterOptions {
  kategori?: string;
  status?: string;
  search?: string;
}

// ==============================================================================
// METADATA KATEGORI PENGADUAN
// ==============================================================================

export const KATEGORI_WBS_METADATA: Record<
  KategoriWBS,
  { label: string; deskripsi: string; color: string; badgeClass: string }
> = {
  GRATIFIKASI_PUNGLI: {
    label: 'Gratifikasi & Pungli',
    deskripsi:
      'Permintaan atau penerimaan uang, hadiah, fasilitas, atau pungutan liar di luar ketentuan resmi.',
    color: 'rose',
    badgeClass:
      'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
  },
  PELANGGARAN_KODE_ETIK: {
    label: 'Pelanggaran Kode Etik ASN',
    deskripsi:
      'Perilaku tidak pantas, tindakan diskriminatif, indisipliner, atau mencemarkan kehormatan korps BPS.',
    color: 'amber',
    badgeClass:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
  },
  BENTURAN_KEPENTINGAN: {
    label: 'Benturan Kepentingan',
    deskripsi:
      'Situasi di mana keputusan kedinasan dipengaruhi oleh relasi pribadi, keluarga, atau bisnis pihak ketiga.',
    color: 'purple',
    badgeClass:
      'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300'
  },
  PENYALAHGUNAAN_WEWENANG: {
    label: 'Penyalahgunaan Wewenang',
    deskripsi:
      'Tindakan melampaui mandat kedinasan, penyalahgunaan BMN/anggaran, atau pemanfaatan jabatan untuk kepentingan sepihak.',
    color: 'indigo',
    badgeClass:
      'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
  },
  DISKOMUNIKASI_PELAYANAN: {
    label: 'Diskomunikasi & Maladministrasi Layanan',
    deskripsi:
      'Pelayanan statistik terpadu (PST) yang berlarut-larut, penolakan layanan tanpa alasan sah, atau kelalaian SOP.',
    color: 'sky',
    badgeClass:
      'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
  }
};

// ==============================================================================
// METADATA STATUS PENGADUAN
// ==============================================================================

export const STATUS_WBS_METADATA: Record<
  StatusWBS,
  {
    stepIndex: number;
    label: string;
    keterangan: string;
    badgeClass: string;
  }
> = {
  DITERIMA: {
    stepIndex: 1,
    label: 'Laporan Diterima',
    keterangan:
      'Laporan berhasil tercatat dalam sistem terenkripsi dan nomor tiket telah diterbitkan.',
    badgeClass:
      'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
  },
  VERIFIKASI_AWAL: {
    stepIndex: 2,
    label: 'Verifikasi Awal',
    keterangan:
      'Tim Kepatuhan Internal menelaah kelengkapan kronologi dan relevansi bukti dukung yang dilampirkan.',
    badgeClass:
      'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
  },
  INVESTIGASI: {
    stepIndex: 3,
    label: 'Tahap Investigasi',
    keterangan:
      'Pemeriksaan mendalam, konfirmasi saksi/terlapor, dan pengumpulan bukti faktual oleh Tim Kepatuhan.',
    badgeClass:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
  },
  SELESAI: {
    stepIndex: 4,
    label: 'Selesai & Ditindaklanjuti',
    keterangan:
      'Proses investigasi telah rampung, rekomendasi tindak lanjut telah diterbitkan dan dituntaskan.',
    badgeClass:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  },
  DITOLAK: {
    stepIndex: -1,
    label: 'Ditolak / Tidak Cukup Bukti',
    keterangan:
      'Laporan dihentikan karena substansi bukan wewenang pengawasan BPS atau tidak disertai bukti permulaan.',
    badgeClass:
      'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
  }
};

// ==============================================================================
// GENERATOR TIKET ACAL AMAN
// ==============================================================================

/**
 * Menghasilkan kode tiket WBS unik dan acak (contoh: 'WBS-2026-7841').
 */
export function generateWBSTicketCode(): string {
  const year = new Date().getFullYear();
  const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
  return `WBS-${year}-${randomFourDigits}`;
}

// ==============================================================================
// FORMATTER NOTIFIKASI WHATSAPP KE TIM KEPATUHAN INTERNAL
// ==============================================================================

/**
 * Memformat pesan resmi WhatsApp yang dikirim ke nomor PIC Tim Kepatuhan Internal /
 * Penguatan Pengawasan (Pilar 5) BPS Kabupaten Kepulauan Sitaro saat ada pengaduan baru.
 */
export function formatWBSAlertWAMessage(laporan: LaporanPengaduanWBS): string {
  const kategoriMeta = KATEGORI_WBS_METADATA[laporan.kategori];
  const pelaporInfo = laporan.is_anonim
    ? '🔒 *ANONIM (Identitas Dirahasiakan Penuh)*'
    : `👤 ${laporan.pelapor_nama || 'Masyarakat/Pegawai'} (${laporan.pelapor_kontak || 'Kontak tidak dicantumkan'})`;

  const buktiInfo = laporan.lampiran_bukti_url
    ? `📎 *Lampiran Bukti:* ${laporan.lampiran_bukti_url}`
    : '📎 *Lampiran Bukti:* Tidak dilampirkan';

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://rebo-sitaro.vercel.app';

  return `🚨 *[WBS BPS SITARO] NOTIFIKASI PENGADUAN BARU MASUK* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kepada Yth.
*Tim Kepatuhan Internal / PIC Pilar 5 (Penguatan Pengawasan)*
BPS Kabupaten Kepulauan Siau Tagulandang Biaro

Telah diterima laporan pengaduan baru melalui portal Whistleblowing System (WBS) REBO V2:

🎫 *Nomor Tiket:* \`${laporan.ticket_code}\`
📅 *Waktu Masuk:* ${laporan.tanggal_lapor}
📂 *Kategori:* ${kategoriMeta?.label || laporan.kategori}
📌 *Subjek Aduan:* ${laporan.subjek}

🏢 *Terlapor / Unit:* ${laporan.terlapor_nama_or_unit}
📍 *Lokasi Kejadian:* ${laporan.lokasi_kejadian}
🗓️ *Perkiraan Tanggal:* ${laporan.perkiraan_tanggal_kejadian}
👤 *Pelapor:* ${pelaporInfo}
${buktiInfo}

📝 *Ringkasan Kronologi:*
"${laporan.rincian_kejadian.length > 250 ? laporan.rincian_kejadian.slice(0, 250) + '...' : laporan.rincian_kejadian}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *INSTRUKSI TINDAK LANJUT:*
1. Buka Dasbor Investigasi Pengawasan WBS:
   🔗 ${baseUrl}/rebo/admin/wbs
2. Lakukan verifikasi awal relevansi bukti dalam 2x24 jam kerja.
3. Jaga kerahasiaan identitas saksi/pelapor sesuai kode etik pengawasan BPS RI.

_Sistem Pengendalian Intern Pemerintah (SPIP) & WBK/WBBM BPS Sitaro_`;
}

// ==============================================================================
// DATA MOCK REALISTIS PENANGANAN PENGAWASAN BPS SITARO (PILAR 5)
// ==============================================================================

export const DEFAULT_MOCK_WBS_LAPORAN: LaporanPengaduanWBS[] = [
  {
    id: 'wbs-sitaro-001',
    ticket_code: 'WBS-2026-3819',
    tanggal_lapor: '2026-02-04 14:20 WITA',
    kategori: 'GRATIFIKASI_PUNGLI',
    subjek: 'Dugaan Permintaan Imbalan Pengambilan Data Mikro di PST',
    rincian_kejadian:
      'Pengguna data konsultasi skripsi mengeluhkan adanya oknum petugas yang meminta uang bensin/lelah secara informal untuk mempercepat ekstraksi data mikro SUSENAS modul konsumsi.',
    lokasi_kejadian:
      'Ruang Pelayanan Statistik Terpadu (PST) Kantor BPS Sitaro',
    perkiraan_tanggal_kejadian: '2026-02-03',
    terlapor_nama_or_unit: 'Petugas Front Office / Layanan Konsultasi PST',
    is_anonim: true,
    lampiran_bukti_url: 'https://drive.google.com/file/d/bukti-wbs-001/view',
    status: 'SELESAI',
    catatan_tim_kepatuhan:
      'Telah dilakukan klarifikasi bersama Kepala BPS dan Pembina PST. Ditemukan kesalahpahaman komunikasi biaya fotokopi eksternal, namun teguran lisan diberikan kepada petugas.',
    tindak_lanjut:
      'Pemasangan banner tarif Rp 0 (Zero Rupiah) di atas meja PST, penegasan SOP Si-Datu bebas biaya, dan rotasi jadwal petugas layanan.',
    notifikasi_tim_sent: true,
    created_at: '2026-02-04T06:20:00Z',
    updated_at: '2026-02-08T09:15:00Z'
  },
  {
    id: 'wbs-sitaro-002',
    ticket_code: 'WBS-2026-5902',
    tanggal_lapor: '2026-02-12 09:45 WITA',
    kategori: 'PENYALAHGUNAAN_WEWENANG',
    subjek: 'Penggunaan Kendaraan Operasional Dinas Roda Dua di Luar Jam Dinas',
    rincian_kejadian:
      'Sepeda motor operasional dinas inventaris kantor terlihat digunakan untuk kepentingan pribadi keluarga di luar pulau penugasan pada akhir pekan tanpa surat izin jalan resmi.',
    lokasi_kejadian: 'Pelabuhan Ulu Siau & Wilayah Tagulandang',
    perkiraan_tanggal_kejadian: '2026-02-08',
    terlapor_nama_or_unit: 'Pemegang Kendaraan Dinas BMN',
    is_anonim: false,
    pelapor_nama: 'Pegawai Internal BPS',
    pelapor_kontak: '081244556677',
    lampiran_bukti_url:
      'https://drive.google.com/file/d/foto-kendaraan-bmn/view',
    status: 'INVESTIGASI',
    catatan_tim_kepatuhan:
      'Sedang dilakukan pencocokan buku kendali peminjaman BMN, log pergerakan BBM dinas, dan klarifikasi bersama Kasubbag Umum.',
    tindak_lanjut:
      'Pemberian surat peringatan tertulis (SP-1) dan penarikan kunci ganda kendaraan ke ruang pengelola aset BMN.',
    notifikasi_tim_sent: true,
    created_at: '2026-02-12T01:45:00Z',
    updated_at: '2026-02-14T03:30:00Z'
  },
  {
    id: 'wbs-sitaro-003',
    ticket_code: 'WBS-2026-7841',
    tanggal_lapor: '2026-02-18 11:10 WITA',
    kategori: 'DISKOMUNIKASI_PELAYANAN',
    subjek: 'Keterlambatan Pembayaran Uang Transport Pelatihan Mitra Lapangan',
    rincian_kejadian:
      'Mitra pendataan survei mencatat adanya selisih waktu pencairan uang transport pelatihan survei ekonomi triwulanan yang melebihi estimasi jadwal SPMK/BAST.',
    lokasi_kejadian: 'Kecamatan Biaro & Wilayah Kepulauan Terluar',
    perkiraan_tanggal_kejadian: '2026-02-14',
    terlapor_nama_or_unit: 'Subbagian Umum & Pengelola Keuangan',
    is_anonim: true,
    lampiran_bukti_url: undefined,
    status: 'VERIFIKASI_AWAL',
    catatan_tim_kepatuhan:
      'Laporan baru diterima. Sedang dilakukan konfirmasi berkas administrasi KPPN Tahuna terkait status terbit SP2D.',
    tindak_lanjut:
      'Koordinasi dengan bendahara pengeluaran untuk memastikan SP2D telah masuk ke rekening masing-masing mitra perbankan.',
    notifikasi_tim_sent: true,
    created_at: '2026-02-18T03:10:00Z',
    updated_at: '2026-02-18T05:00:00Z'
  }
];
