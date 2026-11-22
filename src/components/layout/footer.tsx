import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='border-border/50 bg-card/60 dark:bg-card/30 mt-auto border-t px-4 py-6 backdrop-blur-sm md:px-8'>
      <div className='mx-auto max-w-7xl space-y-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          {/* Deskripsi Singkat REBO */}
          <div className='max-w-2xl space-y-1.5'>
            <div className='flex items-center space-x-2'>
              <span className='text-foreground text-sm font-bold tracking-tight'>
                REBO <span className='text-[#f59e0b]'>V2</span>
              </span>
              <span className='bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-[10px] font-medium'>
                Zona Integritas
              </span>
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              Sistem digitalisasi tata kelola bukti dukung LKE PMPRB, alur
              verifikasi berjenjang, dan pemantauan capaian Reformasi Birokrasi
              BPS Kabupaten Kepulauan Siau Tagulandang Biaro menuju predikat
              Wilayah Bebas dari Korupsi (WBK) &amp; WBBM.
            </p>
          </div>

          {/* Hubungi Kami */}
          <div className='shrink-0 space-y-1.5'>
            <h4 className='text-foreground/80 text-xs font-semibold tracking-wider uppercase'>
              Hubungi Kami
            </h4>
            <a
              href='mailto:Sitarokab@bps.go.id'
              className='text-muted-foreground hover:text-primary inline-flex items-center space-x-2 text-xs transition-colors'
            >
              <Mail className='text-primary h-3.5 w-3.5' />
              <span>Sitarokab@bps.go.id</span>
            </a>
          </div>
        </div>

        {/* Hak Cipta */}
        <div className='border-border/40 text-muted-foreground flex flex-col gap-2 border-t pt-3 text-[11px] sm:flex-row sm:items-center sm:justify-between'>
          <p>
            &copy; 2026 Badan Pusat Statistik Kabupaten Kepulauan Siau
            Tagulandang Biaro. Hak cipta dilindungi.
          </p>
          <div className='flex items-center space-x-4'>
            <Link
              href='/rebo/informasi'
              className='hover:text-foreground transition-colors'
            >
              Pusat Informasi RB
            </Link>
            <Link
              href='/rebo/overview'
              className='hover:text-foreground transition-colors'
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
