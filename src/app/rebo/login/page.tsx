'use client';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback` // setelah login balik ke sini
      }
    });
    if (error) console.error(error.message);
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <button
        onClick={handleLogin}
        className='rounded-lg bg-blue-500 px-4 py-2 text-white shadow-md hover:bg-blue-600'
      >
        Sign in with Google
      </button>
    </div>
  );
}
