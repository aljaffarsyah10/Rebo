import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import StandarPelayananClient from '@/components/rebo/standar-pelayanan-client';
import { getStandarPelayananListAction } from '@/actions/pelayanan-actions';

export const metadata: Metadata = {
  title: 'Katalog Standar Pelayanan & Maklumat Digital | REBO V2',
  description:
    'Standar Pelayanan 14 Komponen sesuai UU No. 25/2009 & PermenPAN-RB No. 15/2014, Maklumat Pelayanan resmi berkepala surat emas, dan SOP garansi kompensasi keterlambatan layanan BPS Kabupaten Kepulauan Sitaro.'
};

export const dynamic = 'force-dynamic';

export default async function StandarPelayananPage() {
  const result = await getStandarPelayananListAction();

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <StandarPelayananClient
          initialItems={result.data || []}
          initialMaklumat={result.maklumat}
        />
      </div>
    </PageContainer>
  );
}
