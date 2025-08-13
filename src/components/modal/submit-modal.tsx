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
    <div className='bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='min-w-[300px] rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-4 text-center text-lg font-semibold text-gray-800'>
          {message}
        </div>
        <button
          onClick={onClose}
          className='mt-2 w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-150 hover:bg-blue-700'
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
