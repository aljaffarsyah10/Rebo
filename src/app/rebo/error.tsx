'use client';

import { ReboErrorFallback } from '@/components/rebo/rebo-error-fallback';

export default function ReboError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ReboErrorFallback error={error} reset={reset} />;
}
