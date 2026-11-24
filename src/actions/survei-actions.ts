/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { HasilSurveiPelayanan, SurveiSummaryData } from '@/types/rebo';
import {
  konversiKeSkala100,
  getMutuIKM,
  getMutuIPAK,
  hitungSyaratMutlak,
  DEFAULT_SURVEI_LIST,
  formatSurveiSummaryData
} from '@/lib/survei/survei-utils';

// Fallback in-memory store
let inMemorySurveiList: HasilSurveiPelayanan[] = [...DEFAULT_SURVEI_LIST];

/**
 * Server Action: Mengambil ringkasan survei IKM dan IPAK beserta syarat mutlak WBK/WBBM
 */
export async function getSurveiSummaryAction(): Promise<{
  success: boolean;
  data: SurveiSummaryData;
  error?: string;
}> {
  try {
    let rawList: HasilSurveiPelayanan[] = [];

    // Coba ambil dari tabel database Supabase jika tabel sudah dibuat
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('survei_pelayanan')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        rawList = data.map((row: any) => {
          const kalkulasi = hitungSyaratMutlak(row.nilai_ikm, row.nilai_ipak);
          return {
            id: row.id,
            periode_label: row.periode_label,
            tahun: row.tahun,
            semester: row.semester,
            nilai_ikm: Number(row.nilai_ikm),
            nilai_ikm_konversi:
              row.nilai_ikm_konversi ||
              konversiKeSkala100(Number(row.nilai_ikm)),
            mutu_ikm: row.mutu_ikm || getMutuIKM(Number(row.nilai_ikm)).label,
            nilai_ipak: Number(row.nilai_ipak),
            nilai_ipak_konversi:
              row.nilai_ipak_konversi ||
              konversiKeSkala100(Number(row.nilai_ipak)),
            mutu_ipak:
              row.mutu_ipak || getMutuIPAK(Number(row.nilai_ipak)).label,
            jumlah_responden: Number(row.jumlah_responden) || 0,
            status_wbk: kalkulasi.status_wbk,
            status_wbbm: kalkulasi.status_wbbm,
            unsur_ikm: Array.isArray(row.unsur_ikm) ? row.unsur_ikm : [],
            catatan: row.catatan || '',
            created_at: row.created_at
          };
        });
      }
    } catch {
      // Abaikan jika tabel supabase belum tersedia, fallback ke inMemorySurveiList
    }

    if (!rawList || rawList.length === 0) {
      rawList = inMemorySurveiList;
    }

    const summaryData = formatSurveiSummaryData(rawList);
    return { success: true, data: summaryData };
  } catch (err: any) {
    console.error('[SURVEI-ACTION] Error getSurveiSummaryAction:', err);
    return {
      success: true,
      data: formatSurveiSummaryData(DEFAULT_SURVEI_LIST),
      error: err?.message
    };
  }
}

/**
 * Server Action: Menyimpan atau memperbarui data survei semester
 */
export async function saveSurveiAction(
  input: Partial<HasilSurveiPelayanan>
): Promise<{
  success: boolean;
  data?: HasilSurveiPelayanan;
  error?: string;
}> {
  try {
    const id = input.id || `survei-sitaro-${Date.now()}`;
    const nilai_ikm = Number(input.nilai_ikm) || 3.8;
    const nilai_ipak = Number(input.nilai_ipak) || 3.9;
    const kalkulasi = hitungSyaratMutlak(nilai_ikm, nilai_ipak);

    const record: HasilSurveiPelayanan = {
      id,
      periode_label: input.periode_label || 'Semester Baru',
      tahun: input.tahun || new Date().getFullYear(),
      semester: input.semester || 1,
      nilai_ikm,
      nilai_ikm_konversi:
        input.nilai_ikm_konversi || konversiKeSkala100(nilai_ikm),
      mutu_ikm: getMutuIKM(nilai_ikm).label,
      nilai_ipak,
      nilai_ipak_konversi:
        input.nilai_ipak_konversi || konversiKeSkala100(nilai_ipak),
      mutu_ipak: getMutuIPAK(nilai_ipak).label,
      jumlah_responden: Number(input.jumlah_responden) || 100,
      status_wbk: kalkulasi.status_wbk,
      status_wbbm: kalkulasi.status_wbbm,
      unsur_ikm: Array.isArray(input.unsur_ikm) ? input.unsur_ikm : [],
      catatan: input.catatan || '',
      created_at: input.created_at || new Date().toISOString()
    };

    // Update fallback memory
    const existingIdx = inMemorySurveiList.findIndex((s) => s.id === id);
    if (existingIdx >= 0) {
      inMemorySurveiList[existingIdx] = record;
    } else {
      inMemorySurveiList.push(record);
    }

    // Cobakan upsert ke Supabase
    try {
      const supabase = await createClient();
      await supabase
        .from('survei_pelayanan')
        .upsert(record, { onConflict: 'id' });
    } catch {
      // Abaikan jika tabel belum ada
    }

    revalidatePath('/rebo/monitoring');
    return { success: true, data: record };
  } catch (err: any) {
    console.error('[SURVEI-ACTION] Error saveSurveiAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan data survei'
    };
  }
}
