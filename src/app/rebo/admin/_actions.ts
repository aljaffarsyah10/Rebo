'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/globals';

/**
 * Validasi apakah pemanggil aksi memiliki hak akses Super Admin.
 */
async function assertAdmin(): Promise<void> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Not Authenticated: Silakan login terlebih dahulu.');
  }

  const role = sessionClaims?.metadata?.role;
  if (role !== 'admin') {
    throw new Error(
      'Not Authorized: Hanya Super Admin yang memiliki hak mengubah role & penugasan.'
    );
  }
}

/**
 * Server action `setRole` (mendukung FormData):
 * Menetapkan role ('admin' | 'koordinator' | 'operator' | 'tpi') dan pilar ('1'..'6' | null).
 */
export async function setRole(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  await assertAdmin();

  const targetUserId = formData.get('id') as string;
  const roleInput = formData.get('role') as string;
  const pilarInput = formData.get('assigned_pilar_id') as string;

  if (!targetUserId) {
    throw new Error('User ID wajib diisi.');
  }

  const validRoles: UserRole[] = ['admin', 'koordinator', 'operator', 'tpi'];
  const newRole = validRoles.includes(roleInput as UserRole)
    ? (roleInput as UserRole)
    : null;

  // Penugasan pilar hanya relevan untuk koordinator dan operator
  const assignedPilarId =
    newRole === 'koordinator' || newRole === 'operator'
      ? pilarInput && pilarInput !== 'none'
        ? pilarInput
        : null
      : null;

  const client = await clerkClient();

  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role: newRole,
      assigned_pilar_id: assignedPilarId
    }
  });

  revalidatePath('/rebo/admin');
  return {
    ok: true,
    message: newRole
      ? `Role berhasil disimpan sebagai ${newRole}${assignedPilarId ? ` (Pilar ${assignedPilarId})` : ''}.`
      : 'Role pengguna berhasil dicopot.'
  };
}

/**
 * Server action `removeRole` (mendukung FormData):
 * Mencopot seluruh role dan penugasan pilar pengguna.
 */
export async function removeRole(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  await assertAdmin();

  const targetUserId = formData.get('id') as string;
  if (!targetUserId) {
    throw new Error('User ID wajib diisi.');
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role: null,
      assigned_pilar_id: null
    }
  });

  revalidatePath('/rebo/admin');
  return {
    ok: true,
    message: 'Role dan penugasan pilar pengguna berhasil dihapus.'
  };
}

/**
 * Server action langsung (typed object):
 * Memungkinkan pemanggilan langsung dari Client Component tanpa manual FormData.
 */
export async function updateUserRoleAndPilar(params: {
  id: string;
  role: UserRole | null;
  assigned_pilar_id?: string | null;
}): Promise<{ ok: boolean; message: string }> {
  await assertAdmin();

  const { id, role, assigned_pilar_id } = params;
  if (!id) {
    throw new Error('User ID tidak valid.');
  }

  const validRoles: UserRole[] = ['admin', 'koordinator', 'operator', 'tpi'];
  const newRole = role && validRoles.includes(role) ? role : null;

  const assignedPilarId =
    newRole === 'koordinator' || newRole === 'operator'
      ? assigned_pilar_id && assigned_pilar_id !== 'none'
        ? assigned_pilar_id
        : null
      : null;

  const client = await clerkClient();

  await client.users.updateUserMetadata(id, {
    publicMetadata: {
      role: newRole,
      assigned_pilar_id: assignedPilarId
    }
  });

  revalidatePath('/rebo/admin');
  return {
    ok: true,
    message: newRole
      ? `Peran pengguna berhasil diperbarui.`
      : 'Peran pengguna berhasil dihapus.'
  };
}
