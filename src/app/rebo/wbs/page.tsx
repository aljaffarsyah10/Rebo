import WBSPortalClient from '@/components/rebo/wbs-portal-client';

export const metadata = {
  title: 'Kanal Pengaduan & Whistleblowing System (WBS) | BPS Sitaro',
  description:
    'Portal resmi pelaporan pelanggaran kode etik, gratifikasi, pungli, benturan kepentingan, dan maladministrasi di lingkungan BPS Kabupaten Kepulauan Sitaro dengan perlindungan 100% anonimitas.'
};

export const dynamic = 'force-dynamic';

interface WBSPageProps {
  searchParams: Promise<{
    ticket?: string;
  }>;
}

export default async function WBSPage({ searchParams }: WBSPageProps) {
  const resolvedParams = await searchParams;

  return <WBSPortalClient initialTicket={resolvedParams?.ticket} />;
}
