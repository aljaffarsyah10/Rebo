import { NextResponse } from 'next/server';
import { checkRole } from '@/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';
import type { UserRole } from '@/types/globals';

export async function POST(req: Request) {
  const ok = await checkRole('admin');
  if (!ok) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Not authorized: Hanya Super Admin yang berhak mengubah role.'
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, action, role, assigned_pilar_id } = body as {
      id: string;
      action: 'set' | 'remove';
      role?: string;
      assigned_pilar_id?: string | null;
    };

    if (!id) {
      return NextResponse.json(
        { ok: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    if (action === 'set') {
      const validRoles: UserRole[] = [
        'admin',
        'koordinator',
        'operator',
        'tpi'
      ];
      const targetRole = validRoles.includes(role as UserRole)
        ? (role as UserRole)
        : null;

      const pilarId =
        targetRole === 'koordinator' || targetRole === 'operator'
          ? assigned_pilar_id && assigned_pilar_id !== 'none'
            ? String(assigned_pilar_id)
            : null
          : null;

      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: targetRole,
          assigned_pilar_id: pilarId
        }
      });
      return NextResponse.json({
        ok: true,
        message: 'Role & Pilar berhasil diperbarui'
      });
    }

    if (action === 'remove') {
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: null,
          assigned_pilar_id: null
        }
      });
      return NextResponse.json({
        ok: true,
        message: 'Role & Pilar berhasil dicopot'
      });
    }

    return NextResponse.json(
      { ok: false, message: 'Action tidak dikenali' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
