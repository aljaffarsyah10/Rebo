'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Award,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
  Printer,
  Edit3,
  Search,
  RefreshCw,
  AlertTriangle,
  Gift,
  HeartHandshake,
  Ship,
  Sparkles,
  Info,
  BookOpen,
  Users,
  Compass,
  FileCheck,
  Building2,
  PhoneCall,
  Check,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import {
  StandarPelayananItem,
  MaklumatPelayananData,
  KategoriLayanan,
  KATEGORI_LAYANAN_LABELS,
  ALUR_KOMPENSASI_DEFAULT,
  TahapKompensasiLayanan
} from '@/lib/pelayanan/standar-pelayanan-types';

import {
  saveStandarPelayananAction,
  updateMaklumatPelayananAction,
  resetStandarPelayananToDefaultAction
} from '@/actions/pelayanan-actions';

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

interface StandarPelayananClientProps {
  initialItems: StandarPelayananItem[];
  initialMaklumat: MaklumatPelayananData;
}

export default function StandarPelayananClient({
  initialItems,
  initialMaklumat
}: StandarPelayananClientProps) {
  const [items, setItems] = useState<StandarPelayananItem[]>(initialItems);
  const [maklumat, setMaklumat] =
    useState<MaklumatPelayananData>(initialMaklumat);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');

  // Expanded items state
  const [expandedId, setExpandedId] = useState<string | null>(
    items[0]?.id || null
  );

  // Active Tab: 'maklumat' | 'katalog' | 'kompensasi'
  const [activeMainTab, setActiveMainTab] = useState<
    'maklumat' | 'katalog' | 'kompensasi'
  >('maklumat');

  // Edit Maklumat Modal State
  const [isEditMaklumatOpen, setIsEditMaklumatOpen] = useState(false);
  const [editMaklumatForm, setEditMaklumatForm] =
    useState<MaklumatPelayananData>(initialMaklumat);

  // Edit SP Item Modal State
  const [isEditSPOpen, setIsEditSPOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StandarPelayananItem | null>(
    null
  );

  // Print Dialog State
  const [isPrintMaklumatOpen, setIsPrintMaklumatOpen] = useState(false);
  const [isPrintSPOpen, setIsPrintSPOpen] = useState(false);
  const [printTargetSP, setPrintTargetSP] =
    useState<StandarPelayananItem | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filtered SP items
  const filteredItems = items.filter((item) => {
    const matchKategori =
      selectedKategori === 'ALL' || item.kategori === selectedKategori;
    const matchSearch =
      searchQuery.trim() === '' ||
      item.nama_produk_layanan
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.produk_pelayanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dasar_hukum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.persyaratan.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchKategori && matchSearch;
  });

  // Handle Save Maklumat
  const handleSaveMaklumat = () => {
    startTransition(async () => {
      try {
        const res = await updateMaklumatPelayananAction(editMaklumatForm);
        if (res.success && res.maklumat) {
          setMaklumat(res.maklumat);
          setIsEditMaklumatOpen(false);
          toast.success('Maklumat Pelayanan resmi berhasil diperbarui!');
        } else {
          toast.error(res.error || 'Gagal menyimpan Maklumat Pelayanan');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan sistem');
      }
    });
  };

  // Handle Save SP Item
  const handleSaveSPItem = () => {
    if (!editingItem) return;
    startTransition(async () => {
      try {
        const res = await saveStandarPelayananAction(editingItem);
        if (res.success && res.data) {
          setItems((prev) =>
            prev.map((it) => (it.id === res.data!.id ? res.data! : it))
          );
          setIsEditSPOpen(false);
          setEditingItem(null);
          toast.success(
            `Standar Pelayanan "${res.data.nama_produk_layanan}" berhasil diperbarui!`
          );
        } else {
          toast.error(res.error || 'Gagal menyimpan Standar Pelayanan');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan sistem');
      }
    });
  };

  // Handle Reset to Default
  const handleResetDefault = () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin mereset seluruh Standar Pelayanan dan Maklumat ke default PermenPAN-RB No. 15/2014?'
      )
    )
      return;
    startTransition(async () => {
      try {
        const res = await resetStandarPelayananToDefaultAction();
        if (res.success) {
          setItems(res.data);
          setMaklumat(res.maklumat);
          toast.success(
            'Seluruh data berhasil direset ke standar baku PermenPAN-RB No. 15/2014.'
          );
        } else {
          toast.error(res.error || 'Gagal mereset data');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan');
      }
    });
  };

  return (
    <div className='space-y-8'>
      {/* =========================================================================
          PAGE HEADER & ZI-WBK COMPLIANCE BANNER
      ========================================================================= */}
      <div className='relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:to-emerald-950/20'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='border-amber-400 bg-amber-100 font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
              >
                <Award className='mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                Zona Integritas WBK - Pilar 6: Pelayanan Publik
              </Badge>
              <Badge
                variant='outline'
                className='border-emerald-400 bg-emerald-100 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              >
                UU No. 25/2009 & PermenPAN-RB No. 15/2014
              </Badge>
            </div>
            <h1 className='text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-white'>
              Katalog Standar Pelayanan & Maklumat Digital
            </h1>
            <p className='max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
              Penyelenggaraan pelayanan publik prima Pelayanan Statistik Terpadu
              (PST) BPS Kabupaten Kepulauan Sitaro. Dilengkapi 14 komponen
              standar pelayanan, garansi kompensasi keterlambatan antar-pulau,
              dan Maklumat Pelayanan berbingkai emas digital.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPrintMaklumatOpen(true)}
              className='border-amber-300 bg-white shadow-sm hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 dark:hover:bg-amber-950/30'
            >
              <Printer className='mr-1.5 h-4 w-4 text-amber-600 dark:text-amber-400' />
              Cetak Maklumat A4
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleResetDefault}
              disabled={isPending}
              className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              Reset Default
            </Button>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <div className='rounded-xl border border-amber-200/50 bg-white/70 p-3.5 backdrop-blur-sm dark:border-amber-900/30 dark:bg-slate-900/60'>
            <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
              <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              Tarif Layanan
            </div>
            <div className='mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300'>
              Rp 0,- (100% Gratis)
            </div>
            <div className='text-[11px] text-slate-500'>
              Bebas Pungli & Gratifikasi
            </div>
          </div>

          <div className='rounded-xl border border-amber-200/50 bg-white/70 p-3.5 backdrop-blur-sm dark:border-amber-900/30 dark:bg-slate-900/60'>
            <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
              <FileCheck className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              Produk Layanan
            </div>
            <div className='mt-1 text-lg font-bold text-blue-700 dark:text-blue-300'>
              {items.length} Layanan PST
            </div>
            <div className='text-[11px] text-slate-500'>
              14 Komponen Standar Baku
            </div>
          </div>

          <div className='rounded-xl border border-amber-200/50 bg-white/70 p-3.5 backdrop-blur-sm dark:border-amber-900/30 dark:bg-slate-900/60'>
            <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
              <Gift className='h-4 w-4 text-orange-600 dark:text-orange-400' />
              Garansi Kompensasi
            </div>
            <div className='mt-1 text-lg font-bold text-orange-700 dark:text-orange-300'>
              5 Tahap SOP
            </div>
            <div className='text-[11px] text-slate-500'>
              Bebas Ongkir Antar-Pulau
            </div>
          </div>

          <div className='rounded-xl border border-amber-200/50 bg-white/70 p-3.5 backdrop-blur-sm dark:border-amber-900/30 dark:bg-slate-900/60'>
            <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
              <ShieldCheck className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              Status Maklumat
            </div>
            <div className='mt-1 flex items-center gap-1.5 text-lg font-bold text-purple-700 dark:text-purple-300'>
              <span className='inline-block h-2.5 w-2.5 rounded-full bg-emerald-500'></span>
              {maklumat.status_pajang ? 'Terpajang Resmi' : 'Draft Internal'}
            </div>
            <div className='text-[11px] text-slate-500'>
              SK: {maklumat.nomor_sk_penetapan}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION TABS
      ========================================================================= */}
      <div className='flex border-b border-slate-200 dark:border-slate-800'>
        <button
          onClick={() => setActiveMainTab('maklumat')}
          className={`relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeMainTab === 'maklumat'
              ? 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className='h-4 w-4 text-amber-500' />
          Sertifikat Emas Maklumat Pelayanan
        </button>

        <button
          onClick={() => setActiveMainTab('katalog')}
          className={`relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeMainTab === 'katalog'
              ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className='h-4 w-4 text-blue-500' />
          Katalog 14 Komponen Standar Pelayanan ({items.length})
        </button>

        <button
          onClick={() => setActiveMainTab('kompensasi')}
          className={`relative flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeMainTab === 'kompensasi'
              ? 'border-orange-600 text-orange-700 dark:border-orange-400 dark:text-orange-300'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Gift className='h-4 w-4 text-orange-500' />
          Alur & SOP Kompensasi Keterlambatan
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SERTIFIKAT EMAS MAKLUMAT PELAYANAN BPS SITARO
      ========================================================================= */}
      {activeMainTab === 'maklumat' && (
        <div className='space-y-6'>
          {/* Certificate Actions Bar */}
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                  Pigura Maklumat Pelayanan Digital
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Wajib dipajang di lobi Pelayanan Statistik Terpadu (PST) &
                  Portal Web sesuai amanat UU No. 25/2009 Pasal 22
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setEditMaklumatForm({ ...maklumat });
                  setIsEditMaklumatOpen(true);
                }}
                className='border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              >
                <Edit3 className='mr-1.5 h-3.5 w-3.5' />
                Edit Teks Maklumat
              </Button>
              <Button
                size='sm'
                onClick={() => setIsPrintMaklumatOpen(true)}
                className='bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md hover:from-amber-700 hover:to-amber-800'
              >
                <Printer className='mr-1.5 h-4 w-4' />
                Cetak Format Pigura A4
              </Button>
            </div>
          </div>

          {/* THE GOLD FRAME CERTIFICATE (Sertifikat Emas) */}
          <div className='relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-8 border-amber-500/80 bg-gradient-to-br from-amber-50 via-white to-amber-100/50 p-3 shadow-2xl ring-4 ring-amber-300/40 dark:border-amber-600/80 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30'>
            {/* Inner Double Gold Border */}
            <div className='relative rounded-2xl border-2 border-dashed border-amber-600/60 p-8 sm:p-12 dark:border-amber-400/50'>
              {/* Corner Ornaments */}
              <div className='absolute top-3 left-3 h-8 w-8 border-t-2 border-l-2 border-amber-700 dark:border-amber-400'></div>
              <div className='absolute top-3 right-3 h-8 w-8 border-t-2 border-r-2 border-amber-700 dark:border-amber-400'></div>
              <div className='absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2 border-amber-700 dark:border-amber-400'></div>
              <div className='absolute right-3 bottom-3 h-8 w-8 border-r-2 border-b-2 border-amber-700 dark:border-amber-400'></div>

              {/* Watermark Logo Background */}
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]'>
                <Award className='h-96 w-96 text-amber-900 dark:text-amber-200' />
              </div>

              {/* Header Lembaga & Lambang Garuda / BPS */}
              <div className='relative text-center'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg'>
                  <div className='flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-900'>
                    <Award className='h-9 w-9 text-amber-600 dark:text-amber-400' />
                  </div>
                </div>

                <h3 className='mt-4 font-serif text-xs font-bold tracking-[0.25em] text-amber-800 uppercase dark:text-amber-300'>
                  BADAN PUSAT STATISTIK
                </h3>
                <h2 className='font-serif text-lg font-black tracking-wider text-slate-900 sm:text-xl dark:text-white'>
                  KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
                </h2>
                <div className='mx-auto mt-2 h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent dark:via-amber-400'></div>

                <h1 className='mt-6 font-serif text-2xl font-black tracking-widest text-amber-700 uppercase drop-shadow-sm sm:text-3xl dark:text-amber-400'>
                  MAKLUMAT PELAYANAN
                </h1>
                <p className='mt-1 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400'>
                  NOMOR: {maklumat.nomor_sk_penetapan}
                </p>
              </div>

              {/* Teks Isi Maklumat Pelayanan */}
              <div className='relative mt-8 text-center'>
                <div className='mx-auto max-w-2xl rounded-2xl border border-amber-200/80 bg-white/60 p-6 shadow-inner backdrop-blur-xs dark:border-amber-900/40 dark:bg-slate-900/60'>
                  <p className='font-serif text-base leading-relaxed font-semibold tracking-wide text-slate-800 italic sm:text-lg dark:text-slate-100'>
                    &ldquo;{maklumat.teks_maklumat}&rdquo;
                  </p>
                </div>
              </div>

              {/* Tagline Bebas Pungli Rp 0 */}
              <div className='mt-6 flex flex-wrap items-center justify-center gap-3 text-center'>
                <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'>
                  <ShieldCheck className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  100% BEBAS PUNGLI & GRATIFIKASI - TARIF RP 0,-
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-4 py-1 text-xs font-bold text-blue-800 shadow-xs dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300'>
                  <HeartHandshake className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  MELAYANI DENGAN HATI (HUMBLE, AKUNTABEL, TRANSPARAN,
                  INTEGRITAS)
                </span>
              </div>

              {/* Tanda Tangan & Stempel Resmi */}
              <div className='relative mt-12 flex flex-col items-end sm:flex-row sm:items-end sm:justify-between'>
                <div className='mb-6 text-left sm:mb-0'>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 rounded-full bg-emerald-500'></div>
                    <span className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                      Terdaftar pada SIMPEL & JDIH BPS
                    </span>
                  </div>
                  <p className='mt-1 text-[11px] text-slate-500'>
                    Ditetapkan di: Ondong Siau
                  </p>
                  <p className='text-[11px] text-slate-500'>
                    Pada tanggal: {maklumat.tanggal_penetapan}
                  </p>
                </div>

                <div className='relative min-w-[240px] text-center'>
                  <p className='text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300'>
                    KEPALA BADAN PUSAT STATISTIK
                    <br />
                    KABUPATEN KEPULAUAN SITARO
                  </p>

                  {/* Stamp & Signature Container */}
                  <div className='relative my-3 flex h-24 items-center justify-center'>
                    {/* Simulated Digital Signature */}
                    <div className='z-10 font-serif text-2xl font-bold tracking-widest text-slate-800 italic opacity-85 select-none dark:text-slate-200'>
                      Stella Mandagi
                    </div>

                    {/* Simulated BPS Stamp */}
                    <div className='pointer-events-none absolute -top-1 left-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-blue-600/70 p-1 text-center opacity-70 select-none'>
                      <div className='flex h-full w-full flex-col items-center justify-center rounded-full border border-dashed border-blue-600 text-[8px] font-bold text-blue-700 dark:text-blue-400'>
                        <span>BADAN PUSAT STATISTIK</span>
                        <span className='my-0.5 font-sans text-[6px] tracking-widest'>
                          ★ SITARO ★
                        </span>
                        <span>SULAWESI UTARA</span>
                      </div>
                    </div>
                  </div>

                  <p className='font-serif text-sm font-bold text-slate-900 underline dark:text-white'>
                    {maklumat.pejabat_penandatangan}
                  </p>
                  <p className='font-mono text-xs text-slate-600 dark:text-slate-400'>
                    NIP. {maklumat.nip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: KATALOG 14 KOMPONEN STANDAR PELAYANAN
      ========================================================================= */}
      {activeMainTab === 'katalog' && (
        <div className='space-y-6'>
          {/* Filter & Search Bar */}
          <div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900'>
            <div className='relative flex-1'>
              <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Cari produk layanan, persyaratan, dasar hukum...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            <div className='flex items-center gap-2'>
              <Select
                value={selectedKategori}
                onValueChange={setSelectedKategori}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='Filter Kategori' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Kategori (5)</SelectItem>
                  <SelectItem value='KONSULTASI'>
                    Konsultasi Statistik
                  </SelectItem>
                  <SelectItem value='DATA_MIKRO'>Data Mikro & Peta</SelectItem>
                  <SelectItem value='PUBLIKASI'>Publikasi & Pustaka</SelectItem>
                  <SelectItem value='REKOMENDASI'>
                    Rekomendasi ROMANTIK
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List of 14 Components Service Catalog */}
          <div className='space-y-4'>
            {filteredItems.length === 0 ? (
              <div className='rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700'>
                <HelpCircle className='mx-auto h-10 w-10 text-slate-400' />
                <h4 className='mt-2 font-semibold text-slate-800 dark:text-white'>
                  Tidak ada produk layanan yang cocok
                </h4>
                <p className='text-xs text-slate-500'>
                  Silakan ubah filter kategori atau kata kunci pencarian Anda.
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                const catMeta = KATEGORI_LAYANAN_LABELS[item.kategori];

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden border transition-all duration-200 ${
                      isExpanded
                        ? 'border-blue-400 shadow-md ring-2 ring-blue-100 dark:border-blue-600 dark:ring-blue-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    {/* Header Item Card */}
                    <CardHeader className='cursor-pointer bg-slate-50/50 p-5 transition-colors hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div
                          className='flex-1'
                          onClick={() =>
                            setExpandedId(isExpanded ? null : item.id)
                          }
                        >
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-mono text-xs font-bold text-slate-400'>
                              SP-{String(idx + 1).padStart(2, '0')}
                            </span>
                            <Badge
                              variant='outline'
                              className={catMeta.badgeColor}
                            >
                              {catMeta.label}
                            </Badge>
                            <Badge
                              variant='secondary'
                              className='font-semibold text-emerald-700 dark:text-emerald-400'
                            >
                              Biaya: {item.biaya_tarif}
                            </Badge>
                          </div>
                          <h3 className='mt-1.5 text-lg font-bold text-slate-900 dark:text-white'>
                            {item.nama_produk_layanan}
                          </h3>
                          <p className='text-xs text-slate-600 dark:text-slate-300'>
                            {item.produk_pelayanan}
                          </p>

                          {/* Quick Specs Badges */}
                          <div className='mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400'>
                            <span className='flex items-center gap-1'>
                              <Clock className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                              <strong>SLA:</strong> {item.waktu_layanan}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Users className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
                              <strong>Pelaksana:</strong>{' '}
                              {item.jumlah_pelaksana} Petugas
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-2 sm:self-center'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem({ ...item });
                              setIsEditSPOpen(true);
                            }}
                            className='h-8 text-xs'
                          >
                            <Edit3 className='mr-1 h-3 w-3' />
                            Edit
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintTargetSP(item);
                              setIsPrintSPOpen(true);
                            }}
                            className='h-8 text-xs'
                          >
                            <Printer className='mr-1 h-3 w-3' />
                            Cetak
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              setExpandedId(isExpanded ? null : item.id)
                            }
                            className='h-8 w-8 p-0'
                          >
                            {isExpanded ? (
                              <ChevronUp className='h-4 w-4' />
                            ) : (
                              <ChevronDown className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* EXPANDABLE 14 KOMPONEN STANDAR PELAYANAN */}
                    {isExpanded && (
                      <CardContent className='border-t border-slate-200 p-6 dark:border-slate-800'>
                        <div className='space-y-6'>
                          {/* Banner 14 Komponen PermenPAN-RB No. 15/2014 */}
                          <div className='flex items-center justify-between rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'>
                            <span className='font-semibold'>
                              14 Komponen Standar Pelayanan Sesuai PermenPAN-RB
                              No. 15/2014 & UU No. 25/2009
                            </span>
                            <span className='font-mono text-[10px]'>
                              Penyampaian (1-6) & Pengelolaan (7-14)
                            </span>
                          </div>

                          {/* SECTION A: KOMPONEN SERVICE DELIVERY (PENYAMPAIAN) */}
                          <div>
                            <h4 className='mb-3 flex items-center gap-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                              <span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                                A
                              </span>
                              Komponen Service Delivery (Penyampaian Pelayanan)
                            </h4>

                            <div className='grid gap-4 md:grid-cols-2'>
                              {/* 1. Persyaratan */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200'>
                                  <FileCheck className='h-4 w-4 text-blue-600' />
                                  1. Persyaratan Pelayanan
                                </div>
                                <ul className='mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300'>
                                  {item.persyaratan.map((syarat, sIdx) => (
                                    <li
                                      key={sIdx}
                                      className='flex items-start gap-1.5'
                                    >
                                      <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                                      <span>{syarat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 2. Sistem Mekanisme Prosedur */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200'>
                                  <Compass className='h-4 w-4 text-indigo-600' />
                                  2. Sistem, Mekanisme, dan Prosedur
                                </div>
                                <div className='mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300'>
                                  {item.prosedur_alur.map((alur, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className='flex items-start gap-2'
                                    >
                                      <span className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                                        {aIdx + 1}
                                      </span>
                                      <span>{alur}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 3 & 4. Jangka Waktu & Biaya/Tarif */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='space-y-3 text-xs'>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      3. Jangka Waktu Penyelesaian (SLA):
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.waktu_layanan}
                                    </p>
                                  </div>
                                  <div className='border-t border-slate-100 pt-2 dark:border-slate-800'>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      4. Biaya / Tarif:
                                    </span>
                                    <p className='mt-1 font-semibold text-emerald-700 dark:text-emerald-400'>
                                      {item.biaya_tarif}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 5 & 6. Produk Layanan & Penanganan Pengaduan */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='space-y-3 text-xs'>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      5. Produk Pelayanan:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.produk_pelayanan}
                                    </p>
                                  </div>
                                  <div className='border-t border-slate-100 pt-2 dark:border-slate-800'>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      6. Penanganan Pengaduan & Masukan:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.penanganan_pengaduan}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION B: KOMPONEN MANUFACTURING (PENGELOLAAN INTERNAL) */}
                          <div>
                            <h4 className='mb-3 flex items-center gap-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                              <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                                B
                              </span>
                              Komponen Manufacturing (Pengelolaan Internal BPS)
                            </h4>

                            <div className='grid gap-4 md:grid-cols-2'>
                              {/* 7. Dasar Hukum */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                                  7. Dasar Hukum
                                </div>
                                <p className='mt-1 text-xs text-slate-600 dark:text-slate-300'>
                                  {item.dasar_hukum}
                                </p>
                              </div>

                              {/* 8. Sarana & Prasarana */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                                  8. Sarana, Prasarana, dan Fasilitas
                                </div>
                                <ul className='mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300'>
                                  {item.sarana_prasarana.map((sarana, rIdx) => (
                                    <li
                                      key={rIdx}
                                      className='flex items-center gap-1.5'
                                    >
                                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
                                      <span>{sarana}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 9 & 10. Kompetensi Pelaksana & Pengawasan Internal */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='space-y-2 text-xs'>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      9. Kompetensi Pelaksana:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.kompetensi_pelaksana}
                                    </p>
                                  </div>
                                  <div className='border-t border-slate-100 pt-2 dark:border-slate-800'>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      10. Pengawasan Internal:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.pengawasan_internal}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 11 & 12. Jumlah Pelaksana & Jaminan Pelayanan */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
                                <div className='space-y-2 text-xs'>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      11. Jumlah Pelaksana:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.jumlah_pelaksana} Orang Petugas PST
                                      BPS Sitaro
                                    </p>
                                  </div>
                                  <div className='border-t border-slate-100 pt-2 dark:border-slate-800'>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      12. Jaminan Pelayanan:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.jaminan_pelayanan}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 13 & 14. Jaminan Keamanan & Evaluasi Kinerja */}
                              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs md:col-span-2 dark:border-slate-800 dark:bg-slate-900'>
                                <div className='grid gap-4 text-xs sm:grid-cols-2'>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      13. Jaminan Keamanan & Keselamatan
                                      Pelayanan:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.jaminan_keamanan}
                                    </p>
                                  </div>
                                  <div>
                                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                                      14. Evaluasi Kinerja Pelaksana:
                                    </span>
                                    <p className='mt-1 text-slate-600 dark:text-slate-300'>
                                      {item.evaluasi_kinerja}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION C: KOMPENSASI KETERLAMBATAN LAYANAN */}
                          <div className='rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20'>
                            <div className='flex items-center gap-2 text-xs font-bold text-orange-900 dark:text-orange-200'>
                              <Gift className='h-4 w-4 text-orange-600' />
                              Kompensasi Keterlambatan Layanan (Garansi PST BPS
                              Sitaro)
                            </div>
                            <p className='mt-1.5 text-xs text-orange-800 dark:text-orange-300'>
                              {item.kompensasi_keterlambatan}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ALUR & SOP KOMPENSASI KETERLAMBATAN LAYANAN
      ========================================================================= */}
      {activeMainTab === 'kompensasi' && (
        <div className='space-y-6'>
          {/* Header Description */}
          <div className='rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6 dark:border-orange-900/40 dark:from-orange-950/20 dark:to-amber-950/20'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md'>
                <Gift className='h-6 w-6' />
              </div>
              <div className='space-y-1.5'>
                <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
                  SOP Garansi Kompensasi Keterlambatan Layanan PST BPS Sitaro
                </h3>
                <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                  Sesuai amanat UU No. 25/2009 Pasal 38 dan Peraturan Kepala
                  BPS, setiap keterlambatan pelayanan melebihi batas waktu SLA
                  yang ditetapkan wajib diberikan kompensasi nyata kepada
                  masyarakat pengguna layanan. Khusus kepulauan Sitaro, dokumen
                  diantar bebas biaya lintas pulau (Siau - Tagulandang - Biaro).
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Visual Timeline */}
          <div className='relative space-y-6 before:absolute before:inset-0 before:left-6 before:h-full before:w-0.5 before:bg-slate-200 sm:before:left-8 dark:before:bg-slate-800'>
            {ALUR_KOMPENSASI_DEFAULT.map((step) => (
              <div
                key={step.step}
                className='relative flex items-start gap-4 sm:gap-6'
              >
                {/* Step Circle */}
                <div className='z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-orange-500 to-amber-600 text-base font-extrabold text-white shadow-md sm:h-16 sm:w-16 sm:text-lg dark:border-slate-950'>
                  {step.step}
                </div>

                {/* Content Card */}
                <div className='flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-800'>
                  <div className='flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800'>
                    <h4 className='text-base font-bold text-slate-900 dark:text-white'>
                      {step.judul}
                    </h4>
                    <Badge
                      variant='outline'
                      className='border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
                    >
                      <Clock className='mr-1 h-3 w-3' />
                      {step.durasi}
                    </Badge>
                  </div>

                  <p className='mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                    {step.uraian_tindakan}
                  </p>

                  <div className='mt-4 grid gap-2.5 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-2 dark:bg-slate-800/50'>
                    <div>
                      <span className='font-semibold text-slate-500 dark:text-slate-400'>
                        Bentuk Kompensasi:
                      </span>
                      <p className='mt-0.5 font-bold text-orange-700 dark:text-orange-400'>
                        {step.kompensasi_diberikan}
                      </p>
                    </div>
                    <div>
                      <span className='font-semibold text-slate-500 dark:text-slate-400'>
                        Penanggung Jawab:
                      </span>
                      <p className='mt-0.5 text-slate-800 dark:text-slate-200'>
                        {step.penanggung_jawab}
                      </p>
                    </div>
                  </div>

                  <div className='mt-2 flex items-center gap-1.5 text-[11px] text-slate-500'>
                    <Ship className='h-3.5 w-3.5 text-blue-500' />
                    <span>
                      Kanal Penyampaian: <strong>{step.kanal}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Special Feature Box: Antar Pulau Siau - Tagulandang - Biaro */}
          <div className='rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900/40 dark:bg-blue-950/30'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg'>
                <Ship className='h-7 w-7' />
              </div>
              <div className='flex-1 space-y-1'>
                <h4 className='text-sm font-bold text-blue-950 dark:text-blue-200'>
                  Garansi Khusus Antar-Pulau (Siau, Tagulandang, Biaro)
                </h4>
                <p className='text-xs text-blue-800 dark:text-blue-300'>
                  Mengingat topografi geografis kepulauan di Kabupaten Sitaro,
                  jika keterlambatan terjadi pada pemohon di luar Pulau Siau
                  (Pulau Tagulandang, Ruang, Pasige, Makalehi, Biaro), dokumen
                  dan cenderamata dikirimkan menggunakan kapal penyeberangan
                  cepat tanpa membebankan biaya kurir laut kepada pemohon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG 1: EDIT MAKLUMAT PELAYANAN
      ========================================================================= */}
      <Dialog open={isEditMaklumatOpen} onOpenChange={setIsEditMaklumatOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Teks Maklumat Pelayanan Resmi</DialogTitle>
            <DialogDescription>
              Perubahan pada maklumat akan langsung tercatat pada dokumen
              sertifikat emas digital dan cetak A4.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2 text-xs'>
            <div>
              <Label className='text-xs font-semibold'>
                Teks Pernyataan Maklumat Pelayanan:
              </Label>
              <Textarea
                rows={5}
                value={editMaklumatForm.teks_maklumat}
                onChange={(e) =>
                  setEditMaklumatForm({
                    ...editMaklumatForm,
                    teks_maklumat: e.target.value
                  })
                }
                className='mt-1 text-xs leading-relaxed'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label className='text-xs font-semibold'>
                  Pejabat Penandatangan:
                </Label>
                <Input
                  value={editMaklumatForm.pejabat_penandatangan}
                  onChange={(e) =>
                    setEditMaklumatForm({
                      ...editMaklumatForm,
                      pejabat_penandatangan: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>
              <div>
                <Label className='text-xs font-semibold'>NIP Pejabat:</Label>
                <Input
                  value={editMaklumatForm.nip}
                  onChange={(e) =>
                    setEditMaklumatForm({
                      ...editMaklumatForm,
                      nip: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label className='text-xs font-semibold'>
                  Nomor SK Penetapan:
                </Label>
                <Input
                  value={editMaklumatForm.nomor_sk_penetapan}
                  onChange={(e) =>
                    setEditMaklumatForm({
                      ...editMaklumatForm,
                      nomor_sk_penetapan: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>
              <div>
                <Label className='text-xs font-semibold'>
                  Tanggal Penetapan:
                </Label>
                <Input
                  value={editMaklumatForm.tanggal_penetapan}
                  onChange={(e) =>
                    setEditMaklumatForm({
                      ...editMaklumatForm,
                      tanggal_penetapan: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div>
                <Label className='text-xs font-semibold'>
                  Status Pajang di Lobi PST
                </Label>
                <p className='text-[11px] text-slate-500'>
                  Status aktif memajang maklumat pada display publik
                </p>
              </div>
              <Switch
                checked={editMaklumatForm.status_pajang}
                onCheckedChange={(val) =>
                  setEditMaklumatForm({
                    ...editMaklumatForm,
                    status_pajang: val
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditMaklumatOpen(false)}
            >
              Batal
            </Button>
            <Button
              size='sm'
              onClick={handleSaveMaklumat}
              disabled={isPending}
              className='bg-amber-600 text-white hover:bg-amber-700'
            >
              {isPending ? 'Menyimpan...' : 'Simpan Maklumat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG 2: EDIT STANDAR PELAYANAN ITEM
      ========================================================================= */}
      <Dialog open={isEditSPOpen} onOpenChange={setIsEditSPOpen}>
        <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Standar Pelayanan</DialogTitle>
            <DialogDescription>
              Perbarui 14 komponen standar pelayanan untuk{' '}
              {editingItem?.nama_produk_layanan}.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className='space-y-4 py-2 text-xs'>
              <div className='grid grid-cols-3 gap-3'>
                <div className='col-span-2'>
                  <Label className='text-xs font-semibold'>
                    Nama Produk Layanan:
                  </Label>
                  <Input
                    value={editingItem.nama_produk_layanan}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        nama_produk_layanan: e.target.value
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>Kategori:</Label>
                  <Select
                    value={editingItem.kategori}
                    onValueChange={(val: KategoriLayanan) =>
                      setEditingItem({
                        ...editingItem,
                        kategori: val
                      })
                    }
                  >
                    <SelectTrigger className='mt-1 h-8 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='KONSULTASI'>KONSULTASI</SelectItem>
                      <SelectItem value='DATA_MIKRO'>DATA MIKRO</SelectItem>
                      <SelectItem value='PUBLIKASI'>PUBLIKASI</SelectItem>
                      <SelectItem value='REKOMENDASI'>REKOMENDASI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className='text-xs font-semibold'>
                  Produk Pelayanan yang Dihasilkan:
                </Label>
                <Input
                  value={editingItem.produk_pelayanan}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      produk_pelayanan: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div>
                  <Label className='text-xs font-semibold'>
                    Waktu Layanan (SLA):
                  </Label>
                  <Input
                    value={editingItem.waktu_layanan}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        waktu_layanan: e.target.value
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>
                    Biaya / Tarif:
                  </Label>
                  <Input
                    value={editingItem.biaya_tarif}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        biaya_tarif: e.target.value
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>
                    Jumlah Pelaksana:
                  </Label>
                  <Input
                    type='number'
                    value={editingItem.jumlah_pelaksana}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        jumlah_pelaksana: parseInt(e.target.value) || 1
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
              </div>

              <div>
                <Label className='text-xs font-semibold'>
                  Persyaratan Pelayanan (1 baris per persyaratan):
                </Label>
                <Textarea
                  rows={3}
                  value={editingItem.persyaratan.join('\n')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      persyaratan: e.target.value
                        .split('\n')
                        .filter((s) => s.trim() !== '')
                    })
                  }
                  className='mt-1 text-xs'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>
                  Prosedur / Alur Pelayanan (1 baris per tahap):
                </Label>
                <Textarea
                  rows={3}
                  value={editingItem.prosedur_alur.join('\n')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      prosedur_alur: e.target.value
                        .split('\n')
                        .filter((s) => s.trim() !== '')
                    })
                  }
                  className='mt-1 text-xs'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label className='text-xs font-semibold'>
                    Kompetensi Pelaksana:
                  </Label>
                  <Textarea
                    rows={2}
                    value={editingItem.kompetensi_pelaksana}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        kompetensi_pelaksana: e.target.value
                      })
                    }
                    className='mt-1 text-xs'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>
                    Pengawasan Internal:
                  </Label>
                  <Textarea
                    rows={2}
                    value={editingItem.pengawasan_internal}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        pengawasan_internal: e.target.value
                      })
                    }
                    className='mt-1 text-xs'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label className='text-xs font-semibold'>
                    Jaminan Pelayanan:
                  </Label>
                  <Input
                    value={editingItem.jaminan_pelayanan}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        jaminan_pelayanan: e.target.value
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>
                    Jaminan Keamanan:
                  </Label>
                  <Input
                    value={editingItem.jaminan_keamanan}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        jaminan_keamanan: e.target.value
                      })
                    }
                    className='mt-1 h-8 text-xs'
                  />
                </div>
              </div>

              <div>
                <Label className='text-xs font-semibold'>
                  Kompensasi Keterlambatan:
                </Label>
                <Textarea
                  rows={2}
                  value={editingItem.kompensasi_keterlambatan}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      kompensasi_keterlambatan: e.target.value
                    })
                  }
                  className='mt-1 text-xs'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Dasar Hukum:</Label>
                <Input
                  value={editingItem.dasar_hukum}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      dasar_hukum: e.target.value
                    })
                  }
                  className='mt-1 h-8 text-xs'
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditSPOpen(false)}
            >
              Batal
            </Button>
            <Button
              size='sm'
              onClick={handleSaveSPItem}
              disabled={isPending}
              className='bg-blue-600 text-white hover:bg-blue-700'
            >
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG 3: PRINT PREVIEW SERTIFIKAT MAKLUMAT PELAYANAN A4
      ========================================================================= */}
      <Dialog open={isPrintMaklumatOpen} onOpenChange={setIsPrintMaklumatOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto print:border-none print:p-0 print:shadow-none'>
          <div className='flex items-center justify-between border-b pb-3 print:hidden'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Pratinjau Cetak: Sertifikat Maklumat Pelayanan A4
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Dokumen resmi untuk dipajang pada bingkai lobi PST dan bahan LKE
                ZI Pilar 6
              </DialogDescription>
            </div>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-amber-600 text-white hover:bg-amber-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Sekarang
            </Button>
          </div>

          {/* Printable Gold Certificate Content */}
          <div className='bg-white p-8 font-serif text-slate-900 print:p-0'>
            <div className='rounded-2xl border-4 border-amber-600 p-8'>
              <div className='rounded-xl border border-dashed border-amber-600 p-6 text-center'>
                <h3 className='text-xs font-bold tracking-[0.2em] text-amber-800 uppercase'>
                  BADAN PUSAT STATISTIK
                </h3>
                <h2 className='text-lg font-bold tracking-wider text-slate-900'>
                  KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
                </h2>
                <div className='mx-auto mt-2 h-0.5 w-24 bg-amber-600'></div>

                <h1 className='mt-6 font-serif text-2xl font-black tracking-widest text-amber-700 uppercase'>
                  MAKLUMAT PELAYANAN
                </h1>
                <p className='mt-1 font-sans text-xs text-slate-600'>
                  Nomor: {maklumat.nomor_sk_penetapan}
                </p>

                <div className='my-8 rounded-xl border border-amber-300 bg-amber-50/50 p-6 text-center'>
                  <p className='text-base leading-relaxed font-semibold tracking-wide italic'>
                    &ldquo;{maklumat.teks_maklumat}&rdquo;
                  </p>
                </div>

                <div className='mb-6 font-sans text-xs font-bold text-emerald-800'>
                  100% BEBAS PUNGLI & GRATIFIKASI - TARIF RP 0,- | MELAYANI
                  DENGAN HATI
                </div>

                <div className='mt-10 flex items-end justify-between font-sans text-xs'>
                  <div className='text-left'>
                    <p>Ditetapkan di: Ondong Siau</p>
                    <p>Pada tanggal: {maklumat.tanggal_penetapan}</p>
                    <p className='mt-2 font-mono text-[10px] text-slate-500'>
                      UU No. 25/2009 Pasal 22
                    </p>
                  </div>

                  <div className='text-center'>
                    <p className='font-bold'>
                      KEPALA BADAN PUSAT STATISTIK
                      <br />
                      KABUPATEN KEPULAUAN SITARO
                    </p>
                    <div className='my-6 font-serif text-xl font-bold text-slate-800 italic'>
                      Stella Mandagi
                    </div>
                    <p className='font-serif font-bold underline'>
                      {maklumat.pejabat_penandatangan}
                    </p>
                    <p className='font-mono text-[11px] text-slate-600'>
                      NIP. {maklumat.nip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='border-t pt-3 print:hidden'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPrintMaklumatOpen(false)}
            >
              Tutup
            </Button>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-amber-600 text-white hover:bg-amber-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG 4: PRINT PREVIEW SP ITEM 14 KOMPONEN A4
      ========================================================================= */}
      <Dialog open={isPrintSPOpen} onOpenChange={setIsPrintSPOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto print:border-none print:p-0 print:shadow-none'>
          <div className='flex items-center justify-between border-b pb-3 print:hidden'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Pratinjau Cetak: Standar Pelayanan Resmi 14 Komponen
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Lampiran Keputusan Kepala BPS Sitaro tentang Standar Pelayanan
                Publik
              </DialogDescription>
            </div>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-blue-600 text-white hover:bg-blue-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen
            </Button>
          </div>

          {printTargetSP && (
            <div className='bg-white p-8 font-serif text-slate-900 print:p-0'>
              {/* Kop Surat BPS Sitaro */}
              <div className='border-b-2 border-double border-slate-900 pb-4 text-center'>
                <h3 className='text-sm font-semibold tracking-wider'>
                  BADAN PUSAT STATISTIK
                </h3>
                <h2 className='text-lg font-bold tracking-tight'>
                  KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
                </h2>
                <p className='font-sans text-[11px] text-slate-600'>
                  Jl. Trans Pulau Siau, Ondong, Kec. Siau Barat, Kab. Kepulauan
                  Sitaro, Sulawesi Utara 95861
                </p>
              </div>

              <div className='mt-4 text-center'>
                <h3 className='text-sm font-bold tracking-wide uppercase underline'>
                  STANDAR PELAYANAN: {printTargetSP.nama_produk_layanan}
                </h3>
                <p className='font-sans text-xs text-slate-700'>
                  Sesuai PermenPAN-RB No. 15 Tahun 2014 & UU No. 25 Tahun 2009
                </p>
              </div>

              {/* Table of 14 Components */}
              <table className='mt-6 w-full border-collapse border border-slate-900 font-sans text-xs'>
                <thead>
                  <tr className='bg-slate-100'>
                    <th className='w-12 border border-slate-900 p-2 text-center'>
                      NO
                    </th>
                    <th className='w-48 border border-slate-900 p-2 text-left'>
                      KOMPONEN
                    </th>
                    <th className='border border-slate-900 p-2 text-left'>
                      URAIAN STANDAR PELAYANAN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Service Delivery */}
                  <tr>
                    <td
                      colSpan={3}
                      className='bg-slate-200 p-1.5 font-bold uppercase'
                    >
                      A. Komponen Penyampaian Pelayanan (Service Delivery)
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      1
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Persyaratan Pelayanan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      <ul className='list-disc space-y-0.5 pl-4'>
                        {printTargetSP.persyaratan.map((sy, i) => (
                          <li key={i}>{sy}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      2
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Sistem, Mekanisme, dan Prosedur
                    </td>
                    <td className='border border-slate-900 p-2'>
                      <ol className='list-decimal space-y-0.5 pl-4'>
                        {printTargetSP.prosedur_alur.map((al, i) => (
                          <li key={i}>{al}</li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      3
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Jangka Waktu Pelayanan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.waktu_layanan}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      4
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Biaya / Tarif
                    </td>
                    <td className='border border-slate-900 p-2 font-bold'>
                      {printTargetSP.biaya_tarif}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      5
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Produk Pelayanan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.produk_pelayanan}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      6
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Penanganan Pengaduan, Saran & Masukan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.penanganan_pengaduan}
                    </td>
                  </tr>

                  {/* Manufacturing */}
                  <tr>
                    <td
                      colSpan={3}
                      className='bg-slate-200 p-1.5 font-bold uppercase'
                    >
                      B. Komponen Pengelolaan Pelayanan (Manufacturing)
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      7
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Dasar Hukum
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.dasar_hukum}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      8
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Sarana, Prasarana, dan Fasilitas
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.sarana_prasarana.join(', ')}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      9
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Kompetensi Pelaksana
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.kompetensi_pelaksana}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      10
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Pengawasan Internal
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.pengawasan_internal}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      11
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Jumlah Pelaksana
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.jumlah_pelaksana} Petugas PST
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      12
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Jaminan Pelayanan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.jaminan_pelayanan}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      13
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Jaminan Keamanan & Keselamatan
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.jaminan_keamanan}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center'>
                      14
                    </td>
                    <td className='border border-slate-900 p-2 font-semibold'>
                      Evaluasi Kinerja Pelaksana
                    </td>
                    <td className='border border-slate-900 p-2'>
                      {printTargetSP.evaluasi_kinerja}
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-slate-900 p-2 text-center font-bold'>
                      *
                    </td>
                    <td className='border border-slate-900 p-2 font-bold text-orange-800'>
                      Kompensasi Keterlambatan Layanan
                    </td>
                    <td className='border border-slate-900 p-2 text-orange-900'>
                      {printTargetSP.kompensasi_keterlambatan}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tanda Tangan Pengesahan */}
              <div className='mt-8 flex justify-end font-sans text-xs'>
                <div className='text-center'>
                  <p>Ondong Siau, {maklumat.tanggal_penetapan}</p>
                  <p className='font-bold'>
                    KEPALA BADAN PUSAT STATISTIK
                    <br />
                    KABUPATEN KEPULAUAN SITARO
                  </p>
                  <div className='my-6 font-serif text-xl font-bold text-slate-800 italic'>
                    Stella Mandagi
                  </div>
                  <p className='font-serif font-bold underline'>
                    {maklumat.pejabat_penandatangan}
                  </p>
                  <p className='font-mono text-[11px] text-slate-600'>
                    NIP. {maklumat.nip}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='border-t pt-3 print:hidden'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPrintSPOpen(false)}
            >
              Tutup
            </Button>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-blue-600 text-white hover:bg-blue-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
