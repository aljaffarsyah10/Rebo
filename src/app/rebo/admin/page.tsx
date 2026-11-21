import { redirect } from 'next/navigation';
import Link from 'next/link';
import { checkRole } from '@/utils/roles';
import { SearchUsers } from './SearchUsers';
import { clerkClient } from '@clerk/nextjs/server';
import AdminActions from './AdminActions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import {
  ROLE_LABELS,
  ROLE_BADGE_CLASSES,
  getPilarInfo,
  type UserRole
} from '@/lib/auth/rbac';
import {
  ShieldCheck,
  Users,
  Layers,
  Award,
  UserCheck,
  Folder,
  History
} from 'lucide-react';

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!(await checkRole('admin'))) {
    redirect('/rebo/overview');
  }

  const query = (await params.searchParams).search;
  const client = await clerkClient();

  const usersResponse = await client.users.getUserList(
    query ? { query, limit: 100 } : { limit: 100 }
  );
  const users = usersResponse.data;

  const adminCount = users.filter(
    (u) => u.publicMetadata?.role === 'admin'
  ).length;
  const koordinatorCount = users.filter(
    (u) => u.publicMetadata?.role === 'koordinator'
  ).length;
  const operatorCount = users.filter(
    (u) => u.publicMetadata?.role === 'operator'
  ).length;
  const tpiCount = users.filter((u) => u.publicMetadata?.role === 'tpi').length;

  return (
    <div className='space-y-8 p-6'>
      <div className='space-y-6'>
        {/* Header / Hero */}
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-purple-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

          <div className='absolute top-0 left-0 h-full w-full'>
            <div className='absolute top-4 left-4 h-16 w-16 animate-pulse rounded-full bg-blue-200/20 blur-xl dark:bg-blue-400/10' />
            <div className='absolute right-8 bottom-8 h-20 w-20 animate-pulse rounded-full bg-indigo-200/25 blur-2xl dark:bg-indigo-400/15' />
            <div className='absolute top-1/2 left-1/3 h-12 w-12 animate-pulse rounded-full bg-purple-200/30 blur-lg dark:bg-purple-400/20' />
          </div>

          <div className='relative z-10'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                <ShieldCheck className='h-3.5 w-3.5' />
                Manajemen Akses & RBAC REBO V2
              </div>
              <h1 className='mt-2 bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent dark:from-slate-200 dark:via-blue-400 dark:to-indigo-400'>
                Admin Dashboard & User Management
              </h1>
              <p className='mt-1 text-base text-slate-700 dark:text-slate-300'>
                Kelola hak akses pengguna, penetapan peran (Super Admin,
                Koordinator, Operator, TPI), dan penugasan pilar kerja Zona
                Integritas BPS Kab. Sitaro.
              </p>

              {/* Admin Subnav */}
              <div className='mt-4 flex flex-wrap items-center gap-2'>
                <Link
                  href='/rebo/admin'
                  className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700'
                >
                  <Users className='h-3.5 w-3.5' />
                  Manajemen Pengguna & RBAC
                </Link>
                <Link
                  href='/rebo/admin/gdrive-generator'
                  className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
                >
                  <Folder className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  GDrive Generator per Indikator
                </Link>
                <Link
                  href='/rebo/admin/audit-log'
                  className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
                >
                  <History className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
                  Audit Trail & Log Aktivitas
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className='mt-5 max-w-lg'>
              <SearchUsers />
            </div>
          </div>

          {/* Stats Cards */}
          <div className='relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
            <div className='rounded-2xl border border-blue-200/30 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-600/30 dark:bg-slate-800/70'>
              <div className='flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400'>
                <Users className='h-4 w-4 text-blue-500' />
                Total Akun
              </div>
              <div className='mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {users.length}
              </div>
            </div>

            <div className='rounded-2xl border border-purple-200/40 bg-white/70 p-4 backdrop-blur-sm dark:border-purple-800/30 dark:bg-slate-800/70'>
              <div className='flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300'>
                <ShieldCheck className='h-4 w-4 text-purple-600' />
                Super Admin
              </div>
              <div className='mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100'>
                {adminCount}
              </div>
            </div>

            <div className='rounded-2xl border border-blue-200/40 bg-white/70 p-4 backdrop-blur-sm dark:border-blue-800/30 dark:bg-slate-800/70'>
              <div className='flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300'>
                <UserCheck className='h-4 w-4 text-blue-600' />
                Koordinator
              </div>
              <div className='mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100'>
                {koordinatorCount}
              </div>
            </div>

            <div className='rounded-2xl border border-emerald-200/40 bg-white/70 p-4 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-slate-800/70'>
              <div className='flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                <Layers className='h-4 w-4 text-emerald-600' />
                Operator
              </div>
              <div className='mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100'>
                {operatorCount}
              </div>
            </div>

            <div className='col-span-2 rounded-2xl border border-amber-200/40 bg-white/70 p-4 backdrop-blur-sm sm:col-span-1 dark:border-amber-800/30 dark:bg-slate-800/70'>
              <div className='flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300'>
                <Award className='h-4 w-4 text-amber-600' />
                TPI (Auditor)
              </div>
              <div className='mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100'>
                {tpiCount}
              </div>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div>
          <Card className='p-0 shadow-sm'>
            <CardHeader className='border-b border-slate-100 px-6 py-4 dark:border-slate-800'>
              <div>
                <CardTitle className='text-lg font-bold'>
                  Daftar Pengguna Sistem
                </CardTitle>
                <CardDescription className='text-xs'>
                  {query
                    ? `Hasil pencarian untuk "${query}" (menampilkan ${users.length} pengguna).`
                    : `Menampilkan ${users.length} pengguna terdaftar.`}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='px-6 py-4'>
              {users.length === 0 ? (
                <div className='text-muted-foreground py-12 text-center text-sm'>
                  Tidak ada pengguna ditemukan. Gunakan kata kunci lain untuk
                  mencari.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className='hidden md:block'>
                    <table className='w-full table-fixed'>
                      <thead>
                        <tr className='border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400'>
                          <th className='w-4/12 py-3'>Pengguna</th>
                          <th className='w-3/12 py-3'>Email</th>
                          <th className='w-3/12 py-3'>Role & Penugasan</th>
                          <th className='w-2/12 py-3 text-right'>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => {
                          const email =
                            user.emailAddresses.find(
                              (e) => e.id === user.primaryEmailAddressId
                            )?.emailAddress ||
                            user.emailAddresses?.[0]?.emailAddress ||
                            '';

                          const fullName =
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                            user.username ||
                            'Pengguna';

                          const role =
                            (user.publicMetadata?.role as
                              | UserRole
                              | undefined) || undefined;
                          const pilarId =
                            (user.publicMetadata?.assigned_pilar_id as
                              | string
                              | undefined) || undefined;
                          const pilarInfo = getPilarInfo(pilarId);

                          return (
                            <tr
                              key={user.id}
                              className='border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-800/80 dark:hover:bg-slate-800/40'
                            >
                              <td className='py-4'>
                                <div className='flex items-center gap-3'>
                                  <UserAvatarProfile
                                    user={{
                                      imageUrl:
                                        (user as any).profileImageUrl ||
                                        undefined,
                                      fullName,
                                      emailAddresses: user.emailAddresses || [
                                        { emailAddress: email }
                                      ]
                                    }}
                                    showInfo
                                  />
                                  <div className='font-medium text-slate-900 dark:text-slate-100'>
                                    {fullName}
                                    <div className='text-muted-foreground text-xs'>
                                      ID: {user.id.slice(0, 12)}...
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className='truncate py-4 text-sm text-slate-700 dark:text-slate-300'>
                                {email || '—'}
                              </td>

                              <td className='py-4'>
                                <div className='flex flex-col items-start gap-1'>
                                  {role ? (
                                    <Badge
                                      className={`text-[11px] ${
                                        ROLE_BADGE_CLASSES[role] || ''
                                      }`}
                                    >
                                      {ROLE_LABELS[role] || role}
                                    </Badge>
                                  ) : (
                                    <span className='text-muted-foreground text-xs italic'>
                                      Tanpa Role
                                    </span>
                                  )}

                                  {pilarInfo && (
                                    <span className='text-muted-foreground text-[11px] font-medium'>
                                      {pilarInfo.kode}: {pilarInfo.nama}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className='py-4 text-right'>
                                <div className='flex justify-end'>
                                  <AdminActions
                                    userId={user.id}
                                    userName={fullName}
                                    userEmail={email}
                                    currentRole={role}
                                    currentPilarId={pilarId}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden'>
                    {users.map((user) => {
                      const email =
                        user.emailAddresses.find(
                          (e) => e.id === user.primaryEmailAddressId
                        )?.emailAddress ||
                        user.emailAddresses?.[0]?.emailAddress ||
                        '';

                      const fullName =
                        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                        user.username ||
                        'Pengguna';

                      const role =
                        (user.publicMetadata?.role as UserRole | undefined) ||
                        undefined;
                      const pilarId =
                        (user.publicMetadata?.assigned_pilar_id as
                          | string
                          | undefined) || undefined;
                      const pilarInfo = getPilarInfo(pilarId);

                      return (
                        <div
                          key={user.id}
                          className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                              <UserAvatarProfile
                                user={{
                                  imageUrl:
                                    (user as any).profileImageUrl || undefined,
                                  fullName,
                                  emailAddresses: user.emailAddresses || [
                                    { emailAddress: email }
                                  ]
                                }}
                                showInfo
                              />
                              <div>
                                <div className='font-semibold text-slate-900 dark:text-slate-100'>
                                  {fullName}
                                </div>
                                <div className='text-muted-foreground max-w-[180px] truncate text-xs'>
                                  {email || '—'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800'>
                            {role ? (
                              <Badge
                                className={`text-[11px] ${
                                  ROLE_BADGE_CLASSES[role] || ''
                                }`}
                              >
                                {ROLE_LABELS[role] || role}
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground text-xs italic'>
                                Tanpa Role
                              </span>
                            )}

                            {pilarInfo && (
                              <Badge variant='outline' className='text-[10px]'>
                                {pilarInfo.kode}
                              </Badge>
                            )}
                          </div>

                          <div className='mt-3 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800'>
                            <AdminActions
                              userId={user.id}
                              userName={fullName}
                              userEmail={email}
                              currentRole={role}
                              currentPilarId={pilarId}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className='border-t border-slate-100 px-6 py-3 text-xs text-slate-500 dark:border-slate-800'>
              Tips: Gunakan pencarian nama atau email untuk menemukan pengguna
              dengan cepat.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
