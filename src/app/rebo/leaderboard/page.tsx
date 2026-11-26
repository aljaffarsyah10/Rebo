import { Suspense } from 'react';
import { getLeaderboardPilarAction } from '@/actions/leaderboard-actions';
import { getAchievementBadgesAction } from '@/actions/badge-actions';
import { LeaderboardTabsWrapper } from '@/components/rebo/leaderboard-tabs-wrapper';
import PageContainer from '@/components/layout/page-container';
import { LeaderboardPageSkeleton } from '@/components/rebo/rebo-skeletons';

export const metadata = {
  title: 'Leaderboard & Lencana Penghargaan 6 Pilar | REBO V2 BPS Sitaro',
  description:
    'Papan peringkat progresivitas dan galeri 8 Lencana Kehormatan ZI/RB BPS Kabupaten Kepulauan Sitaro: Speed Star, Zero Revision Champion, Pilar Terdisiplin, dan Benteng Integritas'
};

export const dynamic = 'force-dynamic';

async function LeaderboardContent() {
  const [leaderboardResult, badgesResult] = await Promise.all([
    getLeaderboardPilarAction(),
    getAchievementBadgesAction()
  ]);

  const defaultSummary = {
    totalBadges: 48,
    totalUnlocked: 18,
    totalLocked: 30,
    platinumUnlocked: 4,
    goldUnlocked: 8,
    silverUnlocked: 4,
    bronzeUnlocked: 2,
    pilars: []
  };

  const badgeData = {
    badges: badgesResult.data?.badges || [],
    summary: badgesResult.data?.summary || defaultSummary
  };

  return (
    <LeaderboardTabsWrapper
      initialLeaderboardSummary={leaderboardResult.data}
      initialBadgeData={badgeData}
    />
  );
}

export default function LeaderboardPage() {
  return (
    <PageContainer scrollable>
      <Suspense fallback={<LeaderboardPageSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </PageContainer>
  );
}
