import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handler(request: Request) {
  try {
    const body = await request.json();
    const { id_pertanyaan, status } = body;

    if (!id_pertanyaan || !status) {
      return NextResponse.json(
        { error: 'id_pertanyaan dan status wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update the status on the existing buktiDukung row for the pertanyaan
    const { data, error } = await supabase
      .from('buktiDukung')
      .update({ status })
      .eq('id_pertanyaan', id_pertanyaan)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Bukti dukung tidak ditemukan untuk pertanyaan ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export { handler as POST };
