'use server';

import { checkRole } from '@/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';

export async function setRole(formData: FormData): Promise<void> {
  // Ensure the caller is admin
  const ok = await checkRole('admin');
  if (!ok) throw new Error('Not Authorized');

  const client = await clerkClient();

  await client.users.updateUserMetadata(formData.get('id') as string, {
    publicMetadata: { role: formData.get('role') }
  });
}

export async function removeRole(formData: FormData): Promise<void> {
  const ok = await checkRole('admin');
  if (!ok) throw new Error('Not Authorized');

  const client = await clerkClient();

  await client.users.updateUserMetadata(formData.get('id') as string, {
    publicMetadata: { role: null }
  });
}
