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
          className='text-sm font-semibold text-gray-700 dark:text-gray-300'
        >
          Status Bukti Dukung
        </label>
        <select
          id={`status-${pertanyaanId}`}
          name={`status-${pertanyaanId}`}
          defaultValue={bukti?.status || ''}
          className='w-40 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-blue-200'
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
          className='flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white'
          disabled={!bukti?.link_bukti}
        >
          Send
        </button>
      </form>

      <div className='mt-2 flex justify-end gap-2'>
        <button
          onClick={async () => await onApprove()}
          className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white'
          disabled={!bukti?.link_bukti}
        >
          Approve
        </button>
        <button
          onClick={async () => await onReject()}
          className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white'
          disabled={!bukti?.link_bukti}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
