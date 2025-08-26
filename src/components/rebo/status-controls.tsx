'use client';

import { useUser } from '@clerk/nextjs';
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
  const { user } = useUser();
  const role = (user?.publicMetadata as any)?.role as string | undefined;
  const isAdmin = role === 'admin';

  const badge = bukti?.nama_status ?? 'Belum';

  return (
    <div>
      <form
        className='mt-3 flex items-center justify-end gap-3'
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
      >
        <div className='flex w-full items-center justify-between gap-3'>
          <div>
            <div className='text-sm font-semibold text-green-700 dark:text-green-300'>
              Status Bukti
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800'>
                {badge}
              </span>
            </div>
          </div>

          <button
            type='button'
            onClick={async () => await onSendStatus('Dikirim')}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
            disabled={!bukti?.link_bukti}
          >
            Send
          </button>
        </div>
      </form>

      <div className='mt-2 flex justify-end gap-2'>
        {isAdmin ? (
          <>
            <button
              onClick={async () => await onApprove()}
              className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50'
              disabled={!bukti?.link_bukti}
            >
              Approve
            </button>

            <button
              onClick={async () => await onReject()}
              className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50'
              disabled={!bukti?.link_bukti}
            >
              Reject
            </button>
          </>
        ) : (
          <div className='text-muted-foreground self-center text-sm'>
            Hanya admin yang dapat Approve/Reject
          </div>
        )}
      </div>
    </div>
  );
}
