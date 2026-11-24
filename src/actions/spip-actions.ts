/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  MatriksRisikoItem,
  MatriksRisikoSummary,
  TingkatRisiko,
  StatusPengendalian
} from '@/types/rebo';

// ==============================================================================
// DEFAULT REALISTIS: MATRIKS RISIKO PENGENDALIAN INTERN (SPIP) BPS SITARO
// (5 Area Rawan Utama: Pelayanan, PBJ, Honor Mitra, BMN, SKP/Kinerja)
// ==============================================================================

const DEFAULT_MATRIKS_RISIKO_LIST: MatriksRisikoItem[] = [
  {
    id: 'spip-sitaro-001',
    proses_bisnis: 'Pelayanan Statistik Terpadu (PST)',
    potensi_risiko:
      'Pemberian gratifikasi / tip oleh pengguna data untuk percepatan penyediaan data mikro atau tabulasi khusus di luar SOP PST.',
    tingkat_risiko: 'SEDANG',
    dampak_risiko:
      'Merusak citra integritas BPS Sitaro, timbul diskriminasi pelayanan publik, dan berpotensi menjadi temuan persepsi korupsi pada survei IPAK.',
    rencana_pengendalian:
      'Penerapan permohonan daring Si-Datu dan WhatsApp Bot PST, penandatanganan formulir kendali tolak gratifikasi, pengawasan CCTV di ruang PST, dan sosialisasi tarif resmi Rp 0 (Zero Pungli).',
    pic_pengendali: 'Koordinator Tim Pelayanan & Diseminasi Statistik',
    status_pengendalian: 'TERKENDALI',
    kategori_fraud: 'Gratifikasi',
    bukti_dukung_url: 'https://sitarokab.bps.go.id/pst-maklumat',
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-02-10T10:00:00Z'
  },
  {
    id: 'spip-sitaro-002',
    proses_bisnis: 'Pengadaan Barang & Jasa (PBJ)',
    potensi_risiko:
      'Benturan kepentingan atau persekongkolan dalam pemilihan penyedia jasa sewa transportasi laut/kapal antar-pulau (Siau-Tagulandang-Biaro) serta pengadaan ATK sensus/survei.',
    tingkat_risiko: 'TINGGI',
    dampak_risiko:
      'Ketidaksesuaian spesifikasi armada kapal/ATK lapangan, risiko kerugian keuangan negara, dan potensi temuan audit kepatuhan Inspektorat Wilayah (Irwil) BPS RI.',
    rencana_pengendalian:
      'Pemanfaatan penuh E-Katalog Lokal & Toko Daring LKPP, penandatanganan Pakta Integritas PPK dan Pokja Pemilihan, reviu berkala HPS oleh Tim Kepatuhan Internal, dan publikasi RUP pada SiRUP LKPP.',
    pic_pengendali: 'Pejabat Pembuat Komitmen (PPK) & Tim PBJ',
    status_pengendalian: 'TERKENDALI',
    kategori_fraud: 'Fraud Keuangan',
    bukti_dukung_url: 'https://sirup.lkpp.go.id',
    created_at: '2026-01-16T09:00:00Z',
    updated_at: '2026-02-12T14:20:00Z'
  },
  {
    id: 'spip-sitaro-003',
    proses_bisnis: 'Pembayaran Honor Mitra Statistik',
    potensi_risiko:
      'Keterlambatan verifikasi beban kerja atau pemotongan honor mitra sensus/survei di pulau terluar (Biaro, Tagulandang) oleh oknum perantara.',
    tingkat_risiko: 'SEDANG',
    dampak_risiko:
      'Demotivasi mitra statistik, distorsi kualitas pendataan di lapangan, dan komplain publik pada media sosial atau kanal pengaduan lapor.go.id.',
    rencana_pengendalian:
      'Mekanisme pembayaran honor non-tunai (transfer langsung via rekening bank resmi mitra), pencocokan Berita Acara Serah Terima (BAST) digital berbasis SOBAT BPS, konfirmasi SMS/WA blast nominal bersih penerimaan.',
    pic_pengendali: 'Bendahara Pengeluaran & Subbagian Umum',
    status_pengendalian: 'TERKENDALI',
    kategori_fraud: 'Pungli',
    bukti_dukung_url: 'https://mitra.bps.go.id',
    created_at: '2026-01-18T10:15:00Z',
    updated_at: '2026-02-15T11:45:00Z'
  },
  {
    id: 'spip-sitaro-004',
    proses_bisnis: 'Pengelolaan BMN (Barang Milik Negara)',
    potensi_risiko:
      'Penggunaan aset operasional (tablet CAPI survei, laptop dinas, genset kantor, kendaraan dinas) di luar kedinasan atau tanpa kartu kendali inventaris berkala.',
    tingkat_risiko: 'RENDAH',
    dampak_risiko:
      'Penyusutan fisik aset lebih cepat, risiko kehilangan peralatan survei elektronik bernilai tinggi, dan inefisiensi anggaran pemeliharaan.',
    rencana_pengendalian:
      'Digitalisasi kartu inventaris ruangan (KIR), penatausahaan BMN via aplikasi SAKTI & SIMAN Kemenkeu, Berita Acara Pinjam Pakai resmi gawai survei, dan stock opname fisik per triwulan.',
    pic_pengendali: 'Pengelola BMN & Kasubbag Umum',
    status_pengendalian: 'MONITORING_BERKALA',
    kategori_fraud: 'Penyalahgunaan Wewenang',
    bukti_dukung_url: 'https://siman.kemenkeu.go.id',
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-02-18T16:00:00Z'
  },
  {
    id: 'spip-sitaro-005',
    proses_bisnis: 'Penetapan Angka Kredit & Sasaran Kinerja (SKP)',
    potensi_risiko:
      'Subjektivitas penilai kinerja, ketidaksesuaian antara realisasi bukti fisik tugas dengan bukti dukung E-Kinerja BKN, serta keterlambatan evaluasi periodik.',
    tingkat_risiko: 'SEDANG',
    dampak_risiko:
      'Ketidakpuasan internal pegawai, perselisihan penilaian kinerja, dan penurunan objektivitas pembinaan karier ASN di lingkungan satker.',
    rencana_pengendalian:
      'Penyusunan matriks peran hasil (MPH) terukur, review berkala bulanan/triwulanan dialog kinerja, penggunaan bukti dukung digital sistem E-Kinerja BKN yang divalidasi atasan langsung secara objektif.',
    pic_pengendali:
      'Kepala BPS Kabupaten Kepulauan Sitaro & Tim Penilai Kinerja',
    status_pengendalian: 'DALAM_PROSES',
    kategori_fraud: 'Penyalahgunaan Wewenang',
    bukti_dukung_url: 'https://kinerja.bkn.go.id',
    created_at: '2026-01-22T13:30:00Z',
    updated_at: '2026-02-20T09:15:00Z'
  }
];

// In-memory fallback cache
let inMemoryMatriksRisikoList: MatriksRisikoItem[] = [
  ...DEFAULT_MATRIKS_RISIKO_LIST
];

/**
 * Server action: Ambil daftar matriks mitigasi risiko SPIP BPS Sitaro
 */
export async function getMatriksRisikoListAction(
  tingkatFilter?: string
): Promise<{ success: boolean; data: MatriksRisikoItem[]; error?: string }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('matriks_risiko_spip')
      .select('*')
      .order('tingkat_risiko', { ascending: false });

    if (tingkatFilter && tingkatFilter !== 'SEMUA') {
      query = query.eq('tingkat_risiko', tingkatFilter);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return { success: true, data: data as MatriksRisikoItem[] };
    }

    // Fallback to in-memory store
    let result = [...inMemoryMatriksRisikoList];
    if (tingkatFilter && tingkatFilter !== 'SEMUA') {
      result = result.filter((item) => item.tingkat_risiko === tingkatFilter);
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.warn(
      'Menggunakan fallback in-memory untuk matriks risiko SPIP:',
      err?.message
    );
    let result = [...inMemoryMatriksRisikoList];
    if (tingkatFilter && tingkatFilter !== 'SEMUA') {
      result = result.filter((item) => item.tingkat_risiko === tingkatFilter);
    }
    return { success: true, data: result };
  }
}

/**
 * Server action: Hitung ringkasan matriks risiko SPIP
 */
export async function getMatriksRisikoSummaryAction(): Promise<MatriksRisikoSummary> {
  const { data } = await getMatriksRisikoListAction();
  const list = data || inMemoryMatriksRisikoList;

  return {
    total: list.length,
    tinggi: list.filter((i) => i.tingkat_risiko === 'TINGGI').length,
    sedang: list.filter((i) => i.tingkat_risiko === 'SEDANG').length,
    rendah: list.filter((i) => i.tingkat_risiko === 'RENDAH').length,
    terkendali: list.filter((i) => i.status_pengendalian === 'TERKENDALI')
      .length,
    dalam_proses: list.filter((i) => i.status_pengendalian === 'DALAM_PROSES')
      .length,
    monitoring: list.filter(
      (i) => i.status_pengendalian === 'MONITORING_BERKALA'
    ).length
  };
}

/**
 * Server action: Tambah / Edit Butir Matriks Risiko SPIP
 */
export async function saveMatriksRisikoAction(
  item: Partial<MatriksRisikoItem>
): Promise<{ success: boolean; data?: MatriksRisikoItem; error?: string }> {
  try {
    const isNew = !item.id;
    const now = new Date().toISOString();

    const fullItem: MatriksRisikoItem = {
      id: item.id || `spip-sitaro-${Date.now()}`,
      proses_bisnis: item.proses_bisnis || 'Pelayanan Statistik Terpadu (PST)',
      potensi_risiko: item.potensi_risiko || '',
      tingkat_risiko: (item.tingkat_risiko as TingkatRisiko) || 'SEDANG',
      dampak_risiko: item.dampak_risiko || '',
      rencana_pengendalian: item.rencana_pengendalian || '',
      pic_pengendali: item.pic_pengendali || 'Tim SPIP BPS Sitaro',
      status_pengendalian:
        (item.status_pengendalian as StatusPengendalian) || 'TERKENDALI',
      bukti_dukung_url: item.bukti_dukung_url || '',
      kategori_fraud: item.kategori_fraud || 'Lainnya',
      created_at: item.created_at || now,
      updated_at: now
    };

    // Update in-memory fallback
    if (isNew) {
      inMemoryMatriksRisikoList.unshift(fullItem);
    } else {
      const idx = inMemoryMatriksRisikoList.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        inMemoryMatriksRisikoList[idx] = fullItem;
      } else {
        inMemoryMatriksRisikoList.unshift(fullItem);
      }
    }

    // Sync to Supabase if table exists
    try {
      const supabase = await createClient();
      if (isNew) {
        await supabase.from('matriks_risiko_spip').insert([fullItem]);
      } else {
        await supabase
          .from('matriks_risiko_spip')
          .update(fullItem)
          .eq('id', fullItem.id);
      }
    } catch (e: any) {
      console.warn('Supabase sync skipped (using in-memory):', e?.message);
    }

    revalidatePath('/rebo/informasi');
    return { success: true, data: fullItem };
  } catch (err: any) {
    console.error('Error saving matriks risiko:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan butir mitigasi risiko'
    };
  }
}

/**
 * Server action: Hapus Butir Matriks Risiko SPIP
 */
export async function deleteMatriksRisikoAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    inMemoryMatriksRisikoList = inMemoryMatriksRisikoList.filter(
      (item) => item.id !== id
    );

    try {
      const supabase = await createClient();
      await supabase.from('matriks_risiko_spip').delete().eq('id', id);
    } catch (e: any) {
      console.warn('Supabase delete skipped (using in-memory):', e?.message);
    }

    revalidatePath('/rebo/informasi');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal menghapus butir matriks risiko'
    };
  }
}
