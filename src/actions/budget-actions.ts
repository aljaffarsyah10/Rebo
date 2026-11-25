/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import {
  ItemAnggaranZI,
  BudgetSummary,
  DEFAULT_MOCK_BUDGET_ITEMS,
  calculateBudgetSummary,
  StatusPelaksanaanAnggaran
} from '@/lib/budget/budget-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Menyimpan item pagu dan realisasi anggaran ZI/RB selama runtime server berjalan
// ==============================================================================
let globalBudgetItems: ItemAnggaranZI[] = [
  ...DEFAULT_MOCK_BUDGET_ITEMS.map((item) => ({ ...item }))
];

/**
 * Parameter filter untuk query anggaran ZI
 */
interface BudgetFilterParams {
  pilar_id?: number | 'ALL';
  status?: StatusPelaksanaanAnggaran | 'ALL';
  search?: string;
  tahun?: number;
}

/**
 * 1. Mengambil Daftar Anggaran ZI & Ringkasan Metrik
 */
export async function getBudgetListAction(
  tahunOrFilter?: number | BudgetFilterParams
): Promise<{
  success: boolean;
  data: ItemAnggaranZI[];
  summary: BudgetSummary;
  error?: string;
}> {
  try {
    let filter: BudgetFilterParams = {};
    if (typeof tahunOrFilter === 'number') {
      filter.tahun = tahunOrFilter;
    } else if (tahunOrFilter && typeof tahunOrFilter === 'object') {
      filter = tahunOrFilter;
    }

    let list = [...globalBudgetItems];

    if (filter.tahun) {
      list = list.filter((item) => (item.tahun || 2026) === filter.tahun);
    }

    if (filter.pilar_id && filter.pilar_id !== 'ALL') {
      list = list.filter((item) => item.pilar_id === filter.pilar_id);
    }

    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((item) => item.status_pelaksanaan === filter.status);
    }

    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.nama_kegiatan.toLowerCase().includes(q) ||
          item.kode_mak.toLowerCase().includes(q) ||
          item.no_spj_atau_bukti.toLowerCase().includes(q) ||
          item.keterangan.toLowerCase().includes(q) ||
          (item.penanggung_jawab &&
            item.penanggung_jawab.toLowerCase().includes(q))
      );
    }

    // Urutkan berdasarkan ID
    list.sort((a, b) => a.id.localeCompare(b.id));

    // Summary dihitung berdasarkan total item yang sesuai tahun (atau semua item aktif)
    const baseItemsForSummary = filter.tahun
      ? globalBudgetItems.filter(
          (item) => (item.tahun || 2026) === filter.tahun
        )
      : globalBudgetItems;

    const summary = calculateBudgetSummary(baseItemsForSummary);

    return {
      success: true,
      data: list,
      summary
    };
  } catch (error: any) {
    console.error('Error in getBudgetListAction:', error);
    return {
      success: false,
      data: [],
      summary: calculateBudgetSummary([]),
      error: error?.message || 'Gagal memuat data anggaran ZI'
    };
  }
}

/**
 * 2. Menyimpan atau Memperbarui Item Anggaran ZI
 */
export async function saveBudgetItemAction(
  data: Partial<ItemAnggaranZI> & {
    nama_kegiatan: string;
    kode_mak: string;
    pilar_id: number;
    pagu_anggaran_rp: number;
  }
): Promise<{
  success: boolean;
  item?: ItemAnggaranZI;
  error?: string;
}> {
  try {
    const pagu = Math.max(0, Number(data.pagu_anggaran_rp) || 0);
    const realisasi = Math.max(0, Number(data.realisasi_anggaran_rp) || 0);
    const sisa = Math.max(0, pagu - realisasi);
    const persentase =
      pagu > 0 ? Number(((realisasi / pagu) * 100).toFixed(2)) : 0;

    let status = data.status_pelaksanaan;
    if (!status) {
      if (realisasi >= pagu && pagu > 0) {
        status = 'SELESAI';
      } else if (realisasi > 0) {
        status = 'SEDANG_BERJALAN';
      } else {
        status = 'TERENCANA';
      }
    }

    if (data.id) {
      // Update existing item
      const index = globalBudgetItems.findIndex((i) => i.id === data.id);
      if (index === -1) {
        return { success: false, error: 'Data anggaran tidak ditemukan' };
      }

      const updatedItem: ItemAnggaranZI = {
        ...globalBudgetItems[index],
        kode_mak: data.kode_mak.trim(),
        nama_kegiatan: data.nama_kegiatan.trim(),
        pilar_id: Number(data.pilar_id),
        pagu_anggaran_rp: pagu,
        realisasi_anggaran_rp: realisasi,
        sisa_anggaran_rp: sisa,
        persentase_penyerapan: persentase,
        status_pelaksanaan: status,
        tanggal_kegiatan:
          data.tanggal_kegiatan || new Date().toISOString().split('T')[0],
        no_spj_atau_bukti: data.no_spj_atau_bukti?.trim() || '-',
        keterangan: data.keterangan?.trim() || '',
        penanggung_jawab:
          data.penanggung_jawab?.trim() || 'Tim Kerja ZI BPS Sitaro',
        tahun: data.tahun || 2026
      };

      globalBudgetItems[index] = updatedItem;
      revalidatePath('/rebo/budget');
      return { success: true, item: updatedItem };
    } else {
      // Create new item
      const nextNum = globalBudgetItems.length + 1;
      const newId = `ZI-BDG-2026-${String(nextNum).padStart(3, '0')}`;

      const newItem: ItemAnggaranZI = {
        id: newId,
        kode_mak: data.kode_mak.trim(),
        nama_kegiatan: data.nama_kegiatan.trim(),
        pilar_id: Number(data.pilar_id),
        pagu_anggaran_rp: pagu,
        realisasi_anggaran_rp: realisasi,
        sisa_anggaran_rp: sisa,
        persentase_penyerapan: persentase,
        status_pelaksanaan: status,
        tanggal_kegiatan:
          data.tanggal_kegiatan || new Date().toISOString().split('T')[0],
        no_spj_atau_bukti: data.no_spj_atau_bukti?.trim() || '-',
        keterangan: data.keterangan?.trim() || '',
        penanggung_jawab:
          data.penanggung_jawab?.trim() || 'Tim Kerja ZI BPS Sitaro',
        tahun: data.tahun || 2026
      };

      globalBudgetItems.push(newItem);
      revalidatePath('/rebo/budget');
      return { success: true, item: newItem };
    }
  } catch (error: any) {
    console.error('Error in saveBudgetItemAction:', error);
    return {
      success: false,
      error: error?.message || 'Gagal menyimpan data anggaran ZI'
    };
  }
}

/**
 * 3. Menghapus Item Anggaran ZI
 */
export async function deleteBudgetItemAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const index = globalBudgetItems.findIndex((i) => i.id === id);
    if (index === -1) {
      return { success: false, error: 'Data anggaran tidak ditemukan' };
    }

    globalBudgetItems.splice(index, 1);
    revalidatePath('/rebo/budget');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteBudgetItemAction:', error);
    return {
      success: false,
      error: error?.message || 'Gagal menghapus item anggaran'
    };
  }
}

/**
 * 4. Mereset ke Default Mock Data
 */
export async function resetBudgetToDefaultAction(): Promise<{
  success: boolean;
  data: ItemAnggaranZI[];
  summary: BudgetSummary;
  error?: string;
}> {
  try {
    globalBudgetItems = [
      ...DEFAULT_MOCK_BUDGET_ITEMS.map((item) => ({ ...item }))
    ];
    revalidatePath('/rebo/budget');
    return {
      success: true,
      data: globalBudgetItems,
      summary: calculateBudgetSummary(globalBudgetItems)
    };
  } catch (error: any) {
    console.error('Error in resetBudgetToDefaultAction:', error);
    return {
      success: false,
      data: [],
      summary: calculateBudgetSummary([]),
      error: error?.message || 'Gagal mereset data anggaran'
    };
  }
}
