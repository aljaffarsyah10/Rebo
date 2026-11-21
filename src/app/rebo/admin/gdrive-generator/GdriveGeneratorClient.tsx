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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  generateAndSaveIndicatorLinks,
  getIndicatorGdriveMapping,
  getGasScriptForPeriode,
  saveSingleIndicatorFolderUrl,
  type IndicatorMappingItem
} from '@/actions/gdrive-actions';
import { PILAR_LIST } from '@/lib/auth/rbac';
import { toast } from 'sonner';
import {
  Folder,
  FolderGit2,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Sparkles,
  ArrowLeft,
  Layers,
  ChevronRight,
  Edit3,
  Globe2,
  Download,
  History
} from 'lucide-react';
import type { PeriodeEvaluasi } from '@/types/rebo';

interface Props {
  initialPeriodes: PeriodeEvaluasi[];
  activePeriodeId: string;
  initialItems: IndicatorMappingItem[];
  initialTotal: number;
  initialMapped: number;
}

export default function GdriveGeneratorClient({
  initialPeriodes,
  activePeriodeId,
  initialItems,
  initialTotal,
  initialMapped
}: Props) {
  // States
  const [periodes] = useState<PeriodeEvaluasi[]>(initialPeriodes);
  const [selectedPeriodeId, setSelectedPeriodeId] =
    useState<string>(activePeriodeId);
  const [rootFolderUrl, setRootFolderUrl] = useState<string>('');
  const [pilarFilter, setPilarFilter] = useState<string>('ALL');
  const [overrideExisting, setOverrideExisting] = useState<boolean>(false);

  // Table items & stats
  const [items, setItems] = useState<IndicatorMappingItem[]>(initialItems);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [mappedCount, setMappedCount] = useState<number>(initialMapped);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'mapped' | 'unmapped'
  >('all');

  // Loading states
  const [isGenerating, startGenerating] = useTransition();
  const [isRefreshing, startRefreshing] = useTransition();

  // GAS Script State
  const [gasScript, setGasScript] = useState<string>('');
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
  const [copiedGas, setCopiedGas] = useState<boolean>(false);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<string | null>(null);

  // Manual Edit Dialog
  const [editingItem, setEditingItem] = useState<IndicatorMappingItem | null>(
    null
  );
  const [manualUrlInput, setManualUrlInput] = useState<string>('');
  const [isSavingManual, setIsSavingManual] = useState<boolean>(false);

  // Hitung persentase kelengkapan
  const completionPercent =
    totalCount > 0 ? Math.round((mappedCount / totalCount) * 100) : 0;

  // Refresh Mapping Data
  const refreshMapping = (
    periodeId = selectedPeriodeId,
    pilar = pilarFilter
  ) => {
    startRefreshing(async () => {
      try {
        const res = await getIndicatorGdriveMapping(periodeId, pilar);
        if (res.success) {
          setItems(res.items);
          setTotalCount(res.totalCount);
          setMappedCount(res.mappedCount);
        } else {
          toast.error(res.message || 'Gagal memuat pemetaan indikator.');
        }
      } catch (err: any) {
        toast.error(err.message || 'Terjadi kesalahan saat memuat data.');
      }
    });
  };

  // Handler: Generate & Simpan Link Folder
  const handleGenerate = () => {
    if (!rootFolderUrl.trim()) {
      toast.error('Masukkan URL Root Folder Google Drive terlebih dahulu.');
      return;
    }

    startGenerating(async () => {
      try {
        const result = await generateAndSaveIndicatorLinks(
          selectedPeriodeId,
          rootFolderUrl,
          {
            pilarId: pilarFilter,
            overrideExisting
          }
        );

        if (result.success) {
          toast.success(result.message);
          refreshMapping(selectedPeriodeId, pilarFilter);
        } else {
          toast.error(result.message || 'Gagal memetakan link folder.');
        }
      } catch (err: any) {
        toast.error(
          err.message || 'Terjadi kesalahan saat menjalankan generator.'
        );
      }
    });
  };

  // Handler: Generate GAS Script
  const handleLoadGasScript = async () => {
    setIsLoadingScript(true);
    try {
      const res = await getGasScriptForPeriode(
        selectedPeriodeId,
        rootFolderUrl,
        pilarFilter
      );
      if (res.success) {
        setGasScript(res.script);
        toast.success(
          `Skrip GAS berhasil disusun untuk ${res.totalIndicators} indikator.`
        );
      } else {
        toast.error(
          res.message || 'Gagal menghasilkan skrip Google Apps Script.'
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan menyusun skrip GAS.');
    } finally {
      setIsLoadingScript(false);
    }
  };

  // Salin skrip ke clipboard
  const handleCopyGas = async () => {
    if (!gasScript) return;
    try {
      await navigator.clipboard.writeText(gasScript);
      setCopiedGas(true);
      toast.success(
        'Kode skrip Google Apps Script berhasil disalin ke clipboard!'
      );
      setTimeout(() => setCopiedGas(false), 2500);
    } catch {
      toast.error('Gagal menyalin teks ke clipboard.');
    }
  };

  // Salin link indikator tunggal
  const handleCopyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkIndex(id);
      toast.success('Tautan Google Drive berhasil disalin!');
      setTimeout(() => setCopiedLinkIndex(null), 2000);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  // Simpan edit manual URL
  const handleSaveManualUrl = async () => {
    if (!editingItem) return;
    if (!manualUrlInput.trim()) {
      toast.error('URL Google Drive tidak boleh kosong.');
      return;
    }

    setIsSavingManual(true);
    try {
      // Jika pertanyaan_periode belum memiliki id, kita trigger generate atau simpan
      if (editingItem.id_pertanyaan_periode) {
        const res = await saveSingleIndicatorFolderUrl(
          editingItem.id_pertanyaan_periode,
          manualUrlInput.trim()
        );
        if (res.success) {
          toast.success(res.message);
          setEditingItem(null);
          refreshMapping(selectedPeriodeId, pilarFilter);
        } else {
          toast.error(res.message);
        }
      } else {
        toast.error(
          'Indikator belum memiliki rekaman periode. Silakan jalankan generate terlebih dahulu.'
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan URL kustom.');
    } finally {
      setIsSavingManual(false);
    }
  };

  // Unduh GAS Script sebagai file .js / .gs
  const handleDownloadGasFile = () => {
    if (!gasScript) return;
    const blob = new Blob([gasScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REBO_${selectedPeriodeId}_GDriveGenerator.gs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File skrip .gs berhasil diunduh.');
  };

  // Filter indikator
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.kode_indikator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_indikator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pilar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subpilar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'mapped') return item.is_mapped;
    if (statusFilter === 'unmapped') return !item.is_mapped;
    return true;
  });

  return (
    <div className='space-y-8 p-6'>
      {/* 1. Top Breadcrumb & Return to Admin */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
          <Link
            href='/rebo/admin'
            className='flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
          >
            <ArrowLeft className='h-4 w-4' />
            Admin Dashboard
          </Link>
          <ChevronRight className='h-4 w-4 text-slate-400' />
          <span className='font-semibold text-slate-800 dark:text-slate-200'>
            GDrive Folder Generator
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Link href='/rebo/admin/audit-log'>
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40'
            >
              <History className='h-3.5 w-3.5' />
              Audit Trail
            </Button>
          </Link>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshMapping()}
            disabled={isRefreshing}
            className='gap-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Memuat Ulang...' : 'Muat Ulang Data'}
          </Button>
        </div>
      </div>

      {/* 2. Hero Banner */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 p-8 text-white shadow-xl dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950'>
        <div className='absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
        <div className='absolute top-4 left-1/3 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl' />

        <div className='relative z-10 max-w-3xl space-y-3'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md'>
            <Sparkles className='h-3.5 w-3.5 text-amber-300' />
            Sistem Google Drive Berjenjang per Indikator LKE (REBO V2)
          </div>
          <h1 className='text-3xl font-black tracking-tight text-white sm:text-4xl'>
            Google Drive Indicator Folder Generator
          </h1>
          <p className='text-base leading-relaxed text-blue-100 dark:text-slate-300'>
            Tiap indikator pertanyaan LKE memiliki 1 tautan folder Google Drive
            khusus. Sistem ini secara otomatis menstandarisasi nama folder,
            menghasilkan tautan bukti dukung berjenjang per tahun evaluasi,
            serta menyediakan skrip Google Apps Script untuk inisiasi pohon
            direktori fisik dalam hitungan detik.
          </p>
        </div>
      </div>

      {/* 3. Metric Quick Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardContent className='flex items-center gap-4 p-5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'>
              <Layers className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Total Indikator Pertanyaan
              </p>
              <h3 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>
                {totalCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardContent className='flex items-center gap-4 p-5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'>
              <CheckCircle2 className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Tautan Folder Terpetakan
              </p>
              <h3 className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                {mappedCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardContent className='flex items-center gap-4 p-5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'>
              <AlertCircle className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Belum Terpetakan
              </p>
              <h3 className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
                {totalCount - mappedCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardContent className='flex items-center gap-4 p-5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'>
              <Globe2 className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Tingkat Keterhubungan
              </p>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {completionPercent}%
                </h3>
                <span className='text-xs text-slate-500'>selesai</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Generator Configuration Panel */}
      <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
        <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
          <div className='flex items-center gap-2 text-blue-600 dark:text-blue-400'>
            <FolderPlus className='h-5 w-5' />
            <CardTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
              Konfigurasi Generator Link Google Drive
            </CardTitle>
          </div>
          <CardDescription>
            Tentukan tautan folder Google Drive utama instansi untuk tahun
            evaluasi aktif. Sistem akan menyusun tautan berjenjang terstruktur
            secara otomatis.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6 pt-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* 1. Dropdown Periode */}
            <div className='space-y-2'>
              <label className='text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300'>
                Periode Evaluasi PMPRB
              </label>
              <select
                value={selectedPeriodeId}
                onChange={(e) => {
                  setSelectedPeriodeId(e.target.value);
                  refreshMapping(e.target.value, pilarFilter);
                }}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
              >
                {periodes.map((p) => (
                  <option key={p.id} value={p.id}>
                    Tahun {p.tahun} - {p.nama_periode}{' '}
                    {p.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                Pohon direktori akan menggunakan prefix tahun evaluasi ini.
              </p>
            </div>

            {/* 2. Filter Cakupan Pilar */}
            <div className='space-y-2'>
              <label className='text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300'>
                Cakupan Pilar
              </label>
              <select
                value={pilarFilter}
                onChange={(e) => {
                  setPilarFilter(e.target.value);
                  refreshMapping(selectedPeriodeId, e.target.value);
                }}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
              >
                <option value='ALL'>Semua Pilar (Pilar 1 s.d. 6)</option>
                {PILAR_LIST.map((pilar) => (
                  <option key={pilar.id} value={pilar.id}>
                    Pilar {pilar.id} - {pilar.nama}
                  </option>
                ))}
              </select>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                Pilih apakah ingin memetakan seluruh pilar atau satu per satu.
              </p>
            </div>

            {/* 3. Checkbox Override */}
            <div className='flex flex-col justify-center space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='overrideExisting'
                  checked={overrideExisting}
                  onCheckedChange={(checked) =>
                    setOverrideExisting(checked === true)
                  }
                />
                <label
                  htmlFor='overrideExisting'
                  className='cursor-pointer text-sm font-medium text-slate-800 select-none dark:text-slate-200'
                >
                  Timpa Tautan yang Sudah Ada
                </label>
              </div>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                Jika dicentang, seluruh link yang sudah tersimpan sebelumnya
                akan diperbarui dengan tautan baru.
              </p>
            </div>
          </div>

          {/* Root Folder Input */}
          <div className='space-y-2'>
            <label className='text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300'>
              Root Google Drive Folder URL / Shared Drive Link
            </label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <div className='relative flex-1'>
                <Folder className='absolute top-3 left-3 h-4 w-4 text-slate-400' />
                <Input
                  type='url'
                  placeholder='https://drive.google.com/drive/folders/1a2b3c4d5e6f... atau ID Folder'
                  value={rootFolderUrl}
                  onChange={(e) => setRootFolderUrl(e.target.value)}
                  className='pl-9 font-mono text-sm'
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !rootFolderUrl.trim()}
                className='gap-2 bg-blue-600 px-6 font-semibold hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className='h-4 w-4 animate-spin' />
                    Memetakan Link...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' />
                    Generate & Petakan Link Folder
                  </>
                )}
              </Button>
            </div>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              Contoh:{' '}
              <span className='font-mono text-slate-700 dark:text-slate-300'>
                https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIv
              </span>
              . Tautan ini akan menjadi folder induk utama (misal: REBO_2026).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 5. Main Tab Content: Preview Table vs GAS Script vs Tree View */}
      <Tabs defaultValue='preview' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-800'>
          <TabsList className='bg-slate-100 p-1 dark:bg-slate-800'>
            <TabsTrigger value='preview' className='gap-2 text-xs font-medium'>
              <Layers className='h-4 w-4' />
              Tabel Pemetaan Indikator ({filteredItems.length})
            </TabsTrigger>
            <TabsTrigger
              value='gas-script'
              onClick={() => {
                if (!gasScript) handleLoadGasScript();
              }}
              className='gap-2 text-xs font-medium'
            >
              <FileCode2 className='h-4 w-4' />
              Google Apps Script (GAS) Generator
            </TabsTrigger>
            <TabsTrigger value='tree' className='gap-2 text-xs font-medium'>
              <FolderGit2 className='h-4 w-4' />
              Visualisasi Hierarki Folder
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter & Search Bar */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative w-64'>
              <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400' />
              <Input
                type='text'
                placeholder='Cari kode / nama indikator...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-9 pl-8 text-xs'
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className='h-9 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            >
              <option value='all'>Semua Status ({items.length})</option>
              <option value='mapped'>Terhubung ({mappedCount})</option>
              <option value='unmapped'>
                Belum Terpetakan ({totalCount - mappedCount})
              </option>
            </select>
          </div>
        </div>

        {/* Tab 1: Preview Table */}
        <TabsContent value='preview' className='space-y-4'>
          <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                  <tr>
                    <th className='py-3.5 pr-3 pl-4'>No</th>
                    <th className='px-3 py-3.5'>Kode & Nama Indikator</th>
                    <th className='px-3 py-3.5'>Pilar & Subpilar</th>
                    <th className='px-3 py-3.5'>Path Direktori Berjenjang</th>
                    <th className='px-3 py-3.5'>Tautan Google Drive</th>
                    <th className='px-3 py-3.5 text-center'>Status</th>
                    <th className='py-3.5 pr-4 pl-3 text-right'>Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300'>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className='py-12 text-center text-sm text-slate-400'
                      >
                        Tidak ada indikator yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => (
                      <tr
                        key={item.id_pertanyaan}
                        className='transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      >
                        <td className='py-3 pr-3 pl-4 font-mono text-slate-400'>
                          {idx + 1}
                        </td>

                        <td className='max-w-xs px-3 py-3'>
                          <div className='font-semibold text-slate-900 dark:text-slate-100'>
                            {item.target_folder_name}
                          </div>
                          <div className='mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400'>
                            {item.nama_indikator}
                          </div>
                        </td>

                        <td className='max-w-[180px] px-3 py-3'>
                          <Badge
                            variant='outline'
                            className='mb-1 border-blue-200 font-mono text-[10px] text-blue-700 dark:border-blue-800 dark:text-blue-300'
                          >
                            Pilar {item.pilar_id}
                          </Badge>
                          <div className='line-clamp-1 text-[11px] font-medium text-slate-600 dark:text-slate-400'>
                            {item.subpilar}
                          </div>
                        </td>

                        <td className='max-w-xs px-3 py-3'>
                          <span
                            title={item.path}
                            className='block truncate rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          >
                            {item.path}
                          </span>
                        </td>

                        <td className='max-w-[200px] px-3 py-3'>
                          {item.gdrive_folder_url ? (
                            <div className='flex items-center gap-1.5'>
                              <a
                                href={item.gdrive_folder_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400'
                              >
                                <ExternalLink className='h-3 w-3 shrink-0' />
                                <span className='max-w-[140px] truncate'>
                                  Buka Folder
                                </span>
                              </a>
                              <button
                                onClick={() =>
                                  handleCopyLink(
                                    item.id_pertanyaan,
                                    item.gdrive_folder_url!
                                  )
                                }
                                title='Salin Tautan'
                                className='p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                              >
                                {copiedLinkIndex === item.id_pertanyaan ? (
                                  <Check className='h-3.5 w-3.5 text-emerald-600' />
                                ) : (
                                  <Copy className='h-3.5 w-3.5' />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className='text-slate-400 italic'>
                              Belum Dibuat
                            </span>
                          )}
                        </td>

                        <td className='px-3 py-3 text-center'>
                          {item.is_mapped ? (
                            <Badge className='border-emerald-300 bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'>
                              Terhubung
                            </Badge>
                          ) : (
                            <Badge
                              variant='secondary'
                              className='border-amber-300 bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            >
                              Belum Ada Link
                            </Badge>
                          )}
                        </td>

                        <td className='py-3 pr-4 pl-3 text-right'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300'
                            onClick={() => {
                              setEditingItem(item);
                              setManualUrlInput(item.gdrive_folder_url || '');
                            }}
                          >
                            <Edit3 className='mr-1 h-3.5 w-3.5' />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Google Apps Script Generator */}
        <TabsContent value='gas-script' className='space-y-4'>
          <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
            <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                    Kode Skrip Otomatisasi Google Apps Script (GAS)
                  </CardTitle>
                  <CardDescription>
                    Skrip ini dapat dijalankan sekali klik di Google Apps Script
                    untuk membuat seluruh pohon direktori fisik di Google Drive
                    instansi.
                  </CardDescription>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleLoadGasScript}
                    disabled={isLoadingScript}
                    className='gap-1.5'
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isLoadingScript ? 'animate-spin' : ''}`}
                    />
                    Generate Ulang Skrip
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDownloadGasFile}
                    disabled={!gasScript}
                    className='gap-1.5'
                  >
                    <Download className='h-3.5 w-3.5' />
                    Unduh .gs
                  </Button>

                  <Button
                    size='sm'
                    onClick={handleCopyGas}
                    disabled={!gasScript}
                    className='gap-1.5 bg-blue-600 font-medium text-white hover:bg-blue-700'
                  >
                    {copiedGas ? (
                      <>
                        <Check className='h-3.5 w-3.5 text-white' />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className='h-3.5 w-3.5' />
                        Salin Kode Skrip
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className='space-y-6 pt-6'>
              {/* Petunjuk Penggunaan */}
              <div className='rounded-xl border border-blue-200 bg-blue-50/70 p-5 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'>
                <h4 className='mb-2 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300'>
                  <Sparkles className='h-4 w-4' />
                  Panduan 4 Langkah Eksekusi di Google Apps Script:
                </h4>
                <ol className='list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-blue-800/90 dark:text-blue-300/90'>
                  <li>
                    Buka situs{' '}
                    <a
                      href='https://script.google.com'
                      target='_blank'
                      rel='noreferrer'
                      className='font-bold underline'
                    >
                      script.google.com
                    </a>{' '}
                    dengan akun Google instansi BPS Sitaro.
                  </li>
                  <li>
                    Klik <strong>New Project</strong>, lalu tempelkan (PASTE)
                    seluruh kode yang ada di bawah ke dalam file{' '}
                    <code>Code.gs</code>.
                  </li>
                  <li>
                    Pilih fungsi <code>mainCreateReboFolders</code> di toolbar
                    atas dan klik tombol <strong>Run (Jalankan)</strong>.
                  </li>
                  <li>
                    Beri izin otorisasi saat diminta. Skrip akan secara instan
                    membuat seluruh pohon folder dan menghasilkan Spreadsheet
                    arsip pemetaan.
                  </li>
                </ol>
              </div>

              {/* Code Box */}
              <div className='relative rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 shadow-inner'>
                <div className='absolute top-3 right-3 flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={handleCopyGas}
                    className='h-7 gap-1 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700'
                  >
                    {copiedGas ? (
                      <Check className='h-3 w-3 text-emerald-400' />
                    ) : (
                      <Copy className='h-3 w-3' />
                    )}
                    {copiedGas ? 'Disalin' : 'Copy Code'}
                  </Button>
                </div>

                <div className='max-h-[500px] overflow-y-auto pr-2'>
                  {isLoadingScript ? (
                    <div className='py-20 text-center text-slate-400'>
                      <RefreshCw className='mx-auto mb-2 h-6 w-6 animate-spin' />
                      Menyusun kode Google Apps Script...
                    </div>
                  ) : gasScript ? (
                    <pre className='leading-relaxed whitespace-pre-wrap'>
                      {gasScript}
                    </pre>
                  ) : (
                    <div className='py-16 text-center text-slate-400'>
                      Klik tombol &quot;Generate Ulang Skrip&quot; di atas untuk
                      menampilkan kode Google Apps Script.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Visual Tree Preview */}
        <TabsContent value='tree' className='space-y-4'>
          <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
            <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
              <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                Struktur Pohon Direktori Berjenjang REBO V2
              </CardTitle>
              <CardDescription>
                Standarisasi arsitektur penyimpanan bukti dukung tahun evaluasi{' '}
                {selectedPeriodeId}.
              </CardDescription>
            </CardHeader>

            <CardContent className='p-6'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-6 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'>
                <div className='flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400'>
                  <Folder className='h-4 w-4' />
                  REBO_2026 (Root Shared Drive Instansi)
                </div>

                <div className='mt-3 ml-6 space-y-3 border-l-2 border-slate-300 pl-4 dark:border-slate-700'>
                  {/* Area 1 */}
                  <div>
                    <div className='flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400'>
                      <Folder className='h-4 w-4' />
                      01_AREA_PEMENUHAN
                    </div>
                    <div className='mt-2 ml-6 space-y-2 border-l-2 border-emerald-300/40 pl-4 dark:border-emerald-700/40'>
                      <div>
                        <div className='flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300'>
                          <Folder className='h-3.5 w-3.5 text-amber-500' />
                          PILAR_I_MANAJEMEN_PERUBAHAN
                        </div>
                        <div className='mt-1 ml-6 space-y-1 border-l-2 border-slate-300 pl-4 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400'>
                          <div>📁 SUBPILAR_A_TIM_KERJA</div>
                          <div className='ml-6 text-slate-400'>
                            📄 IND_01 - Pembentukan Tim Kerja
                          </div>
                          <div className='ml-6 text-slate-400'>
                            📄 IND_02 - Penentuan Anggota Tim
                          </div>
                          <div>📁 SUBPILAR_B_RENCANA_PEMBANGUNAN_ZI</div>
                          <div className='ml-6 text-slate-400'>
                            📄 IND_03 - Dokumen Rencana Kerja
                          </div>
                        </div>
                      </div>

                      <div className='text-slate-500'>
                        📁 PILAR_II_PENATAAN_TATALAKSANA
                      </div>
                      <div className='text-slate-500'>
                        📁 PILAR_III_PENATAAN_SISTEM_MANAJEMEN_SDM
                      </div>
                      <div className='text-slate-500'>
                        📁 PILAR_IV_PENGUATAN_AKUNTABILITAS
                      </div>
                      <div className='text-slate-500'>
                        📁 PILAR_V_PENGUATAN_PENGAWASAN
                      </div>
                      <div className='text-slate-500'>
                        📁 PILAR_VI_PENINGKATAN_KUALITAS_PELAYANAN_PUBLIK
                      </div>
                    </div>
                  </div>

                  {/* Area 2 */}
                  <div className='pt-2'>
                    <div className='flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400'>
                      <Folder className='h-4 w-4' />
                      02_AREA_REFORM
                    </div>
                    <div className='mt-2 ml-6 space-y-1 border-l-2 border-indigo-300/40 pl-4 text-slate-500 dark:border-indigo-700/40'>
                      <div>📁 PILAR_I s.d. PILAR_VI (Area Reform)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 6. Dialog Edit Link Manual */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
              Edit Tautan Folder Indikator
            </DialogTitle>
            <DialogDescription>
              {editingItem?.target_folder_name} ({editingItem?.kode_indikator})
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
                Path Direktori Rekomendasi
              </label>
              <div className='rounded bg-slate-100 p-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                {editingItem?.path}
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
                URL Google Drive Folder
              </label>
              <Input
                type='url'
                placeholder='https://drive.google.com/drive/folders/...'
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
                className='font-mono text-xs'
              />
              <p className='text-[11px] text-slate-500'>
                Tempelkan tautan folder Google Drive spesifik yang sudah dibuat
                secara manual atau via Google Apps Script.
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditingItem(null)}
              disabled={isSavingManual}
            >
              Batal
            </Button>
            <Button
              size='sm'
              onClick={handleSaveManualUrl}
              disabled={isSavingManual || !manualUrlInput.trim()}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isSavingManual ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
