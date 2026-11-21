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
// REBO V2: Core Database Entities
// ==============================================================================

export interface PeriodeEvaluasi {
  id: string;
  tahun: number;
  nama_periode: string;
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
  created_at?: string;
  updated_at?: string;

  // Joined relations
  periode?: PeriodeEvaluasi | null;
  pertanyaan?: Pertanyaan | null;
  kategoriPenilaian?: KategoriPenilaian | null;
  dokumen_bukti?: DokumenBukti[];
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
  nilai_mandiri: number;
  nilai_verifikasi: number;
  nilai_maksimal: number;
  gdrive_folder_url?: string | null;
  total_dokumen: number;
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
