import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getPeriodeList } from '@/actions/periode-actions';
import PeriodeManagerClient from './PeriodeManagerClient';

export const metadata = {
  title: 'Manajemen Siklus Periode Evaluasi | REBO V2',
  description:
    'Pengelolaan tahun periode evaluasi LKE PMPRB, status penguncian read-only, dan duplikasi struktur indikator lintas tahun di BPS Kabupaten Kepulauan Siau Tagulandang Biaro'
};

export const dynamic = 'force-dynamic';

export default async function PeriodePage() {
  // 1. Verifikasi RBAC: Hanya Super Admin yang berhak mengakses
  if (!(await checkRole('admin'))) {
    redirect('/rebo/overview');
  }

  // 2. Ambil daftar periode beserta statistik
  const result = await getPeriodeList();
  const isTableMissing = Boolean(
    result.error &&
      (result.error.includes('schema cache') ||
        result.error.includes('does not exist'))
  );

  return (
    <PeriodeManagerClient
      initialPeriodes={result.data || []}
      tableMissing={isTableMissing}
    />
  );
}
