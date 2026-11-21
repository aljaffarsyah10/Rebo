import { getArsipList } from '@/actions/arsip-actions';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import ArsipClient from '@/components/rebo/arsip-client';

export const metadata = {
  title: 'Arsip Dokumen Digital ZI | REBO V2',
  description:
    'Katalog repositori dokumen resmi pembangunan Zona Integritas BPS Kab. Kepulauan Siau Tagulandang Biaro: SK Tim Kerja, Rencana Aksi, SOP Inovasi, LKE Resmi, dan Pedoman PMPRB.'
};

export const dynamic = 'force-dynamic';

export default async function ArsipPage() {
  const [arsipRes, session] = await Promise.all([
    getArsipList(),
    getCurrentUserSession()
  ]);

  const userIsAdmin = isAdmin(session.role);

  return (
    <ArsipClient
      initialData={arsipRes.data}
      availableYears={arsipRes.availableYears}
      isAdmin={userIsAdmin}
    />
  );
}
