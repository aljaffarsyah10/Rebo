/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';

// ==============================================================================
// Schemas Validasi Master Data Sesuai Struktur Database Supabase Asli
// - pilar: id_pilar, nama_pilar, id_area
// - subpilar: id_subpilar, id_pilar, nama_subpilar
// - pertanyaan: id_pertanyaan, deskripsi_pertanyaan, id_subpilar, uraian_buktidukung
// - kategoriPenilaian: id_kategori, id_pertanyaan, kode_kategori, nilai, uraian_kategori
// ==============================================================================

const PilarSchema = z.object({
  id_pilar: z.union([z.number(), z.string()]).optional(),
  nama_pilar: z
    .string()
    .min(3, 'Nama pilar minimal 3 karakter')
    .max(255, 'Nama pilar maksimal 255 karakter'),
  id_area: z.coerce
    .number()
    .min(1, 'Area harus dipilih (1: Pemenuhan, 2: Reform)'),
  // Opsional untuk kompatibilitas jika dikirim dari form klien
  kode_pilar: z.string().optional().nullable(),
  deskripsi_pilar: z.string().optional().nullable()
});

const SubpilarSchema = z.object({
  id_subpilar: z.union([z.number(), z.string()]).optional(),
  nama_subpilar: z
    .string()
    .min(3, 'Nama subpilar minimal 3 karakter')
    .max(255, 'Nama subpilar maksimal 255 karakter'),
  id_pilar: z.coerce.number().min(1, 'Pilar induk harus dipilih'),
  // Opsional untuk kompatibilitas jika dikirim dari form klien
  deskripsi_subpilar: z.string().optional().nullable()
});

const PertanyaanSchema = z.object({
  id_pertanyaan: z.union([z.number(), z.string()]).optional(),
  deskripsi_pertanyaan: z.string().optional(),
  uraian_pertanyaan: z.string().optional(),
  uraian_buktidukung: z.string().optional().nullable(),
  uraian_singkat: z.string().optional().nullable(),
  id_subpilar: z.coerce.number().min(1, 'Subpilar harus dipilih')
});

const KategoriPenilaianSchema = z.object({
  id_kategori: z.union([z.number(), z.string()]).optional(),
  id_pertanyaan: z.union([z.number(), z.string()]),
  kode_kategori: z
    .string()
    .max(20, 'Kode kategori maksimal 20 karakter')
    .optional()
    .nullable(),
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

// Helper fungsi revalidasi rute setelah perubahan master data
function revalidateMasterPaths() {
  revalidatePath('/rebo/dataRB/pilar');
  revalidatePath('/rebo/dataRB/pilar/subpilar');
  revalidatePath('/rebo/dataRB/pilar/pertanyaan');
  revalidatePath('/rebo/formRB');
  revalidatePath('/rebo/monitoring');
  revalidatePath('/rebo/kanban');
  revalidatePath('/rebo/pilarHasil');
}

// ==============================================================================
// 1. CRUD PILAR (public.pilar: id_pilar, nama_pilar, id_area)
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

    if (!assignedId || isNaN(assignedId) || assignedId <= 0) {
      const { data: maxRow } = await supabase
        .from('pilar')
        .select('id_pilar')
        .order('id_pilar', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId = (maxRow?.id_pilar ? Number(maxRow.id_pilar) : 0) + 1;
    } else {
      // Cek apakah ID sudah terpakai
      const { data: existing } = await supabase
        .from('pilar')
        .select('id_pilar')
        .eq('id_pilar', assignedId)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: `ID Pilar "${assignedId}" sudah digunakan. Silakan gunakan ID unik lainnya.`
        };
      }
    }

    const newRecord = {
      id_pilar: assignedId,
      nama_pilar: validated.nama_pilar.trim(),
      id_area: validated.id_area
    };

    const { data, error } = await supabase
      .from('pilar')
      .insert(newRecord)
      .select('id_pilar, nama_pilar, id_area, area (id_area, nama_area)')
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating pilar:', error.message);
      return { success: false, error: `Gagal membuat pilar: ${error.message}` };
    }

    // Catat audit log bila tabel tersedia
    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_PILAR',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createPilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat membuat pilar.'
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

    const { data: oldData } = await supabase
      .from('pilar')
      .select('*')
      .eq('id_pilar', targetId)
      .maybeSingle();

    if (!oldData) {
      return { success: false, error: 'Pilar tidak ditemukan.' };
    }

    const updatePayload = {
      nama_pilar: validated.nama_pilar.trim(),
      id_area: validated.id_area
    };

    const { data, error } = await supabase
      .from('pilar')
      .update(updatePayload)
      .eq('id_pilar', targetId)
      .select('id_pilar, nama_pilar, id_area, area (id_area, nama_area)')
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error updating pilar:', error.message);
      return {
        success: false,
        error: `Gagal memperbarui pilar: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'UPDATE_PILAR',
        old_state: oldData,
        new_state: data,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updatePilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat memperbarui pilar.'
    };
  }
}

/**
 * Menghapus data Pilar.
 * Memeriksa apakah ada anak subpilar sebelum mengizinkan penghapusan.
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

    // Integritas referensial: Cek apakah ada subpilar turunan
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

    try {
      await supabase.from('audit_log').insert({
        action: 'DELETE_PILAR',
        old_state: oldData,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deletePilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat menghapus pilar.'
    };
  }
}

// ==============================================================================
// 2. CRUD SUBPILAR (public.subpilar: id_subpilar, id_pilar, nama_subpilar)
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

    if (!assignedId || isNaN(assignedId) || assignedId <= 0) {
      const { data: maxRow } = await supabase
        .from('subpilar')
        .select('id_subpilar')
        .order('id_subpilar', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId = (maxRow?.id_subpilar ? Number(maxRow.id_subpilar) : 0) + 1;
    } else {
      const { data: existing } = await supabase
        .from('subpilar')
        .select('id_subpilar')
        .eq('id_subpilar', assignedId)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: `ID Subpilar "${assignedId}" sudah digunakan. Gunakan ID unik lainnya.`
        };
      }
    }

    const newRecord = {
      id_subpilar: assignedId,
      nama_subpilar: validated.nama_subpilar.trim(),
      id_pilar: Number(validated.id_pilar)
    };

    const { data, error } = await supabase
      .from('subpilar')
      .insert(newRecord)
      .select(
        'id_subpilar, nama_subpilar, id_pilar, pilar (id_pilar, nama_pilar)'
      )
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating subpilar:', error.message);
      return {
        success: false,
        error: `Gagal membuat subpilar: ${error.message}`
      };
    }

    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_SUBPILAR',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createSubpilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat membuat subpilar.'
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

    if (!oldData) {
      return { success: false, error: 'Subpilar tidak ditemukan.' };
    }

    const updatePayload = {
      nama_subpilar: validated.nama_subpilar.trim(),
      id_pilar: Number(validated.id_pilar)
    };

    const { data, error } = await supabase
      .from('subpilar')
      .update(updatePayload)
      .eq('id_subpilar', targetId)
      .select(
        'id_subpilar, nama_subpilar, id_pilar, pilar (id_pilar, nama_pilar)'
      )
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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updateSubpilar:', err);
    return {
      success: false,
      error:
        err.message || 'Terjadi kesalahan sistem saat memperbarui subpilar.'
    };
  }
}

/**
 * Menghapus data Subpilar.
 * Memeriksa apakah ada pertanyaan di dalamnya sebelum mengizinkan penghapusan.
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

    // Integritas referensial: Cek apakah ada pertanyaan turunan
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
        error: `Tidak dapat menghapus Subpilar ini karena masih memiliki ${count} Pertanyaan/Indikator terkait. Silakan hapus atau pindahkan pertanyaan di dalamnya terlebih dahulu.`
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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deleteSubpilar:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat menghapus subpilar.'
    };
  }
}

// ==============================================================================
// 3. CRUD PERTANYAAN (public.pertanyaan: id_pertanyaan, deskripsi_pertanyaan, id_subpilar, uraian_buktidukung)
// ==============================================================================

/**
 * Membuat Pertanyaan / Indikator LKE baru.
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
    const textDeskripsi =
      validated.deskripsi_pertanyaan?.trim() ||
      validated.uraian_pertanyaan?.trim() ||
      '';

    if (textDeskripsi.length < 5) {
      return {
        success: false,
        error: 'Deskripsi pertanyaan minimal 5 karakter.'
      };
    }

    const textBuktiDukung =
      validated.uraian_buktidukung !== undefined
        ? validated.uraian_buktidukung
        : validated.uraian_singkat || null;

    const supabase = await createClient();

    // Tentukan ID numerik
    let assignedId: number;
    if (
      validated.id_pertanyaan &&
      !isNaN(Number(validated.id_pertanyaan)) &&
      Number(validated.id_pertanyaan) > 0
    ) {
      assignedId = Number(validated.id_pertanyaan);
    } else {
      const { data: maxRow } = await supabase
        .from('pertanyaan')
        .select('id_pertanyaan')
        .order('id_pertanyaan', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId =
        (maxRow?.id_pertanyaan ? Number(maxRow.id_pertanyaan) : 0) + 1;
    }

    const { data: existing } = await supabase
      .from('pertanyaan')
      .select('id_pertanyaan')
      .eq('id_pertanyaan', assignedId)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `ID Pertanyaan "${assignedId}" sudah digunakan. Gunakan ID unik lainnya.`
      };
    }

    const newRecord = {
      id_pertanyaan: assignedId,
      deskripsi_pertanyaan: textDeskripsi,
      uraian_buktidukung: textBuktiDukung,
      id_subpilar: Number(validated.id_subpilar)
    };

    const { data, error } = await supabase
      .from('pertanyaan')
      .insert(newRecord)
      .select(
        `
        id_pertanyaan,
        deskripsi_pertanyaan,
        uraian_buktidukung,
        id_subpilar,
        subpilar (
          id_subpilar,
          nama_subpilar,
          id_pilar,
          pilar (id_pilar, nama_pilar)
        )
      `
      )
      .single();

    if (error) {
      console.error('[MASTER-DATA] Error creating pertanyaan:', error.message);
      return {
        success: false,
        error: `Gagal membuat pertanyaan: ${error.message}`
      };
    }

    // Sambungkan ke periode evaluasi aktif secara otomatis jika ada tabel pertanyaan_periode
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
          id_pertanyaan: assignedId,
          status_kelengkapan: 0,
          nilai_mandiri: 0,
          nilai_verifikasi: 0
        });
      }
    } catch (_) {}

    try {
      await supabase.from('audit_log').insert({
        action: 'CREATE_PERTANYAAN',
        new_state: newRecord,
        user_id: session.userId,
        user_name: session.fullName || 'Super Admin',
        role: session.role
      });
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createPertanyaan:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat membuat pertanyaan.'
    };
  }
}

/**
 * Mengubah data Pertanyaan / Indikator LKE.
 */
export async function updatePertanyaan(
  idPertanyaan: number | string,
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
    const targetId = Number(idPertanyaan);

    const { data: oldData } = await supabase
      .from('pertanyaan')
      .select('*')
      .eq('id_pertanyaan', targetId)
      .maybeSingle();

    if (!oldData) {
      return { success: false, error: 'Pertanyaan tidak ditemukan.' };
    }

    const updatePayload: Record<string, any> = {};

    if (
      rawInput.deskripsi_pertanyaan !== undefined ||
      rawInput.uraian_pertanyaan !== undefined
    ) {
      const textDeskripsi =
        rawInput.deskripsi_pertanyaan?.trim() ||
        rawInput.uraian_pertanyaan?.trim() ||
        '';
      if (textDeskripsi.length < 5) {
        return {
          success: false,
          error: 'Deskripsi pertanyaan minimal 5 karakter.'
        };
      }
      updatePayload.deskripsi_pertanyaan = textDeskripsi;
    }

    if (
      rawInput.uraian_buktidukung !== undefined ||
      rawInput.uraian_singkat !== undefined
    ) {
      updatePayload.uraian_buktidukung =
        rawInput.uraian_buktidukung !== undefined
          ? rawInput.uraian_buktidukung
          : rawInput.uraian_singkat || null;
    }

    if (rawInput.id_subpilar !== undefined) {
      updatePayload.id_subpilar = Number(rawInput.id_subpilar);
    }

    const { data, error } = await supabase
      .from('pertanyaan')
      .update(updatePayload)
      .eq('id_pertanyaan', targetId)
      .select(
        `
        id_pertanyaan,
        deskripsi_pertanyaan,
        uraian_buktidukung,
        id_subpilar,
        subpilar (
          id_subpilar,
          nama_subpilar,
          id_pilar,
          pilar (id_pilar, nama_pilar)
        )
      `
      )
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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updatePertanyaan:', err);
    return {
      success: false,
      error:
        err.message || 'Terjadi kesalahan sistem saat memperbarui pertanyaan.'
    };
  }
}

/**
 * Menghapus data Pertanyaan / Indikator LKE secara aman.
 * Menghapus relasi buktiDukung, kategoriPenilaian, dan pertanyaan_periode terkait secara berurutan.
 */
export async function deletePertanyaan(idPertanyaan: number | string) {
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
    const targetId = Number(idPertanyaan);

    const { data: oldData } = await supabase
      .from('pertanyaan')
      .select('*')
      .eq('id_pertanyaan', targetId)
      .maybeSingle();

    if (!oldData) {
      return { success: false, error: 'Pertanyaan tidak ditemukan.' };
    }

    // Cascade aman: hapus relasi di buktiDukung dan kategoriPenilaian
    await supabase.from('buktiDukung').delete().eq('id_pertanyaan', targetId);
    await supabase
      .from('kategoriPenilaian')
      .delete()
      .eq('id_pertanyaan', targetId);

    try {
      await supabase
        .from('pertanyaan_periode')
        .delete()
        .eq('id_pertanyaan', targetId);
    } catch (_) {}

    const { error } = await supabase
      .from('pertanyaan')
      .delete()
      .eq('id_pertanyaan', targetId);

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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deletePertanyaan:', err);
    return {
      success: false,
      error:
        err.message || 'Terjadi kesalahan sistem saat menghapus pertanyaan.'
    };
  }
}

// ==============================================================================
// 4. CRUD KATEGORI PENILAIAN (public.kategoriPenilaian: id_kategori, id_pertanyaan, kode_kategori, nilai, uraian_kategori)
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

    let assignedId: number;
    if (validated.id_kategori && !isNaN(Number(validated.id_kategori))) {
      assignedId = Number(validated.id_kategori);
    } else {
      const { data: maxRow } = await supabase
        .from('kategoriPenilaian')
        .select('id_kategori')
        .order('id_kategori', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignedId = (maxRow?.id_kategori ? Number(maxRow.id_kategori) : 0) + 1;
    }

    const newRecord = {
      id_kategori: assignedId,
      id_pertanyaan: Number(validated.id_pertanyaan),
      kode_kategori: validated.kode_kategori?.trim() || null,
      uraian_kategori: validated.uraian_kategori.trim(),
      nilai: validated.nilai
    };

    const { data, error } = await supabase
      .from('kategoriPenilaian')
      .insert(newRecord)
      .select(
        'id_kategori, id_pertanyaan, kode_kategori, nilai, uraian_kategori'
      )
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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in createKategoriPenilaian:', err);
    return {
      success: false,
      error:
        err.message ||
        'Terjadi kesalahan sistem saat membuat kategori penilaian.'
    };
  }
}

/**
 * Mengubah Opsi Jawaban / Bobot Kategori Penilaian.
 */
export async function updateKategoriPenilaian(
  idKategori: number | string,
  data: {
    uraian_kategori: string;
    nilai: number;
    kode_kategori?: string | null;
  }
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

    if (!data.uraian_kategori || data.uraian_kategori.trim().length < 2) {
      return {
        success: false,
        error: 'Uraian pilihan jawaban minimal 2 karakter.'
      };
    }

    const supabase = await createClient();
    const targetId = Number(idKategori);

    const { data: oldData } = await supabase
      .from('kategoriPenilaian')
      .select('*')
      .eq('id_kategori', targetId)
      .maybeSingle();

    if (!oldData) {
      return {
        success: false,
        error: 'Opsi penilaian tidak ditemukan.'
      };
    }

    const updatePayload: Record<string, any> = {
      uraian_kategori: data.uraian_kategori.trim(),
      nilai: Number(data.nilai)
    };

    if (data.kode_kategori !== undefined) {
      updatePayload.kode_kategori = data.kode_kategori?.trim() || null;
    }

    const { data: updated, error } = await supabase
      .from('kategoriPenilaian')
      .update(updatePayload)
      .eq('id_kategori', targetId)
      .select(
        'id_kategori, id_pertanyaan, kode_kategori, nilai, uraian_kategori'
      )
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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true, data: updated };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in updateKategoriPenilaian:', err);
    return {
      success: false,
      error:
        err.message || 'Terjadi kesalahan sistem saat memperbarui kategori.'
    };
  }
}

/**
 * Menghapus Opsi Jawaban / Kategori Penilaian secara aman.
 * Melepaskan referensi di buktiDukung jika ada.
 */
export async function deleteKategoriPenilaian(idKategori: number | string) {
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
    const targetId = Number(idKategori);

    const { data: oldData } = await supabase
      .from('kategoriPenilaian')
      .select('*')
      .eq('id_kategori', targetId)
      .maybeSingle();

    if (!oldData) {
      return {
        success: false,
        error: 'Opsi penilaian tidak ditemukan.'
      };
    }

    // Lepaskan referensi foreign key di buktiDukung terlebih dahulu secara aman
    try {
      await supabase
        .from('buktiDukung')
        .update({ id_kategori: null })
        .eq('id_kategori', targetId);
    } catch (e) {
      console.warn('[MASTER-DATA] Could not clear buktiDukung foreign key:', e);
    }

    const { error } = await supabase
      .from('kategoriPenilaian')
      .delete()
      .eq('id_kategori', targetId);

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
    } catch (_) {}

    revalidateMasterPaths();
    return { success: true };
  } catch (err: any) {
    console.error('[MASTER-DATA] Exception in deleteKategoriPenilaian:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat menghapus kategori.'
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
      .select('id_pilar, nama_pilar, id_area, area (nama_area)')
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
