import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import { getBroadcastListAction } from '@/actions/broadcast-actions';
import { BroadcastManagerClient } from '@/components/rebo/broadcast-manager-client';
import PageContainer from '@/components/layout/page-container';
import { Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Broadcast Pengumuman Internal Satu-Arah | REBO V2',
  description:
    'Fitur kirim pengumuman penting & arahan pimpinan BPS Kabupaten Kepulauan Sitaro serentak ke koordinator pilar via WhatsApp dan banner dinamis Beranda REBO'
};

export const dynamic = 'force-dynamic';

export default async function BroadcastPage() {
  // 1. Verifikasi RBAC: Hanya Super Admin atau Tim Verifikator (TPI) yang berhak mengakses
  const session = await getCurrentUserSession();
  const isAuthorized = isAdmin(session.role) || isTPI(session.role);

  if (!isAuthorized) {
    redirect('/rebo/overview');
  }

  // 2. Ambil data broadcast awal
  const broadcastRes = await getBroadcastListAction();
  const initialBroadcasts = broadcastRes.data || [];
  const initialStats = broadcastRes.stats;

  return (
    <PageContainer scrollable>
      <div className='w-full space-y-6 pb-12'>
        {/* Header Title Section */}
        <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'>
                <Megaphone className='size-5' />
              </div>
              <h1 className='text-foreground text-2xl font-bold tracking-tight'>
                Broadcast Pengumuman Internal
              </h1>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>
              Kirim arahan pimpinan BPS Sitaro secara serentak ke koordinator
              pilar ZI via WhatsApp bot dan kendalikan banner dinamis pada
              Beranda REBO.
            </p>
          </div>
        </div>

        {/* Client Manager */}
        <BroadcastManagerClient
          initialBroadcasts={initialBroadcasts}
          initialStats={initialStats}
        />
      </div>
    </PageContainer>
  );
}
