'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Calendar,
  Lock,
  Unlock,
  Copy,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Check,
  RefreshCw,
  Info,
  Clock,
  Edit3,
  Wand2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Layers
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  createPeriode,
  updatePeriode,
  setActivePeriode,
  toggleLockPeriode,
  duplicatePeriodeStructure,
  deletePeriode,
  getPeriodeList,
  setupNewPeriodWizardAction,
  checkAndApplyAutoLockPeriods,
  type PeriodeWithStats
} from '@/actions/periode-actions';

interface PeriodeManagerClientProps {
  initialPeriodes: PeriodeWithStats[];
  tableMissing?: boolean;
}

export default function PeriodeManagerClient({
  initialPeriodes,
  tableMissing = false
}: PeriodeManagerClientProps) {
  const [periodes, setPeriodes] = useState<PeriodeWithStats[]>(initialPeriodes);
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [openWizardDialog, setOpenWizardDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Wizard States
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardTahun, setWizardTahun] = useState<string>(
    String(new Date().getFullYear() + 1)
  );
  const [wizardNama, setWizardNama] = useState<string>('');
  const [wizardTglMulai, setWizardTglMulai] = useState<string>(
    `${new Date().getFullYear() + 1}-01-01`
  );
  const [wizardTglSelesai, setWizardTglSelesai] = useState<string>(
    `${new Date().getFullYear() + 1}-12-31`
  );
  const [wizardCloneMode, setWizardCloneMode] = useState<
    'clone_previous' | 'master_seed' | 'clean'
  >('clone_previous');
  const [wizardSourceId, setWizardSourceId] = useState<string>('');
  const [wizardTglCutoff, setWizardTglCutoff] = useState<string>(
    `${new Date().getFullYear() + 1}-06-30`
  );
  const [wizardAutoLock, setWizardAutoLock] = useState<boolean>(true);
  const [wizardSetActive, setWizardSetActive] = useState<boolean>(true);

  // Form States - Create Periode Manual
  const [newTahun, setNewTahun] = useState<string>(
    String(new Date().getFullYear() + 1)
  );
  const [newNama, setNewNama] = useState<string>('');
  const [newTglMulai, setNewTglMulai] = useState<string>('');
  const [newTglSelesai, setNewTglSelesai] = useState<string>('');
  const [newTglCutoff, setNewTglCutoff] = useState<string>('');
  const [newIsActive, setNewIsActive] = useState<boolean>(false);
  const [newAutoSeed, setNewAutoSeed] = useState<boolean>(true);

  // Form States - Clone Periode Quick
  const [cloneSourceId, setCloneSourceId] = useState<string>('');
  const [cloneTargetTahun, setCloneTargetTahun] = useState<string>(
    String(new Date().getFullYear() + 1)
  );
  const [cloneTargetNama, setCloneTargetNama] = useState<string>('');
  const [cloneCutoff, setCloneCutoff] = useState<string>('');
  const [cloneSetActive, setCloneSetActive] = useState<boolean>(false);

  // Form States - Edit Periode
  const [editItem, setEditItem] = useState<PeriodeWithStats | null>(null);
  const [editNama, setEditNama] = useState<string>('');
  const [editTglMulai, setEditTglMulai] = useState<string>('');
  const [editTglSelesai, setEditTglSelesai] = useState<string>('');
  const [editTglCutoff, setEditTglCutoff] = useState<string>('');
  const [editIsLocked, setEditIsLocked] = useState<boolean>(false);

  // Stats calculation
  const totalPeriodes = periodes.length;
  const activePeriode = periodes.find((p) => p.is_active);
  const lockedCount = periodes.filter((p) => p.is_locked).length;
  const autoLockEligibleCount = periodes.filter(
    (p) => p.tanggal_cutoff && p.isCutoffPassed
  ).length;

  const refreshList = async () => {
    startTransition(async () => {
      const res = await getPeriodeList();
      if (res.success) {
        setPeriodes(res.data);
      }
    });
  };

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------

  const handleSetActive = (id: string, tahun: number) => {
    startTransition(async () => {
      const res = await setActivePeriode(id);
      if (res.success) {
        toast.success(`Tahun ${tahun} kini menjadi Periode Evaluasi Aktif!`);
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal mengubah periode aktif.');
      }
    });
  };

  const handleToggleLock = (
    id: string,
    tahun: number,
    currentLocked: boolean
  ) => {
    startTransition(async () => {
      const res = await toggleLockPeriode(id);
      if (res.success) {
        toast.success(
          !currentLocked
            ? `Periode ${tahun} berhasil dikunci (Read-Only).`
            : `Periode ${tahun} berhasil dibuka kembali.`
        );
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal mengubah status penguncian.');
      }
    });
  };

  const handleTriggerAutoLock = () => {
    startTransition(async () => {
      const res = await checkAndApplyAutoLockPeriods();
      if (res.success) {
        if (res.autoLockedCount > 0) {
          toast.success(
            `Auto-Lock aktif: ${res.autoLockedCount} periode melewati batas cutoff otomatis dikunci (${res.lockedPeriodes.join(', ')}).`
          );
        } else {
          toast.info(
            'Seluruh periode evaluasi masih dalam rentang masa cutoff atau sudah terkunci.'
          );
        }
        await refreshList();
      } else {
        toast.error('Gagal mengecek auto-lock periode.');
      }
    });
  };

  const openWizardModal = () => {
    const nextYr = (activePeriode?.tahun || new Date().getFullYear()) + 1;
    setWizardTahun(String(nextYr));
    setWizardNama(`Evaluasi PMPRB ${nextYr}`);
    setWizardTglMulai(`${nextYr}-01-01`);
    setWizardTglSelesai(`${nextYr}-12-31`);
    setWizardTglCutoff(`${nextYr}-06-30`);
    setWizardCloneMode('clone_previous');
    setWizardSourceId(activePeriode?.id || (periodes[0]?.id ?? ''));
    setWizardAutoLock(true);
    setWizardSetActive(true);
    setWizardStep(1);
    setOpenWizardDialog(true);
  };

  const handleWizardSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedTahun = parseInt(wizardTahun, 10);
    if (!parsedTahun || parsedTahun < 2020 || parsedTahun > 2050) {
      toast.error('Masukkan tahun evaluasi yang valid (2020 - 2050).');
      return;
    }
    const finalNama = wizardNama.trim() || `Evaluasi PMPRB ${parsedTahun}`;

    startTransition(async () => {
      const res = await setupNewPeriodWizardAction({
        tahun: parsedTahun,
        nama_periode: finalNama,
        tanggal_mulai: wizardTglMulai || null,
        tanggal_selesai: wizardTglSelesai || null,
        tanggal_cutoff: wizardTglCutoff || null,
        cloneMode: wizardCloneMode,
        sourcePeriodeId:
          wizardCloneMode === 'clone_previous' ? wizardSourceId : null,
        autoLockEnabled: wizardAutoLock,
        setAsActive: wizardSetActive
      });

      if (res.success) {
        toast.success(
          res.message || `Periode ${parsedTahun} berhasil disetup!`
        );
        setOpenWizardDialog(false);
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal menjalankan wizard setup periode.');
      }
    });
  };

  const openEditModal = (periode: PeriodeWithStats) => {
    setEditItem(periode);
    setEditNama(periode.nama_periode);
    setEditTglMulai(periode.tanggal_mulai || '');
    setEditTglSelesai(periode.tanggal_selesai || '');
    setEditTglCutoff(periode.tanggal_cutoff || '');
    setEditIsLocked(periode.is_locked);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    startTransition(async () => {
      const res = await updatePeriode({
        id: editItem.id,
        nama_periode: editNama.trim() || editItem.nama_periode,
        tanggal_mulai: editTglMulai || null,
        tanggal_selesai: editTglSelesai || null,
        tanggal_cutoff: editTglCutoff || null,
        is_locked: editIsLocked
      });

      if (res.success) {
        toast.success(res.message || 'Periode evaluasi berhasil diperbarui.');
        setOpenEditDialog(false);
        setEditItem(null);
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal memperbarui periode evaluasi.');
      }
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTahun = parseInt(newTahun, 10);
    if (!parsedTahun || parsedTahun < 2020 || parsedTahun > 2050) {
      toast.error('Masukkan tahun evaluasi yang valid (2020 - 2050).');
      return;
    }
    const finalNama = newNama.trim() || `Evaluasi PMPRB ${parsedTahun}`;

    startTransition(async () => {
      const res = await createPeriode({
        tahun: parsedTahun,
        nama_periode: finalNama,
        tanggal_mulai: newTglMulai || null,
        tanggal_selesai: newTglSelesai || null,
        tanggal_cutoff: newTglCutoff || null,
        is_active: newIsActive,
        auto_seed_indicators: newAutoSeed
      });

      if (res.success) {
        toast.success(`Periode ${parsedTahun} berhasil dibuat!`);
        setOpenCreateDialog(false);
        setNewNama('');
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal membuat periode baru.');
      }
    });
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneSourceId) {
      toast.error('Pilih periode tahun sumber terlebih dahulu.');
      return;
    }
    const parsedTargetTahun = parseInt(cloneTargetTahun, 10);
    if (
      !parsedTargetTahun ||
      parsedTargetTahun < 2020 ||
      parsedTargetTahun > 2050
    ) {
      toast.error('Masukkan tahun tujuan yang valid (2020 - 2050).');
      return;
    }
    const finalNama =
      cloneTargetNama.trim() || `Evaluasi PMPRB ${parsedTargetTahun}`;

    startTransition(async () => {
      const res = await duplicatePeriodeStructure({
        sourceId: cloneSourceId,
        targetTahun: parsedTargetTahun,
        targetNama: finalNama,
        tanggal_cutoff: cloneCutoff || null,
        setAsActive: cloneSetActive
      });

      if (res.success) {
        toast.success(
          res.message ||
            `Struktur LKE ${parsedTargetTahun} berhasil diduplikasi dari tahun sebelumnya!`
        );
        setOpenCloneDialog(false);
        setCloneTargetNama('');
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal menduplikasi struktur periode.');
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deleteTargetId) return;
    startTransition(async () => {
      const res = await deletePeriode(deleteTargetId);
      if (res.success) {
        toast.success(res.message || 'Periode berhasil dihapus.');
        setDeleteTargetId(null);
        await refreshList();
      } else {
        toast.error(res.error || 'Gagal menghapus periode.');
      }
    });
  };

  const openCloneForSource = (periode: PeriodeWithStats) => {
    setCloneSourceId(periode.id);
    const nextYear = periode.tahun + 1;
    setCloneTargetTahun(String(nextYear));
    setCloneTargetNama(`Evaluasi PMPRB ${nextYear}`);
    setCloneCutoff(`${nextYear}-06-30`);
    setCloneSetActive(false);
    setOpenCloneDialog(true);
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6 pb-12'>
        {/* Top Header & Actions */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                <Calendar className='h-6 w-6' />
              </div>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                  Manajemen Siklus Periode LKE
                </h1>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  Kelola siklus tahunan evaluasi, 1-Click Wizard setup, batas
                  cutoff &amp; auto-lock evaluator LKE PMPRB
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshList}
              disabled={isPending}
              className='gap-1.5'
              title='Segarkan data periode dari server'
            >
              <RefreshCw
                className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
              />
              Segarkan
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleTriggerAutoLock}
              disabled={isPending}
              className='gap-1.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              title='Jalankan pengecekan auto-lock batas cutoff untuk semua periode'
            >
              <Clock className='h-4 w-4 text-amber-600 dark:text-amber-400' />
              Cek Auto-Lock
            </Button>

            <Button
              size='sm'
              onClick={openWizardModal}
              disabled={isPending}
              className='gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 dark:from-purple-700 dark:to-indigo-800'
            >
              <Wand2 className='h-4 w-4' />
              Wizard Setup Siklus Baru
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const nextYr =
                  (activePeriode?.tahun || new Date().getFullYear()) + 1;
                setNewTahun(String(nextYr));
                setNewNama(`Evaluasi PMPRB ${nextYr}`);
                setNewTglMulai(`${nextYr}-01-01`);
                setNewTglSelesai(`${nextYr}-12-31`);
                setNewTglCutoff(`${nextYr}-06-30`);
                setOpenCreateDialog(true);
              }}
              className='gap-1.5'
            >
              <Plus className='h-4 w-4' />
              Manual
            </Button>
          </div>
        </div>

        {/* Warning Banner if Migration has not been executed */}
        {tableMissing && (
          <div className='rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='space-y-1'>
                <h4 className='text-sm font-semibold'>
                  Tabel &quot;periode_evaluasi&quot; Belum Dijalankan di
                  Database Supabase
                </h4>
                <p className='text-xs leading-relaxed'>
                  Database remote Supabase saat ini masih menggunakan skema V1.
                  Untuk mengaktifkan fitur manajemen siklus periode, silakan
                  buka{' '}
                  <a
                    href='https://supabase.com/dashboard/project/tvsieplcwiyrsnnmsrde/sql'
                    target='_blank'
                    rel='noreferrer'
                    className='font-medium text-blue-600 underline dark:text-blue-400'
                  >
                    SQL Editor Supabase
                  </a>
                  , lalu jalankan script migrasi dari file{' '}
                  <code className='rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900'>
                    supabase/migrations/20261122000000_v2_core_schema.sql
                  </code>{' '}
                  dan{' '}
                  <code className='rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900'>
                    supabase/migrations/20261124000000_add_tanggal_cutoff_to_periode.sql
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Highlight Summary Stats */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='border-blue-100 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-gray-900'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-xs font-medium text-blue-600 uppercase dark:text-blue-400'>
                Total Periode
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {totalPeriodes} Tahun
              </CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground text-xs'>
              Siklus evaluasi reformasi birokrasi terdaftar di sistem
            </CardContent>
          </Card>

          <Card className='border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-gray-900'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-xs font-medium text-emerald-600 uppercase dark:text-emerald-400'>
                Periode Aktif Utama
              </CardDescription>
              <CardTitle className='flex items-center gap-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
                {activePeriode?.tahun || 'Belum Ada'}
                {activePeriode && (
                  <Badge className='bg-emerald-600 text-white hover:bg-emerald-600'>
                    Aktif
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground truncate text-xs'>
              {activePeriode?.nama_periode ||
                'Silakan tentukan periode evaluasi aktif'}
            </CardContent>
          </Card>

          <Card className='border-purple-100 bg-gradient-to-br from-purple-50/50 to-white dark:border-purple-900/40 dark:from-purple-950/20 dark:to-gray-900'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-xs font-medium text-purple-600 uppercase dark:text-purple-400'>
                Batas Waktu (Cutoff)
              </CardDescription>
              <CardTitle className='flex items-center gap-2 text-lg font-bold text-purple-700 dark:text-purple-300'>
                {activePeriode?.tanggal_cutoff ? (
                  activePeriode.isCutoffPassed ? (
                    <span className='text-rose-600'>Telah Cutoff</span>
                  ) : (
                    <span>Sisa {activePeriode.daysRemaining} Hari</span>
                  )
                ) : (
                  <span className='text-muted-foreground text-sm font-normal'>
                    Belum Ditetapkan
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground text-xs'>
              {activePeriode?.tanggal_cutoff
                ? `Batas mandiri: ${activePeriode.tanggal_cutoff}`
                : 'Cutoff melindungi LKE dari modifikasi liar'}
            </CardContent>
          </Card>

          <Card className='border-amber-100 bg-gradient-to-br from-amber-50/50 to-white dark:border-amber-900/40 dark:from-amber-950/20 dark:to-gray-900'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-xs font-medium text-amber-600 uppercase dark:text-amber-400'>
                Status Freeze / Terkunci
              </CardDescription>
              <CardTitle className='flex items-center gap-2 text-2xl font-bold text-amber-700 dark:text-amber-300'>
                {lockedCount} Periode
              </CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground text-xs'>
              {autoLockEligibleCount > 0
                ? `${autoLockEligibleCount} periode melewati batas cutoff`
                : 'Terkunci berstatus Read-Only aman dari perubahan'}
            </CardContent>
          </Card>
        </div>

        {/* Wizard Callout Banner */}
        <div className='flex items-start gap-3 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50/90 to-indigo-50/70 p-4 text-purple-950 dark:border-purple-800/60 dark:from-purple-950/40 dark:to-indigo-950/30 dark:text-purple-200'>
          <Sparkles className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
          <div className='flex-1 space-y-1 text-sm'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold'>
                Wizard Setup Siklus Periode Baru &amp; Auto-Lock Cutoff (1-Click
                Clone)
              </p>
              <Button
                size='sm'
                onClick={openWizardModal}
                className='h-7 gap-1 bg-purple-600 text-xs text-white hover:bg-purple-700'
              >
                <Wand2 className='h-3.5 w-3.5' />
                Buka Wizard
              </Button>
            </div>
            <p className='text-xs text-purple-800 dark:text-purple-300'>
              Saat memulai siklus penilaian tahunan baru, Anda dapat mengkloning
              seluruh instrumen LKE dari periode sebelumnya dengan 1 klik,
              menetapkan batas waktu (*cutoff date*), serta mengaktifkan
              mekanisme *auto-lock evaluator* agar bukti dukung tidak dapat
              dimanipulasi saat masa reviu TPI/TPN sedang berjalan.
            </p>
          </div>
        </div>

        {/* Grid Cards Periode List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Daftar Tahun Periode Evaluasi
            </h2>
            <span className='text-muted-foreground text-xs'>
              {periodes.length} Periode Terdaftar
            </span>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {periodes.map((p) => {
              const isActive = p.is_active;
              const isLocked = p.is_locked;
              const hasCutoff = Boolean(p.tanggal_cutoff);
              const isCutoffPassed = Boolean(p.isCutoffPassed);
              const daysRemaining = p.daysRemaining ?? null;

              return (
                <Card
                  key={p.id}
                  className={`relative flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                    isActive
                      ? 'border-2 border-emerald-500 shadow-sm dark:border-emerald-600'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100'>
                            {p.tahun}
                          </span>
                          {isActive && (
                            <Badge className='gap-1 bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-emerald-600'>
                              <CheckCircle2 className='h-3 w-3' />
                              Aktif
                            </Badge>
                          )}
                        </div>
                        <p className='mt-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          {p.nama_periode}
                        </p>
                      </div>

                      {/* Status Penguncian Badge */}
                      <div className='flex flex-col items-end gap-1.5'>
                        {isLocked ? (
                          <Badge
                            variant='outline'
                            className='gap-1 border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          >
                            <Lock className='h-3 w-3' />
                            Terkunci
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='gap-1 border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                          >
                            <Unlock className='h-3 w-3' />
                            Terbuka
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Cutoff & Dates Sub-badges */}
                    <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                      {hasCutoff ? (
                        isCutoffPassed ? (
                          <Badge
                            variant='outline'
                            className='gap-1 border-rose-400 bg-rose-50/80 text-[11px] text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                            title={`Batas akhir pengumpulan: ${p.tanggal_cutoff}`}
                          >
                            <Clock className='h-3 w-3 text-rose-600' />
                            Cutoff: {p.tanggal_cutoff} (Expired)
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='gap-1 border-amber-400 bg-amber-50/80 text-[11px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            title={`Batas akhir pengumpulan: ${p.tanggal_cutoff}`}
                          >
                            <Clock className='h-3 w-3 text-amber-600' />
                            Cutoff: {p.tanggal_cutoff} ({daysRemaining} hari
                            lagi)
                          </Badge>
                        )
                      ) : (
                        <Badge
                          variant='outline'
                          className='border-dashed text-[11px] text-gray-400 dark:text-gray-500'
                        >
                          Cutoff: Belum Diset
                        </Badge>
                      )}

                      {p.tanggal_mulai && p.tanggal_selesai && (
                        <span className='text-muted-foreground text-[10px]'>
                          ({p.tanggal_mulai} s/d {p.tanggal_selesai})
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4 pb-4'>
                    {/* Ringkasan Indikator */}
                    <div className='rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800/60'>
                      <div className='text-muted-foreground mb-1.5 flex items-center justify-between'>
                        <span>Kemajuan Pengisian LKE</span>
                        <span className='font-bold text-gray-900 dark:text-gray-100'>
                          {p.persentaseSelesai}%
                        </span>
                      </div>
                      <Progress
                        value={p.persentaseSelesai}
                        className='mb-2.5 h-1.5'
                      />

                      <div className='grid grid-cols-4 gap-1 border-t border-gray-200 pt-1 text-center dark:border-gray-700'>
                        <div>
                          <div className='font-semibold text-gray-900 dark:text-gray-100'>
                            {p.totalPertanyaan}
                          </div>
                          <div className='text-muted-foreground text-[10px]'>
                            Total
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                            {p.totalSelesai}
                          </div>
                          <div className='text-muted-foreground text-[10px]'>
                            Disetujui
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold text-amber-600 dark:text-amber-400'>
                            {p.totalReview}
                          </div>
                          <div className='text-muted-foreground text-[10px]'>
                            Review
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold text-rose-600 dark:text-rose-400'>
                            {p.totalRevisi}
                          </div>
                          <div className='text-muted-foreground text-[10px]'>
                            Revisi
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice status lock */}
                    {isLocked ? (
                      <p className='flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400'>
                        <Lock className='h-3.5 w-3.5 shrink-0' />
                        LKE tahun ini terkunci (Read-Only). Perubahan bukti
                        ditolak sistem.
                      </p>
                    ) : (
                      <p className='flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400'>
                        <Unlock className='h-3.5 w-3.5 shrink-0' />
                        Periode aktif untuk pengisian bukti dan penilaian
                        mandiri/TPI.
                      </p>
                    )}
                  </CardContent>

                  {/* Card Actions Footer */}
                  <div className='flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50'>
                    <div className='flex items-center gap-1.5'>
                      {!isActive && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleSetActive(p.id, p.tahun)}
                          disabled={isPending}
                          className='h-8 text-xs hover:border-emerald-500 hover:text-emerald-600'
                        >
                          <Check className='mr-1 h-3.5 w-3.5' />
                          Jadikan Aktif
                        </Button>
                      )}

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleToggleLock(p.id, p.tahun, isLocked)
                        }
                        disabled={isPending}
                        className={`h-8 text-xs ${
                          isLocked
                            ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40'
                            : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                        }`}
                        title={
                          isLocked
                            ? 'Buka Kunci Pengisian'
                            : 'Kunci Periode (Read-Only)'
                        }
                      >
                        {isLocked ? (
                          <>
                            <Unlock className='mr-1 h-3.5 w-3.5' />
                            Buka Kunci
                          </>
                        ) : (
                          <>
                            <Lock className='mr-1 h-3.5 w-3.5' />
                            Kunci Periode
                          </>
                        )}
                      </Button>
                    </div>

                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEditModal(p)}
                        disabled={isPending}
                        className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40'
                        title='Edit Periode & Jadwal Cutoff'
                      >
                        <Edit3 className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openCloneForSource(p)}
                        disabled={isPending}
                        className='h-8 w-8 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40'
                        title='Duplikasi struktur ke tahun baru'
                      >
                        <Copy className='h-4 w-4' />
                      </Button>

                      {!isActive && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setDeleteTargetId(p.id)}
                          disabled={isPending}
                          className='h-8 w-8 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                          title='Hapus periode'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIZARD MODAL: 1-Click Setup Periode Baru & Auto-Lock Cutoff               */}
        {/* ========================================================================= */}
        <Dialog open={openWizardDialog} onOpenChange={setOpenWizardDialog}>
          <DialogContent className='sm:max-w-2xl'>
            <DialogHeader>
              <div className='flex items-center gap-2 text-purple-700 dark:text-purple-300'>
                <div className='rounded-lg bg-purple-100 p-1.5 dark:bg-purple-950'>
                  <Wand2 className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <DialogTitle className='text-lg'>
                  Wizard Setup Siklus Periode Baru (1-Click Clone)
                </DialogTitle>
              </div>
              <DialogDescription>
                Panduan praktis pembuatan tahun periode baru, kloning indikator
                LKE, dan penetapan batas waktu cutoff auto-lock evaluator.
              </DialogDescription>
            </DialogHeader>

            {/* Step Indicators */}
            <div className='flex items-center justify-between border-y py-3'>
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  wizardStep >= 1
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    wizardStep >= 1
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800'
                  }`}
                >
                  1
                </div>
                <span>Info Periode</span>
              </div>
              <div className='mx-2 h-0.5 flex-1 bg-gray-200 dark:bg-gray-800' />
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  wizardStep >= 2
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    wizardStep >= 2
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800'
                  }`}
                >
                  2
                </div>
                <span>Kloning Indikator</span>
              </div>
              <div className='mx-2 h-0.5 flex-1 bg-gray-200 dark:bg-gray-800' />
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  wizardStep >= 3
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    wizardStep >= 3
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800'
                  }`}
                >
                  3
                </div>
                <span>Cutoff &amp; Auto-Lock</span>
              </div>
              <div className='mx-2 h-0.5 flex-1 bg-gray-200 dark:bg-gray-800' />
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  wizardStep === 4
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    wizardStep === 4
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800'
                  }`}
                >
                  4
                </div>
                <span>Konfirmasi</span>
              </div>
            </div>

            {/* Wizard Body Steps */}
            <div className='py-3'>
              {/* Step 1: Info Periode */}
              {wizardStep === 1 && (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='wizardTahun'>Tahun Evaluasi</Label>
                      <Input
                        id='wizardTahun'
                        type='number'
                        min={2020}
                        max={2050}
                        value={wizardTahun}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWizardTahun(val);
                          setWizardNama(`Evaluasi PMPRB ${val}`);
                          setWizardTglMulai(`${val}-01-01`);
                          setWizardTglSelesai(`${val}-12-31`);
                          setWizardTglCutoff(`${val}-06-30`);
                        }}
                        required
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='wizardNama'>Nama Periode Evaluasi</Label>
                      <Input
                        id='wizardNama'
                        value={wizardNama}
                        onChange={(e) => setWizardNama(e.target.value)}
                        placeholder='contoh: Evaluasi PMPRB 2026/2027'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='wizardTglMulai'>Tanggal Mulai</Label>
                      <Input
                        id='wizardTglMulai'
                        type='date'
                        value={wizardTglMulai}
                        onChange={(e) => setWizardTglMulai(e.target.value)}
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='wizardTglSelesai'>Tanggal Selesai</Label>
                      <Input
                        id='wizardTglSelesai'
                        type='date'
                        value={wizardTglSelesai}
                        onChange={(e) => setWizardTglSelesai(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className='rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200'>
                    Informasi periode ini menjadi dasar penamaan lembar kerja
                    evaluasi (LKE) dan kop dokumen rekapitulasi penilaian ZI/RB.
                  </div>
                </div>
              )}

              {/* Step 2: Kloning Indikator */}
              {wizardStep === 2 && (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-semibold'>
                      Metode Duplikasi Struktur Indikator:
                    </Label>
                    <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                      <div
                        onClick={() => setWizardCloneMode('clone_previous')}
                        className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                          wizardCloneMode === 'clone_previous'
                            ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
                        }`}
                      >
                        <div className='flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-200'>
                          <Copy className='h-4 w-4 text-purple-600' />
                          1-Click Clone dari Tahun Lalu
                        </div>
                        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                          Menyalin seluruh indikator dari periode pilihan dengan
                          reset skor &amp; status ke 0 (fresh start).
                        </p>
                      </div>

                      <div
                        onClick={() => setWizardCloneMode('master_seed')}
                        className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                          wizardCloneMode === 'master_seed'
                            ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
                        }`}
                      >
                        <div className='flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-200'>
                          <Layers className='h-4 w-4 text-purple-600' />
                          Inisialisasi Master Pertanyaan
                        </div>
                        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                          Mengisi pertanyaan langsung dari tabel master
                          pertanyaan pusat yang aktif di sistem.
                        </p>
                      </div>
                    </div>
                  </div>

                  {wizardCloneMode === 'clone_previous' && (
                    <div className='space-y-1.5'>
                      <Label htmlFor='wizardSourceSelect'>
                        Pilih Periode Template Sumber
                      </Label>
                      <Select
                        value={wizardSourceId}
                        onValueChange={(val) => setWizardSourceId(val)}
                      >
                        <SelectTrigger id='wizardSourceSelect'>
                          <SelectValue placeholder='Pilih tahun template...' />
                        </SelectTrigger>
                        <SelectContent>
                          {periodes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              Tahun {p.tahun} — {p.nama_periode} (
                              {p.totalPertanyaan} Indikator)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
                    <strong>Garansi Bersih:</strong> Berkas dokumen bukti fisik,
                    catatan revisi operator, dan skor lama tidak akan disalin
                    agar evaluasi tahun baru berjalan murni dari awal (skor 0).
                  </div>
                </div>
              )}

              {/* Step 3: Cutoff & Auto-Lock */}
              {wizardStep === 3 && (
                <div className='space-y-4'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='wizardTglCutoff'>
                      Tanggal Batas Akhir Penilaian Mandiri (Cutoff Date)
                    </Label>
                    <Input
                      id='wizardTglCutoff'
                      type='date'
                      value={wizardTglCutoff}
                      onChange={(e) => setWizardTglCutoff(e.target.value)}
                    />
                    <p className='text-muted-foreground text-[11px]'>
                      Batas akhir bagi seluruh Tim Kerja PIC Pilar untuk
                      mengunggah bukti dukung dan mengisi nilai mandiri.
                    </p>
                  </div>

                  <div className='flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50/50 p-3.5 dark:border-purple-900 dark:bg-purple-950/20'>
                    <div className='space-y-0.5'>
                      <div className='flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4 text-purple-600' />
                        <Label className='text-sm font-semibold'>
                          Auto-Lock Evaluator Otomatis
                        </Label>
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Kunci pengisian (*Read-Only*) secara otomatis saat
                        tanggal hari ini telah melewati batas cutoff untuk
                        mencegah modifikasi saat reviu TPI/TPN.
                      </p>
                    </div>
                    <Switch
                      checked={wizardAutoLock}
                      onCheckedChange={setWizardAutoLock}
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3.5'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium'>
                        Jadikan Periode Aktif Utama
                      </Label>
                      <p className='text-muted-foreground text-xs'>
                        Periode baru ini akan langsung aktif sebagai target
                        penilaian pada menu Form LKE, Kanban, dan Overview.
                      </p>
                    </div>
                    <Switch
                      checked={wizardSetActive}
                      onCheckedChange={setWizardSetActive}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Konfirmasi */}
              {wizardStep === 4 && (
                <div className='space-y-3'>
                  <div className='rounded-lg border bg-gray-50/80 p-4 dark:bg-gray-900/60'>
                    <h4 className='mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100'>
                      Ringkasan Konfigurasi Periode Baru:
                    </h4>
                    <div className='space-y-2 text-xs'>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Tahun Evaluasi:
                        </span>
                        <span className='font-bold text-gray-900 dark:text-gray-100'>
                          {wizardTahun}
                        </span>
                      </div>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Nama Periode:
                        </span>
                        <span className='font-semibold'>{wizardNama}</span>
                      </div>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Rentang Waktu:
                        </span>
                        <span>
                          {wizardTglMulai} s/d {wizardTglSelesai}
                        </span>
                      </div>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Sumber Kloning Indikator:
                        </span>
                        <Badge variant='secondary' className='text-[10px]'>
                          {wizardCloneMode === 'clone_previous'
                            ? `Template dari Periode ID: ${wizardSourceId}`
                            : 'Master Pertanyaan Default'}
                        </Badge>
                      </div>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Batas Waktu Cutoff:
                        </span>
                        <span className='font-semibold text-amber-700 dark:text-amber-300'>
                          {wizardTglCutoff || 'Tidak diatur'}
                        </span>
                      </div>
                      <div className='flex justify-between border-b pb-1.5'>
                        <span className='text-muted-foreground'>
                          Auto-Lock Evaluator:
                        </span>
                        <Badge
                          className={
                            wizardAutoLock
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-400'
                          }
                        >
                          {wizardAutoLock ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <div className='flex justify-between pt-0.5'>
                        <span className='text-muted-foreground'>
                          Status Default:
                        </span>
                        <Badge
                          className={
                            wizardSetActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-400'
                          }
                        >
                          {wizardSetActive ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='flex items-center justify-between gap-2 pt-2 sm:justify-between'>
              {wizardStep > 1 ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setWizardStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                  }
                  disabled={isPending}
                  className='gap-1 text-xs'
                >
                  <ArrowLeft className='h-3.5 w-3.5' />
                  Sebelumnya
                </Button>
              ) : (
                <div />
              )}

              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setOpenWizardDialog(false)}
                  disabled={isPending}
                  className='text-xs'
                >
                  Batal
                </Button>

                {wizardStep < 4 ? (
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => {
                      if (wizardStep === 1) {
                        const parsed = parseInt(wizardTahun, 10);
                        if (!parsed || parsed < 2020 || parsed > 2050) {
                          toast.error('Masukkan tahun yang valid.');
                          return;
                        }
                      }
                      setWizardStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
                    }}
                    className='gap-1 bg-purple-600 text-xs text-white hover:bg-purple-700'
                  >
                    Selanjutnya
                    <ArrowRight className='h-3.5 w-3.5' />
                  </Button>
                ) : (
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => handleWizardSubmit()}
                    disabled={isPending}
                    className='gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-xs text-white hover:from-purple-700 hover:to-indigo-700'
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                        Mengeksekusi Setup...
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-3.5 w-3.5' />
                        Eksekusi Setup Periode Baru
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* EDIT PERIODE & CUTOFF DIALOG                                              */}
        {/* ========================================================================= */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-blue-700 dark:text-blue-300'>
                  <Edit3 className='h-5 w-5' />
                  Edit Periode &amp; Batas Cutoff
                </DialogTitle>
                <DialogDescription>
                  Sesuaikan nama, tanggal evaluasi, batas cutoff penilaian
                  mandiri, dan status penguncian.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-1.5'>
                  <Label>Tahun Periode Evaluasi</Label>
                  <Input
                    value={editItem?.tahun ? String(editItem.tahun) : ''}
                    disabled
                    className='bg-gray-100 font-bold dark:bg-gray-800'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='editNama'>Nama Periode Evaluasi</Label>
                  <Input
                    id='editNama'
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='editTglMulai'>Tanggal Mulai</Label>
                    <Input
                      id='editTglMulai'
                      type='date'
                      value={editTglMulai}
                      onChange={(e) => setEditTglMulai(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='editTglSelesai'>Tanggal Selesai</Label>
                    <Input
                      id='editTglSelesai'
                      type='date'
                      value={editTglSelesai}
                      onChange={(e) => setEditTglSelesai(e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='editTglCutoff'
                    className='font-semibold text-purple-700 dark:text-purple-300'
                  >
                    Batas Akhir Cutoff (Penilaian Mandiri)
                  </Label>
                  <Input
                    id='editTglCutoff'
                    type='date'
                    value={editTglCutoff}
                    onChange={(e) => setEditTglCutoff(e.target.value)}
                  />
                  <p className='text-muted-foreground text-[11px]'>
                    Setelah tanggal ini lewat, sistem secara otomatis mengunci
                    seluruh form penilaian mandiri (Auto-Lock).
                  </p>
                </div>

                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <Label className='text-sm font-medium'>
                      Kunci Periode (Read-Only)
                    </Label>
                    <p className='text-muted-foreground text-xs'>
                      Kunci secara manual saat ini juga.
                    </p>
                  </div>
                  <Switch
                    checked={editIsLocked}
                    onCheckedChange={setEditIsLocked}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpenEditDialog(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MANUAL CREATE PERIODE DIALOG                                              */}
        {/* ========================================================================= */}
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-blue-600' />
                  Tambah Periode Evaluasi Baru (Manual)
                </DialogTitle>
                <DialogDescription>
                  Daftarkan tahun baru untuk siklus penilaian LKE Reformasi
                  Birokrasi.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='tahun'>Tahun Evaluasi</Label>
                  <Input
                    id='tahun'
                    type='number'
                    min={2020}
                    max={2050}
                    value={newTahun}
                    onChange={(e) => {
                      setNewTahun(e.target.value);
                      if (!newNama || newNama.startsWith('Evaluasi PMPRB')) {
                        setNewNama(`Evaluasi PMPRB ${e.target.value}`);
                        setNewTglMulai(`${e.target.value}-01-01`);
                        setNewTglSelesai(`${e.target.value}-12-31`);
                        setNewTglCutoff(`${e.target.value}-06-30`);
                      }
                    }}
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='nama'>Nama Periode Evaluasi</Label>
                  <Input
                    id='nama'
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder='contoh: Evaluasi PMPRB 2026/2027'
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='newTglMulai'>Tanggal Mulai</Label>
                    <Input
                      id='newTglMulai'
                      type='date'
                      value={newTglMulai}
                      onChange={(e) => setNewTglMulai(e.target.value)}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='newTglSelesai'>Tanggal Selesai</Label>
                    <Input
                      id='newTglSelesai'
                      type='date'
                      value={newTglSelesai}
                      onChange={(e) => setNewTglSelesai(e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='newTglCutoff'>
                    Batas Akhir Cutoff (Opsional)
                  </Label>
                  <Input
                    id='newTglCutoff'
                    type='date'
                    value={newTglCutoff}
                    onChange={(e) => setNewTglCutoff(e.target.value)}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <Label className='text-sm font-medium'>
                      Jadikan Periode Aktif
                    </Label>
                    <p className='text-muted-foreground text-xs'>
                      Periode ini akan langsung menjadi target pengisian default
                      saat ini.
                    </p>
                  </div>
                  <Switch
                    checked={newIsActive}
                    onCheckedChange={setNewIsActive}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20'>
                  <div className='space-y-0.5'>
                    <Label className='text-sm font-medium'>
                      Inisialisasi Master Indikator
                    </Label>
                    <p className='text-muted-foreground text-xs'>
                      Otomatis daftarkan seluruh pertanyaan master ke periode
                      baru dengan skor 0.
                    </p>
                  </div>
                  <Switch
                    checked={newAutoSeed}
                    onCheckedChange={setNewAutoSeed}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpenCreateDialog(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Periode'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* QUICK CLONE DIALOG                                                        */}
        {/* ========================================================================= */}
        <Dialog open={openCloneDialog} onOpenChange={setOpenCloneDialog}>
          <DialogContent className='sm:max-w-lg'>
            <form onSubmit={handleCloneSubmit}>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-300'>
                  <Copy className='h-5 w-5' />
                  Duplikasi Struktur Indikator dari Tahun Lalu
                </DialogTitle>
                <DialogDescription>
                  Salin seluruh instrumen LKE ke tahun periode baru dalam 1 kali
                  klik. Semua bukti dan skor akan otomatis di-reset ke status
                  awal.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='cloneSource'>
                    Pilih Periode Sumber (Template)
                  </Label>
                  <Select
                    value={cloneSourceId}
                    onValueChange={(val) => setCloneSourceId(val)}
                  >
                    <SelectTrigger id='cloneSource'>
                      <SelectValue placeholder='Pilih tahun template...' />
                    </SelectTrigger>
                    <SelectContent>
                      {periodes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          Tahun {p.tahun} — {p.nama_periode} (
                          {p.totalPertanyaan} Indikator)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='targetTahun'>Tahun Target Baru</Label>
                    <Input
                      id='targetTahun'
                      type='number'
                      min={2020}
                      max={2050}
                      value={cloneTargetTahun}
                      onChange={(e) => {
                        setCloneTargetTahun(e.target.value);
                        if (
                          !cloneTargetNama ||
                          cloneTargetNama.startsWith('Evaluasi PMPRB')
                        ) {
                          setCloneTargetNama(
                            `Evaluasi PMPRB ${e.target.value}`
                          );
                        }
                      }}
                      required
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label htmlFor='targetNama'>Nama Periode Baru</Label>
                    <Input
                      id='targetNama'
                      value={cloneTargetNama}
                      onChange={(e) => setCloneTargetNama(e.target.value)}
                      placeholder='misal: Evaluasi 2026'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='cloneCutoff'>
                    Batas Akhir Cutoff (Opsional)
                  </Label>
                  <Input
                    id='cloneCutoff'
                    type='date'
                    value={cloneCutoff}
                    onChange={(e) => setCloneCutoff(e.target.value)}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <Label className='text-sm font-medium'>
                      Jadikan Periode Aktif
                    </Label>
                    <p className='text-muted-foreground text-xs'>
                      Beralih ke periode baru ini langsung setelah proses
                      kloning selesai.
                    </p>
                  </div>
                  <Switch
                    checked={cloneSetActive}
                    onCheckedChange={setCloneSetActive}
                  />
                </div>

                <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
                  <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                  <span>
                    Catatan: Proses ini hanya menduplikasi{' '}
                    <strong>struktur instrumen indikator</strong>. Berkas bukti
                    dukung, catatan reviu, dan skor lama{' '}
                    <strong>tidak akan</strong> disalin agar pengisian tahun
                    baru dimulai dari bersih (0).
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpenCloneDialog(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='gap-1.5 bg-purple-600 text-white hover:bg-purple-700'
                >
                  {isPending ? (
                    <>
                      <RefreshCw className='h-4 w-4 animate-spin' />
                      Menduplikasi...
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4' />
                      Mulai Duplikasi Struktur
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION DIALOG                                                */}
        {/* ========================================================================= */}
        <AlertDialog
          open={!!deleteTargetId}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-rose-600'>
                Hapus Periode Evaluasi?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus periode evaluasi beserta seluruh
                pengisian indikator di dalamnya. Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubmit}
                disabled={isPending}
                className='bg-rose-600 text-white hover:bg-rose-700'
              >
                {isPending ? 'Menghapus...' : 'Ya, Hapus Periode'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
