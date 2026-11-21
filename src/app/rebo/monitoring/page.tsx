import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import MonitoringDashboardClient from '@/components/rebo/monitoring-dashboard-client';

export const metadata = {
  title: 'Dashboard Monitoring Real-Time | REBO V2',
  description:
    'Visualisasi progres evaluasi LKE, status kelengkapan dokumen bukti dukung, dan komparasi nilai mandiri vs nilai verifikasi BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function MonitoringPage() {
  const result = await getMonitoringDashboardData();

  return (
    <MonitoringDashboardClient
      initialData={result.data}
      initialPeriodes={result.periodes}
    />
  );
}
