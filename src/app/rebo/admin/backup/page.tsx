import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { checkRole } from '@/utils/roles';
import { getBackupListAction } from '@/actions/backup-actions';
import BackupRecoveryClient from '@/components/rebo/backup-recovery-client';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Automated Cloud Backup & Disaster Recovery | REBO V2',
  description:
    'Penjadwalan cadangan otomatis snapshot basis data Supabase berkala ke Google Cloud Storage / Amazon S3, validasi integritas SHA-256 Checksum, dan pemulihan darurat BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function BackupAdminPage() {
  // 1. Verifikasi RBAC: Hanya Super Admin / Administrator yang berhak mengakses panel Backup & DR
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role) || (await checkRole('admin'));

  if (!isSuperAdmin) {
    redirect('/rebo/overview');
  }

  // 2. Ambil riwayat snapshot cadangan dan konfigurasi jadwal
  const backupRes = await getBackupListAction();

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <BackupRecoveryClient
          initialSnapshots={backupRes.snapshots}
          initialSchedule={backupRes.schedule}
          initialStats={backupRes.stats}
        />
      </div>
    </PageContainer>
  );
}
