import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { checkRole } from '@/utils/roles';
import { getDocShieldStatsAction } from '@/actions/doc-shield-actions';
import DocShieldClient from '@/components/rebo/doc-shield-client';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Enkripsi File Sensitif (Doc Shield) | REBO V2',
  description:
    'Enkripsi berkas pemeriksaan internal (LHP/BPK/Itjen) dan laporan keuangan (DIPA/SPJ) berstandar AES-256-GCM & PBKDF2 sesuai kontrol ISO/IEC 27001:2022 A.8.24 pada BPS Kabupaten Kepulauan Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function DocShieldAdminPage() {
  // 1. Verifikasi RBAC: Administrator, Koordinator, TPI atau Operator berwenang
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role) || (await checkRole('admin'));

  // Izinkan akses admin
  if (!isSuperAdmin && session.role !== 'admin' && session.role !== 'tpi') {
    redirect('/rebo/overview');
  }

  // 2. Ambil statistik Doc Shield & berkas terenkripsi
  const res = await getDocShieldStatsAction();

  return (
    <PageContainer scrollable>
      <div className='w-full pb-12'>
        <DocShieldClient initialStats={res.stats} />
      </div>
    </PageContainer>
  );
}
