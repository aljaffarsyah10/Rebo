import React from 'react';

type SubmitModalProps = {
  open: boolean;
  onClose: () => void;
  message: string;
};

export default function SubmitModal({
  open,
  onClose,
  message
}: SubmitModalProps) {
  if (!open) return null;
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-24'>
      <div className='animate-fade-in pointer-events-auto max-w-sm min-w-[320px] rounded-xl border border-blue-100 bg-white p-7 shadow-2xl'>
        <div className='flex flex-col items-center'>
          <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
            <svg
              className='h-7 w-7 text-blue-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4'
              />
            </svg>
          </div>
          <div className='mb-4 text-center text-lg font-semibold text-gray-800'>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className='mt-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-semibold text-white shadow transition-all duration-150 hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none'
        >
          Tutup
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
