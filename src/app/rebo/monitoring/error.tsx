'use client';

import { ReboErrorFallback } from '@/components/rebo/rebo-error-fallback';

export default function MonitoringError({
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
      title='Terjadi Gangguan pada Halaman Monitoring'
      description='Data dan visualisasi monitoring Reformasi Birokrasi gagal dimuat untuk sementara. Silakan coba lagi atau kembali ke Overview.'
    />
  );
}
