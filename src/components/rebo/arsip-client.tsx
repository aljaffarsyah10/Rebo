'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Archive,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Target,
  Sparkles,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  createArsipDokumen,
  deleteArsipDokumen,
  getArsipList,
  type CreateArsipInput
} from '@/actions/arsip-actions';
import type { ArsipDokumen, KategoriArsip } from '@/types/rebo';
import { KATEGORI_ARSIP_MAP } from '@/types/rebo';
import { toast } from 'sonner';

interface ArsipClientProps {
  initialData: ArsipDokumen[];
  availableYears: number[];
  isAdmin: boolean;
}

export default function ArsipClient({
  initialData,
  availableYears,
  isAdmin
}: ArsipClientProps) {
  const [items, setItems] = useState<ArsipDokumen[]>(initialData);
  const [years, setYears] = useState<number[]>(availableYears);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formJudul, setFormJudul] = useState('');
  const [formKategori, setFormKategori] = useState<KategoriArsip>('SK_TIM');
  const [formTahun, setFormTahun] = useState<number>(new Date().getFullYear());
  const [formNomor, setFormNomor] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Handle Refresh
  const handleFilterChange = (targetYear?: string, targetKategori?: string) => {
    const y = targetYear !== undefined ? targetYear : selectedYear;
    const k = targetKategori !== undefined ? targetKategori : selectedKategori;

    startTransition(async () => {
      const filterPayload: {
        tahun?: number;
        kategori?: string;
        search?: string;
      } = {};
      if (y !== 'ALL') filterPayload.tahun = Number(y);
      if (k !== 'ALL') filterPayload.kategori = k;
      if (searchQuery.trim()) filterPayload.search = searchQuery.trim();

      const res = await getArsipList(filterPayload);
      if (res.success && res.data) {
        setItems(res.data);
        if (res.availableYears && res.availableYears.length > 0) {
          setYears(res.availableYears);
        }
      } else {
        toast.error(res.error || 'Gagal memuat arsip.');
      }
    });
  };

  // Copy Link Handler
  const handleCopyLink = async (doc: ArsipDokumen) => {
    try {
      await navigator.clipboard.writeText(doc.file_url);
      setCopiedId(doc.id);
      toast.success('Tautan berkas berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  // Create Document Handler
  const handleCreateArsip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formUrl.trim()) {
      toast.error('Judul dokumen dan tautan file Google Drive wajib diisi.');
      return;
    }

    startTransition(async () => {
      const payload: CreateArsipInput = {
        judul_dokumen: formJudul.trim(),
        kategori: formKategori,
        tahun: Number(formTahun),
        file_url: formUrl.trim(),
        nomor_surat: formNomor.trim() || undefined,
        keterangan: formKeterangan.trim() || undefined
      };

      const res = await createArsipDokumen(payload);
      if (res.success) {
        toast.success('Dokumen arsip resmi berhasil ditambahkan!');
        setIsModalOpen(false);
        // Reset form
        setFormJudul('');
        setFormNomor('');
        setFormUrl('');
        setFormKeterangan('');
        // Refresh list
        handleFilterChange();
      } else {
        toast.error(res.error || 'Gagal menambahkan dokumen arsip.');
      }
    });
  };

  // Delete Document Handler
  const handleDeleteArsip = (id: string, judul: string) => {
    startTransition(async () => {
      const res = await deleteArsipDokumen(id);
      if (res.success) {
        toast.success(`Arsip "${judul}" berhasil dihapus.`);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(res.error || 'Gagal menghapus dokumen.');
      }
    });
  };

  // Helper Icon Kategori
  const getKategoriIcon = (kat: KategoriArsip) => {
    switch (kat) {
      case 'SK_TIM':
        return (
          <ShieldCheck className='h-4 w-4 text-purple-600 dark:text-purple-400' />
        );
      case 'RENCANA_AKSI':
        return <Target className='h-4 w-4 text-blue-600 dark:text-blue-400' />;
      case 'SOP_INOVASI':
        return (
          <Sparkles className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
        );
      case 'LKE_RESMI':
        return (
          <FileSpreadsheet className='h-4 w-4 text-amber-600 dark:text-amber-400' />
        );
      case 'PEDOMAN':
      default:
        return (
          <BookOpen className='h-4 w-4 text-slate-600 dark:text-slate-400' />
        );
    }
  };

  // Filtered in-memory items (untuk responsivitas pencarian cepat)
  const displayedItems = items.filter((doc) => {
    const matchesYear =
      selectedYear === 'ALL' || doc.tahun === Number(selectedYear);
    const matchesKategori =
      selectedKategori === 'ALL' || doc.kategori === selectedKategori;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      doc.judul_dokumen.toLowerCase().includes(q) ||
      (doc.nomor_surat && doc.nomor_surat.toLowerCase().includes(q)) ||
      (doc.keterangan && doc.keterangan.toLowerCase().includes(q));

    return matchesYear && matchesKategori && matchesQuery;
  });

  return (
    <div className='container mx-auto max-w-7xl space-y-8 p-6'>
      {/* 1. Hero Header Section */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 p-6 sm:p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-purple-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-blue-300/60 bg-blue-100/60 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300'
              >
                <Archive className='mr-1.5 h-3.5 w-3.5' />
                Arsip Digital Dinamis ZI
              </Badge>
              <Badge
                variant='secondary'
                className='bg-white/80 text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200'
              >
                BPS Kab. Kepulauan Siau Tagulandang Biaro
              </Badge>
            </div>
            <h1 className='bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-slate-100 dark:via-blue-400 dark:to-indigo-300'>
              Katalog Arsip Digital Reformasi Birokrasi
            </h1>
            <p className='max-w-3xl text-sm text-slate-700 sm:text-base dark:text-slate-300'>
              Pusat repositori digital dokumen resmi pembangunan Zona Integritas
              BPS Sitaro: Surat Keputusan (SK) Tim Kerja, Rencana Aksi, SOP
              Inovasi Layanan, Lembar Kerja Evaluasi (LKE), serta Pedoman PMPRB
              KemenPAN-RB.
            </p>
          </div>

          {/* Action Button: Tambah Dokumen (Super Admin Only) */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleFilterChange()}
              disabled={isPending}
              className='h-9 border-slate-300 bg-white/80 shadow-xs hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800'
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              Segarkan
            </Button>

            {isAdmin && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size='sm'
                    className='h-9 bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                  >
                    <Plus className='mr-1.5 h-4 w-4' />
                    Tambah Dokumen Arsip
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-lg'>
                  <form onSubmit={handleCreateArsip}>
                    <DialogHeader>
                      <DialogTitle className='text-lg font-bold'>
                        Tambah Dokumen Arsip Resmi
                      </DialogTitle>
                      <DialogDescription>
                        Unggah metadata dokumen SK, Rencana Aksi, SOP, atau LKE
                        ke repositori digital Zona Integritas BPS Sitaro.
                      </DialogDescription>
                    </DialogHeader>

                    <div className='mt-4 space-y-4'>
                      {/* Judul Dokumen */}
                      <div className='space-y-1.5'>
                        <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                          Judul / Nama Dokumen{' '}
                          <span className='text-rose-500'>*</span>
                        </label>
                        <Input
                          placeholder='Contoh: SK Tim Kerja Pembangunan ZI Tahun 2026'
                          value={formJudul}
                          onChange={(e) => setFormJudul(e.target.value)}
                          required
                        />
                      </div>

                      {/* Kategori & Tahun */}
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        <div className='space-y-1.5'>
                          <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                            Kategori Dokumen{' '}
                            <span className='text-rose-500'>*</span>
                          </label>
                          <select
                            value={formKategori}
                            onChange={(e) =>
                              setFormKategori(e.target.value as KategoriArsip)
                            }
                            className='h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          >
                            <option value='SK_TIM'>SK Tim Kerja ZI</option>
                            <option value='RENCANA_AKSI'>
                              Rencana Aksi & Kerja
                            </option>
                            <option value='SOP_INOVASI'>
                              SOP & Inovasi Layanan
                            </option>
                            <option value='LKE_RESMI'>LKE / LHE Resmi</option>
                            <option value='PEDOMAN'>Pedoman & Juknis</option>
                          </select>
                        </div>

                        <div className='space-y-1.5'>
                          <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                            Tahun Evaluasi{' '}
                            <span className='text-rose-500'>*</span>
                          </label>
                          <Input
                            type='number'
                            min={2020}
                            max={2035}
                            value={formTahun}
                            onChange={(e) =>
                              setFormTahun(Number(e.target.value))
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Nomor Surat / SK */}
                      <div className='space-y-1.5'>
                        <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                          Nomor Surat / SK (Opsional)
                        </label>
                        <Input
                          placeholder='Contoh: 018/71080/KP.300/2026'
                          value={formNomor}
                          onChange={(e) => setFormNomor(e.target.value)}
                        />
                      </div>

                      {/* URL File Google Drive */}
                      <div className='space-y-1.5'>
                        <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                          Tautan File Dokumen / Google Drive{' '}
                          <span className='text-rose-500'>*</span>
                        </label>
                        <Input
                          placeholder='https://drive.google.com/...'
                          value={formUrl}
                          onChange={(e) => setFormUrl(e.target.value)}
                          required
                        />
                        <p className='text-[11px] text-slate-500'>
                          Tautan folder Google Drive atau berkas PDF yang dapat
                          diakses oleh evaluator/pengguna.
                        </p>
                      </div>

                      {/* Keterangan */}
                      <div className='space-y-1.5'>
                        <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                          Keterangan / Ringkasan Isi Dokumen
                        </label>
                        <Textarea
                          placeholder='Ringkasan singkat muatan dokumen...'
                          rows={3}
                          value={formKeterangan}
                          onChange={(e) => setFormKeterangan(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter className='mt-6'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsModalOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        type='submit'
                        disabled={isPending}
                        className='bg-blue-600 text-white hover:bg-blue-700'
                      >
                        {isPending ? 'Menyimpan...' : 'Simpan Arsip'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className='flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/80'>
        <div className='flex flex-wrap items-center gap-2.5'>
          {/* Filter Tahun */}
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-4 w-4 text-slate-500' />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handleFilterChange(e.target.value, undefined);
              }}
              className='h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <option value='ALL'>Semua Tahun</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div className='flex items-center gap-1.5'>
            <Filter className='h-4 w-4 text-slate-500' />
            <select
              value={selectedKategori}
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                handleFilterChange(undefined, e.target.value);
              }}
              className='h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <option value='ALL'>Semua Kategori</option>
              <option value='SK_TIM'>SK Tim Kerja ZI</option>
              <option value='RENCANA_AKSI'>Rencana Aksi & Kerja</option>
              <option value='SOP_INOVASI'>SOP & Inovasi Layanan</option>
              <option value='LKE_RESMI'>LKE / LHE Resmi</option>
              <option value='PEDOMAN'>Pedoman & Juknis</option>
            </select>
          </div>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className='flex items-center gap-2.5'>
          <div className='relative w-full sm:w-64'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Cari nomor SK / judul...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-9 pl-8 text-xs'
            />
          </div>

          <div className='flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700'>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => setViewMode('grid')}
              title='Tampilan Kotak (Grid)'
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => setViewMode('list')}
              title='Tampilan Daftar (List)'
            >
              <ListIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Document Count & Filter Pill Summary */}
      <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400'>
        <div>
          Menampilkan{' '}
          <span className='font-bold text-slate-800 dark:text-slate-200'>
            {displayedItems.length}
          </span>{' '}
          dokumen arsip
          {selectedYear !== 'ALL' && ` pada periode Tahun ${selectedYear}`}
          {selectedKategori !== 'ALL' &&
            ` kategori ${KATEGORI_ARSIP_MAP[selectedKategori as KategoriArsip]?.label || selectedKategori}`}
        </div>
        {(selectedYear !== 'ALL' ||
          selectedKategori !== 'ALL' ||
          searchQuery) && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setSelectedYear('ALL');
              setSelectedKategori('ALL');
              setSearchQuery('');
              handleFilterChange('ALL', 'ALL');
            }}
            className='h-6 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400'
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* 4. Document Grid / List Content */}
      {displayedItems.length === 0 ? (
        <Card className='rounded-2xl border-dashed py-12 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-3'>
            <div className='rounded-full bg-slate-100 p-3 dark:bg-slate-800'>
              <FolderOpen className='h-8 w-8 text-slate-400' />
            </div>
            <div className='space-y-1'>
              <h3 className='text-base font-bold text-slate-800 dark:text-slate-200'>
                Tidak ada dokumen arsip yang sesuai
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Coba sesuaikan kata kunci pencarian atau ubah filter tahun dan
                kategori.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {displayedItems.map((doc) => {
            const kategoriInfo = KATEGORI_ARSIP_MAP[doc.kategori] || {
              label: doc.kategori,
              badgeClass: 'bg-slate-100 text-slate-800',
              description: ''
            };

            return (
              <Card
                key={doc.id}
                className='flex flex-col justify-between overflow-hidden rounded-2xl border-slate-200/90 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:hover:border-blue-700'
              >
                <CardHeader className='space-y-3 p-5 pb-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <Badge
                      variant='outline'
                      className={`text-[11px] font-semibold ${kategoriInfo.badgeClass}`}
                    >
                      <span className='mr-1.5'>
                        {getKategoriIcon(doc.kategori)}
                      </span>
                      {kategoriInfo.label}
                    </Badge>
                    <Badge
                      variant='secondary'
                      className='bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    >
                      Tahun {doc.tahun}
                    </Badge>
                  </div>

                  <CardTitle className='line-clamp-2 text-base leading-snug font-bold text-slate-900 dark:text-slate-100'>
                    {doc.judul_dokumen}
                  </CardTitle>

                  {doc.nomor_surat && (
                    <div className='rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400'>
                      No: {doc.nomor_surat}
                    </div>
                  )}

                  {doc.keterangan && (
                    <CardDescription className='line-clamp-3 text-xs text-slate-600 dark:text-slate-400'>
                      {doc.keterangan}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardFooter className='flex flex-col gap-3 border-t border-slate-100 p-5 pt-3 dark:border-slate-800'>
                  <div className='flex w-full items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                    <span>Oleh: {doc.uploaded_by}</span>
                    <span>
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : ''}
                    </span>
                  </div>

                  <div className='flex w-full items-center gap-2'>
                    <a
                      href={doc.file_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex-1'
                    >
                      <Button
                        size='sm'
                        className='h-8 w-full bg-blue-600 text-xs text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                      >
                        <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
                        Buka Berkas
                      </Button>
                    </a>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCopyLink(doc)}
                      className='h-8 border-slate-300 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                      title='Salin Tautan Dokumen'
                    >
                      {copiedId === doc.id ? (
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                      ) : (
                        <Copy className='h-3.5 w-3.5' />
                      )}
                    </Button>

                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50'
                            title='Hapus Dokumen Arsip'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus Dokumen Arsip?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus &ldquo;
                              {doc.judul_dokumen}&rdquo;? Tindakan ini tidak
                              dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteArsip(doc.id, doc.judul_dokumen)
                              }
                              className='bg-rose-600 text-white hover:bg-rose-700'
                            >
                              Hapus Dokumen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs'>
              <thead className='border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'>
                <tr>
                  <th className='py-3.5 pr-4 pl-6 font-semibold'>Kategori</th>
                  <th className='px-4 py-3.5 font-semibold'>Tahun</th>
                  <th className='px-4 py-3.5 font-semibold'>Judul Dokumen</th>
                  <th className='px-4 py-3.5 font-semibold'>
                    Nomor SK / Surat
                  </th>
                  <th className='px-4 py-3.5 font-semibold'>Pengunggah</th>
                  <th className='py-3.5 pr-6 pl-4 text-right font-semibold'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {displayedItems.map((doc) => {
                  const kategoriInfo = KATEGORI_ARSIP_MAP[doc.kategori] || {
                    label: doc.kategori,
                    badgeClass: 'bg-slate-100 text-slate-800',
                    description: ''
                  };

                  return (
                    <tr
                      key={doc.id}
                      className='transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    >
                      <td className='py-3.5 pr-4 pl-6'>
                        <Badge
                          variant='outline'
                          className={`text-[11px] font-semibold ${kategoriInfo.badgeClass}`}
                        >
                          <span className='mr-1.5'>
                            {getKategoriIcon(doc.kategori)}
                          </span>
                          {kategoriInfo.label}
                        </Badge>
                      </td>
                      <td className='px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200'>
                        {doc.tahun}
                      </td>
                      <td className='max-w-xs px-4 py-3.5'>
                        <div className='font-semibold text-slate-900 dark:text-slate-100'>
                          {doc.judul_dokumen}
                        </div>
                        {doc.keterangan && (
                          <div className='mt-0.5 line-clamp-1 text-[11px] text-slate-500'>
                            {doc.keterangan}
                          </div>
                        )}
                      </td>
                      <td className='px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400'>
                        {doc.nomor_surat || '-'}
                      </td>
                      <td className='px-4 py-3.5 text-slate-500 dark:text-slate-400'>
                        {doc.uploaded_by}
                      </td>
                      <td className='py-3.5 pr-6 pl-4 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <a
                            href={doc.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <Button
                              size='sm'
                              className='h-7 bg-blue-600 px-2.5 text-[11px] text-white hover:bg-blue-700'
                            >
                              <ExternalLink className='mr-1 h-3 w-3' />
                              Buka
                            </Button>
                          </a>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleCopyLink(doc)}
                            className='h-7 w-7 p-0'
                            title='Salin Tautan'
                          >
                            {copiedId === doc.id ? (
                              <Check className='h-3 w-3 text-emerald-600' />
                            ) : (
                              <Copy className='h-3 w-3' />
                            )}
                          </Button>
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-7 w-7 p-0 text-rose-600 hover:bg-rose-50'
                                  title='Hapus'
                                >
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Dokumen Arsip?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hapus berkas &ldquo;{doc.judul_dokumen}
                                    &rdquo;?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteArsip(
                                        doc.id,
                                        doc.judul_dokumen
                                      )
                                    }
                                    className='bg-rose-600 text-white hover:bg-rose-700'
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
