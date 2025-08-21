import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: update status for a bukti
async function postHandler(request: Request) {
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

    // Build update payload. Do NOT write a non-existent `status` column.
    // The DB column is `status_kelengkapan` (numeric completeness state).
    const updatePayload: any = {};
    if (status && /dikirim/i.test(status)) {
      updatePayload.status_kelengkapan = 1;
    } else if (status && /disetujui|approve|approved/i.test(status)) {
      updatePayload.status_kelengkapan = 2;
    } else if (status && /ditolak|reject|rejected/i.test(status)) {
      // keep explicit mapping if you want a different code for rejected
      updatePayload.status_kelengkapan = 0;
    }

    // Update the status on the existing buktiDukung row for the pertanyaan
    // also join the `statusBukti` relation so caller can get `nama_status` immediately
    const { data, error } = await supabase
      .from('buktiDukung')
      .update(updatePayload)
      .eq('id_pertanyaan', id_pertanyaan)
      .select('*, statusBukti (id_status, nama_status)')
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

    // flatten nama_status for convenience and include a compatibility `status` string
    const flattened = {
      ...data,
      nama_status: (data as any)?.statusBukti?.nama_status ?? null,
      status_kelengkapan: (data as any)?.status_kelengkapan ?? null,
      // include `status` field so older client code that reads res.data.status keeps working
      status: status
    };

    return NextResponse.json({ success: true, data: flattened });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: return list of status options from statusBukti table
async function getHandler() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('statusBukti')
      .select('id_status, nama_status')
      .order('id_status', { ascending: true });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export { postHandler as POST, getHandler as GET };
