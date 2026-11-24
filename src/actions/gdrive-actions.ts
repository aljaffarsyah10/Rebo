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
import {
  checkGDrivePermission,
  checkBatchGDrivePermission,
  parseGDriveUrl,
  type GDriveHealthCheckResult,
  type GDriveHealthStatus
} from '@/lib/gdrive/health-checker';
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
        pertanyaan (id_pertanyaan, deskripsi_pertanyaan, uraian_buktidukung)
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
      pertanyaan (id_pertanyaan, deskripsi_pertanyaan, uraian_buktidukung)
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

// ==============================================================================
// 5. Google Drive Link & Permission Health Checker
// ==============================================================================

/**
 * Server action untuk memeriksa izin akses sebuah tautan Google Drive / Docs secara aman.
 */
export async function checkGDriveHealthAction(url: string): Promise<{
  success: boolean;
  result: GDriveHealthCheckResult;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      throw new Error('Sesi masuk kedaluwarsa. Silakan masuk kembali.');
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return {
        success: false,
        result: {
          status: 'INVALID',
          message: 'URL Google Drive tidak boleh kosong.',
          statusCode: 400,
          url: '',
          checkedAt: new Date().toISOString()
        },
        error: 'URL Google Drive tidak boleh kosong.'
      };
    }

    const result = await checkGDrivePermission(url.trim());
    return {
      success: true,
      result
    };
  } catch (error: any) {
    return {
      success: false,
      result: {
        status: 'ERROR',
        message:
          error?.message || 'Terjadi kesalahan saat memeriksa izin akses.',
        url,
        checkedAt: new Date().toISOString()
      },
      error: error?.message || 'Gagal menjalankan pemeriksaan Google Drive.'
    };
  }
}

/**
 * Server action untuk memeriksa izin akses beberapa tautan Google Drive sekaligus secara paralel.
 */
export async function checkBatchGDriveHealthAction(urls: string[]): Promise<{
  success: boolean;
  results: Record<string, GDriveHealthCheckResult>;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      throw new Error('Sesi masuk kedaluwarsa. Silakan masuk kembali.');
    }

    if (!Array.isArray(urls) || urls.length === 0) {
      return {
        success: true,
        results: {}
      };
    }

    const results = await checkBatchGDrivePermission(urls);
    return {
      success: true,
      results
    };
  } catch (error: any) {
    return {
      success: false,
      results: {},
      error:
        error?.message || 'Gagal menjalankan batch pemeriksaan Google Drive.'
    };
  }
}

// ==============================================================================
// 6. Batch Link Audit & Broken Link Detector
// ==============================================================================

export interface AuditedLinkItem {
  id: string; // id dokumen_bukti or id pertanyaan_periode
  pertanyaanId: string;
  kodeIndikator: string;
  namaIndikator: string;
  pilar: string;
  pilarId: string;
  itemType: 'folder' | 'document';
  title: string;
  url: string;
  status: GDriveHealthStatus;
  message: string;
  statusCode?: number;
  checkedAt: string;
}

export interface GDriveAuditSummary {
  success: boolean;
  message?: string;
  periodeId: string;
  totalChecked: number;
  publicCount: number;
  restrictedCount: number;
  brokenCount: number;
  errorCount: number;
  healthScore: number;
  items: AuditedLinkItem[];
  restrictedItems: AuditedLinkItem[];
  brokenItems: AuditedLinkItem[];
  scannedAt: string;
}

/**
 * Server action: auditAllGdriveLinksAction
 * Memindai seluruh tautan direktori folder indikator dan berkas dokumen bukti
 * pada periode evaluasi tertentu secara paralel.
 */
export async function auditAllGdriveLinksAction(
  periodeId: string
): Promise<GDriveAuditSummary> {
  const session = await assertAdminSession();

  if (!periodeId) {
    throw new Error('Periode Evaluasi wajib ditentukan.');
  }

  const supabase = await createClient();

  // 1. Ambil data master pertanyaan untuk metadata kode, nama, & pilar
  const { data: subpilarData, error: subError } = await supabase.from(
    'subpilar'
  ).select(`
      id_subpilar,
      nama_subpilar,
      id_pilar,
      pilar (id_pilar, nama_pilar),
      pertanyaan (id_pertanyaan, deskripsi_pertanyaan, uraian_buktidukung)
    `);

  if (subError) {
    throw new Error(`Gagal memuat master indikator: ${subError.message}`);
  }

  const questionMetaMap = new Map<
    string,
    {
      kodeIndikator: string;
      namaIndikator: string;
      pilar: string;
      pilarId: string;
      subpilar: string;
    }
  >();

  (subpilarData || []).forEach((sub: any) => {
    const pilarObj = sub.pilar || {};
    const pilarIdStr = String(pilarObj.id_pilar || sub.id_pilar || '1');
    const pilarName = pilarObj.nama_pilar || `Pilar ${pilarIdStr}`;
    const subpilarName = sub.nama_subpilar || `Subpilar ${sub.id_subpilar}`;

    const questions = sub.pertanyaan || [];
    questions.forEach((q: any, idx: number) => {
      const qId = String(q.id_pertanyaan);
      questionMetaMap.set(qId, {
        kodeIndikator: String(idx + 1),
        namaIndikator:
          q.uraian_singkat ||
          q.deskripsi_pertanyaan ||
          q.uraian_pertanyaan ||
          `Indikator ${qId}`,
        pilar: pilarName,
        pilarId: pilarIdStr,
        subpilar: subpilarName
      });
    });
  });

  // 2. Ambil seluruh pertanyaan_periode dan dokumen_bukti pada periode ini
  const { data: ppData, error: ppError } = await supabase
    .from('pertanyaan_periode')
    .select(
      `
      id,
      id_periode,
      id_pertanyaan,
      gdrive_folder_url,
      gdrive_folder_id,
      dokumen_bukti (
        id,
        id_pertanyaan_periode,
        nama_dokumen,
        file_url,
        tipe_dokumen
      )
    `
    )
    .eq('id_periode', periodeId);

  if (ppError) {
    throw new Error(`Gagal memuat data periode evaluasi: ${ppError.message}`);
  }

  // 3. Susun daftar tautan yang akan diuji
  const itemsToAudit: AuditedLinkItem[] = [];
  const urlsToCheckSet = new Set<string>();

  (ppData || []).forEach((row: any) => {
    const qMeta = questionMetaMap.get(String(row.id_pertanyaan));
    const kodeIndikator = qMeta?.kodeIndikator || 'IND';
    const namaIndikator =
      qMeta?.namaIndikator || `Indikator ${row.id_pertanyaan}`;
    const pilar = qMeta?.pilar || 'Pilar';
    const pilarId = qMeta?.pilarId || '1';

    // A. Folder Indikator
    const folderUrl = (row.gdrive_folder_url || '').trim();
    if (folderUrl) {
      urlsToCheckSet.add(folderUrl);
      itemsToAudit.push({
        id: row.id,
        pertanyaanId: String(row.id_pertanyaan),
        kodeIndikator,
        namaIndikator,
        pilar,
        pilarId,
        itemType: 'folder',
        title: `Direktori Folder Indikator ${kodeIndikator}`,
        url: folderUrl,
        status: 'PUBLIC',
        message: 'Menunggu hasil audit...',
        checkedAt: new Date().toISOString()
      });
    }

    // B. Dokumen Bukti
    const docs = row.dokumen_bukti || [];
    docs.forEach((doc: any) => {
      const docUrl = (doc.file_url || '').trim();
      if (docUrl) {
        urlsToCheckSet.add(docUrl);
        itemsToAudit.push({
          id: doc.id,
          pertanyaanId: String(row.id_pertanyaan),
          kodeIndikator,
          namaIndikator,
          pilar,
          pilarId,
          itemType: 'document',
          title: doc.nama_dokumen || 'Berkas Dokumen Bukti',
          url: docUrl,
          status: 'PUBLIC',
          message: 'Menunggu hasil audit...',
          checkedAt: new Date().toISOString()
        });
      }
    });
  });

  // Jika tidak ada link sama sekali
  if (itemsToAudit.length === 0) {
    return {
      success: true,
      message:
        'Belum ada tautan folder atau berkas bukti yang didaftarkan pada periode ini.',
      periodeId,
      totalChecked: 0,
      publicCount: 0,
      restrictedCount: 0,
      brokenCount: 0,
      errorCount: 0,
      healthScore: 100,
      items: [],
      restrictedItems: [],
      brokenItems: [],
      scannedAt: new Date().toISOString()
    };
  }

  // 4. Jalankan Batch Scan secara paralel menggunakan checkBatchGDrivePermission
  const uniqueUrls = Array.from(urlsToCheckSet);
  const batchResults = await checkBatchGDrivePermission(uniqueUrls);

  // 5. Evaluasi dan kelompokkan hasil audit
  let publicCount = 0;
  let restrictedCount = 0;
  let brokenCount = 0;
  let errorCount = 0;

  const restrictedItems: AuditedLinkItem[] = [];
  const brokenItems: AuditedLinkItem[] = [];

  const finalItems: AuditedLinkItem[] = itemsToAudit.map((item) => {
    const res = batchResults[item.url] || {
      status: 'ERROR' as GDriveHealthStatus,
      message: 'Gagal memperoleh respons dari server Google Drive.',
      url: item.url,
      checkedAt: new Date().toISOString()
    };

    const status = res.status;
    const message = res.message;
    const statusCode = res.statusCode;
    const checkedAt = res.checkedAt || new Date().toISOString();

    const audited: AuditedLinkItem = {
      ...item,
      status,
      message,
      statusCode,
      checkedAt
    };

    if (status === 'PUBLIC') {
      publicCount++;
    } else if (status === 'RESTRICTED') {
      restrictedCount++;
      restrictedItems.push(audited);
    } else if (status === 'INVALID') {
      brokenCount++;
      brokenItems.push(audited);
    } else {
      errorCount++;
    }

    return audited;
  });

  const totalChecked = finalItems.length;
  const healthScore =
    totalChecked > 0 ? Math.round((publicCount / totalChecked) * 100) : 100;

  // 6. Catat audit log
  try {
    await supabase.from('audit_log').insert({
      action: 'BATCH_AUDIT_GDRIVE_LINKS',
      user_id: session.userId,
      user_name: session.fullName,
      role: session.role,
      new_state: {
        periodeId,
        totalChecked,
        publicCount,
        restrictedCount,
        brokenCount,
        errorCount,
        healthScore,
        timestamp: new Date().toISOString()
      }
    });
  } catch (auditErr) {
    console.warn('[GDRIVE-ACTIONS] Notice recording audit log:', auditErr);
  }

  return {
    success: true,
    message: `Audit tautan Google Drive selesai. ${publicCount} dari ${totalChecked} tautan berstatus publik (${healthScore}% Sehat).`,
    periodeId,
    totalChecked,
    publicCount,
    restrictedCount,
    brokenCount,
    errorCount,
    healthScore,
    items: finalItems,
    restrictedItems,
    brokenItems,
    scannedAt: new Date().toISOString()
  };
}

// ==============================================================================
// 7. Cloud Storage Statistics & Quota Action
// ==============================================================================

export interface DriveStorageStats {
  success: boolean;
  totalFiles: number;
  totalFolders: number;
  totalItems: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  quotaLimitBytes: number;
  formattedQuotaLimit: string;
  usedPercentage: number;
  storageHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  statusMessage: string;
  instansi: string;
  typeBreakdown: {
    type: string;
    count: number;
    estimatedSize: string;
  }[];
  pilarBreakdown: {
    pilarId: string;
    pilarName: string;
    fileCount: number;
    folderCount: number;
    estimatedSize: string;
  }[];
  lastCalculatedAt: string;
}

/**
 * Format bytes ke ukuran yang mudah dibaca (KB, MB, GB, TB)
 */
function formatStorageBytes(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Server action: getDriveStorageStatsAction
 * Menghitung kuota, estimasi pemakaian penyimpanan cloud bukti dukung ZI,
 * serta status kapasitas instansi BPS Sitaro.
 */
export async function getDriveStorageStatsAction(
  periodeId?: string
): Promise<DriveStorageStats> {
  const supabase = await createClient();

  // 1. Query seluruh folder pada pertanyaan_periode
  let ppQuery = supabase
    .from('pertanyaan_periode')
    .select('id, id_pertanyaan, id_periode, gdrive_folder_url');

  if (periodeId && periodeId !== 'ALL') {
    ppQuery = ppQuery.eq('id_periode', periodeId);
  }

  const { data: ppData } = await ppQuery;
  const mappedFolders = (ppData || []).filter((p) =>
    Boolean(p.gdrive_folder_url?.trim())
  );
  const totalFolders = mappedFolders.length;

  // 2. Query seluruh berkas dokumen_bukti
  const ppIds = (ppData || []).map((p) => p.id);
  let docsQuery = supabase
    .from('dokumen_bukti')
    .select('id, id_pertanyaan_periode, nama_dokumen, file_url, tipe_dokumen');

  if (ppIds.length > 0) {
    docsQuery = docsQuery.in('id_pertanyaan_periode', ppIds);
  }

  const { data: docsData } = await docsQuery;
  const totalFiles = (docsData || []).length;

  // 3. Ambil pilar info untuk breakdown
  const { data: pilarMaster } = await supabase
    .from('pilar')
    .select('id_pilar, nama_pilar')
    .order('id_pilar', { ascending: true });

  const { data: subpilarMaster } = await supabase
    .from('subpilar')
    .select('id_subpilar, id_pilar, pertanyaan (id_pertanyaan)');

  const qToPilarMap = new Map<string, string>();
  (subpilarMaster || []).forEach((sub: any) => {
    const pilarIdStr = String(sub.id_pilar || '1');
    (sub.pertanyaan || []).forEach((q: any) => {
      qToPilarMap.set(String(q.id_pertanyaan), pilarIdStr);
    });
  });

  const ppToPilarMap = new Map<string, string>();
  (ppData || []).forEach((row: any) => {
    const pilarId = qToPilarMap.get(String(row.id_pertanyaan)) || '1';
    ppToPilarMap.set(String(row.id), pilarId);
  });

  // 4. Hitung estimasi pemakaian berdasarkan jenis berkas
  // Estimasi rata-rata ukuran per jenis dokumen:
  // PDF: 3.5 MB, Word (docx): 1.5 MB, Excel (xlsx): 2.0 MB, Slides (pptx): 4.5 MB, Gambar (jpg/png): 3.0 MB, Lainnya: 2.0 MB
  const SIZE_ESTIMATES: Record<string, number> = {
    pdf: 3.5 * 1024 * 1024,
    doc: 1.5 * 1024 * 1024,
    docx: 1.5 * 1024 * 1024,
    xls: 2.0 * 1024 * 1024,
    xlsx: 2.0 * 1024 * 1024,
    ppt: 4.5 * 1024 * 1024,
    pptx: 4.5 * 1024 * 1024,
    image: 3.0 * 1024 * 1024,
    folder_meta: 50 * 1024,
    other: 2.0 * 1024 * 1024
  };

  const typeCounts: Record<string, number> = {
    'Dokumen PDF (.pdf)': 0,
    'Naskah Word (.doc, .docx)': 0,
    'Spreadsheet Excel (.xls, .xlsx)': 0,
    'Paparan & Presentasi (.ppt, .pptx)': 0,
    'Foto & Dokumentasi (.jpg, .png)': 0,
    'Tautan Berkas Lainnya': 0
  };

  let totalSizeBytes = totalFolders * SIZE_ESTIMATES.folder_meta;

  const pilarFileCounts: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0
  };
  const pilarFolderCounts: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0
  };

  mappedFolders.forEach((f) => {
    const pId = qToPilarMap.get(String(f.id_pertanyaan)) || '1';
    if (pilarFolderCounts[pId] !== undefined) {
      pilarFolderCounts[pId]++;
    }
  });

  (docsData || []).forEach((doc: any) => {
    const fileName = (doc.nama_dokumen || '').toLowerCase();
    const docType = (doc.tipe_dokumen || '').toLowerCase();
    const fileUrl = (doc.file_url || '').toLowerCase();

    let bytes = SIZE_ESTIMATES.other;

    if (
      fileName.endsWith('.pdf') ||
      docType.includes('pdf') ||
      fileUrl.includes('.pdf')
    ) {
      typeCounts['Dokumen PDF (.pdf)']++;
      bytes = SIZE_ESTIMATES.pdf;
    } else if (
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc') ||
      docType.includes('word') ||
      fileUrl.includes('document/d/')
    ) {
      typeCounts['Naskah Word (.doc, .docx)']++;
      bytes = SIZE_ESTIMATES.docx;
    } else if (
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      docType.includes('excel') ||
      fileName.endsWith('.csv') ||
      fileUrl.includes('spreadsheets/d/')
    ) {
      typeCounts['Spreadsheet Excel (.xls, .xlsx)']++;
      bytes = SIZE_ESTIMATES.xlsx;
    } else if (
      fileName.endsWith('.pptx') ||
      fileName.endsWith('.ppt') ||
      docType.includes('powerpoint') ||
      fileUrl.includes('presentation/d/')
    ) {
      typeCounts['Paparan & Presentasi (.ppt, .pptx)']++;
      bytes = SIZE_ESTIMATES.pptx;
    } else if (
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      docType.includes('image')
    ) {
      typeCounts['Foto & Dokumentasi (.jpg, .png)']++;
      bytes = SIZE_ESTIMATES.image;
    } else {
      typeCounts['Tautan Berkas Lainnya']++;
    }

    totalSizeBytes += bytes;

    const pilarId = ppToPilarMap.get(String(doc.id_pertanyaan_periode)) || '1';
    if (pilarFileCounts[pilarId] !== undefined) {
      pilarFileCounts[pilarId]++;
    }
  });

  const typeBreakdown = Object.entries(typeCounts).map(([type, count]) => {
    let est = 0;
    if (type.includes('PDF')) est = count * SIZE_ESTIMATES.pdf;
    else if (type.includes('Word')) est = count * SIZE_ESTIMATES.docx;
    else if (type.includes('Excel')) est = count * SIZE_ESTIMATES.xlsx;
    else if (type.includes('Paparan')) est = count * SIZE_ESTIMATES.pptx;
    else if (type.includes('Foto')) est = count * SIZE_ESTIMATES.image;
    else est = count * SIZE_ESTIMATES.other;

    return {
      type,
      count,
      estimatedSize: formatStorageBytes(est)
    };
  });

  const pilarNames: Record<string, string> = {
    '1': 'Manajemen Perubahan',
    '2': 'Penataan Tatalaksana',
    '3': 'Penataan Sistem Manajemen SDM',
    '4': 'Penguatan Akuntabilitas',
    '5': 'Penguatan Pengawasan',
    '6': 'Peningkatan Kualitas Pelayanan Publik'
  };

  (pilarMaster || []).forEach((p: any) => {
    const id = String(p.id_pilar);
    if (p.nama_pilar) {
      pilarNames[id] = p.nama_pilar;
    }
  });

  const pilarBreakdown = ['1', '2', '3', '4', '5', '6'].map((pId) => {
    const fCount = pilarFileCounts[pId] || 0;
    const foldCount = pilarFolderCounts[pId] || 0;
    const estPilarBytes =
      fCount * SIZE_ESTIMATES.pdf + foldCount * SIZE_ESTIMATES.folder_meta;

    return {
      pilarId: pId,
      pilarName: pilarNames[pId] || `Pilar ${pId}`,
      fileCount: fCount,
      folderCount: foldCount,
      estimatedSize: formatStorageBytes(estPilarBytes)
    };
  });

  // Kuota Alokasi BPS Sitaro Google Workspace: 2 Terabytes (2 TB)
  const quotaLimitBytes = 2 * 1024 * 1024 * 1024 * 1024;
  const usedPercentage = Number(
    ((totalSizeBytes / quotaLimitBytes) * 100).toFixed(3)
  );

  let storageHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
  let statusMessage =
    'Kapasitas penyimpanan Google Drive instansi BPS Kabupaten Kepulauan Sitaro dalam kondisi SANGAT AMAN / SEHAT.';

  if (usedPercentage > 90) {
    storageHealthStatus = 'CRITICAL';
    statusMessage =
      'Peringatan: Pemakaian penyimpanan Google Drive mendekati batas kuota (di atas 90%).';
  } else if (usedPercentage > 75) {
    storageHealthStatus = 'WARNING';
    statusMessage =
      'Perhatian: Pemakaian penyimpanan Google Drive di atas 75%.';
  }

  return {
    success: true,
    totalFiles,
    totalFolders,
    totalItems: totalFiles + totalFolders,
    totalSizeBytes,
    formattedTotalSize: formatStorageBytes(totalSizeBytes),
    quotaLimitBytes,
    formattedQuotaLimit: '2.0 TB (Google Workspace Enterprise)',
    usedPercentage,
    storageHealthStatus,
    statusMessage,
    instansi: 'BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
    typeBreakdown,
    pilarBreakdown,
    lastCalculatedAt: new Date().toISOString()
  };
}

// ==============================================================================
// 8. Update Audited Link URL Action
// ==============================================================================

/**
 * Server action: updateAuditedLinkUrlAction
 * Memperbarui URL Google Drive baik pada folder indikator maupun dokumen bukti,
 * dan langsung menguji ulang status izin kesehatannya.
 */
export async function updateAuditedLinkUrlAction(
  id: string,
  itemType: 'folder' | 'document',
  newUrl: string
): Promise<{
  success: boolean;
  message: string;
  updatedResult?: GDriveHealthCheckResult;
}> {
  const session = await assertAdminSession();

  const cleanUrl = (newUrl || '').trim();
  if (!cleanUrl) {
    throw new Error('URL Google Drive tidak boleh kosong.');
  }

  const supabase = await createClient();

  if (itemType === 'folder') {
    const folderId = extractGoogleDriveFolderId(cleanUrl);
    const { error } = await supabase
      .from('pertanyaan_periode')
      .update({
        gdrive_folder_url: cleanUrl,
        gdrive_folder_id: folderId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal memperbarui tautan folder: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from('dokumen_bukti')
      .update({
        file_url: cleanUrl,
        submitted_by_user_id: session.userId,
        submitted_by_name: session.fullName
      })
      .eq('id', id);

    if (error) {
      throw new Error(
        `Gagal memperbarui tautan dokumen bukti: ${error.message}`
      );
    }
  }

  // Uji kesehatan URL baru secara instan
  const updatedResult = await checkGDrivePermission(cleanUrl);

  revalidatePath('/rebo/admin/gdrive-generator');
  revalidatePath('/rebo/formRB');

  return {
    success: true,
    message: 'Tautan Google Drive berhasil diperbarui dan diverifikasi ulang.',
    updatedResult
  };
}
