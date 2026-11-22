import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Masuk | REBO V2 BPS Sitaro',
  description:
    'Portal Masuk Sistem Informasi Zona Integritas & Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro.'
};

export default function Page() {
  return <SignInViewPage />;
}
