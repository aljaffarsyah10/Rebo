'use client';

import React, { useState, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import {
  Building2,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Globe,
  MapPin,
  UserCheck,
  Sparkles,
  ArrowRightLeft,
  Save,
  RotateCcw
} from 'lucide-react';

import {
  SatkerConfig,
  TargetPredikat,
  DEFAULT_SATKER_CONFIG,
  PRESET_SATKER_LIST
} from '@/lib/satker/satker-types';
import {
  updateSatkerConfigAction,
  switchOrReplicateSatkerAction,
  exportSatkerConfigBundleAction,
  importSatkerConfigBundleAction
} from '@/actions/satker-actions';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SatkerManagerClientProps {
  initialConfig: SatkerConfig;
  initialSource?: 'database' | 'memory' | 'preset';
}

export default function SatkerManagerClient({
  initialConfig,
  initialSource = 'preset'
}: SatkerManagerClientProps) {
  const [config, setConfig] = useState<SatkerConfig>(initialConfig);
  const [selectedPresetCode, setSelectedPresetCode] = useState<string>(
    initialConfig.kode_satker || '7108'
  );
  const [previewTab, setPreviewTab] = useState<'kop' | 'lke'>('kop');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cari data preset terpilih saat ini di dropdown
  const currentPreset =
    PRESET_SATKER_LIST.find((s) => s.kode_satker === selectedPresetCode) ||
    PRESET_SATKER_LIST[0];

  const handleFieldChange = (
    field: keyof SatkerConfig,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 1-Klik Terapkan Preset (Auto-fill & Replikasi)
  const handleApplyPreset = () => {
    if (!currentPreset) return;

    startTransition(async () => {
      try {
        const res = await switchOrReplicateSatkerAction(
          currentPreset.kode_satker
        );
        if (res.success && res.data) {
          setConfig(res.data);
          toast.success(
            `Berhasil beralih satker ke ${res.data.nama_satker} (${res.data.kode_satker})!`
          );
        } else {
          // Fallback lokal jika sesi read-only
          setConfig({ ...currentPreset, is_active: true });
          toast.info(
            `Preset ${currentPreset.nama_satker} diterapkan di formulir lokal.`
          );
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Gagal beralih satker.';
        toast.error(msg);
      }
    });
  };

  // Simpan perubahan profil aktif
  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateSatkerConfigAction(config);
        if (res.success && res.data) {
          setConfig(res.data);
          toast.success(
            res.message || `Profil ${res.data.nama_satker} berhasil disimpan!`
          );
        } else {
          toast.error(res.error || 'Gagal menyimpan konfigurasi satker.');
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Terjadi kegagalan sistem.';
        toast.error(msg);
      }
    });
  };

  // Ekspor bundle konfigurasi (.json)
  const handleExport = () => {
    startTransition(async () => {
      try {
        const res = await exportSatkerConfigBundleAction();
        if (res.success) {
          const blob = new Blob([res.jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = res.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Bundle ${res.filename} berhasil diunduh!`);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Gagal mengekspor konfigurasi.';
        toast.error(msg);
      }
    });
  };

  // Pemicu Impor file JSON
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      startTransition(async () => {
        try {
          const res = await importSatkerConfigBundleAction(content);
          if (res.success && res.data) {
            setConfig(res.data);
            setSelectedPresetCode(res.data.kode_satker);
            toast.success(
              res.message || `Konfigurasi Satker berhasil diimpor dari file!`
            );
          } else {
            toast.error(res.error || 'File bundle tidak valid.');
          }
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Gagal memproses file.';
          toast.error(msg);
        }
      });
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // Reset ke default BPS Sitaro
  const handleResetToSitaro = () => {
    setConfig({ ...DEFAULT_SATKER_CONFIG });
    setSelectedPresetCode('7108');
    toast.info('Formulir direset ke default BPS Sitaro (7108).');
  };

  return (
    <div className='space-y-6'>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        className='hidden'
        onChange={handleFileImport}
      />

      {/* Header & Badges */}
      <div className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-foreground text-2xl font-bold tracking-tight'>
              Manajemen Profil & Kesiapan Multi-Satker
            </h1>
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/20'
            >
              <Sparkles className='mr-1 h-3 w-3' /> Replikasi BPS RI
            </Badge>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Konfigurasi modular identitas instansi, pejabat penandatangan LKE,
            kontak resmi, dan target predikat Zona Integritas. Sistem siap
            direplikasi lintas BPS Kabupaten/Kota di Sulawesi Utara maupun
            nasional.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            disabled={isPending}
            className='flex items-center gap-1.5'
          >
            <Download className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            Ekspor Bundle (.json)
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={handleImportClick}
            disabled={isPending}
            className='flex items-center gap-1.5'
          >
            <Upload className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            Impor Bundle
          </Button>

          <Button
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isPending}
            className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 shadow-sm'
          >
            {isPending ? (
              <RefreshCw className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Active Satker Status Banner */}
      <div className='rounded-lg border bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 p-4 shadow-sm dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-blue-950/20'>
        <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-lg'>
              <Building2 className='h-6 w-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-foreground text-base font-semibold'>
                  {config.nama_satker}
                </span>
                <Badge
                  variant='default'
                  className='bg-primary text-primary-foreground text-xs'
                >
                  Kode: {config.kode_satker}
                </Badge>
                <Badge
                  variant='outline'
                  className={
                    config.target_predikat === 'WBBM'
                      ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }
                >
                  <Award className='mr-1 h-3 w-3' /> Target{' '}
                  {config.target_predikat}
                </Badge>
              </div>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                Provinsi {config.provinsi} • Kepala: {config.nama_kepala} • PST:{' '}
                {config.portal_pst_url}
              </p>
            </div>
          </div>

          <div className='text-muted-foreground flex items-center gap-2 self-end text-xs sm:self-center'>
            <span className='inline-flex items-center gap-1'>
              <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
              Status: <strong className='text-foreground'>Aktif</strong> (
              {initialSource})
            </span>
          </div>
        </div>
      </div>

      {/* Preset Selector Card */}
      <Card className='border-primary/20 shadow-sm'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='rounded-md bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                <ArrowRightLeft className='h-4 w-4' />
              </div>
              <div>
                <CardTitle className='text-base font-semibold'>
                  Pemilih Preset Satker Instan (Replikasi 1-Klik)
                </CardTitle>
                <CardDescription className='text-xs'>
                  Pilih satker BPS se-Sulawesi Utara atau template nasional
                  untuk mengisi formulir seketika.
                </CardDescription>
              </div>
            </div>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleResetToSitaro}
              className='text-muted-foreground hover:text-foreground text-xs'
            >
              <RotateCcw className='mr-1 h-3.5 w-3.5' />
              Reset Sitaro (7108)
            </Button>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid grid-cols-1 items-end gap-3 md:grid-cols-3'>
            <div className='space-y-1.5 md:col-span-2'>
              <Label htmlFor='preset-select' className='text-xs font-medium'>
                Pilih Preset Instansi BPS:
              </Label>
              <select
                id='preset-select'
                value={selectedPresetCode}
                onChange={(e) => setSelectedPresetCode(e.target.value)}
                className='border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              >
                <optgroup label='BPS Kabupaten / Kota se-Sulawesi Utara'>
                  {PRESET_SATKER_LIST.filter(
                    (s) => s.kode_provinsi === '71' && s.kode_satker !== '7100'
                  ).map((s) => (
                    <option key={s.kode_satker} value={s.kode_satker}>
                      [{s.kode_satker}] {s.nama_satker} ({s.singkatan_satker})
                    </option>
                  ))}
                </optgroup>
                <optgroup label='BPS Tingkat Provinsi'>
                  {PRESET_SATKER_LIST.filter(
                    (s) => s.kode_satker === '7100'
                  ).map((s) => (
                    <option key={s.kode_satker} value={s.kode_satker}>
                      [{s.kode_satker}] {s.nama_satker} (Target:{' '}
                      {s.target_predikat})
                    </option>
                  ))}
                </optgroup>
                <optgroup label='Template Nasional & Kustom'>
                  {PRESET_SATKER_LIST.filter(
                    (s) => s.kode_provinsi === '00'
                  ).map((s) => (
                    <option key={s.kode_satker} value={s.kode_satker}>
                      [{s.kode_satker}] {s.nama_satker}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <Button
                type='button'
                variant='outline'
                className='h-10 w-full border-blue-300 font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/40'
                onClick={handleApplyPreset}
                disabled={isPending}
              >
                {isPending ? (
                  <RefreshCw className='mr-1.5 h-4 w-4 animate-spin' />
                ) : (
                  <Sparkles className='mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400' />
                )}
                Terapkan Preset Ini
              </Button>
            </div>
          </div>

          {currentPreset && (
            <div className='bg-muted/60 text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md p-2.5 text-xs'>
              <span>
                <strong>Alamat:</strong> {currentPreset.alamat_kantor}
              </span>
              <span>
                <strong>Email:</strong> {currentPreset.email_resmi}
              </span>
              <span>
                <strong>Telp:</strong> {currentPreset.no_telepon}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Form Editor & Live Preview */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* Left Column: Form Editor (7 cols) */}
        <div className='space-y-4 lg:col-span-7'>
          <Tabs defaultValue='identitas' className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='identitas' className='text-xs'>
                <Building2 className='mr-1 hidden h-3.5 w-3.5 sm:inline' />{' '}
                Identitas
              </TabsTrigger>
              <TabsTrigger value='pejabat' className='text-xs'>
                <UserCheck className='mr-1 hidden h-3.5 w-3.5 sm:inline' />{' '}
                Pejabat
              </TabsTrigger>
              <TabsTrigger value='kontak' className='text-xs'>
                <Phone className='mr-1 hidden h-3.5 w-3.5 sm:inline' /> Kontak
              </TabsTrigger>
              <TabsTrigger value='target' className='text-xs'>
                <ShieldCheck className='mr-1 hidden h-3.5 w-3.5 sm:inline' />{' '}
                Target ZI
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Identitas Satker */}
            <TabsContent value='identitas' className='mt-4 space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                    <Building2 className='text-primary h-4 w-4' /> Identitas
                    Satuan Kerja
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Informasi resmi satuan kerja BPS RI yang digunakan pada
                    naskah dinas dan sistem LKE.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3.5'>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <div className='space-y-1'>
                      <Label htmlFor='kode_satker' className='text-xs'>
                        Kode Satker BPS <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='kode_satker'
                        value={config.kode_satker}
                        onChange={(e) =>
                          handleFieldChange('kode_satker', e.target.value)
                        }
                        placeholder='7108'
                        className='h-9 text-sm'
                      />
                    </div>
                    <div className='space-y-1 sm:col-span-2'>
                      <Label htmlFor='singkatan_satker' className='text-xs'>
                        Singkatan Resmi Satker{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='singkatan_satker'
                        value={config.singkatan_satker}
                        onChange={(e) =>
                          handleFieldChange('singkatan_satker', e.target.value)
                        }
                        placeholder='BPS Kab. Sitaro'
                        className='h-9 text-sm'
                      />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='nama_satker' className='text-xs'>
                      Nama Lengkap Satuan Kerja{' '}
                      <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='nama_satker'
                      value={config.nama_satker}
                      onChange={(e) =>
                        handleFieldChange('nama_satker', e.target.value)
                      }
                      placeholder='BPS Kabupaten Kepulauan Siau Tagulandang Biaro'
                      className='h-9 text-sm'
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <div className='space-y-1 sm:col-span-2'>
                      <Label htmlFor='provinsi' className='text-xs'>
                        Provinsi <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='provinsi'
                        value={config.provinsi}
                        onChange={(e) =>
                          handleFieldChange('provinsi', e.target.value)
                        }
                        placeholder='Sulawesi Utara'
                        className='h-9 text-sm'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='kode_provinsi' className='text-xs'>
                        Kode Provinsi <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='kode_provinsi'
                        value={config.kode_provinsi}
                        onChange={(e) =>
                          handleFieldChange('kode_provinsi', e.target.value)
                        }
                        placeholder='71'
                        className='h-9 text-sm'
                      />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='alamat_kantor' className='text-xs'>
                      Alamat Lengkap Kantor & Kode Pos{' '}
                      <span className='text-red-500'>*</span>
                    </Label>
                    <textarea
                      id='alamat_kantor'
                      rows={2}
                      value={config.alamat_kantor}
                      onChange={(e) =>
                        handleFieldChange('alamat_kantor', e.target.value)
                      }
                      placeholder='Jl. Perkantoran...'
                      className='border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='logo_url' className='text-xs'>
                      URL Logo BPS (Path Aset)
                    </Label>
                    <Input
                      id='logo_url'
                      value={config.logo_url}
                      onChange={(e) =>
                        handleFieldChange('logo_url', e.target.value)
                      }
                      placeholder='/logo-bps.png'
                      className='h-9 text-sm'
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Pejabat Penandatangan LKE */}
            <TabsContent value='pejabat' className='mt-4 space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                    <UserCheck className='text-primary h-4 w-4' /> Pejabat
                    Penandatangan LKE & ZI
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Pejabat yang tercantum pada Lembar Pengesahan LKE, Surat
                    Komitmen, dan Naskah Dinas.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Kepala Satker */}
                  <div className='bg-muted/30 space-y-3 rounded-lg border p-3.5'>
                    <span className='text-primary block text-xs font-semibold tracking-wide uppercase'>
                      1. Kepala Satuan Kerja (Penanggung Jawab Utama)
                    </span>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <div className='space-y-1'>
                        <Label htmlFor='nama_kepala' className='text-xs'>
                          Nama Lengkap & Gelar{' '}
                          <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='nama_kepala'
                          value={config.nama_kepala}
                          onChange={(e) =>
                            handleFieldChange('nama_kepala', e.target.value)
                          }
                          placeholder='Ir. Nama Kepala, M.Si'
                          className='h-9 text-sm'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label htmlFor='nip_kepala' className='text-xs'>
                          NIP (18 Digit) <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='nip_kepala'
                          value={config.nip_kepala}
                          onChange={(e) =>
                            handleFieldChange('nip_kepala', e.target.value)
                          }
                          placeholder='197501012000031001'
                          className='h-9 text-sm'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ketua Tim Kerja ZI */}
                  <div className='bg-muted/30 space-y-3 rounded-lg border p-3.5'>
                    <span className='text-primary block text-xs font-semibold tracking-wide uppercase'>
                      2. Ketua Tim Kerja Pembangunan ZI
                    </span>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <div className='space-y-1'>
                        <Label htmlFor='nama_ketua_zi' className='text-xs'>
                          Nama Lengkap & Gelar{' '}
                          <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='nama_ketua_zi'
                          value={config.nama_ketua_zi}
                          onChange={(e) =>
                            handleFieldChange('nama_ketua_zi', e.target.value)
                          }
                          placeholder='Nama Ketua ZI, S.ST'
                          className='h-9 text-sm'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label htmlFor='nip_ketua_zi' className='text-xs'>
                          NIP (18 Digit) <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='nip_ketua_zi'
                          value={config.nip_ketua_zi}
                          onChange={(e) =>
                            handleFieldChange('nip_ketua_zi', e.target.value)
                          }
                          placeholder='198805122010121002'
                          className='h-9 text-sm'
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Kontak & Layanan Publik */}
            <TabsContent value='kontak' className='mt-4 space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                    <Phone className='text-primary h-4 w-4' /> Kontak & Portal
                    Layanan Publik
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Saluran resmi komunikasi publik, layanan PST, dan integrasi
                    WhatsApp Helpdesk ZI.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3.5'>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label htmlFor='email_resmi' className='text-xs'>
                        Email Resmi Satker (@bps.go.id){' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='email_resmi'
                        type='email'
                        value={config.email_resmi}
                        onChange={(e) =>
                          handleFieldChange('email_resmi', e.target.value)
                        }
                        placeholder='bps7108@bps.go.id'
                        className='h-9 text-sm'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='no_telepon' className='text-xs'>
                        Nomor Telepon Kantor{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='no_telepon'
                        value={config.no_telepon}
                        onChange={(e) =>
                          handleFieldChange('no_telepon', e.target.value)
                        }
                        placeholder='(0432) 234567'
                        className='h-9 text-sm'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label htmlFor='no_wa_helpdesk' className='text-xs'>
                        No. WhatsApp Helpdesk / ZI{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='no_wa_helpdesk'
                        value={config.no_wa_helpdesk}
                        onChange={(e) =>
                          handleFieldChange('no_wa_helpdesk', e.target.value)
                        }
                        placeholder='082190010001'
                        className='h-9 text-sm'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='portal_pst_url' className='text-xs'>
                        URL Portal Resmi / PST{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='portal_pst_url'
                        value={config.portal_pst_url}
                        onChange={(e) =>
                          handleFieldChange('portal_pst_url', e.target.value)
                        }
                        placeholder='https://sitarokab.bps.go.id'
                        className='h-9 text-sm'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Target Predikat & Status */}
            <TabsContent value='target' className='mt-4 space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                    <ShieldCheck className='text-primary h-4 w-4' /> Target
                    Predikat Zona Integritas
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Pilih target predikat predikat ZI satker Anda untuk
                    menyesuaikan ambang batas penilaian LKE.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {/* WBK Option */}
                    <div
                      onClick={() =>
                        handleFieldChange('target_predikat', 'WBK')
                      }
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        config.target_predikat === 'WBK'
                          ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-semibold'>WBK</span>
                        <Award className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                      </div>
                      <p className='text-foreground mt-1 text-xs font-medium'>
                        Wilayah Bebas dari Korupsi
                      </p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Target umum untuk satker BPS Kab/Kota pemula dengan
                        nilai minimal komponen pengungkit & hasil 75.00.
                      </p>
                    </div>

                    {/* WBBM Option */}
                    <div
                      onClick={() =>
                        handleFieldChange('target_predikat', 'WBBM')
                      }
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        config.target_predikat === 'WBBM'
                          ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-semibold text-amber-700 dark:text-amber-400'>
                          WBBM
                        </span>
                        <Award className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                      </div>
                      <p className='text-foreground mt-1 text-xs font-medium'>
                        Wilayah Birokrasi Bersih dan Melayani
                      </p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Target lanjutan untuk satker yang telah berpredikat WBK,
                        dengan ambang batas minimal 85.00.
                      </p>
                    </div>
                  </div>

                  <div className='bg-muted/40 text-muted-foreground rounded-md p-3 text-xs'>
                    Status Profil:{' '}
                    <strong>
                      {config.is_active
                        ? 'Satker Aktif (Primary Instance)'
                        : 'Non-Aktif'}
                    </strong>
                    . Pengubahan profil ini akan secara langsung mempengaruhi
                    KOP pada dokumen LKE, lembar pengesahan, dan laporan PDF.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Document Preview (5 cols) */}
        <div className='space-y-4 lg:col-span-5'>
          <Card className='border-primary/20 shadow-sm'>
            <CardHeader className='border-b pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                    <FileText className='text-primary h-4 w-4' /> Pratinjau KOP
                    & Dokumen Live
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Naskah dinas ter-update otomatis secara real-time saat Anda
                    mengetik.
                  </CardDescription>
                </div>

                <div className='bg-muted flex items-center rounded-lg border p-0.5 text-xs'>
                  <button
                    type='button'
                    onClick={() => setPreviewTab('kop')}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                      previewTab === 'kop'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    KOP Surat
                  </button>
                  <button
                    type='button'
                    onClick={() => setPreviewTab('lke')}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                      previewTab === 'lke'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pengesahan ZI
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-4'>
              {/* Paper Background Preview */}
              <div className='relative flex min-h-[460px] flex-col justify-between rounded border bg-white p-5 font-serif text-[11px] leading-relaxed text-zinc-900 shadow-inner'>
                {previewTab === 'kop' ? (
                  <div>
                    {/* Header KOP Resmi */}
                    <div className='relative pb-3 text-center'>
                      <div className='mb-1 flex items-center justify-center gap-2'>
                        {/* BPS Emblem placeholder / Logo */}
                        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white'>
                          BPS
                        </div>
                      </div>
                      <div className='text-[12px] font-bold tracking-wide text-zinc-900 uppercase'>
                        BADAN PUSAT STATISTIK
                      </div>
                      <div className='text-[13px] font-bold tracking-wide text-zinc-900 uppercase'>
                        {config.nama_satker || 'NAMA SATKER BPS'}
                      </div>
                      <div className='mt-1 font-sans text-[9px] text-zinc-600'>
                        {config.alamat_kantor || 'Alamat Kantor Satker...'}
                      </div>
                      <div className='font-sans text-[9px] text-zinc-600'>
                        Telepon: {config.no_telepon || '-'} | Email:{' '}
                        {config.email_resmi || '-'}
                      </div>
                      <div className='font-sans text-[9px] font-medium text-blue-700'>
                        Portal Layanan: {config.portal_pst_url || '-'}
                      </div>

                      {/* Official Double Border Rule */}
                      <div className='mt-2.5 border-t-2 border-zinc-900' />
                      <div className='mt-0.5 border-t border-zinc-900' />
                    </div>

                    {/* Sample Letter Body */}
                    <div className='mt-4 space-y-2 font-sans text-[10px] text-zinc-800'>
                      <div className='flex justify-between text-[9px] text-zinc-500'>
                        <span>Nomor: B-101/7108/RB.01/2026</span>
                        <span>
                          {config.singkatan_satker.replace('BPS ', '')}, 25
                          November 2026
                        </span>
                      </div>
                      <div className='pt-2'>
                        <strong>Hal:</strong> Penyampaian Dokumen Lembar Kerja
                        Evaluasi (LKE) PMPRB Menuju Predikat{' '}
                        {config.target_predikat}
                      </div>
                      <p className='text-justify indent-4 leading-normal'>
                        Sehubungan dengan pelaksanaan pembangunan Zona
                        Integritas di lingkungan {config.nama_satker}, bersama
                        ini kami sampaikan dokumen penilaian mandiri reformasi
                        birokrasi yang telah divalidasi oleh Tim Kerja
                        Pembangunan ZI.
                      </p>
                      <p className='text-justify indent-4 leading-normal'>
                        Seluruh evidence bukti dukung pada 6 Pilar Pengungkit
                        dan Hasil telah diunggah ke dalam sistem REBO V2 dengan
                        kepatuhan penuh terhadap standar BPS RI dan KemenPAN-RB.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Header Lembar Pengesahan */}
                    <div className='border-b border-zinc-300 pb-2 text-center'>
                      <div className='text-[11px] font-bold tracking-wide text-zinc-800 uppercase'>
                        LEMBAR PENGESAHAN EVALUASI ZONA INTEGRITAS
                      </div>
                      <div className='mt-0.5 text-[12px] font-bold text-blue-900 uppercase'>
                        MENUJU PREDIKAT {config.target_predikat}
                      </div>
                      <div className='mt-0.5 font-sans text-[9.5px] text-zinc-600'>
                        Satuan Kerja: {config.nama_satker} (Kode:{' '}
                        {config.kode_satker})
                      </div>
                    </div>

                    {/* Statement */}
                    <div className='mt-3 text-justify font-sans text-[9.5px] leading-relaxed text-zinc-700'>
                      Dokumen Lembar Kerja Evaluasi (LKE) ini telah diperiksa,
                      diverifikasi, dan disetujui bersama oleh Tim Pembangunan
                      Zona Integritas dan Pimpinan Satuan Kerja sebagai komitmen
                      nyata penyelenggaraan birokrasi yang bersih, akuntabel,
                      dan berorientasi pada pelayanan prima.
                    </div>

                    {/* Target Predikat Badge in Preview */}
                    <div className='my-3 text-center'>
                      <span className='inline-block rounded border border-zinc-300 bg-zinc-100 px-3 py-1 font-sans text-[10px] font-semibold text-zinc-800'>
                        Target Komitmen: Wilayah{' '}
                        {config.target_predikat === 'WBBM'
                          ? 'Birokrasi Bersih dan Melayani (WBBM)'
                          : 'Bebas dari Korupsi (WBK)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tanda Tangan Penandatangan (Dua Kolom) */}
                <div className='mt-4 border-t border-zinc-200 pt-4 font-sans text-[9px] text-zinc-900'>
                  <div className='mb-1 text-center text-[8.5px] text-zinc-500'>
                    Disahkan pada tanggal 25 November 2026
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Kiri: Ketua Tim ZI */}
                    <div className='text-center'>
                      <div className='font-medium text-zinc-600'>
                        Ketua Tim Pembangunan ZI,
                      </div>
                      <div className='flex h-10 items-center justify-center text-[8px] text-zinc-400 italic'>
                        [Tanda Tangan Digital]
                      </div>
                      <div className='font-bold text-zinc-900 underline'>
                        {config.nama_ketua_zi || 'Ketua Tim ZI'}
                      </div>
                      <div className='text-[8px] text-zinc-600'>
                        NIP. {config.nip_ketua_zi || '-'}
                      </div>
                    </div>

                    {/* Kanan: Kepala Satker */}
                    <div className='text-center'>
                      <div className='font-medium text-zinc-600'>
                        Kepala {config.singkatan_satker || 'BPS'},
                      </div>
                      <div className='flex h-10 items-center justify-center text-[8px] text-zinc-400 italic'>
                        [Tanda Tangan & Cap Dinas]
                      </div>
                      <div className='font-bold text-zinc-900 underline'>
                        {config.nama_kepala || 'Kepala BPS'}
                      </div>
                      <div className='text-[8px] text-zinc-600'>
                        NIP. {config.nip_kepala || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className='text-muted-foreground flex items-center justify-between pt-0 text-xs'>
              <span>Preview naskah resmi instansi</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleExport}
                className='h-7 gap-1 text-xs'
              >
                <Download className='h-3.5 w-3.5' /> Unduh Konfigurasi
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
