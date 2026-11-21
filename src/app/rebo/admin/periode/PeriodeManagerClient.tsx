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
  Info
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
  setActivePeriode,
  toggleLockPeriode,
  duplicatePeriodeStructure,
  deletePeriode,
  getPeriodeList,
  type PeriodeWithStats
} from '@/actions/periode-actions';

interface PeriodeManagerClientProps {
  initialPeriodes: PeriodeWithStats[];
}

export default function PeriodeManagerClient({
  initialPeriodes
}: PeriodeManagerClientProps) {
  const [periodes, setPeriodes] = useState<PeriodeWithStats[]>(initialPeriodes);
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form States - Create Periode
  const [newTahun, setNewTahun] = useState<string>(
    String(new Date().getFullYear() + 1)
  );
  const [newNama, setNewNama] = useState<string>('');
  const [newIsActive, setNewIsActive] = useState<boolean>(false);
  const [newAutoSeed, setNewAutoSeed] = useState<boolean>(true);

  // Form States - Clone Periode
  const [cloneSourceId, setCloneSourceId] = useState<string>('');
  const [cloneTargetTahun, setCloneTargetTahun] = useState<string>(
    String(new Date().getFullYear() + 1)
  );
  const [cloneTargetNama, setCloneTargetNama] = useState<string>('');
  const [cloneSetActive, setCloneSetActive] = useState<boolean>(false);

  // Stats calculation
  const totalPeriodes = periodes.length;
  const activePeriode = periodes.find((p) => p.is_active);
  const lockedCount = periodes.filter((p) => p.is_locked).length;

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
              <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                Manajemen Siklus Periode LKE
              </h1>
            </div>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Kelola tahun evaluasi, penguncian berkas (*freeze*), dan kloning
              struktur indikator lintas periode
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshList}
              disabled={isPending}
              className='gap-1.5'
            >
              <RefreshCw
                className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
              />
              Segarkan
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (periodes.length > 0) {
                  setCloneSourceId(activePeriode?.id || periodes[0].id);
                  const nextYr = (activePeriode?.tahun || 2025) + 1;
                  setCloneTargetTahun(String(nextYr));
                  setCloneTargetNama(`Evaluasi PMPRB ${nextYr}`);
                }
                setOpenCloneDialog(true);
              }}
              className='gap-1.5 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50'
            >
              <Copy className='h-4 w-4' />
              Duplikasi dari Tahun Lalu
            </Button>

            <Button
              size='sm'
              onClick={() => {
                const nextYr =
                  (activePeriode?.tahun || new Date().getFullYear()) + 1;
                setNewTahun(String(nextYr));
                setNewNama(`Evaluasi PMPRB ${nextYr}`);
                setOpenCreateDialog(true);
              }}
              className='gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            >
              <Plus className='h-4 w-4' />
              Tambah Tahun Baru
            </Button>
          </div>
        </div>

        {/* Highlight Summary Stats */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
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
                'Silakan pilih periode aktif di bawah'}
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
              Tahun lampau yang berstatus Read-Only aman dari pengeditan
            </CardContent>
          </Card>
        </div>

        {/* Info Banner Fitur Kloning */}
        <div className='flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50/80 p-4 text-purple-900 dark:border-purple-800/60 dark:bg-purple-950/30 dark:text-purple-200'>
          <Info className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
          <div className='space-y-1 text-sm'>
            <p className='font-semibold'>
              Fitur Unggulan V2: Duplikasi Struktur Indikator Lintas Tahun
              (1-Click Clone)
            </p>
            <p className='text-xs text-purple-700 dark:text-purple-300'>
              Saat memasuki tahun anggaran baru, Admin tidak perlu menginput
              ulang puluhan instrumen pertanyaan dari nol. Gunakan tombol{' '}
              <strong>Duplikasi Struktur</strong> pada salah satu kartu periode
              untuk menyalin seluruh daftar pertanyaan dengan otomatis mereset
              status kelengkapan ke <em>Belum Diisi (0)</em>.
            </p>
          </div>
        </div>

        {/* Grid Cards Periode List */}
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Daftar Tahun Periode Evaluasi
          </h2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {periodes.map((p) => {
              const isActive = p.is_active;
              const isLocked = p.is_locked;

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

        {/* Dialog Tambah Periode Baru */}
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-blue-600' />
                  Tambah Periode Evaluasi Baru
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
                      Kloning Master Indikator
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

        {/* Dialog Duplikasi Struktur Indikator Lintas Tahun */}
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

        {/* Dialog Konfirmasi Hapus Periode */}
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
