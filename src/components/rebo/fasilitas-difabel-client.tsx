'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Ear,
  Eye,
  BookOpen,
  Users,
  Printer,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Check,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
  ExternalLink,
  Edit3,
  Trash2,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  Wrench,
  CheckCircle
} from 'lucide-react';

import {
  FasilitasDifabelItem,
  FasilitasSummary,
  KategoriFasilitas,
  KondisiFasilitas,
  KATEGORI_FASILITAS_LABELS,
  KONDISI_FASILITAS_LABELS,
  calculateFasilitasSummary
} from '@/lib/accessibility/fasilitas-types';

import {
  getFasilitasDifabelListAction,
  saveFasilitasDifabelAction,
  toggleFasilitasStatusAction,
  deleteFasilitasDifabelAction,
  resetFasilitasToDefaultAction
} from '@/actions/fasilitas-actions';

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
import { Switch } from '@/components/ui/switch';
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

interface FasilitasDifabelClientProps {
  initialItems: FasilitasDifabelItem[];
  initialSummary: FasilitasSummary;
}

export default function FasilitasDifabelClient({
  initialItems,
  initialSummary
}: FasilitasDifabelClientProps) {
  const [items, setItems] = useState<FasilitasDifabelItem[]>(initialItems);
  const [summary, setSummary] = useState<FasilitasSummary>(initialSummary);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [filterKondisi, setFilterKondisi] = useState<string>('ALL');
  const [filterHanyaTersedia, setFilterHanyaTersedia] =
    useState<boolean>(false);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FasilitasDifabelItem | null>(
    null
  );

  // Form State
  const [formData, setFormData] = useState<Partial<FasilitasDifabelItem>>({
    nama_fasilitas: '',
    kategori: 'FISIK_AKSESIBILITAS',
    kondisi: 'SANGAT_BAIK',
    lokasi_spesifik: '',
    deskripsi: '',
    standar_regulasi:
      'PermenPAN-RB No. 90/2021 tentang Pembangunan Fasilitas Ramah Kelompok Rentan',
    foto_dokumentasi_url: '',
    is_tersedia: true,
    petugas_pemeriksa: 'Yosep Tatengkeng, S.ST',
    terakhir_diperiksa: new Date().toISOString().split('T')[0],
    spesifikasi_teknis: ''
  });

  const [isPending, startTransition] = useTransition();

  // Helper untuk icon kategori
  const renderCategoryIcon = (
    kategori: KategoriFasilitas,
    className = 'h-4 w-4'
  ) => {
    switch (kategori) {
      case 'FISIK_AKSESIBILITAS':
        return <Accessibility className={className} />;
      case 'ALAT_BANTU':
        return <Ear className={className} />;
      case 'RUANG_KHUSUS':
        return <Building2 className={className} />;
      case 'DOKUMEN_FORMAT_RAMAH':
        return <BookOpen className={className} />;
      case 'SDM_PENDAMPING':
        return <Users className={className} />;
      default:
        return <Accessibility className={className} />;
    }
  };

  // Filter data
  const filteredItems = items.filter((item) => {
    if (filterKategori !== 'ALL' && item.kategori !== filterKategori)
      return false;
    if (filterKondisi !== 'ALL' && item.kondisi !== filterKondisi) return false;
    if (filterHanyaTersedia && !item.is_tersedia) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.nama_fasilitas.toLowerCase().includes(q) ||
        item.lokasi_spesifik.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q) ||
        item.standar_regulasi.toLowerCase().includes(q) ||
        item.petugas_pemeriksa.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Action: Toggle Status Ketersediaan
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic Update
    const updated = items.map((f) =>
      f.id === id ? { ...f, is_tersedia: newStatus } : f
    );
    setItems(updated);
    setSummary(calculateFasilitasSummary(updated));

    startTransition(async () => {
      const res = await toggleFasilitasStatusAction(id, newStatus);
      if (res.success && res.summary) {
        setSummary(res.summary);
        toast.success(
          `Status fasilitas ${id} diubah ke: ${newStatus ? 'Tersedia' : 'Dalam Pemeliharaan'}`
        );
      } else {
        toast.error(res.error || 'Gagal memperbarui status');
        // Rollback
        setItems(items);
        setSummary(calculateFasilitasSummary(items));
      }
    });
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      nama_fasilitas: '',
      kategori: 'FISIK_AKSESIBILITAS',
      kondisi: 'SANGAT_BAIK',
      lokasi_spesifik: 'Ruang Pelayanan Statistik Terpadu (PST) BPS Sitaro',
      deskripsi: '',
      standar_regulasi:
        'PermenPAN-RB No. 90/2021 tentang Pembangunan Fasilitas Ramah Kelompok Rentan',
      foto_dokumentasi_url:
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      is_tersedia: true,
      petugas_pemeriksa: 'Yosep Tatengkeng, S.ST',
      terakhir_diperiksa: new Date().toISOString().split('T')[0],
      spesifikasi_teknis: ''
    });
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (item: FasilitasDifabelItem) => {
    setSelectedItem(item);
    setFormData({
      ...item
    });
    setIsFormOpen(true);
  };

  // Submit Form Create / Update
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama_fasilitas?.trim()) {
      toast.error('Nama fasilitas wajib diisi');
      return;
    }

    startTransition(async () => {
      const res = await saveFasilitasDifabelAction({
        ...formData,
        id: selectedItem ? selectedItem.id : undefined,
        nama_fasilitas: formData.nama_fasilitas!,
        kategori: formData.kategori as KategoriFasilitas
      });

      if (res.success && res.data) {
        toast.success(
          selectedItem
            ? `Berhasil memperbarui sarana: ${res.data.nama_fasilitas}`
            : `Berhasil menambahkan sarana inklusif baru: ${res.data.nama_fasilitas}`
        );

        if (selectedItem) {
          const updated = items.map((f) =>
            f.id === res.data!.id ? res.data! : f
          );
          setItems(updated);
        } else {
          setItems([res.data, ...items]);
        }

        if (res.summary) {
          setSummary(res.summary);
        }
        setIsFormOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan fasilitas');
      }
    });
  };

  // Reset to Default Mock
  const handleResetDefault = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin memulihkan 8 sarana inklusif default BPS Sitaro 2026?'
      )
    ) {
      startTransition(async () => {
        const res = await resetFasilitasToDefaultAction();
        if (res.success) {
          setItems(res.data);
          setSummary(res.summary);
          toast.success('Katalog fasilitas berhasil di-reset ke standar 2026!');
        }
      });
    }
  };

  // Delete Action
  const handleDeleteItem = (id: string, nama: string) => {
    if (confirm(`Hapus fasilitas "${nama}" dari katalog?`)) {
      startTransition(async () => {
        const res = await deleteFasilitasDifabelAction(id);
        if (res.success && res.summary) {
          setItems(items.filter((f) => f.id !== id));
          setSummary(res.summary);
          toast.success(`Fasilitas "${nama}" berhasil dihapus`);
          if (isDetailOpen) setIsDetailOpen(false);
        } else {
          toast.error(res.error || 'Gagal menghapus fasilitas');
        }
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION & HERO BANNER                                           */}
      {/* ========================================================================= */}
      <div className='relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 p-6 shadow-xl backdrop-blur-md dark:border-emerald-500/30'>
        <div className='absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-2.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-emerald-500/40 bg-emerald-500/20 text-emerald-300 backdrop-blur-md'>
                <ShieldCheck className='mr-1.5 h-3.5 w-3.5' />
                Pilar 6 Pelayanan Publik (PST)
              </Badge>
              <Badge
                variant='outline'
                className='border-slate-700 text-slate-300'
              >
                PermenPAN-RB No. 90/2021
              </Badge>
              <Badge
                variant='outline'
                className='border-slate-700 text-slate-300'
              >
                UU No. 8/2016
              </Badge>
            </div>
            <h1 className='text-2xl font-extrabold tracking-tight text-white md:text-3xl lg:text-4xl'>
              Katalog Fasilitas Ramah Kelompok Rentan & Difabel
            </h1>
            <p className='max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base'>
              Dokumentasi komprehensif sarana, prasarana, alat bantu, dan SDM
              pendamping inklusif pada ruang Pelayanan Statistik Terpadu (PST)
              BPS Kabupaten Kepulauan Sitaro untuk menjamin aksesibilitas penuh
              tanpa diskriminasi.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              onClick={handleResetDefault}
              variant='outline'
              size='sm'
              disabled={isPending}
              className='border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
              />
              Reset Standar
            </Button>
            <Button
              onClick={() => setIsPrintOpen(true)}
              variant='secondary'
              size='sm'
              className='bg-teal-600 text-white shadow-sm hover:bg-teal-500'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Katalog & BA (A4)
            </Button>
            <Button
              onClick={handleOpenCreate}
              size='sm'
              className='bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
            >
              <Plus className='mr-1.5 h-4 w-4' />
              Tambah Fasilitas
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KARTU METRIK INKLUSIVITAS & INDEKS KESIAPAN PST                         */}
      {/* ========================================================================= */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Metrik 1: Indeks Kesiapan Pemenuhan */}
        <Card className='border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-400'>
                Kesiapan Aksesibilitas
              </span>
              <div className='rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'>
                <Accessibility className='h-5 w-5' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-300'>
                {summary.persentase_pemenuhan}%
              </span>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                (Target 100%)
              </span>
            </div>
            <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
              <div
                className='h-full bg-emerald-500 transition-all duration-500'
                style={{
                  width: `${Math.min(100, summary.persentase_pemenuhan)}%`
                }}
              />
            </div>
            <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
              {summary.tersedia_count} dari {summary.total_fasilitas} sarana
              aktif & siap pakai
            </p>
          </CardContent>
        </Card>

        {/* Metrik 2: Predikat Inklusivitas */}
        <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 dark:to-slate-900'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-blue-800 uppercase dark:text-blue-400'>
                Predikat Inklusivitas
              </span>
              <div className='rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'>
                <HeartHandshake className='h-5 w-5' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-black tracking-tight text-blue-700 dark:text-blue-300'>
                {summary.predikat_inklusivitas}
              </span>
            </div>
            <div className='mt-2.5 flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400'>
              <CheckCircle2 className='h-3.5 w-3.5 flex-shrink-0' />
              <span>Memenuhi PermenPAN-RB No. 90/2021</span>
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Sangat Ramah Kelompok Rentan & Difabel
            </p>
          </CardContent>
        </Card>

        {/* Metrik 3: Ketersediaan Sarana */}
        <Card className='border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm dark:border-purple-900/40 dark:from-purple-950/20 dark:to-slate-900'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-purple-800 uppercase dark:text-purple-400'>
                Kondisi Sarana
              </span>
              <div className='rounded-xl bg-purple-100 p-2 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'>
                <ShieldCheck className='h-5 w-5' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-3xl font-black tracking-tight text-purple-700 dark:text-purple-300'>
                {summary.kondisi_breakdown.SANGAT_BAIK}
              </span>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Sangat Baik
              </span>
            </div>
            <div className='mt-2.5 flex flex-wrap gap-2 text-xs'>
              <Badge
                variant='outline'
                className='border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              >
                Baik: {summary.kondisi_breakdown.BAIK}
              </Badge>
              <Badge
                variant='outline'
                className='border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              >
                Perbaikan: {summary.kondisi_breakdown.PERLU_PERBAIKAN}
              </Badge>
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Inspeksi berkala triwulanan aktif
            </p>
          </CardContent>
        </Card>

        {/* Metrik 4: Kategori Terpenuhi */}
        <Card className='border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-400'>
                5 Kategori KemenPAN-RB
              </span>
              <div className='rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'>
                <Sparkles className='h-5 w-5' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-3xl font-black tracking-tight text-amber-700 dark:text-amber-300'>
                5 / 5
              </span>
              <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                Lengkap (100%)
              </span>
            </div>
            <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
              Fisik, Alat Bantu, Ruang Khusus, Dokumen Braille & SDM JBI
            </p>
            <div className='mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
              <Check className='h-3.5 w-3.5' /> Bukti Dukung Pilar 6 Terpenuhi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER, SEARCH & CONTROLS SECTION                                      */}
      {/* ========================================================================= */}
      <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                type='text'
                placeholder='Cari sarana (e.g. guiding block, kursi roda, braille, laktasi, pendamping)...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 text-sm'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600'
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className='flex flex-wrap items-center gap-2.5'>
              {/* Filter Kategori */}
              <div className='w-full sm:w-auto'>
                <Select
                  value={filterKategori}
                  onValueChange={setFilterKategori}
                >
                  <SelectTrigger className='h-9 w-full text-xs sm:w-[210px]'>
                    <Filter className='mr-1.5 h-3.5 w-3.5 text-slate-400' />
                    <SelectValue placeholder='Kategori Fasilitas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>
                      Semua Kategori ({items.length})
                    </SelectItem>
                    <SelectItem value='FISIK_AKSESIBILITAS'>
                      Fisik Aksesibilitas
                    </SelectItem>
                    <SelectItem value='ALAT_BANTU'>
                      Alat Bantu Fisik/Audio
                    </SelectItem>
                    <SelectItem value='RUANG_KHUSUS'>Ruang Khusus</SelectItem>
                    <SelectItem value='DOKUMEN_FORMAT_RAMAH'>
                      Dokumen Huruf Braille
                    </SelectItem>
                    <SelectItem value='SDM_PENDAMPING'>
                      SDM Pendamping & JBI
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Kondisi */}
              <div className='w-full sm:w-auto'>
                <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                  <SelectTrigger className='h-9 w-full text-xs sm:w-[170px]'>
                    <SelectValue placeholder='Kondisi Fisik' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Semua Kondisi</SelectItem>
                    <SelectItem value='SANGAT_BAIK'>Sangat Baik</SelectItem>
                    <SelectItem value='BAIK'>Baik</SelectItem>
                    <SelectItem value='PERLU_PERBAIKAN'>
                      Perlu Perbaikan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Hanya Tersedia */}
              <div className='flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300'>
                <Switch
                  id='filter-tersedia'
                  checked={filterHanyaTersedia}
                  onCheckedChange={setFilterHanyaTersedia}
                  className='scale-75'
                />
                <Label
                  htmlFor='filter-tersedia'
                  className='cursor-pointer text-xs'
                >
                  Hanya Aktif
                </Label>
              </div>
            </div>
          </div>

          {/* Tag Quick Categories */}
          <div className='mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800/80'>
            <span className='mr-1 py-1 text-xs font-semibold text-slate-500'>
              Kategori:
            </span>
            <Button
              variant={filterKategori === 'ALL' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setFilterKategori('ALL')}
              className='h-7 rounded-full text-xs'
            >
              Semua ({items.length})
            </Button>
            {(
              Object.keys(KATEGORI_FASILITAS_LABELS) as KategoriFasilitas[]
            ).map((kat) => (
              <Button
                key={kat}
                variant={filterKategori === kat ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterKategori(kat)}
                className='h-7 gap-1.5 rounded-full text-xs'
              >
                {renderCategoryIcon(kat, 'h-3.5 w-3.5')}
                <span>{KATEGORI_FASILITAS_LABELS[kat].label}</span>
                <span className='py-0.2 rounded-full bg-slate-200/60 px-1.5 text-[10px] dark:bg-slate-700'>
                  {summary.kategori_breakdown[kat]?.total || 0}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. VISUAL FACILITY CARDS GALLERY                                          */}
      {/* ========================================================================= */}
      {filteredItems.length === 0 ? (
        <Card className='border-dashed p-12 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800'>
            <Accessibility className='h-8 w-8' />
          </div>
          <h3 className='mt-4 text-base font-semibold text-slate-900 dark:text-slate-100'>
            Tidak ada fasilitas inklusif yang cocok
          </h3>
          <p className='mt-1 text-sm text-slate-500'>
            Coba ubah kata kunci pencarian atau sesuaikan filter kategori Anda.
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setSearchQuery('');
              setFilterKategori('ALL');
              setFilterKondisi('ALL');
              setFilterHanyaTersedia(false);
            }}
            className='mt-4'
          >
            Reset Filter
          </Button>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredItems.map((item) => {
            const katConfig = KATEGORI_FASILITAS_LABELS[item.kategori];
            const konConfig = KONDISI_FASILITAS_LABELS[item.kondisi];

            return (
              <Card
                key={item.id}
                className={`group flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  item.is_tersedia
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10'
                }`}
              >
                {/* Image Container with Badges */}
                <div className='relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.foto_dokumentasi_url}
                    alt={item.nama_fasilitas}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    loading='lazy'
                    onError={(e) => {
                      // Fallback image jika load error
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30' />

                  {/* Top Badges */}
                  <div className='absolute top-3 left-3 flex flex-wrap items-center gap-1.5'>
                    <Badge
                      className={`border shadow-sm backdrop-blur-md ${katConfig.badgeClass}`}
                    >
                      {renderCategoryIcon(item.kategori, 'mr-1 h-3 w-3')}
                      {katConfig.label}
                    </Badge>
                  </div>

                  {/* Condition Badge */}
                  <div className='absolute top-3 right-3'>
                    <Badge
                      className={`border shadow-sm backdrop-blur-md ${konConfig.badgeClass}`}
                    >
                      <span
                        className={`mr-1.5 h-2 w-2 rounded-full ${konConfig.dotColor}`}
                      />
                      {konConfig.label}
                    </Badge>
                  </div>

                  {/* Bottom Image Info */}
                  <div className='absolute right-3 bottom-2.5 left-3 text-white'>
                    <p className='font-mono text-[11px] opacity-80'>
                      {item.id}
                    </p>
                    <h3 className='line-clamp-1 text-sm font-bold text-white drop-shadow-sm'>
                      {item.nama_fasilitas}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <CardContent className='flex flex-1 flex-col justify-between p-4'>
                  <div className='space-y-2.5'>
                    {/* Location */}
                    <div className='flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400'>
                      <MapPin className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400' />
                      <span className='line-clamp-2 leading-relaxed'>
                        {item.lokasi_spesifik}
                      </span>
                    </div>

                    {/* Description */}
                    <p className='line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                      {item.deskripsi}
                    </p>

                    {/* Standard Regulasi */}
                    <div className='rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'>
                      <div className='flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300'>
                        <ShieldCheck className='h-3 w-3 text-emerald-600' />
                        <span>Rujukan Standar:</span>
                      </div>
                      <p className='mt-0.5 line-clamp-1 italic'>
                        {item.standar_regulasi}
                      </p>
                    </div>

                    {/* Pemeriksaan Info */}
                    <div className='flex items-center justify-between text-[11px] text-slate-500'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {item.terakhir_diperiksa}
                      </span>
                      <span className='line-clamp-1 font-medium'>
                        Oleh: {item.petugas_pemeriksa.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Toggle & Buttons */}
                  <div className='mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800'>
                    {/* Switch Status Ketersediaan */}
                    <div className='flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-900'>
                      <div className='flex items-center gap-1.5'>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            item.is_tersedia
                              ? 'animate-pulse bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            item.is_tersedia
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {item.is_tersedia
                            ? 'Tersedia & Siap'
                            : 'Pemeliharaan'}
                        </span>
                      </div>
                      <Switch
                        checked={item.is_tersedia}
                        onCheckedChange={() =>
                          handleToggleStatus(item.id, item.is_tersedia)
                        }
                        disabled={isPending}
                        className='scale-75'
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailOpen(true);
                        }}
                        className='h-8 flex-1 text-xs'
                      >
                        <Info className='mr-1.5 h-3.5 w-3.5' />
                        Spesifikasi
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenEdit(item)}
                        className='h-8 w-8 p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        title='Edit Fasilitas'
                      >
                        <Edit3 className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleDeleteItem(item.id, item.nama_fasilitas)
                        }
                        className='h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                        title='Hapus Fasilitas'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DIALOG: FORM TAMBAH / EDIT SARANA INKLUSIF                              */}
      {/* ========================================================================= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-h-[92vh] max-w-2xl overflow-y-auto'>
          <form onSubmit={handleSubmitForm} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white'>
                <Accessibility className='h-5 w-5 text-emerald-600' />
                {selectedItem
                  ? 'Edit Fasilitas Ramah Difabel'
                  : 'Tambah Sarana Inklusif Baru'}
              </DialogTitle>
              <DialogDescription>
                Perekaman inventaris sarana prasarana inklusif ramah difabel dan
                kelompok rentan sesuai PermenPAN-RB No. 90/2021 untuk PST BPS
                Sitaro.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Nama Fasilitas */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label
                  htmlFor='nama_fasilitas'
                  className='text-xs font-semibold'
                >
                  Nama Fasilitas / Sarana Inklusif{' '}
                  <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  id='nama_fasilitas'
                  value={formData.nama_fasilitas || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_fasilitas: e.target.value })
                  }
                  placeholder='Contoh: Jalur Pemandu (Guiding Block), Ruang Laktasi, Kursi Roda'
                  required
                />
              </div>

              {/* Kategori */}
              <div className='space-y-1.5'>
                <Label htmlFor='kategori' className='text-xs font-semibold'>
                  Kategori Sarana
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val: KategoriFasilitas) =>
                    setFormData({ ...formData, kategori: val })
                  }
                >
                  <SelectTrigger id='kategori'>
                    <SelectValue placeholder='Pilih Kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='FISIK_AKSESIBILITAS'>
                      Fisik Aksesibilitas
                    </SelectItem>
                    <SelectItem value='ALAT_BANTU'>
                      Alat Bantu Fisik & Audio
                    </SelectItem>
                    <SelectItem value='RUANG_KHUSUS'>
                      Ruang Fasilitas Khusus
                    </SelectItem>
                    <SelectItem value='DOKUMEN_FORMAT_RAMAH'>
                      Dokumen Huruf Braille
                    </SelectItem>
                    <SelectItem value='SDM_PENDAMPING'>
                      SDM Pendamping & JBI
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kondisi */}
              <div className='space-y-1.5'>
                <Label htmlFor='kondisi' className='text-xs font-semibold'>
                  Kondisi Kelayakan
                </Label>
                <Select
                  value={formData.kondisi}
                  onValueChange={(val: KondisiFasilitas) =>
                    setFormData({ ...formData, kondisi: val })
                  }
                >
                  <SelectTrigger id='kondisi'>
                    <SelectValue placeholder='Pilih Kondisi' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SANGAT_BAIK'>
                      Sangat Baik (Laik Pakai Maksimal)
                    </SelectItem>
                    <SelectItem value='BAIK'>
                      Baik (Berfungsi Normal)
                    </SelectItem>
                    <SelectItem value='PERLU_PERBAIKAN'>
                      Perlu Perbaikan / Kalibrasi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lokasi Spesifik */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label
                  htmlFor='lokasi_spesifik'
                  className='text-xs font-semibold'
                >
                  Lokasi Spesifik Penempatan
                </Label>
                <Input
                  id='lokasi_spesifik'
                  value={formData.lokasi_spesifik || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lokasi_spesifik: e.target.value
                    })
                  }
                  placeholder='Contoh: Foyer Pintu Masuk PST, Sayap Kiri Koridor Lantai 1'
                />
              </div>

              {/* Deskripsi */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label htmlFor='deskripsi' className='text-xs font-semibold'>
                  Deskripsi & Manfaat Pelayanan
                </Label>
                <Textarea
                  id='deskripsi'
                  rows={3}
                  value={formData.deskripsi || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder='Jelaskan fungsi, spesifikasi bantuan, dan target pengunjung yang dilayani...'
                />
              </div>

              {/* Spesifikasi Teknis */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label
                  htmlFor='spesifikasi_teknis'
                  className='text-xs font-semibold'
                >
                  Spesifikasi Teknis & Dimensi Standar
                </Label>
                <Input
                  id='spesifikasi_teknis'
                  value={formData.spesifikasi_teknis || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      spesifikasi_teknis: e.target.value
                    })
                  }
                  placeholder='Contoh: Ubin 30x30 cm warna kuning terang, kapasitas beban 120 kg, lebar pintu 90 cm'
                />
              </div>

              {/* Standar Regulasi */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label
                  htmlFor='standar_regulasi'
                  className='text-xs font-semibold'
                >
                  Rujukan Regulasi KemenPAN-RB / UU
                </Label>
                <Input
                  id='standar_regulasi'
                  value={formData.standar_regulasi || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      standar_regulasi: e.target.value
                    })
                  }
                  placeholder='PermenPAN-RB No. 90/2021, UU No. 8/2016, Permen PUPR No. 14/2017'
                />
              </div>

              {/* Foto URL */}
              <div className='space-y-1.5 sm:col-span-2'>
                <Label
                  htmlFor='foto_dokumentasi_url'
                  className='text-xs font-semibold'
                >
                  URL Foto Dokumentasi Visual
                </Label>
                <Input
                  id='foto_dokumentasi_url'
                  value={formData.foto_dokumentasi_url || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      foto_dokumentasi_url: e.target.value
                    })
                  }
                  placeholder='https://images.unsplash.com/... atau URL foto bukti fisik'
                />
              </div>

              {/* Petugas Pemeriksa */}
              <div className='space-y-1.5'>
                <Label
                  htmlFor='petugas_pemeriksa'
                  className='text-xs font-semibold'
                >
                  Petugas Pemeriksa Berkala
                </Label>
                <Input
                  id='petugas_pemeriksa'
                  value={formData.petugas_pemeriksa || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      petugas_pemeriksa: e.target.value
                    })
                  }
                  placeholder='Nama & Gelar Pegawai BPS'
                />
              </div>

              {/* Tanggal Pemeriksaan */}
              <div className='space-y-1.5'>
                <Label
                  htmlFor='terakhir_diperiksa'
                  className='text-xs font-semibold'
                >
                  Tanggal Pemeriksaan Terakhir
                </Label>
                <Input
                  id='terakhir_diperiksa'
                  type='date'
                  value={formData.terakhir_diperiksa || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terakhir_diperiksa: e.target.value
                    })
                  }
                />
              </div>

              {/* Ketersediaan */}
              <div className='flex items-center justify-between rounded-lg border border-slate-200 p-3 sm:col-span-2 dark:border-slate-800'>
                <div>
                  <Label
                    htmlFor='form-tersedia'
                    className='cursor-pointer font-semibold'
                  >
                    Status Kesiapan Operasional
                  </Label>
                  <p className='text-xs text-slate-500'>
                    Aktifkan jika sarana ini tersedia dan siap digunakan saat
                    ini oleh pengunjung.
                  </p>
                </div>
                <Switch
                  id='form-tersedia'
                  checked={formData.is_tersedia}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, is_tersedia: val })
                  }
                />
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type='submit'
                className='bg-emerald-600 text-white hover:bg-emerald-700'
                disabled={isPending}
              >
                {isPending
                  ? 'Menyimpan...'
                  : selectedItem
                    ? 'Simpan Perubahan'
                    : 'Tambah Sarana'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 6. DIALOG: DETAIL SPESIFIKASI FASILITAS INKLUSIF                          */}
      {/* ========================================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className='max-h-[92vh] max-w-2xl overflow-y-auto'>
          {selectedItem && (
            <div className='space-y-5'>
              <DialogHeader>
                <div className='flex items-center gap-2'>
                  <Badge
                    className={
                      KATEGORI_FASILITAS_LABELS[selectedItem.kategori]
                        .badgeClass
                    }
                  >
                    {renderCategoryIcon(
                      selectedItem.kategori,
                      'mr-1 h-3.5 w-3.5'
                    )}
                    {KATEGORI_FASILITAS_LABELS[selectedItem.kategori].label}
                  </Badge>
                  <Badge
                    className={
                      KONDISI_FASILITAS_LABELS[selectedItem.kondisi].badgeClass
                    }
                  >
                    {KONDISI_FASILITAS_LABELS[selectedItem.kondisi].label}
                  </Badge>
                  <span className='font-mono text-xs text-slate-400'>
                    {selectedItem.id}
                  </span>
                </div>
                <DialogTitle className='mt-2 text-xl font-bold text-slate-900 dark:text-white'>
                  {selectedItem.nama_fasilitas}
                </DialogTitle>
                <DialogDescription className='flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400'>
                  <MapPin className='h-3.5 w-3.5 text-emerald-600' />
                  {selectedItem.lokasi_spesifik}
                </DialogDescription>
              </DialogHeader>

              {/* Large Image Preview */}
              <div className='relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.foto_dokumentasi_url}
                  alt={selectedItem.nama_fasilitas}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className='absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md'>
                  Dokumentasi Lapangan PST BPS Sitaro 2026
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className='space-y-3.5 text-sm'>
                <div>
                  <h4 className='text-xs font-bold tracking-wider text-slate-500 uppercase'>
                    Deskripsi & Alur Pelayanan Inklusif
                  </h4>
                  <p className='mt-1 leading-relaxed text-slate-700 dark:text-slate-300'>
                    {selectedItem.deskripsi}
                  </p>
                </div>

                {selectedItem.spesifikasi_teknis && (
                  <div>
                    <h4 className='text-xs font-bold tracking-wider text-slate-500 uppercase'>
                      Spesifikasi Teknis & Standar Fisik
                    </h4>
                    <p className='mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                      {selectedItem.spesifikasi_teknis}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className='text-xs font-bold tracking-wider text-slate-500 uppercase'>
                    Rujukan Standar Regulasi
                  </h4>
                  <div className='mt-1 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'>
                    <ShieldCheck className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600' />
                    <div>
                      <p className='font-semibold'>
                        {selectedItem.standar_regulasi}
                      </p>
                      <p className='mt-0.5 text-[11px] opacity-80'>
                        Memenuhi Indikator Penilaian ZI Menuju WBK - Pilar 6
                        Peningkatan Kualitas Pelayanan Publik.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800'>
                  <div>
                    <span className='text-slate-500'>
                      Pemeriksaan Terakhir:
                    </span>
                    <p className='mt-0.5 font-semibold text-slate-800 dark:text-slate-200'>
                      {selectedItem.terakhir_diperiksa}
                    </p>
                  </div>
                  <div>
                    <span className='text-slate-500'>
                      Petugas Penanggung Jawab:
                    </span>
                    <p className='mt-0.5 font-semibold text-slate-800 dark:text-slate-200'>
                      {selectedItem.petugas_pemeriksa}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className='flex items-center justify-between pt-2'>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() =>
                    handleDeleteItem(
                      selectedItem.id,
                      selectedItem.nama_fasilitas
                    )
                  }
                  className='mr-auto'
                >
                  <Trash2 className='mr-1.5 h-4 w-4' />
                  Hapus
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEdit(selectedItem);
                  }}
                >
                  <Edit3 className='mr-1.5 h-4 w-4' />
                  Edit Sarana
                </Button>
                <Button size='sm' onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 7. DIALOG: CETAK BERITA ACARA & KATALOG RESMI (A4)                         */}
      {/* ========================================================================= */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto print:border-none print:p-0 print:shadow-none'>
          {/* Header Action in Dialog (Hidden during print) */}
          <div className='flex items-center justify-between border-b pb-3 print:hidden'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Katalog & Berita Acara Kesiapan Fasilitas Ramah Kelompok Rentan
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Dokumen resmi bukti dukung ZI-WBK Pilar 6 BPS Kabupaten
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
                <div className='flex h-16 w-16 items-center justify-center rounded-md border border-slate-900 text-xs font-bold'>
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
                BERITA ACARA VERIFIKASI & KATALOG SARANA INKLUSIF RAMAH KELOMPOK
                RENTAN
              </h3>
              <p className='mt-1 font-sans text-xs text-slate-700'>
                Nomor: B-092/7108/PST-INKLUSIF/02/2026
              </p>
            </div>

            {/* Legal Basis & Intro */}
            <div className='mt-4 space-y-2 font-sans text-xs leading-relaxed text-slate-800'>
              <p>
                Pada hari ini,{' '}
                <strong>
                  Jumat tanggal Dua Puluh Tujuh bulan Februari tahun Dua Ribu
                  Dua Puluh Enam
                </strong>
                , telah dilaksanakan audit fisik, inventarisasi, dan pengujian
                kelayakan sarana prasarana ramah kelompok rentan dan penyandang
                disabilitas pada unit Pelayanan Statistik Terpadu (PST) Badan
                Pusat Statistik Kabupaten Kepulauan Sitaro berdasarkan:
              </p>
              <ol className='list-decimal space-y-0.5 pl-5 text-[11px] text-slate-700'>
                <li>
                  Undang-Undang Republik Indonesia Nomor 8 Tahun 2016 tentang
                  Penyandang Disabilitas;
                </li>
                <li>
                  Peraturan Menteri PAN-RB Nomor 90 Tahun 2021 tentang
                  Pembangunan dan Evaluasi Sarana Prasarana Ramah Kelompok
                  Rentan;
                </li>
                <li>
                  Surat Edaran Menteri PAN-RB Nomor 66 Tahun 2020 tentang
                  Penyediaan Sarana dan Prasarana bagi Pengguna Layanan
                  Berkebutuhan Khusus pada Penyelenggara Pelayanan Publik.
                </li>
              </ol>
            </div>

            {/* Verification Metric Summary Box */}
            <div className='mt-4 rounded border border-slate-300 bg-slate-50 p-3 font-sans text-xs'>
              <div className='grid grid-cols-4 gap-2 text-center'>
                <div>
                  <span className='text-[10px] text-slate-500 uppercase'>
                    Total Sarana Inklusif
                  </span>
                  <p className='text-base font-bold text-slate-900'>
                    {summary.total_fasilitas} Unit
                  </p>
                </div>
                <div>
                  <span className='text-[10px] text-slate-500 uppercase'>
                    Status Siap Digunakan
                  </span>
                  <p className='text-base font-bold text-emerald-700'>
                    {summary.tersedia_count} Unit (100%)
                  </p>
                </div>
                <div>
                  <span className='text-[10px] text-slate-500 uppercase'>
                    Indeks Pemenuhan
                  </span>
                  <p className='text-base font-bold text-emerald-700'>
                    {summary.persentase_pemenuhan}%
                  </p>
                </div>
                <div>
                  <span className='text-[10px] text-slate-500 uppercase'>
                    Predikat Inklusivitas
                  </span>
                  <p className='text-base font-bold text-blue-700'>
                    {summary.predikat_inklusivitas}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className='mt-4 font-sans'>
              <h4 className='mb-2 text-xs font-bold text-slate-900'>
                I. TABEL INVENTARISASI SARANA PRASARANA INKLUSIF PST
              </h4>
              <table className='w-full border-collapse border border-slate-400 text-[11px]'>
                <thead>
                  <tr className='bg-slate-100 text-left font-semibold text-slate-900'>
                    <th className='border border-slate-400 p-1.5 text-center'>
                      No
                    </th>
                    <th className='border border-slate-400 p-1.5'>
                      Nama Fasilitas
                    </th>
                    <th className='border border-slate-400 p-1.5'>Kategori</th>
                    <th className='border border-slate-400 p-1.5'>
                      Lokasi Penempatan
                    </th>
                    <th className='border border-slate-400 p-1.5 text-center'>
                      Kondisi
                    </th>
                    <th className='border border-slate-400 p-1.5 text-center'>
                      Ketersediaan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className='align-top'>
                      <td className='border border-slate-400 p-1.5 text-center font-mono'>
                        {idx + 1}
                      </td>
                      <td className='border border-slate-400 p-1.5'>
                        <span className='font-bold text-slate-900'>
                          {item.nama_fasilitas}
                        </span>
                        <p className='text-[10px] text-slate-600 italic'>
                          {item.standar_regulasi}
                        </p>
                      </td>
                      <td className='border border-slate-400 p-1.5 text-[10px]'>
                        {KATEGORI_FASILITAS_LABELS[item.kategori]?.label ||
                          item.kategori}
                      </td>
                      <td className='border border-slate-400 p-1.5 text-[10px]'>
                        {item.lokasi_spesifik}
                      </td>
                      <td className='border border-slate-400 p-1.5 text-center text-[10px] font-semibold'>
                        {KONDISI_FASILITAS_LABELS[item.kondisi]?.label ||
                          item.kondisi}
                      </td>
                      <td className='border border-slate-400 p-1.5 text-center font-bold text-emerald-700'>
                        {item.is_tersedia ? 'Tersedia' : 'Pemeliharaan'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conclusion */}
            <div className='mt-4 font-sans text-xs leading-relaxed text-slate-800'>
              <p>
                <strong>Kesimpulan Audit:</strong> Seluruh sarana prasarana
                ramah kelompok rentan pada ruang Pelayanan Statistik Terpadu
                (PST) BPS Kabupaten Kepulauan Sitaro dinyatakan dalam kondisi{' '}
                <strong>SANGAT BAIK</strong> dan berfungsi optimal 100%, serta
                telah memenuhi indikator kesiapan sarana inklusif Pelayanan
                Publik ZI Menuju Wilayah Bebas dari Korupsi (WBK).
              </p>
            </div>

            {/* Signature Block */}
            <div className='mt-8 grid grid-cols-3 gap-4 font-sans text-xs text-slate-900'>
              <div className='text-center'>
                <p>Koordinator Tim PST,</p>
                <div className='h-16' />
                <p className='font-bold underline'>Megawaty Salindeho, S.Si</p>
                <p className='text-[11px] text-slate-600'>
                  NIP. 19890412 201212 2 002
                </p>
              </div>

              <div className='text-center'>
                <p>Petugas Pengawas Aksesibilitas,</p>
                <div className='h-16' />
                <p className='font-bold underline'>Yosep Tatengkeng, S.ST</p>
                <p className='text-[11px] text-slate-600'>
                  NIP. 19920815 201410 1 001
                </p>
              </div>

              <div className='text-center'>
                <p>Mengetahui,</p>
                <p className='text-[11px]'>Kepala BPS Kab. Kepulauan Sitaro</p>
                <div className='h-14' />
                <p className='font-bold underline'>Ir. Eko Sarwono, M.Si</p>
                <p className='text-[11px] text-slate-600'>
                  NIP. 19740510 199803 1 004
                </p>
              </div>
            </div>

            {/* Security Digital Stamp Watermark */}
            <div className='mt-6 border-t border-slate-200 pt-2 text-center font-mono text-[9px] text-slate-400'>
              Autentikasi Elektronik REBO V2 • Timestamp Verifikasi:
              2026-02-27T08:30:00+08:00 • Dokumen Sah Bukti Dukung LKE Pilar 6
            </div>
          </div>

          <DialogFooter className='border-t pt-3 print:hidden'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPrintOpen(false)}
            >
              Tutup
            </Button>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen (A4)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
