/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import type { ArsipDokumen, KategoriArsip } from '@/types/rebo';

// Fallback seed data untuk BPS Kabupaten Kepulauan Siau Tagulandang Biaro
const DEFAULT_ARSIP_LIST: ArsipDokumen[] = [
  {
    id: 'arsip-sk-2026',
    judul_dokumen:
      'Keputusan Kepala BPS Kab. Kepulauan Siau Tagulandang Biaro tentang Pembentukan Tim Kerja Pembangunan ZI Menuju WBK/WBBM Tahun 2026',
    kategori: 'SK_TIM',
    tahun: 2026,
    nomor_surat: '018/71080/KP.300/2026',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'SK penetapan struktur organisasi Tim ZI Tahun 2026 mencakup Koordinator Pilar 1 s.d. 6 dan sekretariat.',
    uploaded_by: 'Super Admin BPS Sitaro',
    created_at: '2026-01-05T08:30:00Z'
  },
  {
    id: 'arsip-rencana-aksi-2026',
    judul_dokumen:
      'Road Map & Rencana Aksi Pembangunan Zona Integritas BPS Kabupaten Kepulauan Siau Tagulandang Biaro Tahun 2026',
    kategori: 'RENCANA_AKSI',
    tahun: 2026,
    nomor_surat: 'RA-ZI/7108/2026',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'Matriks rencana kerja, target waktu pemenuhan indikator, serta penanggung jawab per pilar.',
    uploaded_by: 'Koordinator ZI',
    created_at: '2026-01-10T10:15:00Z'
  },
  {
    id: 'arsip-sop-pst-2025',
    judul_dokumen:
      'Standar Operasional Prosedur (SOP) & Inovasi Pelayanan Statistik Terpadu (PST) BPS Sitaro',
    kategori: 'SOP_INOVASI',
    tahun: 2025,
    nomor_surat: 'SOP-PST/01/BPS-7108/2025',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'SOP pelayanan konsultasi data statistik tatap muka & daring, serta maklumat pelayanan publik.',
    uploaded_by: 'Operator Pelayanan Publik',
    created_at: '2025-03-14T09:00:00Z'
  },
  {
    id: 'arsip-lhe-2025',
    judul_dokumen:
      'Lembar Hasil Evaluasi (LHE) Penilaian Mandiri PMPRB & Lembar Kerja Evaluasi ZI Tahun 2025',
    kategori: 'LKE_RESMI',
    tahun: 2025,
    nomor_surat: 'LHE-TPI/7108/XI/2025',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'Laporan resmi hasil evaluasi Tim Penilai Internal (TPI) BPS Provinsi Sulawesi Utara atas LKE 2025.',
    uploaded_by: 'TPI BPS Sulut',
    created_at: '2025-11-20T14:45:00Z'
  },
  {
    id: 'arsip-sk-2025',
    judul_dokumen:
      'SK Penetapan Role Model & Agen Perubahan BPS Kabupaten Kepulauan Siau Tagulandang Biaro Tahun 2025',
    kategori: 'SK_TIM',
    tahun: 2025,
    nomor_surat: '012/71080/KP.320/2025',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'SK pemilihan Agen Perubahan dan pimpinan sebagai role model integritas.',
    uploaded_by: 'Super Admin BPS Sitaro',
    created_at: '2025-02-01T08:00:00Z'
  },
  {
    id: 'arsip-pedoman-menpan',
    judul_dokumen:
      'PermenPAN-RB No. 90 Tahun 2021 tentang Pembangunan dan Evaluasi Zona Integritas Menuju WBK/WBBM',
    kategori: 'PEDOMAN',
    tahun: 2024,
    nomor_surat: 'PermenPAN-RB No. 90/2021',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'Pedoman pokok acuan kerangka kerja instrumen LKE Zona Integritas nasional.',
    uploaded_by: 'Tim RB Sitaro',
    created_at: '2024-01-15T07:30:00Z'
  },
  {
    id: 'arsip-juknis-bps',
    judul_dokumen:
      'Petunjuk Teknis Pengisian Lembar Kerja Evaluasi (LKE) ZI Satuan Kerja BPS RI',
    kategori: 'PEDOMAN',
    tahun: 2025,
    nomor_surat: 'B-142/03200/HM.210/2025',
    file_url:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    keterangan:
      'Panduan teknis indikator pemenuhan dan reform instrumen evaluasi ZI internal BPS.',
    uploaded_by: 'Inspektorat Utama BPS',
    created_at: '2025-01-20T11:00:00Z'
  }
];

export interface GetArsipFilter {
  tahun?: number;
  kategori?: string;
  search?: string;
}

/**
 * Server Action: Mengambil daftar seluruh dokumen arsip digital ZI BPS Sitaro.
 * Mendukung filter tahun, kategori, dan kata kunci pencarian.
 * Dilengkapi graceful fallback ke initial dataset resmi jika tabel database kosong / belum termigrasi.
 */
export async function getArsipList(filter?: GetArsipFilter): Promise<{
  success: boolean;
  data: ArsipDokumen[];
  availableYears: number[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('arsip_dokumen')
      .select('*')
      .order('tahun', { ascending: false })
      .order('created_at', { ascending: false });

    if (filter?.tahun && !isNaN(filter.tahun)) {
      query = query.eq('tahun', filter.tahun);
    }

    if (filter?.kategori && filter.kategori !== 'ALL') {
      query = query.eq('kategori', filter.kategori);
    }

    const { data: dbData, error } = await query;

    let items: ArsipDokumen[] = [];

    if (error || !dbData || dbData.length === 0) {
      if (error) {
        console.warn(
          '[ARSIP-ACTIONS] Notice querying arsip_dokumen:',
          error.message
        );
      }
      // Gunakan fallback dataset
      items = [...DEFAULT_ARSIP_LIST];

      // Terapkan filter manual pada fallback dataset
      if (filter?.tahun && !isNaN(filter.tahun)) {
        items = items.filter((d) => d.tahun === filter.tahun);
      }
      if (filter?.kategori && filter.kategori !== 'ALL') {
        items = items.filter((d) => d.kategori === filter.kategori);
      }
    } else {
      items = dbData as ArsipDokumen[];
    }

    // Filter search text jika ada
    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      items = items.filter(
        (doc) =>
          doc.judul_dokumen.toLowerCase().includes(q) ||
          (doc.nomor_surat && doc.nomor_surat.toLowerCase().includes(q)) ||
          (doc.keterangan && doc.keterangan.toLowerCase().includes(q))
      );
    }

    // Kumpulkan daftar tahun yang tersedia
    const yearSet = new Set<number>();
    DEFAULT_ARSIP_LIST.forEach((d) => yearSet.add(d.tahun));
    if (dbData && dbData.length > 0) {
      dbData.forEach((d: any) => {
        if (d.tahun) yearSet.add(Number(d.tahun));
      });
    }
    const availableYears = Array.from(yearSet).sort((a, b) => b - a);

    return {
      success: true,
      data: items,
      availableYears
    };
  } catch (err: any) {
    console.error('[ARSIP-ACTIONS] Error in getArsipList:', err);
    return {
      success: false,
      data: DEFAULT_ARSIP_LIST,
      availableYears: [2026, 2025, 2024],
      error: err?.message || 'Gagal memuat arsip dokumen.'
    };
  }
}

export interface CreateArsipInput {
  judul_dokumen: string;
  kategori: KategoriArsip;
  tahun: number;
  file_url: string;
  nomor_surat?: string;
  keterangan?: string;
}

/**
 * Server Action: Menambahkan dokumen arsip baru (Khusus Super Admin).
 */
export async function createArsipDokumen(input: CreateArsipInput): Promise<{
  success: boolean;
  data?: ArsipDokumen;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();

    if (!session.userId) {
      return {
        success: false,
        error: 'Sesi kedaluwarsa. Silakan masuk kembali.'
      };
    }

    if (!isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses Ditolak: Hanya Super Admin yang berwenang menambahkan dokumen arsip resmi.'
      };
    }

    if (!input.judul_dokumen || !input.judul_dokumen.trim()) {
      return { success: false, error: 'Judul dokumen wajib diisi.' };
    }

    if (!input.file_url || !input.file_url.trim()) {
      return { success: false, error: 'Tautan file dokumen wajib diisi.' };
    }

    if (!input.tahun || isNaN(input.tahun)) {
      return { success: false, error: 'Tahun dokumen tidak valid.' };
    }

    const supabase = await createClient();

    const uploaderName =
      session.fullName || session.email || 'Super Admin BPS Sitaro';

    const insertPayload = {
      judul_dokumen: input.judul_dokumen.trim(),
      kategori: input.kategori,
      tahun: Number(input.tahun),
      file_url: input.file_url.trim(),
      nomor_surat: input.nomor_surat?.trim() || null,
      keterangan: input.keterangan?.trim() || null,
      uploaded_by: uploaderName
    };

    const { data, error } = await supabase
      .from('arsip_dokumen')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error(
        '[ARSIP-ACTIONS] Error inserting into arsip_dokumen:',
        error
      );
      return {
        success: false,
        error: `Gagal menyimpan dokumen ke database: ${error.message}`
      };
    }

    revalidatePath('/rebo/arsip');

    return {
      success: true,
      data: data as ArsipDokumen
    };
  } catch (err: any) {
    console.error(
      '[ARSIP-ACTIONS] Unexpected error in createArsipDokumen:',
      err
    );
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menyimpan arsip.'
    };
  }
}

/**
 * Server Action: Menghapus dokumen arsip (Khusus Super Admin).
 */
export async function deleteArsipDokumen(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();

    if (!session.userId) {
      return {
        success: false,
        error: 'Sesi kedaluwarsa. Silakan masuk kembali.'
      };
    }

    if (!isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses Ditolak: Hanya Super Admin yang berwenang menghapus dokumen arsip resmi.'
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('arsip_dokumen')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        '[ARSIP-ACTIONS] Error deleting from arsip_dokumen:',
        error
      );
      return {
        success: false,
        error: `Gagal menghapus dokumen: ${error.message}`
      };
    }

    revalidatePath('/rebo/arsip');

    return { success: true };
  } catch (err: any) {
    console.error(
      '[ARSIP-ACTIONS] Unexpected error in deleteArsipDokumen:',
      err
    );
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menghapus arsip.'
    };
  }
}
