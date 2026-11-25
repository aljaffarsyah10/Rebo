/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import {
  DisiplinASNSummary,
  CatatanDisiplinItem,
  DEFAULT_MOCK_DISIPLIN_SUMMARY,
  DEFAULT_MOCK_CATATAN_DISIPLIN,
  validateDisiplinNihil
} from '@/lib/compliance/disiplin-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Mempertahankan status disiplin & riwayat pembinaan real-time pada sesi server
// ==============================================================================
let globalDisiplinSummary: DisiplinASNSummary = {
  ...DEFAULT_MOCK_DISIPLIN_SUMMARY
};

let globalCatatanDisiplin: CatatanDisiplinItem[] = [
  ...DEFAULT_MOCK_CATATAN_DISIPLIN
];

/**
 * 1. Mengambil Rekapitulasi Disiplin & Riwayat Pembinaan ASN
 */
export async function getDisiplinSummaryAction(tahun: number = 2026): Promise<{
  success: boolean;
  summary: DisiplinASNSummary;
  catatan: CatatanDisiplinItem[];
  validation: { isEligibleWBK: boolean; alasan: string };
  error?: string;
}> {
  try {
    const summary = {
      ...globalDisiplinSummary,
      tahun: tahun || globalDisiplinSummary.tahun
    };

    const validation = validateDisiplinNihil(summary);

    return {
      success: true,
      summary,
      catatan: [...globalCatatanDisiplin],
      validation
    };
  } catch (err: any) {
    console.error('[Disiplin] Gagal mengambil data disiplin:', err);
    return {
      success: false,
      summary: globalDisiplinSummary,
      catatan: [],
      validation: validateDisiplinNihil(globalDisiplinSummary),
      error: err?.message || 'Gagal mengambil data disiplin ASN'
    };
  }
}

/**
 * 2. Update Data Surat Keterangan Bebas Hukdis & Informasi Pejabat Penandatangan
 */
export async function saveDisiplinSummaryAction(
  data: Partial<DisiplinASNSummary>
): Promise<{
  success: boolean;
  summary?: DisiplinASNSummary;
  error?: string;
}> {
  try {
    if (
      !data.nomor_surat_keterangan_nihil ||
      data.nomor_surat_keterangan_nihil.trim().length === 0
    ) {
      return {
        success: false,
        error: 'Nomor Surat Keterangan Nihil Hukdis wajib diisi.'
      };
    }

    if (
      !data.pejabat_penandatangan ||
      data.pejabat_penandatangan.trim().length === 0
    ) {
      return {
        success: false,
        error: 'Nama Pejabat Penandatangan wajib diisi.'
      };
    }

    // Perhitungan status nihil
    const hukumanSedang =
      data.hukuman_sedang_count ?? globalDisiplinSummary.hukuman_sedang_count;
    const hukumanBerat =
      data.hukuman_berat_count ?? globalDisiplinSummary.hukuman_berat_count;
    const isNihil = hukumanSedang === 0 && hukumanBerat === 0;

    globalDisiplinSummary = {
      ...globalDisiplinSummary,
      ...data,
      status_nihil_hukuman_sedang_berat: isNihil,
      updated_at: new Date().toISOString()
    };

    revalidatePath('/rebo/compliance/disiplin');

    return {
      success: true,
      summary: { ...globalDisiplinSummary }
    };
  } catch (err: any) {
    console.error('[Disiplin] Gagal menyimpan data surat keterangan:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan perubahan surat keterangan'
    };
  }
}

/**
 * 3. Menambah Riwayat Kegiatan Pembinaan Kode Etik & Disiplin ASN
 */
export async function addCatatanPembinaanAction(
  data: Omit<CatatanDisiplinItem, 'id'>
): Promise<{
  success: boolean;
  item?: CatatanDisiplinItem;
  catatan?: CatatanDisiplinItem[];
  error?: string;
}> {
  try {
    if (!data.judul || data.judul.trim().length === 0) {
      return {
        success: false,
        error: 'Judul kegiatan pembinaan disiplin wajib diisi.'
      };
    }

    if (!data.tanggal) {
      return {
        success: false,
        error: 'Tanggal pelaksanaan kegiatan wajib diisi.'
      };
    }

    if (!data.nomor_dokumen || data.nomor_dokumen.trim().length === 0) {
      return {
        success: false,
        error: 'Nomor dokumen / notula / surat tugas wajib diisi.'
      };
    }

    const newItem: CatatanDisiplinItem = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tanggal: data.tanggal,
      kategori: data.kategori || 'PEMBINAAN_APEL',
      judul: data.judul.trim(),
      deskripsi: data.deskripsi?.trim() || '',
      tindak_lanjut: data.tindak_lanjut?.trim() || '',
      nomor_dokumen: data.nomor_dokumen.trim(),
      lampiran_url: data.lampiran_url?.trim() || ''
    };

    // Tambah ke urutan paling atas
    globalCatatanDisiplin = [newItem, ...globalCatatanDisiplin];

    revalidatePath('/rebo/compliance/disiplin');

    return {
      success: true,
      item: newItem,
      catatan: [...globalCatatanDisiplin]
    };
  } catch (err: any) {
    console.error('[Disiplin] Gagal menambahkan catatan pembinaan:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menambahkan catatan pembinaan disiplin'
    };
  }
}
