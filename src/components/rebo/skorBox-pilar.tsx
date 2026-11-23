import React from 'react';
import { Award } from 'lucide-react';

export type SkorBoxPilarProps = {
  totalSkor: number;
  totalNilaiMaks: number;
  className?: string;
};

const SkorBoxPilar: React.FC<SkorBoxPilarProps> = ({
  totalSkor,
  totalNilaiMaks,
  className
}) => {
  return (
    <div
      className={`flex h-11 w-full items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 py-1.5 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/20 ${className || ''}`}
    >
      <div className='flex items-center gap-2'>
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100/90 text-amber-700 shadow-2xs dark:bg-amber-900/50 dark:text-amber-300'>
          <Award className='h-3.5 w-3.5' />
        </span>
        <div className='flex flex-col text-left leading-tight'>
          <span className='text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
            Skor
          </span>
          <span className='text-xs font-semibold text-slate-700 dark:text-slate-200'>
            Capaian
          </span>
        </div>
      </div>

      <div className='flex items-center gap-1 font-mono text-xs'>
        <span className='rounded-md border border-emerald-300/80 bg-emerald-100/90 px-1.5 py-0.5 font-bold text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300'>
          {totalSkor != null ? totalSkor.toFixed(2) : '0.00'}
        </span>
        <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500'>
          /
        </span>
        <span className='rounded-md border border-slate-200 bg-white/80 px-1.5 py-0.5 font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'>
          {totalNilaiMaks != null ? totalNilaiMaks.toFixed(2) : '0.00'}
        </span>
      </div>
    </div>
  );
};

export default SkorBoxPilar;
