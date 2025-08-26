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

  // Fetch from subpilar, include pilar and nested pertanyaan (+ buktiDukung)
  const { data: subpilars, error } = await supabase
    .from('subpilar')
    .select(
      'id_subpilar,nama_subpilar,pilar(nama_pilar),pertanyaan(id_pertanyaan,deskripsi_pertanyaan,buktiDukung(id_bukti,id_kategori,link_bukti,status_kelengkapan,nilai_akhir,catatan_user,catatan_koordinator))'
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch kategoriPenilaian separately and map by id_kategori because
  // the DB schema may not expose a direct relation name from buktiDukung.
  const { data: kategoriList } = await supabase
    .from('kategoriPenilaian')
    .select('id_kategori,uraian_kategori');
  const kategoriMap: Record<string | number, string> = {};
  (kategoriList || []).forEach((k: any) => {
    kategoriMap[k.id_kategori] = k.uraian_kategori ?? '';
  });

  // Flatten pertanyaan rows from subpilars
  const rows: any[] = [];
  (subpilars || []).forEach((sp: any) => {
    // resolve nama_pilar
    let nama_pilar = '';
    const p = sp.pilar;
    if (Array.isArray(p)) {
      nama_pilar = p[0]?.nama_pilar ?? '';
    } else if (p && typeof p === 'object') {
      nama_pilar = p.nama_pilar ?? '';
    }

    const nama_subpilar = sp.nama_subpilar ?? '';

    // pertanyaan may be array; iterate
    const pertanyaanArr = sp.pertanyaan ?? [];
    if (Array.isArray(pertanyaanArr)) {
      pertanyaanArr.forEach((r: any) => {
        // extract buktiDukung fields (take first if array)
        const bd = r.buktiDukung;
        let first = {} as any;
        if (Array.isArray(bd)) first = bd[0] ?? {};
        else if (bd && typeof bd === 'object') first = bd;

        // Extract uraian_kategori using foreign key id_kategori on buktiDukung
        const fk =
          first.id_kategori ??
          first.idKategori ??
          first.idKategoriPenilaian ??
          null;
        const uraian_kategori = fk != null ? (kategoriMap[fk] ?? '') : '';

        rows.push({
          nama_pilar,
          nama_subpilar,
          id_pertanyaan: r.id_pertanyaan,
          deskripsi_pertanyaan: r.deskripsi_pertanyaan,
          link_bukti: first.link_bukti ?? '',
          uraian_kategori,
          status_kelengkapan: first.status_kelengkapan ?? '',
          nilai_akhir: first.nilai_akhir ?? '',
          catatan_user: first.catatan_user ?? '',
          catatan_koordinator: first.catatan_koordinator ?? ''
        });
      });
    }
  });

  // Sort rows by id_pertanyaan ascending
  rows.sort((a: any, b: any) => {
    const A = Number(a.id_pertanyaan ?? 0);
    const B = Number(b.id_pertanyaan ?? 0);
    return A - B;
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
