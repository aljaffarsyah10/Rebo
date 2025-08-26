'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      if (data.session) {
        router.push('/'); // redirect ke home
      }
    };
    getSession();
  }, [router, supabase]);

  return <p>Sedang login...</p>;
}
