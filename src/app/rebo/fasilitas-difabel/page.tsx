import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import FasilitasDifabelClient from '@/components/rebo/fasilitas-difabel-client';
import { getFasilitasDifabelListAction } from '@/actions/fasilitas-actions';

export const metadata: Metadata = {
  title: 'Katalog Fasilitas Ramah Kelompok Rentan & Difabel | REBO V2',
  description:
    'Dokumentasi sarana-prasarana inklusif ruang Pelayanan Statistik Terpadu (PST) BPS Kabupaten Kepulauan Sitaro sesuai PermenPAN-RB No. 90/2021 dan UU No. 8/2016 untuk pemenuhan Pilar 6 Pelayanan Publik ZI-WBK.'
};

export const dynamic = 'force-dynamic';

export default async function FasilitasDifabelPage() {
  const result = await getFasilitasDifabelListAction();

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <FasilitasDifabelClient
          initialItems={result.data || []}
          initialSummary={result.summary}
        />
      </div>
    </PageContainer>
  );
}
