// app/features/products/components/product-listing.tsx
import { createClient } from '@/lib/supabase/server';

export default async function manejemenPerubahan() {
  const supabase = await createClient();

  const { data: subpilarjoinpertanyaan, error } = await supabase
    .from('subpilar')
    .select(
      `
      *,
      pertanyaan (
        *,
        kategoriPenilaian (*)
      )
    `
    )
    .eq('id_pilar', 1)
    .order('id_subpilar', { ascending: true });

  if (error) {
    console.error('Error fetching subpilar:', error.message);
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
          <div className='mb-4 flex items-center'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
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
              <h3 className='text-sm font-medium text-red-800'>
                Error Loading Data
              </h3>
            </div>
          </div>
          <div className='text-sm text-red-700'>
            <p className='mb-2'>
              Terjadi kesalahan saat mengambil data subpilar:
            </p>
            <p className='rounded border bg-red-100 p-2 font-mono'>
              {error.message}
            </p>
            <p className='mt-2 text-xs text-red-600'>
              Silakan coba refresh halaman atau hubungi administrator jika
              masalah berlanjut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Subpilar Manajemen Perubahan
        </h1>
      </div>

      <div className='space-y-8'>
        {subpilarjoinpertanyaan.map((subpilar) => (
          <div
            key={subpilar.id_subpilar}
            className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
          >
            <div className='mb-4'>
              <h3 className='text-xl font-bold text-gray-800'>
                {subpilar.id_subpilar}. {subpilar.nama_subpilar}
              </h3>
              <p className='mt-2 leading-relaxed text-gray-600'>
                {subpilar.deskripsi_subpilar}
              </p>
            </div>

            {/* Tampilkan pertanyaan-pertanyaan */}
            {subpilar.pertanyaan && subpilar.pertanyaan.length > 0 && (
              <div className='mt-6 border-l-4 border-blue-200 pl-4'>
                <h4 className='mb-4 text-lg font-semibold text-gray-700'>
                  Pertanyaan:
                </h4>
                <div className='space-y-3'>
                  {subpilar.pertanyaan.map((pertanyaan, index) => (
                    <div
                      key={pertanyaan.id_pertanyaan}
                      className='rounded-md border border-gray-100 bg-gray-50 p-4'
                    >
                      <p className='mb-2 font-medium text-gray-800'>
                        {index + 1}. {pertanyaan.pertanyaan}
                      </p>
                      {pertanyaan.deskripsi_pertanyaan && (
                        <p className='mb-3 text-sm leading-relaxed text-gray-600'>
                          {pertanyaan.deskripsi_pertanyaan}
                        </p>
                      )}

                      {/* Dropdown Kategori Penilaian */}
                      {pertanyaan.kategoriPenilaian &&
                        pertanyaan.kategoriPenilaian.length > 0 && (
                          <div className='mt-4 border-t border-gray-200 pt-4'>
                            <label
                              htmlFor={`kategori-${pertanyaan.id_pertanyaan}`}
                              className='mb-2 block text-sm font-medium text-gray-700'
                            >
                              Kategori Penilaian:
                            </label>
                            <select
                              id={`kategori-${pertanyaan.id_pertanyaan}`}
                              className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                            >
                              <option value=''>
                                Pilih kategori penilaian...
                              </option>
                              {pertanyaan.kategoriPenilaian.map((kategori) => (
                                <option
                                  key={kategori.id_kategori}
                                  value={kategori.id_kategori}
                                >
                                  {kategori.uraian_kategori}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                      {/* Form untuk submit link bukti dukung */}
                      <div className='mt-4 border-t border-gray-200 pt-4'>
                        <label
                          htmlFor={`bukti-${pertanyaan.id_pertanyaan}`}
                          className='mb-2 block text-sm font-medium text-gray-700'
                        >
                          Link Bukti Dukung:
                        </label>
                        <div className='flex gap-2'>
                          <input
                            type='url'
                            id={`bukti-${pertanyaan.id_pertanyaan}`}
                            placeholder='https://contoh.com/dokumen-bukti'
                            className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                          />
                          <button
                            type='button'
                            className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
