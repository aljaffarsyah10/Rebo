import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Building2,
  Target,
  ArrowRight,
  Kanban,
  FileSpreadsheet,
  FolderSync,
  RefreshCw,
  CalendarCheck,
  TrendingUp,
  Layers,
  BookOpen,
  Lock,
  Activity,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function Overview() {
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 11
      ? 'Selamat Pagi'
      : currentTime < 15
        ? 'Selamat Siang'
        : currentTime < 18
          ? 'Selamat Sore'
          : 'Selamat Malam';

  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      {/* Hero Section Asli yang Elegan & Soft dengan Live Ambient Orbs */}
      <div className='dark:via-slate-850/80 relative overflow-hidden rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/50 p-6 shadow-sm md:p-8 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-800/70'>
        {/* Live Ambient Lighting Orbs */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='animate-pulse-glow absolute -top-8 -left-8 h-48 w-48 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-600/15'></div>
          <div className='animate-float-slow absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-600/15'></div>
          <div className='animate-float-reverse absolute top-1/2 left-1/3 h-36 w-36 rounded-full bg-amber-200/20 blur-2xl dark:bg-amber-500/10'></div>
        </div>

        <div className='relative z-10 space-y-5'>
          {/* Header Baris Status & Salam */}
          <div className='space-y-1.5'>
            <div className='flex items-center space-x-2'>
              <Badge
                variant='outline'
                className='border-blue-300/60 bg-blue-100/60 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-700/60 dark:bg-blue-950/50 dark:text-blue-300'
              >
                {greeting} 👋
              </Badge>
              <div className='inline-flex items-center space-x-1.5 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'>
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
                </span>
                <span>REBO V2.0 Aktif</span>
              </div>
            </div>

            <h1 className='bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-3xl font-black text-transparent md:text-4xl dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300'>
              Hai, Selamat Datang Kembali!
            </h1>

            <p className='text-sm font-medium text-slate-600 md:text-base dark:text-slate-300'>
              Selamat datang di platform REBO - Zona Integritas Reformasi
              Birokrasi
            </p>
          </div>

          {/* Card Penjelasan Platform Sesuai Teks Asli */}
          <div className='dark:bg-slate-850/80 rounded-2xl border border-blue-200/50 bg-white/70 p-5 shadow-xs backdrop-blur-sm md:p-6 dark:border-slate-700/60'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm'>
                <Building2 className='h-5 w-5' />
              </div>
              <div className='space-y-1.5'>
                <h2 className='text-lg font-bold text-blue-800 md:text-xl dark:text-blue-300'>
                  Platform Pengumpulan Bukti Dukung RB
                </h2>
                <p className='text-xs leading-relaxed text-slate-600 md:text-sm dark:text-slate-300'>
                  Website ini merupakan platform digital untuk BPS Siau
                  Tagulandang Biaro dalam mengumpulkan, mengelola, dan
                  memvalidasi bukti dukung Reformasi Birokrasi (RB). Platform
                  ini dirancang untuk mendukung implementasi Zona Integritas
                  menuju Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi
                  Bersih dan Melayani (WBBM).
                </p>
              </div>
            </div>
          </div>

          {/* 4 Pilar Metrik Ringkas Soft */}
          <div className='grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4'>
            <div className='dark:border-slate-750 rounded-xl border border-blue-200/50 bg-white/50 p-3 backdrop-blur-xs transition-colors hover:bg-white/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'>
              <div className='flex items-center space-x-1.5 text-blue-600 dark:text-blue-400'>
                <Layers className='h-3.5 w-3.5' />
                <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                  Struktur LKE
                </span>
              </div>
              <p className='mt-1 text-base font-bold text-slate-800 dark:text-slate-100'>
                6 Pilar ZI
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                Pemenuhan &amp; Reform
              </p>
            </div>

            <div className='dark:border-slate-750 rounded-xl border border-emerald-200/50 bg-white/50 p-3 backdrop-blur-xs transition-colors hover:bg-white/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'>
              <div className='flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400'>
                <Target className='h-3.5 w-3.5' />
                <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                  Target Predikat
                </span>
              </div>
              <p className='mt-1 text-base font-bold text-slate-800 dark:text-slate-100'>
                WBK &ge; 75.00
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                WBBM &ge; 85.00
              </p>
            </div>

            <div className='dark:border-slate-750 rounded-xl border border-sky-200/50 bg-white/50 p-3 backdrop-blur-xs transition-colors hover:bg-white/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'>
              <div className='flex items-center space-x-1.5 text-sky-600 dark:text-sky-400'>
                <FolderSync className='h-3.5 w-3.5' />
                <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                  Folder GDrive
                </span>
              </div>
              <p className='mt-1 text-base font-bold text-slate-800 dark:text-slate-100'>
                1 Indikator
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                1 Folder Baku
              </p>
            </div>

            <div className='dark:border-slate-750 rounded-xl border border-indigo-200/50 bg-white/50 p-3 backdrop-blur-xs transition-colors hover:bg-white/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'>
              <div className='flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400'>
                <RefreshCw className='h-3.5 w-3.5' />
                <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                  Portal Pusat
                </span>
              </div>
              <p className='mt-1 text-base font-bold text-slate-800 dark:text-slate-100'>
                PMPRB Ready
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                Bridge Auto-Submit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Cepat Utama (Quick Action Hub) */}
      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <h2 className='flex items-center space-x-2 text-base font-bold tracking-tight text-slate-800 dark:text-slate-200'>
            <CheckCircle2 className='h-4.5 w-4.5 text-blue-600 dark:text-blue-400' />
            <span>Pusat Aksi Cepat</span>
          </h2>
          <span className='text-xs text-slate-500 dark:text-slate-400'>
            Pintasan akses dokumen &amp; reviu
          </span>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <Link href='/rebo/formRB/area'>
            <Button
              variant='outline'
              className='h-auto w-full justify-start border-blue-200/80 bg-blue-50/50 p-3 text-blue-900 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-100/70 dark:border-blue-900/60 dark:bg-blue-950/25 dark:text-blue-200 dark:hover:bg-blue-900/40'
            >
              <FileText className='mr-2.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
              <div className='text-left'>
                <div className='text-xs font-bold'>Input Bukti Dukung</div>
                <div className='text-[10px] font-normal text-blue-700/80 dark:text-blue-300/80'>
                  Area Pengungkit &amp; Hasil
                </div>
              </div>
            </Button>
          </Link>

          <Link href='/rebo/monitoring'>
            <Button
              variant='outline'
              className='h-auto w-full justify-start border-emerald-200/80 bg-emerald-50/50 p-3 text-emerald-900 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200 dark:hover:bg-emerald-900/40'
            >
              <TrendingUp className='mr-2.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <div className='text-left'>
                <div className='text-xs font-bold'>Monitoring Capaian</div>
                <div className='text-[10px] font-normal text-emerald-700/80 dark:text-emerald-300/80'>
                  Grafik &amp; Deviasi Nilai
                </div>
              </div>
            </Button>
          </Link>

          <Link href='/rebo/kanban'>
            <Button
              variant='outline'
              className='h-auto w-full justify-start border-amber-200/80 bg-amber-50/50 p-3 text-amber-900 shadow-2xs transition-all hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200 dark:hover:bg-amber-900/40'
            >
              <Kanban className='mr-2.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='text-left'>
                <div className='flex items-center gap-1.5 text-xs font-bold'>
                  <span>Kanban Tindak Lanjut</span>
                  <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500'></span>
                </div>
                <div className='text-[10px] font-normal text-amber-700/80 dark:text-amber-300/80'>
                  Kartu Perbaikan Bukti
                </div>
              </div>
            </Button>
          </Link>

          <a
            href='/api/export/lke'
            target='_blank'
            rel='noopener noreferrer'
            className='block'
          >
            <Button
              variant='outline'
              className='h-auto w-full justify-start border-slate-200/80 bg-slate-50/60 p-3 text-slate-800 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-slate-700/70 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-emerald-950/30'
            >
              <FileSpreadsheet className='mr-2.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <div className='text-left'>
                <div className='text-xs font-bold'>Unduh Excel LKE</div>
                <div className='text-[10px] font-normal text-slate-500 dark:text-slate-400'>
                  Format Resmi KemenPAN-RB
                </div>
              </div>
            </Button>
          </a>
        </div>
      </div>

      {/* Fitur Terbaru REBO (Compact Cards dengan Pembeda Khusus Admin) */}
      <div className='space-y-3.5'>
        <div className='space-y-1'>
          <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
            Fitur Terbaru REBO
          </h2>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Rangkaian kapabilitas platform digital untuk memudahkan seluruh tim
            kerja dan admin Satker BPS Sitaro.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Card 1: Form Bukti Dukung (Menggantikan QA Check sesuai instruksi user) */}
          <Card className='group flex flex-col justify-between border-slate-200/70 bg-white/80 p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-700'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'>
                  <FileText className='h-4.5 w-4.5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-blue-200 bg-blue-50/80 px-2 py-0 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                >
                  Tim Kerja
                </Badge>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Form Bukti Dukung
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                  Kelola dan submit bukti dukung RB dengan mudah
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Sistem pengumpulan dokumen bukti dukung yang terorganisir untuk
                mendukung implementasi zona integritas reformasi birokrasi.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/formRB/area'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full border-slate-200 bg-blue-50/40 text-xs font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100/60 dark:border-slate-700 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-900/40'
                >
                  Mulai Input <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: Reviu Berjenjang, Analisis Deviasi & Monitoring (HIGHLIGHTED) */}
          <Card className='group relative flex flex-col justify-between overflow-hidden border-emerald-300/90 bg-gradient-to-b from-emerald-50/70 via-white to-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-500 hover:shadow-md dark:border-emerald-700/70 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-slate-900/80'>
            {/* Soft highlight beacon accent bar */}
            <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500'></div>

            <div className='space-y-2.5 pt-0.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'>
                  <TrendingUp className='h-4.5 w-4.5' />
                </div>
                <div className='flex items-center space-x-1.5'>
                  <Badge className='border-emerald-300 bg-emerald-600 px-2 py-0 text-[10px] font-semibold text-white shadow-2xs'>
                    Highlight
                  </Badge>
                  <Badge
                    variant='outline'
                    className='border-emerald-300 bg-emerald-50 px-2 py-0 text-[10px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  >
                    Monitoring
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Reviu Berjenjang &amp; Analisis Deviasi
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400'>
                  Skor Usulan vs Skor Verifikasi TPI &bull; Monitoring Real-Time
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Validasi bertahap oleh Koordinator dan TPI, dilengkapi dashboard
                monitoring capaian nilai dan deteksi deviasi skor usulan secara
                akurat.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/monitoring'>
                <Button
                  size='sm'
                  className='h-8 w-full bg-emerald-600 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700'
                >
                  <Activity className='mr-1.5 h-3 w-3' />
                  Buka Monitoring Nilai <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: Kanban Tindak Lanjut */}
          <Card className='group flex flex-col justify-between border-slate-200/70 bg-white/80 p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-amber-700'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'>
                  <Kanban className='h-4.5 w-4.5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-amber-200 bg-amber-50/80 px-2 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                >
                  Task Tracking
                </Badge>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Kanban Board Tindak Lanjut
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                  Otomasi Kartu Tugas dari Catatan Revisi
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Setiap catatan revisi verifikator otomatis menjadi kartu tugas
                interaktif untuk memantau progres dan tenggat perbaikan berkas.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/kanban'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full border-slate-200 bg-amber-50/40 text-xs font-semibold text-amber-800 hover:border-amber-300 hover:bg-amber-100/60 dark:border-slate-700 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-900/40'
                >
                  Kelola Tindak Lanjut <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 4: Generator Google Drive (KHUSUS ADMIN) */}
          <Card className='group flex flex-col justify-between border-amber-300/80 bg-amber-50/25 p-4 transition-all duration-200 hover:border-amber-400 hover:shadow-md dark:border-amber-800/60 dark:bg-amber-950/15'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'>
                  <FolderSync className='h-4.5 w-4.5' />
                </div>
                <div className='flex items-center space-x-1.5'>
                  <Badge className='border-amber-400/80 bg-amber-500/15 px-2 py-0 text-[10px] font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                    <Lock className='mr-1 h-2.5 w-2.5' />
                    Khusus Admin
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Generator Struktur Google Drive
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400'>
                  1 Indikator = 1 Folder Khusus Standar
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Provisioning otomatis seluruh pohon folder Google Drive resmi
                instansi per indikator evaluasi dengan satu klik via skrip GAS.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/admin/gdrive-generator'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full border-amber-300 bg-white/80 text-xs font-semibold text-amber-800 hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-950/40'
                >
                  Buka Generator GDrive <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 5: Jembatan Web Pusat */}
          <Card className='group flex flex-col justify-between border-slate-200/70 bg-white/80 p-4 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'>
                  <RefreshCw className='h-4.5 w-4.5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-indigo-200 bg-indigo-50/80 px-2 py-0 text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                >
                  Integrasi Pusat
                </Badge>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Jembatan &amp; Auto-Submit Pusat
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                  Sinergi dengan Portal PMPRB Nasional
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Arsitektur sinkronisasi link bukti dukung terverifikasi ke
                portal evaluasi pusat via ekstensi REBO Sync Assistant.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/informasi'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full border-slate-200 bg-indigo-50/40 text-xs font-semibold text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100/60 dark:border-slate-700 dark:bg-indigo-950/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40'
                >
                  Pelajari Alur <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 6: Manajemen Periode & 1-Click Clone (KHUSUS ADMIN) */}
          <Card className='group flex flex-col justify-between border-amber-300/80 bg-amber-50/25 p-4 transition-all duration-200 hover:border-amber-400 hover:shadow-md dark:border-amber-800/60 dark:bg-amber-950/15'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'>
                  <CalendarCheck className='h-4.5 w-4.5' />
                </div>
                <div className='flex items-center space-x-1.5'>
                  <Badge className='border-amber-400/80 bg-amber-500/15 px-2 py-0 text-[10px] font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                    <Lock className='mr-1 h-2.5 w-2.5' />
                    Khusus Admin
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
                  Manajemen Periode &amp; Duplikasi
                </h3>
                <p className='mt-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400'>
                  Siklus Multi-Tahun Tanpa Data Tertimpa
                </p>
              </div>

              <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Pengaturan siklus evaluasi multi-periode tahunan (2025, 2026),
                fitur kloning indikator satu klik, dan proteksi arsip.
              </p>
            </div>

            <div className='pt-3.5'>
              <Link href='/rebo/admin/periode'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full border-amber-300 bg-white/80 text-xs font-semibold text-amber-800 hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-950/40'
                >
                  Kelola Periode <ArrowRight className='ml-1 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Alur Kolaborasi ZI */}
      <Card className='border-blue-200/50 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50/50 dark:border-slate-800 dark:from-slate-900/60 dark:via-blue-950/20 dark:to-slate-900/60'>
        <CardContent className='space-y-4 p-5 md:p-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h3 className='flex items-center space-x-2 text-base font-bold text-slate-800 dark:text-slate-100'>
                <Building2 className='h-4.5 w-4.5 text-blue-600 dark:text-blue-400' />
                <span>Alur Kerja Menuju Predikat WBK &amp; WBBM</span>
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Tahapan berjenjang di REBO untuk menjamin kelayakan bukti dukung
                BPS Sitaro sebelum dikirim ke pusat.
              </p>
            </div>
            <Link href='/rebo/informasi'>
              <Button
                size='sm'
                variant='outline'
                className='dark:bg-slate-850 h-8 shrink-0 border-blue-200 bg-white text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300'
              >
                <BookOpen className='mr-1.5 h-3.5 w-3.5' />
                Pusat Informasi &amp; Bagan
              </Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-xl border border-white/80 bg-white/70 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
              <div className='flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400'>
                <span className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                  1
                </span>
                <span>Penyusunan Bukti</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Operator Tim Kerja
              </p>
              <p className='mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400'>
                Unggah berkas ke GDrive resmi dan input klaim nilai mandiri.
              </p>
            </div>

            <div className='rounded-xl border border-white/80 bg-white/70 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
              <div className='flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400'>
                <span className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
                  2
                </span>
                <span>Reviu Koordinator</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Koordinator Pilar 1 s.d 6
              </p>
              <p className='mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400'>
                Periksa kesesuaian berkas; berikan catatan perbaikan bila perlu.
              </p>
            </div>

            <div className='rounded-xl border border-white/80 bg-white/70 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
              <div className='flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400'>
                <span className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-100 text-[10px] text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'>
                  3
                </span>
                <span>Pre-Audit &amp; QA</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                TPI &amp; Ketua ZI
              </p>
              <p className='mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400'>
                Verifikasi izin akses tautan dan uji kelengkapan dokumen wajib.
              </p>
            </div>

            <div className='rounded-xl border border-white/80 bg-white/70 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
              <div className='flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                <span className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
                  4
                </span>
                <span>Sinkronisasi Pusat</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Asesmen Nasional
              </p>
              <p className='mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400'>
                Data terverifikasi siap disubmit ke portal PMPRB nasional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
