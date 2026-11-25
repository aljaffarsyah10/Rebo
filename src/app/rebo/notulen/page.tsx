import { getNotulenListAction } from '@/actions/notulen-actions';
import NotulenManagerClient from '@/components/rebo/notulen-manager-client';

export const metadata = {
  title: 'Notulen Rapat Digital & Auto-Task Assignment | REBO BPS Sitaro',
  description:
    'Pencatatan notula rapat berkala tim ZI/RB BPS Kabupaten Kepulauan Sitaro berstandar naskah dinas resmi, konversi butir kesepakatan menjadi tugas Kanban, dan notifikasi penugasan WhatsApp.'
};

export const dynamic = 'force-dynamic';

export default async function NotulenPage() {
  const notulenRes = await getNotulenListAction();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <NotulenManagerClient
        initialNotulenList={notulenRes.data || []}
        initialStats={notulenRes.stats}
      />
    </div>
  );
}
