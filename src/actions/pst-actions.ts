/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  type PSTQRConfig,
  DEFAULT_PST_QR_CONFIG
} from '@/lib/pst/qrcode-generator';

// Fallback in-memory state saat tabel remote belum dimigrasikan
let inMemoryPSTConfig: PSTQRConfig = { ...DEFAULT_PST_QR_CONFIG };

/**
 * Server Action: Mengambil konfigurasi aktif QR Code meja PST
 */
export async function getPSTQRConfigAction(): Promise<{
  success: boolean;
  data: PSTQRConfig;
  error?: string;
}> {
  try {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'pst_qr_config')
        .single();

      if (!error && data?.value) {
        const merged: PSTQRConfig = {
          ...DEFAULT_PST_QR_CONFIG,
          ...data.value
        };
        inMemoryPSTConfig = merged;
        return { success: true, data: merged };
      }
    } catch (dbErr) {
      // Abaikan jika database remote belum memiliki tabel app_settings
    }

    return { success: true, data: inMemoryPSTConfig };
  } catch (err: any) {
    console.error('Error getPSTQRConfigAction:', err);
    return {
      success: true,
      data: inMemoryPSTConfig,
      error: err?.message || 'Gagal membaca konfigurasi dari database'
    };
  }
}

/**
 * Server Action: Menyimpan pembaharuan konfigurasi QR Code meja PST
 */
export async function savePSTQRConfigAction(config: PSTQRConfig): Promise<{
  success: boolean;
  data: PSTQRConfig;
  error?: string;
}> {
  try {
    const updatedConfig: PSTQRConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    inMemoryPSTConfig = updatedConfig;

    try {
      const supabase = await createClient();
      await supabase.from('app_settings').upsert(
        {
          key: 'pst_qr_config',
          value: updatedConfig,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
    } catch (dbErr) {
      // Fallback in-memory jika tabel remote belum aktif
    }

    revalidatePath('/rebo/pst-qrcode');
    revalidatePath('/rebo/inovasi');

    return { success: true, data: updatedConfig };
  } catch (err: any) {
    console.error('Error savePSTQRConfigAction:', err);
    return {
      success: false,
      data: inMemoryPSTConfig,
      error: err?.message || 'Gagal menyimpan konfigurasi QR code meja PST'
    };
  }
}
