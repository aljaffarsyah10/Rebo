/**
 * Tipe Data, Mock Data & Utilitas Pelacak Kepatuhan e-LHKPN & e-LHKASN
 * Badan Pusat Statistik (BPS) Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)
 *
 * Pemenuhan Syarat Mutlak (Threshold Gatekeeper) MenPAN-RB & KPK RI Menuju Predikat WBK/WBBM
 * Pilar 5 (Penguatan Pengawasan) & Pilar 3 (Penataan Sistem Manajemen SDM)
 */

export type TipeLaporanHarta = 'LHKPN' | 'LHKASN';
export type StatusKepatuhanLHKPN =
  | 'SUDAH_LAPOR'
  | 'PROSES_VERIFIKASI'
  | 'BELUM_LAPOR';

export interface LHKPNReport {
  id: string;
  user_id: string;
  nama_pegawai: string;
  nip: string;
  jabatan: string;
  tipe_laporan: TipeLaporanHarta;
  tahun_pelaporan: number;
  status: StatusKepatuhanLHKPN;
  tanggal_lapor?: string;
  nomor_tanda_terima?: string;
  bukti_tanda_terima_url?: string;
  no_whatsapp: string;
  reminder_count: number;
  last_reminder_sent_at?: string;
  catatan_verifikasi?: string;
  verified_at?: string;
  verified_by?: string;
}

export interface LHKPNSummary {
  total_wajib_lapor: number;
  total_lhkpn: number;
  total_lhkasn: number;
  sudah_lapor: number;
  proses_verifikasi: number;
  belum_lapor: number;
  persentase_kepatuhan: number;
  days_until_deadline: number;
  is_100_percent_compliant: boolean;
  lhkpn_sudah: number;
  lhkpn_verifikasi: number;
  lhkpn_belum: number;
  lhkasn_sudah: number;
  lhkasn_verifikasi: number;
  lhkasn_belum: number;
}

export interface SubmitBuktiLaporInput {
  id?: string;
  user_id?: string;
  nama_pegawai?: string;
  nip?: string;
  tipe_laporan?: TipeLaporanHarta;
  tanggal_lapor: string;
  nomor_tanda_terima: string;
  bukti_tanda_terima_url?: string;
  catatan_tambahan?: string;
}

/**
 * Menghitung sisa hari hingga batas akhir 31 Maret tahun pelaporan
 */
export function calculateDaysUntilDeadline(tahun: number = 2026): number {
  const deadline = new Date(tahun, 2, 31, 23, 59, 59); // 31 Maret
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Menghitung rekapitulasi kepatuhan dari daftar laporan
 */
export function calculateLHKPNSummary(
  reports: LHKPNReport[],
  tahun: number = 2026
): LHKPNSummary {
  const total_wajib_lapor = reports.length;
  const lhkpnList = reports.filter((r) => r.tipe_laporan === 'LHKPN');
  const lhkasnList = reports.filter((r) => r.tipe_laporan === 'LHKASN');

  const sudah_lapor = reports.filter((r) => r.status === 'SUDAH_LAPOR').length;
  const proses_verifikasi = reports.filter(
    (r) => r.status === 'PROSES_VERIFIKASI'
  ).length;
  const belum_lapor = reports.filter((r) => r.status === 'BELUM_LAPOR').length;

  const persentase_kepatuhan =
    total_wajib_lapor > 0
      ? Math.round((sudah_lapor / total_wajib_lapor) * 1000) / 10
      : 0;

  const lhkpn_sudah = lhkpnList.filter(
    (r) => r.status === 'SUDAH_LAPOR'
  ).length;
  const lhkpn_verifikasi = lhkpnList.filter(
    (r) => r.status === 'PROSES_VERIFIKASI'
  ).length;
  const lhkpn_belum = lhkpnList.filter(
    (r) => r.status === 'BELUM_LAPOR'
  ).length;

  const lhkasn_sudah = lhkasnList.filter(
    (r) => r.status === 'SUDAH_LAPOR'
  ).length;
  const lhkasn_verifikasi = lhkasnList.filter(
    (r) => r.status === 'PROSES_VERIFIKASI'
  ).length;
  const lhkasn_belum = lhkasnList.filter(
    (r) => r.status === 'BELUM_LAPOR'
  ).length;

  const days_until_deadline = calculateDaysUntilDeadline(tahun);
  const is_100_percent_compliant =
    total_wajib_lapor > 0 && sudah_lapor === total_wajib_lapor;

  return {
    total_wajib_lapor,
    total_lhkpn: lhkpnList.length,
    total_lhkasn: lhkasnList.length,
    sudah_lapor,
    proses_verifikasi,
    belum_lapor,
    persentase_kepatuhan,
    days_until_deadline,
    is_100_percent_compliant,
    lhkpn_sudah,
    lhkpn_verifikasi,
    lhkpn_belum,
    lhkasn_sudah,
    lhkasn_verifikasi,
    lhkasn_belum
  };
}

/**
 * Format Pesan Resmi WhatsApp Pengingat Pelaporan Harta Kekayaan Berkop BPS Kabupaten Kepulauan Sitaro
 */
export function formatLHKPNReminderWAMessage(
  report: LHKPNReport,
  daysUntilDeadline: number
): string {
  const portalName =
    report.tipe_laporan === 'LHKPN'
      ? 'Portal e-LHKPN KPK RI'
      : 'Portal SiHarka / e-LHKASN KemenPAN-RB';
  const portalUrl =
    report.tipe_laporan === 'LHKPN'
      ? 'https://elhkpn.kpk.go.id'
      : 'https://siharka.menpan.go.id';

  const countdownText =
    daysUntilDeadline > 0
      ? `⏳ *Sisa Waktu:* ${daysUntilDeadline} hari lagi`
      : '⚠️ *PERHATIAN:* Batas waktu 31 Maret telah terlewati!';

  return `🏛️ *BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO*
🛡️ *TIM PENGAWASAN & KEPATUHAN INTERNAL (PILAR 5 ZI-WBK)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*PENGINGAT RESMI KEPATUHAN PELAPORAN HARTA KEKAYAAN TAHUN ${report.tahun_pelaporan}*

Yth. Bapak/Ibu *${report.nama_pegawai}*
NIP: \`${report.nip}\`
Jabatan: ${report.jabatan}

Dengan hormat, kami mengingatkan kewajiban penyampaian bukti tanda terima Laporan Harta Kekayaan:
📌 *Kategori Laporan:* *${report.tipe_laporan === 'LHKPN' ? 'e-LHKPN (Penyelenggara Negara)' : 'e-LHKASN (Aparatur Sipil Negara)'}*
⏰ *Batas Akhir Pelaporan:* 31 Maret ${report.tahun_pelaporan}
${countdownText}
📊 *Status Saat Ini:* ${report.status === 'BELUM_LAPOR' ? '❌ BELUM MENYAMPAIKAN BUKTI' : '⏳ DALAM PROSES VERIFIKASI'}

🎯 *SYARAT MUTLAK (GATEKEEPER) WBK BPS SITARO:*
Berdasarkan PermenPAN-RB No. 90/2021 dan SE Menteri PAN-RB, kepatuhan *100% LHKPN & LHKASN* seluruh pegawai merupakan *Syarat Mutlak*. Keterlambatan satu orang saja akan menggugurkan status evaluasi Wilayah Bebas dari Korupsi (WBK) BPS Sitaro.

🔗 *Langkah Pelaporan:*
1. Akses pelaporan di ${portalName}:
   ${portalUrl}
2. Unduh Tanda Terima Elektronik resmi (format PDF).
3. Unggah nomor dan berkas tanda terima ke aplikasi REBO V2 BPS Sitaro:
   👉 https://rebo-sitaro.bps.go.id/rebo/compliance/lhkpn

Mari bersama kita jaga integritas dan komitmen 100% kepatuhan satker!

_Salam Integritas & Pelayanan Prima,_
*Tim Pengawasan & Kepatuhan Internal BPS Sitaro*`;
}

/**
 * Mock Data Realistis 18 Pegawai BPS Kabupaten Kepulauan Sitaro Tahun 2026
 * Terdiri dari Penyelenggara Negara (Wajib LHKPN) dan ASN (Wajib LHKASN)
 */
export const DEFAULT_MOCK_LHKPN_REPORTS: LHKPNReport[] = [
  // 1. Kepala BPS Kabupaten Kepulauan Sitaro (Wajib LHKPN)
  {
    id: 'lhkpn-01',
    user_id: 'user-01',
    nama_pegawai: 'Ir. Pimpinan BPS Sitaro, M.Si',
    nip: '197501012000031001',
    jabatan: 'Kepala BPS Kabupaten Kepulauan Sitaro',
    tipe_laporan: 'LHKPN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-01-15',
    nomor_tanda_terima: 'KPK-LHKPN/2026/01/7108001',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkpn-kepala-sitaro-2026.pdf',
    no_whatsapp: '082190010001',
    reminder_count: 0,
    last_reminder_sent_at: undefined,
    catatan_verifikasi: 'Telah diverifikasi sesuai tanda terima KPK RI.',
    verified_at: '2026-01-16T09:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 2. Kasubbag Umum (Wajib LHKPN)
  {
    id: 'lhkpn-02',
    user_id: 'user-02',
    nama_pegawai: 'Franky Pontoh, S.Si',
    nip: '198103142006041002',
    jabatan: 'Kepala Subbagian Umum & Kuasa Pengguna Anggaran (KPA)',
    tipe_laporan: 'LHKPN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-01-22',
    nomor_tanda_terima: 'KPK-LHKPN/2026/01/7108002',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkpn-kasubbag-sitaro-2026.pdf',
    no_whatsapp: '082190010002',
    reminder_count: 0,
    last_reminder_sent_at: undefined,
    catatan_verifikasi: 'Terverifikasi lengkap e-filing KPK.',
    verified_at: '2026-01-23T10:15:00.000Z',
    verified_by: 'Admin Kepatuhan'
  },
  // 3. Pejabat Pembuat Komitmen / PPK (Wajib LHKPN)
  {
    id: 'lhkpn-03',
    user_id: 'user-03',
    nama_pegawai: 'Christian Saselah, S.Tr.Stat',
    nip: '199008202013011001',
    jabatan: 'Pejabat Pembuat Komitmen (PPK) & Statistisi Ahli Pertama',
    tipe_laporan: 'LHKPN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-05',
    nomor_tanda_terima: 'KPK-LHKPN/2026/02/7108003',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkpn-ppk-sitaro-2026.pdf',
    no_whatsapp: '082190010003',
    reminder_count: 1,
    last_reminder_sent_at: '2026-01-30T08:30:00.000Z',
    catatan_verifikasi: 'Tanda terima e-LHKPN KPK valid.',
    verified_at: '2026-02-06T11:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 4. Pejabat Pengadaan Barang dan Jasa / PPBJ (Wajib LHKPN)
  {
    id: 'lhkpn-04',
    user_id: 'user-04',
    nama_pegawai: 'Novita Salindeho, S.Si',
    nip: '198911122012122002',
    jabatan: 'Pejabat Pengadaan Barang & Jasa (PPBJ) / Statistisi Ahli Pertama',
    tipe_laporan: 'LHKPN',
    tahun_pelaporan: 2026,
    status: 'PROSES_VERIFIKASI',
    tanggal_lapor: '2026-02-18',
    nomor_tanda_terima: 'KPK-LHKPN/2026/02/7108004',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkpn-ppbj-sitaro-2026.pdf',
    no_whatsapp: '082190010005',
    reminder_count: 1,
    last_reminder_sent_at: '2026-02-10T09:00:00.000Z',
    catatan_verifikasi: 'Menunggu validasi lampiran tanda terima oleh Kasubbag.'
  },
  // 5. Bendahara Pengeluaran (Wajib LHKPN)
  {
    id: 'lhkpn-05',
    user_id: 'user-05',
    nama_pegawai: 'Debby Makawimbang, S.E',
    nip: '198705182010012003',
    jabatan: 'Bendahara Pengeluaran BPS Sitaro',
    tipe_laporan: 'LHKPN',
    tahun_pelaporan: 2026,
    status: 'BELUM_LAPOR',
    no_whatsapp: '082190010004',
    reminder_count: 2,
    last_reminder_sent_at: '2026-02-15T08:00:00.000Z'
  },
  // 6. Statistisi Ahli Muda (Wajib LHKASN)
  {
    id: 'lhkasn-06',
    user_id: 'user-06',
    nama_pegawai: 'Meilany Janis, S.Stat',
    nip: '198807152011012004',
    jabatan: 'Statistisi Ahli Muda / Koordinator Nerwilis',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-01-20',
    nomor_tanda_terima: 'MENPAN-ASN/2026/01/7108006',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-meilany-2026.pdf',
    no_whatsapp: '082190010006',
    reminder_count: 0,
    catatan_verifikasi: 'Laporan SiHarka terverifikasi.',
    verified_at: '2026-01-21T09:30:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 7. Statistisi Mahir (Wajib LHKASN)
  {
    id: 'lhkasn-07',
    user_id: 'user-07',
    nama_pegawai: 'Rivo Lahamendu, A.Md.Stat',
    nip: '199204092015031002',
    jabatan: 'Statistisi Mahir / Tim Pelayanan Statistik Terpadu',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-01-25',
    nomor_tanda_terima: 'MENPAN-ASN/2026/01/7108007',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-rivo-2026.pdf',
    no_whatsapp: '082190010007',
    reminder_count: 0,
    catatan_verifikasi: 'Terverifikasi lengkap SiHarka.',
    verified_at: '2026-01-26T14:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 8. Pranata Komputer Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-08',
    user_id: 'user-08',
    nama_pegawai: 'Glen Donald Derek, S.Kom',
    nip: '199302142017011003',
    jabatan: 'Pranata Komputer Ahli Pertama / Tim IPDS',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-01-28',
    nomor_tanda_terima: 'MENPAN-ASN/2026/01/7108008',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-glen-2026.pdf',
    no_whatsapp: '082190010008',
    reminder_count: 0,
    catatan_verifikasi: 'Terverifikasi tepat waktu.',
    verified_at: '2026-01-29T10:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 9. Statistisi Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-09',
    user_id: 'user-09',
    nama_pegawai: 'Brenda V. Tatengkeng, S.Tr.Stat',
    nip: '199510102018012001',
    jabatan: 'Statistisi Ahli Pertama / Tim Statistik Sosial',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-02',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108009',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-brenda-2026.pdf',
    no_whatsapp: '082190010009',
    reminder_count: 0,
    catatan_verifikasi: 'Sesuai dengan ketentuan SiHarka.',
    verified_at: '2026-02-03T11:20:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 10. Statistisi Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-10',
    user_id: 'user-10',
    nama_pegawai: 'Aldi Kurniawan, S.Stat',
    nip: '199406182017121002',
    jabatan: 'Statistisi Ahli Pertama / Tim Statistik Produksi',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-08',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108010',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-aldi-2026.pdf',
    no_whatsapp: '082190010010',
    reminder_count: 1,
    last_reminder_sent_at: '2026-02-01T08:00:00.000Z',
    catatan_verifikasi: 'Terverifikasi lengkap.',
    verified_at: '2026-02-09T09:10:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 11. Pranata Keuangan APBN Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-11',
    user_id: 'user-11',
    nama_pegawai: 'Gloria M. Salindeho, S.E',
    nip: '199208152016022001',
    jabatan: 'Pranata Keuangan APBN Ahli Pertama / Bagian Umum',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-12',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108011',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-gloria-2026.pdf',
    no_whatsapp: '082190010011',
    reminder_count: 0,
    catatan_verifikasi: 'Terverifikasi.',
    verified_at: '2026-02-13T13:45:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 12. Pranata Komputer Terampil (Wajib LHKASN)
  {
    id: 'lhkasn-12',
    user_id: 'user-12',
    nama_pegawai: 'Mario D. Manoppo, A.Md',
    nip: '199603222019031002',
    jabatan: 'Pranata Komputer Terampil / Tim Jaringan & Sistem',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'PROSES_VERIFIKASI',
    tanggal_lapor: '2026-02-21',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108012',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-mario-2026.pdf',
    no_whatsapp: '082190010012',
    reminder_count: 1,
    last_reminder_sent_at: '2026-02-14T09:00:00.000Z',
    catatan_verifikasi: 'Menunggu konfirmasi keabsahan tanda terima SiHarka.'
  },
  // 13. Statistisi Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-13',
    user_id: 'user-13',
    nama_pegawai: 'Siti Rahmawati, S.Tr.Stat',
    nip: '199701192020122003',
    jabatan: 'Statistisi Ahli Pertama / Tim Statistik Distribusi',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-14',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108013',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-siti-2026.pdf',
    no_whatsapp: '082190010013',
    reminder_count: 0,
    catatan_verifikasi: 'Dokumen bukti tanda terima absah.',
    verified_at: '2026-02-15T10:30:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 14. Statistisi Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-14',
    user_id: 'user-14',
    nama_pegawai: 'Yosafat T. Bawias, S.Stat',
    nip: '199512042019021004',
    jabatan: 'Statistisi Ahli Pertama / Tim Sensus & Survei',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'BELUM_LAPOR',
    no_whatsapp: '082190010014',
    reminder_count: 1,
    last_reminder_sent_at: '2026-02-10T08:00:00.000Z'
  },
  // 15. Statistisi Terampil (Wajib LHKASN)
  {
    id: 'lhkasn-15',
    user_id: 'user-15',
    nama_pegawai: 'Agnesia Tamara, A.Md.Stat',
    nip: '199805162021032002',
    jabatan: 'Statistisi Terampil / Tim Pengolahan Data',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-10',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108015',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-agnesia-2026.pdf',
    no_whatsapp: '082190010015',
    reminder_count: 0,
    catatan_verifikasi: 'Telah terverifikasi.',
    verified_at: '2026-02-11T14:15:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 16. Arsiparis Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-16',
    user_id: 'user-16',
    nama_pegawai: 'Rendy C. Sasamu, S.AP',
    nip: '199308112018011002',
    jabatan: 'Arsiparis Ahli Pertama / Tata Usaha & Kearsipan',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-15',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108016',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-rendy-2026.pdf',
    no_whatsapp: '082190010016',
    reminder_count: 0,
    catatan_verifikasi: 'Lengkap dan sesuai.',
    verified_at: '2026-02-16T11:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  },
  // 17. Pengolah Data dan Informasi (Wajib LHKASN)
  {
    id: 'lhkasn-17',
    user_id: 'user-17',
    nama_pegawai: 'Priscilia Mandak, A.Md',
    nip: '199909242022032001',
    jabatan: 'Pengolah Data dan Informasi / Pelaksana Subbagian Umum',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'BELUM_LAPOR',
    no_whatsapp: '082190010017',
    reminder_count: 2,
    last_reminder_sent_at: '2026-02-18T08:00:00.000Z'
  },
  // 18. Statistisi Ahli Pertama (Wajib LHKASN)
  {
    id: 'lhkasn-18',
    user_id: 'user-18',
    nama_pegawai: 'Joshua E. Kaligis, S.Tr.Stat',
    nip: '199607142020121004',
    jabatan: 'Statistisi Ahli Pertama / Tim Sensus Pertanian & Survei',
    tipe_laporan: 'LHKASN',
    tahun_pelaporan: 2026,
    status: 'SUDAH_LAPOR',
    tanggal_lapor: '2026-02-01',
    nomor_tanda_terima: 'MENPAN-ASN/2026/02/7108018',
    bukti_tanda_terima_url:
      'https://drive.google.com/file/d/bukti-lhkasn-joshua-2026.pdf',
    no_whatsapp: '082190010018',
    reminder_count: 0,
    catatan_verifikasi: 'Tanda terima e-filing ASN absah.',
    verified_at: '2026-02-02T13:00:00.000Z',
    verified_by: 'Kasubbag Umum'
  }
];
