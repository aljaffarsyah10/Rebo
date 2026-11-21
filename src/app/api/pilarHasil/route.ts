import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;
    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Hanya admin yang dapat mengubah skor' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.error('[API /api/pilarHasil] PUT body:', body);
    const { id_pilarHasil, skor_pilarHasil } = body;
    if (!id_pilarHasil) {
      return NextResponse.json(
        { error: 'id_pilarHasil wajib' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pilarHasil')
      .update({ skor_pilarHasil })
      .eq('id_pilarHasil', id_pilarHasil)
      .select()
      .single();

    if (error) {
      console.error('[API /api/pilarHasil] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error('[API /api/pilarHasil] updated row:', data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[API /api/pilarHasil] exception:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown' },
      { status: 500 }
    );
  }
}
