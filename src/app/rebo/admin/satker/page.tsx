import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { checkRole } from '@/utils/roles';
import { getActiveSatkerConfigAction } from '@/actions/satker-actions';
import SatkerManagerClient from '@/components/rebo/satker-manager-client';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Konfigurasi Profil Satker & Multi-Satker | REBO V2',
  description:
    'Pengelolaan profil instansi, kesiapan multi-satker BPS se-Sulawesi Utara & nasional, penandatangan LKE, dan ekspor konfigurasi replikasi di REBO V2'
};

export const dynamic = 'force-dynamic';

export default async function SatkerAdminPage() {
  // 1. Verifikasi RBAC: Hanya Super Admin yang berhak mengonfigurasi profil instansi
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role) || (await checkRole('admin'));

  if (!isSuperAdmin) {
    redirect('/rebo/overview');
  }

  // 2. Ambil profil satker aktif
  const satkerRes = await getActiveSatkerConfigAction();

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <SatkerManagerClient
          initialConfig={satkerRes.data}
          initialSource={satkerRes.source}
        />
      </div>
    </PageContainer>
  );
}
