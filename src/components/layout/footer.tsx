import React from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='mt-auto border-t border-blue-200/50 bg-blue-50/80 px-4 py-6 backdrop-blur transition-colors duration-200 supports-[backdrop-filter]:bg-blue-50/60 md:px-8 dark:border-slate-700/60 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/60'>
      <div className='mx-auto max-w-7xl space-y-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          {/* Deskripsi Singkat REBO */}
          <div className='max-w-2xl space-y-1.5'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100'>
                REBO <span className='text-[#f59e0b]'>V2</span>
              </span>
              <span className='flex items-center space-x-1 rounded-full border border-blue-200/60 bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/40 dark:text-blue-300'>
                <ShieldCheck className='h-3 w-3' />
                <span>Zona Integritas</span>
              </span>
              <span className='inline-flex items-center space-x-1 rounded-full border border-emerald-200/60 bg-emerald-100/70 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500'></span>
                <span>Sistem Online</span>
              </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
              Sistem digitalisasi tata kelola bukti dukung LKE ZIAPP, alur
              verifikasi berjenjang, dan pemantauan capaian Reformasi Birokrasi
              BPS Kabupaten Kepulauan Siau Tagulandang Biaro menuju predikat
              Wilayah Bebas dari Korupsi (WBK) &amp; WBBM.
            </p>
          </div>

          {/* Hubungi Kami */}
          <div className='shrink-0 space-y-1.5'>
            <h4 className='text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300'>
              Hubungi Kami
            </h4>
            <a
              href='mailto:Sitarokab@bps.go.id'
              className='inline-flex items-center space-x-2 text-xs text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-amber-400'
            >
              <Mail className='h-3.5 w-3.5 text-blue-600 dark:text-amber-400' />
              <span>Sitarokab@bps.go.id</span>
            </a>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              BPS Kab. Kepulauan Siau Tagulandang Biaro
            </p>
          </div>
        </div>

        {/* Hak Cipta & Link Tambahan */}
        <div className='flex flex-col gap-2 border-t border-blue-200/40 pt-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400'>
          <p>
            &copy; 2026 Badan Pusat Statistik Kabupaten Kepulauan Siau
            Tagulandang Biaro. Hak cipta dilindungi.
          </p>
          <div className='flex items-center space-x-4'>
            <Link
              href='/rebo/informasi'
              className='transition-colors hover:text-blue-600 dark:hover:text-amber-400'
            >
              Pusat Informasi RB
            </Link>
            <Link
              href='/rebo/kanban'
              className='transition-colors hover:text-blue-600 dark:hover:text-amber-400'
            >
              Tindak Lanjut
            </Link>
            <Link
              href='/rebo/overview'
              className='transition-colors hover:text-blue-600 dark:hover:text-amber-400'
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
