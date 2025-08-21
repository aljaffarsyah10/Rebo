'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
  id_pilarHasil: number | string;
  initialSkor?: number | null;
  buttonClassName?: string;
};

export default function ScoreEditor({
  id_pilarHasil,
  initialSkor,
  buttonClassName
}: Props) {
  const [skor, setSkor] = useState<number | ''>(
    initialSkor !== undefined && initialSkor !== null ? Number(initialSkor) : ''
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      const payload = {
        id_pilarHasil,
        skor_pilarHasil: skor === '' ? null : Number(skor)
      };
      const res = await fetch('/api/pilarHasil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data || !data.success) {
        toast.error('Gagal menyimpan skor');
      } else {
        toast.success('Skor berhasil disimpan');
        setSaved(true);
        // clear saved state after short delay for visual feedback
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saat menyimpan skor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      // cleanup timers if unmounted while saved timer running
      setSaved(false);
    };
  }, []);

  return (
    <div className='flex items-center gap-3'>
      <label htmlFor={`skor-${id_pilarHasil}`} className='sr-only'>
        Skor
      </label>
      <input
        id={`skor-${id_pilarHasil}`}
        type='number'
        value={skor}
        onChange={(e) =>
          setSkor(e.target.value === '' ? '' : Number(e.target.value))
        }
        className='w-28 rounded-md border border-gray-200 bg-white px-3 py-2 text-center text-sm font-medium text-gray-800 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
        placeholder='Skor'
        aria-label='Skor pilar hasil'
      />

      <Button
        size='sm'
        variant={saved ? 'default' : 'outline'}
        onClick={handleUpdate}
        disabled={loading}
        aria-live='polite'
        className={buttonClassName}
      >
        {loading ? (
          <span className='inline-flex items-center gap-2'>
            <svg
              className='h-4 w-4 animate-spin text-current'
              viewBox='0 0 24 24'
              fill='none'
              aria-hidden
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
              ></path>
            </svg>
            Saving...
          </span>
        ) : saved ? (
          <span className='inline-flex items-center gap-2'>
            <svg
              className='h-4 w-4 text-green-500'
              viewBox='0 0 24 24'
              fill='none'
              aria-hidden
            >
              <path
                d='M20 6L9 17l-5-5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Saved
          </span>
        ) : (
          'Update'
        )}
      </Button>
    </div>
  );
}
