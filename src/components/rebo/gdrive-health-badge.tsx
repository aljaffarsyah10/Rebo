'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkGDriveHealthAction } from '@/actions/gdrive-actions';
import type {
  GDriveHealthCheckResult,
  GDriveHealthStatus
} from '@/lib/gdrive/health-checker';
import { toast } from 'sonner';

interface GDriveHealthBadgeProps {
  status?: GDriveHealthStatus;
  message?: string;
  statusCode?: number;
  compact?: boolean;
  className?: string;
}

export function GDriveHealthBadge({
  status,
  message,
  compact = false,
  className = ''
}: GDriveHealthBadgeProps) {
  if (!status) return null;

  switch (status) {
    case 'PUBLIC':
      return (
        <span
          title={message || 'Akses Terbuka (Anyone with link)'}
          className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ${
            compact ? 'text-3xs px-2 py-0.5' : 'text-2xs px-2.5 py-1'
          } ${className}`}
        >
          <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
          <span>Akses Terbuka (Anyone with link)</span>
        </span>
      );

    case 'RESTRICTED':
      return (
        <span
          title={
            message ||
            'Izin Terkunci (Restricted) - Harap ubah ke Siapa saja yang memiliki link'
          }
          className={`inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ${
            compact ? 'text-3xs px-2 py-0.5' : 'text-2xs px-2.5 py-1'
          } ${className}`}
        >
          <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400' />
          <span>
            {compact
              ? 'Izin Terkunci (Restricted)'
              : 'Izin Terkunci (Restricted) - Harap ubah ke Siapa saja yang memiliki link'}
          </span>
        </span>
      );

    case 'INVALID':
      return (
        <span
          title={message || 'Tautan tidak ditemukan atau bukan Google Drive'}
          className={`inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 ${
            compact ? 'text-3xs px-2 py-0.5' : 'text-2xs px-2.5 py-1'
          } ${className}`}
        >
          <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400' />
          <span>Link Tidak Valid (404/Format Salah)</span>
        </span>
      );

    case 'ERROR':
    default:
      return (
        <span
          title={message || 'Gagal memeriksa status tautan'}
          className={`inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-100 font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${
            compact ? 'text-3xs px-2 py-0.5' : 'text-2xs px-2.5 py-1'
          } ${className}`}
        >
          <AlertCircle className='h-3.5 w-3.5 shrink-0 text-gray-500' />
          <span>Gagal Uji Akses (Network Error)</span>
        </span>
      );
  }
}

interface GDriveHealthButtonProps {
  url: string;
  label?: string;
  currentResult?: GDriveHealthCheckResult | null;
  onResult?: (result: GDriveHealthCheckResult) => void;
  size?: 'sm' | 'xs';
  showBadge?: boolean;
  compactBadge?: boolean;
}

export function GDriveHealthButton({
  url,
  label = 'Periksa Izin Akses',
  currentResult,
  onResult,
  size = 'xs',
  showBadge = true,
  compactBadge = false
}: GDriveHealthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GDriveHealthCheckResult | null>(
    currentResult || null
  );

  const handleCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!url || !url.trim()) {
      toast.error('Masukkan URL Google Drive terlebih dahulu.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Menguji izin akses Google Drive...');

    try {
      const res = await checkGDriveHealthAction(url.trim());
      if (res.success && res.result) {
        setResult(res.result);
        if (onResult) onResult(res.result);

        if (res.result.status === 'PUBLIC') {
          toast.success(
            'Link Terbuka: Dapat diakses oleh siapa saja dengan link!',
            { id: toastId }
          );
        } else if (res.result.status === 'RESTRICTED') {
          toast.warning(
            'Izin Terkunci (Restricted): Dokumen memerlukan login Google. Harap ubah setelan akses menjadi "Siapa saja yang memiliki link".',
            { id: toastId, duration: 6000 }
          );
        } else if (res.result.status === 'INVALID') {
          toast.error(
            res.result.message || 'Tautan Google Drive tidak valid/ditemukan.',
            { id: toastId }
          );
        } else {
          toast.error(res.result.message || 'Gagal menghubungi Google Drive.', {
            id: toastId
          });
        }
      } else {
        toast.error(res.error || 'Gagal memeriksa izin akses.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem saat pengujian.', {
        id: toastId
      });
    } finally {
      setLoading(false);
    }
  };

  const activeResult = currentResult !== undefined ? currentResult : result;

  return (
    <div className='inline-flex flex-wrap items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={loading || !url}
        onClick={handleCheck}
        className={`font-medium transition-all ${
          size === 'xs' ? 'text-2xs h-7 px-2.5' : 'h-8 px-3 text-xs'
        } ${
          activeResult?.status === 'PUBLIC'
            ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
            : activeResult?.status === 'RESTRICTED'
              ? 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40'
              : 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40'
        }`}
        title='Periksa apakah berkas/folder dapat diakses tanpa login (Anyone with the link)'
      >
        {loading ? (
          <>
            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin text-blue-600' />
            <span>Memeriksa...</span>
          </>
        ) : (
          <>
            <ShieldCheck className='mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
            <span>{label}</span>
          </>
        )}
      </Button>

      {showBadge && activeResult && (
        <GDriveHealthBadge
          status={activeResult.status}
          message={activeResult.message}
          statusCode={activeResult.statusCode}
          compact={compactBadge}
        />
      )}
    </div>
  );
}
