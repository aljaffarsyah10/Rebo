import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import LHKPNComplianceClient from '@/components/rebo/lhkpn-compliance-client';
import { getLHKPNComplianceListAction } from '@/actions/lhkpn-actions';

export const metadata: Metadata = {
  title:
    'Pelacak Kepatuhan e-LHKPN & e-LHKASN (100% Compliance Tracker) | REBO V2',
  description:
    'Dashboard pemantauan status penyampaian bukti tanda terima pelaporan harta kekayaan seluruh pejabat dan ASN BPS Kabupaten Kepulauan Sitaro sebelum batas akhir 31 Maret. Target 100% Kepatuhan sebagai Syarat Mutlak WBK/WBBM.'
};

export const dynamic = 'force-dynamic';

export default async function LHKPNCompliancePage() {
  const result = await getLHKPNComplianceListAction(2026);

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <LHKPNComplianceClient
          initialReports={result.data}
          initialSummary={result.summary}
        />
      </div>
    </PageContainer>
  );
}
