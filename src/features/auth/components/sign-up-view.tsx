import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { IconStar } from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 z-30 hidden md:top-8 md:right-8'
        )}
      >
        Sign Up
      </Link>
      <div className='relative hidden h-full flex-col overflow-hidden bg-gradient-to-br from-[#023047] via-[#023047]/95 to-[#034469] p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#023047]/90 via-[#023047]/80 to-[#034469]/90' />
        {/* Enhanced Decorative elements */}
        <div className='absolute top-0 left-0 h-full w-full'>
          <div className='absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-[#fb8500]/10 blur-xl'></div>
          <div className='absolute right-20 bottom-20 h-40 w-40 animate-pulse rounded-full bg-[#ffb703]/15 blur-2xl'></div>
          <div className='absolute top-1/2 left-1/4 h-24 w-24 animate-pulse rounded-full bg-[#fb8500]/20 blur-lg'></div>
          <div className='absolute top-1/3 right-1/3 h-16 w-16 animate-pulse rounded-full bg-[#ffb703]/10 blur-lg'></div>
          <div className='absolute bottom-1/3 left-1/2 h-20 w-20 animate-pulse rounded-full bg-[#fb8500]/15 blur-xl'></div>
        </div>
        <div className='relative z-20 flex items-center text-lg font-medium'>
          {/* Logo dengan efek glow yang enhanced */}
          <div className='group relative z-20 flex items-center text-lg font-medium'>
            <div className='relative'>
              {/* <Image
                src='/assets/rebo_white.png'
                alt='Logo'
                width={120}
                height={120}
                className='mr-4 rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-1'
              /> */}
              <div className='absolute -inset-2 rounded-xl bg-gradient-to-r from-[#fb8500]/30 via-[#ffb703]/25 to-[#fb8500]/30 opacity-30 blur-lg transition-all duration-500 group-hover:opacity-60 group-hover:blur-xl'></div>
              <div className='absolute -inset-1 rounded-xl bg-gradient-to-r from-[#ffb703]/20 to-[#fb8500]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
            </div>
            <div className='flex flex-col space-y-1'>
              <span className='bg-gradient-to-r from-white via-[#ffb703] to-white bg-clip-text text-3xl font-black text-transparent drop-shadow-lg'>
                REBO
              </span>
              <span className='text-sm font-semibold tracking-wide text-[#ffb703]/90'>
                Reformasi Birokrasi
              </span>
              <div className='h-0.5 w-full rounded-full bg-gradient-to-r from-[#fb8500] to-transparent'></div>
            </div>
          </div>
        </div>

        {/* Quote section moved higher up */}
        <div className='relative z-20 mt-16 flex flex-1 items-center'>
          <div className='w-full'>
            <div className='group relative overflow-hidden rounded-3xl border border-[#ffb703]/20 bg-gradient-to-br from-[#023047]/20 to-[#023047]/10 p-8 backdrop-blur-md transition-all duration-300 hover:border-[#fb8500]/30 hover:from-[#023047]/25 hover:to-[#023047]/15'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#fb8500]/5 to-[#ffb703]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              <blockquote className='relative space-y-6'>
                <div className='flex items-start space-x-4'>
                  <div className='mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703]'>
                    <svg
                      className='h-4 w-4 text-[#023047]'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='bg-gradient-to-r from-white via-[#ffb703] to-white bg-clip-text text-2xl leading-relaxed font-bold text-transparent'>
                      Rebo - Zona Integritas Reformasi Birokrasi
                    </p>
                  </div>
                </div>

                <footer className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center space-x-2'>
                      <div className='h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703]'></div>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-[#ffb703]/60'></div>
                      <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#fb8500]/40'></div>
                    </div>
                    <span className='bg-gradient-to-r from-[#ffb703] to-white bg-clip-text font-semibold text-transparent'>
                      BPS Siau Tagulandang Biaro
                    </span>
                  </div>
                  <div className='flex space-x-1'>
                    <div className='h-1 w-8 rounded-full bg-gradient-to-r from-[#fb8500] to-transparent'></div>
                    <div className='h-1 w-6 rounded-full bg-gradient-to-r from-[#ffb703] to-transparent'></div>
                    <div className='h-1 w-4 rounded-full bg-gradient-to-r from-[#fb8500] to-transparent'></div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className='relative z-20 mt-8'>
          <div className='flex items-center justify-center space-x-2'>
            <div className='h-px w-16 bg-gradient-to-r from-transparent to-[#fb8500]'></div>
            <div className='h-2 w-2 rounded-full bg-[#ffb703]'></div>
            <div className='h-px w-32 bg-gradient-to-r from-[#fb8500] via-[#ffb703] to-[#fb8500]'></div>
            <div className='h-2 w-2 rounded-full bg-[#fb8500]'></div>
            <div className='h-px w-16 bg-gradient-to-r from-[#fb8500] to-transparent'></div>
          </div>
        </div>
      </div>
      <div className='flex h-full items-center justify-center bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/20 p-4 lg:p-8 dark:from-[#023047]/20 dark:via-[#023047]/10 dark:to-[#034469]/5'>
        <div className='flex w-full max-w-lg flex-col items-center justify-center space-y-10'>
          {/* Enhanced Welcome section */}
          <div className='space-y-4 text-center'>
            <div className='relative'>
              <h1 className='bg-gradient-to-r from-[#023047] via-[#fb8500] to-[#ffb703] bg-clip-text text-4xl font-black text-transparent drop-shadow-sm'>
                Bergabung dengan Kami
              </h1>
              <div className='absolute -bottom-1 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703]'></div>
            </div>
            <p className='text-lg font-medium text-[#023047] dark:text-gray-300'>
              Buat akun baru untuk memulai perjalanan Anda
            </p>
            <div className='flex items-center justify-center space-x-2'>
              <div className='h-1 w-1 rounded-full bg-[#fb8500]'></div>
              <div className='h-1 w-8 rounded-full bg-gradient-to-r from-[#fb8500] to-[#ffb703]'></div>
              <div className='h-1 w-1 rounded-full bg-[#ffb703]'></div>
            </div>
          </div>

          <ClerkSignUpForm
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
          />

          <div className='relative'>
            <p className='text-muted-foreground px-8 text-center text-sm leading-relaxed'>
              Dengan melanjutkan, Anda menyetujui{' '}
              <Link
                href='/terms'
                className='hover:text-primary relative font-semibold text-[#023047] underline decoration-2 underline-offset-4 transition-all duration-300 hover:text-[#fb8500] hover:decoration-[#fb8500] dark:text-[#ffb703] dark:hover:text-[#fb8500] dark:hover:decoration-[#fb8500]'
              >
                Syarat Layanan
              </Link>{' '}
              dan{' '}
              <Link
                href='/privacy'
                className='hover:text-primary relative font-semibold text-[#023047] underline decoration-2 underline-offset-4 transition-all duration-300 hover:text-[#fb8500] hover:decoration-[#fb8500] dark:text-[#ffb703] dark:hover:text-[#fb8500] dark:hover:decoration-[#fb8500]'
              >
                Kebijakan Privasi
              </Link>{' '}
              kami.
            </p>
            <div className='absolute -bottom-4 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#fb8500] to-transparent'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
