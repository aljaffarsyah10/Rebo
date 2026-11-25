import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import { getLaporanWBSListAction } from '@/actions/wbs-actions';
import WBSAdminClient from '@/components/rebo/wbs-admin-client';

export const metadata = {
  title: 'Manajemen Investigasi & Whistleblowing System (WBS) | REBO V2',
  description:
    'Pemantauan penanganan pengaduan masyarakat & pegawai secara tertutup, pelacakan investigasi, dan dokumentasi bukti dukung Pilar 5 Penguatan Pengawasan BPS Sitaro.'
};

export const dynamic = 'force-dynamic';

export default async function AdminWBSPage() {
  const session = await getCurrentUserSession();
  const isAuthorized = isAdmin(session?.role) || isTPI(session?.role);

  if (!isAuthorized) {
    redirect('/rebo/overview');
  }

  const wbsRes = await getLaporanWBSListAction();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <WBSAdminClient
        initialData={wbsRes.data || []}
        initialStats={wbsRes.stats}
        isAdmin={isAdmin(session?.role)}
      />
    </div>
  );
}
