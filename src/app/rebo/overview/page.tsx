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
  Users,
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function Overview() {
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? 'Selamat Pagi'
      : currentTime < 18
        ? 'Selamat Siang'
        : 'Selamat Malam';

  return (
    <div className='space-y-8 p-6'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-purple-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

        {/* Decorative elements */}
        <div className='absolute top-0 left-0 h-full w-full'>
          <div className='absolute top-4 left-4 h-16 w-16 animate-pulse rounded-full bg-blue-200/20 blur-xl dark:bg-blue-400/10'></div>
          <div className='absolute right-8 bottom-8 h-20 w-20 animate-pulse rounded-full bg-indigo-200/25 blur-2xl dark:bg-indigo-400/15'></div>
          <div className='absolute top-1/2 left-1/3 h-12 w-12 animate-pulse rounded-full bg-purple-200/30 blur-lg dark:bg-purple-400/20'></div>
        </div>

        <div className='relative z-10 space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Badge
                variant='outline'
                className='border-blue-300/40 bg-blue-100/50 text-blue-700 dark:border-blue-600/40 dark:bg-blue-900/30 dark:text-blue-300'
              >
                {greeting}
              </Badge>
              <span className='text-blue-600/80 dark:text-blue-400/80'>👋</span>
            </div>

            <h1 className='bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent dark:from-slate-200 dark:via-blue-400 dark:to-indigo-400'>
              Hai, Selamat Datang Kembali!
            </h1>

            <p className='text-xl text-slate-700 dark:text-slate-300'>
              Selamat datang di platform REBO - Zona Integritas Reformasi
              Birokrasi
            </p>
          </div>

          <div className='rounded-2xl border border-blue-200/30 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-600/30 dark:bg-slate-800/60'>
            <div className='flex items-start space-x-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500'>
                <Building2 className='h-6 w-6 text-white' />
              </div>
              <div className='space-y-3'>
                <h2 className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                  Platform Pengumpulan Bukti Dukung RB
                </h2>
                <p className='leading-relaxed text-slate-600 dark:text-slate-300'>
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
        </div>
      </div>

      {/* Features Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='border-slate-200/60 transition-all duration-300 hover:border-blue-300/60 hover:shadow-lg dark:border-slate-700/60 dark:hover:border-blue-600/60'>
          <CardHeader className='space-y-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100/80 to-indigo-100/60 dark:from-blue-900/40 dark:to-indigo-900/30'>
              <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-slate-800 dark:text-slate-200'>
                Form Bukti Dukung
              </CardTitle>
              <CardDescription>
                Kelola dan submit bukti dukung RB dengan mudah
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4 text-sm'>
              Sistem pengumpulan dokumen bukti dukung yang terorganisir untuk
              mendukung implementasi zona integritas reformasi birokrasi.
            </p>
            <Link href='/rebo/formRB/area'>
              <Button
                variant='outline'
                size='sm'
                className='w-full border-slate-300/60 text-slate-700 hover:border-blue-300/60 hover:bg-blue-50 dark:border-slate-600/60 dark:text-slate-300 dark:hover:border-blue-600/60 dark:hover:bg-blue-900/20'
              >
                Mulai Input <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='border-slate-200/60 transition-all duration-300 hover:border-blue-300/60 hover:shadow-lg dark:border-slate-700/60 dark:hover:border-blue-600/60'>
          <CardHeader className='space-y-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100/80 to-green-100/60 dark:from-emerald-900/40 dark:to-green-900/30'>
              <Target className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div>
              <CardTitle className='text-slate-800 dark:text-slate-200'>
                Monitoring Progress
              </CardTitle>
              <CardDescription>
                Pantau kemajuan implementasi RB secara real-time
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4 text-sm'>
              Dashboard komprehensif untuk memantau progress dan pencapaian
              target zona integritas.
            </p>
            <Link href='/rebo/monitoring'>
              <Button
                variant='outline'
                size='sm'
                className='w-full border-slate-300/60 text-slate-700 hover:border-emerald-300/60 hover:bg-emerald-50 dark:border-slate-600/60 dark:text-slate-300 dark:hover:border-emerald-600/60 dark:hover:bg-emerald-900/20'
              >
                Lihat Progress <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='border-slate-200/60 transition-all duration-300 hover:border-blue-300/60 hover:shadow-lg dark:border-slate-700/60 dark:hover:border-blue-600/60'>
          <CardHeader className='space-y-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100/80 to-indigo-100/60 dark:from-purple-900/40 dark:to-indigo-900/30'>
              <Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
            </div>
            <div>
              <CardTitle className='text-slate-800 dark:text-slate-200'>
                Kolaborasi Tim
              </CardTitle>
              <CardDescription>
                Bekerja sama dalam implementasi zona integritas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4 text-sm'>
              Platform kolaboratif untuk koordinasi antar tim dalam mencapai
              standar WBK dan WBBM.
            </p>
            <Link href='/rebo/admin'>
              <Button
                variant='outline'
                size='sm'
                className='w-full border-slate-300/60 text-slate-700 hover:border-purple-300/60 hover:bg-purple-50 dark:border-slate-600/60 dark:text-slate-300 dark:hover:border-purple-600/60 dark:hover:bg-purple-900/20'
              >
                Manjemen Role <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='border-slate-200/60 dark:border-slate-700/60'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2 text-slate-800 dark:text-slate-200'>
            <CheckCircle className='h-5 w-5' />
            <span>Aksi Cepat</span>
          </CardTitle>
          <CardDescription>Akses fitur utama dengan satu klik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <Link href='/rebo/formRB/'>
              <Button className='w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'>
                <FileText className='mr-2 h-4 w-4' />
                Input Bukti Dukung Baru
              </Button>
            </Link>
            <Button
              variant='outline'
              className='justify-start border-slate-300/60 text-slate-700 hover:border-blue-300/60 hover:bg-blue-50 dark:border-slate-600/60 dark:text-slate-300 dark:hover:border-blue-600/60 dark:hover:bg-blue-900/20'
            >
              <Target className='mr-2 h-4 w-4' />
              Lihat Dashboard RB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className='rounded-xl border border-blue-200/40 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-6 dark:border-slate-600/40 dark:from-slate-800/50 dark:to-slate-700/30'>
        <div className='flex items-center space-x-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500'>
            <span className='text-sm font-bold text-white'>i</span>
          </div>
          <div>
            <p className='font-medium text-slate-800 dark:text-slate-200'>
              BPS Siau Tagulandang Biaro
            </p>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Komitmen kami untuk mewujudkan birokrasi yang bersih, akuntabel,
              dan melayani
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
