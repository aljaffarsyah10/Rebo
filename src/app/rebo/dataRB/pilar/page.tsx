/* eslint-disable no-console */
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import PilarManagerClient, { type PilarItem } from './PilarManagerClient';

export const metadata = {
  title: 'Master Data Pilar | REBO V2',
  description:
    'Pengelolaan master data Pilar Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function PilarPage() {
  const supabase = await createClient();
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role);

  const { data: pilarsData, error } = await supabase
    .from('pilar')
    .select(
      `
      id_pilar,
      nama_pilar,
      id_area,
      area (id_area, nama_area)
    `
    )
    .order('id_pilar', { ascending: true });

  if (error) {
    console.error('Error fetching pilars:', error.message);
  }

  const mappedPilars: PilarItem[] = (pilarsData || []).map((p: any) => ({
    id_pilar: Number(p.id_pilar),
    nama_pilar: String(p.nama_pilar),
    id_area: Number(p.id_area),
    area: Array.isArray(p.area) ? p.area[0] : p.area
  }));

  return (
    <PilarManagerClient initialPilars={mappedPilars} isAdmin={isSuperAdmin} />
  );
}
