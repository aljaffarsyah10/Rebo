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
  const { data, error } = await supabase
    .from('buktiDukung')
    .select('*')
    .in('id_pertanyaan', ids);
  if (error) throw error;
  return (data as BuktiDukung[]) || [];
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
