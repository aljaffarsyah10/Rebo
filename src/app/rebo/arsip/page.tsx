'use client';

import { useState } from 'react';

export default function ArsipPage() {
  // Kolom link dan button ke GDrive
  const gdriveLink =
    'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA'; // Contoh link folder GDrive

  // Link PDF lokal dari folder public
  const pdfPreviewUrl = '/rb.pdf'; // Pastikan file rb.pdf ada di folder public

  return (
    <div className='container mx-auto max-w-3xl py-10'>
      <div className='mb-8 flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <svg
            width='32'
            height='32'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='text-blue-600 dark:text-blue-400'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M7 7V3a1 1 0 011-1h8a1 1 0 011 1v4m-10 0h10m-10 0v14a1 1 0 001 1h8a1 1 0 001-1V7m-10 0h10'
            />
          </svg>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
            Arsip Bukti Dukung
          </h1>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Halaman ini berisi arsip dokumen bukti dukung Reformasi Birokrasi.
          Anda dapat mengakses folder Google Drive untuk melihat seluruh
          dokumen, serta melihat file PDF SK RB terbaru langsung di halaman ini.
        </p>
      </div>
      <div className='mb-8 flex flex-col gap-2 rounded-xl border bg-gradient-to-br from-blue-50 to-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:from-blue-900/20 dark:to-gray-900'>
        <div className='flex items-center gap-2'>
          <svg
            width='20'
            height='20'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='text-green-600 dark:text-green-400'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M3 7V5a2 2 0 012-2h10a2 2 0 012 2v2'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z'
            />
          </svg>
          <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
            Link GDrive Bukti Dukung Tahun 2024:
          </span>
        </div>
        <a
          href={gdriveLink}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-2 inline-block rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 dark:focus:ring-offset-gray-900'
        >
          Buka Folder GDrive
        </a>
        <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          Folder berisi seluruh dokumen pendukung RB yang telah diunggah.
        </p>
      </div>
      <div className='rounded-xl border bg-gradient-to-br from-gray-50 to-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900'>
        <div className='mb-2 flex items-center gap-2'>
          <svg
            width='20'
            height='20'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='text-purple-600 dark:text-purple-400'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M4 4h16v16H4V4z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 8h8v8H8V8z'
            />
          </svg>
          <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200'>
            Preview PDF SK RB Tahun 2025
          </h2>
        </div>
        <p className='mb-4 text-xs text-gray-500 dark:text-gray-400'>
          File PDF SK RB terbaru dapat langsung dilihat di bawah ini tanpa perlu
          mengunduh.
        </p>
        <embed
          src={pdfPreviewUrl}
          type='application/pdf'
          width='100%'
          height='600px'
          className='rounded-lg border border-gray-200 dark:border-gray-700'
        />
      </div>
    </div>
  );
}
