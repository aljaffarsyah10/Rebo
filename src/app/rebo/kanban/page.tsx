import { getKanbanBoardData } from '@/actions/kanban-actions';
import KanbanBoardClient from '@/components/rebo/kanban-board-client';

export const metadata = {
  title: 'Kanban Tindak Lanjut RB | REBO V2',
  description:
    'Papan kendali tangkas untuk menindaklanjuti indikator LKE berstatus revisi, menunggu review, dan disetujui BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  const result = await getKanbanBoardData();

  return (
    <KanbanBoardClient
      initialData={result.data}
      initialPeriodes={result.periodes}
    />
  );
}
