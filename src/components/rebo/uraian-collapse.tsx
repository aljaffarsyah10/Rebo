'use client';

import React, { useState } from 'react';

type Props = {
  text?: string | null;
  maxChars?: number;
};

export default function UraianCollapse({ text = '', maxChars = 150 }: Props) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  const isTruncated = text.length > maxChars;
  const preview = isTruncated ? text.slice(0, maxChars).trimEnd() : text;

  return (
    <div className='mt-1'>
      <p className='text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300'>
        {open || !isTruncated ? text : `${preview}...`}
      </p>
      {isTruncated && (
        <button
          type='button'
          onClick={() => setOpen((s) => !s)}
          className='mt-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400'
        >
          {open ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
        </button>
      )}
    </div>
  );
}
