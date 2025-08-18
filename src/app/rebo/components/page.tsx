import React from 'react';

export type SkorBoxProps = {
  nilaiAkhir?: number | null;
  className?: string;
};

const SkorBox: React.FC<SkorBoxProps> = ({ nilaiAkhir, className }) => {
  return (
    <div
      className={`absolute top-4 right-4 flex items-center gap-2 ${className || ''}`}
    >
      <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
        Skor:
      </span>
      <span
        className={`rounded-lg px-3 py-1 text-sm font-bold ${nilaiAkhir != null ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
      >
        {nilaiAkhir != null ? nilaiAkhir : '-'}
      </span>
    </div>
  );
};

export default SkorBox;
