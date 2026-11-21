/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import {
  generateIndicatorPath,
  generateFolderUrl,
  createReboFoldersScript,
  extractGoogleDriveFolderId,
  type GasScriptItem
} from '@/lib/gdrive/generator';
import type { PeriodeEvaluasi } from '@/types/rebo';

// ==============================================================================
// Helper & Security Assertions
// ==============================================================================

/**
 * Memastikan bahwa pemanggil aksi terautentikasi dan memiliki hak Super Admin.
 */
async function assertAdminSession() {
  const session = await getCurrentUserSession();
  if (!session.userId) {
    throw new Error('Not Authenticated: Silakan masuk terlebih dahulu.');
  }
  if (!isAdmin(session.role)) {
    throw new Error(
      'Not Authorized: Hanya Super Admin yang berwenang mengelola Google Drive generator.'
    );
  }
  return session;
}

// ==============================================================================
// 1. Fetch Mapping & Status Indikator
// ==============================================================================

export interface IndicatorMappingItem {
  id_pertanyaan: string;
  id_pertanyaan_periode?: string;
  kode_indikator: string;
  nama_indikator: string;
  area: string;
  pilar: string;
  pilar_id: string;
  subpilar: string;
  subpilar_id: string;
  path: string;
  target_folder_name: string;
  gdrive_folder_url?: string | null;
  gdrive_folder_id?: string | null;
  status_kelengkapan: number;
  is_mapped: boolean;
}

/**
 * Mengambil daftar seluruh indikator beserta status tautan Google Drive untuk periode tertentu.
 */
export async function getIndicatorGdriveMapping(
  periodeId: string,
  pilarId?: string
): Promise<{
  success: boolean;
  periode?: PeriodeEvaluasi | null;
  items: IndicatorMappingItem[];
  totalCount: number;
  mappedCount: number;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil info periode evaluasi
    const { data: periodeData } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .eq('id', periodeId)
      .maybeSingle();

    const tahun = periodeData?.tahun || 2026;

    // 2. Ambil seluruh pertanyaan terstruktur via subpilar & pilar
    let subpilarQuery = supabase.from('subpilar').select(`
        id_subpilar,
        nama_subpilar,
        id_pilar,
        pilar (id_pilar, nama_pilar, id_area, area (id_area, nama_area)),
        pertanyaan (id_pertanyaan, deskripsi_pertanyaan, uraian_pertanyaan, uraian_singkat, pertanyaan)
      `);

    if (pilarId && pilarId !== 'ALL') {
      subpilarQuery = subpilarQuery.eq('id_pilar', pilarId);
    }

    const { data: subpilarData, error: subError } = await subpilarQuery.order(
      'id_subpilar',
      { ascending: true }
    );

    if (subError) {
      throw new Error(`Gagal mengambil data subpilar: ${subError.message}`);
    }

    // 3. Ambil data pertanyaan_periode yang sudah tersimpan untuk periode ini
    const { data: ppData, error: ppError } = await supabase
      .from('pertanyaan_periode')
      .select('*')
      .eq('id_periode', periodeId);

    if (ppError) {
      console.warn(
        '[GDRIVE-ACTIONS] Gagal mengambil pertanyaan_periode:',
        ppError.message
      );
    }

    const ppMap = new Map<string, any>();
    (ppData || []).forEach((row) => {
      ppMap.set(row.id_pertanyaan, row);
    });

    // 4. Susun daftar mapping indikator
    const items: IndicatorMappingItem[] = [];
    let mappedCount = 0;

    (subpilarData || []).forEach((subpilar: any) => {
      const pilarObj = subpilar.pilar || {};
      const areaObj = pilarObj.area || {};
      const areaName =
        areaObj.nama_area ||
        (pilarObj.id_area === 2 ? '02_AREA_REFORM' : '01_AREA_PEMENUHAN');
      const pilarIdStr = String(pilarObj.id_pilar || subpilar.id_pilar || '1');
      const subpilarName =
        subpilar.nama_subpilar || `Subpilar ${subpilar.id_subpilar}`;

      const questions = subpilar.pertanyaan || [];
      questions.forEach((q: any, qIndex: number) => {
        const idPertanyaan = String(q.id_pertanyaan);
        const pp = ppMap.get(idPertanyaan);

        const rawNama =
          q.uraian_singkat ||
          q.deskripsi_pertanyaan ||
          q.uraian_pertanyaan ||
          q.pertanyaan ||
          `Indikator ${idPertanyaan}`;

        const kodeIndikator = String(qIndex + 1);

        const pathInfo = generateIndicatorPath({
          tahun,
          area: areaName,
          pilar: pilarIdStr,
          subpilar: subpilarName,
          kodeIndikator,
          namaIndikator: rawNama
        });

        const gdriveUrl = pp?.gdrive_folder_url || null;
        const isMapped = !!gdriveUrl && gdriveUrl.trim().length > 0;
        if (isMapped) mappedCount++;

        items.push({
          id_pertanyaan: idPertanyaan,
          id_pertanyaan_periode: pp?.id,
          kode_indikator:
            pathInfo.indicatorFolder.split(' - ')[0] || kodeIndikator,
          nama_indikator: rawNama,
          area: pathInfo.areaFolder,
          pilar: pathInfo.pilarFolder,
          pilar_id: pilarIdStr,
          subpilar: pathInfo.subpilarFolder,
          subpilar_id: String(subpilar.id_subpilar),
          path: pathInfo.fullPath,
          target_folder_name: pathInfo.indicatorFolder,
          gdrive_folder_url: gdriveUrl,
          gdrive_folder_id: pp?.gdrive_folder_id || null,
          status_kelengkapan: pp?.status_kelengkapan ?? 0,
          is_mapped: isMapped
        });
      });
    });

    return {
      success: true,
      periode: periodeData as PeriodeEvaluasi,
      items,
      totalCount: items.length,
      mappedCount
    };
  } catch (error: any) {
    console.error('[GDRIVE-ACTIONS] getIndicatorGdriveMapping error:', error);
    return {
      success: false,
      items: [],
      totalCount: 0,
      mappedCount: 0,
      message:
        error?.message || 'Terjadi kesalahan saat mengambil mapping indikator.'
    };
  }
}

// ==============================================================================
// 2. Generate & Save Indicator Links
// ==============================================================================

export interface GenerateLinksOptions {
  pilarId?: string;
  overrideExisting?: boolean;
}

/**
 * Server action utama:
 * Memetakan tautan Google Drive secara massal ke seluruh pertanyaan aktif pada periode bersangkutan.
 */
export async function generateAndSaveIndicatorLinks(
  periodeId: string,
  rootFolderUrl: string,
  options?: GenerateLinksOptions
): Promise<{
  success: boolean;
  updatedCount: number;
  totalProcessed: number;
  message: string;
}> {
  // 1. Verifikasi hak Super Admin
  const session = await assertAdminSession();

  if (!periodeId) {
    throw new Error('Periode Evaluasi wajib dipilih.');
  }

  const cleanUrl = (rootFolderUrl || '').trim();
  if (!cleanUrl) {
    throw new Error('URL Root Folder Google Drive wajib diisi.');
  }

  // Ekstrak root ID atau validasi URL
  const rootId = extractGoogleDriveFolderId(cleanUrl);
  if (!rootId && !cleanUrl.startsWith('http')) {
    throw new Error(
      'Format URL Google Drive tidak valid. Masukkan URL folder (misal: https://drive.google.com/drive/folders/1a2b3c...)'
    );
  }

  const supabase = await createClient();

  // 2. Ambil informasi periode
  const { data: periodeData, error: periodeErr } = await supabase
    .from('periode_evaluasi')
    .select('*')
    .eq('id', periodeId)
    .single();

  if (periodeErr || !periodeData) {
    throw new Error('Periode evaluasi tidak ditemukan.');
  }

  const tahun = periodeData.tahun;
  const overrideExisting = options?.overrideExisting ?? false;
  const pilarIdFilter =
    options?.pilarId && options.pilarId !== 'ALL' ? options.pilarId : undefined;

  // 3. Ambil seluruh pertanyaan dari database
  let subpilarQuery = supabase.from('subpilar').select(`
      id_subpilar,
      nama_subpilar,
      id_pilar,
      pilar (id_pilar, nama_pilar, id_area, area (id_area, nama_area)),
      pertanyaan (id_pertanyaan, deskripsi_pertanyaan, uraian_pertanyaan, uraian_singkat, pertanyaan)
    `);

  if (pilarIdFilter) {
    subpilarQuery = subpilarQuery.eq('id_pilar', pilarIdFilter);
  }

  const { data: subpilarData, error: subError } = await subpilarQuery;
  if (subError) {
    throw new Error(`Gagal memuat master indikator: ${subError.message}`);
  }

  // 4. Ambil pertanyaan_periode yang sudah ada
  const { data: existingRows } = await supabase
    .from('pertanyaan_periode')
    .select('id, id_pertanyaan, gdrive_folder_url, gdrive_folder_id')
    .eq('id_periode', periodeId);

  const existingMap = new Map<string, any>();
  (existingRows || []).forEach((row) => {
    existingMap.set(row.id_pertanyaan, row);
  });

  let updatedCount = 0;
  let totalProcessed = 0;
  const upsertPayload: any[] = [];
  const legacyBuktiUpdates: { id_pertanyaan: string; link_bukti: string }[] =
    [];

  // 5. Susun tautan untuk setiap indikator
  (subpilarData || []).forEach((subpilar: any) => {
    const pilarObj = subpilar.pilar || {};
    const areaObj = pilarObj.area || {};
    const areaName =
      areaObj.nama_area ||
      (pilarObj.id_area === 2 ? '02_AREA_REFORM' : '01_AREA_PEMENUHAN');
    const pilarIdStr = String(pilarObj.id_pilar || subpilar.id_pilar || '1');
    const subpilarName =
      subpilar.nama_subpilar || `Subpilar ${subpilar.id_subpilar}`;

    const questions = subpilar.pertanyaan || [];
    questions.forEach((q: any, qIndex: number) => {
      totalProcessed++;
      const idPertanyaan = String(q.id_pertanyaan);
      const existing = existingMap.get(idPertanyaan);

      // Jika sudah memiliki link dan opsi override tidak aktif, pertahankan yang lama
      if (
        !overrideExisting &&
        existing?.gdrive_folder_url &&
        existing.gdrive_folder_url.trim().length > 0
      ) {
        return;
      }

      const rawNama =
        q.uraian_singkat ||
        q.deskripsi_pertanyaan ||
        q.uraian_pertanyaan ||
        q.pertanyaan ||
        `Indikator ${idPertanyaan}`;

      const kodeIndikator = String(qIndex + 1);

      const pathInfo = generateIndicatorPath({
        tahun,
        area: areaName,
        pilar: pilarIdStr,
        subpilar: subpilarName,
        kodeIndikator,
        namaIndikator: rawNama
      });

      // Buat tautan terarah ke Google Drive
      const generatedUrl = generateFolderUrl(cleanUrl, {
        targetFolderName: pathInfo.indicatorFolder
      });

      upsertPayload.push({
        id: existing?.id, // jika ada, update baris ini
        id_periode: periodeId,
        id_pertanyaan: idPertanyaan,
        gdrive_folder_url: generatedUrl,
        gdrive_folder_id: rootId || null,
        status_kelengkapan: existing?.status_kelengkapan ?? 0,
        nilai_mandiri: existing?.nilai_mandiri ?? 0,
        nilai_verifikasi: existing?.nilai_verifikasi ?? 0,
        updated_at: new Date().toISOString()
      });

      legacyBuktiUpdates.push({
        id_pertanyaan: idPertanyaan,
        link_bukti: generatedUrl
      });

      updatedCount++;
    });
  });

  // 6. Jalankan Upsert batch ke pertanyaan_periode
  if (upsertPayload.length > 0) {
    const { error: upsertErr } = await supabase
      .from('pertanyaan_periode')
      .upsert(upsertPayload, {
        onConflict: 'id_periode,id_pertanyaan'
      });

    if (upsertErr) {
      console.error(
        '[GDRIVE-ACTIONS] Upsert pertanyaan_periode failed:',
        upsertErr
      );
      throw new Error(`Gagal menyimpan link folder: ${upsertErr.message}`);
    }

    // 7. Update fallback kompatibilitas ke buktiDukung (opsional, non-blocking)
    try {
      for (const leg of legacyBuktiUpdates) {
        await supabase
          .from('buktiDukung')
          .update({ link_bukti: leg.link_bukti })
          .eq('id_pertanyaan', leg.id_pertanyaan);
      }
    } catch (legErr) {
      console.warn(
        '[GDRIVE-ACTIONS] Notice updating legacy buktiDukung:',
        legErr
      );
    }

    // 8. Catat jejak audit (audit_log)
    try {
      await supabase.from('audit_log').insert({
        action: 'GENERATE_GDRIVE_LINKS',
        user_id: session.userId,
        user_name: session.fullName,
        role: session.role,
        old_state: {
          previousCount:
            existingRows?.filter((r) => !!r.gdrive_folder_url).length || 0
        },
        new_state: {
          periodeId,
          tahun,
          rootFolderUrl: cleanUrl,
          pilarFilter: pilarIdFilter || 'ALL',
          overrideExisting,
          updatedCount,
          totalProcessed,
          timestamp: new Date().toISOString()
        }
      });
    } catch (auditErr) {
      console.warn('[GDRIVE-ACTIONS] Notice recording audit log:', auditErr);
    }
  }

  // 9. Revalidasi halaman admin & form RB
  revalidatePath('/rebo/admin/gdrive-generator');
  revalidatePath('/rebo/formRB');

  return {
    success: true,
    updatedCount,
    totalProcessed,
    message: `Berhasil memetakan tautan Google Drive untuk ${updatedCount} dari ${totalProcessed} indikator evaluasi ${tahun}.`
  };
}

// ==============================================================================
// 3. Simpan / Perbarui Link Folder Individual
// ==============================================================================

/**
 * Menyimpan tautan Google Drive kustom untuk satu indikator secara manual.
 */
export async function saveSingleIndicatorFolderUrl(
  idPertanyaanPeriode: string,
  folderUrl: string
): Promise<{ success: boolean; message: string }> {
  const session = await assertAdminSession();

  const cleanUrl = (folderUrl || '').trim();
  if (!cleanUrl) {
    throw new Error('URL folder Google Drive tidak boleh kosong.');
  }

  const supabase = await createClient();

  const folderId = extractGoogleDriveFolderId(cleanUrl);

  const { error } = await supabase
    .from('pertanyaan_periode')
    .update({
      gdrive_folder_url: cleanUrl,
      gdrive_folder_id: folderId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', idPertanyaanPeriode);

  if (error) {
    throw new Error(`Gagal memperbarui tautan: ${error.message}`);
  }

  // Catat audit log
  try {
    await supabase.from('audit_log').insert({
      id_pertanyaan_periode: idPertanyaanPeriode,
      action: 'UPDATE_SINGLE_GDRIVE_LINK',
      user_id: session.userId,
      user_name: session.fullName,
      role: session.role,
      new_state: {
        folderUrl: cleanUrl,
        folderId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.warn('[GDRIVE-ACTIONS] Audit log notice:', err);
  }

  revalidatePath('/rebo/admin/gdrive-generator');
  return {
    success: true,
    message: 'Tautan Google Drive indikator berhasil disimpan.'
  };
}

// ==============================================================================
// 4. Generate Google Apps Script (GAS) Code
// ==============================================================================

/**
 * Menghasilkan skrip Google Apps Script siap salin berdasarkan data indikator aktif.
 */
export async function getGasScriptForPeriode(
  periodeId: string,
  rootFolderUrl?: string,
  pilarId?: string
): Promise<{
  success: boolean;
  script: string;
  totalIndicators: number;
  message?: string;
}> {
  try {
    const mappingResult = await getIndicatorGdriveMapping(periodeId, pilarId);
    if (!mappingResult.success) {
      throw new Error(
        mappingResult.message || 'Gagal memuat mapping indikator.'
      );
    }

    const items: GasScriptItem[] = mappingResult.items.map((item) => ({
      id_pertanyaan: item.id_pertanyaan,
      kode_indikator: item.kode_indikator,
      nama_indikator: item.nama_indikator,
      area: item.area,
      pilar: item.pilar,
      subpilar: item.subpilar,
      target_folder_name: item.target_folder_name,
      path: item.path
    }));

    const tahun = mappingResult.periode?.tahun || 2026;
    const namaPeriode = mappingResult.periode?.nama_periode || `PMPRB ${tahun}`;

    const script = createReboFoldersScript({
      tahun,
      namaPeriode,
      rootFolderUrl: rootFolderUrl || '',
      items
    });

    return {
      success: true,
      script,
      totalIndicators: items.length
    };
  } catch (error: any) {
    return {
      success: false,
      script: '',
      totalIndicators: 0,
      message: error?.message || 'Gagal menyusun skrip Google Apps Script.'
    };
  }
}
