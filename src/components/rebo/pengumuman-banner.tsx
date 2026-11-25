'use client';

import React, { useState, useEffect } from 'react';
import {
  type PengumumanBroadcast,
  BROADCAST_TIPE_CONFIG
} from '@/lib/broadcast/broadcast-types';
import { getActiveBannerPengumumanAction } from '@/actions/broadcast-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Megaphone,
  AlertTriangle,
  Clock,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface PengumumanBannerProps {
  initialData?: PengumumanBroadcast | null;
}

export function PengumumanBanner({ initialData }: PengumumanBannerProps) {
  const [pengumuman, setPengumuman] = useState<PengumumanBroadcast | null>(
    initialData ?? null
  );
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    // Cek sessionStorage apakah banner ini sudah di-dismiss oleh pengguna dalam sesi ini
    async function loadBanner() {
      try {
        const res = await getActiveBannerPengumumanAction();
        if (res.success && res.data) {
          const dismissedId = sessionStorage.getItem(
            `rebo_dismissed_banner_${res.data.id}`
          );
          if (dismissedId === 'true') {
            setIsDismissed(true);
          }
          setPengumuman(res.data);
        } else {
          setPengumuman(null);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }

    if (!initialData) {
      loadBanner();
    } else {
      const dismissedId = sessionStorage.getItem(
        `rebo_dismissed_banner_${initialData.id}`
      );
      if (dismissedId === 'true') {
        setIsDismissed(true);
      }
    }
  }, [initialData]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (pengumuman) {
      sessionStorage.setItem(`rebo_dismissed_banner_${pengumuman.id}`, 'true');
    }
  };

  if (loading || isDismissed || !pengumuman || !pengumuman.is_active_banner) {
    return null;
  }

  const tipeMeta =
    BROADCAST_TIPE_CONFIG[pengumuman.tipe] ||
    BROADCAST_TIPE_CONFIG.ARAHAN_PIMPINAN;

  const renderIcon = () => {
    switch (tipeMeta.iconName) {
      case 'alert':
        return (
          <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
        );
      case 'clock':
        return <Clock className='h-5 w-5 text-amber-600 dark:text-amber-400' />;
      case 'info':
        return (
          <Info className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
        );
      case 'megaphone':
      default:
        return (
          <Megaphone className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        );
    }
  };

  const formattedTgl = new Date(pengumuman.berlaku_sampai).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );

  return (
    <>
      <div
        role='alert'
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all md:p-5 ${tipeMeta.bannerBgClass} ${tipeMeta.bannerBorderClass}`}
      >
        {/* Glow ambient accent */}
        <div className='pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/40 blur-2xl dark:bg-white/5' />

        <div className='relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          {/* Kolom Kiri: Ikon, Badge, Judul & Snippet */}
          <div className='flex items-start gap-3.5'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-xs backdrop-blur-xs dark:bg-slate-900/80'>
              {renderIcon()}
            </div>

            <div className='space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className={`text-[11px] font-semibold tracking-wide uppercase ${tipeMeta.badgeClass}`}
                >
                  <Sparkles className='mr-1 h-3 w-3' />
                  {tipeMeta.label}
                </Badge>

                <span className='inline-flex items-center text-xs text-slate-500 dark:text-slate-400'>
                  <Calendar className='mr-1 h-3.5 w-3.5' />
                  Berlaku s.d. {formattedTgl}
                </span>

                <span className='inline-flex items-center text-xs font-medium text-slate-700 dark:text-slate-300'>
                  <UserCheck className='mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  {pengumuman.pengirim_nama}
                </span>
              </div>

              <h2
                className={`text-sm font-bold md:text-base ${tipeMeta.bannerTextClass}`}
              >
                {pengumuman.judul}
              </h2>

              <p className='line-clamp-2 text-xs leading-relaxed text-slate-700 md:text-sm dark:text-slate-300'>
                {pengumuman.isi_pesan}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Tombol Aksi & Dismiss */}
          <div className='flex items-center justify-end gap-2 pt-1 md:pt-0'>
            <Button
              size='sm'
              variant='default'
              className='h-8.5 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              onClick={() => setIsOpenDialog(true)}
            >
              <span>Baca Arahan Lengkap</span>
              <ChevronRight className='ml-1 h-3.5 w-3.5' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              className='h-8 w-8 rounded-full text-slate-400 hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200'
              title='Sembunyikan Pengumuman'
              onClick={handleDismiss}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Tutup</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog Baca Arahan Lengkap */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className='max-w-2xl rounded-2xl'>
          <DialogHeader className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className={`text-xs font-semibold tracking-wide uppercase ${tipeMeta.badgeClass}`}
              >
                {tipeMeta.label}
              </Badge>
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                Batas Tindak Lanjut: {formattedTgl}
              </span>
            </div>
            <DialogTitle className='text-lg leading-snug font-bold text-slate-900 md:text-xl dark:text-slate-100'>
              {pengumuman.judul}
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              Diterbitkan secara resmi oleh pimpinan BPS Kabupaten Kepulauan
              Sitaro
            </DialogDescription>
          </DialogHeader>

          {/* Profil Pengirim */}
          <div className='flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
              {pengumuman.pengirim_nama.charAt(0)}
            </div>
            <div className='space-y-0.5 text-xs'>
              <div className='font-semibold text-slate-800 dark:text-slate-200'>
                {pengumuman.pengirim_nama}
              </div>
              <div className='text-slate-500 dark:text-slate-400'>
                {pengumuman.pengirim_jabatan}
              </div>
            </div>
          </div>

          {/* Isi Lengkap Pesan */}
          <div className='max-h-[50vh] overflow-y-auto rounded-xl border border-slate-100 bg-white p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-800 md:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'>
            {pengumuman.isi_pesan}
          </div>

          <DialogFooter className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <Link
              href='/rebo/admin/broadcast'
              className='inline-flex items-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
              onClick={() => setIsOpenDialog(false)}
            >
              <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
              Kelola di Manajemen Broadcast Admin
            </Link>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsOpenDialog(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
