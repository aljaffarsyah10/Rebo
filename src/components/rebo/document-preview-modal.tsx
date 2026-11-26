'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Folder,
  FileSpreadsheet,
  Presentation,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileQuestion,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { getWatermarkStyle } from '@/lib/security/watermark-utils';

export type DocumentCategory =
  | 'image'
  | 'pdf'
  | 'gdrive_file'
  | 'gdrive_folder'
  | 'gdoc'
  | 'gsheet'
  | 'gslide'
  | 'gform'
  | 'web';

export interface DocumentPreviewDetails {
  embedUrl: string;
  originalUrl: string;
  category: DocumentCategory;
  extension: string | null;
  displayType: string;
}

/**
 * Mengonversi URL (terutama Google Drive / Docs / Sheets) menjadi URL pratinjau tertanam (embed).
 */
export function resolveDocumentPreview(
  rawUrl: string,
  fileName?: string | null,
  fileType?: string | null
): DocumentPreviewDetails {
  const url = (rawUrl || '').trim();
  let cleanUrl = url;
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const nameToCheck = (fileName || '').toLowerCase();
  const lowerUrl = cleanUrl.toLowerCase();

  // Ekstraksi ekstensi dari nama file atau URL
  let extension: string | null = null;
  const extMatch = (nameToCheck || lowerUrl).match(
    /\.([a-z0-9]{2,5})(?:[?#]|$)/i
  );
  if (extMatch && extMatch[1]) {
    extension = extMatch[1].toLowerCase();
  }

  // 1. Deteksi file Gambar lokal / langsung
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'svg',
    'gif',
    'bmp',
    'ico'
  ];
  if (extension && imageExtensions.includes(extension)) {
    return {
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      category: 'image',
      extension,
      displayType: fileType || `Gambar (${extension.toUpperCase()})`
    };
  }

  // 2. Deteksi Google Drive / Docs URLs
  let isGoogleDrive = false;
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(cleanUrl);
    const host = parsedUrl.hostname.toLowerCase();
    isGoogleDrive =
      host === 'drive.google.com' ||
      host.endsWith('.drive.google.com') ||
      host === 'docs.google.com' ||
      host.endsWith('.docs.google.com');
  } catch {
    // URL parsing failed
  }

  if (isGoogleDrive && parsedUrl) {
    const pathname = parsedUrl.pathname;

    // A. Folder Google Drive: /folders/ID atau /drive/folders/ID
    const folderMatch = pathname.match(
      /(?:\/u\/\d+)?\/folders\/([a-zA-Z0-9_-]{15,})/
    );
    if (folderMatch && folderMatch[1]) {
      const folderId = folderMatch[1];
      return {
        embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#list`,
        originalUrl: cleanUrl,
        category: 'gdrive_folder',
        extension: null,
        displayType: fileType || 'Folder Google Drive'
      };
    }

    // B. Google Docs: /document/d/ID
    const docMatch = pathname.match(/\/document\/d\/([a-zA-Z0-9_-]{15,})/);
    if (docMatch && docMatch[1]) {
      const docId = docMatch[1];
      return {
        embedUrl: `https://docs.google.com/document/d/${docId}/preview`,
        originalUrl: cleanUrl,
        category: 'gdoc',
        extension: 'gdoc',
        displayType: fileType || 'Google Docs'
      };
    }

    // C. Google Sheets: /spreadsheets/d/ID
    const sheetMatch = pathname.match(
      /\/spreadsheets\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (sheetMatch && sheetMatch[1]) {
      const sheetId = sheetMatch[1];
      return {
        embedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview?widget=true&headers=false`,
        originalUrl: cleanUrl,
        category: 'gsheet',
        extension: 'gsheet',
        displayType: fileType || 'Google Sheets'
      };
    }

    // D. Google Slides: /presentation/d/ID
    const slideMatch = pathname.match(
      /\/presentation\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (slideMatch && slideMatch[1]) {
      const slideId = slideMatch[1];
      return {
        embedUrl: `https://docs.google.com/presentation/d/${slideId}/preview`,
        originalUrl: cleanUrl,
        category: 'gslide',
        extension: 'gslide',
        displayType: fileType || 'Google Slides'
      };
    }

    // E. Google Forms: /forms/d/ID
    const formMatch = pathname.match(
      /\/forms\/(?:d\/e\/|d\/)([a-zA-Z0-9_-]{15,})/
    );
    if (formMatch && formMatch[1]) {
      const formId = formMatch[1];
      return {
        embedUrl: `https://docs.google.com/forms/d/${formId}/viewform?embedded=true`,
        originalUrl: cleanUrl,
        category: 'gform',
        extension: 'gform',
        displayType: fileType || 'Google Form'
      };
    }

    // F. Google Drive File: /file/d/ID
    const fileMatch = pathname.match(
      /(?:\/u\/\d+)?\/file\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (fileMatch && fileMatch[1]) {
      const fileId = fileMatch[1];
      return {
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        originalUrl: cleanUrl,
        category: 'gdrive_file',
        extension: extension || 'drive',
        displayType: fileType || 'Berkas Google Drive'
      };
    }

    // G. Google Drive open?id=ID
    if (parsedUrl.searchParams.has('id')) {
      const paramId = parsedUrl.searchParams.get('id');
      if (paramId && /^[a-zA-Z0-9_-]{15,}$/.test(paramId)) {
        return {
          embedUrl: `https://drive.google.com/file/d/${paramId}/preview`,
          originalUrl: cleanUrl,
          category: 'gdrive_file',
          extension: extension || 'drive',
          displayType: fileType || 'Berkas Google Drive'
        };
      }
    }
  }

  // 3. Deteksi file PDF langsung
  if (extension === 'pdf' || nameToCheck.endsWith('.pdf')) {
    return {
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      category: 'pdf',
      extension: 'pdf',
      displayType: fileType || 'Dokumen PDF'
    };
  }

  // 4. Default URL / Berkas web
  return {
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
    category: 'web',
    extension,
    displayType: fileType || 'Tautan Web / Dokumen'
  };
}

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string | null;
  title?: string | null;
  fileType?: string | null;
  /** Status awal watermark (Default: true) */
  enableWatermark?: boolean;
  /** Tahun periode penilaian ZI (Default: tahun saat ini) */
  watermarkYear?: number | string;
  /** Izinkan tombol toggle watermark ON/OFF (Default: true) */
  allowWatermarkToggle?: boolean;
  /** Identitas pengguna/role yang mengakses (Default: Verifikator ZI) */
  userRole?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  url,
  title,
  fileType,
  enableWatermark = true,
  watermarkYear,
  allowWatermarkToggle = true,
  userRole
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isWatermarkActive, setIsWatermarkActive] = useState(enableWatermark);

  // Reset controls whenever URL changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsLoading(true);
      setHasError(false);
      setIsWatermarkActive(enableWatermark);
    }
  }, [isOpen, url, enableWatermark]);

  const previewInfo = useMemo(() => {
    if (!url) return null;
    return resolveDocumentPreview(url, title, fileType);
  }, [url, title, fileType]);

  // Siapkan CSS Watermark Style
  const watermarkStyle = useMemo(() => {
    if (!isWatermarkActive) return {};
    return getWatermarkStyle({
      tahun: watermarkYear,
      userIdentifier: userRole || 'Akses Verifikator ZI BPS Sitaro',
      opacity: 0.14
    });
  }, [isWatermarkActive, watermarkYear, userRole]);

  if (!url || !previewInfo) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Icon & Badge resolution
  const renderCategoryIcon = () => {
    switch (previewInfo.category) {
      case 'image':
        return (
          <ImageIcon className='h-5 w-5 text-purple-600 dark:text-purple-400' />
        );
      case 'pdf':
        return (
          <FileText className='h-5 w-5 text-rose-600 dark:text-rose-400' />
        );
      case 'gdrive_folder':
        return (
          <Folder className='h-5 w-5 text-amber-500 dark:text-amber-400' />
        );
      case 'gsheet':
        return (
          <FileSpreadsheet className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
        );
      case 'gslide':
        return (
          <Presentation className='h-5 w-5 text-orange-500 dark:text-orange-400' />
        );
      case 'gdoc':
      case 'gdrive_file':
        return (
          <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        );
      case 'gform':
        return (
          <Layers className='h-5 w-5 text-violet-600 dark:text-violet-400' />
        );
      default:
        return (
          <FileQuestion className='h-5 w-5 text-slate-500 dark:text-slate-400' />
        );
    }
  };

  const getBadgeVariant = () => {
    switch (previewInfo.category) {
      case 'image':
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'pdf':
        return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'gdrive_folder':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'gsheet':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'gslide':
        return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300';
      case 'gdoc':
      case 'gdrive_file':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300';
      default:
        return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='fixed top-[50%] left-[50%] z-50 flex h-[90dvh] max-h-[92dvh] w-[95vw] translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl sm:max-w-5xl dark:border-slate-800 dark:bg-slate-900'>
        {/* Header Modal */}
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-3.5 dark:border-slate-800'>
          <div className='flex min-w-0 items-center gap-3 pr-4'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800'>
              {renderCategoryIcon()}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <DialogTitle className='truncate text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100'>
                  {title || 'Pratinjau Dokumen'}
                </DialogTitle>
                <span
                  className={`text-3xs inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-semibold ${getBadgeVariant()}`}
                >
                  {previewInfo.displayType}
                </span>

                {/* Badge Pengaman Watermark ISO 27001 */}
                {isWatermarkActive && (
                  <span
                    className='text-3xs hidden items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 shadow-2xs md:inline-flex dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    title='Dokumen dilindungi watermark kedinasan resmi anti-kebocoran sesuai ISO 27001'
                  >
                    <ShieldCheck className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                    Dilindungi Watermark Kedinasan (ISO 27001)
                  </span>
                )}
              </div>
              <DialogDescription className='text-2xs mt-0.5 truncate text-slate-500 dark:text-slate-400'>
                {previewInfo.originalUrl}
              </DialogDescription>
            </div>
          </div>

          <div className='flex items-center gap-2 pr-8'>
            {/* Toggle Watermark ON/OFF */}
            {allowWatermarkToggle && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsWatermarkActive((prev) => !prev)}
                className={`inline-flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:min-h-[30px] ${
                  isWatermarkActive
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
                    : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
                title={
                  isWatermarkActive
                    ? 'Klik untuk nonaktifkan Watermark (Mode Verifikator/Admin)'
                    : 'Klik untuk aktifkan Watermark Kedinasan'
                }
              >
                {isWatermarkActive ? (
                  <>
                    <ShieldCheck className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    <span className='hidden sm:inline'>Watermark</span>
                    <span className='text-3xs py-0.2 rounded bg-emerald-200/80 px-1 font-bold text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200'>
                      ON
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className='h-3.5 w-3.5 text-slate-400' />
                    <span className='hidden sm:inline'>Watermark</span>
                    <span className='text-3xs py-0.2 rounded bg-slate-200 px-1 font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300'>
                      OFF
                    </span>
                  </>
                )}
              </Button>
            )}

            <a
              href={previewInfo.originalUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:min-h-[30px] sm:px-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              title='Buka tautan asli di tab browser baru'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Buka di Tab Baru</span>
            </a>
          </div>
        </div>

        {/* Toolbar untuk Gambar */}
        {previewInfo.category === 'image' && (
          <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'>
            <span className='font-medium'>
              Perbesaran: {Math.round(zoom * 100)}%
            </span>
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 min-h-[32px] w-8 min-w-[32px] touch-manipulation sm:h-7 sm:min-h-[28px] sm:w-7 sm:min-w-[28px]'
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                title='Perkecil'
              >
                <ZoomOut className='h-3.5 w-3.5' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 min-h-[32px] w-8 min-w-[32px] touch-manipulation sm:h-7 sm:min-h-[28px] sm:w-7 sm:min-w-[28px]'
                onClick={handleResetZoom}
                title='Reset Skala'
              >
                <RefreshCw className='h-3.5 w-3.5' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 min-h-[32px] w-8 min-w-[32px] touch-manipulation sm:h-7 sm:min-h-[28px] sm:w-7 sm:min-w-[28px]'
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                title='Perbesar'
              >
                <ZoomIn className='h-3.5 w-3.5' />
              </Button>
              <div className='mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700' />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 min-h-[32px] w-8 min-w-[32px] touch-manipulation sm:h-7 sm:min-h-[28px] sm:w-7 sm:min-w-[28px]'
                onClick={handleRotate}
                title='Putar 90°'
              >
                <RotateCw className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        )}

        {/* Modal Main Content Canvas */}
        <div className='relative flex-1 overflow-auto bg-slate-900/5 dark:bg-slate-950'>
          {/* Loading Indicator */}
          {isLoading && !hasError && (
            <div className='backdrop-blur-2xs absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/75 dark:bg-slate-900/75'>
              <Loader2 className='h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400' />
              <p className='text-xs font-medium text-slate-600 dark:text-slate-300'>
                Memuat pratinjau dokumen...
              </p>
            </div>
          )}

          {/* Fallback Jika Error */}
          {hasError && (
            <div className='flex h-full w-full flex-col items-center justify-center p-8 text-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'>
                <AlertCircle className='h-6 w-6' />
              </div>
              <h4 className='mt-3 text-sm font-bold text-slate-900 dark:text-slate-100'>
                Pratinjau Tidak Dapat Ditampilkan
              </h4>
              <p className='mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400'>
                Tautan mungkin memerlukan izin login Google Drive khusus, atau
                server dokumen menolak disematkan di dalam aplikasi.
              </p>
              <a
                href={previewInfo.originalUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
              >
                <ExternalLink className='h-3.5 w-3.5' />
                <span>Buka Dokumen di Tab Baru</span>
              </a>
            </div>
          )}

          {/* 1. Tampilan Gambar */}
          {previewInfo.category === 'image' && !hasError && (
            <div className='flex min-h-full w-full items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-4 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewInfo.embedUrl}
                alt={title || 'Pratinjau Dokumen'}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className='max-h-[75vh] max-w-full rounded-md object-contain shadow-lg ring-1 ring-slate-900/10'
              />
            </div>
          )}

          {/* 2. Tampilan Dokumen / PDF / Google Drive via Iframe */}
          {previewInfo.category !== 'image' && !hasError && (
            <iframe
              src={previewInfo.embedUrl}
              title={title || 'Pratinjau Dokumen'}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className='h-full w-full border-0 bg-white dark:bg-slate-900'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          )}

          {/* Overlay Watermark Kedinasan Semi-Transparan (DRM ISO 27001) */}
          {isWatermarkActive && !hasError && (
            <div
              className='pointer-events-none absolute inset-0 z-20 select-none'
              style={watermarkStyle}
              aria-hidden='true'
            />
          )}

          {/* Stempel Pengaman DRM di Sudut Bawah */}
          {isWatermarkActive && !hasError && (
            <div className='pointer-events-none absolute right-3 bottom-3 z-30 select-none'>
              <div className='text-3xs flex items-center gap-1.5 rounded-md border border-slate-300/80 bg-white/90 px-2.5 py-1 font-medium text-slate-700 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-300'>
                <Lock className='h-2.5 w-2.5 text-amber-600 dark:text-amber-400' />
                <span>REBO DRM SHIELD • ISO 27001 BPS SITARO</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Fallback Banner Informatif */}
        <div className='text-2xs flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400'>
          <div className='flex items-center gap-1.5'>
            <AlertCircle className='h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500' />
            <span>
              Pratinjau diberi watermark otomatis kedinasan (ISO 27001) untuk
              mencegah kebocoran berkas. Jika dokumen kosong, buka via tab baru.
            </span>
          </div>

          <a
            href={previewInfo.originalUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400'
          >
            <span>Buka Langsung ({previewInfo.displayType})</span>
            <ExternalLink className='h-2.5 w-2.5' />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
