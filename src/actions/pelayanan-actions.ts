/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  StandarPelayananItem,
  MaklumatPelayananData,
  DEFAULT_MAKLUMAT_PELAYANAN,
  DEFAULT_STANDAR_PELAYANAN_LIST
} from '@/lib/pelayanan/standar-pelayanan-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Menjaga data standar pelayanan & maklumat digital tetap sinkron selama runtime
// ==============================================================================
let globalStandarPelayananList: StandarPelayananItem[] = [
  ...DEFAULT_STANDAR_PELAYANAN_LIST
];

let globalMaklumatPelayanan: MaklumatPelayananData = {
  ...DEFAULT_MAKLUMAT_PELAYANAN
};

/**
 * 1. Mengambil Daftar Standar Pelayanan dan Maklumat Pelayanan Resmi
 */
export async function getStandarPelayananListAction(): Promise<{
  success: boolean;
  data: StandarPelayananItem[];
  maklumat: MaklumatPelayananData;
  error?: string;
}> {
  try {
    try {
      const supabase = await createClient();
      const { data: dbMaklumat, error: errMaklumat } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maklumat_pelayanan')
        .single();

      if (!errMaklumat && dbMaklumat?.value) {
        globalMaklumatPelayanan = {
          ...DEFAULT_MAKLUMAT_PELAYANAN,
          ...dbMaklumat.value
        };
      }

      const { data: dbSP, error: errSP } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'standar_pelayanan_list')
        .single();

      if (!errSP && Array.isArray(dbSP?.value) && dbSP.value.length > 0) {
        globalStandarPelayananList = dbSP.value;
      }
    } catch (dbErr) {
      // Supabase app_settings table optional, fallback to in-memory store
    }

    return {
      success: true,
      data: [...globalStandarPelayananList],
      maklumat: { ...globalMaklumatPelayanan }
    };
  } catch (err: any) {
    console.error('Error getStandarPelayananListAction:', err);
    return {
      success: true,
      data: [...globalStandarPelayananList],
      maklumat: { ...globalMaklumatPelayanan },
      error: err?.message || 'Gagal memuat standar pelayanan dari database'
    };
  }
}

/**
 * 2. Menyimpan / Memperbarui Rincian Standar Pelayanan
 */
export async function saveStandarPelayananAction(
  item: StandarPelayananItem
): Promise<{
  success: boolean;
  data?: StandarPelayananItem;
  error?: string;
}> {
  try {
    const index = globalStandarPelayananList.findIndex((i) => i.id === item.id);

    if (index >= 0) {
      globalStandarPelayananList[index] = { ...item };
    } else {
      globalStandarPelayananList.push({
        ...item,
        id: item.id || `sp-${Date.now()}`
      });
    }

    try {
      const supabase = await createClient();
      await supabase.from('app_settings').upsert(
        {
          key: 'standar_pelayanan_list',
          value: globalStandarPelayananList,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
    } catch (dbErr) {
      // In-memory store successfully updated
    }

    revalidatePath('/rebo/standar-pelayanan');

    return {
      success: true,
      data: item
    };
  } catch (err: any) {
    console.error('Error saveStandarPelayananAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan pembaruan standar pelayanan'
    };
  }
}

/**
 * 3. Memperbarui Data Maklumat Pelayanan Resmi
 */
export async function updateMaklumatPelayananAction(
  data: Partial<MaklumatPelayananData>
): Promise<{
  success: boolean;
  maklumat?: MaklumatPelayananData;
  error?: string;
}> {
  try {
    globalMaklumatPelayanan = {
      ...globalMaklumatPelayanan,
      ...data
    };

    try {
      const supabase = await createClient();
      await supabase.from('app_settings').upsert(
        {
          key: 'maklumat_pelayanan',
          value: globalMaklumatPelayanan,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
    } catch (dbErr) {
      // In-memory store updated
    }

    revalidatePath('/rebo/standar-pelayanan');

    return {
      success: true,
      maklumat: { ...globalMaklumatPelayanan }
    };
  } catch (err: any) {
    console.error('Error updateMaklumatPelayananAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memperbarui data maklumat pelayanan'
    };
  }
}

/**
 * 4. Reset Standar Pelayanan ke Default PermenPAN-RB No. 15/2014
 */
export async function resetStandarPelayananToDefaultAction(): Promise<{
  success: boolean;
  data: StandarPelayananItem[];
  maklumat: MaklumatPelayananData;
  error?: string;
}> {
  try {
    globalStandarPelayananList = [...DEFAULT_STANDAR_PELAYANAN_LIST];
    globalMaklumatPelayanan = { ...DEFAULT_MAKLUMAT_PELAYANAN };

    try {
      const supabase = await createClient();
      await supabase.from('app_settings').upsert(
        {
          key: 'standar_pelayanan_list',
          value: globalStandarPelayananList,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
      await supabase.from('app_settings').upsert(
        {
          key: 'maklumat_pelayanan',
          value: globalMaklumatPelayanan,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
    } catch (dbErr) {
      // fallback in-memory
    }

    revalidatePath('/rebo/standar-pelayanan');

    return {
      success: true,
      data: [...globalStandarPelayananList],
      maklumat: { ...globalMaklumatPelayanan }
    };
  } catch (err: any) {
    console.error('Error resetStandarPelayananToDefaultAction:', err);
    return {
      success: false,
      data: [...globalStandarPelayananList],
      maklumat: { ...globalMaklumatPelayanan },
      error: err?.message || 'Gagal mereset data standar pelayanan'
    };
  }
}
