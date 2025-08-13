'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PertanyaanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id_pertanyaan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        // Join pertanyaan dengan buktiDukung
        const { data, error } = await supabase
          .from('pertanyaan')
          .select(
            'id_pertanyaan, deskripsi_pertanyaan, buktiDukung(link_bukti)'
          );
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

  // Filter
  const filteredData = data.filter(
    (row) =>
      row.deskripsi_pertanyaan?.toLowerCase().includes(search.toLowerCase()) ||
      row.buktiDukung?.link_bukti
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      String(row.id_pertanyaan).includes(search)
  );

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className='container mx-auto max-w-4xl py-10'>
      <h1 className='mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100'>
        Tabel Pertanyaan
      </h1>
      <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <input
          type='text'
          className='w-full rounded border px-3 py-2 text-sm focus:ring focus:ring-blue-300 focus:outline-none sm:w-64 dark:bg-gray-800 dark:text-gray-100'
          placeholder='Cari pertanyaan atau link bukti...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className='flex gap-2'>
          <button
            className={`rounded border px-3 py-2 text-sm font-medium ${sortKey === 'id_pertanyaan' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => setSortKey('id_pertanyaan')}
          >
            Sort by ID
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm font-medium ${sortKey === 'deskripsi_pertanyaan' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => setSortKey('deskripsi_pertanyaan')}
          >
            Sort by Deskripsi
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm font-medium ${sortKey === 'link_bukti' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => setSortKey('link_bukti')}
          >
            Sort by Link Bukti
          </button>
          <button
            className='rounded border px-3 py-2 text-sm font-medium'
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
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
                <th
                  className='cursor-pointer border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                  onClick={() => setSortKey('id_pertanyaan')}
                >
                  ID
                </th>
                <th
                  className='cursor-pointer border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                  onClick={() => setSortKey('deskripsi_pertanyaan')}
                >
                  Deskripsi Pertanyaan
                </th>
                <th
                  className='cursor-pointer border-b px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                  onClick={() => setSortKey('link_bukti')}
                >
                  Link Bukti
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className='px-4 py-6 text-center text-gray-500'
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((row: any) => (
                  <tr
                    key={row.id_pertanyaan}
                    className='hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  >
                    <td className='border-b px-4 py-2 text-sm text-gray-800 dark:text-gray-100'>
                      {row.id_pertanyaan}
                    </td>
                    <td className='border-b px-4 py-2 text-sm text-gray-800 dark:text-gray-100'>
                      {row.deskripsi_pertanyaan}
                    </td>
                    <td className='border-b px-4 py-2 text-sm text-blue-700 dark:text-blue-300'>
                      {row.buktiDukung?.link_bukti ? (
                        <a
                          href={row.buktiDukung.link_bukti}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline'
                        >
                          {row.buktiDukung.link_bukti}
                        </a>
                      ) : (
                        <span className='text-gray-400 italic'>Tidak ada</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              Page {page} of {totalPages}
            </span>
            <div className='flex gap-2'>
              <button
                className='rounded border px-2 py-1 text-sm disabled:opacity-50'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <button
                className='rounded border px-2 py-1 text-sm disabled:opacity-50'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
