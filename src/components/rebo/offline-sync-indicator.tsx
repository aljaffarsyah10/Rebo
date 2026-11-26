'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isOnline,
  addConnectivityListener,
  subscribeDraftChanges,
  getAllOfflineDrafts,
  syncAllOfflineDrafts
} from '@/lib/offline/offline-draft-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OfflineSyncIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function OfflineSyncIndicator({
  className = '',
  compact = false
}: OfflineSyncIndicatorProps) {
  const [online, setOnline] = useState<boolean>(true);
  const [draftCount, setDraftCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Inisialisasi status koneksi & draft listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setOnline(isOnline());

    const removeConnListener = addConnectivityListener((status) => {
      setOnline(status);
      if (status) {
        toast.success(
          'Koneksi internet terhubung kembali. Memeriksa draf offline...'
        );
      } else {
        toast.warning(
          'Koneksi terputus! Mode Offline aktif: isian form akan disimpan otomatis di IndexedDB.'
        );
      }
    });

    const removeDraftListener = subscribeDraftChanges((items) => {
      setDraftCount(items.length);
    });

    // Ambil hitungan awal
    getAllOfflineDrafts().then((items) => {
      setDraftCount(items.length);
    });

    const handleSyncComplete = (event: any) => {
      const detail = event.detail;
      if (detail && detail.synced > 0) {
        toast.success(
          `${detail.synced} draf LKE berhasil disinkronkan ke server cloud.`
        );
        setLastSyncTime(
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        );
      }
      setIsSyncing(false);
    };

    window.addEventListener('rebo:offline-sync-completed', handleSyncComplete);

    return () => {
      removeConnListener();
      removeDraftListener();
      window.removeEventListener(
        'rebo:offline-sync-completed',
        handleSyncComplete
      );
    };
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!online) {
      toast.error('Tidak dapat menyinkronkan: Perangkat Anda sedang offline.');
      return;
    }
    if (draftCount === 0) {
      toast.info('Semua data LKE telah tersinkronisasi ke server.');
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading(
      `Menyinkronkan ${draftCount} draf LKE ke server...`
    );

    try {
      const res = await syncAllOfflineDrafts();
      if (res.synced > 0) {
        toast.success(
          `Sinkronisasi tuntas: ${res.synced} draf berhasil diunggah!`,
          { id: toastId }
        );
        setLastSyncTime(
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        );
      } else if (res.failed > 0) {
        toast.warning(
          `Sebagian draf gagal disinkronkan: ${res.errors.join(', ')}`,
          { id: toastId, duration: 6000 }
        );
      } else {
        toast.info('Tidak ada draf yang perlu diperbarui.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memproses sinkronisasi draf.', {
        id: toastId
      });
    } finally {
      setIsSyncing(false);
    }
  }, [online, draftCount]);

  // Mode Compact (untuk disematkan di sticky bar atau header kecil)
  if (compact) {
    if (!online) {
      return (
        <div
          className={`text-2xs inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 shadow-xs dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 ${className}`}
          title='Mode Offline: Koneksi internet terputus. Isian tersimpan di IndexedDB browser lokal.'
        >
          <WifiOff className='h-3 w-3 animate-pulse text-amber-600 dark:text-amber-400' />
          <span>Offline</span>
          {draftCount > 0 && (
            <Badge
              variant='secondary'
              className='text-3xs h-4 bg-amber-200/80 px-1 font-black text-amber-900 dark:bg-amber-800 dark:text-amber-100'
            >
              {draftCount}
            </Badge>
          )}
        </div>
      );
    }

    return (
      <div
        className={`text-2xs inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 font-medium text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 ${className}`}
      >
        <Cloud className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
        <span>Online</span>
        {draftCount > 0 && (
          <button
            type='button'
            onClick={handleManualSync}
            disabled={isSyncing}
            className='text-3xs ml-1 inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 font-bold text-white transition-colors hover:bg-emerald-700'
            title='Klik untuk menyinkronkan draf lokal ke server'
          >
            <RefreshCw
              className={`h-2.5 w-2.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>Sinkron ({draftCount})</span>
          </button>
        )}
      </div>
    );
  }

  // Mode Default / Full Header Badge
  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-xs ${className}`}
      aria-label='Status Koneksi & Sinkronisasi Draf Offline'
    >
      {/* 1. Status Koneksi Jaringan */}
      {!online ? (
        <div className='flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/95 px-3 py-1.5 font-medium text-amber-900 shadow-xs dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-200'>
          <WifiOff className='h-4 w-4 animate-pulse text-amber-600 dark:text-amber-400' />
          <div>
            <span className='font-bold'>Mode Offline</span>
            <span className='hidden sm:inline'>
              {' '}
              — Draf Tersimpan Lokal (IndexedDB)
            </span>
          </div>
          {draftCount > 0 && (
            <Badge
              variant='outline'
              className='text-2xs ml-1 border-amber-400 bg-amber-200/80 font-extrabold text-amber-950 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100'
            >
              {draftCount} Draf Pending
            </Badge>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-emerald-800 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'>
          <div className='flex items-center gap-1.5 font-medium'>
            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            <span>Koneksi Online</span>
          </div>

          {draftCount > 0 ? (
            <div className='flex items-center gap-2 border-l border-emerald-300/80 pl-2 dark:border-emerald-800'>
              <span className='text-2xs text-emerald-700 dark:text-emerald-400'>
                <strong>{draftCount}</strong> draf lokal
              </span>
              <Button
                type='button'
                size='sm'
                variant='default'
                onClick={handleManualSync}
                disabled={isSyncing}
                className='text-2xs h-6 rounded-lg bg-emerald-600 px-2.5 font-bold text-white shadow-xs hover:bg-emerald-700'
              >
                <RefreshCw
                  className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
                />
                {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
              </Button>
            </div>
          ) : (
            <span className='text-2xs text-emerald-600/80 dark:text-emerald-400/80'>
              {lastSyncTime
                ? `Tersinkron pukul ${lastSyncTime}`
                : 'Semua data tersinkron'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default OfflineSyncIndicator;
