/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import {
  FasilitasDifabelItem,
  FasilitasSummary,
  KategoriFasilitas,
  KondisiFasilitas,
  DEFAULT_MOCK_FASILITAS_DIFABEL,
  calculateFasilitasSummary
} from '@/lib/accessibility/fasilitas-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Menyimpan sarana prasarana inklusif ramah difabel selama runtime server berjalan
// ==============================================================================
let globalFasilitasItems: FasilitasDifabelItem[] = [
  ...DEFAULT_MOCK_FASILITAS_DIFABEL
];

export interface FasilitasFilterParams {
  kategori?: string;
  kondisi?: string;
  search?: string;
  isTersediaOnly?: boolean;
}

/**
 * 1. Mengambil Daftar Fasilitas Difabel & Ringkasan Metrik Inklusivitas
 */
export async function getFasilitasDifabelListAction(
  filter?: FasilitasFilterParams
): Promise<{
  success: boolean;
  data: FasilitasDifabelItem[];
  summary: FasilitasSummary;
  error?: string;
}> {
  try {
    let list = [...globalFasilitasItems];

    if (filter?.kategori && filter.kategori !== 'ALL') {
      list = list.filter((item) => item.kategori === filter.kategori);
    }

    if (filter?.kondisi && filter.kondisi !== 'ALL') {
      list = list.filter((item) => item.kondisi === filter.kondisi);
    }

    if (filter?.isTersediaOnly) {
      list = list.filter((item) => item.is_tersedia);
    }

    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.nama_fasilitas.toLowerCase().includes(q) ||
          item.lokasi_spesifik.toLowerCase().includes(q) ||
          item.deskripsi.toLowerCase().includes(q) ||
          item.standar_regulasi.toLowerCase().includes(q) ||
          item.petugas_pemeriksa.toLowerCase().includes(q)
      );
    }

    // Urutkan ketersediaan terlebih dahulu, kemudian ID
    list.sort((a, b) => {
      if (a.is_tersedia === b.is_tersedia) {
        return a.id.localeCompare(b.id);
      }
      return a.is_tersedia ? -1 : 1;
    });

    const summary = calculateFasilitasSummary(globalFasilitasItems);

    return {
      success: true,
      data: list,
      summary
    };
  } catch (err: any) {
    console.error('[Fasilitas] Gagal mengambil daftar fasilitas difabel:', err);
    return {
      success: false,
      data: [],
      summary: calculateFasilitasSummary(globalFasilitasItems),
      error: err?.message || 'Gagal memuat data fasilitas ramah difabel'
    };
  }
}

/**
 * 2. Menambah atau Memperbarui Data Sarana Inklusif beserta Foto & Regulasi
 */
export async function saveFasilitasDifabelAction(
  input: Partial<FasilitasDifabelItem> & {
    nama_fasilitas: string;
    kategori: KategoriFasilitas;
  }
): Promise<{
  success: boolean;
  data?: FasilitasDifabelItem;
  summary?: FasilitasSummary;
  error?: string;
}> {
  try {
    const isEdit = Boolean(input.id);
    let targetItem: FasilitasDifabelItem;

    if (isEdit) {
      const index = globalFasilitasItems.findIndex(
        (item) => item.id === input.id
      );
      if (index === -1) {
        return { success: false, error: 'Fasilitas tidak ditemukan' };
      }

      targetItem = {
        ...globalFasilitasItems[index],
        ...input,
        id: globalFasilitasItems[index].id,
        terakhir_diperiksa:
          input.terakhir_diperiksa || new Date().toISOString().split('T')[0]
      };

      globalFasilitasItems[index] = targetItem;
    } else {
      const newId = `FAS-${String(globalFasilitasItems.length + 1).padStart(3, '0')}`;
      targetItem = {
        id: newId,
        nama_fasilitas: input.nama_fasilitas,
        kategori: input.kategori,
        kondisi: input.kondisi || 'SANGAT_BAIK',
        lokasi_spesifik:
          input.lokasi_spesifik ||
          'Ruang Pelayanan Statistik Terpadu (PST) BPS Sitaro',
        deskripsi: input.deskripsi || '',
        standar_regulasi:
          input.standar_regulasi ||
          'PermenPAN-RB No. 90/2021 tentang Pembangunan Fasilitas Ramah Kelompok Rentan',
        foto_dokumentasi_url:
          input.foto_dokumentasi_url ||
          'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        is_tersedia: input.is_tersedia !== undefined ? input.is_tersedia : true,
        terakhir_diperiksa:
          input.terakhir_diperiksa || new Date().toISOString().split('T')[0],
        petugas_pemeriksa:
          input.petugas_pemeriksa || 'Tim Kepatuhan Pelayanan PST BPS Sitaro',
        spesifikasi_teknis: input.spesifikasi_teknis || ''
      };

      globalFasilitasItems.unshift(targetItem);
    }

    const summary = calculateFasilitasSummary(globalFasilitasItems);
    revalidatePath('/rebo/fasilitas-difabel');

    return {
      success: true,
      data: targetItem,
      summary
    };
  } catch (err: any) {
    console.error('[Fasilitas] Gagal menyimpan sarana difabel:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan sarana difabel'
    };
  }
}

/**
 * 3. Toggle Status Ketersediaan Sarana Inklusif (Tersedia vs Sedang Pemeliharaan)
 */
export async function toggleFasilitasStatusAction(
  id: string,
  isTersedia: boolean
): Promise<{
  success: boolean;
  data?: FasilitasDifabelItem;
  summary?: FasilitasSummary;
  error?: string;
}> {
  try {
    const index = globalFasilitasItems.findIndex((item) => item.id === id);
    if (index === -1) {
      return { success: false, error: 'Fasilitas tidak ditemukan' };
    }

    globalFasilitasItems[index] = {
      ...globalFasilitasItems[index],
      is_tersedia: isTersedia,
      terakhir_diperiksa: new Date().toISOString().split('T')[0]
    };

    const summary = calculateFasilitasSummary(globalFasilitasItems);
    revalidatePath('/rebo/fasilitas-difabel');

    return {
      success: true,
      data: globalFasilitasItems[index],
      summary
    };
  } catch (err: any) {
    console.error('[Fasilitas] Gagal toggle status fasilitas:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memperbarui status ketersediaan fasilitas'
    };
  }
}

/**
 * 4. Hapus Sarana Inklusif
 */
export async function deleteFasilitasDifabelAction(id: string): Promise<{
  success: boolean;
  summary?: FasilitasSummary;
  error?: string;
}> {
  try {
    const prevLen = globalFasilitasItems.length;
    globalFasilitasItems = globalFasilitasItems.filter(
      (item) => item.id !== id
    );

    if (globalFasilitasItems.length === prevLen) {
      return { success: false, error: 'Fasilitas tidak ditemukan' };
    }

    const summary = calculateFasilitasSummary(globalFasilitasItems);
    revalidatePath('/rebo/fasilitas-difabel');

    return {
      success: true,
      summary
    };
  } catch (err: any) {
    console.error('[Fasilitas] Gagal menghapus fasilitas:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menghapus fasilitas'
    };
  }
}

/**
 * 5. Reset Data Fasilitas ke Kondisi Default Mock 2026
 */
export async function resetFasilitasToDefaultAction(): Promise<{
  success: boolean;
  data: FasilitasDifabelItem[];
  summary: FasilitasSummary;
}> {
  globalFasilitasItems = [...DEFAULT_MOCK_FASILITAS_DIFABEL];
  const summary = calculateFasilitasSummary(globalFasilitasItems);
  revalidatePath('/rebo/fasilitas-difabel');

  return {
    success: true,
    data: globalFasilitasItems,
    summary
  };
}
