import { getAgendaListAction } from '@/actions/agenda-actions';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import AgendaCalendarClient from '@/components/rebo/agenda-calendar-client';

export const metadata = {
  title: 'Kalender Jadwal Aksi & Rencana Kerja Tim ZI/RB | REBO BPS Sitaro',
  description:
    'Kalender interaktif terpadu untuk memantau jadwal rapat koordinasi pilar, sosialisasi berkala, batas waktu submit bukti dukung LKE, dan evaluasi TPI BPS Kabupaten Kepulauan Sitaro.'
};

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  const [agendaRes, session] = await Promise.all([
    getAgendaListAction(),
    getCurrentUserSession()
  ]);

  const userIsAdmin = isAdmin(session?.role);

  return (
    <AgendaCalendarClient
      initialAgendaList={agendaRes.data || []}
      initialStats={agendaRes.stats}
      isAdmin={userIsAdmin}
    />
  );
}
