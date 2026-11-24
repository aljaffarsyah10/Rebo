import { getKanbanBoardData } from '@/actions/kanban-actions';
import { getUserProfileAction } from '@/actions/profile-actions';
import { getCurrentUserSession } from '@/lib/auth/session';
import KanbanBoardClient from '@/components/rebo/kanban-board-client';

export const metadata = {
  title: 'Kanban Tindak Lanjut RB | REBO V2',
  description:
    'Papan kendali tangkas untuk menindaklanjuti indikator LKE berstatus revisi, menunggu review, dan disetujui BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  const [result, profileRes, session] = await Promise.all([
    getKanbanBoardData(),
    getUserProfileAction().catch(() => ({ success: false, data: null })),
    getCurrentUserSession().catch(() => ({
      userId: null,
      role: null,
      assignedPilarId: null,
      email: null,
      fullName: null
    }))
  ]);

  const userProfile = profileRes?.data || null;
  const userId = session?.userId || userProfile?.id || null;

  return (
    <KanbanBoardClient
      initialData={result.data}
      initialPeriodes={result.periodes}
      currentUserProfile={userProfile}
      currentUserId={userId}
    />
  );
}
