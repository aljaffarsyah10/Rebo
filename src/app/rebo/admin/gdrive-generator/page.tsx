import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getAllPeriode, getActivePeriode } from '@/lib/api/rebo';
import { getIndicatorGdriveMapping } from '@/actions/gdrive-actions';
import GdriveGeneratorClient from './GdriveGeneratorClient';
import type { PeriodeEvaluasi } from '@/types/rebo';

export const metadata = {
  title: 'GDrive Indicator Folder Generator | REBO V2',
  description:
    'Sistem generator tautan Google Drive berjenjang per indikator evaluasi PMPRB BPS Sitaro'
};

export default async function GdriveGeneratorPage() {
  // 1. Verifikasi hak akses admin
  if (!(await checkRole('admin'))) {
    redirect('/rebo/overview');
  }

  // 2. Ambil daftar periode evaluasi
  let periodes: PeriodeEvaluasi[] = await getAllPeriode();
  if (!periodes || periodes.length === 0) {
    const active = await getActivePeriode();
    periodes = active
      ? [active]
      : [
          {
            id: 'default-periode-2026',
            tahun: 2026,
            nama_periode: 'Evaluasi PMPRB 2026',
            is_active: true,
            is_locked: false
          }
        ];
  }

  // Cari periode aktif saat ini
  const activePeriode = periodes.find((p) => p.is_active) || periodes[0];

  // 3. Ambil data pemetaan indikator awal
  const mappingResult = await getIndicatorGdriveMapping(activePeriode.id);

  return (
    <GdriveGeneratorClient
      initialPeriodes={periodes}
      activePeriodeId={activePeriode.id}
      initialItems={mappingResult.items || []}
      initialTotal={mappingResult.totalCount || 0}
      initialMapped={mappingResult.mappedCount || 0}
    />
  );
}
