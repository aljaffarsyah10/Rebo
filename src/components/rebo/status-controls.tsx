'use client';

import React from 'react';
import type { BuktiDukung } from '@/types/rebo';

type Props = {
  pertanyaanId: string;
  bukti?: BuktiDukung | null;
  onSendStatus: (status: string) => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
};

export default function StatusControls({
  pertanyaanId,
  bukti,
  onSendStatus,
  onApprove,
  onReject
}: Props) {
  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const select = form.querySelector(
            `select[name="status-${pertanyaanId}"]`
          ) as HTMLSelectElement | null;
          const status = select?.value;
          if (!status) return;
          await onSendStatus(status);
        }}
        className='mt-3 flex items-center justify-end gap-3'
      >
        <label
          htmlFor={`status-${pertanyaanId}`}
          className='text-sm font-semibold text-green-700 dark:text-green-300'
        >
          Status Bukti Dukung
        </label>
        <select
          id={`status-${pertanyaanId}`}
          name={`status-${pertanyaanId}`}
          defaultValue={bukti?.status || ''}
          className='w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-blue-200'
          disabled={!bukti?.link_bukti}
        >
          <option value=''>Pilih status...</option>
          <option value='Draft'>Draft</option>
          <option value='Dikirim'>Dikirim</option>
          <option value='Disetujui'>Disetujui</option>
          <option value='Ditolak'>Ditolak</option>
        </select>
        <button
          type='submit'
          className='flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={!bukti?.link_bukti}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-3 w-3'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path d='M2.003 5.884l8 4.8a1 1 0 00.994 0l8-4.8A1 1 0 0018 4H2a1 1 0 00.003 1.884z' />
            <path d='M18 8.118l-7.555 4.533a3 3 0 01-2.89 0L0 8.118V14a2 2 0 002 2h16a2 2 0 002-2V8.118z' />
          </svg>
          <span>Send</span>
        </button>
      </form>

      <div className='mt-2 flex justify-end gap-2'>
        <button
          onClick={async () => await onApprove()}
          className='flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 hover:scale-[1.02] hover:from-emerald-700 hover:to-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={!bukti?.link_bukti}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-3 w-3'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z'
              clipRule='evenodd'
            />
          </svg>
          <span>Approve</span>
        </button>
        <button
          onClick={async () => await onReject()}
          className='flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 hover:scale-[1.02] hover:from-red-700 hover:to-red-800 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={!bukti?.link_bukti}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-3 w-3'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414L11.414 13l2.293 2.293a1 1 0 01-1.414 1.414L10 14.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 13 6.293 10.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
