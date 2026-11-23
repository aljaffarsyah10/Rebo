import React from 'react';

interface Pertanyaan {
  id_pertanyaan: number;
  status_kelengkapan: number;
}

interface ProgressPilarProps {
  pertanyaanList: Pertanyaan[];
  className?: string;
}

/**
 * Komponen untuk menampilkan progress kelengkapan pilar berdasarkan status_kelengkapan = 2 (Disetujui/Lengkap)
 */
const ProgressPilar: React.FC<ProgressPilarProps> = ({
  pertanyaanList,
  className
}) => {
  const total = pertanyaanList.length;
  const lengkap = pertanyaanList.filter(
    (q) => q.status_kelengkapan === 2
  ).length;
  const percent = total > 0 ? Math.round((lengkap / total) * 100) : 0;

  return (
    <div
      className={`flex h-11 w-full flex-col justify-center rounded-xl border border-slate-200/60 bg-slate-50/50 px-3 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-800/30 ${className || ''}`}
    >
      <div className='flex items-center justify-between text-xs leading-none'>
        <span className='text-[10px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400'>
          Kelengkapan
        </span>
        <span className='font-mono text-xs font-bold text-slate-800 dark:text-slate-200'>
          {percent}%
        </span>
      </div>
      <div className='my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700'>
        <div
          className='h-full rounded-full bg-emerald-500 transition-all duration-300'
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className='text-[10px] leading-none text-slate-500 dark:text-slate-400'>
        <strong className='font-semibold text-slate-700 dark:text-slate-200'>
          {lengkap}
        </strong>{' '}
        dari {total} selesai
      </div>
    </div>
  );
};

export default ProgressPilar;
