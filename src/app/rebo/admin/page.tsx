import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { SearchUsers } from './SearchUsers';
import { clerkClient } from '@clerk/nextjs/server';
import { removeRole, setRole } from './_actions';
import AdminActions from './AdminActions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatarProfile } from '@/components/user-avatar-profile';

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole('admin')) {
    redirect('/');
  }

  const query = (await params.searchParams).search;

  const client = await clerkClient();

  const users = query ? (await client.users.getUserList({ query })).data : [];

  const adminCount = users.filter(
    (u) => String(u.publicMetadata?.role) === 'admin'
  ).length;

  return (
    <div className='space-y-8 p-6'>
      <div className='space-y-6'>
        {/* Header / Hero (match overview palette) */}
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-purple-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

          <div className='absolute top-0 left-0 h-full w-full'>
            <div className='absolute top-4 left-4 h-16 w-16 animate-pulse rounded-full bg-blue-200/20 blur-xl dark:bg-blue-400/10'></div>
            <div className='absolute right-8 bottom-8 h-20 w-20 animate-pulse rounded-full bg-indigo-200/25 blur-2xl dark:bg-indigo-400/15'></div>
            <div className='absolute top-1/2 left-1/3 h-12 w-12 animate-pulse rounded-full bg-purple-200/30 blur-lg dark:bg-purple-400/20'></div>
          </div>

          <div className='relative z-10'>
            <div>
              <h1 className='bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent dark:from-slate-200 dark:via-blue-400 dark:to-indigo-400'>
                Admin Dashboard
              </h1>
              <p className='mt-1 text-xl text-slate-700 dark:text-slate-300'>
                Manage users, roles, and access. Use the search to quickly find
                people and update roles from the card actions.
              </p>
            </div>

            {/* Search input now placed below the title for clarity */}
            <div className='mt-4 max-w-lg'>
              <SearchUsers />
            </div>

            <div className='mt-4 flex items-center gap-6'>
              <div>
                <div className='text-sm text-slate-600 dark:text-slate-400'>
                  Total
                </div>
                <div className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
                  {users.length}
                </div>
              </div>
            </div>
          </div>

          <div className='relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl border border-blue-200/30 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-600/30 dark:bg-slate-800/60'>
              <div className='text-sm text-slate-700 dark:text-slate-300'>
                Total users
              </div>
              <div className='mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {users.length}
              </div>
            </div>
            <div className='rounded-2xl border border-blue-200/30 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-600/30 dark:bg-slate-800/60'>
              <div className='text-sm text-slate-700 dark:text-slate-300'>
                Admins
              </div>
              <div className='mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {adminCount}
              </div>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div>
          <Card className='p-0'>
            <CardHeader className='px-6 py-4'>
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Search and manage users. Showing {users.length} result
                  {users.length !== 1 ? 's' : ''}.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='px-6 py-6'>
              {users.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No users found. Try a different search or invite new users.
                </div>
              ) : (
                <>
                  <div className='hidden md:block'>
                    <table className='w-full table-fixed'>
                      <thead>
                        <tr className='text-left text-sm text-slate-600 dark:text-slate-400'>
                          <th className='w-1/3 py-2'>Name</th>
                          <th className='w-1/3 py-2'>Email</th>
                          <th className='w-1/6 py-2'>Role</th>
                          <th className='w-1/6 py-2'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => {
                          const email = user.emailAddresses.find(
                            (e) => e.id === user.primaryEmailAddressId
                          )?.emailAddress;

                          const role = String(user.publicMetadata?.role) || '';

                          const roleClasses =
                            role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800';

                          return (
                            <tr
                              key={user.id}
                              className='border-t border-slate-100 dark:border-slate-800'
                            >
                              <td className='py-4'>
                                <div className='flex items-center gap-3'>
                                  <UserAvatarProfile
                                    user={{
                                      imageUrl:
                                        (user as any).profileImageUrl ||
                                        undefined,
                                      fullName:
                                        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                        user.username ||
                                        'Unknown',
                                      emailAddresses: user.emailAddresses || [
                                        { emailAddress: email || '' }
                                      ]
                                    }}
                                    showInfo
                                  />
                                  <div className='font-medium'>
                                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                      user.username ||
                                      'Unknown'}
                                    <div className='text-muted-foreground text-xs'>
                                      ID: {user.id.slice(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className='truncate py-4 text-sm text-slate-700 dark:text-slate-300'>
                                {email || '—'}
                              </td>
                              <td className='py-4'>
                                <Badge className={`text-xs ${roleClasses}`}>
                                  {role || '—'}
                                </Badge>
                              </td>
                              <td className='py-4'>
                                <div className='flex items-center gap-2'>
                                  {/* client actions for role management */}
                                  <div className='inline'>
                                    {/* @ts-ignore Server->Client boundary: AdminActions is client component */}
                                    <AdminActions userId={user.id} />
                                  </div>
                                  {/* moderator role removed */}
                                  {/* remove handled by AdminActions */}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden lg:grid-cols-3'>
                    {users.map((user) => {
                      const email = user.emailAddresses.find(
                        (e) => e.id === user.primaryEmailAddressId
                      )?.emailAddress;

                      const role = String(user.publicMetadata?.role) || '';

                      const roleClasses =
                        role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800';

                      return (
                        <div key={user.id} className='relative'>
                          <div className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900'>
                            <div className='flex items-start justify-between gap-4'>
                              <div className='flex items-center gap-4'>
                                <UserAvatarProfile
                                  user={{
                                    imageUrl:
                                      (user as any).profileImageUrl ||
                                      undefined,
                                    fullName:
                                      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                      user.username ||
                                      'Unknown',
                                    emailAddresses: user.emailAddresses || [
                                      { emailAddress: email || '' }
                                    ]
                                  }}
                                  showInfo
                                />
                                <div>
                                  <div className='font-medium'>
                                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                      user.username ||
                                      'Unknown'}
                                  </div>
                                  <div className='text-muted-foreground max-w-xs truncate text-sm'>
                                    {email || '—'}
                                  </div>
                                </div>
                              </div>

                              <div className='text-right'>
                                <div className='flex flex-col items-end gap-2'>
                                  <span>
                                    <Badge className={`text-xs ${roleClasses}`}>
                                      {role || '—'}
                                    </Badge>
                                  </span>
                                  <div className='text-muted-foreground text-xs'>
                                    ID: {user.id.slice(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='mt-4 flex items-center justify-between gap-3'>
                              <div className='flex gap-2'>
                                {/* client actions for role management */}
                                {/* @ts-ignore Server->Client boundary: AdminActions is client component */}
                                <AdminActions userId={user.id} />
                              </div>

                              {/* remove handled by AdminActions */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className='px-6 py-4'>
              <div className='text-muted-foreground text-sm'>
                Tip: use exact email or name for best results.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
