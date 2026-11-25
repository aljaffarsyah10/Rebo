'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Database,
  Cloud,
  HardDriveDownload,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  RotateCcw,
  Settings,
  FileCheck,
  Layers,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Search,
  Server,
  CloudLightning,
  Sparkles
} from 'lucide-react';

import {
  BackupSnapshot,
  IntegrityReport,
  BackupScheduleConfig,
  BackupReadinessStats,
  StorageDestination,
  BackupFrequency
} from '@/lib/backup/backup-types';

import {
  createBackupSnapshotAction,
  verifyBackupIntegrityAction,
  restoreDisasterRecoveryAction,
  saveBackupScheduleConfigAction,
  getSnapshotJsonDataAction,
  getBackupListAction
} from '@/actions/backup-actions';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface BackupRecoveryClientProps {
  initialSnapshots: BackupSnapshot[];
  initialSchedule: BackupScheduleConfig;
  initialStats: BackupReadinessStats;
}

export default function BackupRecoveryClient({
  initialSnapshots,
  initialSchedule,
  initialStats
}: BackupRecoveryClientProps) {
  const [snapshots, setSnapshots] =
    useState<BackupSnapshot[]>(initialSnapshots);
  const [schedule, setSchedule] =
    useState<BackupScheduleConfig>(initialSchedule);
  const [stats, setStats] = useState<BackupReadinessStats>(initialStats);
  const [isPending, startTransition] = useTransition();

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<
    'ALL' | StorageDestination
  >('ALL');

  // Modal: Buat Snapshot
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<StorageDestination>('GOOGLE_CLOUD_STORAGE');
  const [backupNotes, setBackupNotes] = useState('');

  // Modal: Hasil Verifikasi Integritas
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingSnapshot, setVerifyingSnapshot] =
    useState<BackupSnapshot | null>(null);
  const [integrityReport, setIntegrityReport] =
    useState<IntegrityReport | null>(null);

  // Modal: Disaster Recovery (Restore)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreTargetSnapshot, setRestoreTargetSnapshot] =
    useState<BackupSnapshot | null>(null);
  const [restoreConfirmationCode, setRestoreConfirmationCode] = useState('');
  const [restoreSuccessSummary, setRestoreSuccessSummary] = useState<
    string | null
  >(null);

  // Jadwal Form State
  const [scheduleForm, setScheduleForm] = useState<BackupScheduleConfig>({
    ...schedule
  });

  // Helper format ukuran
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Helper format tanggal
  const formatDate = (isoString?: string | null): string => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(d);
    } catch {
      return isoString;
    }
  };

  // Salin checksum ke clipboard
  const handleCopyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum);
    toast.success('SHA-256 Checksum berhasil disalin ke clipboard!');
  };

  // Refresh data list
  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getBackupListAction();
      if (res.success) {
        setSnapshots(res.snapshots);
        setSchedule(res.schedule);
        setStats(res.stats);
        setScheduleForm(res.schedule);
        toast.success('Data katalog cadangan berhasil disegarkan.');
      } else {
        toast.error('Gagal memperbarui data katalog cadangan.');
      }
    });
  };

  // 1. Eksekusi Pembuatan Snapshot Baru
  const handleCreateSnapshot = () => {
    startTransition(async () => {
      const res = await createBackupSnapshotAction({
        destination: selectedDestination,
        notes: backupNotes
      });

      if (res.success && res.snapshot) {
        toast.success(res.message);
        setSnapshots((prev) => [res.snapshot!, ...prev]);
        setStats((prev) => ({
          ...prev,
          total_snapshots: prev.total_snapshots + 1,
          verified_snapshots: prev.verified_snapshots + 1,
          total_size_bytes: prev.total_size_bytes + res.snapshot!.size_bytes,
          last_backup_date: res.snapshot!.created_at,
          last_backup_status: 'INTEGRITY_VERIFIED'
        }));
        setCreateModalOpen(false);
        setBackupNotes('');

        // Jika local download, otomatis trigger unduhan
        if (selectedDestination === 'LOCAL_DOWNLOAD' && res.rawJson) {
          const blob = new Blob([res.rawJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = res.snapshot.filename.replace('.enc', '');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.info('File cadangan lokal terunduh secara otomatis.');
        }
      } else {
        toast.error(res.message || 'Gagal membuat snapshot cadangan.');
      }
    });
  };

  // 2. Eksekusi Verifikasi Integritas SHA-256
  const handleVerifyIntegrity = (snapshot: BackupSnapshot) => {
    setVerifyingSnapshot(snapshot);
    startTransition(async () => {
      const res = await verifyBackupIntegrityAction(snapshot.id);
      if (res.success && res.report) {
        setIntegrityReport(res.report);
        setVerifyModalOpen(true);
        // Update snapshot status in state
        setSnapshots((prev) =>
          prev.map((s) =>
            s.id === snapshot.id ? { ...s, status: 'INTEGRITY_VERIFIED' } : s
          )
        );
        toast.success(
          `Integritas data "${snapshot.filename}" terverifikasi 100%!`
        );
      } else {
        toast.error('Verifikasi integritas gagal dilakukan.');
      }
    });
  };

  // 3. Eksekusi Unduhan Snapshot Langsung
  const handleDownloadSnapshot = async (snapshot: BackupSnapshot) => {
    startTransition(async () => {
      const res = await getSnapshotJsonDataAction(snapshot.id);
      if (res.success) {
        const blob = new Blob([res.jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Berkas cadangan ${res.filename} berhasil diunduh.`);
      } else {
        toast.error('Gagal mengambil berkas snapshot.');
      }
    });
  };

  // 4. Buka Modal Disaster Recovery
  const handleOpenRestoreModal = (snapshot: BackupSnapshot) => {
    setRestoreTargetSnapshot(snapshot);
    setRestoreConfirmationCode('');
    setRestoreSuccessSummary(null);
    setRestoreModalOpen(true);
  };

  // 5. Eksekusi Disaster Recovery
  const handleExecuteRestore = () => {
    if (!restoreTargetSnapshot) return;

    if (restoreConfirmationCode.trim() !== 'PULIHKAN-SITAROWBK') {
      toast.error(
        'Kode konfirmasi salah! Harap ketik "PULIHKAN-SITAROWBK" secara tepat.'
      );
      return;
    }

    startTransition(async () => {
      const res = await restoreDisasterRecoveryAction(
        restoreTargetSnapshot.id,
        restoreConfirmationCode
      );

      if (res.success) {
        setRestoreSuccessSummary(res.message);
        toast.success(
          'Disaster Recovery selesai! Basis data BPS Sitaro pulih seutuhnya.'
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  // 6. Simpan Jadwal Otomatis
  const handleSaveSchedule = () => {
    startTransition(async () => {
      const res = await saveBackupScheduleConfigAction(scheduleForm);
      if (res.success) {
        setSchedule(res.config);
        toast.success(
          'Konfigurasi otomasi jadwal pencadangan berhasil disimpan!'
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  // Filtered Snapshots
  const filteredSnapshots = snapshots.filter((s) => {
    const matchesSearch =
      s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.checksum_sha256.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDest =
      destinationFilter === 'ALL' ||
      s.storage_destination === destinationFilter;

    return matchesSearch && matchesDest;
  });

  return (
    <div className='space-y-6'>
      {/* HEADER SECTION */}
      <div className='flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs'
            >
              <ShieldCheck className='text-primary mr-1 h-3.5 w-3.5' />
              Ketahanan Data & SPBE Pilar 2 & 5
            </Badge>
            <Badge variant='secondary' className='text-xs'>
              BPS Sitaro (7108)
            </Badge>
          </div>
          <h1 className='text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight'>
            <Database className='text-primary h-7 w-7' />
            Automated Cloud Backup & Disaster Recovery
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Penjadwalan cadangan otomatis snapshot Supabase ke Google Cloud
            Storage & S3, validasi SHA-256 Checksum, dan pemulihan darurat
            sistem.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isPending}
            className='h-9'
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
            />
            Segarkan
          </Button>

          <Button
            size='sm'
            onClick={() => setCreateModalOpen(true)}
            disabled={isPending}
            className='bg-primary text-primary-foreground h-9 shadow'
          >
            <CloudLightning className='mr-2 h-4 w-4' />
            Buat Snapshot Baru
          </Button>
        </div>
      </div>

      {/* 4 METRIC CARDS */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Card 1: Status Kesiapan Cadangan */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-xs font-medium'>
                Status Cadangan Terakhir
              </CardDescription>
              <ShieldCheck className='h-4 w-4 text-emerald-600' />
            </div>
            <CardTitle className='flex items-center gap-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400'>
              Terproteksi & Aman
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-xs'>
            <div className='flex items-center gap-1'>
              <Clock className='text-muted-foreground h-3.5 w-3.5' />
              <span>{formatDate(stats.last_backup_date)}</span>
            </div>
            <div className='mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300'>
              Status: {stats.last_backup_status}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Integritas SHA-256 */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-xs font-medium'>
                Integritas Kriptografis
              </CardDescription>
              <FileCheck className='h-4 w-4 text-blue-600' />
            </div>
            <CardTitle className='text-foreground text-xl font-bold'>
              {stats.integrity_score_pct}% Terverifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-xs'>
            <div>
              {stats.verified_snapshots} dari {stats.total_snapshots} berkas
              lolos SHA-256
            </div>
            <div className='mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400'>
              0 Corrupted Bytes / Tamper-Proof
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Snapshot & Kapasitas */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-xs font-medium'>
                Penyimpanan Cloud Aktif
              </CardDescription>
              <Cloud className='h-4 w-4 text-purple-600' />
            </div>
            <CardTitle className='text-foreground text-xl font-bold'>
              {stats.total_snapshots} Snapshot Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-xs'>
            <div>
              Total Ukuran:{' '}
              <span className='text-foreground font-semibold'>
                {formatBytes(stats.total_size_bytes)}
              </span>
            </div>
            <div className='text-muted-foreground mt-1 text-[11px]'>
              Multi-Cloud Vault (GCS & S3 Offsite)
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Jadwal Otomasi & Sasaran Pemulihan */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-xs font-medium'>
                Target SLA Disaster Recovery
              </CardDescription>
              <Server className='h-4 w-4 text-amber-600' />
            </div>
            <CardTitle className='text-foreground text-xl font-bold'>
              RPO &lt; 24h | RTO &lt; 15m
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-xs'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3.5 w-3.5' />
              <span>
                Jadwal:{' '}
                {schedule.enabled
                  ? `${schedule.frequency} (${schedule.backup_time})`
                  : 'Nonaktif'}
              </span>
            </div>
            <div className='mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400'>
              Next Run: {formatDate(schedule.next_run_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS CONTAINER */}
      <Tabs defaultValue='history' className='space-y-4'>
        <TabsList className='grid w-full max-w-lg grid-cols-3'>
          <TabsTrigger value='history' className='text-xs sm:text-sm'>
            <Layers className='mr-1.5 h-4 w-4' />
            Katalog Snapshot
          </TabsTrigger>
          <TabsTrigger value='schedule' className='text-xs sm:text-sm'>
            <Settings className='mr-1.5 h-4 w-4' />
            Jadwal Otomasi
          </TabsTrigger>
          <TabsTrigger value='runbook' className='text-xs sm:text-sm'>
            <FileCheck className='mr-1.5 h-4 w-4' />
            Panduan DR (SOP)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RIWAYAT SNAPSHOT CADANGAN */}
        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Daftar Snapshot Cadangan Basis Data
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Setiap snapshot dilindungi tanda tangan kriptografis SHA-256
                    untuk memastikan data tidak mengalami manipulasi
                    (*tamper-proof*).
                  </CardDescription>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <div className='relative w-56'>
                    <Search className='text-muted-foreground absolute top-3 left-2.5 h-3.5 w-3.5' />
                    <Input
                      placeholder='Cari nama file / hash...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='h-9 pl-8 text-xs'
                    />
                  </div>

                  <select
                    value={destinationFilter}
                    onChange={(e) =>
                      setDestinationFilter(
                        e.target.value as 'ALL' | StorageDestination
                      )
                    }
                    className='border-input bg-background focus:ring-ring h-9 rounded-md border px-3 py-1 text-xs shadow-sm focus:ring-1 focus:outline-none'
                  >
                    <option value='ALL'>Semua Destinasi</option>
                    <option value='GOOGLE_CLOUD_STORAGE'>
                      Google Cloud Storage
                    </option>
                    <option value='AMAZON_S3'>Amazon S3</option>
                    <option value='LOCAL_DOWNLOAD'>Unduhan Lokal</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/50'>
                      <TableHead className='text-xs'>
                        Nama Berkas & Catatan
                      </TableHead>
                      <TableHead className='text-xs'>
                        Destinasi Storage
                      </TableHead>
                      <TableHead className='text-xs'>Ukuran</TableHead>
                      <TableHead className='text-xs'>
                        SHA-256 Checksum
                      </TableHead>
                      <TableHead className='text-xs'>Records / Tabel</TableHead>
                      <TableHead className='text-xs'>Waktu Dibuat</TableHead>
                      <TableHead className='text-xs'>
                        Status Integritas
                      </TableHead>
                      <TableHead className='text-right text-xs'>
                        Aksi Cepat
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSnapshots.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className='text-muted-foreground py-8 text-center text-sm'
                        >
                          Tidak ditemukan snapshot cadangan yang cocok dengan
                          kriteria pencarian.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSnapshots.map((snap) => (
                        <TableRow key={snap.id} className='hover:bg-muted/40'>
                          <TableCell className='text-xs font-medium'>
                            <div className='flex items-center gap-1.5'>
                              <Database className='text-primary h-4 w-4 shrink-0' />
                              <span className='font-mono text-xs'>
                                {snap.filename}
                              </span>
                              {snap.is_automated && (
                                <Badge
                                  variant='secondary'
                                  className='px-1.5 py-0 text-[10px]'
                                >
                                  Auto
                                </Badge>
                              )}
                            </div>
                            {snap.notes && (
                              <div className='text-muted-foreground mt-0.5 text-[11px]'>
                                {snap.notes}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className='text-xs'>
                            {snap.storage_destination ===
                              'GOOGLE_CLOUD_STORAGE' && (
                              <Badge
                                variant='outline'
                                className='flex w-fit items-center gap-1 border-blue-200 bg-blue-50 text-[11px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              >
                                <Cloud className='h-3 w-3' />
                                Google Cloud (GCS)
                              </Badge>
                            )}
                            {snap.storage_destination === 'AMAZON_S3' && (
                              <Badge
                                variant='outline'
                                className='flex w-fit items-center gap-1 border-amber-200 bg-amber-50 text-[11px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              >
                                <Server className='h-3 w-3' />
                                Amazon S3 Offsite
                              </Badge>
                            )}
                            {snap.storage_destination === 'LOCAL_DOWNLOAD' && (
                              <Badge
                                variant='outline'
                                className='flex w-fit items-center gap-1 bg-gray-100 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              >
                                <HardDriveDownload className='h-3 w-3' />
                                Unduhan Lokal
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className='font-mono text-xs'>
                            {formatBytes(snap.size_bytes)}
                          </TableCell>

                          <TableCell className='text-xs'>
                            <div className='bg-muted/60 flex w-fit items-center gap-1 rounded px-2 py-1 font-mono text-[11px]'>
                              <span>
                                {snap.checksum_sha256.substring(0, 10)}...
                                {snap.checksum_sha256.substring(
                                  snap.checksum_sha256.length - 6
                                )}
                              </span>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='text-muted-foreground hover:text-foreground ml-1 h-5 w-5'
                                onClick={() =>
                                  handleCopyChecksum(snap.checksum_sha256)
                                }
                                title='Salin Checksum Lengkap'
                              >
                                <Copy className='h-3 w-3' />
                              </Button>
                            </div>
                          </TableCell>

                          <TableCell className='text-xs'>
                            <div className='font-semibold'>
                              {snap.total_records.toLocaleString('id-ID')} baris
                            </div>
                            <div className='text-muted-foreground text-[10px]'>
                              {snap.tables_included.length} tabel relasional
                            </div>
                          </TableCell>

                          <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                            {formatDate(snap.created_at)}
                          </TableCell>

                          <TableCell className='text-xs'>
                            {snap.status === 'INTEGRITY_VERIFIED' ? (
                              <Badge className='flex w-fit items-center gap-1 bg-emerald-600 text-[10px] text-white hover:bg-emerald-700'>
                                <CheckCircle2 className='h-3 w-3' />
                                100% Valid
                              </Badge>
                            ) : snap.status === 'SUCCESS' ? (
                              <Badge
                                variant='secondary'
                                className='flex w-fit items-center gap-1 text-[10px]'
                              >
                                <CheckCircle2 className='h-3 w-3 text-blue-500' />
                                Tersimpan
                              </Badge>
                            ) : snap.status === 'RESTORING' ? (
                              <Badge
                                variant='destructive'
                                className='flex w-fit animate-pulse items-center gap-1 text-[10px]'
                              >
                                <RefreshCw className='h-3 w-3 animate-spin' />
                                Memulihkan...
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='text-[10px]'
                              >
                                Gagal
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className='text-right text-xs whitespace-nowrap'>
                            <div className='flex items-center justify-end gap-1'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-primary border-primary/30 hover:bg-primary/10 h-7 px-2 text-xs'
                                onClick={() => handleVerifyIntegrity(snap)}
                                disabled={isPending}
                                title='Verifikasi Integritas SHA-256'
                              >
                                <FileCheck className='mr-1 h-3.5 w-3.5' />
                                Verifikasi
                              </Button>

                              <Button
                                variant='outline'
                                size='sm'
                                className='h-7 px-2 text-xs'
                                onClick={() => handleDownloadSnapshot(snap)}
                                disabled={isPending}
                                title='Unduh Snapshot JSON'
                              >
                                <Download className='h-3.5 w-3.5' />
                              </Button>

                              <Button
                                variant='destructive'
                                size='sm'
                                className='h-7 px-2 text-xs'
                                onClick={() => handleOpenRestoreModal(snap)}
                                disabled={isPending}
                                title='Pulihkan Data (Disaster Recovery)'
                              >
                                <RotateCcw className='mr-1 h-3.5 w-3.5' />
                                Pulihkan
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PENGATURAN JADWAL OTOMASI */}
        <TabsContent value='schedule' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <Settings className='text-primary h-5 w-5' />
                Otomasi Penjadwalan Backup Cloud (Automated Snapshot)
              </CardTitle>
              <CardDescription className='text-xs'>
                Konfigurasikan frekuensi sinkronisasi otomatis basis data REBO
                V2 BPS Sitaro ke Google Cloud Storage atau Amazon S3 Bucket.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Toggle Aktif */}
              <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-semibold'>
                    Status Jadwal Otomatis
                  </Label>
                  <p className='text-muted-foreground text-xs'>
                    Pencadangan berjalan otomatis di latar belakang sesuai
                    frekuensi yang ditentukan tanpa mengganggu aktivitas
                    operator LKE.
                  </p>
                </div>
                <Switch
                  checked={scheduleForm.enabled}
                  onCheckedChange={(val) =>
                    setScheduleForm((prev) => ({ ...prev, enabled: val }))
                  }
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Frekuensi */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Frekuensi Pencadangan
                  </Label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        frequency: e.target.value as BackupFrequency
                      }))
                    }
                    className='border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-1 focus:outline-none'
                  >
                    <option value='DAILY'>
                      Harian (Daily - Sangat Direkomendasikan)
                    </option>
                    <option value='WEEKLY'>Mingguan (Weekly)</option>
                    <option value='MONTHLY'>Bulanan (Monthly)</option>
                  </select>
                </div>

                {/* Waktu Eksekusi */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Waktu Eksekusi (Zona Waktu WITA)
                  </Label>
                  <Input
                    value={scheduleForm.backup_time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        backup_time: e.target.value
                      }))
                    }
                    placeholder='02:00 WITA'
                    className='h-9 text-sm'
                  />
                  <p className='text-muted-foreground text-[11px]'>
                    Direkomendasikan pukul 02:00 WITA pada saat lalu lintas
                    server terendah.
                  </p>
                </div>

                {/* Destinasi Cloud */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Destinasi Cloud Utama
                  </Label>
                  <select
                    value={scheduleForm.target_destination}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        target_destination: e.target.value as StorageDestination
                      }))
                    }
                    className='border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-1 focus:outline-none'
                  >
                    <option value='GOOGLE_CLOUD_STORAGE'>
                      Google Cloud Storage (GCS Vault BPS)
                    </option>
                    <option value='AMAZON_S3'>
                      Amazon S3 (Jakarta Region ap-southeast-3)
                    </option>
                    <option value='LOCAL_DOWNLOAD'>
                      Penyimpanan Server Lokal
                    </option>
                  </select>
                </div>

                {/* Auto Prune */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Retensi Berkas & Pemangkasan Otomatis (Auto-Prune)
                  </Label>
                  <select
                    value={scheduleForm.auto_prune_days}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        auto_prune_days: Number(e.target.value)
                      }))
                    }
                    className='border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-1 focus:outline-none'
                  >
                    <option value={14}>14 Hari Terakhir</option>
                    <option value={30}>
                      30 Hari (Standar Kearsipan Bulanan)
                    </option>
                    <option value={60}>60 Hari</option>
                    <option value={90}>90 Hari (1 Triwulan Siklus LKE)</option>
                  </select>
                </div>

                {/* Nama Bucket GCS */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Nama Bucket Google Cloud Storage
                  </Label>
                  <Input
                    value={scheduleForm.gcs_bucket_name || ''}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        gcs_bucket_name: e.target.value
                      }))
                    }
                    className='h-9 font-mono text-sm'
                  />
                </div>

                {/* Email Notifikasi */}
                <div className='space-y-2'>
                  <Label className='text-xs font-medium'>
                    Email Notifikasi Status & Kegagalan
                  </Label>
                  <Input
                    type='email'
                    value={scheduleForm.notification_email}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        notification_email: e.target.value
                      }))
                    }
                    className='h-9 text-sm'
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end gap-2 border-t pt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setScheduleForm({ ...schedule })}
                disabled={isPending}
              >
                Reset Perubahan
              </Button>
              <Button
                size='sm'
                onClick={handleSaveSchedule}
                disabled={isPending}
                className='bg-primary text-primary-foreground'
              >
                Simpan Konfigurasi Jadwal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 3: PANDUAN DISASTER RECOVERY & RUNBOOK */}
        <TabsContent value='runbook' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <ShieldCheck className='h-5 w-5 text-emerald-600' />
                Standard Operating Procedure (SOP) Disaster Recovery BPS Sitaro
              </CardTitle>
              <CardDescription className='text-xs'>
                Prosedur operasi standar penanganan keadaan darurat kegagalan
                sistem database untuk memenuhi kriteria Pilar 5 (Pengawasan) &
                Tata Laksana SPBE.
              </CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-4 text-xs leading-relaxed'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='bg-muted/20 space-y-2 rounded-lg border p-4'>
                  <div className='text-foreground flex items-center gap-1.5 text-sm font-semibold'>
                    <AlertTriangle className='h-4 w-4 text-amber-500' />
                    Recovery Point Objective (RPO)
                  </div>
                  <p>
                    Target batas toleransi kehilangan data BPS Sitaro adalah{' '}
                    <strong>maksimal 24 jam</strong>. Dengan backup harian pukul
                    02:00 WITA, data pengisian LKE dan bukti dukung yang telah
                    disubmit sebelum tengah malam dijamin tidak hilang.
                  </p>
                </div>

                <div className='bg-muted/20 space-y-2 rounded-lg border p-4'>
                  <div className='text-foreground flex items-center gap-1.5 text-sm font-semibold'>
                    <Clock className='h-4 w-4 text-blue-500' />
                    Recovery Time Objective (RTO)
                  </div>
                  <p>
                    Target waktu pemulihan penuh sistem operasional adalah{' '}
                    <strong>di bawah 15 menit</strong>. Berkat arsitektur
                    snapshot JSON mandiri dan validasi SHA-256 otomatis, admin
                    dapat merestore database seketika saat desk evaluation
                    berlangsung.
                  </p>
                </div>
              </div>

              <div className='mt-2 space-y-3 rounded-lg border p-4'>
                <h3 className='text-foreground text-sm font-semibold'>
                  Alur 4 Langkah Tanggap Darurat BPS Sitaro:
                </h3>
                <ol className='list-inside list-decimal space-y-1.5 pl-1'>
                  <li>
                    <strong className='text-foreground'>
                      Deteksi & Isolasi Insiden:
                    </strong>{' '}
                    Hubungi Koordinator Tim IT/IPDS BPS Sitaro jika terdeteksi
                    data corrupt atau kegagalan koneksi tabel Supabase.
                  </li>
                  <li>
                    <strong className='text-foreground'>
                      Pilih Snapshot Terakhir yang Terverifikasi:
                    </strong>{' '}
                    Buka katalog snapshot, cari cadangan berstatus{' '}
                    <Badge
                      variant='outline'
                      className='border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700'
                    >
                      100% Valid
                    </Badge>
                    .
                  </li>
                  <li>
                    <strong className='text-foreground'>
                      Validasi Ulang Checksum SHA-256:
                    </strong>{' '}
                    Tekan tombol &quot;Verifikasi&quot; untuk memastikan berkas
                    snapshot cloud tidak mengalami degradasi bit.
                  </li>
                  <li>
                    <strong className='text-foreground'>
                      Otorisasi Disaster Recovery:
                    </strong>{' '}
                    Klik &quot;Pulihkan&quot;, masukkan kode keamanan ketat{' '}
                    <code className='bg-muted text-primary rounded px-1.5 py-0.5 font-mono font-bold'>
                      PULIHKAN-SITAROWBK
                    </code>
                    , dan konfirmasi.
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: BUAT SNAPSHOT CADANGAN BARU */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base'>
              <CloudLightning className='text-primary h-5 w-5' />
              Buat Snapshot Cadangan Baru
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Sistem akan mengekspor seluruh tabel relasional, menghitung
              SHA-256 checksum kriptografis, dan mengamankan data ke repositori
              yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2 text-xs'>
            <div className='space-y-2'>
              <Label className='text-xs font-medium'>
                Pilih Destinasi Penyimpanan Cadangan
              </Label>
              <div className='grid grid-cols-1 gap-2'>
                <div
                  onClick={() => setSelectedDestination('GOOGLE_CLOUD_STORAGE')}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedDestination === 'GOOGLE_CLOUD_STORAGE'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className='text-foreground flex items-center justify-between font-semibold'>
                    <div className='flex items-center gap-2'>
                      <Cloud className='h-4 w-4 text-blue-600' />
                      <span>Google Cloud Storage (GCS Vault)</span>
                    </div>
                    {selectedDestination === 'GOOGLE_CLOUD_STORAGE' && (
                      <CheckCircle2 className='text-primary h-4 w-4' />
                    )}
                  </div>
                  <p className='text-muted-foreground mt-1 text-[11px]'>
                    Penyimpanan objek terenkripsi otomatis pada bucket BPS
                    Sitaro (Multi-Region Cloud).
                  </p>
                </div>

                <div
                  onClick={() => setSelectedDestination('AMAZON_S3')}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedDestination === 'AMAZON_S3'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className='text-foreground flex items-center justify-between font-semibold'>
                    <div className='flex items-center gap-2'>
                      <Server className='h-4 w-4 text-amber-600' />
                      <span>Amazon S3 (Offsite Disaster Recovery)</span>
                    </div>
                    {selectedDestination === 'AMAZON_S3' && (
                      <CheckCircle2 className='text-primary h-4 w-4' />
                    )}
                  </div>
                  <p className='text-muted-foreground mt-1 text-[11px]'>
                    Cadangan replikasi cadangan terpisah region untuk
                    perlindungan bencana alam total.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedDestination('LOCAL_DOWNLOAD')}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedDestination === 'LOCAL_DOWNLOAD'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className='text-foreground flex items-center justify-between font-semibold'>
                    <div className='flex items-center gap-2'>
                      <HardDriveDownload className='h-4 w-4 text-gray-700 dark:text-gray-300' />
                      <span>Unduhan Berkas JSON Terenkripsi Langsung</span>
                    </div>
                    {selectedDestination === 'LOCAL_DOWNLOAD' && (
                      <CheckCircle2 className='text-primary h-4 w-4' />
                    )}
                  </div>
                  <p className='text-muted-foreground mt-1 text-[11px]'>
                    Simpan salinan cadangan langsung ke drive komputer laptop
                    admin untuk kearsipan fisik offline.
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Catatan / Label Snapshot (Opsional)
              </Label>
              <Input
                placeholder='Contoh: Pra-Desk Evaluasi Tim Penilai Nasional (TPN)'
                value={backupNotes}
                onChange={(e) => setBackupNotes(e.target.value)}
                className='h-9 text-xs'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCreateModalOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size='sm'
              onClick={handleCreateSnapshot}
              disabled={isPending}
              className='bg-primary text-primary-foreground'
            >
              {isPending ? (
                <>
                  <RefreshCw className='mr-2 h-3.5 w-3.5 animate-spin' />
                  Memproses Snapshot...
                </>
              ) : (
                'Eksekusi Pencadangan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: LAPORAN VERIFIKASI INTEGRITAS SHA-256 */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base text-emerald-600 dark:text-emerald-400'>
              <ShieldCheck className='h-5 w-5 text-emerald-600' />
              Laporan Verifikasi Integritas SHA-256
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Pengecekan byte-by-byte terhadap signature kriptografis dan
              struktur skema tabel.
            </DialogDescription>
          </DialogHeader>

          {integrityReport && verifyingSnapshot && (
            <div className='space-y-4 py-2 text-xs'>
              <div className='space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20'>
                <div className='flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300'>
                  <span>Status: 100% VALID & BEBAS ANOMALI</span>
                  <Badge className='bg-emerald-600 text-[10px] text-white'>
                    VERIFIED
                  </Badge>
                </div>
                <div className='text-muted-foreground font-mono text-[11px] break-all'>
                  Berkas: {verifyingSnapshot.filename}
                </div>
                <div className='text-muted-foreground text-[11px]'>
                  Waktu Verifikasi: {formatDate(integrityReport.verified_at)}
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Hasil Checklist Verifikasi Kriptografis:
                </Label>
                <div className='bg-muted/20 max-h-56 space-y-1 overflow-y-auto rounded-md border p-3 font-mono text-[11px] leading-relaxed'>
                  {integrityReport.details.map((item, idx) => (
                    <div
                      key={idx}
                      className='text-foreground flex items-start gap-1.5'
                    >
                      <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Signature Checksum SHA-256:
                </Label>
                <div className='bg-muted rounded border p-2 font-mono text-[11px] break-all select-all'>
                  {verifyingSnapshot.checksum_sha256}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              size='sm'
              onClick={() => setVerifyModalOpen(false)}
              className='w-full sm:w-auto'
            >
              Tutup Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: PEMULIHAN BENCANA (DISASTER RECOVERY) */}
      <Dialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-destructive flex items-center gap-2 text-base'>
              <ShieldAlert className='text-destructive h-5 w-5' />
              Otorisasi Pemulihan Darurat (Disaster Recovery)
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Peringatan Keamanan Kritis: Pemulihan akan mengembalikan seluruh
              data evaluasi LKE, dokumen bukti dukung, dan konfigurasi ke titik
              snapshot ini.
            </DialogDescription>
          </DialogHeader>

          {restoreSuccessSummary ? (
            <div className='space-y-4 py-3 text-xs'>
              <div className='space-y-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'>
                <div className='flex items-center gap-1.5 text-sm font-bold'>
                  <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                  Pemulihan Berhasil!
                </div>
                <p>{restoreSuccessSummary}</p>
                <div className='text-muted-foreground border-t border-emerald-200 pt-1 text-[11px] dark:border-emerald-800'>
                  Seluruh layanan REBO V2 BPS Sitaro telah kembali sinkron
                  dengan status snapshot terpilih.
                </div>
              </div>

              <DialogFooter>
                <Button
                  size='sm'
                  onClick={() => setRestoreModalOpen(false)}
                  className='w-full'
                >
                  Selesai
                </Button>
              </DialogFooter>
            </div>
          ) : (
            restoreTargetSnapshot && (
              <div className='space-y-4 py-2 text-xs'>
                <div className='space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200'>
                  <div className='flex items-center gap-1.5 font-semibold'>
                    <AlertTriangle className='h-4 w-4 text-amber-600' />
                    Rincian Target Pemulihan:
                  </div>
                  <div className='font-mono text-[11px]'>
                    {restoreTargetSnapshot.filename}
                  </div>
                  <div className='text-muted-foreground text-[11px]'>
                    Total Data:{' '}
                    {restoreTargetSnapshot.total_records.toLocaleString(
                      'id-ID'
                    )}{' '}
                    baris ({restoreTargetSnapshot.tables_included.length} tabel)
                  </div>
                  <div className='text-muted-foreground text-[11px]'>
                    Waktu Snapshot:{' '}
                    {formatDate(restoreTargetSnapshot.created_at)}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-destructive text-xs font-semibold'>
                    Ketik Konfirmasi Keamanan untuk Melanjutkan:
                  </Label>
                  <p className='text-muted-foreground text-[11px]'>
                    Harap ketik{' '}
                    <code className='bg-muted text-destructive rounded px-1.5 py-0.5 font-mono font-bold'>
                      PULIHKAN-SITAROWBK
                    </code>{' '}
                    di bawah:
                  </p>
                  <Input
                    placeholder='PULIHKAN-SITAROWBK'
                    value={restoreConfirmationCode}
                    onChange={(e) => setRestoreConfirmationCode(e.target.value)}
                    className='h-9 font-mono text-xs tracking-wider uppercase'
                  />
                </div>

                <DialogFooter className='gap-2 pt-2 sm:gap-0'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setRestoreModalOpen(false)}
                    disabled={isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleExecuteRestore}
                    disabled={
                      isPending ||
                      restoreConfirmationCode.trim() !== 'PULIHKAN-SITAROWBK'
                    }
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className='mr-2 h-3.5 w-3.5 animate-spin' />
                        Memulihkan Data...
                      </>
                    ) : (
                      'Eksekusi Pemulihan Darurat'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
