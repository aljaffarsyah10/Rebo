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
          aria-label='Tutup'
          type='button'
          className='mt-2 inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-semibold text-white shadow-md transition duration-150 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-800 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3z'
              clipRule='evenodd'
            />
          </svg>
          <span>Tutup</span>
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
