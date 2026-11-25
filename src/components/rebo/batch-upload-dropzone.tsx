'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  FileText,
  Link,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  Plus,
  RefreshCw,
  X,
  FileCheck2,
  Tag,
  Zap,
  Leaf,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  compressImageFile,
  isCompressibleImage,
  formatFileSize,
  type CompressionResult
} from '@/lib/compression/client-compressor';
import { FileCompressionBadge } from '@/components/rebo/file-compression-badge';
import { DocumentPreviewModal } from '@/components/rebo/document-preview-modal';

export const TIPE_DOKUMEN_OPTIONS = [
  'Undangan',
  'Daftar Hadir',
  'Notula',
  'Laporan / Output / SK / SOP',
  'Dokumentasi / Foto',
  'Dokumen Pendukung Lainnya'
] as const;

export type TipeDokumen = (typeof TIPE_DOKUMEN_OPTIONS)[number];

export interface BatchDokumenItem {
  id: string;
  nama_dokumen: string;
  file_url: string;
  tipe_dokumen: string;
  isAutoTagged: boolean;
  sourceType: 'file' | 'link';
  fileSize?: number;
  compressionResult?: CompressionResult;
}

export interface BatchUploadDropzoneProps {
  onBatchAdd: (
    newDocs: Array<{
      nama_dokumen: string;
      file_url: string;
      tipe_dokumen: string;
      compressionResult?: CompressionResult;
    }>
  ) => void;
  onCancel?: () => void;
  defaultFolderUrl?: string | null;
  className?: string;
}

/**
 * Auto-Tagging Kategori Dokumen Berdasarkan Aturan QA REBO V2:
 * 1. Mengandung "undangan", "surat", "nd", "nota" -> "Undangan"
 * 2. Mengandung "hadir", "presensi", "absensi" -> "Daftar Hadir"
 * 3. Mengandung "notula", "risalah", "catatan", "resume" -> "Notula"
 * 4. Mengandung "laporan", "sk", "sop", "output", "panduan" -> "Laporan / Output / SK / SOP"
 * 5. Mengandung "foto", "dokumentasi", "kegiatan", "tangkapan", ".jpg", ".png" -> "Dokumentasi / Foto"
 * 6. Selain itu: "Dokumen Pendukung Lainnya"
 */
export function autoTagDocumentCategory(input: string): TipeDokumen {
  const text = input.toLowerCase();

  // 1. Undangan
  if (
    text.includes('undangan') ||
    text.includes('surat') ||
    text.includes('nota') ||
    /\bnd[-_\s\d]/.test(text) ||
    /\bnd\b/.test(text)
  ) {
    return 'Undangan';
  }

  // 2. Daftar Hadir
  if (
    text.includes('hadir') ||
    text.includes('presensi') ||
    text.includes('absensi')
  ) {
    return 'Daftar Hadir';
  }

  // 3. Notula
  if (
    text.includes('notula') ||
    text.includes('risalah') ||
    text.includes('catatan') ||
    text.includes('resume')
  ) {
    return 'Notula';
  }

  // 4. Laporan / Output / SK / SOP
  if (
    text.includes('laporan') ||
    text.includes('output') ||
    text.includes('panduan') ||
    /\bsk[-_\s\d]/.test(text) ||
    /\bsk\b/.test(text) ||
    /\bsop[-_\s\d]/.test(text) ||
    /\bsop\b/.test(text)
  ) {
    return 'Laporan / Output / SK / SOP';
  }

  // 5. Dokumentasi / Foto
  if (
    text.includes('foto') ||
    text.includes('dokumentasi') ||
    text.includes('kegiatan') ||
    text.includes('tangkapan') ||
    text.includes('.jpg') ||
    text.includes('.jpeg') ||
    text.includes('.png') ||
    text.includes('.webp')
  ) {
    return 'Dokumentasi / Foto';
  }

  return 'Dokumen Pendukung Lainnya';
}

/**
 * Membersihkan nama file menjadi judul dokumen yang rapi
 */
function cleanDocTitle(fileName: string): string {
  // Hapus ekstensi
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Ganti underscore, dash, atau multiple spaces dengan 1 spasi
  const formatted = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return formatted || fileName;
}

export function BatchUploadDropzone({
  onBatchAdd,
  onCancel,
  defaultFolderUrl,
  className = ''
}: BatchUploadDropzoneProps) {
  const [activeTab, setActiveTab] = useState<'drop' | 'paste'>('drop');
  const [stagedItems, setStagedItems] = useState<BatchDokumenItem[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [autoCompress, setAutoCompress] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type?: string;
  } | null>(null);

  // Animasi progress bar saat pemrosesan batch
  const runProgressSimulation = (callback: () => void) => {
    setIsProcessing(true);
    setProgress(15);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === null) return 30;
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        callback();
        setIsProcessing(false);
        setProgress(null);
      }, 250);
    }, 550);
  };

  // Handler Drop Files via react-dropzone dengan kompresi client-side otomatis
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setIsCompressing(true);
      setProgress(15);

      const newItems: BatchDokumenItem[] = [];

      for (let idx = 0; idx < acceptedFiles.length; idx++) {
        let file = acceptedFiles[idx];
        let compressionResult: CompressionResult | undefined = undefined;

        if (autoCompress && isCompressibleImage(file)) {
          try {
            compressionResult = await compressImageFile(file);
            if (compressionResult.isCompressed) {
              file = compressionResult.file;
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Gagal kompresi file:', file.name, e);
          }
        }

        const title = cleanDocTitle(file.name);
        const autoType = autoTagDocumentCategory(`${file.name} ${title}`);

        // Buat URL default: jika ada folder indikator, gunakan tautan dengan anchor file,
        // atau gunakan placeholder valid Google Drive yang dapat disunting pengguna
        const initialUrl = defaultFolderUrl
          ? `${defaultFolderUrl.replace(/\/$/, '')}#file=${encodeURIComponent(file.name)}`
          : `https://drive.google.com/file/d/upload-${Date.now()}-${idx}/view`;

        newItems.push({
          id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          nama_dokumen: title,
          file_url: initialUrl,
          tipe_dokumen: autoType,
          isAutoTagged: true,
          sourceType: 'file',
          fileSize: file.size,
          compressionResult
        });

        const currentProg = Math.min(
          95,
          Math.round(20 + ((idx + 1) / acceptedFiles.length) * 75)
        );
        setProgress(currentProg);
      }

      setProgress(100);
      setTimeout(() => {
        setStagedItems((prev) => [...prev, ...newItems]);
        setValidationError(null);
        setIsProcessing(false);
        setIsCompressing(false);
        setProgress(null);
      }, 250);
    },
    [defaultFolderUrl, autoCompress]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
          '.xlsx'
        ],
        'application/vnd.ms-excel': ['.xls'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
      },
      multiple: true
    });

  // Handler Paste Teks Massal (Multiple Links GDrive / URL baris-demi-baris)
  const handleParsePastedLinks = () => {
    if (!pasteText.trim()) {
      setValidationError(
        'Silakan tempel minimal 1 baris tautan Google Drive / URL.'
      );
      return;
    }

    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setValidationError('Teks kosong atau tidak ada baris yang valid.');
      return;
    }

    runProgressSimulation(() => {
      const parsedItems: BatchDokumenItem[] = [];

      lines.forEach((line, idx) => {
        let title = '';
        let url = '';

        // Kasus 1: Format Markdown `[Judul](https://...)`
        const mdMatch = line.match(/^\[(.*?)\]\((https?:\/\/.*?)\)$/);
        if (mdMatch) {
          title = mdMatch[1]?.trim() || '';
          url = mdMatch[2]?.trim() || '';
        }

        // Kasus 2: Format `Judul - URL` atau `Judul \t URL` atau `Judul | URL`
        if (!url) {
          const separators = [' - ', '\t', ' | ', ' -- '];
          for (const sep of separators) {
            if (line.includes(sep)) {
              const parts = line.split(sep);
              const part1 = parts[0].trim();
              const part2 = parts.slice(1).join(sep).trim();

              if (part2.startsWith('http://') || part2.startsWith('https://')) {
                title = part1;
                url = part2;
                break;
              } else if (
                part1.startsWith('http://') ||
                part1.startsWith('https://')
              ) {
                url = part1;
                title = part2;
                break;
              }
            }
          }
        }

        // Kasus 3: Baris hanya berisi URL langsung
        if (!url) {
          if (line.startsWith('http://') || line.startsWith('https://')) {
            url = line;
          } else {
            // Coba ekstrak URL di dalam kalimat
            const urlMatch = line.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
              url = urlMatch[0];
              title = line
                .replace(urlMatch[0], '')
                .replace(/[-:|]+/g, '')
                .trim();
            }
          }
        }

        // Jika URL berhasil didapatkan
        if (url) {
          if (!title) {
            // Coba buat judul otomatis dari URL path atau default nama
            try {
              const parsedUrl = new URL(url);
              const pathname = parsedUrl.pathname;
              const segments = pathname.split('/').filter(Boolean);
              const lastSegment = segments[segments.length - 1] || '';
              if (
                lastSegment &&
                !lastSegment.startsWith('view') &&
                lastSegment.length > 3
              ) {
                title = cleanDocTitle(decodeURIComponent(lastSegment));
              } else {
                title = `Tautan Dokumen Bukti ${stagedItems.length + parsedItems.length + 1}`;
              }
            } catch {
              title = `Tautan Dokumen Bukti ${stagedItems.length + parsedItems.length + 1}`;
            }
          }

          const autoType = autoTagDocumentCategory(`${title} ${url}`);

          parsedItems.push({
            id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            nama_dokumen: title,
            file_url: url,
            tipe_dokumen: autoType,
            isAutoTagged: true,
            sourceType: 'link'
          });
        }
      });

      if (parsedItems.length === 0) {
        setValidationError(
          'Tidak ditemukan tautan URL (http:// atau https://) yang valid pada teks yang ditempel.'
        );
        return;
      }

      setStagedItems((prev) => [...prev, ...parsedItems]);
      setPasteText('');
      setValidationError(null);
    });
  };

  // Update item di review list
  const handleUpdateItem = (
    id: string,
    field: 'nama_dokumen' | 'file_url' | 'tipe_dokumen',
    value: string
  ) => {
    setStagedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'tipe_dokumen') {
            updated.isAutoTagged = false;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Hapus 1 item dari review list
  const handleRemoveStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Tambah baris kosong baru manual ke staging
  const handleAddManualRow = () => {
    const defaultType = 'Laporan / Output / SK / SOP';
    const initialUrl =
      defaultFolderUrl || 'https://drive.google.com/file/d/...';
    setStagedItems((prev) => [
      ...prev,
      {
        id: `batch-manual-${Date.now()}`,
        nama_dokumen: '',
        file_url: initialUrl,
        tipe_dokumen: defaultType,
        isAutoTagged: false,
        sourceType: 'link'
      }
    ]);
  };

  // Konfirmasi & kirim ke parent component
  const handleConfirmBatch = () => {
    if (stagedItems.length === 0) {
      setValidationError('Belum ada dokumen yang siap dimasukkan.');
      return;
    }

    // Validasi kelengkapan
    for (let i = 0; i < stagedItems.length; i++) {
      const item = stagedItems[i];
      if (!item.nama_dokumen.trim()) {
        setValidationError(
          `Dokumen baris ke-${i + 1} belum memiliki nama/judul dokumen.`
        );
        return;
      }
      if (!item.file_url.trim()) {
        setValidationError(
          `Dokumen "${item.nama_dokumen}" belum memiliki tautan URL file.`
        );
        return;
      }
      try {
        const u = new URL(item.file_url.trim());
        if (!u.protocol.startsWith('https')) {
          setValidationError(
            `URL "${item.file_url}" tidak valid. Tautan Google Drive harus menggunakan protokol https://`
          );
          return;
        }
        if (
          !u.hostname.endsWith('google.com') ||
          (!u.hostname.startsWith('drive.') && !u.hostname.startsWith('docs.'))
        ) {
          setValidationError(
            `Dokumen "${item.nama_dokumen}" memiliki URL yang tidak valid. Tautan harus berupa link resmi Google Drive (diawali https://drive.google.com/ atau https://docs.google.com/).`
          );
          return;
        }
      } catch {
        setValidationError(
          `Format URL "${item.file_url}" pada dokumen "${item.nama_dokumen}" tidak valid.`
        );
        return;
      }
    }

    const outputDocs = stagedItems.map((item) => ({
      nama_dokumen: item.nama_dokumen.trim(),
      file_url: item.file_url.trim(),
      tipe_dokumen: item.tipe_dokumen,
      compressionResult: item.compressionResult
    }));

    onBatchAdd(outputDocs);
    setStagedItems([]);
    setValidationError(null);
  };

  // Kalkulasi total kuota penyimpanan yang dihemat
  const totalSavedBytes = stagedItems.reduce(
    (acc, item) => acc + (item.compressionResult?.savingsBytes || 0),
    0
  );
  const totalOriginalBytes = stagedItems.reduce(
    (acc, item) =>
      acc + (item.compressionResult?.originalSize || item.fileSize || 0),
    0
  );
  const totalSavedPercent =
    totalOriginalBytes > 0 && totalSavedBytes > 0
      ? parseFloat(((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1))
      : 0;

  return (
    <div
      className={`rounded-xl border border-indigo-200 bg-white p-5 shadow-sm transition-all dark:border-indigo-900/60 dark:bg-gray-800/90 ${className}`}
    >
      {/* Header Dropzone */}
      <div className='mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-xs dark:bg-indigo-950 dark:text-indigo-300'>
            <UploadCloud className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='text-sm font-bold text-gray-900 dark:text-gray-100'>
                Unggah Massal & Drag-and-Drop Bukti Dukung
              </h4>
              <Badge
                variant='secondary'
                className='border-indigo-200 bg-indigo-50 text-[10px] font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
              >
                <Sparkles className='mr-1 h-3 w-3 text-indigo-600 dark:text-indigo-400' />
                Auto-Tagging AI / Rule
              </Badge>
              <Badge
                variant='outline'
                className='text-3xs hidden items-center gap-1 border-emerald-300 bg-emerald-50/80 px-2 py-0.5 font-semibold text-emerald-800 sm:inline-flex dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                title='Pratinjau dokumen dilindungi watermark anti-kebocoran sesuai ISO 27001'
              >
                <ShieldCheck className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                Watermark DRM (ISO 27001)
              </Badge>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Tarik beberapa file sekaligus atau tempel banyak tautan Google
              Drive. Sistem akan mengklasifikasikan kategori QA secara otomatis.
            </p>
          </div>
        </div>

        {onCancel && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onCancel}
            className='h-8 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <X className='mr-1 h-3.5 w-3.5' />
            Tutup
          </Button>
        )}
      </div>

      {/* Auto Compression Toggle Switch */}
      <div className='mb-4 flex flex-col justify-between gap-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3 shadow-2xs sm:flex-row sm:items-center dark:border-emerald-900/60 dark:bg-emerald-950/20'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shadow-2xs dark:bg-emerald-900/60 dark:text-emerald-300'>
            <Zap className='h-4 w-4' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-bold text-emerald-900 dark:text-emerald-100'>
                Kompresi Gambar Otomatis (Hemat Kuota)
              </span>
              <Badge
                variant='outline'
                className='border-emerald-300 bg-emerald-100/90 text-[10px] font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
              >
                Maks 1920px &bull; &lt; 1.5 MB
              </Badge>
            </div>
            <p className='text-[11px] text-emerald-700/90 dark:text-emerald-300/80'>
              Kompresi foto kegiatan &amp; dokumen scan di sisi peramban sebelum
              upload untuk mempercepat proses saat sinyal internet kepulauan
              lambat.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 self-end sm:self-center'>
          <span className='text-xs font-semibold text-emerald-800 dark:text-emerald-300'>
            {autoCompress ? 'Aktif' : 'Nonaktif'}
          </span>
          <Switch
            checked={autoCompress}
            onCheckedChange={setAutoCompress}
            aria-label='Toggle Kompresi Gambar Otomatis'
          />
        </div>
      </div>

      {/* Tabs Input Mode */}
      <div className='mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700'>
        <button
          type='button'
          onClick={() => setActiveTab('drop')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'drop'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <UploadCloud className='h-3.5 w-3.5' />
          <span>Drag & Drop Multi-Berkas</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'paste'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <Link className='h-3.5 w-3.5' />
          <span>Tempel Tautan Massal (Paste Links)</span>
        </button>
      </div>

      {/* Mode 1: Drag and Drop Area */}
      {activeTab === 'drop' && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/40'
              : isDragReject
                ? 'border-rose-400 bg-rose-50/60 dark:border-rose-700 dark:bg-rose-950/30'
                : 'border-gray-300 bg-gray-50/50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-indigo-600'
          }`}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center'>
            <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-xs dark:bg-indigo-950/80 dark:text-indigo-400'>
              <UploadCloud className='h-6 w-6' />
            </div>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
              {isDragActive
                ? 'Lepaskan berkas di sini untuk memproses...'
                : 'Tarik & letakkan beberapa berkas di sini, atau klik untuk memilih'}
            </p>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Mendukung: PDF, Word (docx), Excel (xlsx), dan Gambar (JPG/PNG).
            </p>
            <div className='text-2xs mt-3 flex flex-wrap items-center justify-center gap-2 text-gray-500 dark:text-gray-400'>
              <span className='inline-flex items-center gap-1 rounded bg-gray-200/70 px-2 py-0.5 font-medium dark:bg-gray-800'>
                <FileText className='h-3 w-3' /> PDF / DOCX
              </span>
              <span className='inline-flex items-center gap-1 rounded bg-gray-200/70 px-2 py-0.5 font-medium dark:bg-gray-800'>
                <FileSpreadsheet className='h-3 w-3' /> XLSX / XLS
              </span>
              <span className='inline-flex items-center gap-1 rounded bg-gray-200/70 px-2 py-0.5 font-medium dark:bg-gray-800'>
                <FileImage className='h-3 w-3' /> JPG / PNG / WEBP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste Multiple Links */}
      {activeTab === 'paste' && (
        <div className='space-y-3'>
          <div>
            <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
              Tempel Daftar Tautan Google Drive (Satu Tautan per Baris):
            </label>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Contoh format:\nUndangan Rapat Pembentukan Tim - https://drive.google.com/file/d/123...\nDaftar Hadir Sosialisasi https://drive.google.com/file/d/456...\nhttps://drive.google.com/file/d/789...`}
              className='w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-xs text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
            />
            <p className='text-2xs mt-1 text-gray-500 dark:text-gray-400'>
              💡 Mendukung teks dari Microsoft Excel/Spreadsheet, format
              &quot;Judul - Link&quot;, atau URL murni baris demi baris.
            </p>
          </div>
          <div className='flex justify-end'>
            <Button
              type='button'
              size='sm'
              onClick={handleParsePastedLinks}
              disabled={isProcessing || !pasteText.trim()}
              className='h-8 bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
            >
              <Sparkles className='mr-1.5 h-3.5 w-3.5' />
              Ekstrak & Auto-Tag Tautan
            </Button>
          </div>
        </div>
      )}

      {/* Visual Progress Bar Batch Processing */}
      {progress !== null && (
        <div className='mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20'>
          <div className='mb-1.5 flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200'>
            <span className='flex items-center gap-1.5'>
              <RefreshCw className='h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400' />
              Memproses & Auto-Tagging Dokumen...
            </span>
            <span>{progress}%</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900/60'>
            <div
              className='h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className='mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'>
          <AlertCircle className='h-4 w-4 shrink-0 text-rose-600' />
          <span>{validationError}</span>
        </div>
      )}

      {/* Review List Sementara (Staged Documents) */}
      {stagedItems.length > 0 && (
        <div className='mt-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2.5 dark:border-gray-700'>
            <div className='flex items-center gap-2'>
              <FileCheck2 className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              <span className='text-xs font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200'>
                Daftar Dokumen Draf ({stagedItems.length} Berkas)
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddManualRow}
                className='text-2xs h-7 font-semibold'
              >
                <Plus className='mr-1 h-3 w-3' />
                Tambah Baris Manual
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setStagedItems([])}
                className='text-2xs h-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30'
              >
                <Trash2 className='mr-1 h-3 w-3' />
                Kosongkan
              </Button>
            </div>
          </div>

          {/* Total Quota Saved Banner */}
          {totalSavedBytes > 0 && (
            <div className='flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-emerald-300 bg-emerald-100/80 p-3 shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/40'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                  <Leaf className='h-4 w-4' />
                </div>
                <div>
                  <span className='text-xs font-bold text-emerald-900 dark:text-emerald-100'>
                    Total Hemat Kuota: {formatFileSize(totalSavedBytes)}
                  </span>
                  <span className='ml-1 text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                    ({totalSavedPercent}% kapasitas Google Drive BPS Sitaro
                    berhasil dihemat)
                  </span>
                </div>
              </div>
              <Badge
                variant='default'
                className='bg-emerald-600 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-700'
              >
                Siap Unggah Cepat (Sinyal Sitaro)
              </Badge>
            </div>
          )}

          <div className='space-y-3'>
            {stagedItems.map((item, index) => (
              <div
                key={item.id}
                className='rounded-lg border border-gray-200 bg-white p-3 shadow-2xs transition-all dark:border-gray-700 dark:bg-gray-800'
              >
                <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xs flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                      {index + 1}
                    </span>
                    {item.isAutoTagged && (
                      <Badge
                        variant='outline'
                        className='py-0.2 text-2xs inline-flex items-center gap-1 border-indigo-200 bg-indigo-50/80 px-1.5 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                      >
                        <Sparkles className='h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400' />
                        Auto-Tagged
                      </Badge>
                    )}
                    <Badge
                      variant='outline'
                      className='py-0.2 text-3xs inline-flex items-center gap-1 border-emerald-200 bg-emerald-50/80 px-1.5 font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      title='Pratinjau berkas dilindungi watermark kedinasan resmi BPS Sitaro'
                    >
                      <ShieldCheck className='h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400' />
                      Watermarked
                    </Badge>
                    <span className='text-2xs text-gray-400 dark:text-gray-500'>
                      Sumber:{' '}
                      {item.sourceType === 'file'
                        ? 'Berkas Lokal'
                        : 'Tautan Teks'}
                    </span>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    {item.file_url && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setPreviewDoc({
                            url: item.file_url,
                            title: item.nama_dokumen || 'Dokumen Bukti Dukung',
                            type: item.tipe_dokumen
                          })
                        }
                        className='h-6 gap-1 px-1.5 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50'
                        title='Pratinjau Berkas dengan Watermark Resmi ISO 27001'
                      >
                        <Eye className='h-3 w-3' />
                        <ShieldCheck className='h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400' />
                        <span className='text-3xs hidden font-semibold sm:inline'>
                          Pratinjau DRM
                        </span>
                      </Button>
                    )}
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveStagedItem(item.id)}
                      className='h-6 w-6 text-gray-400 hover:text-rose-600 dark:text-gray-500 dark:hover:text-rose-400'
                      title='Hapus Dokumen'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>

                {/* Badge Kompresi Gambar jika berkas berhasil dikompresi */}
                {item.compressionResult &&
                  item.compressionResult.isCompressed && (
                    <div className='mb-2.5'>
                      <FileCompressionBadge
                        result={item.compressionResult}
                        fileName={item.nama_dokumen}
                      />
                    </div>
                  )}

                <div className='grid grid-cols-1 gap-2.5 md:grid-cols-12'>
                  {/* Nama Dokumen */}
                  <div className='md:col-span-5'>
                    <label className='text-2xs mb-1 block font-semibold text-gray-600 dark:text-gray-400'>
                      Nama / Judul Dokumen{' '}
                      <span className='text-rose-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={item.nama_dokumen}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          'nama_dokumen',
                          e.target.value
                        )
                      }
                      placeholder='Contoh: Notula Rapat Evaluasi Triwulan I'
                      className='w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
                    />
                  </div>

                  {/* Kategori Dokumen (Auto-Tag Select) */}
                  <div className='md:col-span-3'>
                    <label className='text-2xs mb-1 block font-semibold text-gray-600 dark:text-gray-400'>
                      Kategori Dokumen QA
                    </label>
                    <select
                      value={item.tipe_dokumen}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          'tipe_dokumen',
                          e.target.value
                        )
                      }
                      className='w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
                    >
                      {TIPE_DOKUMEN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Dokumen */}
                  <div className='md:col-span-4'>
                    <label className='text-2xs mb-1 block font-semibold text-gray-600 dark:text-gray-400'>
                      Tautan Google Drive (URL){' '}
                      <span className='text-rose-500'>*</span>
                    </label>
                    <input
                      type='url'
                      value={item.file_url}
                      onChange={(e) =>
                        handleUpdateItem(item.id, 'file_url', e.target.value)
                      }
                      placeholder='https://drive.google.com/file/d/...'
                      className='text-2xs w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 font-mono text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Confirmation Buttons */}
          <div className='mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700'>
            <p className='text-2xs text-gray-500 dark:text-gray-400'>
              Dokumen akan ditambahkan sebagai draf bukti dukung dengan status{' '}
              <span className='font-semibold text-amber-600 dark:text-amber-400'>
                Belum Disimpan
              </span>
              .
            </p>

            <div className='flex items-center gap-2'>
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onCancel}
                  className='h-8 text-xs'
                >
                  Batal
                </Button>
              )}
              <Button
                type='button'
                size='sm'
                onClick={handleConfirmBatch}
                className='h-8 bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
              >
                <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
                Konfirmasi & Masukkan ({stagedItems.length} Dokumen)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Dokumen Ber-Watermark */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url}
        title={previewDoc?.title}
        fileType={previewDoc?.type}
        enableWatermark={true}
      />
    </div>
  );
}
