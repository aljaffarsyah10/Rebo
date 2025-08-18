import React from 'react';

export type SkorBoxProps = {
  nilaiAkhir?: number | null;
  nilaiMaks?: number;
  className?: string;
};

const SkorBox: React.FC<SkorBoxProps> = ({
  nilaiAkhir,
  nilaiMaks,
  className
}) => {
  return (
    <div
      className={`absolute top-4 right-4 flex items-center gap-3 rounded-xl border-2 border-yellow-400 bg-yellow-50 px-4 py-2 shadow-lg dark:border-yellow-600 dark:bg-yellow-900/30 ${className || ''}`}
      style={{ zIndex: 10 }}
    >
      <span className='mr-2 flex items-center justify-center rounded-full bg-yellow-400 p-1 text-white'>
        <svg
          className='h-5 w-5'
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
      <span className='text-base font-bold text-yellow-700 dark:text-yellow-300'>
        Skor:
      </span>
      <span
        className={`rounded-lg px-3 py-1 text-lg font-bold ${nilaiAkhir != null ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
      >
        {nilaiAkhir != null ? nilaiAkhir : '-'}
      </span>
      {nilaiMaks !== undefined && (
        <span className='text-base font-semibold text-gray-600 dark:text-gray-300'>
          / {nilaiMaks}
        </span>
      )}
    </div>
  );
};

export default SkorBox;
