'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SubpilarPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('subpilar').select('*');
        if (error) throw error;
        setData(data || []);
      } catch (err: any) {
        setError(err.message || 'Gagal fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className='container mx-auto max-w-4xl py-10'>
      <h1 className='mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100'>
        Tabel Subpilar
      </h1>
      {loading ? (
        <div className='flex h-32 items-center justify-center text-gray-500'>
          Loading...
        </div>
      ) : error ? (
        <div className='rounded-lg border border-red-300 bg-red-50 p-4 text-red-700'>
          {error}
        </div>
      ) : (
        <div className='overflow-x-auto rounded-lg shadow'>
          <table className='min-w-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
            <thead className='bg-blue-100 dark:bg-blue-900'>
              <tr>
                <th className='border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  ID
                </th>
                <th className='border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  Nama Subpilar
                </th>
                <th className='border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  Deskripsi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr
                  key={row.id_subpilar}
                  className='hover:bg-blue-50 dark:hover:bg-blue-900/30'
                >
                  <td className='border-b px-4 py-2 text-sm text-gray-800 dark:text-gray-100'>
                    {row.id_subpilar}
                  </td>
                  <td className='border-b px-4 py-2 text-sm text-gray-800 dark:text-gray-100'>
                    {row.nama_subpilar}
                  </td>
                  <td className='border-b px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>
                    {row.deskripsi_subpilar}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
