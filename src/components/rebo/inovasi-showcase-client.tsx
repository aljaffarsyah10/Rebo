'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  Printer,
  QrCode,
  ExternalLink,
  Video,
  FileText,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  Building2,
  Layers,
  Eye,
  Loader2
} from 'lucide-react';
import type {
  InovasiLayanan,
  StatusInovasi,
  TestimoniInovasi
} from '@/types/rebo';
import type { InovasiStats } from '@/actions/inovasi-actions';
import {
  saveInovasiAction,
  deleteInovasiAction
} from '@/actions/inovasi-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/page-container';

interface InovasiShowcaseClientProps {
  initialData: InovasiLayanan[];
  initialStats: InovasiStats;
  availablePilars: string[];
  isAdmin: boolean;
}

const PILAR_PRESETS = [
  { id: 'ALL', label: 'Semua Inovasi' },
  { id: 'Pilar 6', label: 'Pelayanan Publik (Pilar 6)' },
  { id: 'Pilar 2', label: 'Tata Kelola (Pilar 2)' },
  { id: 'Pilar 5', label: 'Pengawasan & Anti Korupsi (Pilar 5)' },
  { id: 'Pilar 3', label: 'Manajemen SDM (Pilar 3)' },
  { id: 'Pilar 4', label: 'Akuntabilitas (Pilar 4)' }
];

export default function InovasiShowcaseClient({
  initialData,
  isAdmin
}: InovasiShowcaseClientProps) {
  const [data, setData] = useState<InovasiLayanan[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPilar, setSelectedPilar] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Detail Modal State
  const [detailItem, setDetailItem] = useState<InovasiLayanan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form Modal State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<Partial<InovasiLayanan> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Testimoni sub-form state inside Form Modal
  const [tempTestimoniList, setTempTestimoniList] = useState<
    TestimoniInovasi[]
  >([]);
  const [newTestiNama, setNewTestiNama] = useState('');
  const [newTestiInstansi, setNewTestiInstansi] = useState('');
  const [newTestiJabatan, setNewTestiJabatan] = useState('');
  const [newTestiKutipan, setNewTestiKutipan] = useState('');
  const [newTestiRating, setNewTestiRating] = useState(5);

  // Filtered Inovasi
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter Pilar
      if (selectedPilar !== 'ALL') {
        if (
          !item.pilar_terkait
            .toLowerCase()
            .includes(selectedPilar.toLowerCase())
        ) {
          return false;
        }
      }
      // Filter Status
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) {
          return false;
        }
      }
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.nama_inovasi.toLowerCase().includes(q);
        const matchTagline = item.tagline?.toLowerCase().includes(q) ?? false;
        const matchSummary = item.ringkasan.toLowerCase().includes(q);
        const matchPilar = item.pilar_terkait.toLowerCase().includes(q);
        if (!matchTitle && !matchTagline && !matchSummary && !matchPilar) {
          return false;
        }
      }
      return true;
    });
  }, [data, selectedPilar, selectedStatus, searchQuery]);

  // Recalculated Stats based on current dataset
  const stats = useMemo(() => {
    const totalInovasi = data.length;
    const totalAktif = data.filter((i) => i.status === 'AKTIF').length;
    const totalPengguna = data.reduce(
      (acc, curr) => acc + (Number(curr.jumlah_pengguna) || 0),
      0
    );

    let sumRating = 0;
    let countRating = 0;
    data.forEach((item) => {
      if (Array.isArray(item.testimoni)) {
        item.testimoni.forEach((t) => {
          if (t.rating) {
            sumRating += Number(t.rating);
            countRating += 1;
          }
        });
      }
    });
    const avgRating =
      countRating > 0 ? (sumRating / countRating).toFixed(1) : '5.0';

    let sumEfisiensi = 0;
    let countEfisiensi = 0;
    data.forEach((item) => {
      const num = parseInt(
        String(item.persentase_efisiensi).replace(/[^0-9]/g, ''),
        10
      );
      if (!isNaN(num)) {
        sumEfisiensi += num;
        countEfisiensi += 1;
      }
    });
    const avgEfisiensi =
      countEfisiensi > 0 ? Math.round(sumEfisiensi / countEfisiensi) : 75;

    return {
      totalInovasi,
      totalAktif,
      totalPengguna,
      avgRating,
      avgEfisiensi
    };
  }, [data]);

  // Handle open detail
  const handleOpenDetail = (item: InovasiLayanan) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  // Handle open create form
  const handleOpenCreate = () => {
    setEditingItem({
      nama_inovasi: '',
      tagline: '',
      pilar_terkait: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik',
      status: 'AKTIF',
      ringkasan: '',
      latar_belakang: '',
      solusi_inovasi: '',
      kondisi_sebelum: '',
      kondisi_sesudah: '',
      persentase_efisiensi: '75%',
      jumlah_pengguna: 100,
      kategori_manfaat: 'Efisiensi Waktu & Akses Layanan',
      penanggung_jawab: 'Tim Inovasi BPS Sitaro',
      link_dokumentasi:
        'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
      link_video: '',
      testimoni: []
    });
    setTempTestimoniList([]);
    setIsFormOpen(true);
  };

  // Handle open edit form
  const handleOpenEdit = (item: InovasiLayanan) => {
    setEditingItem(item);
    setTempTestimoniList(item.testimoni || []);
    setIsFormOpen(true);
  };

  // Add testimoni to subform
  const handleAddTestimoni = () => {
    if (!newTestiNama.trim() || !newTestiKutipan.trim()) return;
    const newT: TestimoniInovasi = {
      nama: newTestiNama.trim(),
      instansi: newTestiInstansi.trim() || 'Masyarakat Sitaro',
      jabatan: newTestiJabatan.trim() || 'Pengguna Layanan',
      kutipan: newTestiKutipan.trim(),
      rating: newTestiRating,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
    setTempTestimoniList([...tempTestimoniList, newT]);
    setNewTestiNama('');
    setNewTestiInstansi('');
    setNewTestiJabatan('');
    setNewTestiKutipan('');
    setNewTestiRating(5);
  };

  const handleRemoveTestimoni = (index: number) => {
    setTempTestimoniList(tempTestimoniList.filter((_, idx) => idx !== index));
  };

  // Save innovation
  const handleSaveInovasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.nama_inovasi?.trim()) return;

    setIsSaving(true);
    try {
      const payload: Partial<InovasiLayanan> = {
        ...editingItem,
        testimoni: tempTestimoniList
      };

      const res = await saveInovasiAction(payload);
      if (res.success && res.data) {
        // Update local state
        const exists = data.some((i) => i.id === res.data!.id);
        if (exists) {
          setData(data.map((i) => (i.id === res.data!.id ? res.data! : i)));
        } else {
          setData([res.data, ...data]);
        }
        setIsFormOpen(false);
      } else {
        alert(res.error || 'Gagal menyimpan inovasi');
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan inovasi');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete innovation
  const handleDeleteInovasi = async (id: string, name: string) => {
    if (!confirm(`Hapus inovasi "${name}"?`)) return;
    const res = await deleteInovasiAction(id);
    if (res.success) {
      setData(data.filter((i) => i.id !== id));
      if (detailItem?.id === id) {
        setIsDetailOpen(false);
      }
    } else {
      alert(res.error || 'Gagal menghapus inovasi');
    }
  };

  // Print function
  const handlePrintOnePager = () => {
    window.print();
  };

  return (
    <PageContainer>
      <div className='space-y-6 pb-12'>
        {/* =========================================================================
            HEADER INSPIRATIF
        ========================================================================= */}
        <div className='border-primary/20 from-primary/10 via-background relative overflow-hidden rounded-2xl border bg-gradient-to-br to-purple-500/10 p-6 shadow-sm sm:p-8 print:hidden'>
          <div className='relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center'>
            <div className='max-w-3xl space-y-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className='border-primary/40 bg-primary/10 text-primary flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider uppercase'
                >
                  <Sparkles className='text-primary size-3.5 animate-pulse' />
                  Game Changer Menuju WBK/WBBM
                </Badge>
                <Badge
                  variant='secondary'
                  className='border border-purple-300/40 bg-purple-100 text-xs text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                >
                  BPS Kabupaten Kepulauan Siau Tagulandang Biaro
                </Badge>
              </div>

              <h1 className='text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl'>
                Galeri Inovasi Pelayanan Publik & Transformasi Birokrasi
              </h1>

              <p className='text-muted-foreground text-sm leading-relaxed sm:text-base'>
                Etalase terobosan strategis, efisiensi layanan, dan simplifikasi
                proses birokrasi kepulauan. Dirancang untuk membuktikan dampak
                nyata pembangunan Zona Integritas kepada Tim Penilai Internal
                (TPI) dan Tim Penilai Nasional (TPN KemenPAN-RB).
              </p>
            </div>

            <div className='flex shrink-0 flex-wrap items-center gap-2.5'>
              <Link href='/rebo/pst-qrcode'>
                <Button
                  variant='outline'
                  className='border-blue-200 bg-blue-50/70 text-xs font-medium text-blue-700 hover:bg-blue-100 sm:text-sm dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                >
                  <QrCode className='mr-1.5 size-4 text-blue-600 dark:text-blue-400' />
                  QR Meja PST
                </Button>
              </Link>
              <Button
                variant='outline'
                onClick={handlePrintOnePager}
                className='border-border/80 bg-background/80 hover:bg-muted text-xs font-medium sm:text-sm'
              >
                <Printer className='text-muted-foreground mr-1.5 size-4' />
                Cetak Ringkasan Inovasi
              </Button>
              <Button
                onClick={handleOpenCreate}
                className='from-primary hover:from-primary/90 bg-gradient-to-r to-indigo-600 text-xs font-semibold text-white shadow-md hover:to-indigo-600/90 sm:text-sm'
              >
                <Plus className='mr-1.5 size-4' />
                Tambah Inovasi Baru
              </Button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            KPI STATISTIK INOVASI
        ========================================================================= */}
        <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5 print:hidden'>
          <div className='border-border/60 bg-card hover:border-primary/40 rounded-xl border p-4 shadow-sm transition-colors'>
            <div className='text-muted-foreground flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider uppercase'>
                Total Inovasi
              </span>
              <Layers className='text-primary size-4' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-foreground text-2xl font-bold'>
                {stats.totalInovasi}
              </span>
              <span className='text-muted-foreground text-xs'>program</span>
            </div>
            <p className='text-muted-foreground mt-1 text-[11px]'>
              Pilar 1 s.d. Pilar 6
            </p>
          </div>

          <div className='border-border/60 bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-emerald-500/40'>
            <div className='text-muted-foreground flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider uppercase'>
                Inovasi Aktif
              </span>
              <CheckCircle2 className='size-4 text-emerald-500' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                {stats.totalAktif}
              </span>
              <span className='text-xs text-emerald-600/80 dark:text-emerald-400/80'>
                berjalan
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-[11px]'>
              Siap dinilai TPN
            </p>
          </div>

          <div className='border-border/60 bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-indigo-500/40'>
            <div className='text-muted-foreground flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider uppercase'>
                Rata-rata Efisiensi
              </span>
              <TrendingUp className='size-4 text-indigo-500' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-indigo-600 dark:text-indigo-400'>
                {stats.avgEfisiensi}%
              </span>
              <span className='text-xs text-indigo-600/80 dark:text-indigo-400/80'>
                waktu & biaya
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-[11px]'>
              Dampak sebelum vs sesudah
            </p>
          </div>

          <div className='border-border/60 bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-purple-500/40'>
            <div className='text-muted-foreground flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider uppercase'>
                Penerima Manfaat
              </span>
              <Users className='size-4 text-purple-500' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {stats.totalPengguna.toLocaleString('id-ID')}
              </span>
              <span className='text-xs text-purple-600/80 dark:text-purple-400/80'>
                pengguna
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-[11px]'>
              OPD, akademisi, warga
            </p>
          </div>

          <div className='border-border/60 bg-card col-span-2 rounded-xl border p-4 shadow-sm transition-colors hover:border-amber-500/40 sm:col-span-1'>
            <div className='text-muted-foreground flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider uppercase'>
                Kepuasan Pengguna
              </span>
              <Star className='size-4 fill-amber-400 text-amber-500' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
                {stats.avgRating}
              </span>
              <span className='text-xs text-amber-600/80 dark:text-amber-400/80'>
                / 5.0 ⭐
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-[11px]'>
              Berdasarkan survei layanan
            </p>
          </div>
        </div>

        {/* =========================================================================
            FILTER & SEARCH CONTROLS
        ========================================================================= */}
        <div className='space-y-3 print:hidden'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            {/* Pilar Pills Filter */}
            <div className='flex flex-wrap items-center gap-1.5'>
              {PILAR_PRESETS.map((p) => {
                const isActive = selectedPilar === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPilar(p.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Status Dropdown & Search */}
            <div className='flex items-center gap-2.5'>
              <div className='relative w-full sm:w-64'>
                <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
                <Input
                  type='text'
                  placeholder='Cari inovasi / dampak...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='bg-background h-9 pl-8.5 text-xs sm:text-sm'
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='border-input bg-background text-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-xs focus-visible:ring-1 focus-visible:outline-none'
              >
                <option value='ALL'>Semua Status</option>
                <option value='AKTIF'>Aktif (Produksi)</option>
                <option value='RINTISAN'>Rintisan (Pilot)</option>
                <option value='PENGEMBANGAN'>Pengembangan</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            LIST / GRID KARTU INOVASI
        ========================================================================= */}
        {filteredData.length === 0 ? (
          <div className='border-border/80 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center'>
            <Sparkles className='text-muted-foreground/40 mb-3 size-12' />
            <h3 className='text-foreground text-base font-semibold'>
              Tidak Ada Inovasi Ditemukan
            </h3>
            <p className='text-muted-foreground mt-1 max-w-sm text-xs'>
              Tidak ditemukan inovasi untuk kriteria pencarian atau pilar yang
              dipilih.
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedPilar('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className='mt-4 text-xs'
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
            {filteredData.map((item) => {
              // Status Badge Styling
              const isAktif = item.status === 'AKTIF';
              const isRintisan = item.status === 'RINTISAN';
              const statusClass = isAktif
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300/50'
                : isRintisan
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300/50'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300/50';

              return (
                <div
                  key={item.id}
                  className='group border-border/70 bg-card/90 hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md'
                >
                  {/* Top Bar Badges */}
                  <div className='space-y-3 p-5 pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-border/80 bg-muted/50 text-foreground max-w-[200px] truncate text-[11px] font-medium'
                      >
                        {item.pilar_terkait}
                      </Badge>

                      <Badge
                        variant='outline'
                        className={`flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${statusClass}`}
                      >
                        {isAktif && (
                          <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
                        )}
                        {item.status}
                      </Badge>
                    </div>

                    {/* Judul & Tagline */}
                    <div>
                      <h3 className='text-foreground group-hover:text-primary text-lg leading-snug font-bold transition-colors'>
                        {item.nama_inovasi}
                      </h3>
                      {item.tagline && (
                        <p className='text-primary/90 mt-1 line-clamp-1 text-xs font-medium italic'>
                          &ldquo;{item.tagline}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Ringkasan */}
                    <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                      {item.ringkasan}
                    </p>

                    {/* =========================================================
                        BOX KOMPARASI BEFORE VS AFTER (DISUKAI ASESOR TPN)
                    ========================================================= */}
                    <div className='border-border/60 bg-muted/30 mt-3 space-y-2 rounded-xl border p-3'>
                      <div className='text-muted-foreground flex items-center justify-between text-[10px] font-bold tracking-wider uppercase'>
                        <span>Dampak Perubahan (Before vs After)</span>
                        <span className='text-primary flex items-center gap-1 font-semibold'>
                          <TrendingUp className='size-3 text-emerald-500' />
                          Efisiensi {item.persentase_efisiensi}
                        </span>
                      </div>

                      <div className='grid grid-cols-2 gap-2 text-[11px]'>
                        {/* Sebelum (Red/Rose container) */}
                        <div className='rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 text-rose-950 dark:border-rose-950 dark:bg-rose-950/30 dark:text-rose-200'>
                          <div className='mb-1 flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-400'>
                            <XCircle className='size-3 shrink-0' />
                            SEBELUM
                          </div>
                          <p className='line-clamp-3 text-[11px] leading-snug'>
                            {item.kondisi_sebelum}
                          </p>
                        </div>

                        {/* Sesudah (Emerald/Green container) */}
                        <div className='rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-emerald-950 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'>
                          <div className='mb-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400'>
                            <CheckCircle2 className='size-3 shrink-0' />
                            SESUDAH
                          </div>
                          <p className='line-clamp-3 text-[11px] leading-snug'>
                            {item.kondisi_sesudah}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Highlights: Pengguna & Rating */}
                    <div className='text-muted-foreground flex items-center justify-between pt-1 text-xs'>
                      <div className='flex items-center gap-1.5'>
                        <Users className='text-muted-foreground size-3.5' />
                        <span>
                          <strong className='text-foreground'>
                            {item.jumlah_pengguna.toLocaleString('id-ID')}
                          </strong>{' '}
                          pengguna
                        </span>
                      </div>

                      {item.testimoni && item.testimoni.length > 0 && (
                        <div className='flex items-center gap-1 text-amber-500'>
                          <Star className='size-3.5 fill-amber-400' />
                          <span className='text-foreground text-xs font-semibold'>
                            {item.testimoni[0].rating?.toFixed(1) || '5.0'}
                          </span>
                          <span className='text-muted-foreground text-[10px]'>
                            ({item.testimoni.length} testimoni)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className='border-border/60 bg-muted/20 flex items-center justify-between gap-2 border-t px-5 py-3'>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => handleOpenDetail(item)}
                      className='h-8 flex-1 text-xs font-semibold'
                    >
                      <Eye className='mr-1.5 size-3.5' />
                      Profil Lengkap & Testimoni
                    </Button>

                    <div className='flex items-center gap-1'>
                      {item.link_dokumentasi && (
                        <Button
                          variant='outline'
                          size='icon'
                          className='border-border/80 size-8 shrink-0'
                          title='Buka Bukti Dokumen'
                          onClick={() =>
                            window.open(item.link_dokumentasi, '_blank')
                          }
                        >
                          <FileText className='text-muted-foreground size-3.5' />
                        </Button>
                      )}

                      {item.link_video && (
                        <Button
                          variant='outline'
                          size='icon'
                          className='border-border/80 size-8 shrink-0 text-rose-600 hover:text-rose-700 dark:text-rose-400'
                          title='Tonton Video Inovasi'
                          onClick={() => window.open(item.link_video, '_blank')}
                        >
                          <Video className='size-3.5' />
                        </Button>
                      )}

                      {isAdmin && (
                        <Button
                          variant='outline'
                          size='icon'
                          className='border-border/80 size-8 shrink-0'
                          title='Edit Inovasi'
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit3 className='text-muted-foreground size-3.5' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            MODAL DETAIL KOMPREHENSIF (VIEW ASESOR TPN)
        ========================================================================= */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto p-6 sm:p-8'>
            {detailItem && (
              <div className='space-y-6'>
                {/* Header Modal */}
                <div className='border-border/60 space-y-2 border-b pb-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {detailItem.pilar_terkait}
                      </Badge>
                      <Badge
                        variant='secondary'
                        className='bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      >
                        Status: {detailItem.status}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handlePrintOnePager}
                        className='h-8 text-xs'
                      >
                        <Printer className='mr-1.5 size-3.5' />
                        Cetak One-Pager TPN
                      </Button>
                      {isAdmin && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setIsDetailOpen(false);
                            handleOpenEdit(detailItem);
                          }}
                          className='h-8 text-xs text-indigo-600'
                        >
                          <Edit3 className='mr-1.5 size-3.5' />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  <h2 className='text-foreground text-xl font-extrabold sm:text-2xl'>
                    {detailItem.nama_inovasi}
                  </h2>
                  {detailItem.tagline && (
                    <p className='text-primary text-sm font-medium italic'>
                      &ldquo;{detailItem.tagline}&rdquo;
                    </p>
                  )}
                </div>

                {/* Tabs View */}
                <Tabs defaultValue='profil' className='w-full'>
                  <TabsList className='grid h-10 w-full grid-cols-4'>
                    <TabsTrigger value='profil' className='text-xs sm:text-sm'>
                      Profil & Solusi
                    </TabsTrigger>
                    <TabsTrigger value='dampak' className='text-xs sm:text-sm'>
                      Analisis Dampak
                    </TabsTrigger>
                    <TabsTrigger
                      value='testimoni'
                      className='text-xs sm:text-sm'
                    >
                      Testimoni Pengguna ({detailItem.testimoni?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value='eviden' className='text-xs sm:text-sm'>
                      Bukti Dukung
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: PROFIL & SOLUSI */}
                  <TabsContent value='profil' className='space-y-4 pt-3'>
                    <div className='border-border/70 bg-card space-y-2 rounded-xl border p-4'>
                      <h4 className='text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase'>
                        <Building2 className='text-primary size-3.5' />
                        Latar Belakang & Urgensi Masalah Kepulauan
                      </h4>
                      <p className='text-foreground text-sm leading-relaxed'>
                        {detailItem.latar_belakang}
                      </p>
                    </div>

                    <div className='border-primary/30 bg-primary/5 space-y-2 rounded-xl border p-4'>
                      <h4 className='text-primary flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase'>
                        <Sparkles className='text-primary size-3.5' />
                        Solusi & Kebaharuan Inovatif
                      </h4>
                      <p className='text-foreground text-sm leading-relaxed'>
                        {detailItem.solusi_inovasi}
                      </p>
                    </div>

                    <div className='grid grid-cols-1 gap-3 text-xs sm:grid-cols-2'>
                      <div className='border-border/60 bg-muted/30 rounded-lg border p-3'>
                        <span className='text-muted-foreground block text-[11px] font-semibold'>
                          Penanggung Jawab / Tim Kerja:
                        </span>
                        <span className='text-foreground mt-0.5 block font-medium'>
                          {detailItem.penanggung_jawab ||
                            'BPS Kabupaten Kepulauan Sitaro'}
                        </span>
                      </div>

                      <div className='border-border/60 bg-muted/30 rounded-lg border p-3'>
                        <span className='text-muted-foreground block text-[11px] font-semibold'>
                          Kategori Nilai Tambah:
                        </span>
                        <span className='text-foreground mt-0.5 block font-medium'>
                          {detailItem.kategori_manfaat ||
                            'Efisiensi Proses Pelayanan Publik'}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: ANALISIS DAMPAK (BEFORE VS AFTER) */}
                  <TabsContent value='dampak' className='space-y-4 pt-3'>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                      <div className='rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-center dark:bg-emerald-950/20'>
                        <span className='block text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
                          Efisiensi Layanan
                        </span>
                        <span className='mt-1 block text-3xl font-extrabold text-emerald-600 dark:text-emerald-400'>
                          {detailItem.persentase_efisiensi}
                        </span>
                        <span className='text-muted-foreground text-[11px]'>
                          Pemangkasan Waktu/Biaya
                        </span>
                      </div>

                      <div className='rounded-xl border border-purple-500/30 bg-purple-50/50 p-4 text-center dark:bg-purple-950/20'>
                        <span className='block text-xs font-semibold text-purple-700 dark:text-purple-400'>
                          Penerima Manfaat
                        </span>
                        <span className='mt-1 block text-3xl font-extrabold text-purple-600 dark:text-purple-400'>
                          {detailItem.jumlah_pengguna.toLocaleString('id-ID')}
                        </span>
                        <span className='text-muted-foreground text-[11px]'>
                          Pemohon & Stakeholder
                        </span>
                      </div>

                      <div className='rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 text-center dark:bg-amber-950/20'>
                        <span className='block text-xs font-semibold text-amber-700 dark:text-amber-400'>
                          Rating Kepuasan
                        </span>
                        <span className='mt-1 block flex items-center justify-center gap-1 text-3xl font-extrabold text-amber-600 dark:text-amber-400'>
                          <Star className='size-6 fill-amber-400 text-amber-500' />
                          {detailItem.testimoni?.[0]?.rating || '5.0'}
                        </span>
                        <span className='text-muted-foreground text-[11px]'>
                          Skala Maksimal 5.0
                        </span>
                      </div>
                    </div>

                    {/* Before vs After Side by Side */}
                    <div className='border-border/80 bg-card space-y-3 rounded-xl border p-4'>
                      <h4 className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                        Komparasi Matriks Kondisi Sebelum vs Sesudah Inovasi
                      </h4>

                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2 rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-950 dark:bg-rose-950/30'>
                          <div className='flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400'>
                            <XCircle className='size-4' />
                            KONDISI SEBELUM INOVASI
                          </div>
                          <p className='text-foreground/90 text-xs leading-relaxed sm:text-sm'>
                            {detailItem.kondisi_sebelum}
                          </p>
                        </div>

                        <div className='space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-950 dark:bg-emerald-950/30'>
                          <div className='flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400'>
                            <CheckCircle2 className='size-4' />
                            KONDISI SESUDAH INOVASI (DAMPAK NYATA)
                          </div>
                          <p className='text-foreground/90 text-xs leading-relaxed sm:text-sm'>
                            {detailItem.kondisi_sesudah}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: TESTIMONI PENGGUNA */}
                  <TabsContent value='testimoni' className='space-y-3 pt-3'>
                    {detailItem.testimoni && detailItem.testimoni.length > 0 ? (
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        {detailItem.testimoni.map((t, idx) => (
                          <div
                            key={idx}
                            className='border-border/70 bg-card flex flex-col justify-between space-y-2.5 rounded-xl border p-4 shadow-sm'
                          >
                            <div className='space-y-1.5'>
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-1 text-amber-500'>
                                  {Array.from({
                                    length: Math.round(t.rating || 5)
                                  }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className='size-3.5 fill-amber-400'
                                    />
                                  ))}
                                </div>
                                {t.tanggal && (
                                  <span className='text-muted-foreground text-[10px]'>
                                    {t.tanggal}
                                  </span>
                                )}
                              </div>
                              <p className='text-foreground/90 text-xs leading-relaxed italic sm:text-sm'>
                                &ldquo;{t.kutipan}&rdquo;
                              </p>
                            </div>

                            <div className='border-border/50 border-t pt-2 text-xs'>
                              <span className='text-foreground block font-bold'>
                                {t.nama}
                              </span>
                              <span className='text-muted-foreground block text-[11px]'>
                                {t.jabatan ? `${t.jabatan} — ` : ''}
                                {t.instansi}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-muted-foreground py-8 text-center text-xs'>
                        Belum ada testimoni yang ditambahkan untuk inovasi ini.
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB 4: BUKTI DUKUNG & VIDEO */}
                  <TabsContent value='eviden' className='space-y-4 pt-3'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <div className='border-border/80 bg-card space-y-3 rounded-xl border p-4'>
                        <div className='text-foreground flex items-center gap-2 text-sm font-bold'>
                          <FileText className='text-primary size-4' />
                          Folder Google Drive Dokumentasi
                        </div>
                        <p className='text-muted-foreground text-xs leading-relaxed'>
                          Berisi SK Penetapan Inovasi, Manual Book/SOP,
                          Dokumentasi Foto Kegiatan, serta Laporan Monitoring &
                          Evaluasi Berkala.
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            window.open(detailItem.link_dokumentasi, '_blank')
                          }
                          className='w-full text-xs font-semibold'
                        >
                          <ExternalLink className='mr-1.5 size-3.5' />
                          Buka Google Drive Bukti Dukung
                        </Button>
                      </div>

                      <div className='border-border/80 bg-card space-y-3 rounded-xl border p-4'>
                        <div className='text-foreground flex items-center gap-2 text-sm font-bold'>
                          <Video className='size-4 text-rose-500' />
                          Video Paparan & Demonstrasi Inovasi
                        </div>
                        <p className='text-muted-foreground text-xs leading-relaxed'>
                          Video ringkas berdurasi 3-5 menit untuk paparan Desk
                          Evaluation di hadapan Tim Penilai Nasional (TPN
                          KemenPAN-RB).
                        </p>
                        {detailItem.link_video ? (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              window.open(detailItem.link_video, '_blank')
                            }
                            className='w-full text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400'
                          >
                            <Video className='mr-1.5 size-3.5' />
                            Putar Video Demonstrasi
                          </Button>
                        ) : (
                          <Button
                            variant='outline'
                            size='sm'
                            disabled
                            className='w-full text-xs'
                          >
                            Video Belum Diunggah
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* =========================================================================
            MODAL FORM TAMBAH / EDIT INOVASI
        ========================================================================= */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto p-6'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold'>
                {editingItem?.id
                  ? 'Edit Profil Inovasi'
                  : 'Tambah Inovasi Baru'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Dokumentasikan terobosan pelayanan publik atau reformasi
                birokrasi BPS Sitaro untuk pemenuhan bukti dukung ZI.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveInovasi} className='space-y-4 pt-2'>
              {/* Nama & Tagline */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Nama Inovasi <span className='text-rose-500'>*</span>
                  </label>
                  <Input
                    required
                    placeholder='Contoh: PST Si-Datu Kepulauan'
                    value={editingItem?.nama_inovasi || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        nama_inovasi: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Tagline / Slogan
                  </label>
                  <Input
                    placeholder='Contoh: Layanan Cepat Tanpa Batas Lautan'
                    value={editingItem?.tagline || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        tagline: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>
              </div>

              {/* Pilar & Status */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-foreground text-xs font-semibold'>
                    Pilar Terkait
                  </label>
                  <select
                    value={editingItem?.pilar_terkait || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        pilar_terkait: e.target.value
                      }))
                    }
                    className='border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-xs focus-visible:ring-1 focus-visible:outline-none'
                  >
                    <option value='Pilar 6 - Peningkatan Kualitas Pelayanan Publik'>
                      Pilar 6 - Peningkatan Kualitas Pelayanan Publik
                    </option>
                    <option value='Pilar 2 - Penataan Tata Laksana'>
                      Pilar 2 - Penataan Tata Laksana
                    </option>
                    <option value='Pilar 5 - Penguatan Pengawasan'>
                      Pilar 5 - Penguatan Pengawasan & Anti Korupsi
                    </option>
                    <option value='Pilar 3 - Penataan Sistem Manajemen SDM'>
                      Pilar 3 - Penataan Sistem Manajemen SDM
                    </option>
                    <option value='Pilar 4 - Penguatan Akuntabilitas'>
                      Pilar 4 - Penguatan Akuntabilitas Kinerja
                    </option>
                    <option value='Pilar 1 - Manajemen Perubahan'>
                      Pilar 1 - Manajemen Perubahan
                    </option>
                  </select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Status Inovasi
                  </label>
                  <select
                    value={editingItem?.status || 'AKTIF'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        status: e.target.value as StatusInovasi
                      }))
                    }
                    className='border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-xs focus-visible:ring-1 focus-visible:outline-none'
                  >
                    <option value='AKTIF'>AKTIF (Produksi)</option>
                    <option value='RINTISAN'>RINTISAN (Pilot)</option>
                    <option value='PENGEMBANGAN'>PENGEMBANGAN</option>
                  </select>
                </div>
              </div>

              {/* Ringkasan */}
              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  Ringkasan Eksekutif (Singkat & Padat)
                </label>
                <Textarea
                  rows={2}
                  placeholder='Penjelasan singkat apa itu inovasi ini dan manfaat utamanya...'
                  value={editingItem?.ringkasan || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      ringkasan: e.target.value
                    }))
                  }
                  className='text-xs sm:text-sm'
                />
              </div>

              {/* Latar Belakang & Solusi */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Latar Belakang / Permasalahan Kepulauan
                  </label>
                  <Textarea
                    rows={3}
                    placeholder='Jelaskan hambatan atau permasalahan sebelum inovasi lahir...'
                    value={editingItem?.latar_belakang || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        latar_belakang: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Solusi / Terobosan Inovatif
                  </label>
                  <Textarea
                    rows={3}
                    placeholder='Jelaskan mekanisme atau solusi yang dihadirkan inovasi ini...'
                    value={editingItem?.solusi_inovasi || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        solusi_inovasi: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>
              </div>

              {/* Komparasi Before vs After */}
              <div className='border-border/80 bg-muted/20 grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400'>
                    <XCircle className='size-3.5' />
                    Kondisi Sebelum Inovasi
                  </label>
                  <Textarea
                    rows={2}
                    placeholder='Contoh: Pemohon menyeberang pulau 3 jam, biaya Rp200rb, waktu proses 3-5 hari...'
                    value={editingItem?.kondisi_sebelum || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        kondisi_sebelum: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
                    <CheckCircle2 className='size-3.5' />
                    Kondisi Sesudah Inovasi
                  </label>
                  <Textarea
                    rows={2}
                    placeholder='Contoh: Layanan selesai < 15 menit via WhatsApp/portal, biaya Rp 0...'
                    value={editingItem?.kondisi_sesudah || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        kondisi_sesudah: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>
              </div>

              {/* Metrik Efisiensi, Jumlah Pengguna, Tim */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Efisiensi (%)
                  </label>
                  <Input
                    placeholder='Contoh: 85%'
                    value={editingItem?.persentase_efisiensi || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        persentase_efisiensi: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Estimasi Jumlah Pengguna
                  </label>
                  <Input
                    type='number'
                    placeholder='Contoh: 1200'
                    value={editingItem?.jumlah_pengguna || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        jumlah_pengguna: parseInt(e.target.value, 10) || 0
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Penanggung Jawab / Tim
                  </label>
                  <Input
                    placeholder='Contoh: Tim IPDS & PST'
                    value={editingItem?.penanggung_jawab || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        penanggung_jawab: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>
              </div>

              {/* Tautan Dokumen & Video */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Link Folder GDrive Dokumentasi
                  </label>
                  <Input
                    placeholder='https://drive.google.com/...'
                    value={editingItem?.link_dokumentasi || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        link_dokumentasi: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    Link Video Demonstrasi (YouTube / GDrive)
                  </label>
                  <Input
                    placeholder='https://youtube.com/watch?v=...'
                    value={editingItem?.link_video || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        link_video: e.target.value
                      }))
                    }
                    className='text-xs sm:text-sm'
                  />
                </div>
              </div>

              {/* SUBFORM TESTIMONI */}
              <div className='border-border/80 bg-card space-y-3 rounded-xl border p-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                    Testimoni Stakeholder & Pengguna ({tempTestimoniList.length}
                    )
                  </h4>
                </div>

                {/* List Testimoni Existing */}
                {tempTestimoniList.length > 0 && (
                  <div className='max-h-40 space-y-2 overflow-y-auto pr-1'>
                    {tempTestimoniList.map((t, idx) => (
                      <div
                        key={idx}
                        className='bg-muted/40 flex items-start justify-between gap-2 rounded-lg p-2 text-xs'
                      >
                        <div>
                          <div className='text-foreground font-semibold'>
                            {t.nama}{' '}
                            <span className='text-muted-foreground font-normal'>
                              ({t.instansi})
                            </span>
                          </div>
                          <p className='text-muted-foreground line-clamp-1 italic'>
                            &ldquo;{t.kutipan}&rdquo;
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-6 text-rose-500 hover:text-rose-700'
                          onClick={() => handleRemoveTestimoni(idx)}
                        >
                          <Trash2 className='size-3.5' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input New Testimoni */}
                <div className='border-border/50 grid grid-cols-1 gap-2 border-t pt-2 text-xs sm:grid-cols-4'>
                  <Input
                    placeholder='Nama Pemberi Testimoni'
                    value={newTestiNama}
                    onChange={(e) => setNewTestiNama(e.target.value)}
                    className='h-8 text-xs'
                  />
                  <Input
                    placeholder='Instansi (e.g. Bappelitbangda)'
                    value={newTestiInstansi}
                    onChange={(e) => setNewTestiInstansi(e.target.value)}
                    className='h-8 text-xs'
                  />
                  <Input
                    placeholder='Jabatan (e.g. Kabid Perencanaan)'
                    value={newTestiJabatan}
                    onChange={(e) => setNewTestiJabatan(e.target.value)}
                    className='h-8 text-xs'
                  />
                  <div className='flex items-center gap-1'>
                    <Input
                      placeholder='Kutipan testimoni singkat...'
                      value={newTestiKutipan}
                      onChange={(e) => setNewTestiKutipan(e.target.value)}
                      className='h-8 flex-1 text-xs'
                    />
                    <Button
                      type='button'
                      variant='secondary'
                      size='sm'
                      onClick={handleAddTestimoni}
                      className='h-8 shrink-0 px-2.5 text-xs'
                    >
                      <Plus className='size-3.5' />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className='flex items-center justify-between pt-2'>
                {editingItem?.id && (
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      handleDeleteInovasi(
                        editingItem.id!,
                        editingItem.nama_inovasi!
                      )
                    }
                    className='text-xs'
                  >
                    <Trash2 className='mr-1.5 size-3.5' />
                    Hapus Inovasi
                  </Button>
                )}

                <div className='ml-auto flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsFormOpen(false)}
                    className='text-xs'
                  >
                    Batal
                  </Button>
                  <Button
                    type='submit'
                    size='sm'
                    disabled={isSaving}
                    className='text-xs font-semibold'
                  >
                    {isSaving && (
                      <Loader2 className='mr-1.5 size-3.5 animate-spin' />
                    )}
                    Simpan Inovasi
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
