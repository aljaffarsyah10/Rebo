import { auth, currentUser } from '@clerk/nextjs/server';
import type { UserRole } from '@/types/globals';
import type { UserSession } from '@/lib/auth/rbac';

export type { UserSession };

/**
 * Mengambil sesi pengguna saat ini di server-side (Server Components & Server Actions).
 * Mengembalikan objek terstandar: { userId, role, assignedPilarId, email, fullName }.
 */
export async function getCurrentUserSession(): Promise<UserSession> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      userId: null,
      role: null,
      assignedPilarId: null,
      email: null,
      fullName: null
    };
  }

  // Coba ambil dari sessionClaims metadata terlebih dahulu
  const metadata = sessionClaims?.metadata as
    | { role?: UserRole; assigned_pilar_id?: string | null }
    | undefined;

  let role: UserRole | null = metadata?.role || null;
  let assignedPilarId: string | null = metadata?.assigned_pilar_id || null;
  let email: string | null = null;
  let fullName: string | null = null;

  try {
    const user = await currentUser();
    if (user) {
      if (!role && user.publicMetadata?.role) {
        role = user.publicMetadata.role as UserRole;
      }
      if (!assignedPilarId && user.publicMetadata?.assigned_pilar_id) {
        assignedPilarId = user.publicMetadata.assigned_pilar_id as string;
      }

      email =
        user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        null;

      fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        null;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '[RBAC] getCurrentUserSession error fetching user profile:',
      error
    );
  }

  return {
    userId,
    role,
    assignedPilarId,
    email,
    fullName
  };
}

/**
 * Mengambil role pengguna aktif saat ini di server-side.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getCurrentUserSession();
  return session.role;
}
