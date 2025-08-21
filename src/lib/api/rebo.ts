import { createClient } from '@/lib/supabase/client';
import type { BuktiDukung, Pertanyaan, Subpilar } from '@/types/rebo';

export async function fetchSubpilarWithPertanyaan(pilarId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subpilar')
    .select(
      `*, pilar (id_pilar, nama_pilar), pertanyaan (*, kategoriPenilaian (*))`
    )
    .eq('id_pilar', pilarId)
    .order('id_subpilar', { ascending: true });

  if (error) throw error;
  return (data as Subpilar[]) || [];
}

export async function fetchBuktiByPertanyaanIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const supabase = createClient();
  // select related statusBukti.nama_status via relationship `statusBukti`
  const { data, error } = await supabase
    .from('buktiDukung')
    .select('*, statusBukti (id_status, nama_status)')
    .in('id_pertanyaan', ids);
  if (error) throw error;
  // flatten returned relation to include nama_status directly
  const mapped = (data || []).map((row: any) => ({
    ...row,
    status_kelengkapan: row.status_kelengkapan ?? null,
    nama_status: row.statusBukti?.nama_status ?? null
  }));
  return (mapped as BuktiDukung[]) || [];
}

export async function upsertBukti(
  payload: Partial<BuktiDukung>,
  method?: 'POST' | 'PUT'
) {
  // payload should contain id_pertanyaan and either link_bukti or status or other fields
  const httpMethod = method ?? (payload.id_bukti ? 'PUT' : 'POST');
  const res = await fetch('/api', {
    method: httpMethod,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function sendStatus(id_pertanyaan: string, status: string) {
  const res = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pertanyaan, status })
  });
  return res.json();
}

export async function approveReject(id_pertanyaan: string, status: string) {
  // status expected: 'Disetujui' or 'Ditolak' or similar
  const res = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pertanyaan, status })
  });
  return res.json();
}
