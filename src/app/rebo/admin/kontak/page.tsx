import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import {
  getKontakListAction,
  getGatewayStatusAction
} from '@/actions/kontak-actions';
import KontakManagerClient from './KontakManagerClient';

export const metadata = {
  title: 'Pengaturan Notifikasi & Kontak WhatsApp | REBO V2',
  description:
    'Manajemen PIC 6 Pilar ZI, nomor hotline verifikator, pemantauan live status WhatsApp Gateway, dan uji coba pengiriman notifikasi otomatis REBO V2 BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function KontakPage() {
  // 1. Verifikasi RBAC: Hanya Super Admin atau Tim Verifikator (TPI) yang berhak mengakses
  const session = await getCurrentUserSession();
  const isAuthorized = isAdmin(session.role) || isTPI(session.role);

  if (!isAuthorized) {
    redirect('/rebo/overview');
  }

  // 2. Ambil data kontak awal dan status gateway saat ini
  const [kontakRes, gatewayStatus] = await Promise.all([
    getKontakListAction(),
    getGatewayStatusAction()
  ]);

  return (
    <KontakManagerClient
      initialContacts={kontakRes.data || []}
      initialGatewayStatus={gatewayStatus}
    />
  );
}
