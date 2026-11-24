import { getInovasiListAction } from '@/actions/inovasi-actions';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import InovasiShowcaseClient from '@/components/rebo/inovasi-showcase-client';

export const metadata = {
  title: 'Showcase Inovasi Pelayanan Publik & Reform | REBO BPS Sitaro',
  description:
    'Galeri inovasi unggulan pelayanan publik, transformasi birokrasi, dan terobosan kepulauan BPS Kabupaten Kepulauan Siau Tagulandang Biaro menuju WBK/WBBM (Game Changer TPN KemenPAN-RB).'
};

export const dynamic = 'force-dynamic';

export default async function InovasiPage() {
  const [inovasiRes, session] = await Promise.all([
    getInovasiListAction(),
    getCurrentUserSession()
  ]);

  const userIsAdmin = isAdmin(session?.role);

  return (
    <InovasiShowcaseClient
      initialData={inovasiRes.data}
      initialStats={inovasiRes.stats}
      availablePilars={inovasiRes.pilarList}
      isAdmin={userIsAdmin}
    />
  );
}
