import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handler(request: Request) {
  try {
    const body = await request.json();
    const { link_bukti, id_kategori, id_pertanyaan, nilai_akhir } = body;
    if (
      !link_bukti ||
      !id_kategori ||
      !id_pertanyaan ||
      nilai_akhir === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'link_bukti, id_kategori, id_pertanyaan, dan nilai_akhir wajib diisi'
        },
        { status: 400 }
      );
    }
    const supabase = await createClient();
    if (request.method === 'POST') {
      const { error } = await supabase
        .from('buktiDukung')
        .insert({ link_bukti, id_kategori, id_pertanyaan, nilai_akhir });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    } else if (request.method === 'PUT') {
      const { error } = await supabase
        .from('buktiDukung')
        .update({ link_bukti, id_kategori, nilai_akhir })
        .eq('id_pertanyaan', id_pertanyaan);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export { handler as POST, handler as PUT };
