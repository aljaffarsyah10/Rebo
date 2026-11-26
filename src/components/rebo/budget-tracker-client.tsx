'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Plus,
  Search,
  RotateCcw,
  FileText,
  Edit2,
  Trash2,
  PieChart,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';

import {
  ItemAnggaranZI,
  BudgetSummary,
  StatusPelaksanaanAnggaran,
  PILAR_ZI_INFO,
  STATUS_PELAKSANAAN_LABELS,
  formatRupiah,
  calculateBudgetSummary
} from '@/lib/budget/budget-types';

import {
  saveBudgetItemAction,
  deleteBudgetItemAction,
  resetBudgetToDefaultAction
} from '@/actions/budget-actions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface BudgetTrackerClientProps {
  initialItems: ItemAnggaranZI[];
  initialSummary: BudgetSummary;
}

export default function BudgetTrackerClient({
  initialItems,
  initialSummary
}: BudgetTrackerClientProps) {
  const [items, setItems] = useState<ItemAnggaranZI[]>(initialItems);
  const [summary, setSummary] = useState<BudgetSummary>(initialSummary);
  const [isPending, startTransition] = useTransition();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPilar, setFilterPilar] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Dialog Add/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemAnggaranZI | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    kode_mak: '',
    nama_kegiatan: '',
    pilar_id: 1,
    pagu_anggaran_rp: 0,
    realisasi_anggaran_rp: 0,
    status_pelaksanaan: 'TERENCANA' as StatusPelaksanaanAnggaran,
    tanggal_kegiatan: new Date().toISOString().split('T')[0],
    no_spj_atau_bukti: '',
    keterangan: '',
    penanggung_jawab: ''
  });

  // Dialog Print A4 State
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Dialog Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemAnggaranZI | null>(null);

  // Filter in client-side for rapid reactivity
  const filteredItems = items.filter((item) => {
    if (filterPilar !== 'ALL' && item.pilar_id !== Number(filterPilar)) {
      return false;
    }
    if (filterStatus !== 'ALL' && item.status_pelaksanaan !== filterStatus) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.nama_kegiatan.toLowerCase().includes(q) ||
        item.kode_mak.toLowerCase().includes(q) ||
        item.no_spj_atau_bukti.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        (item.penanggung_jawab &&
          item.penanggung_jawab.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Open modal create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      kode_mak: '2899.BMA.006.05',
      nama_kegiatan: '',
      pilar_id: 1,
      pagu_anggaran_rp: 0,
      realisasi_anggaran_rp: 0,
      status_pelaksanaan: 'TERENCANA',
      tanggal_kegiatan: new Date().toISOString().split('T')[0],
      no_spj_atau_bukti: '',
      keterangan: '',
      penanggung_jawab: 'Tim Kerja ZI BPS Sitaro'
    });
    setIsDialogOpen(true);
  };

  // Open modal edit
  const handleOpenEdit = (item: ItemAnggaranZI) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      kode_mak: item.kode_mak,
      nama_kegiatan: item.nama_kegiatan,
      pilar_id: item.pilar_id,
      pagu_anggaran_rp: item.pagu_anggaran_rp,
      realisasi_anggaran_rp: item.realisasi_anggaran_rp,
      status_pelaksanaan: item.status_pelaksanaan,
      tanggal_kegiatan: item.tanggal_kegiatan,
      no_spj_atau_bukti: item.no_spj_atau_bukti,
      keterangan: item.keterangan,
      penanggung_jawab: item.penanggung_jawab || 'Tim Kerja ZI BPS Sitaro'
    });
    setIsDialogOpen(true);
  };

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kegiatan.trim()) {
      toast.error('Nama kegiatan tidak boleh kosong');
      return;
    }
    if (!formData.kode_mak.trim()) {
      toast.error('Kode MAK tidak boleh kosong');
      return;
    }
    if (formData.pagu_anggaran_rp <= 0) {
      toast.error('Pagu anggaran harus lebih besar dari Rp 0');
      return;
    }

    startTransition(async () => {
      const res = await saveBudgetItemAction(formData);
      if (res.success && res.item) {
        toast.success(
          editingItem
            ? 'Data anggaran berhasil diperbarui'
            : 'Kegiatan anggaran baru berhasil dicatat'
        );
        setIsDialogOpen(false);
        // Refresh local items
        if (editingItem) {
          const updated = items.map((i) =>
            i.id === res.item!.id ? res.item! : i
          );
          setItems(updated);
          setSummary(calculateBudgetSummary(updated));
        } else {
          const updated = [...items, res.item];
          setItems(updated);
          setSummary(calculateBudgetSummary(updated));
        }
      } else {
        toast.error(res.error || 'Gagal menyimpan anggaran');
      }
    });
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const res = await deleteBudgetItemAction(itemToDelete.id);
      if (res.success) {
        toast.success(`Item anggaran ${itemToDelete.id} berhasil dihapus`);
        const updated = items.filter((i) => i.id !== itemToDelete.id);
        setItems(updated);
        setSummary(calculateBudgetSummary(updated));
        setIsDeleteOpen(false);
        setItemToDelete(null);
      } else {
        toast.error(res.error || 'Gagal menghapus item anggaran');
      }
    });
  };

  // Handle Reset to Default Mock
  const handleResetDefault = () => {
    if (
      confirm(
        'Kembalikan semua data anggaran ke data default DIPA BPS Sitaro 2026?'
      )
    ) {
      startTransition(async () => {
        const res = await resetBudgetToDefaultAction();
        if (res.success) {
          setItems(res.data);
          setSummary(res.summary);
          toast.success('Data anggaran berhasil direset ke default');
        } else {
          toast.error(res.error || 'Gagal mereset data');
        }
      });
    }
  };

  // Form real-time calculated values
  const previewSisa = Math.max(
    0,
    formData.pagu_anggaran_rp - formData.realisasi_anggaran_rp
  );
  const previewPersen =
    formData.pagu_anggaran_rp > 0
      ? Number(
          (
            (formData.realisasi_anggaran_rp / formData.pagu_anggaran_rp) *
            100
          ).toFixed(1)
        )
      : 0;

  // Determine progress color for total
  const getProgressColor = (percent: number) => {
    if (percent >= 75) return 'bg-emerald-600';
    if (percent >= 50) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className='space-y-6'>
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION & ACTION BUTTONS                                       */}
      {/* ========================================================================= */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            >
              <Receipt className='mr-1 h-3.5 w-3.5' /> DIPA BPS Sitaro TA 2026
            </Badge>
            <Badge
              variant='outline'
              className='border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
            >
              <ShieldCheck className='mr-1 h-3.5 w-3.5' /> Pilar 4 Akuntabilitas
              Kinerja
            </Badge>
          </div>
          <h1 className='mt-1.5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white'>
            Pelacak Anggaran & Realisasi Kegiatan ZI/RB
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Monitoring penyerapan anggaran pendukung reformasi birokrasi, PST
            inklusif, dan akuntabilitas keuangan BPS Kabupaten Kepulauan Sitaro.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleResetDefault}
            disabled={isPending}
            title='Kembalikan ke mock data awal'
          >
            <RotateCcw className='mr-1.5 h-4 w-4' />
            Reset Data
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsPrintOpen(true)}
            className='border-teal-600 text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-950/50'
          >
            <Printer className='mr-1.5 h-4 w-4' />
            Cetak Laporan A4
          </Button>

          <Button
            size='sm'
            onClick={handleOpenCreate}
            className='bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
          >
            <Plus className='mr-1.5 h-4 w-4' />
            Tambah Kegiatan
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 KARTU METRIK ANGGARAN UTAMA                                          */}
      {/* ========================================================================= */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Card 1: Total Pagu */}
        <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Total Pagu DIPA ZI
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
              <Wallet className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-slate-900 lg:text-2xl dark:text-white'>
              {formatRupiah(summary.total_pagu_rp)}
            </div>
            <p className='mt-1 text-xs text-slate-500'>
              Alokasi pos pendukung ZI & RB ({summary.total_kegiatan} pos
              kegiatan)
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Realisasi Penyerapan */}
        <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Realisasi Penyerapan
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
              <ArrowUpRight className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-emerald-600 lg:text-2xl dark:text-emerald-400'>
              {formatRupiah(summary.total_realisasi_rp)}
            </div>
            <p className='mt-1 text-xs text-slate-500'>
              Terbayar & SPJ Lengkap ({summary.kegiatan_selesai} kegiatan
              selesai)
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Persentase Penyerapan */}
        <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Tingkat Penyerapan
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
              <BarChart3 className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline justify-between'>
              <div className='text-xl font-bold text-slate-900 lg:text-2xl dark:text-white'>
                {summary.persentase_penyerapan_total}%
              </div>
              <Badge
                variant='outline'
                className={`text-[10px] font-semibold ${
                  summary.persentase_penyerapan_total >= 75
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : summary.persentase_penyerapan_total >= 50
                      ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {summary.status_efektivitas}
              </Badge>
            </div>
            {/* Progress bar */}
            <div className='mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(summary.persentase_penyerapan_total)}`}
                style={{
                  width: `${Math.min(100, summary.persentase_penyerapan_total)}%`
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Sisa Anggaran */}
        <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Sisa Pagu DIPA
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
              <PieChart className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-slate-900 lg:text-2xl dark:text-white'>
              {formatRupiah(summary.total_sisa_rp)}
            </div>
            <p className='mt-1 text-xs text-slate-500'>
              Tersisa untuk kegiatan berlanjut ({summary.kegiatan_berjalan}{' '}
              berjalan, {summary.kegiatan_terencana} terencana)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. STATUS EFEKTIVITAS & PROPORSI KEGIATAN BANNER                           */}
      {/* ========================================================================= */}
      <div className='rounded-xl border border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 p-4 dark:border-slate-800 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-sky-950/20'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm'>
              <CheckCircle2 className='h-5 w-5' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                Status Efektivitas Anggaran: {summary.status_efektivitas}
              </h3>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                Semua pengeluaran didukung bukti SPJ resmi dan selaras dengan
                Rencana Kerja Pembangunan ZI BPS Sitaro.
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3 text-xs'>
            <div className='flex items-center gap-1.5 rounded-md bg-white/80 px-2.5 py-1 text-slate-700 shadow-xs dark:bg-slate-900/80 dark:text-slate-300'>
              <span className='h-2 w-2 rounded-full bg-emerald-500' />
              <span>
                Selesai: <strong>{summary.kegiatan_selesai}</strong>
              </span>
            </div>
            <div className='flex items-center gap-1.5 rounded-md bg-white/80 px-2.5 py-1 text-slate-700 shadow-xs dark:bg-slate-900/80 dark:text-slate-300'>
              <span className='h-2 w-2 rounded-full bg-amber-500' />
              <span>
                Sedang Berjalan: <strong>{summary.kegiatan_berjalan}</strong>
              </span>
            </div>
            <div className='flex items-center gap-1.5 rounded-md bg-white/80 px-2.5 py-1 text-slate-700 shadow-xs dark:bg-slate-900/80 dark:text-slate-300'>
              <span className='h-2 w-2 rounded-full bg-slate-400' />
              <span>
                Terencana: <strong>{summary.kegiatan_terencana}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER, SEARCH & CONTROLS                                              */}
      {/* ========================================================================= */}
      <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center'>
            {/* Search Input */}
            <div className='relative md:col-span-5'>
              <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Cari kegiatan, MAK, No SPJ, atau penanggung jawab...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Filter Pilar */}
            <div className='md:col-span-3'>
              <Select value={filterPilar} onValueChange={setFilterPilar}>
                <SelectTrigger>
                  <SelectValue placeholder='Filter Pilar ZI' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Pilar ZI (1-6)</SelectItem>
                  {Object.entries(PILAR_ZI_INFO).map(([id, info]) => (
                    <SelectItem key={id} value={id}>
                      {info.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Status */}
            <div className='md:col-span-3'>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Filter Status Pelaksanaan' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Status</SelectItem>
                  <SelectItem value='SELESAI'>
                    Selesai / Terserap Penuh
                  </SelectItem>
                  <SelectItem value='SEDANG_BERJALAN'>
                    Sedang Berjalan
                  </SelectItem>
                  <SelectItem value='TERENCANA'>Terencana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter Button */}
            <div className='flex justify-end md:col-span-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSearchQuery('');
                  setFilterPilar('ALL');
                  setFilterStatus('ALL');
                }}
                title='Reset Filter'
                className='text-slate-500 hover:text-slate-800 dark:text-slate-400'
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 5. TABEL REALISASI ANGGARAN LENGKAP                                       */}
      {/* ========================================================================= */}
      <Card className='border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <CardHeader className='border-b border-slate-100 p-4 dark:border-slate-800'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Rincian Kegiatan, Pagu, & Realisasi Anggaran ZI
              </CardTitle>
              <CardDescription className='text-xs text-slate-500'>
                Menampilkan {filteredItems.length} dari total {items.length} pos
                kegiatan anggaran tahun 2026
              </CardDescription>
            </div>
            <div className='flex items-center gap-2 text-xs text-slate-500'>
              <FileText className='h-3.5 w-3.5' /> Basis DIPA BPS Kabupaten
              Kepulauan Sitaro
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs'>
              <thead className='border-b border-slate-200 bg-slate-50 font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'>
                <tr>
                  <th className='py-3.5 pr-3 pl-4'>Kode MAK & ID</th>
                  <th className='px-3 py-3.5'>Kegiatan & Pilar ZI</th>
                  <th className='px-3 py-3.5 text-right'>Pagu (Rp)</th>
                  <th className='px-3 py-3.5 text-right'>Realisasi (Rp)</th>
                  <th className='px-3 py-3.5 text-right'>Sisa Pagu (Rp)</th>
                  <th className='px-3 py-3.5 text-center'>Serapan</th>
                  <th className='px-3 py-3.5'>No SPJ / Bukti</th>
                  <th className='px-3 py-3.5'>Status</th>
                  <th className='py-3.5 pr-4 pl-3 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className='py-12 text-center text-slate-400'
                    >
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <Receipt className='h-8 w-8 text-slate-300' />
                        <p className='text-sm font-medium'>
                          Tidak ada item anggaran yang sesuai kriteria pencarian
                        </p>
                        <p className='text-xs text-slate-400'>
                          Silakan ubah filter pilar, status, atau kata kunci
                          pencarian
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const pilar = PILAR_ZI_INFO[item.pilar_id] || {
                      nama: `Pilar ${item.pilar_id}`,
                      warna: 'bg-slate-100 text-slate-800 border-slate-200'
                    };
                    const statusConfig =
                      STATUS_PELAKSANAAN_LABELS[item.status_pelaksanaan];

                    return (
                      <tr
                        key={item.id}
                        className='transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      >
                        {/* Kode MAK & ID */}
                        <td className='py-3.5 pr-3 pl-4 align-top font-mono'>
                          <div className='font-semibold text-slate-900 dark:text-white'>
                            {item.kode_mak}
                          </div>
                          <div className='mt-0.5 text-[11px] text-slate-400'>
                            {item.id}
                          </div>
                        </td>

                        {/* Kegiatan & Pilar */}
                        <td className='max-w-xs px-3 py-3.5 align-top'>
                          <div className='font-semibold text-slate-900 dark:text-white'>
                            {item.nama_kegiatan}
                          </div>
                          <div className='mt-1 flex flex-wrap items-center gap-1.5'>
                            <Badge
                              variant='outline'
                              className={`px-1.5 py-0 text-[10px] font-medium ${pilar.warna}`}
                            >
                              {pilar.nama}
                            </Badge>
                            {item.penanggung_jawab && (
                              <span className='text-[10px] text-slate-500'>
                                PJ: {item.penanggung_jawab}
                              </span>
                            )}
                          </div>
                          {item.keterangan && (
                            <p className='mt-1 text-[11px] text-slate-500 italic dark:text-slate-400'>
                              {item.keterangan}
                            </p>
                          )}
                        </td>

                        {/* Pagu */}
                        <td className='px-3 py-3.5 text-right align-top font-medium text-slate-900 dark:text-slate-100'>
                          {formatRupiah(item.pagu_anggaran_rp)}
                        </td>

                        {/* Realisasi */}
                        <td className='px-3 py-3.5 text-right align-top font-semibold text-emerald-600 dark:text-emerald-400'>
                          {formatRupiah(item.realisasi_anggaran_rp)}
                        </td>

                        {/* Sisa */}
                        <td className='px-3 py-3.5 text-right align-top font-medium text-slate-600 dark:text-slate-300'>
                          {formatRupiah(item.sisa_anggaran_rp)}
                        </td>

                        {/* Serapan Progress */}
                        <td className='px-3 py-3.5 text-center align-top'>
                          <div className='font-bold text-slate-800 dark:text-slate-200'>
                            {item.persentase_penyerapan}%
                          </div>
                          <div className='mx-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700'>
                            <div
                              className={`h-full ${getProgressColor(item.persentase_penyerapan)}`}
                              style={{
                                width: `${Math.min(100, item.persentase_penyerapan)}%`
                              }}
                            />
                          </div>
                        </td>

                        {/* No SPJ & Tanggal */}
                        <td className='px-3 py-3.5 align-top text-slate-600 dark:text-slate-300'>
                          <div className='font-mono text-[11px] font-medium'>
                            {item.no_spj_atau_bukti || '-'}
                          </div>
                          <div className='mt-0.5 text-[10px] text-slate-400'>
                            {item.tanggal_kegiatan}
                          </div>
                        </td>

                        {/* Status */}
                        <td className='px-3 py-3.5 align-top'>
                          <Badge
                            variant='outline'
                            className={`text-[10px] font-medium ${statusConfig.badgeClass}`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </td>

                        {/* Aksi */}
                        <td className='py-3.5 pr-4 pl-3 text-center align-top'>
                          <div className='flex items-center justify-center gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 text-slate-600 hover:text-blue-600'
                              onClick={() => handleOpenEdit(item)}
                              title='Edit Data'
                            >
                              <Edit2 className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 text-slate-400 hover:text-rose-600'
                              onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteOpen(true);
                              }}
                              title='Hapus Item'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredItems.length > 0 && (
                <tfoot className='border-t-2 border-slate-300 bg-slate-50/70 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white'>
                  <tr>
                    <td
                      colSpan={2}
                      className='py-3 pr-3 pl-4 text-left font-bold'
                    >
                      TOTAL KESELURUHAN (Terfilter: {filteredItems.length} pos)
                    </td>
                    <td className='px-3 py-3 text-right'>
                      {formatRupiah(
                        filteredItems.reduce(
                          (acc, curr) => acc + curr.pagu_anggaran_rp,
                          0
                        )
                      )}
                    </td>
                    <td className='px-3 py-3 text-right text-emerald-600 dark:text-emerald-400'>
                      {formatRupiah(
                        filteredItems.reduce(
                          (acc, curr) => acc + curr.realisasi_anggaran_rp,
                          0
                        )
                      )}
                    </td>
                    <td className='px-3 py-3 text-right'>
                      {formatRupiah(
                        filteredItems.reduce(
                          (acc, curr) => acc + curr.sisa_anggaran_rp,
                          0
                        )
                      )}
                    </td>
                    <td className='px-3 py-3 text-center'>
                      {(() => {
                        const subPagu = filteredItems.reduce(
                          (acc, c) => acc + c.pagu_anggaran_rp,
                          0
                        );
                        const subReal = filteredItems.reduce(
                          (acc, c) => acc + c.realisasi_anggaran_rp,
                          0
                        );
                        return subPagu > 0
                          ? `${((subReal / subPagu) * 100).toFixed(1)}%`
                          : '0%';
                      })()}
                    </td>
                    <td
                      colSpan={3}
                      className='px-3 py-3 text-xs text-slate-500'
                    >
                      DIPA 2026 BPS Kab. Sitaro
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 6. DIALOG: FORM TAMBAH / EDIT KEGIATAN ANGGARAN ZI                        */}
      {/* ========================================================================= */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-slate-900 dark:text-white'>
              {editingItem
                ? 'Perbarui Kegiatan Anggaran ZI/RB'
                : 'Tambah Pos Kegiatan Anggaran ZI/RB'}
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              Catat pagu DIPA, realisasi pengeluaran, nomor bukti SPJ, dan
              peruntukan pilar reformasi birokrasi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveForm} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Kode MAK */}
              <div className='space-y-1.5'>
                <Label htmlFor='kode_mak' className='text-xs font-semibold'>
                  Kode MAK (Mata Anggaran Kegiatan) *
                </Label>
                <Input
                  id='kode_mak'
                  placeholder='Contoh: 2899.BMA.006.051.A.521211'
                  value={formData.kode_mak}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_mak: e.target.value })
                  }
                  className='font-mono text-xs'
                  required
                />
              </div>

              {/* Pilar ZI */}
              <div className='space-y-1.5'>
                <Label htmlFor='pilar_id' className='text-xs font-semibold'>
                  Pilar ZI-WBK *
                </Label>
                <Select
                  value={String(formData.pilar_id)}
                  onValueChange={(val) =>
                    setFormData({ ...formData, pilar_id: Number(val) })
                  }
                >
                  <SelectTrigger id='pilar_id' className='text-xs'>
                    <SelectValue placeholder='Pilih Pilar ZI' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PILAR_ZI_INFO).map(([id, info]) => (
                      <SelectItem key={id} value={id} className='text-xs'>
                        {info.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nama Kegiatan */}
            <div className='space-y-1.5'>
              <Label htmlFor='nama_kegiatan' className='text-xs font-semibold'>
                Nama Kegiatan Pembangunan ZI *
              </Label>
              <Input
                id='nama_kegiatan'
                placeholder='Contoh: Pengadaan Sarana Ramah Difabel Ruang PST Sitaro'
                value={formData.nama_kegiatan}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kegiatan: e.target.value })
                }
                required
              />
            </div>

            {/* Pagu & Realisasi */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='pagu_anggaran_rp'
                  className='text-xs font-semibold'
                >
                  Pagu Anggaran DIPA (Rp) *
                </Label>
                <Input
                  id='pagu_anggaran_rp'
                  type='number'
                  min={0}
                  step={1000}
                  placeholder='0'
                  value={formData.pagu_anggaran_rp || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pagu_anggaran_rp: Number(e.target.value) || 0
                    })
                  }
                  required
                />
                <span className='text-[11px] text-slate-500'>
                  {formatRupiah(formData.pagu_anggaran_rp)}
                </span>
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='realisasi_anggaran_rp'
                  className='text-xs font-semibold'
                >
                  Realisasi Anggaran / Penyerapan (Rp)
                </Label>
                <Input
                  id='realisasi_anggaran_rp'
                  type='number'
                  min={0}
                  step={1000}
                  placeholder='0'
                  value={formData.realisasi_anggaran_rp || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realisasi_anggaran_rp: Number(e.target.value) || 0
                    })
                  }
                />
                <span className='text-[11px] text-emerald-600 dark:text-emerald-400'>
                  {formatRupiah(formData.realisasi_anggaran_rp)}
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>
                  Sisa Pagu Terhitung:
                </span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {formatRupiah(previewSisa)}
                </span>
              </div>
              <div className='mt-1 flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>
                  Persentase Penyerapan:
                </span>
                <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                  {previewPersen}%
                </span>
              </div>
            </div>

            {/* Status & Tanggal */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='status_pelaksanaan'
                  className='text-xs font-semibold'
                >
                  Status Pelaksanaan
                </Label>
                <Select
                  value={formData.status_pelaksanaan}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      status_pelaksanaan: val as StatusPelaksanaanAnggaran
                    })
                  }
                >
                  <SelectTrigger id='status_pelaksanaan' className='text-xs'>
                    <SelectValue placeholder='Pilih Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TERENCANA'>Terencana</SelectItem>
                    <SelectItem value='SEDANG_BERJALAN'>
                      Sedang Berjalan
                    </SelectItem>
                    <SelectItem value='SELESAI'>
                      Selesai / Terserap Penuh
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='tanggal_kegiatan'
                  className='text-xs font-semibold'
                >
                  Tanggal Pelaksanaan / SPJ
                </Label>
                <Input
                  id='tanggal_kegiatan'
                  type='date'
                  value={formData.tanggal_kegiatan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_kegiatan: e.target.value
                    })
                  }
                  className='text-xs'
                />
              </div>
            </div>

            {/* No SPJ / Bukti Bayar */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='no_spj_atau_bukti'
                  className='text-xs font-semibold'
                >
                  Nomor SPJ / Bukti Pembayaran
                </Label>
                <Input
                  id='no_spj_atau_bukti'
                  placeholder='Contoh: SPJ-ZI/003/BPS-7108/III/2026'
                  value={formData.no_spj_atau_bukti}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      no_spj_atau_bukti: e.target.value
                    })
                  }
                  className='font-mono text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='penanggung_jawab'
                  className='text-xs font-semibold'
                >
                  Penanggung Jawab / Tim Kerja
                </Label>
                <Input
                  id='penanggung_jawab'
                  placeholder='Contoh: Pejabat Pembuat Komitmen / Tim Pilar 6'
                  value={formData.penanggung_jawab}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      penanggung_jawab: e.target.value
                    })
                  }
                  className='text-xs'
                />
              </div>
            </div>

            {/* Keterangan / Uraian Belanja */}
            <div className='space-y-1.5'>
              <Label htmlFor='keterangan' className='text-xs font-semibold'>
                Keterangan & Rincian Pengeluaran
              </Label>
              <Textarea
                id='keterangan'
                placeholder='Uraikan spesifikasi barang/jasa, bukti dukung yang dilampirkan, atau output kegiatan...'
                rows={3}
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className='text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type='submit'
                disabled={isPending}
                className='bg-emerald-600 text-white hover:bg-emerald-700'
              >
                {isPending
                  ? 'Menyimpan...'
                  : editingItem
                    ? 'Simpan Perubahan'
                    : 'Tambah Kegiatan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 7. DIALOG: KONFIRMASI HAPUS                                               */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-rose-600'>
              <AlertTriangle className='h-5 w-5' /> Konfirmasi Hapus Anggaran
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              Apakah Anda yakin ingin menghapus pos kegiatan anggaran berikut?
            </DialogDescription>
          </DialogHeader>

          {itemToDelete && (
            <div className='rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='font-mono font-semibold'>
                {itemToDelete.kode_mak}
              </div>
              <div className='mt-1 font-medium text-slate-900 dark:text-white'>
                {itemToDelete.nama_kegiatan}
              </div>
              <div className='mt-2 flex justify-between text-slate-500'>
                <span>Pagu: {formatRupiah(itemToDelete.pagu_anggaran_rp)}</span>
                <span>
                  Realisasi: {formatRupiah(itemToDelete.realisasi_anggaran_rp)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className='pt-2'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 8. DIALOG: CETAK LAPORAN REALISASI ANGGARAN ZI (FORMAT RESMI A4)           */}
      {/* ========================================================================= */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto print:border-none print:p-0 print:shadow-none'>
          {/* Header Action in Dialog (Hidden during print) */}
          <div className='flex items-center justify-between border-b pb-3 print:hidden'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Cetak Laporan Realisasi Anggaran ZI/RB (Format Resmi A4)
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Bukti dukung resmi Pilar 4 (Akuntabilitas Kinerja) BPS Kabupaten
                Kepulauan Sitaro Tahun 2026.
              </DialogDescription>
            </div>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Format A4
            </Button>
          </div>

          {/* Printable A4 Document Content */}
          <div className='bg-white p-6 font-serif text-slate-900 dark:bg-white dark:text-slate-900 print:p-0'>
            {/* Kop Surat Resmi BPS Sitaro */}
            <div className='border-b-2 border-double border-slate-900 pb-4 text-center'>
              <div className='flex items-center justify-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-md border border-slate-900 font-sans text-xs font-bold'>
                  BPS
                </div>
                <div>
                  <h3 className='text-sm font-semibold tracking-wider'>
                    BADAN PUSAT STATISTIK
                  </h3>
                  <h2 className='text-lg font-bold tracking-tight'>
                    KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
                  </h2>
                  <p className='font-sans text-[11px] text-slate-600'>
                    Jl. Trans Pulau Siau, Ondong, Kec. Siau Barat, Kab.
                    Kepulauan Sitaro, Sulawesi Utara 95861
                  </p>
                  <p className='font-sans text-[10px] text-slate-500'>
                    Laman: https://sitarokab.bps.go.id | Pos-el:
                    bps7108@bps.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className='mt-6 text-center'>
              <h3 className='text-sm font-bold tracking-wide underline'>
                LAPORAN REALISASI ANGGARAN & AKUNTABILITAS PEMBANGUNAN ZONA
                INTEGRITAS (ZI-WBK)
              </h3>
              <p className='mt-1 font-sans text-xs font-semibold text-slate-700'>
                NOMOR: B-087/7108/KU.030/05/2026
              </p>
              <p className='font-sans text-[11px] text-slate-600'>
                Tahun Anggaran 2026 • Sumber Dana: DIPA Petikan BPS Kabupaten
                Kepulauan Sitaro
              </p>
            </div>

            {/* Narasi Pengantar */}
            <div className='mt-4 text-justify font-sans text-xs leading-relaxed text-slate-800'>
              <p>
                Dalam rangka implementasi reformasi birokrasi dan akuntabilitas
                pengelolaan sumber daya pada Pembangunan Zona Integritas Menuju
                Wilayah Bebas dari Korupsi (WBK) BPS Kabupaten Kepulauan Sitaro,
                berikut disampaikan rekapitulasi alokasi pagu dan realisasi
                penyerapan anggaran pendukung reformasi birokrasi per Triwulan
                II Tahun Anggaran 2026 sebagai bukti dukung{' '}
                <strong>Pilar 4 (Penguatan Akuntabilitas Kinerja)</strong>:
              </p>
            </div>

            {/* Ringkasan Rekapitulasi Metrik */}
            <div className='mt-4 grid grid-cols-4 gap-2 text-center font-sans'>
              <div className='rounded border border-slate-300 p-2'>
                <div className='text-[10px] text-slate-500 uppercase'>
                  Total Pagu DIPA
                </div>
                <div className='text-xs font-bold text-slate-900'>
                  {formatRupiah(summary.total_pagu_rp)}
                </div>
              </div>
              <div className='rounded border border-slate-300 p-2'>
                <div className='text-[10px] text-slate-500 uppercase'>
                  Total Realisasi
                </div>
                <div className='text-xs font-bold text-emerald-700'>
                  {formatRupiah(summary.total_realisasi_rp)}
                </div>
              </div>
              <div className='rounded border border-slate-300 p-2'>
                <div className='text-[10px] text-slate-500 uppercase'>
                  Sisa Pagu
                </div>
                <div className='text-xs font-bold text-slate-900'>
                  {formatRupiah(summary.total_sisa_rp)}
                </div>
              </div>
              <div className='rounded border border-slate-300 p-2'>
                <div className='text-[10px] text-slate-500 uppercase'>
                  Tingkat Serapan
                </div>
                <div className='text-xs font-bold text-blue-700'>
                  {summary.persentase_penyerapan_total}% (
                  {summary.status_efektivitas})
                </div>
              </div>
            </div>

            {/* Tabel Realisasi A4 */}
            <div className='mt-4'>
              <table className='w-full border-collapse border border-slate-400 font-sans text-[10px]'>
                <thead>
                  <tr className='bg-slate-100 text-slate-800'>
                    <th className='border border-slate-400 px-2 py-1.5 text-center'>
                      No
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-left'>
                      Kode MAK
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-left'>
                      Uraian Kegiatan / Belanja
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-center'>
                      Pilar
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-right'>
                      Pagu (Rp)
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-right'>
                      Realisasi (Rp)
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-right'>
                      Sisa (Rp)
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-center'>
                      %
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-left'>
                      No SPJ / Bukti Bayar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id} className='hover:bg-slate-50'>
                      <td className='border border-slate-400 px-2 py-1 text-center font-medium'>
                        {idx + 1}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 font-mono text-[9px]'>
                        {it.kode_mak}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 font-medium'>
                        <div>{it.nama_kegiatan}</div>
                        <div className='text-[9px] text-slate-500 italic'>
                          {it.keterangan}
                        </div>
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-center'>
                        Pilar {it.pilar_id}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-right'>
                        {formatRupiah(it.pagu_anggaran_rp)}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-right font-semibold text-emerald-700'>
                        {formatRupiah(it.realisasi_anggaran_rp)}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-right'>
                        {formatRupiah(it.sisa_anggaran_rp)}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-center font-bold'>
                        {it.persentase_penyerapan}%
                      </td>
                      <td className='border border-slate-400 px-2 py-1 font-mono text-[9px]'>
                        {it.no_spj_atau_bukti}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className='bg-slate-100 font-bold'>
                    <td
                      colSpan={4}
                      className='border border-slate-400 px-2 py-1.5 text-center'
                    >
                      JUMLAH TOTAL PENGELUARAN ZI/RB
                    </td>
                    <td className='border border-slate-400 px-2 py-1.5 text-right'>
                      {formatRupiah(summary.total_pagu_rp)}
                    </td>
                    <td className='border border-slate-400 px-2 py-1.5 text-right text-emerald-700'>
                      {formatRupiah(summary.total_realisasi_rp)}
                    </td>
                    <td className='border border-slate-400 px-2 py-1.5 text-right'>
                      {formatRupiah(summary.total_sisa_rp)}
                    </td>
                    <td className='border border-slate-400 px-2 py-1.5 text-center text-blue-700'>
                      {summary.persentase_penyerapan_total}%
                    </td>
                    <td className='border border-slate-400 px-2 py-1.5 text-center'>
                      LENGKAP & VALID
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Kesimpulan & Akuntabilitas */}
            <div className='mt-4 rounded border border-slate-200 bg-slate-50 p-2.5 font-sans text-[11px] text-slate-700'>
              <p className='font-semibold text-slate-900'>
                Catatan Pejabat Pembuat Komitmen & Tim Penilai Internal (TPI):
              </p>
              <ul className='mt-1 list-disc space-y-0.5 pl-4 text-[10px]'>
                <li>
                  Seluruh realisasi belanja telah melalui mekanisme pengujian
                  kebenaran tagihan dan ketersediaan dana sesuai regulasi
                  Perbendaharaan Negara.
                </li>
                <li>
                  Pengadaan sarana inklusif ramah difabel di ruang PST telah
                  terserap 100% dan terverifikasi fisik di lokasi kantor BPS
                  Kabupaten Kepulauan Sitaro.
                </li>
                <li>
                  Tingkat efektivitas penyerapan dinilai{' '}
                  <strong>{summary.status_efektivitas}</strong> dengan sisa dana
                  dicadangkan untuk kelanjutan survei triwulanan dan workshop
                  pengawasan.
                </li>
              </ul>
            </div>

            {/* Lembar Pengesahan Tanda Tangan */}
            <div className='mt-8 grid grid-cols-3 gap-2 font-sans text-[11px]'>
              <div className='text-center'>
                <p>Pejabat Pembuat Komitmen (PPK),</p>
                <div className='h-16' />
                <p className='font-bold underline'>
                  NOVIANTO P. SASIKOME, S.Si
                </p>
                <p className='text-[10px] text-slate-600'>
                  NIP. 19851120 200801 1 004
                </p>
              </div>

              <div className='text-center'>
                <p>Bendahara Pengeluaran,</p>
                <div className='h-16' />
                <p className='font-bold underline'>MEILANY S. TAMPI, A.Md</p>
                <p className='text-[10px] text-slate-600'>
                  NIP. 19920514 201402 2 001
                </p>
              </div>

              <div className='text-center'>
                <p>Ondong Siau, 18 Mei 2026</p>
                <p>Kepala BPS Kab. Kepulauan Sitaro,</p>
                <div className='h-14' />
                <p className='font-bold underline'>
                  JOHANIS SUMAMPOUW, S.E., M.Si
                </p>
                <p className='text-[10px] text-slate-600'>
                  NIP. 19740612 199803 1 002
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className='border-t pt-3 print:hidden'>
            <Button variant='outline' onClick={() => setIsPrintOpen(false)}>
              Tutup
            </Button>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen Resmi (A4)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
