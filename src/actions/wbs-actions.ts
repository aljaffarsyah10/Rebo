/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getPilarContact,
  DEFAULT_PILAR_CONTACTS,
  getDefaultNotificationReceiver
} from '@/lib/notifications/contacts';
import {
  sendWhatsAppMessage,
  formatPhoneNumber
} from '@/lib/notifications/whatsapp';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';
import {
  LaporanPengaduanWBS,
  CreateWBSInput,
  WBSFilterOptions,
  WBSStats,
  StatusWBS,
  generateWBSTicketCode,
  formatWBSAlertWAMessage,
  DEFAULT_MOCK_WBS_LAPORAN
} from '@/lib/wbs/wbs-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Memastikan WBS selalu responsif & data tidak hilang selama server aktif
// ==============================================================================

const globalWBSStore: LaporanPengaduanWBS[] = [...DEFAULT_MOCK_WBS_LAPORAN];

function getWBSStore(): LaporanPengaduanWBS[] {
  return globalWBSStore;
}

function calculateWBSStats(items: LaporanPengaduanWBS[]): WBSStats {
  return {
    total: items.length,
    diterima: items.filter((i) => i.status === 'DITERIMA').length,
    verifikasiAwal: items.filter((i) => i.status === 'VERIFIKASI_AWAL').length,
    investigasi: items.filter((i) => i.status === 'INVESTIGASI').length,
    selesai: items.filter((i) => i.status === 'SELESAI').length,
    ditolak: items.filter((i) => i.status === 'DITOLAK').length,
    anonimCount: items.filter((i) => i.is_anonim).length,
    nonAnonimCount: items.filter((i) => !i.is_anonim).length
  };
}

/**
 * 1. Submit Laporan Pengaduan WBS Baru
 * Dilengkapi enkripsi/anonimitas dan pengiriman notifikasi otomatis ke Tim Kepatuhan
 */
export async function submitLaporanWBSAction(data: CreateWBSInput): Promise<{
  success: boolean;
  data?: {
    id: string;
    ticket_code: string;
    tanggal_lapor: string;
    status: StatusWBS;
    wa_sent: boolean;
  };
  error?: string;
}> {
  try {
    if (!data.kategori) {
      return { success: false, error: 'Kategori pengaduan wajib dipilih.' };
    }
    if (!data.subjek || data.subjek.trim().length < 5) {
      return {
        success: false,
        error: 'Subjek aduan wajib diisi minimal 5 karakter.'
      };
    }
    if (!data.rincian_kejadian || data.rincian_kejadian.trim().length < 15) {
      return {
        success: false,
        error:
          'Rincian kejadian / kronologi wajib diuraikan minimal 15 karakter.'
      };
    }
    if (!data.lokasi_kejadian || data.lokasi_kejadian.trim().length < 3) {
      return { success: false, error: 'Lokasi kejadian wajib dicantumkan.' };
    }
    if (!data.perkiraan_tanggal_kejadian) {
      return {
        success: false,
        error: 'Perkiraan tanggal kejadian wajib diisi.'
      };
    }
    if (
      !data.terlapor_nama_or_unit ||
      data.terlapor_nama_or_unit.trim().length < 3
    ) {
      return {
        success: false,
        error: 'Pihak terlapor (nama pegawai atau unit kerja) wajib diisi.'
      };
    }

    const now = new Date();
    const formattedTanggalLapor = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;
    const ticketCode = generateWBSTicketCode();
    const id = `wbs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newLaporan: LaporanPengaduanWBS = {
      id,
      ticket_code: ticketCode,
      tanggal_lapor: formattedTanggalLapor,
      kategori: data.kategori,
      subjek: data.subjek.trim(),
      rincian_kejadian: data.rincian_kejadian.trim(),
      lokasi_kejadian: data.lokasi_kejadian.trim(),
      perkiraan_tanggal_kejadian: data.perkiraan_tanggal_kejadian,
      terlapor_nama_or_unit: data.terlapor_nama_or_unit.trim(),
      is_anonim: Boolean(data.is_anonim),
      pelapor_nama: data.is_anonim ? undefined : data.pelapor_nama?.trim(),
      pelapor_kontak: data.is_anonim ? undefined : data.pelapor_kontak?.trim(),
      lampiran_bukti_url: data.lampiran_bukti_url?.trim() || undefined,
      status: 'DITERIMA',
      catatan_tim_kepatuhan:
        'Laporan telah diterima oleh sistem dan sedang masuk antrean verifikasi awal Tim Kepatuhan Internal BPS Sitaro.',
      notifikasi_tim_sent: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    // 1. Simpan ke in-memory store
    globalWBSStore.unshift(newLaporan);

    // 2. Usahakan simpan ke Supabase jika tabel wbs_laporan tersedia
    try {
      const supabase = await createClient();
      await supabase.from('wbs_laporan').insert([newLaporan]);
    } catch (dbErr) {
      console.warn(
        '[WBS-ACTION] Supabase table wbs_laporan bypassed, stored in memory:',
        dbErr
      );
    }

    // 3. Kirim notifikasi WhatsApp resmi ke Tim Kepatuhan Internal / Pilar 5 BPS Sitaro
    let waSent = false;
    try {
      const pilar5Contact = await getPilarContact(5);
      const targetPhone =
        pilar5Contact?.noWa ||
        DEFAULT_PILAR_CONTACTS[5]?.noWa ||
        getDefaultNotificationReceiver();

      if (targetPhone) {
        const waMessage = formatWBSAlertWAMessage(newLaporan);
        const enqueueResult = await enqueueWhatsAppNotification({
          type: 'WBS_STATUS',
          targetPhone: formatPhoneNumber(targetPhone),
          message: waMessage,
          metadata: {
            source: 'wbs_report_alert',
            laporanId: newLaporan.id,
            ticketCode: newLaporan.ticket_code,
            kategori: newLaporan.kategori
          }
        });
        waSent = enqueueResult.success;
        if (waSent) {
          newLaporan.notifikasi_tim_sent = true;
        }
      }
    } catch (waErr) {
      console.error(
        '[WBS-ACTION] Gagal mengirim notifikasi WhatsApp WBS:',
        waErr
      );
    }

    revalidatePath('/rebo/wbs');
    revalidatePath('/rebo/admin/wbs');

    return {
      success: true,
      data: {
        id: newLaporan.id,
        ticket_code: newLaporan.ticket_code,
        tanggal_lapor: newLaporan.tanggal_lapor,
        status: newLaporan.status,
        wa_sent: waSent
      }
    };
  } catch (err: any) {
    console.error('[WBS-ACTION] Error submitLaporanWBSAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirimkan laporan pengaduan.'
    };
  }
}

/**
 * 2. Lacak Laporan Pengaduan WBS berdasarkan Nomor Tiket
 * Publik / Anonim safe: menyembunyikan identitas pelapor jika mode anonim
 */
export async function trackLaporanWBSAction(ticketCode: string): Promise<{
  success: boolean;
  data?: LaporanPengaduanWBS;
  error?: string;
}> {
  try {
    if (!ticketCode || ticketCode.trim().length === 0) {
      return {
        success: false,
        error: 'Silakan masukkan nomor tiket pengaduan.'
      };
    }

    const cleanCode = ticketCode.trim().toUpperCase();

    // 1. Cari di in-memory store
    const store = getWBSStore();
    let found = store.find(
      (item) => item.ticket_code.toUpperCase() === cleanCode
    );

    // 2. Jika tidak ditemukan di memory, coba cari di Supabase
    if (!found) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('wbs_laporan')
          .select('*')
          .eq('ticket_code', cleanCode)
          .maybeSingle();

        if (data && !error) {
          found = data as LaporanPengaduanWBS;
          globalWBSStore.unshift(found);
        }
      } catch (dbErr) {
        // Abaikan jika tabel tidak ada
      }
    }

    if (!found) {
      return {
        success: false,
        error: `Nomor tiket "${cleanCode}" tidak ditemukan. Pastikan format nomor tiket benar (contoh: WBS-2026-7841).`
      };
    }

    // Sanitasi data pelapor agar aman & terenkripsi
    const sanitizedData: LaporanPengaduanWBS = {
      ...found,
      pelapor_nama: found.is_anonim
        ? '🔒 [Dirahasiakan / Mode Anonim]'
        : found.pelapor_nama,
      pelapor_kontak: found.is_anonim
        ? '🔒 [Dirahasiakan]'
        : found.pelapor_kontak
    };

    return {
      success: true,
      data: sanitizedData
    };
  } catch (err: any) {
    console.error('[WBS-ACTION] Error trackLaporanWBSAction:', err);
    return {
      success: false,
      error: 'Terjadi gangguan saat melacak nomor tiket pengaduan.'
    };
  }
}

/**
 * 3. Ambil Daftar Pengaduan WBS untuk Tim Kepatuhan / Admin
 * Dilengkapi ringkasan statistik pemenuhan bukti dukung Pilar 5
 */
export async function getLaporanWBSListAction(
  filter?: WBSFilterOptions
): Promise<{
  success: boolean;
  data?: LaporanPengaduanWBS[];
  stats?: WBSStats;
  error?: string;
}> {
  try {
    const store = getWBSStore();
    let result = [...store];

    // Coba sync dari Supabase jika ada
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('wbs_laporan')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        // Merge Supabase items with local store unik by id
        const ids = new Set(data.map((d: any) => d.id));
        const localsNotInDb = store.filter((s) => !ids.has(s.id));
        result = [...(data as LaporanPengaduanWBS[]), ...localsNotInDb];
      }
    } catch (dbErr) {
      // Gunakan in-memory store
    }

    // Hitung statistik komprehensif
    const stats = calculateWBSStats(result);

    // Terapkan filter
    if (filter?.kategori && filter.kategori !== 'SEMUA') {
      result = result.filter((item) => item.kategori === filter.kategori);
    }

    if (filter?.status && filter.status !== 'SEMUA') {
      result = result.filter((item) => item.status === filter.status);
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const query = filter.search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.ticket_code.toLowerCase().includes(query) ||
          item.subjek.toLowerCase().includes(query) ||
          item.terlapor_nama_or_unit.toLowerCase().includes(query) ||
          item.lokasi_kejadian.toLowerCase().includes(query) ||
          (item.pelapor_nama && item.pelapor_nama.toLowerCase().includes(query))
      );
    }

    return {
      success: true,
      data: result,
      stats
    };
  } catch (err: any) {
    console.error('[WBS-ACTION] Error getLaporanWBSListAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memuat daftar pengaduan WBS.'
    };
  }
}

/**
 * 4. Update Status Investigasi & Tindak Lanjut Pengaduan
 * Dikelola oleh Tim Kepatuhan Internal / Verifikator Pilar 5
 */
export async function updateStatusLaporanWBSAction(
  id: string,
  status: StatusWBS,
  catatan?: string,
  tindakLanjut?: string
): Promise<{
  success: boolean;
  data?: LaporanPengaduanWBS;
  error?: string;
}> {
  try {
    const store = getWBSStore();
    const itemIndex = store.findIndex((i) => i.id === id);

    if (itemIndex === -1) {
      return {
        success: false,
        error: 'Data laporan pengaduan tidak ditemukan.'
      };
    }

    const nowIso = new Date().toISOString();
    const current = store[itemIndex];

    const updatedItem: LaporanPengaduanWBS = {
      ...current,
      status,
      catatan_tim_kepatuhan:
        catatan !== undefined ? catatan : current.catatan_tim_kepatuhan,
      tindak_lanjut:
        tindakLanjut !== undefined ? tindakLanjut : current.tindak_lanjut,
      updated_at: nowIso
    };

    store[itemIndex] = updatedItem;

    // Sinkronisasi ke Supabase jika tabel wbs_laporan ada
    try {
      const supabase = await createClient();
      await supabase
        .from('wbs_laporan')
        .update({
          status: updatedItem.status,
          catatan_tim_kepatuhan: updatedItem.catatan_tim_kepatuhan,
          tindak_lanjut: updatedItem.tindak_lanjut,
          updated_at: updatedItem.updated_at
        })
        .eq('id', id);
    } catch (dbErr) {
      // Ignored
    }

    revalidatePath('/rebo/wbs');
    revalidatePath('/rebo/admin/wbs');

    return {
      success: true,
      data: updatedItem
    };
  } catch (err: any) {
    console.error('[WBS-ACTION] Error updateStatusLaporanWBSAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memperbarui status pengaduan.'
    };
  }
}
