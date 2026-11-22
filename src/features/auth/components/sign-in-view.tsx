'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import {
  FolderSync,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Award
} from 'lucide-react';

export default function SignInViewPage() {
  return (
    <div className='bg-background relative flex h-screen w-full flex-col overflow-hidden lg:grid lg:grid-cols-12'>
      {/* Kolom Kiri: Hero & Branding BPS Sitaro (Tampil di Layar Besar, 1 Page Viewport) */}
      <div className='relative hidden flex-col justify-between overflow-hidden border-r border-[#00487a]/40 bg-gradient-to-br from-[#002744] via-[#00385F] to-[#011C31] p-8 text-white lg:col-span-7 lg:flex xl:col-span-7 xl:p-10'>
        {/* Latar Belakang Dekoratif & Efek Glow Halus */}
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[#f59e0b]/15 blur-3xl'></div>
          <div className='absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#00558f]/30 blur-3xl'></div>
          <div className='absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-[#f59e0b]/10 blur-2xl'></div>
        </div>

        {/* Bagian Atas: Identitas Resmi REBO & BPS */}
        <div className='relative z-10 flex items-center justify-between'>
          <div className='flex items-center space-x-3.5'>
            <div className='relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 p-1.5 shadow-md backdrop-blur-md'>
              <Image
                src='/assets/logo_rebo.png'
                alt='Logo REBO'
                width={40}
                height={40}
                className='object-contain'
                priority
              />
            </div>
            <div>
              <div className='flex items-center space-x-2'>
                <span className='text-2xl font-black tracking-tight text-white drop-shadow-sm'>
                  REBO <span className='text-[#f59e0b]'>V2</span>
                </span>
                <span className='rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90'>
                  Zona Integritas
                </span>
              </div>
              <p className='text-xs font-medium text-slate-300'>
                Badan Pusat Statistik Kab. Kepulauan Siau Tagulandang Biaro
              </p>
            </div>
          </div>

          <Link
            href='/rebo/informasi'
            className='inline-flex items-center space-x-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white'
          >
            <span>Pusat Informasi</span>
          </Link>
        </div>

        {/* Bagian Tengah: Fitur Unggulan Satker (Ringkas & Proporsional) */}
        <div className='relative z-10 my-auto space-y-5 py-4'>
          <div className='space-y-1.5'>
            <div className='inline-flex items-center space-x-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/20 px-3 py-1 text-xs font-semibold text-[#f59e0b]'>
              <Award className='h-3.5 w-3.5' />
              <span>Platform Tata Kelola Menuju WBK / WBBM</span>
            </div>
            <h1 className='text-2xl leading-tight font-extrabold tracking-tight text-white xl:text-3xl'>
              Digitalisasi, Evaluasi, & Verifikasi LKE PMPRB Berkelanjutan
            </h1>
            <p className='max-w-xl text-xs leading-relaxed text-slate-300 xl:text-sm'>
              Kelola instrumen penilaian Reformasi Birokrasi dengan
              standardisasi bukti dukung, alur reviu internal berjenjang, dan
              sinkronisasi ke portal pusat.
            </p>
          </div>

          {/* Grid 4 Nilai Unggulan REBO V2 */}
          <div className='grid max-w-xl grid-cols-2 gap-3'>
            <div className='rounded-xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md transition-all hover:bg-white/[0.12]'>
              <div className='mb-1 flex items-center space-x-2 text-[#f59e0b]'>
                <FolderSync className='h-4 w-4' />
                <h2 className='text-xs font-bold text-white'>
                  Otomasi Bukti Dukung
                </h2>
              </div>
              <p className='text-[11px] leading-snug text-slate-300'>
                Hierarki folder Google Drive baku dan terstruktur otomatis per
                indikator LKE.
              </p>
            </div>

            <div className='rounded-xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md transition-all hover:bg-white/[0.12]'>
              <div className='mb-1 flex items-center space-x-2 text-[#38bdf8]'>
                <ShieldCheck className='h-4 w-4' />
                <h2 className='text-xs font-bold text-white'>
                  Pra-Audit & QA Guard
                </h2>
              </div>
              <p className='text-[11px] leading-snug text-slate-300'>
                Validasi izin akses publik link GDrive dan checklist berkas
                wajib sebelum reviu.
              </p>
            </div>

            <div className='rounded-xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md transition-all hover:bg-white/[0.12]'>
              <div className='mb-1 flex items-center space-x-2 text-[#4ade80]'>
                <BarChart3 className='h-4 w-4' />
                <h2 className='text-xs font-bold text-white'>
                  Monitoring Real-Time
                </h2>
              </div>
              <p className='text-[11px] leading-snug text-slate-300'>
                Pelacakan skor mandiri vs verifikasi TPI dan deteksi deviasi
                penilaian.
              </p>
            </div>

            <div className='rounded-xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md transition-all hover:bg-white/[0.12]'>
              <div className='mb-1 flex items-center space-x-2 text-[#fb923c]'>
                <RefreshCw className='h-4 w-4' />
                <h2 className='text-xs font-bold text-white'>
                  Jembatan Web Pusat
                </h2>
              </div>
              <p className='text-[11px] leading-snug text-slate-300'>
                Integrasi sinkronisasi data & link siap submit ke portal PMPRB
                nasional.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Kutipan Komitmen & Hak Cipta */}
        <div className='relative z-10 flex items-center justify-between border-t border-white/15 pt-3 text-xs text-slate-300'>
          <p className='max-w-md text-[11px] text-slate-300/90 italic'>
            &ldquo;Mewujudkan birokrasi yang bersih, akuntabel, dan berkinerja
            tinggi di Kepulauan Sitaro.&rdquo;
          </p>
          <span className='text-[11px] text-slate-400'>
            BPS Sitaro &bull; 2026
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Card Login Autentikasi (Terpusat, 1 Page Viewport Tanpa Scroll) */}
      <div className='col-span-12 flex h-full flex-col items-center justify-center overflow-hidden bg-slate-50/80 px-4 py-4 sm:px-8 lg:col-span-5 xl:col-span-5 dark:bg-slate-950/80'>
        <div className='my-auto flex w-full max-w-[400px] flex-col items-center justify-center space-y-4'>
          {/* Header Mobile / Tablet: Tampil saat Kolom Kiri Tersembunyi */}
          <div className='flex flex-col items-center space-y-2 pb-1 text-center lg:hidden'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-md dark:border-slate-800 dark:bg-slate-900'>
              <Image
                src='/assets/logo_rebo.png'
                alt='Logo REBO'
                width={38}
                height={38}
                className='object-contain'
                priority
              />
            </div>
            <div>
              <h1 className='text-xl font-black tracking-tight text-slate-900 dark:text-white'>
                REBO <span className='text-[#f59e0b]'>V2</span>
              </h1>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                BPS Kabupaten Kepulauan Sitaro
              </p>
            </div>
          </div>

          {/* Header Ringkas di Desktop */}
          <div className='hidden space-y-0.5 text-center lg:block'>
            <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
              Selamat Datang
            </h2>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Masuk ke akun Anda untuk mengelola instrumen LKE
            </p>
          </div>

          {/* Form Autentikasi Clerk Resmi dengan Penataan Khusus (Proporsional & Clean) */}
          <div className='flex w-full justify-center'>
            <ClerkSignInForm
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-lg border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 w-full',
                  headerTitle:
                    'text-lg font-bold text-slate-800 dark:text-slate-100',
                  headerSubtitle: 'text-xs text-slate-500 dark:text-slate-400',
                  socialButtonsBlockButton:
                    'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium py-2',
                  formButtonPrimary:
                    'bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold py-2.5 shadow-sm transition-all duration-200',
                  footerActionLink:
                    'text-[#003366] hover:text-[#fb8500] dark:text-amber-400 font-semibold text-xs',
                  formFieldInput:
                    'rounded-lg border-slate-200 dark:border-slate-700 text-xs py-2 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]',
                  formFieldLabel:
                    'text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1',
                  footer: 'bg-transparent pt-3 mt-1'
                }
              }}
            />
          </div>

          {/* Footer Legalitas & Hak Cipta Ringkas */}
          <div className='space-y-1 pt-1 text-center'>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              Dengan melanjutkan, Anda menyetujui{' '}
              <Link
                href='/terms'
                className='font-semibold text-[#003366] underline underline-offset-2 hover:text-[#f59e0b] dark:text-amber-400'
              >
                Ketentuan
              </Link>{' '}
              &{' '}
              <Link
                href='/privacy'
                className='font-semibold text-[#003366] underline underline-offset-2 hover:text-[#f59e0b] dark:text-amber-400'
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
