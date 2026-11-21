/* eslint-disable no-console */
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import PertanyaanManagerClient from './PertanyaanManagerClient';

export const metadata = {
  title: 'Master Data Pertanyaan LKE | REBO V2',
  description:
    'Pengelolaan instrumen pertanyaan, bobot opsi penilaian, dan indikator Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro'
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ subpilar?: string }>;
};

export default async function PertanyaanPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const initialFilterSubpilar = searchParams?.subpilar || 'ALL';

  const supabase = await createClient();
  const session = await getCurrentUserSession();
  const isSuperAdmin = isAdmin(session.role);

  // 1. Ambil pilar & subpilar untuk dropdown filtering & modal
  const { data: pilarsData } = await supabase
    .from('pilar')
    .select('id_pilar, nama_pilar')
    .order('id_pilar', { ascending: true });

  const { data: subpilarsData } = await supabase
    .from('subpilar')
    .select('id_subpilar, nama_subpilar, id_pilar')
    .order('id_subpilar', { ascending: true });

  // 2. Ambil master pertanyaan berjenjang beserta subpilar, pilar, dan opsi kategoriPenilaian
  const { data: pertanyaanData, error } = await supabase
    .from('pertanyaan')
    .select(
      `
      id_pertanyaan,
      uraian_pertanyaan,
      uraian_singkat,
      deskripsi_pertanyaan,
      id_subpilar,
      subpilar (
        id_subpilar,
        nama_subpilar,
        id_pilar,
        pilar (id_pilar, nama_pilar)
      ),
      kategoriPenilaian (
        id_kategori,
        id_pertanyaan,
        uraian_kategori,
        nilai
      )
    `
    )
    .order('id_pertanyaan', { ascending: true });

  if (error) {
    console.error('Error fetching pertanyaan master:', error.message);
  }

  return (
    <PertanyaanManagerClient
      initialPertanyaans={(pertanyaanData as any) || []}
      subpilars={subpilarsData || []}
      pilars={pilarsData || []}
      isAdmin={isSuperAdmin}
      initialFilterSubpilar={initialFilterSubpilar}
    />
  );
}
