'use client';

import { ReboErrorFallback } from '@/components/rebo/rebo-error-fallback';

export default function FormRBError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ReboErrorFallback
      error={error}
      reset={reset}
      title='Terjadi Gangguan pada Halaman Form RB'
      description='Halaman pengisian atau pengelolaan Form Reformasi Birokrasi mengalami kendala sementara. Silakan coba muat ulang atau kembali ke Overview.'
    />
  );
}
