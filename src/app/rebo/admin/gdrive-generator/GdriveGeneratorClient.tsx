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
  auditAllGdriveLinksAction,
  getDriveStorageStatsAction,
  updateAuditedLinkUrlAction,
  checkGDriveHealthAction,
  type IndicatorMappingItem,
  type AuditedLinkItem,
  type GDriveAuditSummary,
  type DriveStorageStats
} from '@/actions/gdrive-actions';
import type { GDriveHealthCheckResult } from '@/lib/gdrive/health-checker';
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
  History,
  Activity,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Lock,
  Play,
  RotateCw,
  XCircle,
  FileText
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

  // Health & Broken Links Monitor State
  const [auditSummary, setAuditSummary] = useState<GDriveAuditSummary | null>(
    null
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<number>(0);
  const [healthFilter, setHealthFilter] = useState<
    'all' | 'issues' | 'restricted' | 'broken' | 'public'
  >('all');
  const [healthSearch, setHealthSearch] = useState<string>('');
  const [retestingId, setRetestingId] = useState<string | null>(null);

  // Storage Stats State
  const [storageStats, setStorageStats] = useState<DriveStorageStats | null>(
    null
  );
  const [isLoadingStorage, setIsLoadingStorage] = useState<boolean>(false);

  // Fix / Edit Audited Link Modal
  const [editingAuditedItem, setEditingAuditedItem] =
    useState<AuditedLinkItem | null>(null);
  const [fixUrlInput, setFixUrlInput] = useState<string>('');
  const [isTestingFixUrl, setIsTestingFixUrl] = useState<boolean>(false);
  const [fixTestResult, setFixTestResult] =
    useState<GDriveHealthCheckResult | null>(null);
  const [isSavingFix, setIsSavingFix] = useState<boolean>(false);

  // Load Cloud Storage Stats
  const loadStorageStats = React.useCallback(
    async (pId = selectedPeriodeId) => {
      setIsLoadingStorage(true);
      try {
        const stats = await getDriveStorageStatsAction(pId);
        if (stats.success) {
          setStorageStats(stats);
        }
      } catch {
        // Ignore storage stats fetch error on initial load
      } finally {
        setIsLoadingStorage(false);
      }
    },
    [selectedPeriodeId]
  );

  React.useEffect(() => {
    loadStorageStats(selectedPeriodeId);
  }, [selectedPeriodeId, loadStorageStats]);

  // Handler: Run Batch Health Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditProgress(15);
    const progressTimer = setInterval(() => {
      setAuditProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 350);

    try {
      const res = await auditAllGdriveLinksAction(selectedPeriodeId);
      clearInterval(progressTimer);
      setAuditProgress(100);

      if (res.success) {
        setAuditSummary(res);
        toast.success(
          `Audit selesai! ${res.publicCount} link sehat, ${res.restrictedCount} terkunci, ${res.brokenCount} rusak.`
        );
      } else {
        toast.error(res.message || 'Gagal menjalankan audit link.');
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      toast.error(err.message || 'Terjadi kesalahan saat mengaudit link.');
    } finally {
      setTimeout(() => {
        setIsAuditing(false);
        setAuditProgress(0);
      }, 500);
    }
  };

  // Handler: Retest single link
  const handleRetestSingleLink = async (item: AuditedLinkItem) => {
    setRetestingId(item.id);
    try {
      const res = await checkGDriveHealthAction(item.url);
      if (res.success && res.result) {
        toast.info(
          `Hasil Uji: ${res.result.status} - ${res.result.message.slice(0, 60)}`
        );
        // Perbarui item di auditSummary
        setAuditSummary((prev) => {
          if (!prev) return null;
          const updatedItems = prev.items.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: res.result.status,
                  message: res.result.message,
                  statusCode: res.result.statusCode,
                  checkedAt: res.result.checkedAt
                }
              : it
          );

          const publicCount = updatedItems.filter(
            (i) => i.status === 'PUBLIC'
          ).length;
          const restrictedCount = updatedItems.filter(
            (i) => i.status === 'RESTRICTED'
          ).length;
          const brokenCount = updatedItems.filter(
            (i) => i.status === 'INVALID'
          ).length;
          const errorCount = updatedItems.filter(
            (i) => i.status === 'ERROR'
          ).length;
          const healthScore =
            updatedItems.length > 0
              ? Math.round((publicCount / updatedItems.length) * 100)
              : 100;

          return {
            ...prev,
            publicCount,
            restrictedCount,
            brokenCount,
            errorCount,
            healthScore,
            items: updatedItems,
            restrictedItems: updatedItems.filter(
              (i) => i.status === 'RESTRICTED'
            ),
            brokenItems: updatedItems.filter((i) => i.status === 'INVALID')
          };
        });
      } else {
        toast.error(res.error || 'Gagal menguji tautan.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menguji tautan.');
    } finally {
      setRetestingId(null);
    }
  };

  // Handler: Test fix URL in modal
  const handleTestFixUrl = async () => {
    if (!fixUrlInput.trim()) {
      toast.error('Masukkan URL Google Drive terlebih dahulu.');
      return;
    }

    setIsTestingFixUrl(true);
    setFixTestResult(null);
    try {
      const res = await checkGDriveHealthAction(fixUrlInput.trim());
      if (res.result) {
        setFixTestResult(res.result);
        if (res.result.status === 'PUBLIC') {
          toast.success('Akses Publik Terbuka! Tautan ini siap digunakan.');
        } else if (res.result.status === 'RESTRICTED') {
          toast.warning(
            'Peringatan: Tautan masih memerlukan login (Restricted).'
          );
        } else {
          toast.error(`Status: ${res.result.status} - ${res.result.message}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menguji URL.');
    } finally {
      setIsTestingFixUrl(false);
    }
  };

  // Handler: Save fix URL
  const handleSaveFixUrl = async () => {
    if (!editingAuditedItem) return;
    if (!fixUrlInput.trim()) {
      toast.error('URL baru tidak boleh kosong.');
      return;
    }

    setIsSavingFix(true);
    try {
      const res = await updateAuditedLinkUrlAction(
        editingAuditedItem.id,
        editingAuditedItem.itemType,
        fixUrlInput.trim()
      );

      if (res.success) {
        toast.success(res.message);
        const newResult = res.updatedResult;
        setAuditSummary((prev) => {
          if (!prev) return null;
          const updatedItems = prev.items.map((it) =>
            it.id === editingAuditedItem.id
              ? {
                  ...it,
                  url: fixUrlInput.trim(),
                  status: newResult?.status || 'PUBLIC',
                  message: newResult?.message || 'Tautan berhasil diperbarui.',
                  statusCode: newResult?.statusCode,
                  checkedAt: newResult?.checkedAt || new Date().toISOString()
                }
              : it
          );

          const publicCount = updatedItems.filter(
            (i) => i.status === 'PUBLIC'
          ).length;
          const restrictedCount = updatedItems.filter(
            (i) => i.status === 'RESTRICTED'
          ).length;
          const brokenCount = updatedItems.filter(
            (i) => i.status === 'INVALID'
          ).length;
          const errorCount = updatedItems.filter(
            (i) => i.status === 'ERROR'
          ).length;
          const healthScore =
            updatedItems.length > 0
              ? Math.round((publicCount / updatedItems.length) * 100)
              : 100;

          return {
            ...prev,
            publicCount,
            restrictedCount,
            brokenCount,
            errorCount,
            healthScore,
            items: updatedItems,
            restrictedItems: updatedItems.filter(
              (i) => i.status === 'RESTRICTED'
            ),
            brokenItems: updatedItems.filter((i) => i.status === 'INVALID')
          };
        });

        setEditingAuditedItem(null);
        refreshMapping(selectedPeriodeId, pilarFilter);
      } else {
        toast.error(res.message || 'Gagal menyimpan URL baru.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan URL.');
    } finally {
      setIsSavingFix(false);
    }
  };

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

  // Filtered audited items for Health Monitor Tab
  const filteredAuditedItems = (auditSummary?.items || []).filter((item) => {
    const query = healthSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.kodeIndikator.toLowerCase().includes(query) ||
      item.namaIndikator.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.pilar.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (healthFilter === 'issues') {
      return (
        item.status === 'RESTRICTED' ||
        item.status === 'INVALID' ||
        item.status === 'ERROR'
      );
    }
    if (healthFilter === 'restricted') return item.status === 'RESTRICTED';
    if (healthFilter === 'broken') return item.status === 'INVALID';
    if (healthFilter === 'public') return item.status === 'PUBLIC';
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

      {/* 5. Main Tab Content: Preview Table vs Health Monitor vs GAS Script vs Tree View */}
      <Tabs defaultValue='preview' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-800'>
          <TabsList className='bg-slate-100 p-1 dark:bg-slate-800'>
            <TabsTrigger value='preview' className='gap-2 text-xs font-medium'>
              <Layers className='h-4 w-4' />
              Tabel Pemetaan Indikator ({filteredItems.length})
            </TabsTrigger>
            <TabsTrigger
              value='health-monitor'
              className='gap-2 text-xs font-medium'
            >
              <Activity className='h-4 w-4 text-emerald-500' />
              Health & Broken Links Monitor
              {auditSummary && (
                <Badge
                  variant='outline'
                  className={`ml-1 text-[10px] ${
                    auditSummary.restrictedCount + auditSummary.brokenCount > 0
                      ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {auditSummary.healthScore}%
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='gas-script'
              onClick={() => {
                if (!gasScript) handleLoadGasScript();
              }}
              className='gap-2 text-xs font-medium'
            >
              <FileCode2 className='h-4 w-4' />
              Google Apps Script (GAS) Auto-Provisioning
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

        {/* Tab Baru: Health & Broken Links Monitor */}
        <TabsContent value='health-monitor' className='space-y-6'>
          {/* A. Cloud Storage Integration & Capacity Banner */}
          <Card className='border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md'>
            <CardContent className='p-6'>
              <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30'>
                    <HardDrive className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='font-bold text-slate-100 sm:text-base'>
                      Status Penyimpanan Cloud Bukti Dukung ZI
                    </h3>
                    <p className='text-xs text-slate-400'>
                      Google Workspace Enterprise •{' '}
                      {storageStats?.instansi || 'BPS Kab. Kepulauan Sitaro'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge
                    className={`${
                      storageStats?.storageHealthStatus === 'HEALTHY'
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30'
                    } text-xs font-semibold`}
                  >
                    <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
                    {storageStats?.storageHealthStatus === 'HEALTHY'
                      ? 'Kapasitas Sangat Sehat (Aman)'
                      : 'Perlu Perhatian'}
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => loadStorageStats(selectedPeriodeId)}
                    disabled={isLoadingStorage}
                    className='h-8 text-xs text-slate-300 hover:bg-white/10 hover:text-white'
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isLoadingStorage ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </div>
              </div>

              <div className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4'>
                <div className='rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10'>
                  <p className='text-xs text-slate-400'>Total Berkas Bukti</p>
                  <p className='mt-1 text-xl font-bold text-white'>
                    {storageStats?.totalFiles ?? 0} berkas
                  </p>
                  <p className='mt-0.5 text-[11px] text-blue-400'>
                    di {storageStats?.totalFolders ?? 0} direktori folder
                  </p>
                </div>

                <div className='rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10'>
                  <p className='text-xs text-slate-400'>Estimasi Pemakaian</p>
                  <p className='mt-1 text-xl font-bold text-amber-300'>
                    {storageStats?.formattedTotalSize ?? '0 MB'}
                  </p>
                  <p className='mt-0.5 text-[11px] text-slate-400'>
                    {storageStats?.usedPercentage ?? 0}% dari batas kuota
                  </p>
                </div>

                <div className='rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10'>
                  <p className='text-xs text-slate-400'>
                    Alokasi Kuota Instansi
                  </p>
                  <p className='mt-1 text-xl font-bold text-emerald-300'>
                    2.0 TB
                  </p>
                  <p className='mt-0.5 text-[11px] text-slate-400'>
                    Google Workspace Terkelola
                  </p>
                </div>

                <div className='rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10'>
                  <p className='text-xs text-slate-400'>Struktur Direktori</p>
                  <p className='mt-1 text-xl font-bold text-purple-300'>
                    {storageStats?.totalFolders ?? 0} Folder
                  </p>
                  <p className='mt-0.5 text-[11px] text-slate-400'>
                    Hierarki 6 Pilar PMPRB
                  </p>
                </div>
              </div>

              {/* Tipe Dokumen Breakdown */}
              {storageStats?.typeBreakdown &&
                storageStats.typeBreakdown.length > 0 && (
                  <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-300'>
                    <span className='font-semibold text-slate-400'>
                      Distribusi Tipe:
                    </span>
                    {storageStats.typeBreakdown.map((tb) => (
                      <span
                        key={tb.type}
                        className='inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-slate-200'
                      >
                        <span className='text-slate-400'>{tb.type}:</span>
                        <strong className='text-white'>{tb.count}</strong>
                        <span className='text-slate-400'>
                          ({tb.estimatedSize})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* B. KPI Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
              <CardContent className='flex items-center gap-3.5 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'>
                  <Layers className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    Total Link Diuji
                  </p>
                  <h3 className='text-xl font-bold text-slate-800 dark:text-slate-100'>
                    {auditSummary?.totalChecked ?? 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
              <CardContent className='flex items-center gap-3.5 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'>
                  <ShieldCheck className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    Link Sehat (Publik)
                  </p>
                  <h3 className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>
                    {auditSummary?.publicCount ?? 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
              <CardContent className='flex items-center gap-3.5 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'>
                  <Lock className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    Link Terkunci (Restricted)
                  </p>
                  <h3 className='text-xl font-bold text-amber-600 dark:text-amber-400'>
                    {auditSummary?.restrictedCount ?? 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
              <CardContent className='flex items-center gap-3.5 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'>
                  <AlertTriangle className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    Link Rusak (404/Invalid)
                  </p>
                  <h3 className='text-xl font-bold text-rose-600 dark:text-rose-400'>
                    {auditSummary?.brokenCount ?? 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
              <CardContent className='flex items-center gap-3.5 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'>
                  <Activity className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    Health Score
                  </p>
                  <div className='flex items-baseline gap-1.5'>
                    <h3 className='text-xl font-bold text-purple-600 dark:text-purple-400'>
                      {auditSummary ? `${auditSummary.healthScore}%` : '-'}
                    </h3>
                    {auditSummary && (
                      <span className='text-[10px] text-slate-500'>
                        {auditSummary.healthScore >= 90
                          ? 'Prima'
                          : 'Perlu Aksi'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* C. Batch Scan Control & Action Panel */}
          <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
            <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
                    <Activity className='h-5 w-5 text-emerald-500' />
                    Pemeriksaan Batch & Broken Links Detector
                  </CardTitle>
                  <CardDescription>
                    Pindai seluruh tautan Google Drive secara anonim untuk
                    mendeteksi link yang terkunci (harus login) atau rusak (404)
                    sebelum penilaian resmi.
                  </CardDescription>
                </div>

                <div className='flex items-center gap-3'>
                  <Button
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className='gap-2 bg-emerald-600 font-semibold text-white shadow hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                  >
                    {isAuditing ? (
                      <>
                        <RefreshCw className='h-4 w-4 animate-spin' />
                        Memindai ({auditProgress}%)...
                      </>
                    ) : (
                      <>
                        <Play className='h-4 w-4 fill-white' />
                        Audit Kesehatan Seluruh Link (Batch Scan)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress bar saat proses scan berjalan */}
              {isAuditing && (
                <div className='mt-4 space-y-1.5'>
                  <div className='flex justify-between text-xs text-slate-600 dark:text-slate-300'>
                    <span className='flex items-center gap-1.5'>
                      <RefreshCw className='h-3.5 w-3.5 animate-spin text-emerald-600' />
                      Memindai seluruh tautan folder indikator dan bukti dukung
                      secara paralel...
                    </span>
                    <span className='font-mono font-bold text-emerald-600 dark:text-emerald-400'>
                      {auditProgress}%
                    </span>
                  </div>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
                    <div
                      className='h-full bg-emerald-500 transition-all duration-300'
                      style={{ width: `${auditProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {auditSummary && (
                <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
                  Terakhir dipindai:{' '}
                  <span className='font-medium text-slate-700 dark:text-slate-300'>
                    {new Date(auditSummary.scannedAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>{' '}
                  • {auditSummary.totalChecked} tautan terverifikasi.
                </p>
              )}
            </CardHeader>

            <CardContent className='space-y-4 pt-4'>
              {/* Filter Tabs & Search Bar */}
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <Button
                    size='sm'
                    variant={healthFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setHealthFilter('all')}
                    className='h-8 text-xs'
                  >
                    Semua Link ({auditSummary?.items.length ?? 0})
                  </Button>
                  <Button
                    size='sm'
                    variant={healthFilter === 'issues' ? 'default' : 'outline'}
                    onClick={() => setHealthFilter('issues')}
                    className={`h-8 text-xs ${
                      healthFilter !== 'issues' &&
                      (auditSummary?.restrictedCount ?? 0) +
                        (auditSummary?.brokenCount ?? 0) >
                        0
                        ? 'border-amber-400 text-amber-700 dark:text-amber-300'
                        : ''
                    }`}
                  >
                    <AlertTriangle className='mr-1 h-3.5 w-3.5 text-amber-500' />
                    Bermasalah (
                    {(auditSummary?.restrictedCount ?? 0) +
                      (auditSummary?.brokenCount ?? 0)}
                    )
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      healthFilter === 'restricted' ? 'default' : 'outline'
                    }
                    onClick={() => setHealthFilter('restricted')}
                    className='h-8 text-xs'
                  >
                    <Lock className='mr-1 h-3.5 w-3.5 text-amber-500' />
                    Terkunci ({auditSummary?.restrictedCount ?? 0})
                  </Button>
                  <Button
                    size='sm'
                    variant={healthFilter === 'broken' ? 'default' : 'outline'}
                    onClick={() => setHealthFilter('broken')}
                    className='h-8 text-xs'
                  >
                    <XCircle className='mr-1 h-3.5 w-3.5 text-rose-500' />
                    Rusak / 404 ({auditSummary?.brokenCount ?? 0})
                  </Button>
                  <Button
                    size='sm'
                    variant={healthFilter === 'public' ? 'default' : 'outline'}
                    onClick={() => setHealthFilter('public')}
                    className='h-8 text-xs'
                  >
                    <ShieldCheck className='mr-1 h-3.5 w-3.5 text-emerald-500' />
                    Sehat ({auditSummary?.publicCount ?? 0})
                  </Button>
                </div>

                <div className='relative w-64'>
                  <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400' />
                  <Input
                    type='text'
                    placeholder='Cari kode, nama, URL...'
                    value={healthSearch}
                    onChange={(e) => setHealthSearch(e.target.value)}
                    className='h-8 pl-8 text-xs'
                  />
                </div>
              </div>

              {/* Table of Audited Items */}
              {!auditSummary ? (
                <div className='rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800'>
                  <Activity className='mx-auto h-12 w-12 text-slate-300 dark:text-slate-600' />
                  <h4 className='mt-3 text-base font-bold text-slate-800 dark:text-slate-200'>
                    Belum Dilakukan Pemindaian Kesehatan
                  </h4>
                  <p className='mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400'>
                    Klik tombol &quot;Audit Kesehatan Seluruh Link (Batch
                    Scan)&quot; di atas untuk memindai seluruh direktori folder
                    indikator dan dokumen bukti pada periode {selectedPeriodeId}
                    .
                  </p>
                  <Button
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className='mt-4 gap-2 bg-emerald-600 text-xs font-semibold hover:bg-emerald-700'
                  >
                    <Play className='h-3.5 w-3.5 fill-white' />
                    Mulai Batch Scan Sekarang
                  </Button>
                </div>
              ) : (
                <div className='overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800'>
                  <table className='w-full text-left text-xs'>
                    <thead className='border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                      <tr>
                        <th className='py-3 pr-2 pl-3'>No</th>
                        <th className='px-3 py-3'>Indikator & Pilar</th>
                        <th className='px-3 py-3'>Jenis Item</th>
                        <th className='px-3 py-3'>Nama Berkas / Folder</th>
                        <th className='px-3 py-3'>Tautan Google Drive</th>
                        <th className='px-3 py-3 text-center'>Status Akses</th>
                        <th className='px-3 py-3'>Diagnostik / Pesan</th>
                        <th className='py-3 pr-3 pl-2 text-right'>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300'>
                      {filteredAuditedItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className='py-10 text-center text-xs text-slate-400'
                          >
                            Tidak ada tautan yang sesuai dengan filter kesehatan
                            terpilih.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditedItems.map((item, idx) => (
                          <tr
                            key={`${item.id}-${idx}`}
                            className='transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                          >
                            <td className='py-3 pr-2 pl-3 font-mono text-slate-400'>
                              {idx + 1}
                            </td>

                            <td className='max-w-[200px] px-3 py-3'>
                              <div className='font-semibold text-slate-900 dark:text-slate-100'>
                                Indikator {item.kodeIndikator}
                              </div>
                              <div className='line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400'>
                                {item.namaIndikator}
                              </div>
                              <Badge
                                variant='outline'
                                className='mt-1 border-blue-200 font-mono text-[9px] text-blue-700 dark:border-blue-800 dark:text-blue-300'
                              >
                                {item.pilar}
                              </Badge>
                            </td>

                            <td className='px-3 py-3'>
                              {item.itemType === 'folder' ? (
                                <Badge className='border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                                  <Folder className='mr-1 h-3 w-3' />
                                  Direktori Folder
                                </Badge>
                              ) : (
                                <Badge className='border-purple-200 bg-purple-50 text-[10px] text-purple-700 dark:bg-purple-950 dark:text-purple-300'>
                                  <FileText className='mr-1 h-3 w-3' />
                                  Dokumen Bukti
                                </Badge>
                              )}
                            </td>

                            <td className='max-w-[220px] px-3 py-3'>
                              <div className='line-clamp-2 font-medium text-slate-800 dark:text-slate-200'>
                                {item.title}
                              </div>
                            </td>

                            <td className='max-w-[180px] px-3 py-3'>
                              <div className='flex items-center gap-1.5'>
                                <a
                                  href={item.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400'
                                >
                                  <ExternalLink className='h-3 w-3 shrink-0' />
                                  <span className='max-w-[120px] truncate'>
                                    Buka Link
                                  </span>
                                </a>
                                <button
                                  onClick={() =>
                                    handleCopyLink(item.id, item.url)
                                  }
                                  title='Salin Tautan'
                                  className='p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                >
                                  {copiedLinkIndex === item.id ? (
                                    <Check className='h-3.5 w-3.5 text-emerald-600' />
                                  ) : (
                                    <Copy className='h-3.5 w-3.5' />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className='px-3 py-3 text-center'>
                              {item.status === 'PUBLIC' && (
                                <Badge className='border-emerald-300 bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'>
                                  <ShieldCheck className='mr-1 h-3 w-3 text-emerald-600' />
                                  Publik (Lolos)
                                </Badge>
                              )}
                              {item.status === 'RESTRICTED' && (
                                <Badge className='border-amber-300 bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300'>
                                  <Lock className='mr-1 h-3 w-3 text-amber-600' />
                                  Terkunci (Restricted)
                                </Badge>
                              )}
                              {item.status === 'INVALID' && (
                                <Badge className='border-rose-300 bg-rose-100 text-[10px] text-rose-800 dark:bg-rose-950 dark:text-rose-300'>
                                  <AlertTriangle className='mr-1 h-3 w-3 text-rose-600' />
                                  Rusak / 404
                                </Badge>
                              )}
                              {item.status === 'ERROR' && (
                                <Badge
                                  variant='secondary'
                                  className='text-[10px]'
                                >
                                  <AlertCircle className='mr-1 h-3 w-3 text-slate-500' />
                                  Error Jaringan
                                </Badge>
                              )}
                            </td>

                            <td className='max-w-xs px-3 py-3'>
                              <p className='line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400'>
                                {item.message}
                              </p>
                            </td>

                            <td className='py-3 pr-3 pl-2 text-right'>
                              <div className='flex items-center justify-end gap-1.5'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={retestingId === item.id}
                                  onClick={() => handleRetestSingleLink(item)}
                                  className='h-7 px-2 text-xs text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300'
                                  title='Uji Ulang Tautan Ini'
                                >
                                  <RotateCw
                                    className={`h-3.5 w-3.5 ${
                                      retestingId === item.id
                                        ? 'animate-spin text-blue-600'
                                        : ''
                                    }`}
                                  />
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setEditingAuditedItem(item);
                                    setFixUrlInput(item.url);
                                    setFixTestResult(null);
                                  }}
                                  className='h-7 px-2.5 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-600 dark:text-slate-300'
                                >
                                  <Edit3 className='mr-1 h-3 w-3' />
                                  Perbaiki URL
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
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
                    Auto-Provisioning
                  </CardTitle>
                  <CardDescription>
                    Skrip ini dapat dijalankan sekali klik di Google Apps Script
                    untuk membuat seluruh pohon direktori fisik di Google Drive
                    instansi dengan hak akses publik otomatis.
                  </CardDescription>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      window.open(
                        'https://script.google.com/home/start',
                        '_blank'
                      )
                    }
                    className='gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                    Buka Editor Google Apps Script
                  </Button>

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
              {/* Alert Auto-Provisioning Hak Akses */}
              <div className='flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'>
                <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                <div className='space-y-1'>
                  <p className='font-bold text-emerald-800 dark:text-emerald-300'>
                    Auto-Provisioning Izin Publik Aktif
                    (DriveApp.Access.ANYONE_WITH_LINK)
                  </p>
                  <p className='leading-relaxed text-emerald-700 dark:text-emerald-300/80'>
                    Skrip GAS ini secara otomatis menyetel perizinan setiap
                    folder ke <code>DriveApp.Permission.VIEW</code> dengan akses
                    siapapun yang memiliki link. Hal ini menjamin berkas bukti
                    dukung bebas dari risiko penolakan asesor pusat (Tim Penilai
                    Internal BPS RI & TPN KemenPAN-RB).
                  </p>
                </div>
              </div>

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

      {/* 7. Dialog Perbaiki / Ganti URL Tautan Hasil Audit */}
      <Dialog
        open={!!editingAuditedItem}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAuditedItem(null);
            setFixTestResult(null);
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
              <Edit3 className='h-4 w-4 text-blue-600' />
              Perbaiki / Ganti Tautan Google Drive
            </DialogTitle>
            <DialogDescription>
              Perbarui URL untuk{' '}
              <span className='font-semibold text-slate-800 dark:text-slate-200'>
                {editingAuditedItem?.title}
              </span>{' '}
              (
              {editingAuditedItem?.itemType === 'folder'
                ? 'Direktori Folder'
                : 'Dokumen Bukti'}
              )
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
                Indikator Terkait
              </label>
              <div className='rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200'>
                <span className='font-bold'>
                  Indikator {editingAuditedItem?.kodeIndikator}:
                </span>{' '}
                {editingAuditedItem?.namaIndikator} ({editingAuditedItem?.pilar}
                )
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
                URL Google Drive Baru (Folder atau Dokumen)
              </label>
              <div className='flex gap-2'>
                <Input
                  type='url'
                  placeholder='https://drive.google.com/...'
                  value={fixUrlInput}
                  onChange={(e) => setFixUrlInput(e.target.value)}
                  className='font-mono text-xs'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleTestFixUrl}
                  disabled={isTestingFixUrl || !fixUrlInput.trim()}
                  className='shrink-0 gap-1 text-xs'
                >
                  <RotateCw
                    className={`h-3.5 w-3.5 ${isTestingFixUrl ? 'animate-spin' : ''}`}
                  />
                  Cek Izin
                </Button>
              </div>
              <p className='text-[11px] text-slate-500'>
                Pastikan setelan berbagi di Google Drive sudah diatur ke{' '}
                <strong>&quot;Siapa saja yang memiliki link&quot;</strong>.
              </p>
            </div>

            {/* Preview Hasil Uji Izin URL Baru */}
            {fixTestResult && (
              <div
                className={`rounded-xl border p-3 text-xs ${
                  fixTestResult.status === 'PUBLIC'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : fixTestResult.status === 'RESTRICTED'
                      ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className='flex items-center gap-2 font-bold'>
                  {fixTestResult.status === 'PUBLIC' && (
                    <ShieldCheck className='h-4 w-4 text-emerald-600' />
                  )}
                  {fixTestResult.status === 'RESTRICTED' && (
                    <Lock className='h-4 w-4 text-amber-600' />
                  )}
                  {fixTestResult.status === 'INVALID' && (
                    <AlertTriangle className='h-4 w-4 text-rose-600' />
                  )}
                  Status Akses: {fixTestResult.status}
                </div>
                <p className='mt-1 text-[11px] leading-relaxed'>
                  {fixTestResult.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditingAuditedItem(null);
                setFixTestResult(null);
              }}
              disabled={isSavingFix}
            >
              Batal
            </Button>
            <Button
              size='sm'
              onClick={handleSaveFixUrl}
              disabled={isSavingFix || !fixUrlInput.trim()}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isSavingFix ? 'Menyimpan...' : 'Simpan & Terapkan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
