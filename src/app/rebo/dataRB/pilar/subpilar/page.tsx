/* eslint-disable no-console */
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import SubpilarManagerClient from './SubpilarManagerClient';

export const metadata = {
  title: 'Master Data Subpilar | REBO V2',
  description:
    'Pengelolaan master data Subpilar Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro'
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ pilar?: string }>;
};

export default async function SubpilarPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const initialFilterPilar = searchParams?.pilar || 'ALL';

  const supabase = await createClient();
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role);

  // 1. Ambil daftar pilar untuk dropdown filter & form
  const { data: pilarsData } = await supabase
    .from('pilar')
    .select('id_pilar, nama_pilar')
    .order('id_pilar', { ascending: true });

  // 2. Ambil daftar subpilar berelasi dengan pilar
  const { data: subpilarsData, error } = await supabase
    .from('subpilar')
    .select(
      `
      *,
      pilar (id_pilar, nama_pilar, kode_pilar)
    `
    )
    .order('id_subpilar', { ascending: true });

  if (error) {
    console.error('Error fetching subpilars:', error.message);
  }

  return (
    <SubpilarManagerClient
      initialSubpilars={subpilarsData || []}
      pilars={pilarsData || []}
      isAdmin={isSuperAdmin}
      initialFilterPilar={initialFilterPilar}
    />
  );
}
