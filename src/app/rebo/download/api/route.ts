import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function toCSV(rows: any[]) {
  if (!rows || rows.length === 0) return '';
  const keys = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = keys.join(',');
  const body = rows
    .map((r) => keys.map((k) => escape(r[k] ?? '')).join(','))
    .join('\n');
  return header + '\n' + body;
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pertanyaan')
    // join buktiDukung and select relevant fields from related table
    .select(
      'id_pertanyaan,deskripsi_pertanyaan,buktiDukung(link_bukti,status_kelengkapan,nilai_akhir,catatan_user,catatan_koordinator)'
    )
    .order('id_pertanyaan', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((r: any) => {
    // buktiDukung can be an object or array depending on relationship
    let link = '';
    let status_kelengkapan = '';
    let nilai_akhir: any = '';
    let catatan_user = '';
    let catatan_koordinator = '';

    const bd = r.buktiDukung;
    if (Array.isArray(bd)) {
      const first = bd[0] ?? {};
      link = first.link_bukti ?? '';
      status_kelengkapan = first.status_kelengkapan ?? '';
      nilai_akhir = first.nilai_akhir ?? '';
      catatan_user = first.catatan_user ?? '';
      catatan_koordinator = first.catatan_koordinator ?? '';
    } else if (bd && typeof bd === 'object') {
      link = bd.link_bukti ?? '';
      status_kelengkapan = bd.status_kelengkapan ?? '';
      nilai_akhir = bd.nilai_akhir ?? '';
      catatan_user = bd.catatan_user ?? '';
      catatan_koordinator = bd.catatan_koordinator ?? '';
    }

    return {
      id_pertanyaan: r.id_pertanyaan,
      deskripsi_pertanyaan: r.deskripsi_pertanyaan,
      link_bukti: link,
      status_kelengkapan,
      nilai_akhir,
      catatan_user,
      catatan_koordinator
    };
  });

  const csv = toCSV(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pertanyaan.csv"'
    }
  });
}
