// app/features/products/components/product-listing.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

export default function manejemenPerubahan() {
  const [subpilarjoinpertanyaan, setSubpilarjoinpertanyaan] = useState<any[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
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
          throw error;
        }

        setSubpilarjoinpertanyaan(data || []);
      } catch (err) {
        setError(err);
        console.error('Error fetching subpilar:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg text-gray-600'>Loading...</div>
        </div>
      </div>
    );
  }

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
    <div className='container mx-auto max-w-6xl p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Subpilar Manajemen Perubahan
        </h1>
      </div>

      <Tabs
        defaultValue={subpilarjoinpertanyaan[0]?.id_subpilar?.toString()}
        className='w-full'
      >
        <TabsList className='grid h-auto w-full grid-cols-1 gap-1 border border-gray-200 bg-gray-50/50 p-1 lg:grid-cols-4'>
          {subpilarjoinpertanyaan.map((subpilar: any) => (
            <TabsTrigger
              key={subpilar.id_subpilar}
              value={subpilar.id_subpilar.toString()}
              className='flex h-auto flex-col items-start justify-start p-3 text-left whitespace-normal transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:shadow-sm'
            >
              <span className='mb-1 text-xs font-medium text-gray-600'>
                Subpilar {subpilar.id_subpilar}
              </span>
              <span className='text-sm leading-tight font-semibold text-gray-800'>
                {subpilar.nama_subpilar}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {subpilarjoinpertanyaan.map((subpilar: any) => (
          <TabsContent
            key={subpilar.id_subpilar}
            value={subpilar.id_subpilar.toString()}
          >
            <div className='mt-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
              <div className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600'>
                    {subpilar.id_subpilar}
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800'>
                    {subpilar.nama_subpilar}
                  </h2>
                </div>
                <p className='ml-11 leading-relaxed text-gray-600'>
                  {subpilar.deskripsi_subpilar}
                </p>
              </div>

              {/* Tampilkan pertanyaan-pertanyaan */}
              {subpilar.pertanyaan && subpilar.pertanyaan.length > 0 && (
                <div className='relative'>
                  <div className='absolute top-8 bottom-0 left-4 w-0.5 bg-gradient-to-b from-blue-300 to-blue-100'></div>
                  <h3 className='mb-8 flex items-center gap-3 text-xl font-semibold text-gray-700'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white'>
                      Q
                    </div>
                    Pertanyaan
                  </h3>
                  <div className='ml-9 space-y-8'>
                    {subpilar.pertanyaan.map(
                      (pertanyaan: any, index: number) => (
                        <div
                          key={pertanyaan.id_pertanyaan}
                          className='relative rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md'
                        >
                          <div className='absolute top-6 -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white'>
                            {index + 1}
                          </div>
                          <p className='mb-4 text-lg leading-relaxed font-medium text-gray-800'>
                            {pertanyaan.pertanyaan}
                          </p>
                          {pertanyaan.deskripsi_pertanyaan && (
                            <p className='mb-6 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3 text-sm leading-relaxed text-gray-600'>
                              {pertanyaan.deskripsi_pertanyaan}
                            </p>
                          )}

                          {/* Uraian Bukti Dukung */}
                          {pertanyaan.uraian_buktidukung && (
                            <div className='mb-6 rounded-lg border-l-4 border-green-200 bg-green-50 p-4'>
                              <h4 className='mb-2 text-sm font-semibold text-green-800'>
                                Uraian Bukti Dukung:
                              </h4>
                              <p className='text-sm leading-relaxed text-green-700'>
                                {pertanyaan.uraian_buktidukung}
                              </p>
                            </div>
                          )}

                          {/* Dropdown Kategori Penilaian */}
                          {pertanyaan.kategoriPenilaian &&
                            pertanyaan.kategoriPenilaian.length > 0 && (
                              <div className='mb-6 space-y-2'>
                                <label
                                  htmlFor={`kategori-${pertanyaan.id_pertanyaan}`}
                                  className='block text-sm font-semibold text-gray-700'
                                >
                                  Kategori Penilaian
                                </label>
                                <select
                                  id={`kategori-${pertanyaan.id_pertanyaan}`}
                                  className='focus:ring-opacity-50 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none'
                                >
                                  <option value=''>
                                    Pilih kategori penilaian...
                                  </option>
                                  {pertanyaan.kategoriPenilaian.map(
                                    (kategori: any) => (
                                      <option
                                        key={kategori.id_kategori}
                                        value={kategori.id_kategori}
                                      >
                                        {kategori.uraian_kategori}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )}

                          {/* Form untuk submit link bukti dukung */}
                          <div className='space-y-2'>
                            <label
                              htmlFor={`bukti-${pertanyaan.id_pertanyaan}`}
                              className='block text-sm font-semibold text-gray-700'
                            >
                              Link Bukti Dukung
                            </label>
                            <div className='flex gap-3'>
                              <input
                                type='url'
                                id={`bukti-${pertanyaan.id_pertanyaan}`}
                                placeholder='https://contoh.com/dokumen-bukti'
                                className='focus:ring-opacity-50 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none'
                              />
                              <button
                                type='button'
                                className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
