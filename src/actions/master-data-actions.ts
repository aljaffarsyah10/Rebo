/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';

// ==============================================================================
// Schemas Validasi Master Data
// ==============================================================================

const PilarSchema = z.object({
  id_pilar: z.union([z.number(), z.string()]).optional(),
  nama_pilar: z.string().min(3, 'Nama pilar minimal 3 karakter'),
  kode_pilar: z.string().optional().nullable(),
  deskripsi_pilar: z.string().optional().nullable(),
  id_area: z.coerce
    .number()
    .min(1, 'Area harus dipilih (1: Pemenuhan, 2: Reform)')
});

const SubpilarSchema = z.object({
  id_subpilar: z.union([z.number(), z.string()]).optional(),
  nama_subpilar: z.string().min(3, 'Nama subpilar minimal 3 karakter'),
  deskripsi_subpilar: z.string().optional().nullable(),
  id_pilar: z.coerce.number().min(1, 'Pilar induk harus dipilih')
});

const PertanyaanSchema = z.object({
  id_pertanyaan: z
    .string()
    .min(2, 'Kode/ID pertanyaan minimal 2 karakter')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'ID pertanyaan hanya boleh huruf, angka, titik, strip atau underscore'
    ),
  uraian_pertanyaan: z.string().min(5, 'Uraian pertanyaan minimal 5 karakter'),
  uraian_singkat: z.string().optional().nullable(),
  deskripsi_pertanyaan: z.string().optional().nullable(),
  id_subpilar: z.coerce.number().min(1, 'Subpilar harus dipilih')
});

const KategoriPenilaianSchema = z.object({
  id_kategori: z.string().optional(),
  id_pertanyaan: z.string().min(1, 'ID pertanyaan wajib diisi'),
  uraian_kategori: z
    .string()
    .min(2, 'Uraian pilihan jawaban minimal 2 karakter'),
  nilai: z.coerce
    .number()
    .min(0, 'Nilai bobot minimal 0')
    .max(10, 'Nilai bobot maksimal 10')
});

export type PilarInput = z.infer<typeof PilarSchema>;
export type SubpilarInput = z.infer<typeof SubpilarSchema>;
export type PertanyaanInput = z.infer<typeof PertanyaanSchema>;
export type KategoriPenilaianInput = z.infer<typeof KategoriPenilaianSchema>;

// Helper fungsi revalidasi rute
function revalidateMasterPaths() {
  revalidatePath('/rebo/dataRB/pilar');
  revalidatePath('/rebo/dataRB/pilar/subpilar');
  revalidatePath('/rebo/dataRB/pilar/pertanyaan');
  revalidatePath('/rebo/formRB');
  revalidatePath('/rebo/formRB/area');
  revalidatePath('/rebo/monitoring');
  revalidatePath('/rebo/kanban');
}

// ==============================================================================
// 1. CRUD PILAR
// ==============================================================================

/**
 * Membuat data Pilar baru.
 * Hanya dapat dijalankan oleh Super Admin.
 */
export async function createPilar(rawInput: PilarInput) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error: 'Akses ditolak: Hanya Super Admin yang berwenang menambah Pilar.'
      };
    }

    const validated = PilarSchema.parse(rawInput);
    const supabase = await createClient();

    // Tentukan id_pilar jika tidak diberikan
    let assignedId = validated.id_pilar
      ? Number(validated.id_pilar)
      : undefined;
    if (!assignedId) {
      const { data: maxRow } = await supabase
        .from('pilar')
        .select('id_pilar')
        .order('id_pilar', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId = (maxRow?.id_pilar ? Number(maxRow.id_pilar) : 0) + 1;
    }

    const newRecord = {
      id_pilar: assignedId,
      nama_pilar: validated.nama_pilar,
      kode_pilar: validated.kode_pilar || `Pilar ${assignedId}`,
      deskripsi_pilar: validated.deskripsi_pilar || '',
      id_area: validated.id_area
    };

    const { data, error } = await supabase
      .from('pilar')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating pilar:', error.message);
      return { success: false, error: `Gagal membuat pilar: ${error.message}` };
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_PILAR',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createPilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Mengubah data Pilar yang sudah ada.
 */
export async function updatePilar(
  idPilar: number | string,
  rawInput: PilarInput
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error: 'Akses ditolak: Hanya Super Admin yang berwenang mengubah Pilar.'
      };
    }

    const validated = PilarSchema.parse(rawInput);
    const supabase = await createClient();

    const targetId = Number(idPilar);

    // Ambil state lama untuk audit log
    const { data: oldData } = await supabase
      .from('pilar')
      .select('*')
      .eq('id_pilar', targetId)
      .maybeSingle();

    const updatePayload = {
      nama_pilar: validated.nama_pilar,
      kode_pilar: validated.kode_pilar || `Pilar ${targetId}`,
      deskripsi_pilar: validated.deskripsi_pilar || '',
      id_area: validated.id_area
    };

    const { data, error } = await supabase
      .from('pilar')
      .update(updatePayload)
      .eq('id_pilar', targetId)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error updating pilar:', error.message);
      return {
        success: false,
        error: `Gagal memperbarui pilar: ${error.message}`
      };
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'UPDATE_PILAR',
        old_state: oldData,
        new_state: data,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updatePilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Menghapus data Pilar.
 */
export async function deletePilar(idPilar: number | string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menghapus Pilar.'
      };
    }

    const targetId = Number(idPilar);
    const supabase = await createClient();

    // Cek apakah ada subpilar turunan
    const { count, error: countErr } = await supabase
      .from('subpilar')
      .select('id_subpilar', { count: 'exact', head: true })
      .eq('id_pilar', targetId);

    if (countErr) {
      console.warn(
        '[MASTER-DATA] Error checking subpilar count:',
        countErr.message
      );
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus Pilar ini karena masih memiliki ${count} Subpilar terkait. Silakan hapus atau pindahkan subpilar terlebih dahulu.`
      };
    }

    // Ambil data lama untuk audit
    const { data: oldData } = await supabase
      .from('pilar')
      .select('*')
      .eq('id_pilar', targetId)
      .maybeSingle();

    const { error } = await supabase
      .from('pilar')
      .delete()
      .eq('id_pilar', targetId);

    if (error) {
      console.error('[MASTER-DATA] Error deleting pilar:', error.message);
      return {
        success: false,
        error: `Gagal menghapus pilar: ${error.message}`
      };
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_PILAR',
        old_state: oldData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deletePilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 2. CRUD SUBPILAR
// ==============================================================================

/**
 * Membuat data Subpilar baru.
 */
export async function createSubpilar(rawInput: SubpilarInput) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menambah Subpilar.'
      };
    }

    const validated = SubpilarSchema.parse(rawInput);
    const supabase = await createClient();

    let assignedId = validated.id_subpilar
      ? Number(validated.id_subpilar)
      : undefined;
    if (!assignedId) {
      const { data: maxRow } = await supabase
        .from('subpilar')
        .select('id_subpilar')
        .order('id_subpilar', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId = (maxRow?.id_subpilar ? Number(maxRow.id_subpilar) : 0) + 1;
    }

    const newRecord = {
      id_subpilar: assignedId,
      nama_subpilar: validated.nama_subpilar,
      deskripsi_subpilar: validated.deskripsi_subpilar || '',
      id_pilar: Number(validated.id_pilar)
    };

    const { data, error } = await supabase
      .from('subpilar')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating subpilar:', error.message);
      return {
        success: false,
        error: `Gagal membuat subpilar: ${error.message}`
      };
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_SUBPILAR',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createSubpilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Mengubah data Subpilar.
 */
export async function updateSubpilar(
  idSubpilar: number | string,
  rawInput: SubpilarInput
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengubah Subpilar.'
      };
    }

    const validated = SubpilarSchema.parse(rawInput);
    const supabase = await createClient();
    const targetId = Number(idSubpilar);

    const { data: oldData } = await supabase
      .from('subpilar')
      .select('*')
      .eq('id_subpilar', targetId)
      .maybeSingle();

    const updatePayload = {
      nama_subpilar: validated.nama_subpilar,
      deskripsi_subpilar: validated.deskripsi_subpilar || '',
      id_pilar: Number(validated.id_pilar)
    };

    const { data, error } = await supabase
      .from('subpilar')
      .update(updatePayload)
      .eq('id_subpilar', targetId)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error updating subpilar:', error.message);
      return {
        success: false,
        error: `Gagal memperbarui subpilar: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'UPDATE_SUBPILAR',
        old_state: oldData,
        new_state: data,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updateSubpilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Menghapus data Subpilar.
 */
export async function deleteSubpilar(idSubpilar: number | string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menghapus Subpilar.'
      };
    }

    const targetId = Number(idSubpilar);
    const supabase = await createClient();

    // Cek pertanyaan turunan
    const { count, error: countErr } = await supabase
      .from('pertanyaan')
      .select('id_pertanyaan', { count: 'exact', head: true })
      .eq('id_subpilar', targetId);

    if (countErr) {
      console.warn(
        '[MASTER-DATA] Error checking pertanyaan count:',
        countErr.message
      );
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus Subpilar ini karena masih memiliki ${count} Pertanyaan/Indikator terkait. Hapus pertanyaan di dalamnya terlebih dahulu.`
      };
    }

    const { data: oldData } = await supabase
      .from('subpilar')
      .select('*')
      .eq('id_subpilar', targetId)
      .maybeSingle();

    const { error } = await supabase
      .from('subpilar')
      .delete()
      .eq('id_subpilar', targetId);

    if (error) {
      console.error('[MASTER-DATA] Error deleting subpilar:', error.message);
      return {
        success: false,
        error: `Gagal menghapus subpilar: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_SUBPILAR',
        old_state: oldData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deleteSubpilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 3. CRUD PERTANYAAN (INDIKATOR LKE)
// ==============================================================================

/**
 * Membuat Pertanyaan / Indikator LKE baru.
 * Otomatis dihubungkan ke periode aktif saat ini jika ada.
 */
export async function createPertanyaan(rawInput: PertanyaanInput) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menambah Pertanyaan.'
      };
    }

    const validated = PertanyaanSchema.parse(rawInput);
    const supabase = await createClient();

    // Cek apakah ID pertanyaan sudah terpakai
    const { data: existing } = await supabase
      .from('pertanyaan')
      .select('id_pertanyaan')
      .eq('id_pertanyaan', validated.id_pertanyaan)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Kode/ID Pertanyaan "${validated.id_pertanyaan}" sudah digunakan. Gunakan ID unik lainnya.`
      };
    }

    const newRecord = {
      id_pertanyaan: validated.id_pertanyaan,
      uraian_pertanyaan: validated.uraian_pertanyaan,
      uraian_singkat:
        validated.uraian_singkat ||
        validated.uraian_pertanyaan.substring(0, 100),
      deskripsi_pertanyaan:
        validated.deskripsi_pertanyaan || validated.uraian_pertanyaan,
      id_subpilar: Number(validated.id_subpilar)
    };

    const { data, error } = await supabase
      .from('pertanyaan')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating pertanyaan:', error.message);
      return {
        success: false,
        error: `Gagal membuat pertanyaan: ${error.message}`
      };
    }

    // Sambungkan ke periode evaluasi aktif secara otomatis
    try {
      const { data: activePeriode } = await supabase
        .from('periode_evaluasi')
        .select('id')
        .eq('is_active', true)
        .order('tahun', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activePeriode?.id) {
        await supabase.from('pertanyaan_periode').insert({
          id_periode: activePeriode.id,
          id_pertanyaan: validated.id_pertanyaan,
          status_kelengkapan: 0,
          nilai_mandiri: 0,
          nilai_verifikasi: 0
        });
      }
    } catch (e) {
      console.warn(
        '[MASTER-DATA] Notice linking pertanyaan to active period:',
        e
      );
    }

    // Catat audit log
    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_PERTANYAAN',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createPertanyaan:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Mengubah data Pertanyaan / Indikator LKE.
 */
export async function updatePertanyaan(
  idPertanyaan: string,
  rawInput: Partial<PertanyaanInput>
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengubah Pertanyaan.'
      };
    }

    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('pertanyaan')
      .select('*')
      .eq('id_pertanyaan', idPertanyaan)
      .maybeSingle();

    if (!oldData) {
      return { success: false, error: 'Pertanyaan tidak ditemukan.' };
    }

    const updatePayload: Record<string, any> = {};
    if (rawInput.uraian_pertanyaan !== undefined) {
      updatePayload.uraian_pertanyaan = rawInput.uraian_pertanyaan;
    }
    if (rawInput.uraian_singkat !== undefined) {
      updatePayload.uraian_singkat = rawInput.uraian_singkat;
    }
    if (rawInput.deskripsi_pertanyaan !== undefined) {
      updatePayload.deskripsi_pertanyaan = rawInput.deskripsi_pertanyaan;
    }
    if (rawInput.id_subpilar !== undefined) {
      updatePayload.id_subpilar = Number(rawInput.id_subpilar);
    }

    const { data, error } = await supabase
      .from('pertanyaan')
      .update(updatePayload)
      .eq('id_pertanyaan', idPertanyaan)
      .select()
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error updating pertanyaan:', error.message);
      return {
        success: false,
        error: `Gagal memperbarui pertanyaan: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'UPDATE_PERTANYAAN',
        old_state: oldData,
        new_state: data,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updatePertanyaan:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Menghapus data Pertanyaan / Indikator LKE.
 */
export async function deletePertanyaan(idPertanyaan: string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menghapus Pertanyaan.'
      };
    }

    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('pertanyaan')
      .select('*')
      .eq('id_pertanyaan', idPertanyaan)
      .maybeSingle();

    if (!oldData) {
      return { success: false, error: 'Pertanyaan tidak ditemukan.' };
    }

    // Hapus relasi pertanyaan_periode dan kategoriPenilaian terlebih dahulu untuk keamanan
    await supabase.from('dokumen_bukti').delete().match({
      id_pertanyaan_periode: idPertanyaan
    });
    await supabase
      .from('kategoriPenilaian')
      .delete()
      .eq('id_pertanyaan', idPertanyaan);
    await supabase
      .from('pertanyaan_periode')
      .delete()
      .eq('id_pertanyaan', idPertanyaan);

    const { error } = await supabase
      .from('pertanyaan')
      .delete()
      .eq('id_pertanyaan', idPertanyaan);

    if (error) {
      console.error('[MASTER-DATA] Error deleting pertanyaan:', error.message);
      return {
        success: false,
        error: `Gagal menghapus pertanyaan: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_PERTANYAAN',
        old_state: oldData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deletePertanyaan:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 4. CRUD KATEGORI PENILAIAN (BOBOT & OPSI PILIHAN JAWABAN)
// ==============================================================================

/**
 * Membuat Opsi Jawaban / Bobot Kategori Penilaian baru untuk suatu Pertanyaan.
 */
export async function createKategoriPenilaian(
  rawInput: KategoriPenilaianInput
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengelola bobot penilaian.'
      };
    }

    const validated = KategoriPenilaianSchema.parse(rawInput);
    const supabase = await createClient();

    const assignedId =
      validated.id_kategori ||
      `kat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newRecord = {
      id_kategori: assignedId,
      id_pertanyaan: validated.id_pertanyaan,
      uraian_kategori: validated.uraian_kategori,
      nilai: validated.nilai
    };

    const { data, error } = await supabase
      .from('kategoriPenilaian')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error(
        '[MASTER-DATA] Error creating kategoriPenilaian:',
        error.message
      );
      return {
        success: false,
        error: `Gagal membuat kategori penilaian: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_KATEGORI',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createKategoriPenilaian:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Mengubah Opsi Jawaban / Bobot Kategori Penilaian.
 */
export async function updateKategoriPenilaian(
  idKategori: string,
  data: { uraian_kategori: string; nilai: number }
) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang mengubah bobot penilaian.'
      };
    }

    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('kategoriPenilaian')
      .select('*')
      .eq('id_kategori', idKategori)
      .maybeSingle();

    const updatePayload = {
      uraian_kategori: data.uraian_kategori,
      nilai: Number(data.nilai)
    };

    const { data: updated, error } = await supabase
      .from('kategoriPenilaian')
      .update(updatePayload)
      .eq('id_kategori', idKategori)
      .select()
      .single();

    if (error) {
      console.error(
        '[MASTER-DATA] Error updating kategoriPenilaian:',
        error.message
      );
      return {
        success: false,
        error: `Gagal memperbarui kategori: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'UPDATE_KATEGORI',
        old_state: oldData,
        new_state: updated,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true, data: updated };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updateKategoriPenilaian:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

/**
 * Menghapus Opsi Jawaban / Kategori Penilaian.
 */
export async function deleteKategoriPenilaian(idKategori: string) {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId || !isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Super Admin yang berwenang menghapus bobot penilaian.'
      };
    }

    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('kategoriPenilaian')
      .select('*')
      .eq('id_kategori', idKategori)
      .maybeSingle();

    const { error } = await supabase
      .from('kategoriPenilaian')
      .delete()
      .eq('id_kategori', idKategori);

    if (error) {
      console.error(
        '[MASTER-DATA] Error deleting kategoriPenilaian:',
        error.message
      );
      return {
        success: false,
        error: `Gagal menghapus kategori: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_KATEGORI',
        old_state: oldData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (e) {
      console.warn('[MASTER-DATA] Audit log warning:', e);
    }

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deleteKategoriPenilaian:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem.'
    };
  }
}

// ==============================================================================
// 5. FETCH HELPERS UNTUK FORM MASTER DATA
// ==============================================================================

/**
 * Mengambil daftar pilar untuk dropdown selector.
 */
export async function getPilarDropdownOptions() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('pilar')
      .select('id_pilar, nama_pilar, kode_pilar, id_area, area (nama_area)')
      .order('id_pilar', { ascending: true });
    return data || [];
  } catch (err) {
    console.error('[MASTER-DATA] Error getPilarDropdownOptions:', err);
    return [];
  }
}

/**
 * Mengambil daftar subpilar untuk dropdown selector.
 */
export async function getSubpilarDropdownOptions() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('subpilar')
      .select('id_subpilar, nama_subpilar, id_pilar, pilar (nama_pilar)')
      .order('id_subpilar', { ascending: true });
    return data || [];
  } catch (err) {
    console.error('[MASTER-DATA] Error getSubpilarDropdownOptions:', err);
    return [];
  }
}
