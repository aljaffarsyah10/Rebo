import { getMultiYearTrendAction } from '@/actions/trend-actions';
import MultiYearTrendClient from '@/components/rebo/multi-year-trend-client';

export const metadata = {
  title: 'Analisis Tren Kinerja Antar-Tahun (Multi-Year Trend) | REBO V2',
  description:
    'Grafik komparasi perkembangan skor LKE antar-periode (2024, 2025, 2026) untuk membuktikan adanya perbaikan berkelanjutan (continuous improvement) di hadapan TPN KemenPAN-RB'
};

export const dynamic = 'force-dynamic';

export default async function MultiYearTrendPage() {
  const result = await getMultiYearTrendAction();

  return <MultiYearTrendClient initialData={result.data} />;
}
