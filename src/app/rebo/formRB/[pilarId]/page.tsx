// app/features/products/components/product-listing.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import SubmitModal from '@/components/modal/submit-modal';

type PageProps = { params: Promise<{ pilarId: string }> };

export default function Page(props: PageProps) {
  const [subpilarjoinpertanyaan, setSubpilarjoinpertanyaan] = useState<any[]>(
    []
  );
  const [buktiDukungMap, setBuktiDukungMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [pilarId, setPilarId] = useState<string>('');
  const [namaPilar, setNamaPilar] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  useEffect(() => {
    async function getParams() {
      const params = await props.params;
      setPilarId(params.pilarId);
    }
    getParams();
  }, [props.params]);

  useEffect(() => {
    if (!pilarId) return;

    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('subpilar')
          .select(
            `*, pilar (id_pilar, nama_pilar), pertanyaan (*, kategoriPenilaian (*))`
          )
          .eq('id_pilar', pilarId)
          .order('id_subpilar', { ascending: true });

        if (error) throw error;
        setSubpilarjoinpertanyaan(data || []);
        if (data && data.length > 0 && data[0].pilar) {
          setNamaPilar(data[0].pilar.nama_pilar);
        }

        // Ambil semua id_pertanyaan
        const pertanyaanIds = (data || []).flatMap(
          (subpilar: any) =>
            subpilar.pertanyaan?.map((p: any) => p.id_pertanyaan) || []
        );
        if (pertanyaanIds.length > 0) {
          const { data: buktiData, error: buktiError } = await supabase
            .from('buktiDukung')
            .select('*')
            .in('id_pertanyaan', pertanyaanIds);
          if (!buktiError && buktiData) {
            // Map id_pertanyaan ke data
            const map: Record<string, any> = {};
            buktiData.forEach((row: any) => {
              map[row.id_pertanyaan] = row;
            });
            setBuktiDukungMap(map);
          }
        }
      } catch (err) {
        setError(err);
        if (err instanceof Error) {
          console.error('Error fetching subpilar:', err.message);
        } else {
          console.error('Error fetching subpilar:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pilarId]);

  if (loading) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg text-gray-600 dark:text-gray-400'>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching subpilar:', error.message);
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
              Terjadi kesalahan saat mengambil data subpilar:
            </p>
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

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <SubmitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          {namaPilar ? `Pilar ${pilarId}: ${namaPilar}` : `Pilar ${pilarId}`}
        </h1>
        <p className='mt-2 text-lg text-gray-600 dark:text-gray-400'>
          Subpilar dan Pertanyaan Evaluasi
        </p>
      </div>

      <Tabs
        defaultValue={subpilarjoinpertanyaan[0]?.id_subpilar?.toString()}
        className='w-full'
      >
        <TabsList className='grid h-auto w-full grid-cols-1 gap-1 border border-gray-200 bg-gray-50/50 p-1 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-800/50'>
          {subpilarjoinpertanyaan.map((subpilar: any) => (
            <TabsTrigger
              key={subpilar.id_subpilar}
              value={subpilar.id_subpilar.toString()}
              className='flex h-auto flex-col items-start justify-start p-3 text-left whitespace-normal transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:hover:bg-gray-700 dark:data-[state=active]:border-blue-500 dark:data-[state=active]:bg-gray-900'
            >
              <span className='mb-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
                Subpilar {subpilar.id_subpilar}
              </span>
              <span className='text-sm leading-tight font-semibold text-gray-800 dark:text-gray-200'>
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
            <div className='mt-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
              <div className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                    {subpilar.id_subpilar}
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    {subpilar.nama_subpilar}
                  </h2>
                </div>
                <p className='ml-11 leading-relaxed text-gray-600 dark:text-gray-300'>
                  {subpilar.deskripsi_subpilar}
                </p>
              </div>

              {/* Tampilkan pertanyaan-pertanyaan */}
              {subpilar.pertanyaan && subpilar.pertanyaan.length > 0 && (
                <div className='relative'>
                  <div className='absolute top-8 bottom-0 left-4 w-0.5 bg-gradient-to-b from-blue-300 to-blue-100 dark:from-blue-600 dark:to-blue-400'></div>
                  <h3 className='mb-8 flex items-center gap-3 text-xl font-semibold text-gray-700 dark:text-gray-300'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white dark:bg-blue-600'>
                      Q
                    </div>
                    Pertanyaan
                  </h3>
                  <div className='ml-9 space-y-8'>
                    {subpilar.pertanyaan.map(
                      (pertanyaan: any, index: number) => (
                        <div
                          key={pertanyaan.id_pertanyaan}
                          className='relative rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:shadow-lg'
                        >
                          <div className='absolute top-6 -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white dark:bg-blue-600'>
                            {index + 1}
                          </div>
                          <p className='mb-4 text-lg leading-relaxed font-medium text-gray-800 dark:text-gray-100'>
                            {pertanyaan.pertanyaan}
                          </p>
                          {pertanyaan.deskripsi_pertanyaan && (
                            <p className='mb-6 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3 text-sm leading-relaxed text-gray-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-gray-300'>
                              {pertanyaan.deskripsi_pertanyaan}
                            </p>
                          )}

                          {/* Uraian Bukti Dukung */}
                          {pertanyaan.uraian_buktidukung && (
                            <div className='mb-6 rounded-lg border-l-4 border-green-200 bg-green-50 p-4 dark:border-green-500 dark:bg-green-900/30'>
                              <h4 className='mb-2 text-sm font-semibold text-green-800 dark:text-green-300'>
                                Uraian Bukti Dukung:
                              </h4>
                              <p className='text-sm leading-relaxed text-green-700 dark:text-green-200'>
                                {pertanyaan.uraian_buktidukung}
                              </p>
                            </div>
                          )}

                          {/* Dropdown Kategori Penilaian */}
                          <form
                            className='flex flex-col gap-3 space-y-2'
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const formData = new FormData(form);
                              const link_bukti = formData.get(
                                `bukti-${pertanyaan.id_pertanyaan}`
                              );
                              const id_kategori = formData.get(
                                `kategori-${pertanyaan.id_pertanyaan}`
                              );
                              if (!link_bukti || !id_kategori) {
                                setModalMsg(
                                  'Link bukti dan kategori penilaian wajib diisi!'
                                );
                                setModalOpen(true);
                                return;
                              }
                              let nilai_akhir = null;
                              if (
                                pertanyaan.kategoriPenilaian &&
                                pertanyaan.kategoriPenilaian.length > 0
                              ) {
                                const kategoriObj =
                                  pertanyaan.kategoriPenilaian.find(
                                    (k: any) =>
                                      k.id_kategori?.toString() ===
                                      id_kategori?.toString()
                                  );
                                nilai_akhir = kategoriObj
                                  ? kategoriObj.nilai
                                  : null;
                              }
                              // Cek apakah sudah ada data
                              const existing =
                                buktiDukungMap[pertanyaan.id_pertanyaan];
                              const method = existing ? 'PUT' : 'POST';
                              const res = await fetch('/api', {
                                method,
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  link_bukti,
                                  id_kategori,
                                  id_pertanyaan: pertanyaan.id_pertanyaan,
                                  nilai_akhir
                                })
                              });
                              const result = await res.json();
                              if (result.success) {
                                setModalMsg(
                                  existing
                                    ? 'Bukti dukung berhasil diupdate!'
                                    : 'Bukti dukung berhasil disimpan!'
                                );
                                setModalOpen(true);
                                form.reset();
                              } else {
                                setModalMsg(
                                  'Gagal menyimpan: ' +
                                    (result.error || 'Unknown error')
                                );
                                setModalOpen(true);
                              }
                            }}
                          >
                            {pertanyaan.kategoriPenilaian &&
                              pertanyaan.kategoriPenilaian.length > 0 && (
                                <div className='mb-6 space-y-2'>
                                  <label
                                    htmlFor={`kategori-${pertanyaan.id_pertanyaan}`}
                                    className='block text-sm font-semibold text-gray-700 dark:text-gray-300'
                                  >
                                    Kategori Penilaian
                                  </label>
                                  <select
                                    id={`kategori-${pertanyaan.id_pertanyaan}`}
                                    name={`kategori-${pertanyaan.id_pertanyaan}`}
                                    defaultValue={
                                      buktiDukungMap[pertanyaan.id_pertanyaan]
                                        ?.id_kategori || ''
                                    }
                                    className='focus:ring-opacity-50 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800'
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
                            <label
                              htmlFor={`bukti-${pertanyaan.id_pertanyaan}`}
                              className='block text-sm font-semibold text-gray-700 dark:text-gray-300'
                            >
                              Link Bukti Dukung
                            </label>
                            <input
                              type='url'
                              id={`bukti-${pertanyaan.id_pertanyaan}`}
                              name={`bukti-${pertanyaan.id_pertanyaan}`}
                              placeholder='https://contoh.com/dokumen-bukti'
                              defaultValue={
                                buktiDukungMap[pertanyaan.id_pertanyaan]
                                  ?.link_bukti || ''
                              }
                              className='focus:ring-opacity-50 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800'
                            />
                            <div className='flex justify-end'>
                              <button
                                type='submit'
                                className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 dark:focus:ring-offset-gray-900'
                              >
                                {buktiDukungMap[pertanyaan.id_pertanyaan]
                                  ? 'Update'
                                  : 'Submit'}
                              </button>
                            </div>
                          </form>
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
