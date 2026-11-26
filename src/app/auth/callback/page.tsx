'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    const checkAndRedirect = async () => {
      try {
        await supabase.auth.getSession();
      } catch (err) {
        console.error(err);
      }
      if (isMounted) {
        router.replace('/rebo/overview');
      }
    };

    if (isLoaded) {
      checkAndRedirect();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoaded, router, supabase]);

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950'>
      <div className='relative mb-4 flex items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-[#023047]/20 border-t-[#fb8500] dark:border-[#ffb703]/20 dark:border-t-[#fb8500]' />
        <div className='absolute h-6 w-6 animate-pulse rounded-full bg-[#023047] opacity-25 dark:bg-[#ffb703]' />
      </div>
      <h2 className='text-base font-bold text-slate-800 dark:text-slate-100'>
        Menghubungkan Sesi REBO V2...
      </h2>
      <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
        Mohon tunggu, Anda sedang dialihkan ke dashboard utama BPS Sitaro.
      </p>
    </div>
  );
}
