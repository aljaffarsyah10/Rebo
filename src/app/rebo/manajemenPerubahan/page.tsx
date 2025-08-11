// app/features/products/components/product-listing.tsx
import { createClient } from '@/lib/supabase/server';

export default async function manejemenPerubahan() {
  const supabase = await createClient();

  const { data: subpilarjoinpertanyaan, error } = await supabase
    .from('subpilar')
    .select(
      `
      *,
      pertanyaan (*)
    `
    )
    .eq('id_pilar', 1)
    .order('id_subpilar', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return <div>Error loading products</div>;
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
