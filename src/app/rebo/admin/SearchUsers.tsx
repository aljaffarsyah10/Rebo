'use client';

import { usePathname, useRouter } from 'next/navigation';

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get('search') as string;
          router.push(
            pathname + '?search=' + encodeURIComponent(queryTerm || '')
          );
        }}
        className='w-full'
      >
        <label htmlFor='search' className='sr-only'>
          Search for users
        </label>

        <div className='relative'>
          <input
            id='search'
            name='search'
            type='text'
            placeholder='Cari nama atau email...'
            className='w-full rounded-lg bg-white px-4 py-3 pr-32 text-sm shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-slate-700 dark:text-slate-100'
          />

          <button
            type='submit'
            className='absolute top-1/2 right-1 -translate-y-1/2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm text-white shadow hover:opacity-95'
          >
            Cari
          </button>
        </div>
      </form>
    </div>
  );
};
