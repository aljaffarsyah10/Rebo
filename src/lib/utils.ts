import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

/**
 * Helper pembagian aman untuk mencegah NaN, Infinity, dan pembagian nol (0 / 0).
 */
export function safeDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  fallback = 0
): number {
  const num = Number(numerator);
  const den = Number(denominator);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return fallback;
  }
  const result = num / den;
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Helper kalkulasi persentase aman: (value / total) * 100 dengan batas dan pembulatan.
 */
export function safePercentage(
  value: number | null | undefined,
  total: number | null | undefined,
  decimals = 0
): number {
  const ratio = safeDivide(value, total, 0);
  const percent = ratio * 100;
  if (decimals === 0) {
    return Math.round(percent);
  }
  const factor = Math.pow(10, decimals);
  return Math.round(percent * factor) / factor;
}

/**
 * Format angka ke string numerik dengan nilai desimal, aman dari NaN atau undefined.
 */
export function safeNumberFormat(
  value: number | null | undefined,
  decimals = 2,
  fallback = '0.00'
): string {
  const num = Number(value);
  if (!Number.isFinite(num) || isNaN(num)) {
    return fallback;
  }
  return num.toFixed(decimals);
}
