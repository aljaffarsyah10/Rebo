import { getLeaderboardPilarAction } from '@/actions/leaderboard-actions';
import { LeaderboardPilarClient } from '@/components/rebo/leaderboard-pilar-client';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Leaderboard & Papan Apresiasi 6 Pilar | REBO V2 BPS Sitaro',
  description:
    'Papan peringkat progresivitas dan kepatuhan 6 Pilar ZI/RB BPS Kabupaten Kepulauan Sitaro: Speed Star, Zero Revision Leader, dan Top Score Champion'
};

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const result = await getLeaderboardPilarAction();

  return (
    <PageContainer scrollable>
      <LeaderboardPilarClient initialSummary={result.data} />
    </PageContainer>
  );
}
