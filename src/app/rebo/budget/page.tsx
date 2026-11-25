import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import BudgetTrackerClient from '@/components/rebo/budget-tracker-client';
import { getBudgetListAction } from '@/actions/budget-actions';

export const metadata: Metadata = {
  title: 'Pelacak Anggaran & Realisasi Kegiatan ZI/RB | REBO V2',
  description:
    'Monitoring alokasi pagu DIPA, realisasi penyerapan anggaran, no SPJ, dan akuntabilitas keuangan pembangunan Zona Integritas BPS Kabupaten Kepulauan Sitaro.'
};

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  const result = await getBudgetListAction(2026);

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <BudgetTrackerClient
          initialItems={result.data || []}
          initialSummary={result.summary}
        />
      </div>
    </PageContainer>
  );
}
