'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Phone,
  Mail,
  Globe,
  Palette,
  Layout,
  ExternalLink,
  Info,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import {
  type PSTQRConfig,
  type PSTTemplateType,
  type PSTColorTheme,
  type PSTPresetTarget,
  PRESET_TARGETS,
  TEMPLATE_LAYOUTS,
  COLOR_THEMES,
  DEFAULT_PST_QR_CONFIG,
  validateUrl,
  generateQRCodeDataURL
} from '@/lib/pst/qrcode-generator';
import { savePSTQRConfigAction } from '@/actions/pst-actions';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PSTQRCodeGeneratorClientProps {
  initialConfig?: PSTQRConfig;
}

export default function PSTQRCodeGeneratorClient({
  initialConfig
}: PSTQRCodeGeneratorClientProps) {
  const [config, setConfig] = useState<PSTQRConfig>(
    initialConfig || DEFAULT_PST_QR_CONFIG
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'standee' | 'flat'>('standee');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const printCardRef = useRef<HTMLDivElement>(null);

  // Validasi URL secara realtime
  const urlValidation = validateUrl(config.targetUrl);

  // Regenerasi QR code ketika URL atau tema warna berubah
  useEffect(() => {
    let isCancelled = false;
    async function updateQR() {
      setIsGenerating(true);
      try {
        const activeTheme = COLOR_THEMES[config.colorTheme];
        // QR Code menggunakan warna primer tema yang kontras tinggi
        const dataUrl = await generateQRCodeDataURL(config.targetUrl, {
          colorDark: activeTheme.primaryColor,
          colorLight: '#FFFFFF',
          width: 800,
          margin: 2
        });
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Gagal generate QR Code:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    }

    const timer = setTimeout(() => {
      updateQR();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [config.targetUrl, config.colorTheme]);

  // Handler pergantian preset target
  const handleSelectPreset = (presetKey: PSTPresetTarget) => {
    const preset = PRESET_TARGETS[presetKey];
    setConfig((prev) => ({
      ...prev,
      presetTarget: presetKey,
      title: preset.title,
      subtitle: preset.subtitle,
      targetUrl: preset.targetUrl
    }));
    toast.info(`Memuat preset: ${preset.label}`);
  };

  // Handler salin tautan
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(config.targetUrl);
      setCopied(true);
      toast.success('Tautan berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  // Handler reset ke default
  const handleResetDefault = () => {
    setConfig({ ...DEFAULT_PST_QR_CONFIG });
    toast.success('Pengaturan dikembalikan ke standar resmi BPS Sitaro.');
  };

  // Handler Simpan Konfigurasi
  const handleSaveConfig = () => {
    startTransition(async () => {
      try {
        const res = await savePSTQRConfigAction(config);
        if (res.success) {
          toast.success(
            'Konfigurasi QR Meja PST berhasil disimpan ke database!'
          );
        } else {
          toast.error(res.error || 'Gagal menyimpan konfigurasi.');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan sistem.');
      }
    });
  };

  // Handler Cetak Akrilik Meja
  const handlePrint = () => {
    window.print();
  };

  // Handler Unduh PNG High-Resolution untuk Percetakan
  const handleDownloadPNG = async () => {
    const cardEl = printCardRef.current;
    if (!cardEl) return;

    try {
      toast.info('Menyiapkan berkas gambar resolusi tinggi...');

      // Buat canvas resolusi tinggi
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const template = TEMPLATE_LAYOUTS[config.templateType];
      const scale = 3; // Skala 300 DPI untuk cetak offset
      const width = template.previewWidthPx * scale;
      const height = template.previewHeightPx * scale;

      canvas.width = width;
      canvas.height = height;

      // Buat image dari QR Data URL dan render kartu
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = qrDataUrl;

      img.onload = () => {
        const theme = COLOR_THEMES[config.colorTheme];

        // Background kartu
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Header Background Banner
        const gradient = ctx.createLinearGradient(0, 0, width, height * 0.22);
        gradient.addColorStop(0, theme.primaryColor);
        gradient.addColorStop(1, theme.secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height * 0.22);

        // Text Header Kop BPS
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = `bold ${14 * scale}px sans-serif`;
        ctx.fillText(config.kantorName, width / 2, 28 * scale);
        ctx.font = `bold ${12 * scale}px sans-serif`;
        ctx.fillText(config.kantorSub, width / 2, 44 * scale);

        // Gold Accent Line
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(width * 0.2, 52 * scale, width * 0.6, 2 * scale);

        // Judul & Subjudul
        ctx.font = `bold ${14 * scale}px sans-serif`;
        ctx.fillText(config.title, width / 2, 75 * scale);

        // Background area QR
        const qrSize = Math.min(width * 0.6, height * 0.42);
        const qrX = (width - qrSize) / 2;
        const qrY = height * 0.28;

        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(
          qrX - 10 * scale,
          qrY - 10 * scale,
          qrSize + 20 * scale,
          qrSize + 20 * scale
        );

        // Draw QR Image
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Slogan Box
        const sloganY = qrY + qrSize + 30 * scale;
        ctx.fillStyle = theme.lightBg;
        ctx.fillRect(width * 0.08, sloganY, width * 0.84, 30 * scale);
        ctx.strokeStyle = theme.secondaryColor;
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(width * 0.08, sloganY, width * 0.84, 30 * scale);

        ctx.fillStyle = theme.primaryColor;
        ctx.font = `bold ${11 * scale}px sans-serif`;
        ctx.fillText(`“${config.slogan}”`, width / 2, sloganY + 19 * scale);

        // Footer Kontak
        if (config.showContactFooter) {
          const footerY = height - 25 * scale;
          ctx.fillStyle = '#64748B';
          ctx.font = `${9 * scale}px sans-serif`;
          ctx.fillText(
            `WA: ${config.kontakWa}  •  Web: ${config.kontakWeb}`,
            width / 2,
            footerY
          );
        }

        // Trigger Download
        const link = document.createElement('a');
        link.download = `PST-QRCode-${config.templateType}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Berkas PNG HD berhasil diunduh!');
      };
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh gambar.');
    }
  };

  const activeTheme = COLOR_THEMES[config.colorTheme];
  const activeTemplate = TEMPLATE_LAYOUTS[config.templateType];

  return (
    <div className='space-y-6 pb-12'>
      {/* =========================================================================
          PRINT STYLESHEET (KHUSUS PERCETAKAN / PRINTER FISIK)
      ========================================================================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${activeTemplate.printCssPageSize};
            margin: 0mm;
          }
          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #pst-print-container,
          #pst-print-container * {
            visibility: visible !important;
          }
          #pst-print-container {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: ${activeTemplate.dimensionsMm.split(' ')[0]} !important;
            height: ${activeTemplate.dimensionsMm.split(' ')[2]} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* =========================================================================
          BANNER UTAMA & INTRODUKSI
      ========================================================================= */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-900 via-sky-900 to-indigo-950 p-6 text-white shadow-xl dark:border-blue-800/60 print:hidden'>
        <div className='absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl' />
        <div className='absolute right-1/4 -bottom-10 h-48 w-48 rounded-full bg-amber-400/15 blur-2xl' />

        <div className='relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center'>
          <div className='max-w-2xl space-y-2'>
            <div className='inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-200 backdrop-blur-md'>
              <ShieldCheck className='h-3.5 w-3.5 text-amber-300' />
              <span>
                Seksi 13 Todo.md — Manajemen Pelayanan Publik & Suara Konsumen
              </span>
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
              Generator QR Code Meja Layanan PST
            </h1>
            <p className='text-sm leading-relaxed text-blue-100/90'>
              Pembuat QR code siap cetak berdesain resmi BPS untuk diletakkan di
              ruang resepsionis dan meja Pelayanan Statistik Terpadu (PST).
              Memudahkan tamu dan pengunjung memindai kode via kamera ponsel
              untuk pengisian survei kepuasan (IKM/IPAK), kanal pengaduan WBS,
              maupun portal digital Si-Datu.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Link href='/rebo/sentiment'>
              <Button
                variant='outline'
                size='sm'
                className='border-blue-300/40 bg-white/10 text-xs font-medium text-white hover:bg-white/20'
              >
                <Sparkles className='mr-1.5 h-3.5 w-3.5 text-emerald-300' />
                Sentimen & Word Cloud
              </Button>
            </Link>
            <Link href='/rebo/inovasi'>
              <Button
                variant='outline'
                size='sm'
                className='border-blue-300/40 bg-white/10 text-xs font-medium text-white hover:bg-white/20'
              >
                <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-300' />
                Showcase Inovasi
              </Button>
            </Link>
            <Button
              onClick={handlePrint}
              size='sm'
              className='bg-amber-500 text-xs font-semibold text-slate-950 shadow-md hover:bg-amber-400'
            >
              <Printer className='mr-1.5 h-3.5 w-3.5' />
              Cetak Desain Akrilik
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KONTROL UTAMA: FORM KONFIGURASI VS LIVE INTERACTIVE PREVIEW
      ========================================================================= */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 print:hidden'>
        {/* PANEL KIRI: FORMULIR KONFIGURASI (7 KOLOM) */}
        <div className='space-y-6 lg:col-span-7'>
          {/* 1. KARTU PRESET CEPAT TARGET LINK */}
          <Card className='border-border/80 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='rounded-lg bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    <QrCode className='h-4 w-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-semibold'>
                      1. Pilih Preset Sasaran Tautan
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      Tentukan tujuan pemindaian QR code meja layanan
                    </CardDescription>
                  </div>
                </div>
                <Badge variant='outline' className='text-[10px] font-medium'>
                  Otomatis Terisi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                {(Object.keys(PRESET_TARGETS) as PSTPresetTarget[]).map(
                  (key) => {
                    const preset = PRESET_TARGETS[key];
                    const isSelected = config.presetTarget === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectPreset(key)}
                        className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-500/40 dark:border-blue-500 dark:bg-blue-950/40'
                            : 'border-border/70 hover:bg-muted/40 hover:border-blue-300 dark:hover:border-blue-800'
                        }`}
                      >
                        <div className='space-y-1'>
                          <div className='flex items-center justify-between gap-1'>
                            <span className='text-foreground text-xs font-semibold'>
                              {preset.label}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className='h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                            ) : (
                              <span className='border-muted-foreground/30 h-4 w-4 rounded-full border' />
                            )}
                          </div>
                          <p className='text-muted-foreground line-clamp-2 text-[11px] leading-tight'>
                            {preset.description}
                          </p>
                        </div>
                        <div className='border-border/40 text-muted-foreground mt-2 flex items-center justify-between border-t pt-2 text-[10px]'>
                          <span className='truncate font-mono'>
                            {preset.targetUrl}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Input URL Target dengan Validasi */}
              <div className='space-y-1.5 pt-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='target-url' className='text-xs font-semibold'>
                    Tautan Tujuan (Target URL)
                  </Label>
                  <div className='flex items-center gap-1 text-[11px]'>
                    {urlValidation.isValid ? (
                      <span className='inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400'>
                        <Check className='h-3 w-3' /> URL Valid & Siap Scan
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400'>
                        <AlertCircle className='h-3 w-3' />{' '}
                        {urlValidation.error}
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Input
                    id='target-url'
                    value={config.targetUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        presetTarget: 'custom',
                        targetUrl: e.target.value
                      }))
                    }
                    placeholder='https://s.bps.go.id/survei-pst-sitaro'
                    className={`font-mono text-xs ${
                      !urlValidation.isValid
                        ? 'border-amber-400 focus-visible:ring-amber-400'
                        : ''
                    }`}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleCopyLink}
                    className='shrink-0 text-xs'
                    title='Salin Tautan'
                  >
                    {copied ? (
                      <Check className='h-3.5 w-3.5 text-emerald-600' />
                    ) : (
                      <Copy className='h-3.5 w-3.5' />
                    )}
                    <span className='ml-1 hidden sm:inline'>Salin</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. KARTU TEMPLATE LAYOUT & UKURAN CETAK */}
          <Card className='border-border/80 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2'>
                <div className='rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>
                  <Layout className='h-4 w-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    2. Format Tata Letak Cetak
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Sesuaikan dengan media fisik penempatan di kantor BPS Sitaro
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-3'>
                {(Object.keys(TEMPLATE_LAYOUTS) as PSTTemplateType[]).map(
                  (tmplKey) => {
                    const tmpl = TEMPLATE_LAYOUTS[tmplKey];
                    const isSelected = config.templateType === tmplKey;
                    return (
                      <div
                        key={tmplKey}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            templateType: tmplKey
                          }))
                        }
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-500/40 dark:border-emerald-500 dark:bg-emerald-950/40'
                            : 'border-border/70 hover:bg-muted/40 hover:border-emerald-300'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-foreground text-xs font-semibold'>
                            {tmpl.name}
                          </span>
                          {isSelected && (
                            <Check className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                          )}
                        </div>
                        <Badge
                          variant='secondary'
                          className='mt-1 font-mono text-[10px]'
                        >
                          {tmpl.dimensionsMm}
                        </Badge>
                        <p className='text-muted-foreground mt-1.5 text-[10px] leading-tight'>
                          {tmpl.description}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>

              <div className='bg-muted/60 text-muted-foreground flex items-start gap-2 rounded-lg p-2.5 text-[11px]'>
                <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>
                  <strong>Rekomendasi Bahan:</strong>{' '}
                  {activeTemplate.recommendation}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 3. KARTU TEMA WARNA & TIPOGRAFI BPS */}
          <Card className='border-border/80 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2'>
                <div className='rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300'>
                  <Palette className='h-4 w-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    3. Tema Warna & Identitas Grafis
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Palet resmi BPS Republik Indonesia & Wilayah Bebas dari
                    Korupsi (WBK)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-3'>
                {(Object.keys(COLOR_THEMES) as PSTColorTheme[]).map(
                  (themeKey) => {
                    const thm = COLOR_THEMES[themeKey];
                    const isSelected = config.colorTheme === themeKey;
                    return (
                      <div
                        key={themeKey}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            colorTheme: themeKey
                          }))
                        }
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-blue-600 shadow-sm ring-1 ring-blue-500/40 dark:border-blue-400'
                            : 'border-border/70 hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className='mb-2 flex items-center gap-2'>
                          <div
                            className='h-5 w-5 rounded-full border border-black/10 shadow-inner'
                            style={{ backgroundColor: thm.primaryColor }}
                          />
                          <div
                            className='-ml-1 h-4 w-4 rounded-full border border-black/10 shadow-inner'
                            style={{ backgroundColor: thm.secondaryColor }}
                          />
                          <div
                            className='-ml-1 h-3 w-3 rounded-full border border-black/10 shadow-inner'
                            style={{ backgroundColor: thm.accentColor }}
                          />
                        </div>
                        <div className='text-foreground text-xs font-semibold'>
                          {thm.name}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Teks Banner & Subjudul */}
              <div className='grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='banner-title'
                    className='text-xs font-semibold'
                  >
                    Judul Banner Standee
                  </Label>
                  <Input
                    id='banner-title'
                    value={config.title}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className='text-xs font-medium'
                    placeholder='Survei Kepuasan Masyarakat & Anti Korupsi'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='slogan-banner'
                    className='text-xs font-semibold'
                  >
                    Slogan Pelayanan / Integritas
                  </Label>
                  <Input
                    id='slogan-banner'
                    value={config.slogan}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, slogan: e.target.value }))
                    }
                    className='text-xs'
                    placeholder='Layanan Cepat, Tepat, dan Bebas Pungli Rp 0'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='banner-subtitle'
                  className='text-xs font-semibold'
                >
                  Teks Instruksi / Panduan Pemindaian
                </Label>
                <Textarea
                  id='banner-subtitle'
                  rows={2}
                  value={config.subtitle}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className='text-xs leading-relaxed'
                  placeholder='Bantu kami mewujudkan pelayanan yang prima & berintegritas...'
                />
              </div>

              {/* Opsi Tampilan Toggle */}
              <div className='border-border/70 grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-3'>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1.5'>
                  <Label
                    htmlFor='toggle-bps'
                    className='cursor-pointer text-xs font-medium'
                  >
                    Logo BPS Sitaro
                  </Label>
                  <Switch
                    id='toggle-bps'
                    checked={config.showBpsLogo}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, showBpsLogo: checked }))
                    }
                  />
                </div>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1.5'>
                  <Label
                    htmlFor='toggle-berakhlak'
                    className='cursor-pointer text-xs font-medium'
                  >
                    Logo BerAKHLAK
                  </Label>
                  <Switch
                    id='toggle-berakhlak'
                    checked={config.showBerakhlakLogo}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        showBerakhlakLogo: checked
                      }))
                    }
                  />
                </div>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1.5'>
                  <Label
                    htmlFor='toggle-footer'
                    className='cursor-pointer text-xs font-medium'
                  >
                    Footer Kontak PST
                  </Label>
                  <Switch
                    id='toggle-footer'
                    checked={config.showContactFooter}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        showContactFooter: checked
                      }))
                    }
                  />
                </div>
              </div>

              {/* Kontak PST Input */}
              {config.showContactFooter && (
                <div className='grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3'>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='kontak-wa'
                      className='text-muted-foreground text-[11px]'
                    >
                      WhatsApp PST
                    </Label>
                    <Input
                      id='kontak-wa'
                      value={config.kontakWa}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          kontakWa: e.target.value
                        }))
                      }
                      className='h-8 font-mono text-xs'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='kontak-email'
                      className='text-muted-foreground text-[11px]'
                    >
                      Email Resmi
                    </Label>
                    <Input
                      id='kontak-email'
                      value={config.kontakEmail}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          kontakEmail: e.target.value
                        }))
                      }
                      className='h-8 font-mono text-xs'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label
                      htmlFor='kontak-web'
                      className='text-muted-foreground text-[11px]'
                    >
                      Website Portal
                    </Label>
                    <Input
                      id='kontak-web'
                      value={config.kontakWeb}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          kontakWeb: e.target.value
                        }))
                      }
                      className='h-8 font-mono text-xs'
                    />
                  </div>
                </div>
              )}

              {/* Tombol Simpan & Reset */}
              <div className='border-border/60 flex items-center justify-between border-t pt-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleResetDefault}
                  className='text-muted-foreground hover:text-foreground text-xs'
                >
                  <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                  Reset Standar BPS
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={handleSaveConfig}
                  disabled={isPending}
                  className='bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700'
                >
                  {isPending ? (
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <Save className='mr-1.5 h-3.5 w-3.5' />
                  )}
                  Simpan Konfigurasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PANEL KANAN: LIVE INTERACTIVE PREVIEW & ACTION EXPORT (5 KOLOM) */}
        <div className='space-y-4 lg:col-span-5'>
          <Card className='border-border/80 sticky top-6 shadow-md'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Pratinjau Langsung (Live Preview)
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Tampilan akrilik meja beresolusi tinggi sebelum dicetak
                  </CardDescription>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Button
                    variant={previewMode === 'standee' ? 'secondary' : 'ghost'}
                    size='sm'
                    onClick={() => setPreviewMode('standee')}
                    className='h-7 px-2 text-xs'
                  >
                    Standee 3D
                  </Button>
                  <Button
                    variant={previewMode === 'flat' ? 'secondary' : 'ghost'}
                    size='sm'
                    onClick={() => setPreviewMode('flat')}
                    className='h-7 px-2 text-xs'
                  >
                    Datar Cetak
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* AREA PRATINJAU DOKUMEN / KARTU */}
              <div className='border-border/80 flex items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-100 to-slate-200 px-2 py-4 dark:from-slate-900 dark:to-slate-950'>
                {/* WADAH UTAMA KARTU STANDEE (TARGET CSS PRINT) */}
                <div
                  ref={printCardRef}
                  id='pst-print-container'
                  style={{
                    width: `${activeTemplate.previewWidthPx}px`,
                    minHeight: `${activeTemplate.previewHeightPx}px`
                  }}
                  className={`relative flex flex-col justify-between bg-white text-slate-900 transition-all duration-300 ${
                    previewMode === 'standee'
                      ? 'rounded-2xl border-4 border-slate-300 shadow-2xl ring-4 ring-black/5 dark:ring-white/10'
                      : 'border border-slate-200 shadow-lg'
                  }`}
                >
                  {/* AKRILIK HEADER GLOSS OVERLAY (HANYA MOCKUP) */}
                  {previewMode === 'standee' && (
                    <div className='pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 rounded-t-2xl bg-gradient-to-b from-white/30 to-transparent' />
                  )}

                  {/* HEADER KOP BPS RESMI */}
                  <div
                    className={`relative overflow-hidden p-4 text-white ${
                      previewMode === 'standee' ? 'rounded-t-xl' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${activeTheme.primaryColor} 0%, ${activeTheme.secondaryColor} 100%)`
                    }}
                  >
                    {/* Pattern geometris halus */}
                    <div className='pointer-events-none absolute -right-6 -bottom-6 opacity-15'>
                      <svg
                        width='100'
                        height='100'
                        viewBox='0 0 100 100'
                        fill='currentColor'
                      >
                        <polygon points='50,0 100,50 50,100 0,50' />
                      </svg>
                    </div>

                    <div className='relative z-10 flex items-center justify-between gap-3'>
                      {/* Logo BPS Vektor */}
                      {config.showBpsLogo && (
                        <div className='flex items-center gap-2'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm'>
                            <svg
                              viewBox='0 0 48 48'
                              className='h-full w-full'
                              fill='none'
                            >
                              {/* Rhombus atas-kiri biru */}
                              <polygon
                                points='24,4 42,14 24,24 6,14'
                                fill='#02529C'
                              />
                              {/* Rhombus kanan hijau */}
                              <polygon
                                points='44,16 44,36 26,46 26,26'
                                fill='#16A34A'
                              />
                              {/* Rhombus kiri oranye */}
                              <polygon
                                points='22,26 22,46 4,36 4,16'
                                fill='#EA580C'
                              />
                            </svg>
                          </div>
                          <div>
                            <div className='text-[11px] leading-tight font-extrabold tracking-wide text-white uppercase'>
                              {config.kantorName}
                            </div>
                            <div className='text-[10px] leading-tight font-bold tracking-wider text-amber-300'>
                              {config.kantorSub}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Logo BerAKHLAK Vektor */}
                      {config.showBerakhlakLogo && (
                        <div className='flex shrink-0 flex-col items-center justify-center rounded-lg bg-white/95 px-2 py-1 shadow-sm'>
                          <div className='text-[10px] leading-none font-black tracking-tighter text-red-600'>
                            Ber<span className='text-amber-500'>AKHLAK</span>
                          </div>
                          <div className='mt-0.5 text-[6px] leading-none font-bold tracking-tight text-slate-700'>
                            Bangga Melayani
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Garis Aksen Emas */}
                    <div className='mt-2.5 h-0.5 w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500' />
                  </div>

                  {/* BADAN KARTU (JUDUL, QR CODE, & INSTRUKSI) */}
                  <div className='flex flex-1 flex-col items-center justify-center space-y-3.5 p-4 text-center'>
                    {/* Badge Jenis Layanan */}
                    <div
                      className='inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide'
                      style={{
                        backgroundColor: activeTheme.lightBg,
                        color: activeTheme.primaryColor
                      }}
                    >
                      <Sparkles className='h-3 w-3 text-amber-500' />
                      <span>
                        {PRESET_TARGETS[config.presetTarget]?.badge ||
                          'PELAYANAN STATISTIK'}
                      </span>
                    </div>

                    {/* Judul Kartu Standee */}
                    <div className='space-y-1 px-2'>
                      <h3
                        className='text-base leading-snug font-extrabold tracking-tight'
                        style={{ color: activeTheme.primaryColor }}
                      >
                        {config.title}
                      </h3>
                      <p className='line-clamp-3 text-[11px] leading-relaxed text-slate-600'>
                        {config.subtitle}
                      </p>
                    </div>

                    {/* BINGKAI MODERN QR CODE RESMI */}
                    <div className='relative flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-md'>
                      {/* Corner Accents */}
                      <div
                        className='absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2'
                        style={{ borderColor: activeTheme.primaryColor }}
                      />
                      <div
                        className='absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2'
                        style={{ borderColor: activeTheme.primaryColor }}
                      />
                      <div
                        className='absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2'
                        style={{ borderColor: activeTheme.primaryColor }}
                      />
                      <div
                        className='absolute -right-1 -bottom-1 h-4 w-4 border-r-2 border-b-2'
                        style={{ borderColor: activeTheme.primaryColor }}
                      />

                      {/* Gambar QR Code */}
                      {isGenerating ? (
                        <div className='flex h-48 w-48 flex-col items-center justify-center gap-2 text-slate-400'>
                          <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                          <span className='text-[11px]'>Membuat QR...</span>
                        </div>
                      ) : qrDataUrl ? (
                        <div className='relative'>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrDataUrl}
                            alt={`QR Code ${config.title}`}
                            className='h-48 w-48 rounded-lg object-contain'
                          />
                          {/* Center Mini-Badge BPS */}
                          <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white p-1 shadow-md'>
                              <div className='flex h-full w-full items-center justify-center rounded bg-gradient-to-br from-blue-700 to-sky-600 text-[9px] font-black text-white'>
                                BPS
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='flex h-48 w-48 items-center justify-center text-xs text-red-500'>
                          Gagal memuat QR
                        </div>
                      )}

                      {/* Badge "PINDAI SAYA" */}
                      <div
                        className='absolute -bottom-3 rounded-full px-3 py-0.5 text-[9px] font-extrabold tracking-widest text-white uppercase shadow'
                        style={{ backgroundColor: activeTheme.primaryColor }}
                      >
                        Pindai Saya
                      </div>
                    </div>

                    {/* Slogan Integritas */}
                    <div
                      className='w-full rounded-xl border p-2 text-[10px] font-bold'
                      style={{
                        backgroundColor: activeTheme.lightBg,
                        borderColor: `${activeTheme.secondaryColor}40`,
                        color: activeTheme.primaryColor
                      }}
                    >
                      <div className='flex items-center justify-center gap-1.5'>
                        <ShieldCheck className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                        <span>“{config.slogan}”</span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER KONTAK PST */}
                  {config.showContactFooter && (
                    <div className='rounded-b-xl border-t border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-600'>
                      <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium'>
                        <span className='flex items-center gap-1'>
                          <Phone className='h-2.5 w-2.5 text-emerald-600' />
                          {config.kontakWa}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Mail className='h-2.5 w-2.5 text-blue-600' />
                          {config.kontakEmail}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Globe className='h-2.5 w-2.5 text-indigo-600' />
                          {config.kontakWeb}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* KAKI STAND STANDEE MOCKUP (HANYA DITAMPILKAN DALAM MODE 3D) */}
                  {previewMode === 'standee' && (
                    <div className='absolute inset-x-8 -bottom-5 -z-10 h-4 rounded-b-lg bg-gradient-to-b from-slate-400 to-slate-500 shadow-md' />
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS (PRINT & DOWNLOAD) */}
              <div className='space-y-2 pt-2'>
                <Button
                  onClick={handlePrint}
                  className='w-full bg-gradient-to-r from-blue-700 to-sky-700 font-semibold text-white shadow-md hover:from-blue-800 hover:to-sky-800'
                >
                  <Printer className='mr-2 h-4 w-4' />
                  Cetak / Print Desain ({activeTemplate.paperName})
                </Button>

                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleDownloadPNG}
                    className='border-border/80 text-xs font-medium'
                  >
                    <Download className='mr-1.5 h-3.5 w-3.5 text-emerald-600' />
                    Unduh Gambar PNG HD
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleCopyLink}
                    className='border-border/80 text-xs font-medium'
                  >
                    <Copy className='mr-1.5 h-3.5 w-3.5 text-blue-600' />
                    Salin Tautan Survei
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
