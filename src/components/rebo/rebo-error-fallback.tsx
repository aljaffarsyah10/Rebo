'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export interface ReboErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ReboErrorFallback({
  error,
  reset,
  title = 'Terjadi Gangguan Saat Memuat Halaman',
  description = 'Maaf, halaman ini mengalami kendala sementara saat memuat data atau tampilan. Anda dapat mencoba memuat ulang atau kembali ke halaman utama.'
}: ReboErrorFallbackProps) {
  const hasDetails = Boolean(error?.message || error?.digest);

  return (
    <div className='mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center p-4 md:p-6'>
      <Card className='w-full rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs dark:border-slate-800 dark:bg-slate-900/85'>
        <CardHeader className='items-center space-y-3 pt-6 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50/90 text-amber-600 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-400'>
            <AlertTriangle className='h-6 w-6' aria-hidden='true' />
          </div>
          <div className='space-y-1.5'>
            <CardTitle className='text-slate-900 dark:text-slate-100'>
              {title}
            </CardTitle>
            <CardDescription className='mx-auto max-w-md text-slate-600 dark:text-slate-400'>
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        {hasDetails ? (
          <CardContent className='pt-0'>
            <div className='rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-left text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400'>
              {error.message ? (
                <p className='font-medium break-words text-slate-700 dark:text-slate-300'>
                  {error.message}
                </p>
              ) : null}
              {error.digest ? (
                <p className='mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400'>
                  Kode Referensi: {error.digest}
                </p>
              ) : null}
            </div>
          </CardContent>
        ) : null}

        <CardFooter className='flex flex-col-reverse justify-center gap-2.5 pb-6 sm:flex-row'>
          <Button
            asChild
            variant='outline'
            className='w-full border-slate-200 text-slate-700 hover:bg-slate-100/80 sm:w-auto dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
          >
            <Link href='/rebo/overview'>
              <Home className='h-4 w-4' aria-hidden='true' />
              Kembali ke Overview
            </Link>
          </Button>
          <Button type='button' onClick={reset} className='w-full sm:w-auto'>
            <RefreshCw className='h-4 w-4' aria-hidden='true' />
            Coba Lagi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
