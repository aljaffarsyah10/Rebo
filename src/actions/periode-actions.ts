/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import type { PeriodeEvaluasi } from '@/types/rebo';

// ==============================================================================
// Schemas
// ==============================================================================

const CreatePeriodeSchema = z.object({
  tahun: z.coerce
    .number()
    .min(2020, 'Tahun evaluasi minimal 2020')
    .max(2050, 'Tahun evaluasi maksimal 2050'),
  nama_periode: z.string().min(5, 'Nama periode evaluasi minimal 5 karakter'),
  is_active: z.boolean().default(false),
  auto_seed_indicators: z.boolean().default(true)
});

const DuplicateStructureSchema = z.object({
  sourceId: z.string().min(1, 'ID periode sumber wajib dipilih'),
  targetTahun: z.coerce
    .number()
    .min(2020, 'Tahun tujuan minimal 2020')
    .max(2050, 'Tahun tujuan maksimal 2050'),
  targetNama: z.string().min(5, 'Nama periode baru minimal 5 karakter'),
  setAsActive: z.boolean().default(false)
});

export interface PeriodeWithStats extends PeriodeEvaluasi {
  totalPertanyaan: number;
  totalSelesai: number;
  totalReview: number;
  totalRevisi: number;
  totalBelumDiisi: number;
  persentaseSelesai: number;
}

function revalidatePeriodePaths() {
  revalidatePath('/rebo/admin/periode');
  revalidatePath('/rebo/overview');
  revalidatePath('/rebo/monitoring');
  revalidatePath('/rebo/kanban');
  revalidatePath('/rebo/formRB');
  revalidatePath('/rebo/arsip');
}

// ==============================================================================
// 1. GET PERIODE LIST DENGAN STATISTIK
// ==============================================================================

/**
 * Mengambil daftar seluruh periode evaluasi beserta ringkasan statistik LKE-nya.
 */
export async function getPeriodeList(): Promise<{
  success: boolean;
  data: PeriodeWithStats[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil daftar periode diurutkan dari tahun terbaru
    const { data: periodes, error: pError } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .order('tahun', { ascending: false });

    if (pError) {
      console.error(
        '[PERIODE-ACTIONS] Error fetching periodes:',
        pError.message
      );
      return { success: false, data: [], error: pError.message };
    }

    if (!periodes || periodes.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Ambil ringkasan indikator pertanyaan_periode untuk setiap periode
    const { data: ppRows, error: ppError } = await supabase
      .from('pertanyaan_periode')
      .select('id_periode, status_kelengkapan');

    if (ppError) {
      console.warn(
        '[PERIODE-ACTIONS] Error fetching pertanyaan_periode stats:',
        ppError.message
      );
    }

    const statsMap = new Map<
      string,
      {
        total: number;
        selesai: number;
        review: number;
        revisi: number;
        belum: number;
      }
    >();

    (ppRows || []).forEach((row) => {
      const pId = String(row.id_periode);
      if (!statsMap.has(pId)) {
        statsMap.set(pId, {
          total: 0,
          selesai: 0,
          review: 0,
          revisi: 0,
          belum: 0
        });
      }
      const s = statsMap.get(pId)!;
      s.total += 1;
      const status = Number(row.status_kelengkapan);
      if (status === 2) s.selesai += 1;
      else if (status === 1) s.review += 1;
      else if (status === 3) s.revisi += 1;
      else s.belum += 1;
    });

    const enriched: PeriodeWithStats[] = periodes.map((p) => {
      const stats = statsMap.get(String(p.id)) || {
        total: 0,
        selesai: 0,
        review: 0,
        revisi: 0,
        belum: 0
      };
      const persentase =
        stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

      return {
        ...p,
        totalPertanyaan: stats.total,
        totalSelesai: stats.selesai,
        totalReview: stats.review,
        totalRevisi: stats.revisi,
        totalBelumDiisi: stats.belum,
        persentaseSelesai: persentase
      };
    });

    return { success: true, data: enriched };
  } catch (err: any) {
    console.error('[PERIODE-ACTIONS] Exception in getPeriodeList:', err);
    return {
      success: false,
      data: [],
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 2. CREATE PERIODE
// ==============================================================================

/**
 * Menambahkan tahun periode evaluasi baru.
 */
export async function createPeriode(
  rawInput: z.infer<typeof CreatePeriodeSchema>
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menambah Periode Evaluasi.'
      };
    }

    const validated = CreatePeriodeSchema.parse(rawInput);
    const supabase = await createClient();

    // Periksa apakah tahun sudah terdaftar
    const { data: existing } = await supabase
      .from('periode_evaluasi')
      .select('id, tahun')
      .eq('tahun', validated.tahun)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Tahun evaluasi ${validated.tahun} sudah ada di database.`
      };
    }

    // Jika periode ini akan dijadikan aktif, nonaktifkan periode lain terlebih dahulu
    if (validated.is_active) {
      await supabase
        .from('periode_evaluasi')
        .update({ is_active: false })
        .neq('tahun', validated.tahun);
    }

    const newRecord = {
      tahun: validated.tahun,
      nama_periode: validated.nama_periode,
      is_active: validated.is_active,
      is_locked: false
    };

    const { data: createdPeriode, error: cErr } = await supabase
      .from('periode_evaluasi')
      .insert(newRecord)
      .select()
      .single();

    if (cErr) {
      console.error('[PERIODE-ACTIONS] Error creating periode:', cErr.message);
      return {
        success: false,
        error: `Gagal membuat periode: ${cErr.message}`
      };
    }

    // Auto-seed indikator dari master pertanyaan jika diminta
    let seededCount = 0;
    if (validated.auto_seed_indicators && createdPeriode?.id) {
      const { data: masterPertanyaan } = await supabase
        .from('pertanyaan')
        .select('id_pertanyaan');

      if (masterPertanyaan && masterPertanyaan.length > 0) {
        const rowsToInsert = masterPertanyaan.map((q) => ({
          id_periode: createdPeriode.id,
          id_pertanyaan: q.id_pertanyaan,
          status_kelengkapan: 0,
          nilai_mandiri: 0,
          nilai_verifikasi: 0
        }));

        const { error: seedErr } = await supabase
          .from('pertanyaan_periode')
          .insert(rowsToInsert);

        if (!seedErr) {
          seededCount = rowsToInsert.length;
        } else {
          console.warn(
            '[PERIODE-ACTIONS] Warning seeding pertanyaan_periode:',
            seedErr.message
          );
        }
      }
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_PERIODE',
        new_state: { ...createdPeriode, seededCount },
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[PERIODE-ACTIONS] Audit log warning:', e);
    }

    revalidatePeriodePaths();
    return { success: true, data: createdPeriode, seededCount };
  } catch (err: any) {
    console.error('[PERIODE-ACTIONS] Exception in createPeriode:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 3. SET ACTIVE PERIODE
// ==============================================================================

/**
 * Mengaktifkan periode tertentu sebagai Active Period global.
 */
export async function setActivePeriode(periodeId: string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengganti periode aktif.'
      };
    }

    const supabase = await createClient();

    // 1. Nonaktifkan semua periode
    await supabase
      .from('periode_evaluasi')
      .update({ is_active: false })
      .neq('id', 'placeholder');

    // 2. Aktifkan periode target
    const { data, error } = await supabase
      .from('periode_evaluasi')
      .update({ is_active: true })
      .eq('id', periodeId)
      .select()
      .single();

    if (error) {
      console.error(
        '[PERIODE-ACTIONS] Error setting active periode:',
        error.message
      );
      return {
        success: false,
        error: `Gagal mengaktifkan periode: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'SET_ACTIVE_PERIODE',
        new_state: { periodeId, tahun: data.tahun, nama: data.nama_periode },
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[PERIODE-ACTIONS] Audit log warning:', e);
    }

    revalidatePeriodePaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[PERIODE-ACTIONS] Exception in setActivePeriode:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 4. TOGGLE LOCK PERIODE (FREEZE / UNFREEZE)
// ==============================================================================

/**
 * Mengunci atau membuka kunci periode evaluasi (Read-Only Mode).
 */
export async function toggleLockPeriode(periodeId: string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengunci/membuka kunci periode.'
      };
    }

    const supabase = await createClient();

    // Dapatkan status saat ini
    const { data: current, error: getErr } = await supabase
      .from('periode_evaluasi')
      .select('id, tahun, nama_periode, is_locked')
      .eq('id', periodeId)
      .maybeSingle();

    if (getErr || !current) {
      return { success: false, error: 'Periode evaluasi tidak ditemukan.' };
    }

    const newLockState = !current.is_locked;

    const { data: updated, error } = await supabase
      .from('periode_evaluasi')
      .update({ is_locked: newLockState })
      .eq('id', periodeId)
      .select()
      .single();

    if (error) {
      console.error('[PERIODE-ACTIONS] Error toggling lock:', error.message);
      return {
        success: false,
        error: `Gagal memperbarui status kunci: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: newLockState ? 'LOCK_PERIODE' : 'UNLOCK_PERIODE',
        old_state: { is_locked: current.is_locked },
        new_state: { is_locked: newLockState, periodeId, tahun: current.tahun },
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[PERIODE-ACTIONS] Audit log warning:', e);
    }

    revalidatePeriodePaths();
    return {
      success: true,
      data: updated,
      message: newLockState
        ? `Periode ${current.tahun} berhasil dikunci (Read-Only). Pengisian bukti tidak dapat diubah.`
        : `Periode ${current.tahun} berhasil dibuka kembali untuk pengisian.`
    };
  } catch (err: any) {
    console.error('[PERIODE-ACTIONS] Exception in toggleLockPeriode:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 5. DUPLIKASI STRUKTUR INDIKATOR DARI TAHUN SEBELUMNYA (1-CLICK CLONE)
// ==============================================================================

/**
 * Fitur Unggulan (FR-02):
 * Menduplikasi seluruh struktur master indikator & instrumen LKE dari tahun sebelumnya
 * ke periode tahun evaluasi baru dalam 1 kali klik.
 * Seluruh status kelengkapan dan nilai otomatis di-reset ke 0 (Belum Diisi).
 */
export async function duplicatePeriodeStructure(
  rawInput: z.infer<typeof DuplicateStructureSchema>
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menduplikasi struktur periode.'
      };
    }

    const validated = DuplicateStructureSchema.parse(rawInput);
    const supabase = await createClient();

    // 1. Validasi periode sumber
    const { data: sourcePeriode, error: sErr } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .eq('id', validated.sourceId)
      .maybeSingle();

    if (sErr || !sourcePeriode) {
      return { success: false, error: 'Periode sumber tidak ditemukan.' };
    }

    // 2. Periksa apakah target tahun sudah terdaftar
    const { data: targetExist } = await supabase
      .from('periode_evaluasi')
      .select('id, tahun')
      .eq('tahun', validated.targetTahun)
      .maybeSingle();

    if (targetExist) {
      return {
        success: false,
        error: `Tahun evaluasi ${validated.targetTahun} sudah terdaftar. Gunakan tahun lain atau hapus periode lama.`
      };
    }

    // 3. Jika diset sebagai periode aktif, nonaktifkan periode lain
    if (validated.setAsActive) {
      await supabase
        .from('periode_evaluasi')
        .update({ is_active: false })
        .neq('id', 'temp-dummy');
    }

    // 4. Buat record periode evaluasi baru
    const newPeriodeRecord = {
      tahun: validated.targetTahun,
      nama_periode: validated.targetNama,
      is_active: validated.setAsActive,
      is_locked: false
    };

    const { data: newPeriode, error: createErr } = await supabase
      .from('periode_evaluasi')
      .insert(newPeriodeRecord)
      .select()
      .single();

    if (createErr || !newPeriode) {
      console.error(
        '[PERIODE-ACTIONS] Error creating new target periode:',
        createErr?.message
      );
      return {
        success: false,
        error: `Gagal membuat periode target: ${createErr?.message}`
      };
    }

    // 5. Ambil seluruh pertanyaan yang terdaftar di periode sumber
    // atau fallback ke seluruh master pertanyaan
    const { data: sourceQuestions, error: qErr } = await supabase
      .from('pertanyaan_periode')
      .select('id_pertanyaan')
      .eq('id_periode', validated.sourceId);

    let questionIds: string[] = [];
    if (!qErr && sourceQuestions && sourceQuestions.length > 0) {
      questionIds = sourceQuestions.map((q) => q.id_pertanyaan);
    } else {
      // Fallback: Ambil langsung dari tabel master pertanyaan
      const { data: masterQ } = await supabase
        .from('pertanyaan')
        .select('id_pertanyaan');
      questionIds = (masterQ || []).map((q) => q.id_pertanyaan);
    }

    if (questionIds.length === 0) {
      return {
        success: true,
        data: newPeriode,
        clonedCount: 0,
        message: `Periode ${newPeriode.tahun} berhasil dibuat, tetapi tidak ada master indikator yang ditemukan untuk diduplikasi.`
      };
    }

    // 6. Buat baris baru di pertanyaan_periode dengan status bersih (reset ke 0 / Belum Diisi)
    const clonedRows = questionIds.map((idPertanyaan) => ({
      id_periode: newPeriode.id,
      id_pertanyaan: idPertanyaan,
      status_kelengkapan: 0, // Reset: Belum Diisi
      nilai_mandiri: 0,
      nilai_verifikasi: 0,
      id_kategori: null,
      gdrive_folder_id: null,
      gdrive_folder_url: null,
      catatan_operator: null,
      catatan_koordinator: null,
      verified_by: null,
      verified_at: null
    }));

    // Insert dalam batches jika pertanyaan banyak
    const CHUNK_SIZE = 100;
    let insertedTotal = 0;

    for (let i = 0; i < clonedRows.length; i += CHUNK_SIZE) {
      const chunk = clonedRows.slice(i, i + CHUNK_SIZE);
      const { error: insertErr } = await supabase
        .from('pertanyaan_periode')
        .insert(chunk);

      if (insertErr) {
        console.error(
          '[PERIODE-ACTIONS] Batch insert error during clone:',
          insertErr.message
        );
      } else {
        insertedTotal += chunk.length;
      }
    }

    // 7. Catat audit log khusus DUPLICATE_PERIODE
    try {
      await supabase.from('audit_log').insert({
        action: 'DUPLICATE_PERIODE',
        old_state: {
          source_periode_id: sourcePeriode.id,
          source_tahun: sourcePeriode.tahun,
          source_nama: sourcePeriode.nama_periode
        },
        new_state: {
          new_periode_id: newPeriode.id,
          target_tahun: newPeriode.tahun,
          target_nama: newPeriode.nama_periode,
          total_cloned_indicators: insertedTotal
        },
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[PERIODE-ACTIONS] Audit log warning:', e);
    }

    revalidatePeriodePaths();
    return {
      success: true,
      data: newPeriode,
      clonedCount: insertedTotal,
      message: `Berhasil menduplikasi ${insertedTotal} indikator dari tahun ${sourcePeriode.tahun} ke periode ${newPeriode.tahun}. Status seluruh indikator direset ke 0 (Belum Diisi).`
    };
  } catch (err: any) {
    console.error(
      '[PERIODE-ACTIONS] Exception in duplicatePeriodeStructure:',
      err
    );
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 6. DELETE PERIODE
// ==============================================================================

/**
 * Menghapus tahun periode evaluasi.
 * Catatan: Tidak dapat menghapus periode yang saat ini berstatus Aktif.
 */
export async function deletePeriode(periodeId: string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menghapus Periode Evaluasi.'
      };
    }

    const supabase = await createClient();

    const { data: periodeData, error: getErr } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .eq('id', periodeId)
      .maybeSingle();

    if (getErr || !periodeData) {
      return { success: false, error: 'Periode evaluasi tidak ditemukan.' };
    }

    if (periodeData.is_active) {
      return {
        success: false,
        error: `Tidak dapat menghapus Periode ${periodeData.tahun} karena sedang aktif sebagai periode default. Silakan aktifkan periode lain terlebih dahulu.`
      };
    }

    // Hapus dokumen bukti & relasi pertanyaan_periode
    const { data: ppList } = await supabase
      .from('pertanyaan_periode')
      .select('id')
      .eq('id_periode', periodeId);

    if (ppList && ppList.length > 0) {
      const ppIds = ppList.map((p) => p.id);
      await supabase
        .from('dokumen_bukti')
        .delete()
        .in('id_pertanyaan_periode', ppIds);
      await supabase
        .from('pertanyaan_periode')
        .delete()
        .eq('id_periode', periodeId);
    }

    const { error: delErr } = await supabase
      .from('periode_evaluasi')
      .delete()
      .eq('id', periodeId);

    if (delErr) {
      console.error(
        '[PERIODE-ACTIONS] Error deleting periode:',
        delErr.message
      );
      return {
        success: false,
        error: `Gagal menghapus periode: ${delErr.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_PERIODE',
        old_state: periodeData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[PERIODE-ACTIONS] Audit log warning:', e);
    }

    revalidatePeriodePaths();
    return {
      success: true,
      message: `Periode evaluasi ${periodeData.tahun} (${periodeData.nama_periode}) berhasil dihapus.`
    };
  } catch (err: any) {
    console.error('[PERIODE-ACTIONS] Exception in deletePeriode:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}
