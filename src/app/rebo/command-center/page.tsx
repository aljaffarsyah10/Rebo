import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import { getLHKPNComplianceListAction } from '@/actions/lhkpn-actions';
import { getDisiplinSummaryAction } from '@/actions/disiplin-actions';
import { getInovasiListAction } from '@/actions/inovasi-actions';
import { getActiveBannerPengumumanAction } from '@/actions/broadcast-actions';
import CommandCenterClient from '@/components/rebo/command-center-client';
import { CommandCenterPageSkeleton } from '@/components/rebo/rebo-skeletons';

export const metadata: Metadata = {
  title: 'Executive Command Center | Mode Layar TV Kiosk | REBO V2',
  description:
    'Visualisasi realtime layar penuh untuk monitor lobi dan ruang pimpinan BPS Kabupaten Kepulauan Sitaro: Progres 6 Pilar ZI, Skor IKM/IPAK, Inovasi Publik, dan Kepatuhan Integritas ASN'
};

export const dynamic = 'force-dynamic';

async function CommandCenterContent() {
  // Ambil data agregasi monitoring, kepatuhan, inovasi, dan pengumuman secara paralel
  const [monitoringRes, lhkpnRes, disiplinRes, inovasiRes, bannerRes] =
    await Promise.all([
      getMonitoringDashboardData(),
      getLHKPNComplianceListAction(2026),
      getDisiplinSummaryAction(2026),
      getInovasiListAction(),
      getActiveBannerPengumumanAction()
    ]);

  return (
    <CommandCenterClient
      monitoringData={monitoringRes.data}
      activePeriode={monitoringRes.data.periode}
      lhkpnSummary={lhkpnRes.summary}
      disiplinSummary={disiplinRes.summary}
      inovasiList={inovasiRes.data || []}
      pengumumanBroadcast={bannerRes.data || null}
    />
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={<CommandCenterPageSkeleton />}>
      <CommandCenterContent />
    </Suspense>
  );
}
