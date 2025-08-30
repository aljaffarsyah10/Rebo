import { NextResponse } from 'next/server';
import { checkRole } from '@/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const ok = await checkRole('admin');
  if (!ok)
    return NextResponse.json(
      { ok: false, message: 'Not authorized' },
      { status: 403 }
    );

  const body = await req.json();
  const { id, action, role } = body as {
    id: string;
    action: 'set' | 'remove';
    role?: string;
  };

  try {
    const client = await clerkClient();

    if (action === 'set') {
      await client.users.updateUserMetadata(id, { publicMetadata: { role } });
      return NextResponse.json({ ok: true, message: 'Role updated' });
    }

    if (action === 'remove') {
      await client.users.updateUserMetadata(id, {
        publicMetadata: { role: null }
      });
      return NextResponse.json({ ok: true, message: 'Role removed' });
    }

    return NextResponse.json(
      { ok: false, message: 'Unknown action' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Error' },
      { status: 500 }
    );
  }
}
