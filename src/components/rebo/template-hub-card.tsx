'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  DownloadCloud,
  ExternalLink,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Sparkles,
  Layers,
  FolderGit2,
  FileCheck2,
  Info,
  Presentation,
  Eye,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  MASTER_TEMPLATE_LIST,
  type BakuTemplateItem,
  generateTemplateBlob,
  generateAllTemplatesZip
} from '@/lib/templates/template-generators';

interface TemplateHubCardProps {
  gdriveLink?: string;
  className?: string;
}

export default function TemplateHubCard({
  gdriveLink = 'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing',
  className = ''
}: TemplateHubCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedFormat, setSelectedFormat] = useState<string>('Semua');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BakuTemplateItem | null>(null);

  // Kategori list
  const kategoriList = [
    'Semua',
    'Surat & Administrasi',
    'Rapat & Notula',
    'Presensi Kegiatan',
    'Monev & Akuntabilitas',
    'Dokumentasi Visual',
    'Pengawasan & Integritas'
  ];

  // Filter templates
  const filteredTemplates = MASTER_TEMPLATE_LIST.filter((tpl) => {
    const matchSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tipsQA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.pilarTerkait.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKategori =
      selectedKategori === 'Semua' || tpl.kategori === selectedKategori;

    const matchFormat =
      selectedFormat === 'Semua' || tpl.format === selectedFormat;

    return matchSearch && matchKategori && matchFormat;
  });

  // Handle Unduh Single Template
  const handleDownloadSingle = async (template: BakuTemplateItem) => {
    try {
      setDownloadingId(template.id);
      toast.loading(`Mempersiapkan ${template.filename}...`, {
        id: `dl-${template.id}`
      });

      const { blob, filename } = await generateTemplateBlob(template.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Template '${filename}' berhasil diunduh.`, {
        id: `dl-${template.id}`
      });
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengunduh template.', {
        id: `dl-${template.id}`
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Unduh Semua Template ZIP
  const handleDownloadAllZip = async () => {
    try {
      setIsDownloadingZip(true);
      toast.loading(
        'Membundel seluruh dokumen template resmi ke dalam ZIP...',
        {
          id: 'bundle-zip'
        }
      );

      const zipBlob = await generateAllTemplatesZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Baku_Bukti_Dukung_BPS_Sitaro.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        'Bundle seluruh template baku (.zip) berhasil diunduh lengkap dengan petunjuk QA!',
        { id: 'bundle-zip' }
      );
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membundel arsip ZIP template.', {
        id: 'bundle-zip'
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Handle Salin Tautan
  const handleCopyLink = async (template: BakuTemplateItem) => {
    try {
      const urlToCopy = template.gdriveUrl || gdriveLink;
      await navigator.clipboard.writeText(urlToCopy);
      setCopiedId(template.id);
      toast.success(
        `Tautan Google Drive untuk '${template.title}' berhasil disalin ke clipboard!`
      );
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch {
      toast.error('Gagal menyalin tautan ke clipboard.');
    }
  };

  // Copy Master GDrive Link
  const handleCopyMasterLink = async () => {
    try {
      await navigator.clipboard.writeText(gdriveLink);
      toast.success('Tautan Master Folder GDrive berhasil disalin!');
    } catch {
      toast.error('Gagal menyalin tautan ke clipboard.');
    }
  };

  // Get format visual styling
  const getFormatStyle = (format: string) => {
    switch (format) {
      case 'DOCX':
        return {
          bg: 'bg-blue-600',
          lightBg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-900',
          text: 'text-blue-700 dark:text-blue-300',
          icon: <FileText className='h-5 w-5' />,
          badgeClass: 'bg-blue-600 text-white'
        };
      case 'XLSX':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-900',
          text: 'text-emerald-700 dark:text-emerald-300',
          icon: <FileSpreadsheet className='h-5 w-5' />,
          badgeClass: 'bg-emerald-600 text-white'
        };
      case 'PPTX':
        return {
          bg: 'bg-amber-600',
          lightBg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-900',
          text: 'text-amber-700 dark:text-amber-300',
          icon: <Presentation className='h-5 w-5' />,
          badgeClass: 'bg-amber-600 text-white'
        };
      default:
        return {
          bg: 'bg-slate-600',
          lightBg: 'bg-slate-50 dark:bg-slate-900/40',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          icon: <FileText className='h-5 w-5' />,
          badgeClass: 'bg-slate-600 text-white'
        };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ============================================================================== */}
      {/* HERO SECTION / HEADER TEMPLATE HUB */}
      {/* ============================================================================== */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white p-6 shadow-xs sm:p-8 dark:border-blue-900/60 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-2xl space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur-xs dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300'>
              <FileCheck2 className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              <span>Standard Template Hub • Standar BPS Sitaro</span>
            </div>

            <h2 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100'>
              Pusat Template & Format Baku Bukti Dukung ZI
            </h2>

            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Unduh langsung berkas template resmi standar BPS Kabupaten
              Kepulauan Sitaro untuk 5 dokumen wajib QA dan kepatuhan evaluasi
              PermenPAN-RB No. 90/2021. Setiap berkas telah dilengkapi kop
              resmi, format tabel baku, instruksi pengisian, serta panduan lolos
              verifikasi.
            </p>

            <div className='flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400'>
              <span className='inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300'>
                <ShieldCheck className='h-4 w-4 text-emerald-600' />
                Kompatibel Otomatis Heuristik QA REBO
              </span>
              <span>•</span>
              <span>
                Format: Word (.docx), Excel (.xlsx), PowerPoint (.pptx)
              </span>
            </div>
          </div>

          {/* Action Button: Bundle ZIP & GDrive */}
          <div className='flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:items-end'>
            <Button
              type='button'
              onClick={handleDownloadAllZip}
              disabled={isDownloadingZip}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
            >
              <DownloadCloud className='h-4 w-4' />
              <span>
                {isDownloadingZip
                  ? 'Membundel Berkas ZIP...'
                  : 'Unduh Semua Template (.zip)'}
              </span>
            </Button>

            <div className='flex items-center gap-2'>
              <a
                href={gdriveLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              >
                <FolderGit2 className='h-3.5 w-3.5 text-blue-600' />
                <span>Folder GDrive Master</span>
                <ExternalLink className='h-3 w-3 text-slate-400' />
              </a>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCopyMasterLink}
                className='inline-flex items-center gap-1.5 text-xs'
              >
                <Copy className='h-3 w-3' />
                <span>Salin Tautan</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* FILTER & PENCARIAN TEMPLATE */}
      {/* ============================================================================== */}
      <div className='space-y-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          {/* Search Box */}
          <div className='relative w-full max-w-md'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              type='text'
              placeholder='Cari template (undangan, notula, presensi, monev, pakta)...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pr-8 pl-9 text-xs'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Quick Format Filter */}
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='mr-1 text-xs font-medium text-slate-500'>
              Format:
            </span>
            {['Semua', 'DOCX', 'XLSX', 'PPTX'].map((fmt) => (
              <button
                key={fmt}
                type='button'
                onClick={() => setSelectedFormat(fmt)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedFormat === fmt
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {fmt === 'Semua' ? 'Semua Format' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className='flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800'>
          <span className='mr-1 text-xs font-medium text-slate-500'>
            Kategori:
          </span>
          {kategoriList.map((kat) => (
            <button
              key={kat}
              type='button'
              onClick={() => setSelectedKategori(kat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedKategori === kat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Status Count */}
        <div className='flex items-center justify-between pt-1 text-xs text-slate-500'>
          <span>
            Menampilkan <strong>{filteredTemplates.length}</strong> dari{' '}
            {MASTER_TEMPLATE_LIST.length} template standar BPS Sitaro
          </span>
          {(searchQuery ||
            selectedKategori !== 'Semua' ||
            selectedFormat !== 'Semua') && (
            <button
              type='button'
              onClick={() => {
                setSearchQuery('');
                setSelectedKategori('Semua');
                setSelectedFormat('Semua');
              }}
              className='font-medium text-blue-600 hover:underline dark:text-blue-400'
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* GRID KARTU TEMPLATE RESMI */}
      {/* ============================================================================== */}
      {filteredTemplates.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700'>
          <Info className='mx-auto h-10 w-10 text-slate-400' />
          <h3 className='mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200'>
            Template tidak ditemukan
          </h3>
          <p className='mt-1 text-xs text-slate-500'>
            Tidak ada dokumen yang cocok dengan kata kunci &quot;{searchQuery}
            &quot; pada filter saat ini.
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              setSearchQuery('');
              setSelectedKategori('Semua');
              setSelectedFormat('Semua');
            }}
            className='mt-4'
          >
            Bersihkan Filter
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTemplates.map((template) => {
            const fmt = getFormatStyle(template.format);
            const isDownloading = downloadingId === template.id;
            const isCopied = copiedId === template.id;

            return (
              <div
                key={template.id}
                className='flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-900'
              >
                {/* Bagian Atas Kartu */}
                <div className='space-y-4'>
                  {/* Header Kartu: Format Icon, Badge Kategori & Ukuran */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${fmt.bg}`}
                      >
                        {fmt.icon}
                      </div>
                      <div>
                        <Badge
                          variant='outline'
                          className={`text-[10px] font-bold ${fmt.border} ${fmt.text}`}
                        >
                          {template.kategori}
                        </Badge>
                        <div className='mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                          {template.format} • {template.ukuranEst}
                        </div>
                      </div>
                    </div>

                    <span className='rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                      {template.code}
                    </span>
                  </div>

                  {/* Judul & Deskripsi */}
                  <div>
                    <h3 className='line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100'>
                      {template.title}
                    </h3>
                    <p className='mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      {template.deskripsi}
                    </p>
                  </div>

                  {/* Komponen Wajib Checklist Preview */}
                  <div className='space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800/80 dark:bg-slate-800/40'>
                    <div className='text-[11px] font-bold text-slate-700 dark:text-slate-300'>
                      Komponen Wajib (QA Checklist):
                    </div>
                    <ul className='space-y-1 text-[11px] text-slate-600 dark:text-slate-400'>
                      {template.poinWajib.slice(0, 3).map((poin, idx) => (
                        <li key={idx} className='flex items-start gap-1.5'>
                          <Check className='mt-0.5 h-3 w-3 shrink-0 text-emerald-600' />
                          <span className='line-clamp-1'>{poin}</span>
                        </li>
                      ))}
                      {template.poinWajib.length > 3 && (
                        <li className='text-[10px] text-slate-400 italic'>
                          + {template.poinWajib.length - 3} komponen lainnya...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Tips QA Callout */}
                  <div className='flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 p-2.5 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'>
                    <ShieldCheck className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400' />
                    <div>
                      <span className='font-bold'>Tips Verifikasi QA: </span>
                      <span className='text-amber-800 dark:text-amber-300/90'>
                        {template.tipsQA}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bagian Bawah Kartu: Pilar & Tombol Aksi */}
                <div className='mt-5 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <div className='flex items-center justify-between text-[11px] text-slate-500'>
                    <span>Pilar Relevan:</span>
                    <span className='font-medium text-slate-700 dark:text-slate-300'>
                      {template.pilarTerkait}
                    </span>
                  </div>

                  {/* Tombol Aksi */}
                  <div className='flex flex-col gap-2'>
                    {/* Tombol Utama: Unduh Template Langsung */}
                    <Button
                      type='button'
                      onClick={() => handleDownloadSingle(template)}
                      disabled={isDownloading}
                      className={`w-full justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-xs ${fmt.bg} hover:opacity-90`}
                    >
                      <Download className='h-3.5 w-3.5' />
                      <span>
                        {isDownloading
                          ? 'Mempersiapkan Berkas...'
                          : `Unduh Template (${template.fileExtension})`}
                      </span>
                    </Button>

                    {/* Tombol Sekunder: Pratinjau, Buka GDrive, Salin Tautan */}
                    <div className='grid grid-cols-3 gap-1.5'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setPreviewItem(template)}
                        className='text-[11px] font-medium'
                        title='Lihat detail format'
                      >
                        <Eye className='mr-1 h-3 w-3' />
                        <span>Detail</span>
                      </Button>

                      <a
                        href={template.gdriveUrl || gdriveLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        title='Buka di Google Drive'
                      >
                        <FolderGit2 className='mr-1 h-3 w-3 text-blue-600' />
                        <span>GDrive</span>
                      </a>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleCopyLink(template)}
                        className='text-[11px] font-medium'
                        title='Salin tautan template'
                      >
                        {isCopied ? (
                          <>
                            <Check className='mr-1 h-3 w-3 text-emerald-600' />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className='mr-1 h-3 w-3' />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================================== */}
      {/* DIALOG PRATINJAU & DETAIL DOKUMEN */}
      {/* ============================================================================== */}
      <Dialog
        open={Boolean(previewItem)}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className='max-w-2xl'>
          {previewItem && (
            <>
              <DialogHeader>
                <div className='flex items-center gap-2'>
                  <Badge className='bg-blue-600 text-[10px] text-white'>
                    {previewItem.code}
                  </Badge>
                  <span className='text-xs font-semibold text-slate-500'>
                    {previewItem.kategori}
                  </span>
                </div>
                <DialogTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                  {previewItem.title}
                </DialogTitle>
                <DialogDescription className='text-xs text-slate-500'>
                  Berkas resmi standar: {previewItem.filename} (
                  {previewItem.format} • {previewItem.ukuranEst})
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-2 text-xs'>
                <div>
                  <h4 className='font-bold text-slate-900 dark:text-slate-100'>
                    Tujuan & Deskripsi Penggunaan:
                  </h4>
                  <p className='mt-1 leading-relaxed text-slate-600 dark:text-slate-400'>
                    {previewItem.deskripsi}
                  </p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
                  <h4 className='font-bold text-slate-900 dark:text-slate-100'>
                    Komponen Wajib Dokumen (QA Checklist):
                  </h4>
                  <ul className='mt-2 space-y-1.5'>
                    {previewItem.poinWajib.map((poin, idx) => (
                      <li
                        key={idx}
                        className='flex items-start gap-2 text-slate-700 dark:text-slate-300'
                      >
                        <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                        <span>{poin}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'>
                  <div className='flex items-center gap-1.5 font-bold'>
                    <ShieldCheck className='h-4 w-4 text-amber-600' />
                    <span>Petunjuk Verifikasi QA & Tim Penilai:</span>
                  </div>
                  <p className='mt-1 leading-relaxed'>{previewItem.tipsQA}</p>
                </div>

                <div className='flex items-center justify-between text-xs text-slate-500'>
                  <span>
                    Pilar Terkait: <strong>{previewItem.pilarTerkait}</strong>
                  </span>
                  <span>
                    Standar Acuan: <strong>PermenPAN-RB No. 90/2021</strong>
                  </span>
                </div>
              </div>

              <DialogFooter className='flex items-center justify-between gap-2 border-t pt-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setPreviewItem(null)}
                >
                  Tutup
                </Button>

                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => handleCopyLink(previewItem)}
                  >
                    <Copy className='mr-1 h-3 w-3' />
                    <span>Salin Tautan</span>
                  </Button>

                  <Button
                    type='button'
                    size='sm'
                    onClick={() => {
                      handleDownloadSingle(previewItem);
                      setPreviewItem(null);
                    }}
                    className='bg-blue-600 text-white hover:bg-blue-700'
                  >
                    <Download className='mr-1 h-3.5 w-3.5' />
                    <span>Unduh Berkas ({previewItem.fileExtension})</span>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
