import React from 'react';

interface Pertanyaan {
  id_pertanyaan: number;
  status_kelengkapan: number;
  // ...other fields
}

interface ProgressPilarProps {
  pertanyaanList: Pertanyaan[];
}

/**
 * Komponen untuk menampilkan progress kelengkapan pilar berdasarkan status_kelengkapan = 2
 */
const ProgressPilar: React.FC<ProgressPilarProps> = ({ pertanyaanList }) => {
  const total = pertanyaanList.length;
  const lengkap = pertanyaanList.filter(
    (q) => q.status_kelengkapan === 1
  ).length;
  const percent = total > 0 ? Math.round((lengkap / total) * 100) : 0;

  return (
    <div className='mx-auto w-full max-w-xs'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
          Progress Kelengkapan
        </span>
        <span className='text-xs font-semibold text-gray-700 dark:text-gray-200'>
          {percent}%
        </span>
      </div>
      <div className='h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className='h-3 rounded-full bg-green-500 transition-all'
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className='mt-2 text-right text-xs text-gray-600 dark:text-gray-300'>
        {lengkap} dari {total} pertanyaan lengkap
      </div>
    </div>
  );
};

export default ProgressPilar;
