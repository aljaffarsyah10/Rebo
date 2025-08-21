import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AreaPage() {
  const supabase = await createClient();

  const { data: pilarsData, error } = await supabase
    .from('pilar')
    .select(
      `
      *,
      area (*)
    `
    )
    .order('id_pilar', { ascending: true });

  if (error) {
    console.error('Error fetching pilars:', error.message);
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20'>
          <div className='mb-4 flex items-center'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400 dark:text-red-500'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800 dark:text-red-400'>
                Error Loading Data
              </h3>
            </div>
          </div>
          <div className='text-sm text-red-700 dark:text-red-300'>
            <p className='mb-2'>Terjadi kesalahan saat mengambil data pilar:</p>
            <p className='rounded border bg-red-100 p-2 font-mono dark:border-red-700 dark:bg-red-900/40'>
              {error.message}
            </p>
            <p className='mt-2 text-xs text-red-600 dark:text-red-400'>
              Silakan coba refresh halaman atau hubungi administrator jika
              masalah berlanjut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pisahkan data berdasarkan area
  const pilarsArea1 = pilarsData?.filter((pilar) => pilar.id_area === 1) || [];
  const pilarsArea2 = pilarsData?.filter((pilar) => pilar.id_area === 2) || [];

  // Ambil nama area dari data
  const namaArea1 = pilarsArea1[0]?.area?.nama_area || 'Pemenuhan';
  const namaArea2 = pilarsArea2[0]?.area?.nama_area || 'Reform';
  return (
    <div className='container mx-auto max-w-6xl p-6'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              Area Reformasi Birokrasi
            </h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Pilih area untuk mengelola pilar reformasi birokrasi
            </p>
          </div>
          <Button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'>
            <Settings className='h-4 w-4' />
            Pengaturan
          </Button>
        </div>
      </div>

      {/* Area Cards */}
      <div className='grid gap-8 md:grid-cols-2'>
        {/* Pemenuhan Container */}
        <div className='group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900'>
          {/* Background Gradient */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 opacity-50 transition-opacity duration-300 group-hover:opacity-70 dark:from-blue-900/20 dark:to-blue-800/20'></div>

          {/* Content */}
          <div className='relative z-10'>
            <div className='mb-6 flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg dark:bg-blue-600'>
                <FileText className='h-6 w-6' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {namaArea1}
                </h2>
                <div className='flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white dark:bg-blue-600'>
                    1
                  </div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    Area 1 • {pilarsArea1.length} Pilar
                  </span>
                </div>
              </div>
            </div>

            <p className='mb-8 leading-relaxed text-gray-600 dark:text-gray-300'>
              Kelola dan pantau pilar-pilar pemenuhan yang menjadi fondasi dalam
              reformasi birokrasi. Area ini mencakup aspek-aspek fundamental
              yang mendukung transformasi organisasi.
            </p>

            {/* Features - Dynamic from database */}
            <div className='mb-8 space-y-3'>
              {pilarsArea1.map((pilar: any, index: number) => (
                <div
                  key={pilar.id_pilar}
                  className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400'
                >
                  <div className='h-1.5 w-1.5 rounded-full bg-blue-500'></div>
                  <span>{pilar.nama_pilar}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <Link href='/rebo/formRB/pemenuhan'>
              <Button
                className='group/btn w-full bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                disabled={pilarsArea1.length === 0}
              >
                <span>Akses {namaArea1}</span>
                <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1' />
              </Button>
            </Link>
          </div>
        </div>

        {/* Reform Container */}
        <div className='group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900'>
          {/* Background Gradient */}
          <div className='absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-purple-100 opacity-50 transition-opacity duration-300 group-hover:opacity-70 dark:from-purple-900/20 dark:to-purple-800/20'></div>

          {/* Content */}
          <div className='relative z-10'>
            <div className='mb-6 flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg dark:bg-purple-600'>
                <Settings className='h-6 w-6' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {namaArea2}
                </h2>
                <div className='flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white dark:bg-purple-600'>
                    2
                  </div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    Area 2 • {pilarsArea2.length} Pilar
                  </span>
                </div>
              </div>
            </div>

            <p className='mb-8 leading-relaxed text-gray-600 dark:text-gray-300'>
              Kelola dan pantau pilar-pilar reformasi yang berfokus pada
              peningkatan kualitas pelayanan dan tata kelola pemerintahan yang
              lebih efektif dan efisien.
            </p>

            {/* Features - Dynamic from database */}
            <div className='mb-8 space-y-3'>
              {pilarsArea2.map((pilar: any, index: number) => (
                <div
                  key={pilar.id_pilar}
                  className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400'
                >
                  <div className='h-1.5 w-1.5 rounded-full bg-purple-500'></div>
                  <span>{pilar.nama_pilar}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <Link href='/rebo/formRB/reform'>
              <Button
                className='group/btn w-full bg-purple-600 text-white transition-all duration-200 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800'
                disabled={pilarsArea2.length === 0}
              >
                <span>Akses {namaArea2}</span>
                <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1' />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className='mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20'>
        <div className='flex items-start gap-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white dark:bg-blue-600'>
            <FileText className='h-4 w-4' />
          </div>
          <div>
            <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-200'>
              Informasi Area Reformasi Birokrasi
            </h3>
            <p className='text-sm leading-relaxed text-blue-800 dark:text-blue-300'>
              Reformasi Birokrasi terdiri dari 2 area utama dengan total{' '}
              {pilarsData?.length || 0} pilar. Area {namaArea1} mencakup{' '}
              {pilarsArea1.length} pilar fundamental, sedangkan Area {namaArea2}{' '}
              mencakup {pilarsArea2.length} pilar yang berfokus pada peningkatan
              kualitas pelayanan dan tata kelola.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
