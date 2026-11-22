import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Daftar | REBO V2 BPS Sitaro',
  description:
    'Portal Pendaftaran Sistem Informasi Zona Integritas & Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro.'
};

export default function Page() {
  return <SignUpViewPage />;
}
