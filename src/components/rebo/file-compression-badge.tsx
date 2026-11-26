'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Leaf,
  ArrowRight,
  Eye,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  formatFileSize,
  type CompressionResult
} from '@/lib/compression/client-compressor';

export interface FileCompressionBadgeProps {
  result?: CompressionResult | null;
  originalSize?: number;
  compressedSize?: number;
  showPreviewButton?: boolean;
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
  fileName?: string;
}

export function FileCompressionBadge({
  result,
  originalSize: propOriginalSize,
  compressedSize: propCompressedSize,
  showPreviewButton = true,
  variant = 'full',
  className = ''
}: FileCompressionBadgeProps) {
  const [openComparison, setOpenComparison] = useState(false);

  const origSize = result ? result.originalSize : (propOriginalSize ?? 0);
  const compSize = result
    ? result.compressedSize
    : (propCompressedSize ?? origSize);

  if (origSize <= 0 || compSize <= 0 || origSize <= compSize) {
    return null;
  }

  const savedBytes = origSize - compSize;
  const savedPercent =
    result?.savedPercent ??
    parseFloat(((savedBytes / origSize) * 100).toFixed(1));

  // Mode Compact: Cocok untuk chip kecil di samping nama file
  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ${className}`}
        title={`Ukuran asli: ${formatFileSize(origSize)}, terkompresi menjadi ${formatFileSize(compSize)}`}
      >
        <Zap className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
        <span>
          Hemat {savedPercent}% ({formatFileSize(compSize)})
        </span>
      </span>
    );
  }

  // Mode Inline: Simpel teks 1 baris
  if (variant === 'inline') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 ${className}`}
      >
        <Leaf className='h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
        <span className='font-medium'>
          Terkonversi: {formatFileSize(origSize)} ➔ {formatFileSize(compSize)}
        </span>
        <Badge
          variant='secondary'
          className='border-emerald-200 bg-emerald-100/80 px-1.5 py-0 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
        >
          Hemat {savedPercent}%
        </Badge>
      </div>
    );
  }

  // Mode Full: Chip elegan dengan opsi dialog pembanding Sebelum vs Sesudah
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200/90 bg-emerald-50/70 px-2.5 py-1.5 text-xs text-emerald-800 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200 ${className}`}
    >
      <div className='flex items-center gap-1.5'>
        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/70 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'>
          <Sparkles className='h-3 w-3' />
        </div>
        <span className='font-semibold'>
          Terkonversi: {formatFileSize(origSize)}
        </span>
        <ArrowRight className='h-3 w-3 text-emerald-600 opacity-70 dark:text-emerald-400' />
        <span className='font-bold text-emerald-900 dark:text-emerald-100'>
          {formatFileSize(compSize)}
        </span>
      </div>

      <Badge
        variant='outline'
        className='border-emerald-300 bg-emerald-100/90 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
      >
        Hemat {savedPercent}%
      </Badge>

      {showPreviewButton &&
        result?.originalPreviewUrl &&
        result?.previewUrl && (
          <Dialog open={openComparison} onOpenChange={setOpenComparison}>
            <DialogTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-6 gap-1 px-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100'
              >
                <Eye className='h-3 w-3' />
                <span>Bandingkan</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-3xl sm:max-w-4xl'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100'>
                  <Sparkles className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                  <span>
                    Pratinjau Kompresi Berkas Citra & Dokumen Pindaian
                  </span>
                </DialogTitle>
                <DialogDescription className='text-xs text-gray-500 dark:text-gray-400'>
                  Perbandingan kualitas visual dan penghematan ukuran data
                  sebelum diunggah ke Google Drive BPS Sitaro.
                </DialogDescription>
              </DialogHeader>

              {/* Statistik Ringkas */}
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-center dark:border-gray-700 dark:bg-gray-800/60'>
                  <span className='text-[10px] font-semibold text-gray-500 uppercase dark:text-gray-400'>
                    Ukuran Asli
                  </span>
                  <p className='mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-200'>
                    {formatFileSize(result.originalSize)}
                  </p>
                  {result.originalDimensions.width > 0 && (
                    <span className='text-[10px] text-gray-400'>
                      {result.originalDimensions.width} ×{' '}
                      {result.originalDimensions.height} px
                    </span>
                  )}
                </div>

                <div className='rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-center dark:border-emerald-800 dark:bg-emerald-950/40'>
                  <span className='text-[10px] font-semibold text-emerald-700 uppercase dark:text-emerald-300'>
                    Setelah Kompresi
                  </span>
                  <p className='mt-0.5 text-sm font-bold text-emerald-700 dark:text-emerald-300'>
                    {formatFileSize(result.compressedSize)}
                  </p>
                  {result.compressedDimensions.width > 0 && (
                    <span className='text-[10px] text-emerald-600/80 dark:text-emerald-400'>
                      {result.compressedDimensions.width} ×{' '}
                      {result.compressedDimensions.height} px
                    </span>
                  )}
                </div>

                <div className='rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-center dark:border-emerald-800 dark:bg-emerald-950/40'>
                  <span className='text-[10px] font-semibold text-emerald-700 uppercase dark:text-emerald-300'>
                    Total Hemat Kuota
                  </span>
                  <p className='mt-0.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-300'>
                    {formatFileSize(result.savingsBytes)}
                  </p>
                  <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                    Hemat {result.savedPercent}%
                  </span>
                </div>

                <div className='rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-center dark:border-gray-700 dark:bg-gray-800/60'>
                  <span className='text-[10px] font-semibold text-gray-500 uppercase dark:text-gray-400'>
                    Waktu Proses Browser
                  </span>
                  <p className='mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-200'>
                    {result.durationMs} ms
                  </p>
                  <span className='text-[10px] text-gray-400'>
                    Client Canvas API
                  </span>
                </div>
              </div>

              {/* Perbandingan Gambar Side-by-Side */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Sisi Kiri: Original */}
                <div className='overflow-hidden rounded-xl border border-gray-200 bg-gray-100/80 dark:border-gray-700 dark:bg-gray-800/50'>
                  <div className='flex items-center justify-between border-b border-gray-200 bg-gray-200/60 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                    <span className='flex items-center gap-1.5'>
                      <ImageIcon className='h-3.5 w-3.5 text-gray-500' />
                      Sebelum Kompresi (Asli)
                    </span>
                    <Badge
                      variant='outline'
                      className='text-[10px] font-normal'
                    >
                      {formatFileSize(result.originalSize)}
                    </Badge>
                  </div>
                  <div className='relative flex max-h-[360px] min-h-[220px] items-center justify-center overflow-auto p-2'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.originalPreviewUrl}
                      alt='Foto asli sebelum kompresi'
                      className='max-h-[340px] w-auto max-w-full rounded-md object-contain shadow-xs'
                    />
                  </div>
                </div>

                {/* Sisi Kanan: Compressed */}
                <div className='overflow-hidden rounded-xl border border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'>
                  <div className='flex items-center justify-between border-b border-emerald-200 bg-emerald-100/70 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'>
                    <span className='flex items-center gap-1.5'>
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                      Setelah Kompresi (Siap Upload)
                    </span>
                    <Badge
                      variant='outline'
                      className='border-emerald-300 bg-emerald-200/80 text-[10px] font-bold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100'
                    >
                      {formatFileSize(result.compressedSize)}
                    </Badge>
                  </div>
                  <div className='relative flex max-h-[360px] min-h-[220px] items-center justify-center overflow-auto p-2'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.previewUrl}
                      alt='Foto hasil kompresi siap upload'
                      className='max-h-[340px] w-auto max-w-full rounded-md object-contain shadow-xs'
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Keterbacaan & Ketahanan Koneksi Kepulauan */}
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300'>
                <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                <div>
                  <p className='font-semibold'>
                    Ketajaman & Keterbacaan Naskah Terjaga
                  </p>
                  <p className='mt-0.5 text-blue-700/90 dark:text-blue-300/90'>
                    Engine mempertahankan rasio aspek foto dan resolusi hingga
                    1920px sehingga stempel, tanda tangan, dan teks naskah dinas
                    tetap dapat diaudit oleh TPI/TPN, sementara transfer data
                    menjadi jauh lebih ringan.
                  </p>
                </div>
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setOpenComparison(false)}
                  className='text-xs'
                >
                  Tutup Pratinjau
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
    </div>
  );
}
