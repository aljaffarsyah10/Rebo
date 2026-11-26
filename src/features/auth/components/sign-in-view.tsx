'use client';

import Link from 'next/link';
import {
  ClerkLoaded,
  ClerkLoading,
  SignIn as ClerkSignInForm,
  useAuth
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInViewPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/rebo/overview');
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950'>
        <div className='relative mb-4 flex items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-[#023047]/20 border-t-[#fb8500] dark:border-[#ffb703]/20 dark:border-t-[#fb8500]' />
          <div className='absolute h-6 w-6 animate-pulse rounded-full bg-[#023047] opacity-25 dark:bg-[#ffb703]' />
        </div>
        <h2 className='text-base font-bold text-slate-800 dark:text-slate-100'>
          Mengarahkan ke Dashboard REBO...
        </h2>
        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
          Sesi Anda telah aktif. Membuka ikhtisar capaian Zona Integritas.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-background relative flex h-screen w-full flex-col overflow-hidden lg:grid lg:grid-cols-12'>
      {/* Kolom Kiri: Hero & Quote Card (Sesuai Desain Asli, Minimalis, Bernyawa/Live, Tanpa Logo Gambar) */}
      <div className='relative hidden flex-col justify-between overflow-hidden border-r border-[#00487a]/40 bg-gradient-to-br from-[#023047] via-[#023047]/95 to-[#034469] p-10 text-white select-none lg:col-span-7 lg:flex xl:col-span-7 xl:p-14'>
        {/* Latar Belakang Ambient Bernyawa (Living Bokeh Orbs dengan Animasi Halus) */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='animate-pulse-glow absolute -top-10 -left-10 h-64 w-64 rounded-full bg-[#fb8500]/15 blur-3xl'></div>
          <div className='animate-float-slow absolute right-10 bottom-10 h-72 w-72 rounded-full bg-[#ffb703]/20 blur-3xl'></div>
          <div className='animate-float-reverse absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-[#fb8500]/20 blur-2xl'></div>
          <div className='animate-pulse-glow absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-[#ffb703]/15 blur-xl'></div>
          <div className='animate-float-slow absolute bottom-1/3 left-1/2 h-36 w-36 rounded-full bg-[#fb8500]/15 blur-2xl'></div>
        </div>

        {/* Bagian Atas: Tipografi REBO Resmi (Sesuai Gambar, Bersih Tanpa Logo Gambar) */}
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <div className='flex flex-col space-y-1'>
            <span className='bg-gradient-to-r from-white via-[#ffb703] to-white bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-md xl:text-4xl'>
              REBO
            </span>
            <span className='text-xs font-semibold tracking-wide text-[#ffb703]/90 xl:text-sm'>
              Reformasi Birokrasi
            </span>
            <div className='h-0.5 w-32 rounded-full bg-gradient-to-r from-[#fb8500] via-[#ffb703] to-transparent xl:w-36'></div>
          </div>
        </div>

        {/* Bagian Tengah: Quote Card Zona Integritas (Kartu Utama Sesuai Gambar dengan Efek Live) */}
        <div className='relative z-20 my-auto flex w-full max-w-lg flex-col justify-center py-6'>
          <div className='group animate-float-slow relative overflow-hidden rounded-3xl border border-[#ffb703]/25 bg-gradient-to-br from-[#023047]/45 to-[#023047]/15 p-7 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-[#fb8500]/45 hover:shadow-2xl hover:shadow-[#fb8500]/10 xl:p-8'>
            {/* Shimmer gradient halus saat hover/idle */}
            <div className='absolute inset-0 bg-gradient-to-br from-[#fb8500]/10 via-transparent to-[#ffb703]/10 opacity-40 transition-opacity duration-500 group-hover:opacity-75'></div>

            <blockquote className='relative space-y-6'>
              <div className='flex items-start space-x-4'>
                {/* Lingkaran Kutipan dengan Efek Beacon / Pulse Glowing */}
                <div className='animate-beacon mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703] shadow-md shadow-[#fb8500]/30 xl:h-10 xl:w-10'>
                  <svg
                    className='h-4 w-4 text-[#023047]'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z' />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='bg-gradient-to-r from-white via-[#ffb703] to-white bg-clip-text text-xl leading-relaxed font-bold text-transparent drop-shadow-sm xl:text-2xl'>
                    Rebo - Zona Integritas Reformasi Birokrasi
                  </p>
                </div>
              </div>

              {/* Footer Kartu: Titik Status Live & Garis Aksen Sesuai Gambar */}
              <footer className='flex items-center justify-between pt-2'>
                <div className='flex items-center space-x-3'>
                  {/* Titik indikator live aktif */}
                  <div className='flex items-center space-x-2'>
                    <div className='h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703] shadow-sm shadow-[#fb8500]'></div>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-[#ffb703]/75 delay-75'></div>
                    <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#fb8500]/50 delay-150'></div>
                  </div>
                  <span className='bg-gradient-to-r from-[#ffb703] to-white bg-clip-text text-xs font-semibold tracking-wide text-transparent xl:text-sm'>
                    BPS Siau Tagulandang Biaro
                  </span>
                </div>
                {/* 3 Garis aksen gradien */}
                <div className='flex space-x-1.5'>
                  <div className='h-1 w-8 rounded-full bg-gradient-to-r from-[#fb8500] to-transparent'></div>
                  <div className='h-1 w-6 rounded-full bg-gradient-to-r from-[#ffb703] to-transparent'></div>
                  <div className='h-1 w-4 rounded-full bg-gradient-to-r from-[#fb8500] to-transparent'></div>
                </div>
              </footer>
            </blockquote>
          </div>

          {/* Ringkasan Singkat Web REBO (Tulisan Sangat Ringkas & Proporsional di Bawah Card) */}
          <div className='mt-3.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 shadow-sm backdrop-blur-sm'>
            <p className='text-[10px] leading-relaxed text-slate-300/85 xl:text-[11px]'>
              <span className='font-semibold text-[#ffb703]'>
                Platform Digitalisasi LKE:
              </span>{' '}
              Tata kelola bukti dukung terstruktur, alur verifikasi berjenjang,
              dan pemantauan capaian Reformasi Birokrasi BPS Kabupaten Kepulauan
              Sitaro menuju predikat WBK &amp; WBBM.
            </p>
          </div>
        </div>

        {/* Bagian Bawah: Aksen Pembatas Halus & Minimalis */}
        <div className='relative z-20 flex items-center justify-between pt-2 text-xs text-slate-300/80'>
          <div className='flex items-center space-x-2'>
            <div className='h-px w-14 bg-gradient-to-r from-transparent to-[#fb8500]/40'></div>
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffb703]'></div>
            <div className='h-px w-20 bg-gradient-to-r from-[#fb8500]/40 via-[#ffb703]/40 to-[#fb8500]/40'></div>
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#fb8500]'></div>
            <div className='h-px w-14 bg-gradient-to-r from-[#fb8500]/40 to-transparent'></div>
          </div>
          <span className='text-[11px] font-medium text-slate-400'>
            Menuju WBK / WBBM &bull; 2026
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Card Login Autentikasi (Terpusat, 1 Page Viewport Tanpa Scroll) */}
      <div className='col-span-12 flex h-full flex-col items-center justify-center overflow-hidden bg-slate-50/80 px-4 py-4 sm:px-8 lg:col-span-5 xl:col-span-5 dark:bg-slate-950/80'>
        <div className='my-auto flex w-full max-w-[390px] flex-col items-center justify-center space-y-4'>
          {/* Header Mobile: Tipografi REBO Selaras saat Kolom Kiri Tersembunyi */}
          <div className='flex flex-col items-center space-y-1 pb-1 text-center lg:hidden'>
            <span className='bg-gradient-to-r from-[#023047] via-[#fb8500] to-[#ffb703] bg-clip-text text-2xl font-black tracking-tight text-transparent'>
              REBO
            </span>
            <span className='text-xs font-semibold text-[#023047]/80 dark:text-[#ffb703]/90'>
              Reformasi Birokrasi BPS Sitaro
            </span>
            <div className='mx-auto h-0.5 w-20 rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703]'></div>
          </div>

          {/* Header Ringkas di Layar Desktop */}
          <div className='hidden space-y-0.5 text-center lg:block'>
            <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
              Selamat Datang
            </h1>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Masuk ke akun Anda untuk mengelola instrumen LKE
            </p>
          </div>

          {/* Form Autentikasi Clerk Resmi dengan Penataan Khusus (Proporsional & Pas 1 Halaman) */}
          <div className='flex w-full justify-center'>
            <ClerkLoading>
              <div className='flex min-h-[320px] w-full flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'>
                <div className='relative flex items-center justify-center'>
                  <div className='h-11 w-11 animate-spin rounded-full border-3 border-[#023047]/20 border-t-[#fb8500] dark:border-[#ffb703]/20 dark:border-t-[#fb8500]' />
                  <div className='absolute h-5 w-5 animate-ping rounded-full bg-[#023047] opacity-20 dark:bg-[#ffb703]' />
                </div>
                <div className='space-y-1 text-center'>
                  <p className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                    Menyiapkan Formulir Masuk...
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Sistem Informasi ZI-RB BPS Sitaro
                  </p>
                </div>
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <ClerkSignInForm
                fallbackRedirectUrl='/rebo/overview'
                signUpFallbackRedirectUrl='/rebo/overview'
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-lg border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 w-full',
                    headerTitle:
                      'text-lg font-bold text-slate-800 dark:text-slate-100',
                    headerSubtitle:
                      'text-xs text-slate-500 dark:text-slate-400',
                    socialButtonsBlockButton:
                      'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium py-2',
                    formButtonPrimary:
                      'bg-[#023047] hover:bg-[#034469] text-white text-xs font-semibold py-2.5 shadow-sm transition-all duration-200',
                    footerActionLink:
                      'text-[#023047] hover:text-[#fb8500] dark:text-[#ffb703] font-semibold text-xs',
                    formFieldInput:
                      'rounded-lg border-slate-200 dark:border-slate-700 text-xs py-2 focus:border-[#023047] focus:ring-1 focus:ring-[#023047]',
                    formFieldLabel:
                      'text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1',
                    footer: 'bg-transparent pt-3 mt-1'
                  }
                }}
              />
            </ClerkLoaded>
          </div>

          {/* Footer Legalitas & Hak Cipta Ringkas */}
          <div className='space-y-1 pt-1 text-center'>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              Dengan melanjutkan, Anda menyetujui{' '}
              <Link
                href='/terms'
                className='font-semibold text-[#023047] underline underline-offset-2 hover:text-[#fb8500] dark:text-[#ffb703]'
              >
                Ketentuan
              </Link>{' '}
              &{' '}
              <Link
                href='/privacy'
                className='font-semibold text-[#023047] underline underline-offset-2 hover:text-[#fb8500] dark:text-[#ffb703]'
              >
                Kebijakan Privasi
              </Link>
            </p>
            <p className='text-[10px] text-slate-400 dark:text-slate-500'>
              &copy; 2026 Tim Kerja ZI BPS Kab. Kepulauan Sitaro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
