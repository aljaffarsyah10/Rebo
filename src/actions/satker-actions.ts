/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import {
  SatkerConfig,
  SatkerConfigBundle,
  DEFAULT_SATKER_CONFIG,
  PRESET_SATKER_LIST
} from '@/lib/satker/satker-types';

/**
 * In-memory state untuk fallback instan jika koneksi Supabase belum terkonfigurasi / offline
 */
let inMemoryActiveSatker: SatkerConfig = { ...DEFAULT_SATKER_CONFIG };

/**
 * Helper Supabase client mandiri
 */
function getIndependentSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Zod Schema untuk validasi konfigurasi satker
 */
const SatkerConfigSchema = z.object({
  kode_satker: z
    .string()
    .trim()
    .min(3, 'Kode satker minimal 3 karakter')
    .max(10, 'Kode satker maksimal 10 karakter'),
  nama_satker: z.string().trim().min(5, 'Nama satker minimal 5 karakter'),
  singkatan_satker: z
    .string()
    .trim()
    .min(3, 'Singkatan satker minimal 3 karakter'),
  provinsi: z.string().trim().min(2, 'Nama provinsi minimal 2 karakter'),
  kode_provinsi: z.string().trim().min(2, 'Kode provinsi minimal 2 digit'),
  alamat_kantor: z.string().trim().min(5, 'Alamat kantor wajib diisi'),
  email_resmi: z
    .string()
    .trim()
    .email('Format email resmi instansi tidak valid'),
  no_telepon: z.string().trim().min(5, 'Nomor telepon kantor wajib diisi'),
  no_wa_helpdesk: z.string().trim().min(8, 'Nomor WA helpdesk minimal 8 digit'),
  portal_pst_url: z
    .string()
    .trim()
    .url('Format URL portal PST tidak valid (gunakan http:// atau https://)'),
  target_predikat: z.enum(['WBK', 'WBBM']),
  nama_kepala: z.string().trim().min(3, 'Nama Kepala Satker wajib diisi'),
  nip_kepala: z.string().trim().min(9, 'NIP Kepala Satker minimal 9 digit'),
  nama_ketua_zi: z
    .string()
    .trim()
    .min(3, 'Nama Ketua Tim Pembangunan ZI wajib diisi'),
  nip_ketua_zi: z.string().trim().min(9, 'NIP Ketua Tim ZI minimal 9 digit'),
  logo_url: z.string().trim().default('/logo-bps.png'),
  is_active: z.boolean().default(true)
});

/**
 * 1. Mengambil profil satker aktif dengan fallback in-memory yang aman
 */
export async function getActiveSatkerConfigAction(): Promise<{
  success: boolean;
  data: SatkerConfig;
  source: 'database' | 'memory' | 'preset';
  error?: string;
}> {
  try {
    const supabase = getIndependentSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('satker_config')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const satkerData: SatkerConfig = {
          kode_satker: data.kode_satker,
          nama_satker: data.nama_satker,
          singkatan_satker: data.singkatan_satker,
          provinsi: data.provinsi,
          kode_provinsi: data.kode_provinsi,
          alamat_kantor: data.alamat_kantor,
          email_resmi: data.email_resmi,
          no_telepon: data.no_telepon,
          no_wa_helpdesk: data.no_wa_helpdesk,
          portal_pst_url: data.portal_pst_url,
          target_predikat: data.target_predikat as 'WBK' | 'WBBM',
          nama_kepala: data.nama_kepala,
          nip_kepala: data.nip_kepala,
          nama_ketua_zi: data.nama_ketua_zi,
          nip_ketua_zi: data.nip_ketua_zi,
          logo_url: data.logo_url || '/logo-bps.png',
          is_active: Boolean(data.is_active),
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        inMemoryActiveSatker = { ...satkerData };
        return {
          success: true,
          data: satkerData,
          source: 'database'
        };
      }
    }
  } catch (err) {
    console.warn('[SatkerActions] Database read fallback to in-memory:', err);
  }

  return {
    success: true,
    data: inMemoryActiveSatker,
    source: 'memory'
  };
}

/**
 * 2. Menyimpan & memperbarui profil instansi aktif
 */
export async function updateSatkerConfigAction(
  data: Partial<SatkerConfig>
): Promise<{
  success: boolean;
  data?: SatkerConfig;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (session && !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak. Hanya Administrator yang dapat mengubah profil instansi.'
      };
    }

    const merged = {
      ...inMemoryActiveSatker,
      ...data,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const parsed = SatkerConfigSchema.safeParse(merged);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || 'Validasi form gagal.';
      return {
        success: false,
        error: firstError
      };
    }

    const validatedConfig: SatkerConfig = {
      ...parsed.data,
      updated_at: new Date().toISOString()
    };

    // Update in-memory state
    inMemoryActiveSatker = validatedConfig;

    // Persist to Supabase if available
    const supabase = getIndependentSupabaseClient();
    if (supabase) {
      try {
        // Set all other satker is_active = false
        await supabase
          .from('satker_config')
          .update({ is_active: false })
          .neq('kode_satker', validatedConfig.kode_satker);

        // Upsert active satker
        const { error: upsertErr } = await supabase
          .from('satker_config')
          .upsert({
            kode_satker: validatedConfig.kode_satker,
            nama_satker: validatedConfig.nama_satker,
            singkatan_satker: validatedConfig.singkatan_satker,
            provinsi: validatedConfig.provinsi,
            kode_provinsi: validatedConfig.kode_provinsi,
            alamat_kantor: validatedConfig.alamat_kantor,
            email_resmi: validatedConfig.email_resmi,
            no_telepon: validatedConfig.no_telepon,
            no_wa_helpdesk: validatedConfig.no_wa_helpdesk,
            portal_pst_url: validatedConfig.portal_pst_url,
            target_predikat: validatedConfig.target_predikat,
            nama_kepala: validatedConfig.nama_kepala,
            nip_kepala: validatedConfig.nip_kepala,
            nama_ketua_zi: validatedConfig.nama_ketua_zi,
            nip_ketua_zi: validatedConfig.nip_ketua_zi,
            logo_url: validatedConfig.logo_url,
            is_active: true,
            updated_at: validatedConfig.updated_at
          });

        if (upsertErr) {
          console.warn('[SatkerActions] DB upsert warning:', upsertErr.message);
        }
      } catch (dbErr) {
        console.warn('[SatkerActions] Error during DB persistence:', dbErr);
      }
    }

    revalidatePath('/rebo/admin/satker');
    revalidatePath('/rebo/admin');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      data: validatedConfig,
      message: `Profil instansi ${validatedConfig.nama_satker} (${validatedConfig.kode_satker}) berhasil disimpan!`
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return {
      success: false,
      error: msg
    };
  }
}

/**
 * 3. 1-Klik beralih profil atau mereplikasi ke satker lain
 */
export async function switchOrReplicateSatkerAction(
  kodeSatker: string
): Promise<{
  success: boolean;
  data?: SatkerConfig;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (session && !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak. Hanya Administrator yang dapat mereplikasi satker.'
      };
    }

    const preset = PRESET_SATKER_LIST.find((s) => s.kode_satker === kodeSatker);
    if (!preset) {
      return {
        success: false,
        error: `Preset Satker dengan kode ${kodeSatker} tidak ditemukan dalam pustaka REBO.`
      };
    }

    const switchedConfig: SatkerConfig = {
      ...preset,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    inMemoryActiveSatker = switchedConfig;

    const supabase = getIndependentSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('satker_config')
          .update({ is_active: false })
          .neq('kode_satker', switchedConfig.kode_satker);

        await supabase.from('satker_config').upsert({
          kode_satker: switchedConfig.kode_satker,
          nama_satker: switchedConfig.nama_satker,
          singkatan_satker: switchedConfig.singkatan_satker,
          provinsi: switchedConfig.provinsi,
          kode_provinsi: switchedConfig.kode_provinsi,
          alamat_kantor: switchedConfig.alamat_kantor,
          email_resmi: switchedConfig.email_resmi,
          no_telepon: switchedConfig.no_telepon,
          no_wa_helpdesk: switchedConfig.no_wa_helpdesk,
          portal_pst_url: switchedConfig.portal_pst_url,
          target_predikat: switchedConfig.target_predikat,
          nama_kepala: switchedConfig.nama_kepala,
          nip_kepala: switchedConfig.nip_kepala,
          nama_ketua_zi: switchedConfig.nama_ketua_zi,
          nip_ketua_zi: switchedConfig.nip_ketua_zi,
          logo_url: switchedConfig.logo_url,
          is_active: true,
          updated_at: switchedConfig.updated_at
        });
      } catch (err) {
        console.warn('[SatkerActions] DB update during switch warning:', err);
      }
    }

    revalidatePath('/rebo/admin/satker');
    revalidatePath('/rebo/admin');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      data: switchedConfig,
      message: `Berhasil beralih profil satker ke ${switchedConfig.nama_satker} (${switchedConfig.kode_satker})!`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal beralih satker.';
    return {
      success: false,
      error: msg
    };
  }
}

/**
 * 4. Menghasilkan JSON bundle konfigurasi satker untuk migrasi instance
 */
export async function exportSatkerConfigBundleAction(): Promise<{
  success: boolean;
  bundle: SatkerConfigBundle;
  jsonString: string;
  filename: string;
  message: string;
}> {
  const activeRes = await getActiveSatkerConfigAction();
  const activeConfig = activeRes.data;

  const bundle: SatkerConfigBundle = {
    system: 'REBO V2',
    schema_version: '2.0',
    exported_at: new Date().toISOString(),
    exported_by: 'Super Admin REBO',
    active_satker: activeConfig,
    available_presets: PRESET_SATKER_LIST
  };

  const jsonString = JSON.stringify(bundle, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `rebo-satker-config-${activeConfig.kode_satker}-${dateStr}.json`;

  return {
    success: true,
    bundle,
    jsonString,
    filename,
    message: `Bundle konfigurasi ${activeConfig.nama_satker} siap diunduh.`
  };
}

/**
 * 5. Mengimpor konfigurasi satker dari JSON Bundle
 */
export async function importSatkerConfigBundleAction(
  bundleJson: string
): Promise<{
  success: boolean;
  data?: SatkerConfig;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (session && !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak. Hanya Administrator yang dapat mengimpor konfigurasi.'
      };
    }

    let parsedBundle: unknown;
    try {
      parsedBundle = JSON.parse(bundleJson);
    } catch {
      return {
        success: false,
        error:
          'Format file JSON tidak valid. Pastikan file JSON yang diunggah berformat benar.'
      };
    }

    if (!parsedBundle || typeof parsedBundle !== 'object') {
      return {
        success: false,
        error: 'Struktur file JSON tidak sesuai dengan bundle REBO V2.'
      };
    }

    const bundleObj = parsedBundle as Record<string, unknown>;
    const targetSatker =
      (bundleObj.active_satker as Partial<SatkerConfig>) ||
      (bundleObj as Partial<SatkerConfig>);

    if (
      !targetSatker ||
      !targetSatker.kode_satker ||
      !targetSatker.nama_satker
    ) {
      return {
        success: false,
        error:
          'File bundle tidak memuat data profil satker yang valid (kode_satker & nama_satker wajib ada).'
      };
    }

    return await updateSatkerConfigAction(targetSatker);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengimpor bundle.';
    return {
      success: false,
      error: msg
    };
  }
}

/**
 * 6. Mengambil seluruh daftar preset Satker BPS se-Sulut dan Nasional
 */
export async function getAllSatkerPresetsAction(): Promise<{
  success: boolean;
  presets: SatkerConfig[];
}> {
  return {
    success: true,
    presets: PRESET_SATKER_LIST
  };
}
