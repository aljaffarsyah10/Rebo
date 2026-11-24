'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  History,
  FileCheck2,
  AlertOctagon,
  UploadCloud,
  FolderSync,
  Clock,
  Users,
  Folder,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Calendar,
  Filter
} from 'lucide-react';
import { getAuditLogsAction } from '@/actions/audit-actions';
import {
  ROLE_LABELS,
  ROLE_BADGE_CLASSES,
  type UserRole
} from '@/lib/auth/rbac';
import type { AuditLog } from '@/types/rebo';
import { toast } from 'sonner';

interface AuditLogClientProps {
  initialLogs: AuditLog[];
  initialTotal: number;
  initialActionStats: Record<string, number>;
  initialRoleStats?: Record<string, number>;
  isFallbackData?: boolean;
}

/**
 * Format tanggal dan waktu ke bahasa Indonesia yang ramah pembaca
 */
function formatIndonesianDateTime(isoString?: string): {
  date: string;
  time: string;
} {
  if (!isoString) return { date: '-', time: '-' };
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return { date: dateStr, time: `${timeStr} WIB` };
  } catch {
    return { date: isoString, time: '' };
  }
}

/**
 * Pemetaan warna dan ikon semantik untuk setiap tipe aksi
 */
function getActionBadge(action: string) {
  switch (action) {
    case 'APPROVE':
      return {
        label: 'Persetujuan (Approve)',
        className:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
        icon: FileCheck2
      };
    case 'REVISE':
      return {
        label: 'Minta Revisi (Revise)',
        className:
          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
        icon: AlertOctagon
      };
    case 'SUBMIT_EVIDENCE':
    case 'UPLOAD_BUKTI':
      return {
        label: 'Unggah Bukti',
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
        icon: UploadCloud
      };
    case 'GENERATE_GDRIVE_LINKS':
    case 'GENERATE_GDRIVE':
      return {
        label: 'Otomasi GDrive',
        className:
          'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
        icon: FolderSync
      };
    case 'UPDATE_VERIFIKASI':
      return {
        label: 'Ubah Verifikasi',
        className:
          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
        icon: History
      };
    case 'SYNC_ZIAPP':
    case 'SYNC_ZIAPP_UPLOAD':
    case 'SYNC_ZIAPP_BATCH':
      return {
        label: 'Sinkronisasi ZIAPP',
        className:
          'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
        icon: FolderSync
      };
    case 'NOTIF_WA_SUBMIT':
      return {
        label: 'Notif WA Submit',
        className:
          'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-300',
        icon: MessageSquare
      };
    case 'NOTIF_WA_APPROVED':
      return {
        label: 'Notif WA Disetujui',
        className:
          'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
        icon: MessageSquare
      };
    case 'NOTIF_WA_REVISION':
      return {
        label: 'Notif WA Revisi',
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300',
        icon: MessageSquare
      };
    case 'NOTIF_WA_DEADLINE':
    case 'NOTIFIKASI_WA':
      return {
        label: 'Notifikasi WA',
        className:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
        icon: MessageSquare
      };
    case 'UPDATE_USER_PROFILE':
    case 'UPDATE_USER_PHONE':
    case 'UPDATE_USER_NOTIFICATION_SETTINGS':
      return {
        label: 'Profil Pengguna',
        className:
          'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300',
        icon: Users
      };
    default:
      return {
        label: action,
        className:
          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
        icon: History
      };
  }
}

/**
 * Konversi status kelengkapan ke label bahasa Indonesia
 */
function getStatusKelengkapanLabel(val?: number | string | null): string {
  if (val === undefined || val === null) return '-';
  const num = Number(val);
  switch (num) {
    case 0:
      return 'Belum Diisi';
    case 1:
      return 'Menunggu Reviu';
    case 2:
      return 'Disetujui';
    case 3:
      return 'Perlu Revisi';
    default:
      return String(val);
  }
}

/**
 * Pemformatan transisi status 'Status Lama -> Status Baru'
 */
function formatStatusTransition(log: AuditLog): string {
  const oldState = log.old_state;
  const newState = log.new_state;

  if (
    oldState?.status_kelengkapan !== undefined ||
    newState?.status_kelengkapan !== undefined
  ) {
    const fromLabel = getStatusKelengkapanLabel(oldState?.status_kelengkapan);
    const toLabel = getStatusKelengkapanLabel(newState?.status_kelengkapan);
    return `${fromLabel} -> ${toLabel}`;
  }

  if (oldState?.status_sinkronisasi || newState?.status_sinkronisasi) {
    return `${oldState?.status_sinkronisasi || '-'} -> ${newState?.status_sinkronisasi || '-'}`;
  }

  if (oldState?.status || newState?.status) {
    return `${oldState?.status || '-'} -> ${newState?.status || '-'}`;
  }

  if (newState?.action) {
    return `- -> ${newState.action}`;
  }

  return '-';
}

export default function AuditLogClient({
  initialLogs,
  initialTotal,
  initialActionStats,
  isFallbackData
}: AuditLogClientProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [actionStats, setActionStats] =
    useState<Record<string, number>>(initialActionStats);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFilter = (customParams?: {
    action?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    startTransition(async () => {
      const act =
        customParams?.action !== undefined
          ? customParams.action
          : selectedAction;
      const rol =
        customParams?.role !== undefined ? customParams.role : selectedRole;
      const sDate =
        customParams?.startDate !== undefined
          ? customParams.startDate
          : startDate;
      const eDate =
        customParams?.endDate !== undefined ? customParams.endDate : endDate;
      const sq =
        customParams?.search !== undefined ? customParams.search : searchQuery;

      const res = await getAuditLogsAction({
        search: sq,
        action: act,
        actionType: act,
        role: rol,
        startDate: sDate || undefined,
        endDate: eDate || undefined,
        limit: 500
      });

      if (res.success) {
        setLogs(res.logs);
        setTotalCount(res.totalCount);
        setActionStats(res.actionStats);
        if (customParams?.action !== undefined)
          setSelectedAction(customParams.action);
        if (customParams?.role !== undefined)
          setSelectedRole(customParams.role);
        if (customParams?.startDate !== undefined)
          setStartDate(customParams.startDate);
        if (customParams?.endDate !== undefined)
          setEndDate(customParams.endDate);
        if (customParams?.search !== undefined)
          setSearchQuery(customParams.search);
        toast.success(`Log audit berhasil dimuat (${res.totalCount} catatan).`);
      } else {
        toast.error(res.error || 'Gagal memuat log audit.');
      }
    });
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedAction('ALL');
    setSelectedRole('ALL');
    setStartDate('');
    setEndDate('');
    startTransition(async () => {
      const res = await getAuditLogsAction({ limit: 500 });
      if (res.success) {
        setLogs(res.logs);
        setTotalCount(res.totalCount);
        setActionStats(res.actionStats);
        toast.info('Filter audit trail telah direset ke kondisi default.');
      } else {
        toast.error(res.error || 'Gagal mereset log audit.');
      }
    });
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.warning('Tidak ada data audit log untuk diekspor.');
      return;
    }

    try {
      const headers = [
        'No',
        'Timestamp (WIB)',
        'Nama Pengguna',
        'Role',
        'Jenis Aksi',
        'Status Lama -> Status Baru',
        'Catatan Reviu / Penjelasan',
        'Indikator ID'
      ];

      const csvRows = logs.map((log, idx) => {
        const dt = formatIndonesianDateTime(log.created_at);
        const timestampStr = `${dt.date} ${dt.time}`.trim();
        const roleKey = (log.role || 'operator') as UserRole;
        const roleLabel = ROLE_LABELS[roleKey] || log.role || 'Operator';
        const actionLabel = getActionBadge(log.action).label;
        const statusTransition = formatStatusTransition(log);

        let explanation = '-';
        if (log.action === 'APPROVE') {
          explanation =
            log.new_state?.catatan_koordinator ||
            `Disetujui dengan skor verifikasi: ${log.new_state?.nilai_verifikasi ?? 1}`;
        } else if (log.action === 'REVISE') {
          explanation =
            log.new_state?.catatan_koordinator ||
            'Diminta perbaikan berkas bukti dukung.';
        } else if (
          log.action === 'SUBMIT_EVIDENCE' ||
          log.action === 'UPLOAD_BUKTI'
        ) {
          explanation =
            log.new_state?.catatan_operator ||
            `Telah diunggah ${log.new_state?.dokumen_count || 1} dokumen bukti dukung.`;
        } else if (
          log.action?.startsWith('NOTIF_WA') ||
          log.action === 'NOTIFIKASI_WA'
        ) {
          explanation =
            log.new_state?.catatan_revisi ||
            log.new_state?.message ||
            `Notifikasi WA (${log.new_state?.recipient || 'PIC'}). Status: ${log.new_state?.status || 'SENT'}`;
        } else if (log.action?.startsWith('SYNC_ZIAPP')) {
          explanation =
            log.new_state?.keterangan ||
            log.new_state?.action ||
            'Sinkronisasi portal ZIAPP KemenPAN-RB.';
        } else if (log.action === 'UPDATE_USER_PROFILE') {
          explanation =
            log.new_state?.keterangan ||
            'Pembaruan nomor WhatsApp dan pengaturan preferensi notifikasi.';
        } else if (log.new_state?.catatan_koordinator) {
          explanation = String(log.new_state.catatan_koordinator);
        } else if (log.new_state?.action) {
          explanation = String(log.new_state.action);
        }

        const indikatorId = log.pertanyaan_info
          ? `${log.pertanyaan_info.kode_indikator || ''} - ${log.pertanyaan_info.uraian_singkat || ''}`.trim()
          : log.id_pertanyaan_periode || 'Sistem / Umum';

        const rowValues = [
          idx + 1,
          timestampStr,
          log.user_name || 'Pengguna REBO',
          roleLabel,
          actionLabel,
          statusTransition,
          explanation,
          indikatorId
        ];

        return rowValues
          .map(
            (val) =>
              `"${String(val ?? '')
                .replace(/"/g, '""')
                .replace(/\r?\n/g, ' ')}"`
          )
          .join(',');
      });

      // Sisipkan UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel
      const csvContent =
        '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayIso = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `AUDIT_LOG_REBO_${todayIso}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Ekspor CSV Audit Log (${logs.length} catatan) berhasil diunduh!`
      );
    } catch (err: any) {
      console.error('Gagal mengekspor CSV:', err);
      toast.error('Gagal mengekspor data audit log ke format CSV.');
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* 1. Header / Hero Section with Admin Subnav */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50/80 to-blue-50/60 p-6 sm:p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-100/30 via-indigo-100/20 to-blue-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

        <div className='relative z-10 space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className='border-purple-300/60 bg-purple-100/60 text-purple-800 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300'
            >
              <ShieldCheck className='mr-1.5 h-3.5 w-3.5' />
              Admin & TPI Governance Portal
            </Badge>
            {isFallbackData && (
              <Badge
                variant='secondary'
                className='bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              >
                Menampilkan Data Audit Sistem / Demonstrasi
              </Badge>
            )}
          </div>

          <div>
            <h1 className='bg-gradient-to-r from-slate-900 via-purple-700 to-indigo-700 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-slate-100 dark:via-purple-400 dark:to-indigo-300'>
              Audit Trail & Riwayat Aktivitas LKE
            </h1>
            <p className='mt-1 text-sm text-slate-700 sm:text-base dark:text-slate-300'>
              Rekam jejak transparan dan akuntabel dari setiap pengajuan bukti
              dukung, catatan perbaikan dari verifikator, persetujuan skor, dan
              otomasi direktori Zona Integritas BPS Sitaro.
            </p>
          </div>

          {/* Admin Navigation Pills */}
          <div className='flex flex-wrap items-center gap-2 pt-2'>
            <Link
              href='/rebo/admin'
              className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              <Users className='h-3.5 w-3.5 text-slate-500' />
              Manajemen Pengguna & RBAC
            </Link>
            <Link
              href='/rebo/admin/gdrive-generator'
              className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              <Folder className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              GDrive Generator per Indikator
            </Link>
            <Link
              href='/rebo/admin/audit-log'
              className='inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700'
            >
              <History className='h-3.5 w-3.5' />
              Audit Trail & Log Aktivitas
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Stats Summary Row */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5'>
        <Card className='border-slate-200/70 p-3 shadow-xs dark:border-slate-800'>
          <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
            <History className='h-4 w-4 text-purple-600' />
            Total Aktivitas
          </div>
          <div className='mt-1 text-2xl font-black text-slate-900 dark:text-slate-100'>
            {totalCount}
          </div>
        </Card>

        <Card className='border-emerald-200/70 bg-emerald-50/20 p-3 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/10'>
          <div className='flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400'>
            <FileCheck2 className='h-4 w-4 text-emerald-600' />
            Persetujuan (Approve)
          </div>
          <div className='mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300'>
            {actionStats['APPROVE'] || 0}
          </div>
        </Card>

        <Card className='border-rose-200/70 bg-rose-50/20 p-3 shadow-xs dark:border-rose-900/40 dark:bg-rose-950/10'>
          <div className='flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400'>
            <AlertOctagon className='h-4 w-4 text-rose-600' />
            Minta Revisi
          </div>
          <div className='mt-1 text-2xl font-black text-rose-800 dark:text-rose-300'>
            {actionStats['REVISE'] || 0}
          </div>
        </Card>

        <Card className='border-blue-200/70 bg-blue-50/20 p-3 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/10'>
          <div className='flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400'>
            <UploadCloud className='h-4 w-4 text-blue-600' />
            Unggah Bukti
          </div>
          <div className='mt-1 text-2xl font-black text-blue-800 dark:text-blue-300'>
            {actionStats['SUBMIT_EVIDENCE'] || 0}
          </div>
        </Card>

        <Card className='border-slate-200/70 p-3 shadow-xs dark:border-slate-800'>
          <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
            <FolderSync className='h-4 w-4 text-indigo-600' />
            Otomasi Sistem
          </div>
          <div className='mt-1 text-2xl font-black text-slate-900 dark:text-slate-100'>
            {(actionStats['GENERATE_GDRIVE_LINKS'] || 0) +
              (actionStats['UPDATE_VERIFIKASI'] || 0)}
          </div>
        </Card>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className='flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900'>
        {/* Row 1: Search & Filter Inputs */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              type='text'
              placeholder='Cari nama, indikator, catatan...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilter();
              }}
              className='pl-9 text-xs sm:text-sm'
            />
          </div>

          {/* Filter Tanggal Mulai */}
          <div className='flex items-center gap-2'>
            <span className='flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300'>
              <Calendar className='h-3.5 w-3.5 text-purple-600' />
              Dari:
            </span>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='h-9 text-xs'
              title='Rentang Tanggal Awal'
            />
          </div>

          {/* Filter Tanggal Selesai */}
          <div className='flex items-center gap-2'>
            <span className='flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300'>
              <Calendar className='h-3.5 w-3.5 text-purple-600' />
              Sampai:
            </span>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='h-9 text-xs'
              title='Rentang Tanggal Akhir'
            />
          </div>

          {/* Filter Jenis Aksi */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedAction(val);
              }}
              disabled={isPending}
              className='h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <option value='ALL'>Semua Jenis Aksi</option>
              <option value='APPROVE'>Persetujuan (Approve)</option>
              <option value='REVISE'>Minta Revisi (Revise)</option>
              <option value='SUBMIT_EVIDENCE'>Unggah Bukti (Submit)</option>
              <option value='UPLOAD_BUKTI'>Unggah Bukti (Alternative)</option>
              <option value='SYNC_ZIAPP'>Sinkronisasi ZIAPP</option>
              <option value='NOTIFIKASI_WA'>Semua Notifikasi WA</option>
              <option value='NOTIF_WA_SUBMIT'>Notif WA Pengajuan</option>
              <option value='NOTIF_WA_APPROVED'>Notif WA Disetujui</option>
              <option value='NOTIF_WA_REVISION'>Notif WA Revisi</option>
              <option value='NOTIF_WA_DEADLINE'>Notif WA Deadline</option>
              <option value='GENERATE_GDRIVE_LINKS'>Otomasi GDrive</option>
              <option value='UPDATE_VERIFIKASI'>Update Verifikasi</option>
              <option value='UPDATE_USER_PROFILE'>
                Pembaruan Profil Pegawai
              </option>
            </select>
          </div>
        </div>

        {/* Row 2: Peran Pengguna & Action Buttons */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
              Peran:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRole(val);
              }}
              disabled={isPending}
              className='h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <option value='ALL'>Semua Role</option>
              <option value='admin'>Super Admin</option>
              <option value='koordinator'>Koordinator Pilar</option>
              <option value='operator'>Operator Tim</option>
              <option value='tpi'>Tim Penilai Internal (TPI)</option>
            </select>

            <Button
              variant='default'
              size='sm'
              onClick={() => handleFilter()}
              disabled={isPending}
              className='h-8.5 gap-1.5 bg-purple-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700'
            >
              <Filter className='h-3.5 w-3.5' />
              <span>Terapkan Filter</span>
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleResetFilter}
              disabled={isPending}
              className='h-8.5 gap-1.5 border-slate-200 px-3 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              <RotateCcw className='h-3.5 w-3.5 text-slate-500' />
              <span>Reset Filter</span>
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleFilter()}
              disabled={isPending}
              className='h-8.5 gap-1.5 text-xs font-medium text-slate-700 shadow-xs dark:text-slate-200'
              title='Muat ulang data'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className='h-8.5 gap-1.5 border-emerald-300 bg-emerald-50/60 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70'
            >
              <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
              <span>Ekspor Audit Log (.csv)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Audit Trail Table */}
      <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                Riwayat Log Transaksional
              </CardTitle>
              <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                Menampilkan {logs.length} catatan aktivitas terbaru sistem
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'>
                <tr>
                  <th className='py-3 pr-2 pl-4'>Waktu</th>
                  <th className='px-3 py-3'>Pengguna</th>
                  <th className='px-3 py-3'>Aksi</th>
                  <th className='px-3 py-3'>Indikator / Entitas</th>
                  <th className='px-3 py-3'>Rincian Perubahan</th>
                  <th className='py-3 pr-4 pl-3 text-center'>Detail</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='py-8 text-center text-xs text-slate-500'
                    >
                      Tidak ada data log yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const dt = formatIndonesianDateTime(log.created_at);
                    const actionInfo = getActionBadge(log.action);
                    const ActionIcon = actionInfo.icon;
                    const roleKey = (log.role || 'operator') as UserRole;
                    const roleBadgeClass =
                      ROLE_BADGE_CLASSES[roleKey] ||
                      'bg-slate-100 text-slate-700 border-slate-300';
                    const roleLabel = ROLE_LABELS[roleKey] || log.role;
                    const isExpanded = expandedLogId === log.id;

                    // Buat ringkasan perubahan
                    let changeSummary = '-';
                    if (log.action === 'APPROVE') {
                      changeSummary =
                        log.new_state?.catatan_koordinator ||
                        `Disetujui dengan skor verifikasi: ${log.new_state?.nilai_verifikasi ?? 1}`;
                    } else if (log.action === 'REVISE') {
                      changeSummary =
                        log.new_state?.catatan_koordinator ||
                        'Diminta perbaikan berkas bukti dukung.';
                    } else if (
                      log.action === 'SUBMIT_EVIDENCE' ||
                      log.action === 'UPLOAD_BUKTI'
                    ) {
                      changeSummary =
                        log.new_state?.catatan_operator ||
                        `Telah diunggah ${log.new_state?.dokumen_count || 1} dokumen bukti dukung.`;
                    } else if (log.action === 'NOTIF_WA_SUBMIT') {
                      changeSummary = `Notifikasi WA terkirim ke Tim Verifikator (${log.new_state?.total_recipients || 1} penerima).`;
                    } else if (log.action === 'NOTIF_WA_APPROVED') {
                      changeSummary = `Notifikasi persetujuan WA terkirim ke PIC (${log.new_state?.recipient || 'PIC'}).`;
                    } else if (log.action === 'NOTIF_WA_REVISION') {
                      changeSummary = `Notifikasi revisi WA terkirim ke PIC (${log.new_state?.recipient || 'PIC'}). Catatan: ${log.new_state?.catatan_revisi || '-'}`;
                    } else if (
                      log.action?.startsWith('NOTIF_WA') ||
                      log.action === 'NOTIFIKASI_WA'
                    ) {
                      changeSummary = `Notifikasi WA (${log.new_state?.recipient || 'PIC'}): ${log.new_state?.message || log.new_state?.status || 'Terkirim'}`;
                    } else if (log.action?.startsWith('SYNC_ZIAPP')) {
                      changeSummary = `Sinkronisasi ZIAPP: ${log.new_state?.keterangan || log.new_state?.action || 'Selesai'}`;
                    } else if (log.action === 'UPDATE_USER_PROFILE') {
                      changeSummary = `Pembaruan profil: ${log.new_state?.keterangan || 'Nomor WA / Preferensi notifikasi diperbarui'}`;
                    } else if (log.new_state?.catatan_koordinator) {
                      changeSummary = String(log.new_state.catatan_koordinator);
                    } else if (log.new_state?.action) {
                      changeSummary = String(log.new_state.action);
                    }

                    return (
                      <React.Fragment key={log.id}>
                        <tr className='bg-white transition-colors hover:bg-slate-50/80 dark:bg-slate-950 dark:hover:bg-slate-900/60'>
                          {/* Waktu */}
                          <td className='py-3.5 pr-2 pl-4 text-xs whitespace-nowrap text-slate-700 dark:text-slate-300'>
                            <div className='flex items-center gap-1.5 font-medium'>
                              <Clock className='h-3.5 w-3.5 text-slate-400' />
                              <span>{dt.date}</span>
                            </div>
                            <span className='text-[11px] text-slate-500'>
                              {dt.time}
                            </span>
                          </td>

                          {/* Pengguna & Role */}
                          <td className='px-3 py-3.5'>
                            <div className='flex flex-col gap-1'>
                              <span className='font-bold text-slate-900 dark:text-slate-100'>
                                {log.user_name || 'Pengguna REBO'}
                              </span>
                              <Badge
                                variant='outline'
                                className={`w-fit text-[10px] font-semibold ${roleBadgeClass}`}
                              >
                                {roleLabel}
                              </Badge>
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className='px-3 py-3.5 whitespace-nowrap'>
                            <Badge
                              variant='outline'
                              className={`gap-1 px-2.5 py-1 text-xs font-bold ${actionInfo.className}`}
                            >
                              <ActionIcon className='h-3.5 w-3.5' />
                              <span>{actionInfo.label}</span>
                            </Badge>
                          </td>

                          {/* Indikator / Pilar */}
                          <td className='px-3 py-3.5'>
                            {log.pertanyaan_info ? (
                              <div className='flex flex-col text-xs'>
                                <span className='font-semibold text-slate-800 dark:text-slate-200'>
                                  {log.pertanyaan_info.uraian_singkat}
                                </span>
                                <span className='text-[11px] text-slate-500'>
                                  {log.pertanyaan_info.kode_indikator && (
                                    <span className='font-mono font-bold text-blue-600 dark:text-blue-400'>
                                      {log.pertanyaan_info.kode_indikator} •{' '}
                                    </span>
                                  )}
                                  {log.pertanyaan_info.pilar_nama || ''}
                                </span>
                              </div>
                            ) : (
                              <span className='text-xs text-slate-400'>
                                Entitas Umum / Sistem
                              </span>
                            )}
                          </td>

                          {/* Rincian Perubahan */}
                          <td className='px-3 py-3.5'>
                            <p className='line-clamp-2 text-xs text-slate-600 italic dark:text-slate-300'>
                              &ldquo;{changeSummary}&rdquo;
                            </p>
                          </td>

                          {/* Toggle Expand Detail */}
                          <td className='py-3.5 pr-4 pl-3 text-center'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => toggleDetails(log.id)}
                              className='h-7 w-7 p-0'
                              title='Lihat Detail JSON Diff'
                            >
                              {isExpanded ? (
                                <ChevronDown className='h-4 w-4 text-purple-600' />
                              ) : (
                                <ChevronRight className='h-4 w-4 text-slate-400' />
                              )}
                            </Button>
                          </td>
                        </tr>

                        {/* Expandable JSON Diff Row */}
                        {isExpanded && (
                          <tr className='bg-purple-50/30 text-xs dark:bg-purple-950/20'>
                            <td colSpan={6} className='p-4'>
                              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                {/* Old State */}
                                <div className='rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900'>
                                  <div className='mb-2 flex items-center justify-between font-bold text-slate-700 dark:text-slate-300'>
                                    <span>Status Sebelumnya (Old State)</span>
                                    <Badge
                                      variant='outline'
                                      className='text-[10px]'
                                    >
                                      Before
                                    </Badge>
                                  </div>
                                  <pre className='overflow-x-auto rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-950 dark:text-slate-300'>
                                    {log.old_state
                                      ? JSON.stringify(log.old_state, null, 2)
                                      : '// Belum ada status sebelumnya'}
                                  </pre>
                                </div>

                                {/* New State */}
                                <div className='rounded-xl border border-purple-200 bg-white p-3 dark:border-purple-900/60 dark:bg-slate-900'>
                                  <div className='mb-2 flex items-center justify-between font-bold text-purple-800 dark:text-purple-300'>
                                    <span>Status Terbaru (New State)</span>
                                    <Badge
                                      variant='default'
                                      className='bg-purple-600 text-[10px] text-white'
                                    >
                                      After
                                    </Badge>
                                  </div>
                                  <pre className='overflow-x-auto rounded-lg bg-purple-50/50 p-2 font-mono text-[11px] text-purple-900 dark:bg-purple-950/40 dark:text-purple-200'>
                                    {log.new_state
                                      ? JSON.stringify(log.new_state, null, 2)
                                      : '// Data state baru kosong'}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
