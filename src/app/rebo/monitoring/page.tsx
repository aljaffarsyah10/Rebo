import { Suspense } from 'react';
import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import MonitoringDashboardClient from '@/components/rebo/monitoring-dashboard-client';
import { MonitoringPageSkeleton } from '@/components/rebo/rebo-skeletons';

export const metadata = {
  title: 'Dashboard Monitoring Real-Time | REBO V2',
  description:
    'Visualisasi progres evaluasi LKE, status kelengkapan dokumen bukti dukung, dan komparasi nilai mandiri vs nilai verifikasi BPS Sitaro'
};

export const dynamic = 'force-dynamic';

async function MonitoringContent() {
  const result = await getMonitoringDashboardData();

  return (
    <MonitoringDashboardClient
      initialData={result.data}
      initialPeriodes={result.periodes}
    />
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={<MonitoringPageSkeleton />}>
      <MonitoringContent />
    </Suspense>
  );
}
