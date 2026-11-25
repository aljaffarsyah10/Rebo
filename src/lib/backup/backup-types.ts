export type StorageDestination =
  | 'LOCAL_DOWNLOAD'
  | 'GOOGLE_CLOUD_STORAGE'
  | 'AMAZON_S3';

export type BackupStatus =
  | 'SUCCESS'
  | 'INTEGRITY_VERIFIED'
  | 'FAILED'
  | 'RESTORING';

export type BackupFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface BackupSnapshot {
  id: string;
  filename: string;
  storage_destination: StorageDestination;
  size_bytes: number;
  checksum_sha256: string;
  status: BackupStatus;
  total_records: number;
  tables_included: string[];
  created_at: string;
  is_automated: boolean;
  storage_path?: string;
  notes?: string;
  environment?: string;
}

export interface IntegrityReport {
  isValid: boolean;
  recordCountMatch: boolean;
  schemaMatch: boolean;
  checksumValid: boolean;
  details: string[];
  verified_at: string;
  snapshot_id?: string;
  computed_checksum?: string;
  expected_checksum?: string;
}

export interface BackupScheduleConfig {
  enabled: boolean;
  frequency: BackupFrequency;
  target_destination: StorageDestination;
  auto_prune_days: number;
  backup_time: string;
  retention_copies: number;
  last_run_at: string | null;
  next_run_at: string | null;
  notify_on_failure: boolean;
  notification_email: string;
  gcs_bucket_name?: string;
  s3_bucket_name?: string;
}

export interface BackupReadinessStats {
  total_snapshots: number;
  verified_snapshots: number;
  total_size_bytes: number;
  last_backup_date: string | null;
  last_backup_status: BackupStatus | 'NONE';
  integrity_score_pct: number;
  rpo_hours: number;
  rto_minutes: number;
}

export interface BackupPayloadData {
  metadata: {
    satker_code: string;
    satker_name: string;
    app_version: string;
    environment: string;
    exported_at: string;
    checksum_sha256: string;
    total_records: number;
  };
  tables: {
    name: string;
    record_count: number;
    columns: string[];
    sample_records: Record<string, unknown>[];
  }[];
}

/**
 * Mock data realistis 4 snapshot cadangan data BPS Kabupaten Kepulauan Sitaro 2026
 */
export const MOCK_BACKUP_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'snap-20261124-0200',
    filename: 'rebo_sitaro_prod_snapshot_20261124_020000.json.enc',
    storage_destination: 'GOOGLE_CLOUD_STORAGE',
    size_bytes: 4281920, // ~4.08 MB
    checksum_sha256:
      'c8e9b6a15d7f8c4e2098d1a4e523f66c1b3f9408e01b7a2d46e91f1c7d853e02',
    status: 'INTEGRITY_VERIFIED',
    total_records: 1482,
    tables_included: [
      'profiles',
      'lke_evaluasi',
      'bukti_dukung',
      'pilar_weights',
      'audit_logs',
      'broadcast_logs',
      'wbs_reports',
      'satker_config',
      'inovasi_rb'
    ],
    created_at: '2026-11-24T02:00:00+08:00',
    is_automated: true,
    storage_path:
      'gs://bps-sitaro-backup-vault/daily/2026-11-24/rebo_sitaro_prod_snapshot_20261124_020000.json.enc',
    notes: 'Jadwal Otomatis Harian - Siklus Evaluasi ZI WBK 2026',
    environment: 'production'
  },
  {
    id: 'snap-20261120-0000',
    filename: 'rebo_sitaro_prod_snapshot_20261120_000000.json.enc',
    storage_destination: 'AMAZON_S3',
    size_bytes: 4195104, // ~4.00 MB
    checksum_sha256:
      '9a4b8c3d7e1f5a6b0c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    status: 'SUCCESS',
    total_records: 1460,
    tables_included: [
      'profiles',
      'lke_evaluasi',
      'bukti_dukung',
      'pilar_weights',
      'audit_logs',
      'broadcast_logs',
      'wbs_reports',
      'satker_config',
      'inovasi_rb'
    ],
    created_at: '2026-11-20T00:00:00+08:00',
    is_automated: true,
    storage_path:
      's3://bps-sitaro-disaster-recovery-ap-southeast-3/weekly/rebo_sitaro_prod_snapshot_20261120_000000.json.enc',
    notes: 'Jadwal Otomatis Mingguan - Multi-Region Offsite Backup',
    environment: 'production'
  },
  {
    id: 'snap-20261115-1430',
    filename: 'rebo_sitaro_pra_evaluasi_tpi_20261115_143000.json.enc',
    storage_destination: 'LOCAL_DOWNLOAD',
    size_bytes: 3982410, // ~3.80 MB
    checksum_sha256:
      '3f1b4c9e8a7d6e5c2b0a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c',
    status: 'INTEGRITY_VERIFIED',
    total_records: 1412,
    tables_included: [
      'profiles',
      'lke_evaluasi',
      'bukti_dukung',
      'pilar_weights',
      'audit_logs',
      'satker_config'
    ],
    created_at: '2026-11-15T14:30:00+08:00',
    is_automated: false,
    storage_path:
      'local://encrypted-downloads/rebo_sitaro_pra_evaluasi_tpi_20261115_143000.json.enc',
    notes: 'Snapshot Manual Pra-Desk Evaluation TPI BPS RI',
    environment: 'production'
  },
  {
    id: 'snap-20261101-0100',
    filename: 'rebo_sitaro_arsip_bulanan_20261101_010000.json.enc',
    storage_destination: 'GOOGLE_CLOUD_STORAGE',
    size_bytes: 3840120, // ~3.66 MB
    checksum_sha256:
      '7e2a9d4f1c6b8e0a3d5f7b9c1e3a5d7f9b1c3e5a7d9f1b3c5e7a9d1f3b5c7e9a',
    status: 'SUCCESS',
    total_records: 1380,
    tables_included: [
      'profiles',
      'lke_evaluasi',
      'bukti_dukung',
      'pilar_weights',
      'audit_logs',
      'wbs_reports',
      'satker_config'
    ],
    created_at: '2026-11-01T01:00:00+08:00',
    is_automated: true,
    storage_path:
      'gs://bps-sitaro-backup-vault/monthly/2026-11/rebo_sitaro_arsip_bulanan_20261101_010000.json.enc',
    notes: 'Jadwal Otomatis Bulanan - Rekonsiliasi Arsip Permanen',
    environment: 'production'
  }
];

export const DEFAULT_BACKUP_SCHEDULE: BackupScheduleConfig = {
  enabled: true,
  frequency: 'DAILY',
  target_destination: 'GOOGLE_CLOUD_STORAGE',
  auto_prune_days: 30,
  backup_time: '02:00 WITA',
  retention_copies: 14,
  last_run_at: '2026-11-24T02:00:00+08:00',
  next_run_at: '2026-11-25T02:00:00+08:00',
  notify_on_failure: true,
  notification_email: 'bps7108@bps.go.id',
  gcs_bucket_name: 'bps-sitaro-backup-vault',
  s3_bucket_name: 'bps-sitaro-disaster-recovery-ap-southeast-3'
};
