/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import {
  LaporanGratifikasi,
  UPGSummary,
  StatusVerifikasiUPG,
  DEFAULT_MOCK_LAPORAN_GRATIFIKASI,
  calculateUPGSummary
} from '@/lib/compliance/upg-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Menyimpan laporan pengendalian gratifikasi selama server runtime berjalan
// ==============================================================================
let globalLaporanList: LaporanGratifikasi[] = [
  ...DEFAULT_MOCK_LAPORAN_GRATIFIKASI
];

export interface UPGFilterParams {
  jenis?: string;
  status?: string;
  search?: string;
  tahun?: number;
}

/**
 * 1. Mengambil Daftar Laporan Pengendalian Gratifikasi & Ringkasan Metrik
 */
export async function getUPGReportListAction(
  filter?: UPGFilterParams
): Promise<{
  success: boolean;
  data: LaporanGratifikasi[];
  summary: UPGSummary;
  error?: string;
}> {
  try {
    const tahun = filter?.tahun || 2026;
    let list = [...globalLaporanList];

    if (filter?.jenis && filter.jenis !== 'ALL') {
      list = list.filter((item) => item.jenis_laporan === filter.jenis);
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((item) => item.status_verifikasi === filter.status);
    }

    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.nomor_registrasi.toLowerCase().includes(q) ||
          item.nama_pelapor.toLowerCase().includes(q) ||
          item.nip_pelapor.toLowerCase().includes(q) ||
          item.pemberi_nama.toLowerCase().includes(q) ||
          item.pemberi_instansi_or_hubungan.toLowerCase().includes(q) ||
          item.peristiwa_kegiatan.toLowerCase().includes(q) ||
          item.kronologi_penolakan_atau_penerimaan.toLowerCase().includes(q)
      );
    }

    // Urutkan dari tanggal pelaporan terbaru
    list.sort(
      (a, b) =>
        new Date(b.tanggal_pelaporan).getTime() -
        new Date(a.tanggal_pelaporan).getTime()
    );

    const summary = calculateUPGSummary(globalLaporanList, tahun);

    return {
      success: true,
      data: list,
      summary
    };
  } catch (err: any) {
    console.error('[UPG] Gagal mengambil daftar laporan:', err);
    return {
      success: false,
      data: [],
      summary: calculateUPGSummary(globalLaporanList, 2026),
      error: err?.message || 'Gagal memuat data laporan gratifikasi'
    };
  }
}

/**
 * 2. Submit Formulir Mandiri Pelaporan Penolakan / Penerimaan Gratifikasi oleh Pegawai
 */
export async function submitLaporanGratifikasiAction(
  input: Omit<
    LaporanGratifikasi,
    | 'id'
    | 'nomor_registrasi'
    | 'status_verifikasi'
    | 'catatan_tim_upg'
    | 'created_at'
  >
): Promise<{
  success: boolean;
  data?: LaporanGratifikasi;
  summary?: UPGSummary;
  error?: string;
}> {
  try {
    const year = new Date().getFullYear();
    const count = globalLaporanList.length + 1;
    const seq = String(count).padStart(3, '0');
    const nomor_registrasi = `UPG-7108-${year}-${seq}`;

    const newReport: LaporanGratifikasi = {
      ...input,
      id: `upg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nomor_registrasi,
      status_verifikasi: 'MENUNGGU_VERIFIKASI',
      catatan_tim_upg:
        'Laporan telah berhasil didaftarkan dalam sistem UPG BPS Sitaro. Menunggu verifikasi kelengkapan bukti oleh Tim Kepatuhan Internal.',
      created_at: new Date().toISOString()
    };

    globalLaporanList = [newReport, ...globalLaporanList];

    revalidatePath('/rebo/compliance/upg');

    const summary = calculateUPGSummary(globalLaporanList, year);

    return {
      success: true,
      data: newReport,
      summary
    };
  } catch (err: any) {
    console.error('[UPG] Gagal submit laporan gratifikasi:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan formulir pelaporan gratifikasi'
    };
  }
}

/**
 * 3. Verifikasi & Disposisi Tindak Lanjut oleh Tim Kepatuhan Internal / UPG Satker
 */
export async function verifyLaporanGratifikasiAction(
  id: string,
  status: StatusVerifikasiUPG,
  catatan: string,
  noSuratKPK?: string,
  tanggalRekonsiliasi?: string
): Promise<{
  success: boolean;
  data?: LaporanGratifikasi;
  summary?: UPGSummary;
  error?: string;
}> {
  try {
    const index = globalLaporanList.findIndex((item) => item.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Laporan gratifikasi tidak ditemukan'
      };
    }

    const current = globalLaporanList[index];
    const updated: LaporanGratifikasi = {
      ...current,
      status_verifikasi: status,
      catatan_tim_upg: catatan || current.catatan_tim_upg,
      nomor_surat_rekonsiliasi_kpk:
        noSuratKPK !== undefined
          ? noSuratKPK
          : current.nomor_surat_rekonsiliasi_kpk,
      tanggal_rekonsiliasi:
        tanggalRekonsiliasi !== undefined
          ? tanggalRekonsiliasi
          : current.tanggal_rekonsiliasi
    };

    globalLaporanList[index] = updated;

    revalidatePath('/rebo/compliance/upg');

    const year = new Date().getFullYear();
    const summary = calculateUPGSummary(globalLaporanList, year);

    return {
      success: true,
      data: updated,
      summary
    };
  } catch (err: any) {
    console.error('[UPG] Gagal memverifikasi laporan gratifikasi:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan verifikasi tim UPG'
    };
  }
}

/**
 * 4. Menyusun Rekapitulasi Semesteran untuk Rekonsiliasi KPK RI
 */
export async function generateRekonsiliasiKPKAction(
  semester: number = 1,
  tahun: number = 2026
): Promise<{
  success: boolean;
  nomor_surat: string;
  tanggal_surat: string;
  semester: number;
  tahun: number;
  summary: UPGSummary;
  items: LaporanGratifikasi[];
  pejabat_penandatangan: {
    nama: string;
    nip: string;
    jabatan: string;
  };
  error?: string;
}> {
  try {
    const nomor_surat = `B-${semester === 1 ? '185' : '390'}/71080/PW.120/${semester === 1 ? '06' : '12'}/${tahun}`;
    const tanggal_surat = semester === 1 ? `${tahun}-06-30` : `${tahun}-12-15`;

    const summary = calculateUPGSummary(globalLaporanList, tahun);

    return {
      success: true,
      nomor_surat,
      tanggal_surat,
      semester,
      tahun,
      summary,
      items: globalLaporanList,
      pejabat_penandatangan: {
        nama: 'Inke Margareth Tambeo, SST., M.Ec.Dev.',
        nip: '198403232007012003',
        jabatan: 'Kepala Badan Pusat Statistik Kabupaten Kepulauan Sitaro'
      }
    };
  } catch (err: any) {
    console.error('[UPG] Gagal membuat data rekonsiliasi KPK:', err);
    return {
      success: false,
      nomor_surat: '',
      tanggal_surat: '',
      semester,
      tahun,
      summary: calculateUPGSummary([], tahun),
      items: [],
      pejabat_penandatangan: {
        nama: '',
        nip: '',
        jabatan: ''
      },
      error: err?.message || 'Gagal menyusun rekapitulasi rekonsiliasi KPK'
    };
  }
}
