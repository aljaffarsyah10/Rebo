/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  type PengumumanBroadcast,
  type BroadcastFilterParams,
  type BroadcastActionResult,
  DEFAULT_BROADCAST_LIST,
  formatBroadcastWAMessage
} from '@/lib/broadcast/broadcast-types';
import {
  getAllContacts,
  type KontakPilarRecord
} from '@/lib/notifications/contacts';
import {
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';

// In-memory cache untuk fallback jika tabel database pengumuman_broadcast belum terpasang
let inMemoryBroadcastList: PengumumanBroadcast[] = [
  ...DEFAULT_BROADCAST_LIST.map((item) => ({ ...item }))
];

/**
 * Mengambil seluruh daftar pengumuman broadcast dengan filter opsional
 */
export async function getBroadcastListAction(
  filter?: BroadcastFilterParams
): Promise<BroadcastActionResult<PengumumanBroadcast[]>> {
  try {
    let items: PengumumanBroadcast[] = [];

    try {
      const supabase = await createClient();
      const { data: dbData, error } = await supabase
        .from('pengumuman_broadcast')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !dbData || dbData.length === 0) {
        items = [...inMemoryBroadcastList];
      } else {
        items = dbData as PengumumanBroadcast[];
        inMemoryBroadcastList = [...items];
      }
    } catch {
      items = [...inMemoryBroadcastList];
    }

    // Hitung statistik
    const totalBroadcast = items.length;
    let activeBannerCount = 0;
    let totalWaSent = 0;
    let totalTargetAudience = 0;

    items.forEach((bc) => {
      if (bc.is_active_banner) activeBannerCount++;
      totalWaSent += bc.wa_sent_count || 0;
      totalTargetAudience += bc.total_target_count || 0;
    });

    // Terapkan filter jika ada
    let filtered = [...items];

    if (filter?.tipe && filter.tipe !== 'SEMUA') {
      filtered = filtered.filter((i) => i.tipe === filter.tipe);
    }

    if (filter?.target && filter.target !== 'SEMUA') {
      filtered = filtered.filter((i) => i.target_audiens === filter.target);
    }

    if (filter?.activeOnly) {
      filtered = filtered.filter((i) => i.is_active_banner);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.judul.toLowerCase().includes(q) ||
          i.isi_pesan.toLowerCase().includes(q) ||
          i.pengirim_nama.toLowerCase().includes(q) ||
          i.pengirim_jabatan.toLowerCase().includes(q)
      );
    }

    // Urutkan waktu dibuat terbaru ke terlama
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      success: true,
      data: filtered,
      stats: {
        totalBroadcast,
        activeBannerCount,
        totalWaSent,
        totalTargetAudience
      }
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[BROADCAST-ACTIONS] getBroadcastListAction error:', error);
    return {
      success: false,
      data: inMemoryBroadcastList,
      error: error.message || 'Gagal memuat daftar siaran pengumuman.'
    };
  }
}

/**
 * Mengambil pengumuman banner aktif untuk ditampilkan di Beranda REBO
 */
export async function getActiveBannerPengumumanAction(): Promise<
  BroadcastActionResult<PengumumanBroadcast | null>
> {
  try {
    const listRes = await getBroadcastListAction();
    const list = listRes.data || [];

    // Filter yang is_active_banner === true dan masa berlakunya masih aktif hari ini
    const todayStr = new Date().toISOString().split('T')[0];

    const activeList = list.filter((item) => {
      if (!item.is_active_banner) return false;
      if (item.berlaku_sampai && item.berlaku_sampai < todayStr) return false;
      return true;
    });

    if (activeList.length === 0) {
      // Jika tidak ada yang strictly belum kadaluarsa, ambil yang is_active_banner saja
      const fallbackActive = list.find((item) => item.is_active_banner) || null;
      return {
        success: true,
        data: fallbackActive
      };
    }

    // Ambil yang paling baru dibuat
    return {
      success: true,
      data: activeList[0]
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(
      '[BROADCAST-ACTIONS] getActiveBannerPengumumanAction error:',
      error
    );
    return {
      success: false,
      data: null,
      error: error.message || 'Gagal memeriksa status banner pengumuman.'
    };
  }
}

/**
 * Membuat pengumuman baru atau memperbarui pengumuman yang ada
 */
export async function saveBroadcastAction(
  data: Partial<PengumumanBroadcast>
): Promise<BroadcastActionResult<PengumumanBroadcast>> {
  try {
    const isEdit = Boolean(data.id && data.id.trim());
    const now = new Date().toISOString();

    // Hitung perkiraan jumlah target audiens
    let estimatedTargetCount = 8;
    if (data.target_audiens === 'KOORDINATOR_PILAR') {
      estimatedTargetCount = 6;
    } else if (data.target_audiens === 'VERIFIKATOR') {
      estimatedTargetCount = 2;
    } else if (data.target_audiens === 'PILAR_TERTENTU') {
      estimatedTargetCount = 1;
    }

    const payload: PengumumanBroadcast = {
      id: data.id || `bc-${Date.now()}`,
      judul: data.judul?.trim() || 'Pengumuman Penting Pimpinan',
      isi_pesan: data.isi_pesan?.trim() || '',
      tipe: data.tipe || 'ARAHAN_PIMPINAN',
      target_audiens: data.target_audiens || 'SEMUA_TIM',
      target_pilar_id: data.target_pilar_id || null,
      pengirim_nama: data.pengirim_nama?.trim() || 'Kepala BPS Sitaro',
      pengirim_jabatan:
        data.pengirim_jabatan?.trim() ||
        'Kepala BPS Kabupaten Kepulauan Sitaro',
      berlaku_sampai:
        data.berlaku_sampai ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      is_active_banner: data.is_active_banner ?? true,
      wa_broadcast_status: data.wa_broadcast_status || 'BELUM_DIKIRIM',
      wa_sent_count: data.wa_sent_count ?? 0,
      total_target_count: data.total_target_count || estimatedTargetCount,
      created_at: data.created_at || now,
      updated_at: now
    };

    // Jika banner diaktifkan, kita bisa menonaktifkan banner lain jika ingin single active banner
    if (payload.is_active_banner) {
      inMemoryBroadcastList = inMemoryBroadcastList.map((item) =>
        item.id === payload.id ? item : { ...item, is_active_banner: false }
      );
    }

    let savedItem: PengumumanBroadcast = payload;

    try {
      const supabase = await createClient();
      if (payload.is_active_banner) {
        // Matikan banner lain di database
        await supabase
          .from('pengumuman_broadcast')
          .update({ is_active_banner: false })
          .neq('id', payload.id);
      }

      const { data: dbResult, error } = await supabase
        .from('pengumuman_broadcast')
        .upsert(payload)
        .select()
        .single();

      if (!error && dbResult) {
        savedItem = dbResult as PengumumanBroadcast;
      }
    } catch {
      // Gunakan in-memory
    }

    // Update in-memory cache
    if (isEdit) {
      inMemoryBroadcastList = inMemoryBroadcastList.map((item) =>
        item.id === savedItem.id ? savedItem : item
      );
    } else {
      inMemoryBroadcastList.unshift(savedItem);
    }

    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/admin/broadcast');

    return {
      success: true,
      data: savedItem,
      message: isEdit
        ? 'Pengumuman broadcast berhasil diperbarui.'
        : 'Pengumuman broadcast baru berhasil disimpan.'
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[BROADCAST-ACTIONS] saveBroadcastAction error:', error);
    return {
      success: false,
      error: error.message || 'Gagal menyimpan pengumuman broadcast.'
    };
  }
}

/**
 * Mengubah status banner aktif / nonaktif untuk pengumuman tertentu
 */
export async function toggleBannerStatusAction(
  id: string,
  isActive: boolean
): Promise<BroadcastActionResult<PengumumanBroadcast>> {
  try {
    const target = inMemoryBroadcastList.find((b) => b.id === id);
    if (!target) {
      return { success: false, error: 'Pengumuman tidak ditemukan.' };
    }

    // Jika isActive true, nonaktifkan banner lain
    inMemoryBroadcastList = inMemoryBroadcastList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          is_active_banner: isActive,
          updated_at: new Date().toISOString()
        };
      }
      return isActive ? { ...item, is_active_banner: false } : item;
    });

    const updated = inMemoryBroadcastList.find((b) => b.id === id)!;

    try {
      const supabase = await createClient();
      if (isActive) {
        await supabase
          .from('pengumuman_broadcast')
          .update({ is_active_banner: false })
          .neq('id', id);
      }

      await supabase
        .from('pengumuman_broadcast')
        .update({
          is_active_banner: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch {
      // Fallback in-memory
    }

    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/admin/broadcast');

    return {
      success: true,
      data: updated,
      message: isActive
        ? 'Banner pengumuman pimpinan berhasil diaktifkan di Beranda.'
        : 'Banner pengumuman berhasil dinonaktifkan dari Beranda.'
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[BROADCAST-ACTIONS] toggleBannerStatusAction error:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengubah status banner.'
    };
  }
}

/**
 * Menghapus pengumuman broadcast
 */
export async function deleteBroadcastAction(
  id: string
): Promise<BroadcastActionResult<boolean>> {
  try {
    inMemoryBroadcastList = inMemoryBroadcastList.filter(
      (item) => item.id !== id
    );

    try {
      const supabase = await createClient();
      await supabase.from('pengumuman_broadcast').delete().eq('id', id);
    } catch {
      // Fallback in-memory
    }

    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/admin/broadcast');

    return {
      success: true,
      data: true,
      message: 'Pengumuman broadcast berhasil dihapus.'
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[BROADCAST-ACTIONS] deleteBroadcastAction error:', error);
    return {
      success: false,
      data: false,
      error: error.message || 'Gagal menghapus pengumuman broadcast.'
    };
  }
}

/**
 * Mengirimkan siaran pesan WhatsApp ke target audiens
 */
export async function dispatchWABroadcastAction(
  id: string
): Promise<BroadcastActionResult<{ sentCount: number; targetCount: number }>> {
  try {
    const broadcast = inMemoryBroadcastList.find((b) => b.id === id);
    if (!broadcast) {
      return { success: false, error: 'Data pengumuman tidak ditemukan.' };
    }

    // Ambil daftar kontak
    const allContacts = await getAllContacts();

    // Saring kontak sesuai target_audiens
    let targetContacts: KontakPilarRecord[] = [];

    if (broadcast.target_audiens === 'SEMUA_TIM') {
      targetContacts = allContacts.filter((c) => c.is_active);
    } else if (broadcast.target_audiens === 'KOORDINATOR_PILAR') {
      targetContacts = allContacts.filter(
        (c) => c.is_active && c.id_pilar !== null
      );
    } else if (broadcast.target_audiens === 'VERIFIKATOR') {
      targetContacts = allContacts.filter(
        (c) =>
          c.is_active && (c.kategori === 'VERIFIKATOR' || c.id_pilar === null)
      );
    } else if (broadcast.target_audiens === 'PILAR_TERTENTU') {
      const targetPilarNum = Number(broadcast.target_pilar_id || '1');
      targetContacts = allContacts.filter(
        (c) => c.is_active && c.id_pilar === targetPilarNum
      );
    }

    if (targetContacts.length === 0) {
      return {
        success: false,
        error:
          'Tidak ada kontak penerima aktif yang cocok dengan target audiens.'
      };
    }

    let successCount = 0;
    let failCount = 0;

    // Kirim pesan WhatsApp ke setiap penerima
    for (const contact of targetContacts) {
      const waMsg = formatBroadcastWAMessage(broadcast, contact.nama_pic);
      const res = await sendWhatsAppMessage({
        phone: contact.no_wa,
        message: waMsg
      });

      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    const newStatus =
      successCount === targetContacts.length
        ? 'SUKSES_SEMUA'
        : successCount > 0
          ? 'SEBAGIAN_TERKIRIM'
          : 'GAGAL';

    // Perbarui status pengumuman
    const updatedItem: PengumumanBroadcast = {
      ...broadcast,
      wa_broadcast_status: newStatus,
      wa_sent_count: successCount,
      total_target_count: targetContacts.length,
      updated_at: new Date().toISOString()
    };

    inMemoryBroadcastList = inMemoryBroadcastList.map((item) =>
      item.id === id ? updatedItem : item
    );

    try {
      const supabase = await createClient();
      await supabase
        .from('pengumuman_broadcast')
        .update({
          wa_broadcast_status: newStatus,
          wa_sent_count: successCount,
          total_target_count: targetContacts.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch {
      // Fallback in-memory
    }

    // Buat deep link WhatsApp fallback ke target pertama
    const firstRecipient = targetContacts[0];
    const previewMsg = formatBroadcastWAMessage(
      broadcast,
      firstRecipient ? firstRecipient.nama_pic : undefined
    );
    const waDeepLink = firstRecipient
      ? createWhatsAppDeepLink(firstRecipient.no_wa, previewMsg)
      : undefined;

    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/admin/broadcast');

    return {
      success: true,
      data: {
        sentCount: successCount,
        targetCount: targetContacts.length
      },
      waDeepLink,
      message: `Siaran WhatsApp berhasil diproses: ${successCount} dari ${targetContacts.length} target terkirim.`
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(
      '[BROADCAST-ACTIONS] dispatchWABroadcastAction error:',
      error
    );
    return {
      success: false,
      error: error.message || 'Gagal menyiarkan pesan WhatsApp.'
    };
  }
}
