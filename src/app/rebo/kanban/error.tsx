'use client';

import { ReboErrorFallback } from '@/components/rebo/rebo-error-fallback';

export default function KanbanError({
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
      title='Terjadi Gangguan pada Papan Kanban'
      description='Papan tugas Kanban mengalami kendala saat memuat data. Perubahan yang sudah tersimpan tetap aman; silakan coba muat ulang.'
    />
  );
}
