import PageContainer from '@/components/layout/page-container';
import { LeaderboardPageSkeleton } from '@/components/rebo/rebo-skeletons';

export default function LeaderboardLoading() {
  return (
    <PageContainer scrollable>
      <LeaderboardPageSkeleton />
    </PageContainer>
  );
}
