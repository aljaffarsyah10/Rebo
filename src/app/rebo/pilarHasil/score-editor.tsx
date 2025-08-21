'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  id_pilarHasil: number | string;
  initialSkor?: number | null;
};

export default function ScoreEditor({ id_pilarHasil, initialSkor }: Props) {
  const [skor, setSkor] = useState<number | ''>(
    initialSkor !== undefined && initialSkor !== null ? Number(initialSkor) : ''
  );
  const [loading, setLoading] = useState(false);

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
        alert('Gagal menyimpan skor');
      } else {
        alert('Skor berhasil disimpan');
      }
    } catch (err) {
      console.error(err);
      alert('Error saat menyimpan skor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <input
        type='number'
        value={skor}
        onChange={(e) =>
          setSkor(e.target.value === '' ? '' : Number(e.target.value))
        }
        className='w-24 rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
        placeholder='Skor'
      />
      <Button
        size='sm'
        variant='outline'
        onClick={handleUpdate}
        disabled={loading}
      >
        Update
      </Button>
    </div>
  );
}
