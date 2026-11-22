import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  ShieldCheck,
  RefreshCw,
  CalendarCheck,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  BookOpen
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
    <div className='mx-auto max-w-7xl space-y-8 p-4 md:p-8'>
      {/* Hero Section dengan Latar Ambient Bernyawa (Live Animated Background) */}
      <div className='relative overflow-hidden rounded-3xl border border-blue-800/40 bg-gradient-to-br from-blue-900 via-[#003366] to-[#002244] p-6 text-white shadow-xl md:p-10'>
        {/* Latar Belakang Bokeh Cahaya Bergerak Halus */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='animate-pulse-glow absolute -top-12 -left-12 h-64 w-64 rounded-full bg-[#f59e0b]/20 blur-3xl'></div>
          <div className='animate-float-slow absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl'></div>
          <div className='animate-float-reverse absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-indigo-400/15 blur-2xl'></div>
        </div>

        <div className='relative z-10 space-y-6'>
          {/* Header Baris Status & Salam */}
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center space-x-2.5'>
              <Badge className='border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm'>
                {greeting}, Tim Kerja ZI 👋
              </Badge>
              <div className='inline-flex items-center space-x-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-sm'>
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
                </span>
                <span>Sistem Aktif &bull; V2.0.0</span>
              </div>
            </div>

            <span className='rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm'>
              BPS Kab. Kepulauan Siau Tagulandang Biaro
            </span>
          </div>

          {/* Judul & Slogan Utama */}
          <div className='max-w-3xl space-y-2.5'>
            <h1 className='text-3xl leading-tight font-black tracking-tight text-white md:text-5xl'>
              Platform Evaluasi & Tata Kelola Bukti Dukung{' '}
              <span className='bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent'>
                REBO V2
              </span>
            </h1>
            <p className='text-sm leading-relaxed font-normal text-slate-200/90 md:text-base'>
              Akselerasi digitalisasi Lembar Kerja Evaluasi (LKE) PMPRB dengan
              standardisasi struktur Google Drive, alur verifikasi berjenjang
              internal, dan integrasi pengumpulan menuju predikat{' '}
              <strong className='font-semibold text-amber-300'>
                Wilayah Bebas dari Korupsi (WBK) &amp; WBBM
              </strong>
              .
            </p>
          </div>

          {/* 4 Pilar Metrik Ringkas Eksekutif */}
          <div className='grid grid-cols-2 gap-3 pt-2 md:grid-cols-4'>
            <div className='rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15'>
              <div className='mb-1 flex items-center space-x-2 text-amber-300'>
                <Layers className='h-4 w-4' />
                <span className='text-xs font-semibold tracking-wider text-slate-200 uppercase'>
                  Struktur LKE
                </span>
              </div>
              <p className='text-lg font-bold text-white md:text-xl'>
                6 Pilar ZI
              </p>
              <p className='text-[11px] text-slate-300'>
                Pemenuhan &amp; Reform
              </p>
            </div>

            <div className='rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15'>
              <div className='mb-1 flex items-center space-x-2 text-emerald-300'>
                <Target className='h-4 w-4' />
                <span className='text-xs font-semibold tracking-wider text-slate-200 uppercase'>
                  Target Predikat
                </span>
              </div>
              <p className='text-lg font-bold text-white md:text-xl'>
                WBK &ge; 75.00
              </p>
              <p className='text-[11px] text-slate-300'>WBBM &ge; 85.00</p>
            </div>

            <div className='rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15'>
              <div className='mb-1 flex items-center space-x-2 text-sky-300'>
                <FolderSync className='h-4 w-4' />
                <span className='text-xs font-semibold tracking-wider text-slate-200 uppercase'>
                  Folder GDrive
                </span>
              </div>
              <p className='text-lg font-bold text-white md:text-xl'>
                1 Indikator
              </p>
              <p className='text-[11px] text-slate-300'>1 Folder Baku Resmi</p>
            </div>

            <div className='rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15'>
              <div className='mb-1 flex items-center space-x-2 text-rose-300'>
                <RefreshCw className='h-4 w-4' />
                <span className='text-xs font-semibold tracking-wider text-slate-200 uppercase'>
                  Portal Pusat
                </span>
              </div>
              <p className='text-lg font-bold text-white md:text-xl'>
                PMPRB Ready
              </p>
              <p className='text-[11px] text-slate-300'>Sinkronisasi Instan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Cepat Utama (Quick Action Hub) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='flex items-center space-x-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100'>
            <Sparkles className='h-5 w-5 text-amber-500' />
            <span>Pusat Aksi Cepat</span>
          </h2>
          <span className='text-muted-foreground text-xs'>
            Pintasan langsung ke instrumen inti
          </span>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Link href='/rebo/formRB/area'>
            <Button className='h-auto w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700'>
              <FileText className='mr-3 h-5 w-5 shrink-0 text-blue-200' />
              <div className='text-left'>
                <div className='text-sm font-bold'>Input Bukti Dukung</div>
                <div className='text-[11px] font-normal text-blue-100/90'>
                  Area Pengungkit &amp; Hasil
                </div>
              </div>
            </Button>
          </Link>

          <Link href='/rebo/monitoring'>
            <Button className='h-auto w-full justify-start bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:from-emerald-700 hover:to-teal-700'>
              <TrendingUp className='mr-3 h-5 w-5 shrink-0 text-emerald-200' />
              <div className='text-left'>
                <div className='text-sm font-bold'>Monitoring Capaian</div>
                <div className='text-[11px] font-normal text-emerald-100/90'>
                  Grafik &amp; Deviasi Nilai
                </div>
              </div>
            </Button>
          </Link>

          <Link href='/rebo/kanban'>
            <Button className='relative h-auto w-full justify-start overflow-hidden bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-3.5 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:from-rose-700 hover:to-amber-700'>
              <Kanban className='mr-3 h-5 w-5 shrink-0 text-amber-200' />
              <div className='text-left'>
                <div className='flex items-center gap-1.5 text-sm font-bold'>
                  <span>Kanban Tindak Lanjut</span>
                  <span className='h-2 w-2 animate-pulse rounded-full bg-amber-300'></span>
                </div>
                <div className='text-[11px] font-normal text-amber-100/90'>
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
              className='h-auto w-full justify-start border-emerald-300/80 bg-emerald-50/50 px-4 py-3.5 text-emerald-800 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-emerald-500 hover:bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30'
            >
              <FileSpreadsheet className='mr-3 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <div className='text-left'>
                <div className='text-sm font-bold'>Unduh Excel LKE (.xlsx)</div>
                <div className='text-[11px] font-normal text-emerald-600/90 dark:text-emerald-400/80'>
                  Format Resmi KemenPAN-RB
                </div>
              </div>
            </Button>
          </a>
        </div>
      </div>

      {/* Fitur-Fitur Unggulan Terbaru REBO V2 */}
      <div className='space-y-4'>
        <div className='space-y-1'>
          <div className='inline-flex items-center space-x-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'>
            <Award className='h-3.5 w-3.5' />
            <span>Peningkatan Sistem V2.0.0</span>
          </div>
          <h2 className='text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100'>
            Fitur &amp; Inovasi Terbaru REBO V2
          </h2>
          <p className='text-muted-foreground text-sm'>
            Fitur khusus yang dikembangkan untuk menyempurnakan alur kerja
            satker daerah dan menjembatani pengumpulan bukti ke portal pusat.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Fitur 1: Otomasi GDrive */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-blue-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-transform group-hover:scale-110 dark:bg-blue-900/40 dark:text-blue-300'>
                  <FolderSync className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                >
                  Otomasi Folder
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Generator Struktur Google Drive Baku
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  1 Indikator = 1 Folder Khusus Standar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Penataan hierarkis folder Google Drive secara otomatis per
                indikator evaluasi dengan skrip Google Apps Script (GAS) untuk
                instan provisioning seluruh pohon folder instansi.
              </p>
              <Link href='/rebo/admin/gdrive-generator'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-950/30'
                >
                  Buka Generator GDrive{' '}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fitur 2: QA Permission Guard */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-sky-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-transform group-hover:scale-110 dark:bg-sky-900/40 dark:text-sky-300'>
                  <ShieldCheck className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-sky-200 bg-sky-50 text-[10px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                >
                  Quality Assurance
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Pre-Audit &amp; Permission Health Check
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  Cegah Bukti Ditolak karena Izin Terkunci
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Pengecekan otomatis izin akses tautan Google Drive (*Anyone with
                link can view*) serta checklist dokumen wajib (Undangan, Daftar
                Hadir, Notula, Laporan, Foto) sebelum disetujui internal.
              </p>
              <Link href='/rebo/informasi'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:hover:bg-sky-950/30'
                >
                  Lihat Standar Dokumen{' '}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fitur 3: Dual-Scoring & Verifikasi Berjenjang */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-emerald-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-110 dark:bg-emerald-900/40 dark:text-emerald-300'>
                  <TrendingUp className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                >
                  Dual-Scoring
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Reviu Berjenjang &amp; Analisis Deviasi
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  Skor Usulan vs Skor Verifikasi TPI
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Validasi berjenjang oleh Koordinator Pilar dan Tim Penilai
                Internal (TPI). Sistem otomatis menghitung deviasi antara klaim
                nilai tim kerja dan capaian verifikasi resmi.
              </p>
              <Link href='/rebo/monitoring'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-950/30'
                >
                  Buka Monitoring Nilai{' '}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fitur 4: Kanban Tindak Lanjut */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-amber-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-transform group-hover:scale-110 dark:bg-amber-900/40 dark:text-amber-300'>
                  <Kanban className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                >
                  Task Tracking
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Kanban Board Tindak Lanjut
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  Otomasi Kartu Tugas dari Catatan Revisi
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Setiap catatan revisi dari verifikator otomatis menjadi kartu
                to-do pada Kanban Board. Memudahkan tim pilar memantau batas
                waktu (*deadline*) pemenuhan dokumen.
              </p>
              <Link href='/rebo/kanban'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:hover:bg-amber-950/30'
                >
                  Kelola Tindak Lanjut{' '}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fitur 5: Jembatan Web Pusat */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-indigo-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 transition-transform group-hover:scale-110 dark:bg-indigo-900/40 dark:text-indigo-300'>
                  <RefreshCw className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-indigo-200 bg-indigo-50 text-[10px] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                >
                  Integrasi Pusat
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Jembatan &amp; Auto-Submit Web Pusat
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  Sinergi dengan Portal PMPRB Nasional
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Arsitektur sinkronisasi link GDrive yang siap kirim ke portal
                evaluasi pusat via ekstensi REBO Sync Assistant dengan penanda
                status alur pengiriman yang transparan.
              </p>
              <Link href='/rebo/informasi'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-indigo-950/30'
                >
                  Pelajari Arsitektur{' '}
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fitur 6: Multi-Periode Lifecycle */}
          <Card className='group flex flex-col justify-between border-slate-200/80 transition-all duration-300 hover:border-purple-400/80 hover:shadow-lg dark:border-slate-800'>
            <CardHeader className='space-y-3 pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition-transform group-hover:scale-110 dark:bg-purple-900/40 dark:text-purple-300'>
                  <CalendarCheck className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-purple-200 bg-purple-50 text-[10px] text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                >
                  Multi-Periode
                </Badge>
              </div>
              <div>
                <CardTitle className='text-base font-bold text-slate-800 dark:text-slate-100'>
                  Manajemen Periode &amp; 1-Click Clone
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  Siklus Tahunan Tanpa Tertimpa
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Dukungan evaluasi multi-tahun (2024, 2025, 2026), fitur
                duplikasi hierarki indikator tahun baru dalam satu klik, serta
                penguncian periode lampau (*freeze/read-only*).
              </p>
              <Link href='/rebo/admin/periode'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-slate-300 text-xs hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:hover:bg-purple-950/30'
                >
                  Kelola Periode <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Roadmap & Alur Kolaborasi ZI */}
      <Card className='border-blue-200/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:border-slate-800 dark:from-slate-900/70 dark:via-blue-950/20 dark:to-slate-900'>
        <CardContent className='space-y-6 p-6 md:p-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1.5'>
              <h3 className='flex items-center space-x-2 text-xl font-bold text-slate-800 dark:text-slate-100'>
                <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                <span>Alur Kerja Menuju Predikat WBK &amp; WBBM</span>
              </h3>
              <p className='text-muted-foreground max-w-2xl text-xs'>
                Tahapan berjenjang yang diterapkan di REBO V2 untuk memastikan
                integritas, kelayakan, dan ketuntasan bukti dukung satker BPS
                Kepulauan Sitaro.
              </p>
            </div>
            <Link href='/rebo/informasi'>
              <Button
                size='sm'
                className='shrink-0 bg-[#003366] text-white shadow-sm hover:bg-[#002244]'
              >
                <BookOpen className='mr-1.5 h-4 w-4' />
                Pusat Informasi &amp; Bagan RB
              </Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='mb-1 flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400'>
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                  1
                </span>
                <span>Penyusunan Bukti</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Operator Tim Kerja
              </p>
              <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug'>
                Mengunggah berkas ke folder GDrive resmi dan mengisi klaim nilai
                mandiri.
              </p>
            </div>

            <div className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='mb-1 flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400'>
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
                  2
                </span>
                <span>Reviu Koordinator</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Koordinator Pilar 1 s.d 6
              </p>
              <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug'>
                Memeriksa kesesuaian berkas; memberi catatan revisi jika belum
                memenuhi syarat.
              </p>
            </div>

            <div className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='mb-1 flex items-center space-x-2 text-xs font-bold text-sky-600 dark:text-sky-400'>
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'>
                  3
                </span>
                <span>Pre-Audit &amp; QA</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                TPI &amp; Ketua ZI
              </p>
              <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug'>
                Validasi izin akses link dan uji kelengkapan dokumen wajib
                sebelum pengesahan.
              </p>
            </div>

            <div className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='mb-1 flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
                  4
                </span>
                <span>Sinkronisasi Pusat</span>
              </div>
              <p className='mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                Asesmen Nasional
              </p>
              <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug'>
                Data terverifikasi siap di-submit ke portal PMPRB untuk
                penilaian Tim Asesor Pusat.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
