/* eslint-disable no-console */
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import PilarManagerClient from './PilarManagerClient';

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
      *,
      area (*)
    `
    )
    .order('id_pilar', { ascending: true });

  if (error) {
    console.error('Error fetching pilars:', error.message);
  }

  return (
    <PilarManagerClient
      initialPilars={pilarsData || []}
      isAdmin={isSuperAdmin}
    />
  );
}
