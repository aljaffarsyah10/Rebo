import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

// POST handler - create or upsert a record.
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      link_bukti,
      id_kategori,
      id_pertanyaan,
      nilai_akhir,
      catatan_user,
      catatan_koordinator
    } = body;

    // Minimal required fields from frontend: id_pertanyaan and link_bukti.
    if (!id_pertanyaan) {
      return NextResponse.json(
        { error: 'id_pertanyaan wajib diisi' },
        { status: 400 }
      );
    }

    if (!link_bukti) {
      return NextResponse.json(
        { error: 'link_bukti wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // build insert payload, allow id_kategori and nilai_akhir to be null/undefined
    const insertData: Record<string, any> = {
      id_pertanyaan,
      link_bukti
    };
    if (Object.prototype.hasOwnProperty.call(body, 'id_kategori')) {
      insertData.id_kategori = id_kategori;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'nilai_akhir')) {
      insertData.nilai_akhir = nilai_akhir;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'catatan_user')) {
      insertData.catatan_user = catatan_user;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'catatan_koordinator')) {
      insertData.catatan_koordinator = catatan_koordinator;
    }

    // Use upsert to avoid duplicate primary key errors when a record for
    // the given id_pertanyaan already exists. onConflict set to id_pertanyaan.
    const { data, error } = await supabase
      .from('buktiDukung')
      .upsert(insertData, { onConflict: 'id_pertanyaan' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT handler - update an existing record. Only `id_pertanyaan` is required;
// update payload will include only provided fields to avoid overwriting with undefined.
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      link_bukti,
      id_kategori,
      id_pertanyaan,
      nilai_akhir,
      catatan_user,
      catatan_koordinator
    } = body;

    if (!id_pertanyaan) {
      return NextResponse.json(
        { error: 'id_pertanyaan wajib diisi untuk melakukan update' },
        { status: 400 }
      );
    }

    // Build update payload with only present fields
    const updateData: Record<string, any> = {};
    if (link_bukti !== undefined) updateData.link_bukti = link_bukti;
    if (id_kategori !== undefined) updateData.id_kategori = id_kategori;
    if (nilai_akhir !== undefined) updateData.nilai_akhir = nilai_akhir;
    if (catatan_user !== undefined) updateData.catatan_user = catatan_user;
    if (catatan_koordinator !== undefined)
      updateData.catatan_koordinator = catatan_koordinator;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada field yang diberikan untuk diupdate' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('buktiDukung')
      .update(updateData)
      .eq('id_pertanyaan', id_pertanyaan);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
