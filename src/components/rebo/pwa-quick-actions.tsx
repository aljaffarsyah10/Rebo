'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  X,
  UploadCloud,
  Columns3,
  BarChart3,
  ShieldAlert,
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface QuickActionItem {
  id: string;
  title: string;
  shortName: string;
  description: string;
  url: string;
  icon: React.ElementType;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel?: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'upload-bukti',
    title: 'Upload Bukti Cepat',
    shortName: 'Upload Bukti',
    description: 'Unggah berkas bukti dukung LKE ZI',
    url: '/rebo/formRB?quick=upload',
    icon: UploadCloud,
    gradient: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
    badgeText: 'text-sky-600 dark:text-sky-400',
    badgeLabel: 'Cepat'
  },
  {
    id: 'kanban-tasks',
    title: 'Tugas Kanban Saya',
    shortName: 'Buka Kanban',
    description: 'Daftar tindak lanjut & revisi bukti',
    url: '/rebo/kanban',
    icon: Columns3,
    gradient: 'from-indigo-500 to-violet-600',
    badgeBg:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    badgeLabel: 'Kanban'
  },
  {
    id: 'status-indikator',
    title: 'Cek Status Indikator Saya',
    shortName: 'Status Saya',
    description: 'Pantau status capaian & indikator ZI',
    url: '/rebo/overview?filter=my-tasks',
    icon: BarChart3,
    gradient: 'from-teal-500 to-emerald-600',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300',
    badgeText: 'text-teal-600 dark:text-teal-400',
    badgeLabel: 'LKE'
  },
  {
    id: 'wbs-pengaduan',
    title: 'Kanal Pengaduan WBS',
    shortName: 'Lapor WBS',
    description: 'Whistleblowing System BPS Sitaro',
    url: '/rebo/wbs',
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeLabel: 'Rahasia'
  }
];

export function PWAQuickActions() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Deteksi status PWA & beforeinstallprompt listener
  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') return;

    // Cek apakah sudah berjalan dalam standalone mode (sudah diinstall)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true;
      setIsInstalled(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Deteksi perangkat iOS/iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' &&
        window.navigator.maxTouchPoints > 1);
    setIsIOS(isAppleDevice);

    // Tangkap event sebelum instalasi PWA di Android / Chromium browser
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Tangkap event saat aplikasi selesai diinstall
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success(
        'Aplikasi REBO V2 berhasil dipasang ke layar beranda ponsel Anda!',
        {
          description:
            'Akses cepat shortcuts kini tersedia dengan menekan lama ikon aplikasi.',
          duration: 5000
        }
      );
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Escape key listener untuk menutup dial
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Haptic feedback ringan jika didukung browser
  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Abaikan jika tidak diizinkan
      }
    }
  }, []);

  const toggleDial = useCallback(() => {
    triggerHaptic();
    setIsOpen((prev) => !prev);
  }, [triggerHaptic]);

  // Handler instalasi aplikasi
  const handleInstallClick = async () => {
    triggerHaptic();
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          toast.success('Memasang aplikasi REBO V2...');
          setIsInstalled(true);
          setInstallPrompt(null);
        } else {
          toast.info('Instalasi dibatalkan oleh pengguna.');
        }
      } catch (err) {
        console.error('Error saat instalasi PWA:', err);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      toast.info('Aplikasi REBO V2 siap diakses langsung dari browser Anda.');
    }
  };

  const handleActionNavigate = (url: string) => {
    triggerHaptic();
    setIsOpen(false);
    router.push(url);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* 1. Backdrop Overlay saat Menu Aktif */}
      {isOpen && (
        <div
          role='presentation'
          aria-hidden='true'
          onClick={() => setIsOpen(false)}
          className='fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200 lg:hidden'
        />
      )}

      {/* 2. Container FAB & Speed Dial (Mobile & Tablet) */}
      <div
        ref={containerRef}
        className='bottom-safe-offset fixed right-4 z-50 flex flex-col items-end md:right-6 lg:hidden'
        aria-label='PWA Quick Actions Speed Dial'
      >
        {/* Speed Dial Menu Popover */}
        {isOpen && (
          <div className='animate-in fade-in slide-in-from-bottom-5 mb-3 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/95'>
            {/* Header Dialog */}
            <div className='flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800/60'>
              <div className='flex items-center gap-2'>
                <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs'>
                  <Zap className='h-4 w-4' />
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                    Pintasan Cepat REBO
                  </h3>
                  <p className='text-3xs text-slate-500 dark:text-slate-400'>
                    Akses navigasi instan & tindakan prioritas
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                aria-label='Tutup menu cepat'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            {/* Banner Instalasi PWA jika Belum Terpasang */}
            {!isInstalled && (
              <div className='rounded-xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 p-2.5 shadow-xs dark:border-blue-900/60 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-indigo-950/40'>
                <div className='flex items-start gap-2.5'>
                  <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs'>
                    <Smartphone className='h-4 w-4' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs font-bold text-blue-950 dark:text-blue-100'>
                        Install Aplikasi REBO
                      </span>
                      <span className='text-3xs py-0.2 inline-flex items-center rounded-full bg-blue-600/15 px-1.5 font-semibold text-blue-700 dark:bg-blue-400/20 dark:text-blue-300'>
                        PWA
                      </span>
                    </div>
                    <p className='text-3xs mt-0.5 leading-snug text-slate-600 dark:text-slate-300'>
                      Pasang ke layar beranda untuk akses offline & shortcut
                      langsung.
                    </p>
                    <button
                      type='button'
                      onClick={handleInstallClick}
                      className='mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 active:scale-95'
                    >
                      <Download className='h-3 w-3' />
                      <span>
                        {installPrompt
                          ? 'Pasang Sekarang'
                          : isIOS
                            ? 'Petunjuk Pasang di iOS'
                            : 'Tambahkan ke Layar Utama'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status PWA Terpasang */}
            {isInstalled && (
              <div className='flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1.5 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'>
                <div className='flex items-center gap-1.5'>
                  <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  <span className='text-3xs font-medium'>
                    Mode PWA Aktif di Layar Beranda
                  </span>
                </div>
                <span className='text-3xs rounded bg-emerald-600/20 px-1 py-0.5 font-bold text-emerald-700 dark:text-emerald-300'>
                  Terpasang
                </span>
              </div>
            )}

            {/* Daftar Quick Actions */}
            <div className='grid grid-cols-1 gap-1.5'>
              {QUICK_ACTIONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleActionNavigate(item.url)}
                    className='group flex w-full items-center justify-between rounded-xl border border-transparent p-2 text-left transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-98 dark:hover:border-slate-800 dark:hover:bg-slate-800/50'
                  >
                    <div className='flex items-center gap-2.5'>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-xs transition-transform group-hover:scale-105`}
                      >
                        <IconComponent className='h-4 w-4' />
                      </div>
                      <div>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-xs font-semibold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400'>
                            {item.title}
                          </span>
                          {item.badgeLabel && (
                            <span
                              className={`text-3xs py-0.2 rounded-md px-1.5 font-semibold ${item.badgeBg}`}
                            >
                              {item.badgeLabel}
                            </span>
                          )}
                        </div>
                        <p className='text-3xs text-slate-500 dark:text-slate-400'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className='h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200' />
                  </button>
                );
              })}
            </div>

            {/* Petunjuk Pintasan Layar Beranda (App Icon Long-Press) */}
            <div className='mt-1 border-t border-slate-100 pt-2 dark:border-slate-800/60'>
              <div className='text-3xs flex items-center justify-between text-slate-500 dark:text-slate-400'>
                <span className='inline-flex items-center gap-1'>
                  <Sparkles className='h-2.5 w-2.5 text-amber-500' />
                  <span>Tekan lama ikon REBO di layar HP untuk pintasan</span>
                </span>
                <span className='font-mono font-bold text-slate-400'>W3C</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Petunjuk iOS Add to Home Screen */}
        {showIOSGuide && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900'>
              <div className='flex items-center justify-between pb-3'>
                <div className='flex items-center gap-2'>
                  <Smartphone className='h-5 w-5 text-blue-600' />
                  <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                    Pasang REBO di iPhone/iPad
                  </h4>
                </div>
                <button
                  type='button'
                  onClick={() => setShowIOSGuide(false)}
                  className='rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
              <ol className='space-y-3 py-2 text-xs text-slate-600 dark:text-slate-300'>
                <li className='flex items-start gap-2'>
                  <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    1
                  </span>
                  <span>
                    Buka situs REBO V2 di peramban <strong>Safari</strong>.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    2
                  </span>
                  <span>
                    Ketuk tombol <strong>Bagikan (Share)</strong>{' '}
                    <Share2 className='inline h-3.5 w-3.5 text-blue-600' /> pada
                    bilah navigasi bawah Safari.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    3
                  </span>
                  <span>
                    Gulir ke bawah dan pilih{' '}
                    <strong>
                      Tambahkan ke Layar Utama (Add to Home Screen)
                    </strong>
                    .
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    4
                  </span>
                  <span>
                    Ketuk <strong>Tambah</strong> di pojok kanan atas. REBO V2
                    kini siap digunakan layaknya aplikasi native!
                  </span>
                </li>
              </ol>
              <button
                type='button'
                onClick={() => setShowIOSGuide(false)}
                className='mt-4 w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700'
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}

        {/* 3. Floating Action Button (FAB) Main Trigger */}
        <button
          type='button'
          onClick={toggleDial}
          aria-expanded={isOpen}
          aria-haspopup='dialog'
          aria-label='Buka pintasan cepat PWA REBO'
          className={`group relative flex h-13 w-13 items-center justify-center rounded-full shadow-xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? 'bg-slate-900 text-white shadow-slate-900/40 dark:bg-slate-100 dark:text-slate-900'
              : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white shadow-blue-700/40 hover:scale-105 hover:shadow-2xl hover:shadow-blue-700/50'
          }`}
        >
          {/* Subtle Glow Ring */}
          {!isOpen && (
            <span className='absolute -inset-1 animate-pulse rounded-full bg-blue-500/20 blur-xs' />
          )}

          {/* Icon with smooth rotate morph */}
          <div
            className={`transition-transform duration-300 ease-out ${
              isOpen ? 'rotate-90' : 'rotate-0'
            }`}
          >
            {isOpen ? (
              <X className='h-6 w-6 stroke-[2.5]' />
            ) : (
              <Zap className='h-6 w-6 fill-current stroke-[1.5]' />
            )}
          </div>

          {/* Indicator Dot if not installed */}
          {!isInstalled && !isOpen && (
            <span
              className='absolute top-0 right-0 flex h-3.5 w-3.5'
              title='PWA siap dipasang'
            >
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75' />
              <span className='relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 dark:border-slate-900' />
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export default PWAQuickActions;
