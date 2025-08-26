import Link from 'next/link';

export const metadata = {
  title: 'Download Pertanyaan'
};

export default function DownloadPage() {
  return (
    <div className='container mx-auto max-w-3xl py-12'>
      <h1 className='mb-4 text-2xl font-semibold'>Download Pertanyaan</h1>
      <p className='text-muted-foreground mb-6 text-sm'>
        Klik tombol di bawah untuk mendownload seluruh data pertanyaan dalam
        format CSV (bisa dibuka dengan Excel).
      </p>

      <div className='flex items-center gap-3'>
        <Link
          href='/rebo/download/api'
          className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
        >
          Download Pertanyaan (CSV)
        </Link>
        <a
          href='/rebo/download/api'
          className='text-muted-foreground text-sm underline'
          download
        >
          langsung download
        </a>
      </div>
    </div>
  );
}
