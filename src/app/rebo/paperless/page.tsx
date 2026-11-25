import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { PaperlessImpactClient } from '@/components/rebo/paperless-impact-client';
import { getPaperlessImpactAction } from '@/actions/paperless-actions';

export const metadata: Metadata = {
  title: 'Indikator Efisiensi & Dampak Paperless (Green Governance) | REBO V2',
  description:
    'Estimasi penghematan lembar kertas, biaya cetak, dan biaya logistik antar-pulau berkat digitalisasi penuh dokumen bukti dukung pada aplikasi REBO V2 untuk bukti reformasi tata kelola hijau (Pilar 2 & Pilar 4).'
};

export const dynamic = 'force-dynamic';

export default async function PaperlessPage() {
  const result = await getPaperlessImpactAction();

  return (
    <PageContainer scrollable>
      <div className='w-full'>
        <PaperlessImpactClient
          initialStats={result.data}
          initialSource={result.source}
        />
      </div>
    </PageContainer>
  );
}
