import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { getUserProfileAction } from '@/actions/profile-actions';
import UserProfileClient from '@/components/rebo/user-profile-client';
import type { UserProfileData } from '@/types/rebo';

export const metadata = {
  title: 'Profil Pengguna & Preferensi Notifikasi WA | REBO V2',
  description:
    'Pengaturan profil personal, nomor WhatsApp, pilar tugas penugasan, dan preferensi notifikasi hasil reviu berkas bukti dukung Zona Integritas BPS Sitaro'
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect('/auth/sign-in');
  }

  const profileRes = await getUserProfileAction();

  const fallbackProfile: UserProfileData = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    full_name:
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      clerkUser.username ||
      'Pegawai BPS Sitaro',
    no_wa: '',
    telepon: '',
    role: (clerkUser.publicMetadata?.role as string) || 'operator',
    pilar_tugas: null,
    notif_wa_approval: true,
    notif_wa_revision: true,
    notif_wa_deadline: true
  };

  const initialProfile = profileRes.data || fallbackProfile;

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <UserProfileClient
        initialProfile={initialProfile}
        clerkUserInfo={{
          imageUrl: clerkUser.imageUrl,
          username: clerkUser.username || undefined
        }}
      />
    </div>
  );
}
