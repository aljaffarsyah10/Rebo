import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import ScoreEditor from '@/app/rebo/pilarHasil/score-editor';

export default async function PilarHasilPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from('pilarHasil')
    .select('*')
    .order('id_pilarHasil', { ascending: true });

  if (error) {
    console.error('Error fetching pilarHasil:', error.message);
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
            <p className='mb-2'>
              Terjadi kesalahan saat mengambil data pilar hasil:
            </p>
            <p className='rounded border bg-red-100 p-2 font-mono dark:border-red-700 dark:bg-red-900/40'>
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Aspek Hasil
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Daftar Pilar dari Aspek Hasil
          </p>
        </div>
        <Button className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'>
          Refresh
        </Button>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        {rows && rows.length > 0 ? (
          <ul>
            {rows.map((r: any) => (
              <li
                key={r.id_pilarHasil}
                className='flex items-center justify-between border-b border-gray-100 p-4 last:border-0 dark:border-gray-800'
              >
                <div>
                  <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {r.nama_pilarHasil}
                  </div>
                  {r.deskripsi && (
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {r.deskripsi}
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  {/* Score editor client component */}
                  <ScoreEditor
                    id_pilarHasil={r.id_pilarHasil}
                    initialSkor={r.skor}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='p-6 text-center text-sm text-gray-500 dark:text-gray-400'>
            Tidak ada data pilar hasil.
          </div>
        )}
      </div>
    </div>
  );
}
