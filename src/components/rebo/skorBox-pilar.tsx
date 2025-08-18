import React from 'react';

export type SkorBoxPilarProps = {
  totalNilaiAkhir: number;
  totalNilaiMaks: number;
  className?: string;
};

const SkorBoxPilar: React.FC<SkorBoxPilarProps> = ({
  totalNilaiAkhir,
  totalNilaiMaks,
  className
}) => {
  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-yellow-300 bg-yellow-50 px-2 py-1 shadow dark:border-yellow-600 dark:bg-yellow-900/30 ${className || ''}`}
      style={{ fontSize: '0.85rem', minWidth: 'auto' }}
    >
      <span className='mr-1 flex items-center justify-center rounded-full bg-yellow-400 p-0.5 text-white'>
        <svg
          className='h-3 w-3'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M8 21h8M12 17v4M17 5V3a1 1 0 00-1-1H8a1 1 0 00-1 1v2M3 5h18M4 5v6a8 8 0 0016 0V5'
          />
        </svg>
      </span>
      <span className='text-xs font-bold text-yellow-700 dark:text-yellow-300'>
        Total Skor Pilar:
      </span>
      <span
        className={`rounded px-2 py-0.5 text-xs font-bold ${totalNilaiAkhir != null ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
      >
        {totalNilaiAkhir != null ? totalNilaiAkhir.toFixed(2) : '-'}
      </span>
      <span className='text-xs font-semibold text-gray-600 dark:text-gray-300'>
        / {totalNilaiMaks != null ? totalNilaiMaks.toFixed(2) : '-'}
      </span>
    </div>
  );
};

export default SkorBoxPilar;
