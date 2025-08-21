import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_pilarHasil, skor_pilarHasil } = body;
    if (!id_pilarHasil) {
      return NextResponse.json(
        { error: 'id_pilarHasil wajib' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('pilarHasil')
      .update({ skor_pilarHasil })
      .eq('id_pilarHasil', id_pilarHasil);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown' },
      { status: 500 }
    );
  }
}
