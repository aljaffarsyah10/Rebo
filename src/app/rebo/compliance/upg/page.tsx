import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import UPGManagerClient from '@/components/rebo/upg-manager-client';
import { getUPGReportListAction } from '@/actions/upg-actions';

export const metadata: Metadata = {
  title: 'Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi KPK | REBO V2',
  description:
    'Formulir online pelaporan penolakan dan penerimaan gratifikasi pegawai yang terhubung langsung dengan alur verifikasi Tim Kepatuhan Internal BPS Kabupaten Kepulauan Sitaro dan rekonsiliasi KPK RI.'
};

export const dynamic = 'force-dynamic';

export default async function UPGCompliancePage() {
  const result = await getUPGReportListAction({ tahun: 2026 });

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <UPGManagerClient
          initialReports={result.data || []}
          initialSummary={result.summary}
        />
      </div>
    </PageContainer>
  );
}
