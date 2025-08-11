// app/features/products/components/product-listing.tsx
import { createClient } from '@/lib/supabase/server';

export default async function ProductListingPage() {
  const supabase = await createClient();

  const { data: pilars, error } = await supabase
    .from('pilar')
    .select('*')
    .order('id_pilar', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return <div>Error loading products</div>;
  }

  return (
    <div className='grid gap-4'>
      <h1>Pilar Reformasi Birokrasi</h1>
      {pilars.map((pilar) => (
        <div key={pilar.id_pilar} className='rounded-md border p-4'>
          <h3 className='font-bold'>
            {pilar.id_pilar} {pilar.nama_pilar}
          </h3>
        </div>
      ))}
    </div>
  );
}
