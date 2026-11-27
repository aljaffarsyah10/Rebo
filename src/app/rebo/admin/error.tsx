'use client';

import { ReboErrorFallback } from '@/components/rebo/rebo-error-fallback';

export default function AdminError({
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
      title='Terjadi Gangguan pada Halaman Admin'
      description='Panel administrasi mengalami kendala sementara saat memuat konfigurasi atau data. Silakan coba lagi atau kembali ke Overview.'
    />
  );
}
