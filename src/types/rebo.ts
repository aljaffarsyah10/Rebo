export interface KategoriPenilaian {
  id_kategori: string;
  uraian_kategori: string;
  nilai?: number | null;
  [key: string]: any;
}

// ==============================================================================
// REBO V2: Status Kelengkapan & Constants
// ==============================================================================

export type StatusKelengkapan = 0 | 1 | 2 | 3;

export const STATUS_KELENGKAPAN = {
  BELUM_DIISI: 0,
  MENUNGGU_REVIEW: 1,
  DISETUJUI: 2,
  PERLU_REVISI: 3
} as const;

export interface StatusKelengkapanInfo {
  code: StatusKelengkapan;
  label: string;
  variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning';
  badgeClass: string;
  description: string;
}

export const STATUS_KELENGKAPAN_MAP: Record<
  StatusKelengkapan,
  StatusKelengkapanInfo
> = {
  0: {
    code: 0,
    label: 'Belum Diisi',
    variant: 'secondary',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    description:
      'Indikator belum diisi opsi skor atau link dokumen bukti oleh operator.'
  },
  1: {
    code: 1,
    label: 'Menunggu Review',
    variant: 'warning',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    description:
      'Dokumen bukti telah diunggah dan diajukan untuk diperiksa koordinator.'
  },
  2: {
    code: 2,
    label: 'Disetujui',
    variant: 'success',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    description:
      'Dokumen bukti telah diperiksa dan disetujui oleh Koordinator/TPI.'
  },
  3: {
    code: 3,
    label: 'Perlu Revisi',
    variant: 'destructive',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    description:
      'Dokumen ditolak/kurang lengkap; memerlukan tindak lanjut perbaikan dari tim.'
  }
};

// ==============================================================================
// REBO V2: Status & Log Pengiriman ke Web Pusat (ZIAPP)
// ==============================================================================

export type ZIAPPSyncStatus =
  | 'DRAFT'
  | 'VERIFIED_INTERNAL'
  | 'READY_FOR_ZIAPP'
  | 'SYNCED_TO_ZIAPP';

export interface ZIAPPSyncStatusInfo {
  code: ZIAPPSyncStatus;
  label: string;
  badgeClass: string;
  iconName: string;
  description: string;
}

export const ZIAPP_STATUS_MAP: Record<ZIAPPSyncStatus, ZIAPPSyncStatusInfo> = {
  DRAFT: {
    code: 'DRAFT',
    label: 'Draf',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    iconName: 'FileEdit',
    description:
      'Indikator masih dalam proses pemenuhan bukti internal oleh tim kerja.'
  },
  VERIFIED_INTERNAL: {
    code: 'VERIFIED_INTERNAL',
    label: 'Terverifikasi Internal',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    iconName: 'ShieldCheck',
    description:
      'Telah disetujui Koordinator/TPI namun belum ditandai siap kirim ke ZIAPP.'
  },
  READY_FOR_ZIAPP: {
    code: 'READY_FOR_ZIAPP',
    label: 'Siap Kirim ke ZIAPP',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    iconName: 'Send',
    description:
      'Bukti dan skor telah disetujui serta siap disinkronkan ke Web Pusat ZIAPP.'
  },
  SYNCED_TO_ZIAPP: {
    code: 'SYNCED_TO_ZIAPP',
    label: 'Tersinkron ke ZIAPP',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    iconName: 'CheckCircle2',
    description:
      'Data indikator dan tautan berkas bukti telah berhasil disubmit ke Web Pusat ZIAPP.'
  }
};

/**
 * Menentukan status ZIAPP efektif berdasarkan status kelengkapan dan field ziapp_status
 */
export function getEffectiveZIAPPStatus(
  statusKelengkapan?: number | string | null,
  ziappStatus?: ZIAPPSyncStatus | string | null
): ZIAPPSyncStatus {
  if (ziappStatus === 'SYNCED_TO_ZIAPP') return 'SYNCED_TO_ZIAPP';
  if (ziappStatus === 'READY_FOR_ZIAPP') return 'READY_FOR_ZIAPP';
  if (Number(statusKelengkapan) === 2) return 'VERIFIED_INTERNAL';
  return 'DRAFT';
}

// ==============================================================================
// REBO V2: Core Database Entities
// ==============================================================================

export interface PeriodeEvaluasi {
  id: string;
  tahun: number;
  nama_periode: string;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  tanggal_cutoff?: string | null;
  is_active: boolean;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DokumenBukti {
  id: string;
  id_pertanyaan_periode: string;
  nama_dokumen: string;
  file_url: string;
  tipe_dokumen?: string | null;
  uploaded_by: string;
  submitted_by_user_id?: string | null;
  submitted_by_name?: string | null;
  submitted_by_phone?: string | null;
  uploaded_at?: string;
  created_at?: string;
}

export interface PertanyaanPeriode {
  id: string;
  id_periode: string;
  id_pertanyaan: string;
  id_kategori?: string | null;
  gdrive_folder_id?: string | null;
  gdrive_folder_url?: string | null;
  status_kelengkapan: StatusKelengkapan;
  nilai_mandiri: number;
  nilai_verifikasi: number;
  catatan_operator?: string | null;
  catatan_koordinator?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  ziapp_status?: ZIAPPSyncStatus | string;
  ziapp_synced_at?: string | null;
  ziapp_synced_by?: string | null;
  submitted_by_user_id?: string | null;
  submitted_by_name?: string | null;
  submitted_by_phone?: string | null;
  created_at?: string;
  updated_at?: string;

  // Joined relations
  periode?: PeriodeEvaluasi | null;
  pertanyaan?: Pertanyaan | null;
  kategoriPenilaian?: KategoriPenilaian | null;
  dokumen_bukti?: DokumenBukti[];
}

export interface UserProfileData {
  id: string;
  email?: string | null;
  full_name?: string | null;
  no_wa?: string | null;
  telepon?: string | null;
  role?: string | null;
  pilar_tugas?: number | null;
  assigned_pilar_id?: number | null;
  notif_wa_approval: boolean;
  notif_wa_revision: boolean;
  notif_wa_deadline: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  id_pertanyaan_periode?: string | null;
  action: string;
  old_state?: Record<string, any> | null;
  new_state?: Record<string, any> | null;
  user_id: string;
  user_name?: string | null;
  role?: string | null;
  created_at?: string;
  // Optional enriched fields
  pertanyaan_info?: {
    id_pertanyaan?: string;
    kode_indikator?: string;
    uraian_singkat?: string;
    pilar_nama?: string;
  } | null;
}

// ==============================================================================
// REBO V2: Phase 7 Monitoring, Kanban & Audit Data Models
// ==============================================================================

export interface MonitoringKPIData {
  totalPertanyaan: number;
  totalSelesai: number;
  totalRevisi: number;
  totalMenungguReview: number;
  totalBelumDiisi: number;
  persentaseKelengkapan: number;
  totalNilaiMandiri: number;
  totalNilaiVerifikasi: number;
  totalNilaiMaksimal: number;
  persentaseSkorMandiri: number;
  persentaseSkorVerifikasi: number;
  totalSkorPilarHasil: number;
}

export interface SubpilarProgressItem {
  id_subpilar: string;
  nama_subpilar: string;
  totalPertanyaan: number;
  belumDiisi: number;
  menungguReview: number;
  disetujui: number;
  perluRevisi: number;
  persentaseSelesai: number;
  nilaiMandiri: number;
  nilaiVerifikasi: number;
  nilaiMaksimal: number;
}

export interface PilarProgressItem {
  id_pilar: string;
  nama_pilar: string;
  kode_pilar: string;
  area: string;
  totalPertanyaan: number;
  belumDiisi: number;
  menungguReview: number;
  disetujui: number;
  perluRevisi: number;
  persentaseSelesai: number;
  nilaiMandiri: number;
  nilaiVerifikasi: number;
  nilaiMaksimal: number;
  subpilars: SubpilarProgressItem[];
}

export interface StatusDistributionItem {
  name: string;
  value: number;
  color: string;
  code: StatusKelengkapan;
}

export interface PilarBarChartItem {
  name: string;
  fullName: string;
  pilarId: string;
  skorMandiri: number;
  skorVerifikasi: number;
  skorMaksimal: number;
  persentaseSelesai: number;
}

export interface MonitoringDashboardData {
  periode: PeriodeEvaluasi | null;
  kpi: MonitoringKPIData;
  pilars: PilarProgressItem[];
  statusDistribution: StatusDistributionItem[];
  barChartData: PilarBarChartItem[];
  simulation?: WBKSimulationResult;
  surveiSummary?: SurveiSummaryData;
}

// ==============================================================================
// REBO V2: Simulasi Nilai & Gap Analysis (Predikat WBK/WBBM)
// ==============================================================================

export type WBKStatusPredikat =
  | 'MEMENUHI_WBBM'
  | 'MEMENUHI_WBK'
  | 'POTENSI_WBK_BUTUH_VERIFIKASI'
  | 'BELUM_MEMENUHI_WBK';

export interface QuickWinIndicator {
  id_pertanyaan: string;
  id_pilar: string;
  kode_pilar: string;
  nama_pilar: string;
  id_subpilar?: string;
  nama_subpilar?: string;
  deskripsi_pertanyaan: string;
  status_kelengkapan: number;
  status_label: string;
  nilai_mandiri: number;
  nilai_verifikasi: number;
  nilai_maks: number;
  potensi_tambahan_skor: number;
  link_form: string;
}

export interface WBKSimulationResult {
  totalSkorMandiri: number;
  totalSkorVerifikasi: number;
  totalNilaiMaks: number;
  persentaseMandiri: number;
  persentaseVerifikasi: number;
  gapToWBK: number;
  gapToWBBM: number;
  gapMandiriToWBK: number;
  status: WBKStatusPredikat;
  statusLabel: string;
  statusDescription: string;
  quickWins: QuickWinIndicator[];
  totalSkorPilarHasil?: number;
}

export interface KanbanIndicatorCard {
  id_pertanyaan: string;
  id_pertanyaan_periode?: string;
  kode_indikator: string;
  uraian_pertanyaan: string;
  uraian_singkat: string;
  pilar_id: string;
  pilar_nama: string;
  pilar_kode: string;
  subpilar_id: string;
  subpilar_nama: string;
  status_kelengkapan: StatusKelengkapan;
  catatan_koordinator?: string | null;
  catatan_operator?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  submitted_by_user_id?: string | null;
  submitted_by_name?: string | null;
  nilai_mandiri: number;
  nilai_verifikasi: number;
  nilai_maksimal: number;
  gdrive_folder_url?: string | null;
  total_dokumen: number;
  ziapp_status?: ZIAPPSyncStatus | string;
  ziapp_synced_at?: string | null;
  ziapp_synced_by?: string | null;
  dokumen_files: Array<{
    id?: string;
    nama_dokumen: string;
    file_url: string;
    tipe_dokumen?: string | null;
  }>;
}

export interface KanbanBoardData {
  periode: PeriodeEvaluasi | null;
  cards: {
    perluRevisi: KanbanIndicatorCard[];
    menungguReview: KanbanIndicatorCard[];
    disetujui: KanbanIndicatorCard[];
  };
  totalCount: number;
  counts: {
    perluRevisi: number;
    menungguReview: number;
    disetujui: number;
  };
}

// ==============================================================================
// V1 Compatible & Enhanced Interfaces
// ==============================================================================

export interface BuktiDukung {
  id_bukti?: string;
  id_pertanyaan: string;
  id_pertanyaan_periode?: string;
  link_bukti?: string | null;
  gdrive_folder_url?: string | null;
  gdrive_folder_id?: string | null;
  dokumen_bukti?: DokumenBukti[];
  id_kategori?: string | null;
  nilai_akhir?: number | null;
  nilai_mandiri?: number | null;
  nilai_verifikasi?: number | null;
  status?: string | null;
  status_kelengkapan?: string | number | null;
  nama_status?: string | null;
  catatan_user?: string | null;
  catatan_operator?: string | null;
  catatan_koordinator?: string | null;
  ziapp_status?: ZIAPPSyncStatus | string;
  ziapp_synced_at?: string | null;
  ziapp_synced_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  statusBukti?: { id_status: string; nama_status: string } | null;
  [key: string]: any;
}

export interface Pertanyaan {
  id_pertanyaan: string;
  uraian_pertanyaan: string;
  uraian_singkat?: string | null;
  deskripsi_pertanyaan?: string | null;
  kategoriPenilaian?: KategoriPenilaian[];

  // V2 relations
  pertanyaan_periode?: PertanyaanPeriode | PertanyaanPeriode[] | null;
  dokumen_bukti?: DokumenBukti[];

  // V1 backward compatibility relations
  buktiDukung?: BuktiDukung | BuktiDukung[] | null;

  [key: string]: any;
}

export interface Pilar {
  id_pilar: string;
  nama_pilar: string;
  kode_pilar?: string | null;
  bobot?: number | null;
  subpilar?: Subpilar[];
  [key: string]: any;
}

export interface Subpilar {
  id_subpilar: string;
  nama_subpilar?: string;
  id_pilar?: string;
  pilar?: Pilar | { id_pilar: string; nama_pilar: string } | null;
  pertanyaan?: Pertanyaan[];
  [key: string]: any;
}

// ==============================================================================
// REBO V2: Digital Archive (Arsip Digital) Data Models
// ==============================================================================

export type KategoriArsip =
  | 'SK_TIM'
  | 'RENCANA_AKSI'
  | 'SOP_INOVASI'
  | 'LKE_RESMI'
  | 'PEDOMAN';

export interface ArsipDokumen {
  id: string;
  judul_dokumen: string;
  kategori: KategoriArsip;
  tahun: number;
  file_url: string;
  nomor_surat?: string | null;
  keterangan?: string | null;
  uploaded_by: string;
  created_at?: string;
}

export interface KategoriArsipInfo {
  code: KategoriArsip;
  label: string;
  badgeClass: string;
  iconName: string;
  description: string;
}

export const KATEGORI_ARSIP_MAP: Record<KategoriArsip, KategoriArsipInfo> = {
  SK_TIM: {
    code: 'SK_TIM',
    label: 'SK Tim Kerja ZI',
    badgeClass:
      'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    iconName: 'ShieldCheck',
    description: 'Surat Keputusan Kepala BPS penetapan Tim Pembangunan ZI/RB'
  },
  RENCANA_AKSI: {
    code: 'RENCANA_AKSI',
    label: 'Rencana Aksi & Kerja',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    iconName: 'Target',
    description: 'Road map rencana aksi dan target capaian Zona Integritas'
  },
  SOP_INOVASI: {
    code: 'SOP_INOVASI',
    label: 'SOP & Inovasi Layanan',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    iconName: 'Sparkles',
    description: 'Standar Operasional Prosedur & Inovasi Pelayanan Publik'
  },
  LKE_RESMI: {
    code: 'LKE_RESMI',
    label: 'LKE / LHE Resmi',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    iconName: 'FileSpreadsheet',
    description:
      'Lembar Kerja Evaluasi & Laporan Hasil Evaluasi TPI/KemenPAN-RB'
  },
  PEDOMAN: {
    code: 'PEDOMAN',
    label: 'Pedoman & Juknis',
    badgeClass:
      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    iconName: 'BookOpen',
    description: 'Peraturan MenPAN-RB, Petunjuk Teknis, dan Buku Saku BPS RI'
  }
};

// ==============================================================================
// REBO V2: Model Payload & Ringkasan Sinkronisasi ZIAPP
// ==============================================================================

export interface ZIAPPSyncItem {
  id_pertanyaan: string;
  kode_indikator: string;
  pilar_id: string;
  pilar_kode?: string;
  pilar_nama: string;
  subpilar_id?: string;
  subpilar_nama?: string;
  uraian_pertanyaan: string;
  uraian_singkat?: string;
  uraian_buktidukung?: string;
  nilai_mandiri: number;
  nilai_verifikasi: number;
  catatan_koordinator?: string | null;
  gdrive_folder_url?: string | null;
  public_drive_links?: string[];
  dokumen_files: Array<{
    id?: string;
    nama_dokumen: string;
    file_url: string;
    tipe_dokumen?: string | null;
  }>;
  ziapp_status: ZIAPPSyncStatus;
  ziapp_synced_at?: string | null;
  ziapp_synced_by?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  submitted_by_user_id?: string | null;
  submitted_by_name?: string | null;
}

export interface ZIAPPSyncPayload {
  metadata: {
    source: string;
    satker: string;
    kode_satker?: string;
    generated_at: string;
    periode: {
      id: string;
      tahun: number;
      nama_periode: string;
    };
    total_items: number;
    total_ready: number;
    total_synced: number;
    version: string;
  };
  items: ZIAPPSyncItem[];
}

export interface ZIAPPSyncSummary {
  periodeId: string;
  periodeNama: string;
  tahun: number;
  totalIndikator: number;
  totalDraft: number;
  totalVerifiedInternal: number;
  totalReadyForZIAPP: number;
  totalSyncedToZIAPP: number;
  persentaseSiapKirim: number;
  persentaseTersinkron: number;
  readyItems: ZIAPPSyncItem[];
  syncedItems: ZIAPPSyncItem[];
}

// ==============================================================================
// REBO V2: Showcase Inovasi Pelayanan Publik & Reformasi Birokrasi (Task 17)
// ==============================================================================

export type StatusInovasi = 'AKTIF' | 'RINTISAN' | 'PENGEMBANGAN';

export interface TestimoniInovasi {
  nama: string;
  instansi: string;
  kutipan: string;
  rating: number; // Skala 1 - 5 bintang
  jabatan?: string;
  avatar_url?: string;
  tanggal?: string;
}

export interface InovasiLayanan {
  id: string;
  nama_inovasi: string;
  ringkasan: string;
  pilar_terkait: string; // e.g. "Pilar 6 - Peningkatan Kualitas Pelayanan Publik"
  latar_belakang: string;
  solusi_inovasi: string;
  kondisi_sebelum: string;
  kondisi_sesudah: string;
  persentase_efisiensi: string | number; // e.g. "85%" atau 85
  jumlah_pengguna: number;
  testimoni: TestimoniInovasi[];
  link_dokumentasi: string;
  link_video?: string;
  status: StatusInovasi;
  created_at?: string;
  tagline?: string;
  kategori_manfaat?: string;
  penanggung_jawab?: string;
}

// ==============================================================================
// REBO V2: Survei IKM (Kepuasan Masyarakat) & IPAK (Persepsi Anti Korupsi) (Task 18)
// ==============================================================================

export interface UnsurIKMItem {
  unsur: string;
  skor: number; // Skala 1 - 4
  keterangan?: string;
  skor_konversi?: number; // Skala 100
}

export interface HasilSurveiPelayanan {
  id: string;
  periode_label: string; // e.g. "Semester I 2025", "Semester II 2025", "Semester I 2026"
  tahun?: number;
  semester?: 1 | 2;
  nilai_ikm: number; // Skala 4 (e.g. 3.84)
  nilai_ikm_konversi: number; // Konversi skala 100 (e.g. 96.00)
  mutu_ikm?: string; // e.g. "A (Sangat Baik)"
  nilai_ipak: number; // Skala 4 (e.g. 3.92)
  nilai_ipak_konversi: number; // Konversi skala 100 (e.g. 98.00)
  mutu_ipak?: string; // e.g. "Sangat Bersih"
  jumlah_responden: number;
  status_wbk: boolean;
  status_wbbm: boolean;
  unsur_ikm: { unsur: string; skor: number; keterangan?: string }[];
  catatan?: string;
  created_at?: string;
}

export interface SurveiSummaryData {
  surveiList: HasilSurveiPelayanan[];
  surveiTerbaru: HasilSurveiPelayanan;
  syaratWBK: {
    ikmMinimal: number; // 3.25
    ikmMinimalKonversi: number; // 81.25
    ipakMinimal: number; // 3.60
    ipakMinimalKonversi: number; // 90.00
    isIkmLolos: boolean;
    isIpakLolos: boolean;
    isLolosSemua: boolean;
  };
  syaratWBBM: {
    ikmMinimal: number; // 3.60
    ikmMinimalKonversi: number; // 90.00
    ipakMinimal: number; // 3.75
    ipakMinimalKonversi: number; // 93.75
    isIkmLolos: boolean;
    isIpakLolos: boolean;
    isLolosSemua: boolean;
  };
  trenPerkembangan: {
    periode: string;
    ikm: number;
    ipak: number;
    ikmKonversi: number;
    ipakKonversi: number;
    targetIkmWBK: number;
    targetIpakWBK: number;
    targetIkmWBBM: number;
    targetIpakWBBM: number;
  }[];
}

// ==============================================================================
// REBO V2: Matriks Mitigasi Risiko & SPIP (Pilar 5 Penguatan Pengawasan) (Task 19)
// ==============================================================================

export type TingkatRisiko = 'TINGGI' | 'SEDANG' | 'RENDAH';
export type StatusPengendalian =
  | 'TERKENDALI'
  | 'DALAM_PROSES'
  | 'MONITORING_BERKALA';

export interface MatriksRisikoItem {
  id: string;
  proses_bisnis: string; // misal: "Pelayanan Statistik Terpadu", "Pengadaan Barang & Jasa", "Pembayaran Honor Mitra Statistik", "Pengelolaan BMN", "Penetapan Angka Kredit/Kinerja"
  potensi_risiko: string;
  tingkat_risiko: TingkatRisiko;
  dampak_risiko: string;
  rencana_pengendalian: string;
  pic_pengendali: string;
  status_pengendalian: StatusPengendalian;
  bukti_dukung_url?: string;
  kategori_fraud?:
    | 'Pungli'
    | 'Gratifikasi'
    | 'Fraud Keuangan'
    | 'Penyalahgunaan Wewenang'
    | 'Kualitas Layanan'
    | 'Lainnya';
  created_at?: string;
  updated_at?: string;
}

export interface MatriksRisikoSummary {
  total: number;
  tinggi: number;
  sedang: number;
  rendah: number;
  terkendali: number;
  dalam_proses: number;
  monitoring: number;
}
