// app/features/products/components/product-listing.tsx
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Settings } from 'lucide-react';

export default async function ProductListingPage() {
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

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              Pilar Reformasi Birokrasi
            </h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Kelola dan pantau semua pilar reformasi birokrasi
            </p>
          </div>
          <Button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'>
            <Settings className='h-4 w-4' />
            Pengaturan
          </Button>
        </div>
      </div>

      {/* Pilar List by Area */}
      <div className='space-y-8'>
        {/* Area 1 Section */}
        <div>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white dark:bg-blue-600'>
              1
            </div>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
              {pilarsArea1[0]?.area?.nama_area || 'Area 1'}
            </h2>
            <div className='h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-600'></div>
          </div>

          {pilarsArea1.length > 0 ? (
            <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
              {pilarsArea1.map((pilar: any, index: number) => (
                <div
                  key={`area1-${pilar.id_pilar}`}
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    index !== pilarsArea1.length - 1
                      ? 'border-b border-gray-200 dark:border-gray-700'
                      : ''
                  }`}
                >
                  {/* Left Side - Pilar Info */}
                  <div className='flex flex-1 items-center gap-4'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white dark:bg-blue-600'>
                      {pilar.id_pilar}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                        {pilar.nama_pilar}
                      </h3>
                      {pilar.deskripsi_pilar && (
                        <p className='mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                          {pilar.deskripsi_pilar}
                        </p>
                      )}
                      {pilar.area && (
                        <div className='mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/30'>
                          <span className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                            {pilar.area.nama_area}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className='ml-4 flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      Detail
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:border-green-300 hover:bg-green-50 dark:hover:border-green-600 dark:hover:bg-green-900/20'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600'>
              <p className='text-gray-500 dark:text-gray-400'>
                Tidak ada pilar untuk Area 1
              </p>
            </div>
          )}
        </div>

        {/* Area 2 Section */}
        <div>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white dark:bg-purple-600'>
              2
            </div>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
              {pilarsArea2[0]?.area?.nama_area || 'Area 2'}
            </h2>
            <div className='h-px flex-1 bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-600'></div>
          </div>

          {pilarsArea2.length > 0 ? (
            <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
              {pilarsArea2.map((pilar: any, index: number) => (
                <div
                  key={`area2-${pilar.id_pilar}`}
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    index !== pilarsArea2.length - 1
                      ? 'border-b border-gray-200 dark:border-gray-700'
                      : ''
                  }`}
                >
                  {/* Left Side - Pilar Info */}
                  <div className='flex flex-1 items-center gap-4'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white dark:bg-purple-600'>
                      {pilar.id_pilar}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                        {pilar.nama_pilar}
                      </h3>
                      {pilar.deskripsi_pilar && (
                        <p className='mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                          {pilar.deskripsi_pilar}
                        </p>
                      )}
                      {pilar.area && (
                        <div className='mt-2 inline-block rounded-full bg-purple-100 px-2 py-1 dark:bg-purple-900/30'>
                          <span className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                            {pilar.area.nama_area}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className='ml-4 flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-600 dark:hover:bg-purple-900/20'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      Detail
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:border-green-300 hover:bg-green-50 dark:hover:border-green-600 dark:hover:bg-green-900/20'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600'>
              <p className='text-gray-500 dark:text-gray-400'>
                Tidak ada pilar untuk Area 2
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {pilarsArea1.length === 0 && pilarsArea2.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800'>
            <Settings className='h-8 w-8 text-gray-400 dark:text-gray-600' />
          </div>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Belum ada data pilar
          </h3>
          <p className='max-w-md text-center text-gray-600 dark:text-gray-400'>
            Data pilar reformasi birokrasi belum tersedia. Silakan tambahkan
            data pilar terlebih dahulu.
          </p>
        </div>
      )}
    </div>
  );
}
