import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import LkePdfExecutiveClient from '@/components/rebo/lke-pdf-executive-client';

export const metadata = {
  title: 'Cetak LKE Eksekutif Terformat Resmi | REBO V2',
  description:
    'Lembar Kerja Evaluasi (LKE) Zona Integritas Reformasi Birokrasi Terformat Resmi BPS Sitaro & PermenPAN-RB'
};

export const dynamic = 'force-dynamic';

interface LkePdfPageProps {
  searchParams: Promise<{
    periodeId?: string;
  }>;
}

export default async function LkePdfPage({ searchParams }: LkePdfPageProps) {
  const resolvedSearchParams = await searchParams;
  const targetPeriodeId = resolvedSearchParams?.periodeId || undefined;

  const result = await getMonitoringDashboardData(targetPeriodeId);

  return (
    <LkePdfExecutiveClient
      data={result.data}
      periodes={result.periodes}
      selectedPeriodeId={targetPeriodeId || result.data.periode?.id || ''}
    />
  );
}
