import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import DisiplinComplianceClient from '@/components/rebo/disiplin-compliance-client';
import { getDisiplinSummaryAction } from '@/actions/disiplin-actions';

export const metadata: Metadata = {
  title: 'Matriks Kepatuhan Disiplin & Kode Etik ASN | REBO V2',
  description:
    'Perekaman bukti dukung nihil penjatuhan hukuman disiplin tingkat sedang/berat sesuai ketentuan PP No. 94 Tahun 2021 sebagai syarat mutlak kelolosan predikat WBK / WBBM BPS Kabupaten Kepulauan Sitaro.'
};

export const dynamic = 'force-dynamic';

export default async function DisiplinCompliancePage() {
  const result = await getDisiplinSummaryAction(2026);

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <DisiplinComplianceClient
          initialSummary={result.summary}
          initialCatatan={result.catatan}
          initialValidation={result.validation}
        />
      </div>
    </PageContainer>
  );
}
