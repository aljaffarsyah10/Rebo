/* eslint-disable no-console */
'use server';

import {
  MOCK_MULTI_YEAR_TREND_DATA,
  calculateMultiYearAnalysis,
  type MultiYearTrendResult
} from '@/lib/trend/multi-year-types';
import { getAllPeriode } from '@/lib/api/rebo';

/**
 * Server Action untuk mengambil data Analisis Tren Kinerja Antar-Tahun (Multi-Year Trend Analysis)
 * BPS Kabupaten Kepulauan Sitaro (2024, 2025, 2026).
 *
 * Menghitung delta pertumbuhan, matriks komparasi 6 pilar, tren skor LKE,
 * tren survei kepuasan IKM/IPAK, dan ringkasan eksekutif Continuous Improvement Statement.
 *
 * CATATAN PENTING: Hanya async function yang diekspor sesuai aturan Next.js Server Actions.
 */
export async function getMultiYearTrendAction(): Promise<{
  success: boolean;
  data: MultiYearTrendResult;
  error?: string;
}> {
  try {
    // Upayakan sinkronisasi periode jika ada koneksi Supabase aktif
    try {
      await getAllPeriode();
    } catch {
      // Graceful fallback jika offline / mock environment
    }

    // Hitung analisis perbaikan berkelanjutan antar-tahun
    const analysisResult = calculateMultiYearAnalysis(
      MOCK_MULTI_YEAR_TREND_DATA
    );

    return {
      success: true,
      data: analysisResult
    };
  } catch (err: any) {
    console.error('Error in getMultiYearTrendAction:', err);
    return {
      success: false,
      data: calculateMultiYearAnalysis(MOCK_MULTI_YEAR_TREND_DATA),
      error: err?.message || 'Gagal memuat data tren kinerja multi-tahun.'
    };
  }
}
