'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Monitor,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { toast } from 'sonner';
import {
  DEFAULT_IDLE_TIMEOUT_SECONDS,
  DEFAULT_WARNING_SECONDS,
  SESSION_STORAGE_KEYS,
  generateDeviceFingerprint,
  getRemainingSeconds,
  getLastActivity,
  updateLastActivity,
  isSessionLocked,
  setSessionLocked,
  isSharedPcMode,
  setSharedPcMode,
  saveKnownDevice,
  setupInactivityListeners,
  formatWitaDateTime
} from '@/lib/security/session-guard';
import {
  verifyDeviceLoginAction,
  logSessionTimeoutAction
} from '@/actions/security-actions';

export function SessionTimeoutGuard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    DEFAULT_IDLE_TIMEOUT_SECONDS
  );
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSharedPc, setIsSharedPc] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lockTimestamp, setLockTimestamp] = useState<string>('');

  const hasLoggedTimeoutRef = useRef(false);

  // Inisialisasi status awal dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const locked = isSessionLocked();
      const shared = isSharedPcMode();
      setIsLocked(locked);
      setIsSharedPc(shared);
      if (locked) {
        setLockTimestamp(formatWitaDateTime());
      }
    }
  }, []);

  // 1. Verifikasi Perangkat Baru & Kirim Alert WhatsApp saat Login
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const runDeviceVerification = async () => {
      try {
        const verifiedKey = `${SESSION_STORAGE_KEYS.VERIFIED_SESSION}_${user.id}`;
        const alreadyVerified = sessionStorage.getItem(verifiedKey);

        if (!alreadyVerified) {
          const deviceInfo = generateDeviceFingerprint();

          const result = await verifyDeviceLoginAction(deviceInfo);

          if (result.success) {
            saveKnownDevice(deviceInfo.fingerprint);
            sessionStorage.setItem(verifiedKey, '1');

            if (result.isNewDevice && result.alertSent) {
              toast.warning(
                'Perangkat Baru Terdeteksi: Peringatan keamanan telah dikirim ke nomor WhatsApp Anda sesuai ISO 27001.',
                {
                  duration: 8000,
                  icon: <ShieldAlert className='size-5 text-amber-500' />
                }
              );
            }
          }
        }
      } catch (err) {
        console.warn('[SESSION-GUARD] Device check error:', err);
      }
    };

    runDeviceVerification();
  }, [isLoaded, isSignedIn, user]);

  // Handler penguncian sesi otomatis
  const handleLockSession = useCallback(
    async (reason: string = 'INACTIVITY_TIMEOUT_30MIN') => {
      if (hasLoggedTimeoutRef.current) return;
      hasLoggedTimeoutRef.current = true;

      setSessionLocked(true);
      setIsLocked(true);
      setIsWarningOpen(false);
      setLockTimestamp(formatWitaDateTime());

      try {
        await logSessionTimeoutAction({
          timeoutMinutes: 30,
          reason,
          lastPath: pathname
        });
      } catch (err) {
        console.warn('[SESSION-GUARD] Log timeout error:', err);
      }
    },
    [pathname]
  );

  // Handler perpanjang sesi
  const handleExtendSession = useCallback(() => {
    updateLastActivity();
    setRemainingSeconds(DEFAULT_IDLE_TIMEOUT_SECONDS);
    setIsWarningOpen(false);
    toast.success('Sesi kerja REBO V2 Anda berhasil diperpanjang 30 menit.', {
      icon: <CheckCircle2 className='size-4 text-emerald-500' />
    });
  }, []);

  // Handler buka kunci / login ulang
  const handleUnlockOrSignOut = async () => {
    setIsLoggingOut(true);
    try {
      setSessionLocked(false);
      setIsLocked(false);
      hasLoggedTimeoutRef.current = false;
      updateLastActivity();
      await signOut({ redirectUrl: '/auth/sign-in' });
    } catch {
      router.push('/auth/sign-in');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Toggle Shared PC mode
  const handleToggleSharedPc = (checked: boolean) => {
    setIsSharedPc(checked);
    setSharedPcMode(checked);
    if (!checked) {
      setIsWarningOpen(false);
      toast.info('Mode Komputer Bersama dinonaktifkan untuk sesi ini.');
    } else {
      updateLastActivity();
      toast.info(
        'Mode Komputer Bersama aktif: Auto-timeout 30 menit diterapkan.'
      );
    }
  };

  // 2. Setup Listener Inaktivitas (mousemove, keydown, scroll, touch)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isLocked) return;

    const cleanupListeners = setupInactivityListeners(() => {
      // Jika warning modal sedang tidak terbuka dan sesi belum expired, perbarui timer
      if (!isLocked) {
        const remaining = getRemainingSeconds(DEFAULT_IDLE_TIMEOUT_SECONDS);
        setRemainingSeconds(remaining);
      }
    }, 1500);

    return () => {
      cleanupListeners();
    };
  }, [isLoaded, isSignedIn, isLocked]);

  // 3. Interval Timer Pengecekan Inaktivitas Setiap 1 Detik
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isLocked) return;

    // Jika user mematikan mode shared PC, jangan jalankan hitung mundur
    if (!isSharedPc) return;

    const timer = setInterval(() => {
      const remaining = getRemainingSeconds(DEFAULT_IDLE_TIMEOUT_SECONDS);
      setRemainingSeconds(remaining);

      // Cek apakah sudah masuk periode warning (<= 120 detik dan > 0)
      if (remaining <= DEFAULT_WARNING_SECONDS && remaining > 0) {
        setIsWarningOpen(true);
      } else if (remaining > DEFAULT_WARNING_SECONDS) {
        setIsWarningOpen(false);
      }

      // Cek apakah waktu telah habis (0 detik)
      if (remaining <= 0) {
        clearInterval(timer);
        handleLockSession('INACTIVITY_30MIN_TIMEOUT');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoaded, isSignedIn, isLocked, isSharedPc, handleLockSession]);

  // 4. Sinkronisasi antar Tab Browser via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEYS.LAST_ACTIVITY) {
        const remaining = getRemainingSeconds(DEFAULT_IDLE_TIMEOUT_SECONDS);
        setRemainingSeconds(remaining);
        if (remaining > DEFAULT_WARNING_SECONDS) {
          setIsWarningOpen(false);
        }
      } else if (e.key === SESSION_STORAGE_KEYS.SESSION_LOCKED) {
        if (e.newValue === 'true') {
          setIsLocked(true);
          setIsWarningOpen(false);
        } else {
          setIsLocked(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Format detik menjadi MM:SS
  const formatTimeMinutesSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. Modal Dialog Peringatan Inaktivitas (Warning 120 Detik)            */}
      {/* ==================================================================== */}
      <Dialog
        open={isWarningOpen && !isLocked}
        onOpenChange={(open) => {
          // Cegah modal ditutup sembarangan dengan klik backdrop
          if (!open) {
            handleExtendSession();
          }
        }}
      >
        <DialogContent
          className='bg-background/95 border-amber-500/30 shadow-2xl backdrop-blur-md sm:max-w-md'
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className='flex flex-col items-center space-y-3 pt-2 text-center'>
            <div className='relative flex size-14 animate-pulse items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5'>
              <Clock className='size-8' />
            </div>

            <DialogTitle className='text-foreground text-xl font-bold tracking-tight'>
              Peringatan Inaktivitas Sesi
            </DialogTitle>

            <DialogDescription className='text-muted-foreground max-w-sm text-center text-sm'>
              Tidak ada aktivitas terdeteksi pada akun Anda. Demi keamanan data
              penilaian ZI BPS Sitaro (ISO 27001), sesi akan dikunci otomatis
              dalam:
            </DialogDescription>
          </DialogHeader>

          {/* Countdown Display Card */}
          <div className='my-2 flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-amber-50/50 px-6 py-4 dark:bg-amber-950/20'>
            <div className='flex items-baseline gap-2'>
              <span
                className={`text-4xl font-extrabold tracking-tight tabular-nums ${
                  remainingSeconds <= 30
                    ? 'animate-bounce text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {formatTimeMinutesSeconds(remainingSeconds)}
              </span>
              <span className='text-muted-foreground text-xs font-medium'>
                menit:detik
              </span>
            </div>

            <div className='bg-muted mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full'>
              <div
                className={`h-full transition-all duration-1000 ${
                  remainingSeconds <= 30 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{
                  width: `${(remainingSeconds / DEFAULT_WARNING_SECONDS) * 100}%`
                }}
              />
            </div>

            <p className='text-muted-foreground mt-2.5 flex items-center gap-1.5 text-[11px]'>
              <AlertTriangle className='size-3 text-amber-500' />
              <span>Komputer Bersama (Shared PC) BPS Sitaro</span>
            </p>
          </div>

          <DialogFooter className='flex flex-col-reverse gap-2 pt-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleLockSession('USER_MANUAL_LOCK')}
              className='text-muted-foreground hover:text-foreground gap-1.5'
            >
              <Lock className='size-4' />
              Kunci Sekarang
            </Button>

            <Button
              type='button'
              variant='default'
              onClick={handleExtendSession}
              className='gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md hover:from-amber-700 hover:to-amber-600'
            >
              <RefreshCw className='size-4' />
              Lanjutkan Sesi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* 2. Layar Kunci Sesi Elegan (Lock Screen Overlay - 30 Menit Timeout)  */}
      {/* ==================================================================== */}
      {isLocked && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl transition-all duration-300'>
          <div className='border-border/40 bg-card/95 text-card-foreground w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl sm:p-8'>
            {/* Kop & Logo Standar Keamanan BPS Sitaro */}
            <div className='flex flex-col items-center space-y-3 text-center'>
              <div className='bg-primary/10 text-primary ring-primary/5 relative flex size-16 items-center justify-center rounded-2xl shadow-inner ring-8'>
                <Lock className='size-8' />
                <span className='absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow'>
                  !
                </span>
              </div>

              <div>
                <div className='border-primary/20 bg-primary/5 text-primary mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium'>
                  <ShieldCheck className='size-3.5' />
                  ISO 27001 Access Control
                </div>
                <h2 className='text-2xl font-bold tracking-tight'>
                  Sesi Kerja Terkunci
                </h2>
                <p className='text-muted-foreground mt-0.5 text-xs'>
                  BPS Kabupaten Kepulauan Sitaro • REBO V2
                </p>
              </div>
            </div>

            {/* Profil Pengguna Terkunci */}
            <div className='border-border/60 bg-muted/30 mt-6 flex items-center gap-3 rounded-xl border p-3.5'>
              <UserAvatarProfile
                user={user}
                className='ring-background size-11 ring-2'
              />
              <div className='min-w-0 flex-1'>
                <p className='text-foreground truncate text-sm font-semibold'>
                  {user.fullName || 'Pegawai BPS Sitaro'}
                </p>
                <p className='text-muted-foreground truncate text-xs'>
                  {user.emailAddresses?.[0]?.emailAddress || ''}
                </p>
                {lockTimestamp && (
                  <p className='text-muted-foreground mt-0.5 text-[10px]'>
                    Terkunci: {lockTimestamp}
                  </p>
                )}
              </div>
            </div>

            {/* Info Keamanan ZI */}
            <div className='mt-4 space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300'>
              <p className='flex items-center gap-1.5 font-semibold'>
                <ShieldAlert className='size-3.5 shrink-0' />
                Perlindungan Data Kerahasiaan ZI
              </p>
              <p className='text-muted-foreground text-[11px] leading-relaxed dark:text-amber-300/80'>
                Sesi ditutup otomatis setelah 30 menit tanpa aktivitas pada
                komputer bersama untuk mencegah akses tanpa izin ke Lembar Kerja
                Evaluasi (LKE) dan dokumen bukti dukung.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className='mt-6 space-y-2.5'>
              <Button
                type='button'
                onClick={handleUnlockOrSignOut}
                disabled={isLoggingOut}
                className='w-full gap-2 text-sm font-medium shadow-md'
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw className='size-4 animate-spin' />
                    Menyiapkan Login...
                  </>
                ) : (
                  <>
                    <Unlock className='size-4' />
                    Masuk Kembali / Buka Kunci
                  </>
                )}
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={handleUnlockOrSignOut}
                disabled={isLoggingOut}
                className='text-muted-foreground hover:text-foreground w-full gap-2 text-xs'
              >
                <LogOut className='size-3.5' />
                Ganti Akun Pegawai Lain
              </Button>
            </div>

            {/* Mode Komputer Bersama Switch Toggle */}
            <div className='border-border/40 mt-5 flex items-center justify-between border-t pt-4'>
              <div className='flex items-center gap-2'>
                <Monitor className='text-muted-foreground size-4' />
                <div className='text-left'>
                  <p className='text-foreground text-xs font-medium'>
                    Mode Komputer Bersama
                  </p>
                  <p className='text-muted-foreground text-[10px]'>
                    Auto-timeout 30 menit diaktifkan
                  </p>
                </div>
              </div>
              <Switch
                checked={isSharedPc}
                onCheckedChange={handleToggleSharedPc}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
