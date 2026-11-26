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
    <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs'>
      <div className='animate-fade-in pointer-events-auto w-[92vw] max-w-sm rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/95'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <div className='mb-4 text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100'>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label='Tutup'
          type='button'
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#023047] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition duration-150 hover:bg-[#034469] active:scale-95 sm:text-sm dark:bg-[#fb8500] dark:text-slate-900 dark:hover:bg-[#ffb703]'
        >
          <span>Tutup</span>
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
      `}</style>
    </div>
  );
}
