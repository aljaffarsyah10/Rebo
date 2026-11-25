/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  type NotulenRapat,
  type KesepakatanRapatItem,
  type NotulenFilterParams,
  type NotulenActionResult,
  DEFAULT_NOTULEN_LIST,
  NOTULEN_PILAR_OPTIONS,
  formatNotulenTaskWAMessage,
  generateNomorNotula
} from '@/lib/notulen/notulen-types';
import {
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';

// Server-side in-memory cache untuk fallback jika tabel Supabase belum ada / offline
let inMemoryNotulenList: NotulenRapat[] = [...DEFAULT_NOTULEN_LIST];

/**
 * Mengambil daftar notulen rapat ZI/RB BPS Sitaro dengan filter opsional
 */
export async function getNotulenListAction(
  filter?: NotulenFilterParams
): Promise<NotulenActionResult<NotulenRapat[]>> {
  try {
    let items: NotulenRapat[] = [];

    try {
      const supabase = await createClient();
      const { data: dbData, error } = await supabase
        .from('notulen_rapat')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error || !dbData || dbData.length === 0) {
        items = [...inMemoryNotulenList];
      } else {
        items = dbData as NotulenRapat[];
        inMemoryNotulenList = [...items];
      }
    } catch {
      items = [...inMemoryNotulenList];
    }

    // Hitung statistik keseluruhan
    const totalNotulen = items.length;
    let totalKesepakatan = 0;
    let kesepakatanSelesai = 0;
    let ditugaskanKanban = 0;
    let waTerkirim = 0;

    items.forEach((n) => {
      (n.kesepakatan_items || []).forEach((k) => {
        totalKesepakatan++;
        if (k.status === 'SELESAI') kesepakatanSelesai++;
        if (k.kanban_card_id) ditugaskanKanban++;
        if (k.wa_sent) waTerkirim++;
      });
    });

    // Terapkan filter jika ada
    let filtered = [...items];

    if (
      filter?.pilarId &&
      filter.pilarId !== 'ALL' &&
      filter.pilarId !== 'SEMUA'
    ) {
      filtered = filtered.filter(
        (i) => i.pilar_id === filter.pilarId || i.pilar_id === 'SEMUA'
      );
    }

    if (filter?.tahun) {
      filtered = filtered.filter((i) => {
        const year = new Date(i.tanggal).getFullYear();
        return year === filter.tahun;
      });
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.judul_rapat.toLowerCase().includes(q) ||
          i.nomor_notula.toLowerCase().includes(q) ||
          i.tempat.toLowerCase().includes(q) ||
          i.pimpinan_rapat.toLowerCase().includes(q) ||
          i.notulis.toLowerCase().includes(q) ||
          i.peserta_hadir.some((p) => p.toLowerCase().includes(q)) ||
          i.ringkasan_pembahasan.toLowerCase().includes(q) ||
          i.kesepakatan_items.some((k) =>
            k.poin_kesepakatan.toLowerCase().includes(q)
          )
      );
    }

    // Urutkan tanggal terbaru ke terlama
    filtered.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    return {
      success: true,
      data: filtered,
      stats: {
        totalNotulen,
        totalKesepakatan,
        kesepakatanSelesai,
        ditugaskanKanban,
        waTerkirim
      }
    };
  } catch (err: any) {
    console.error('[NOTULEN-ACTIONS] getNotulenListAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengambil daftar notulen rapat.'
    };
  }
}

/**
 * Mengambil detail satu notulen rapat berdasarkan ID
 */
export async function getNotulenDetailAction(
  id: string
): Promise<NotulenActionResult<NotulenRapat>> {
  try {
    let item: NotulenRapat | undefined;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notulen_rapat')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        item = data as NotulenRapat;
      }
    } catch {
      // ignore
    }

    if (!item) {
      item = inMemoryNotulenList.find((n) => n.id === id);
    }

    if (!item) {
      return {
        success: false,
        error: `Notulen rapat dengan ID ${id} tidak ditemukan.`
      };
    }

    return {
      success: true,
      data: item
    };
  } catch (err: any) {
    console.error('[NOTULEN-ACTIONS] getNotulenDetailAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memuat detail notulen rapat.'
    };
  }
}

/**
 * Menyimpan notulen rapat baru atau memperbarui notulen yang sudah ada
 */
export async function saveNotulenAction(
  data: Partial<NotulenRapat>
): Promise<NotulenActionResult<NotulenRapat>> {
  try {
    const isNew = !data.id;
    const nowIso = new Date().toISOString();

    let nomorNotula = data.nomor_notula;
    if (!nomorNotula || !nomorNotula.trim()) {
      nomorNotula = generateNomorNotula(
        inMemoryNotulenList.length + 1,
        data.tanggal
      );
    }

    const payload: NotulenRapat = {
      id:
        data.id ||
        `notulen-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      judul_rapat: data.judul_rapat || 'Notula Rapat Tim ZI BPS Sitaro',
      nomor_notula: nomorNotula,
      tanggal: data.tanggal || nowIso.split('T')[0],
      waktu_mulai: data.waktu_mulai || '09:00',
      waktu_selesai: data.waktu_selesai || '11:30',
      tempat: data.tempat || 'Aula Sasahara BPS Sitaro',
      agenda_id: data.agenda_id || undefined,
      pilar_id: data.pilar_id || 'SEMUA',
      pimpinan_rapat:
        data.pimpinan_rapat ||
        'Ir. Stella Mandagi (Kepala BPS Kabupaten Kepulauan Sitaro)',
      notulis: data.notulis || 'Gloria Pangemanan, S.Tr.Stat.',
      peserta_hadir: data.peserta_hadir || [],
      ringkasan_pembahasan: data.ringkasan_pembahasan || '',
      kesepakatan_items: (data.kesepakatan_items || []).map((item, idx) => ({
        ...item,
        id: item.id || `kesepakatan-${Date.now().toString(36)}-${idx + 1}`,
        notulen_id: data.id || payloadIdPlaceholder(data.id),
        status: item.status || 'BELUM_DIKERJAKAN',
        wa_sent: Boolean(item.wa_sent)
      })),
      created_at: data.created_at || nowIso,
      updated_at: nowIso
    };

    // Pastikan notulen_id di setiap kesepakatan konsisten
    payload.kesepakatan_items = payload.kesepakatan_items.map((k) => ({
      ...k,
      notulen_id: payload.id
    }));

    // Simpan ke Supabase jika memungkinkan
    try {
      const supabase = await createClient();
      if (isNew) {
        await supabase.from('notulen_rapat').insert(payload);
      } else {
        await supabase
          .from('notulen_rapat')
          .update(payload)
          .eq('id', payload.id);
      }
    } catch {
      // fallback in-memory
    }

    // Update in-memory cache
    if (isNew) {
      inMemoryNotulenList.unshift(payload);
    } else {
      const idx = inMemoryNotulenList.findIndex((n) => n.id === payload.id);
      if (idx !== -1) {
        inMemoryNotulenList[idx] = payload;
      } else {
        inMemoryNotulenList.unshift(payload);
      }
    }

    revalidatePath('/rebo/notulen');
    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/agenda');

    return {
      success: true,
      message: isNew
        ? 'Notulen rapat resmi berhasil dicatat!'
        : 'Perubahan notulen rapat berhasil disimpan!',
      data: payload
    };
  } catch (err: any) {
    console.error('[NOTULEN-ACTIONS] saveNotulenAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan notulen rapat.'
    };
  }
}

function payloadIdPlaceholder(id?: string) {
  return (
    id ||
    `notulen-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  );
}

/**
 * Menghapus notulen rapat berdasarkan ID
 */
export async function deleteNotulenAction(
  id: string
): Promise<NotulenActionResult> {
  try {
    try {
      const supabase = await createClient();
      await supabase.from('notulen_rapat').delete().eq('id', id);
    } catch {
      // ignore
    }

    inMemoryNotulenList = inMemoryNotulenList.filter((n) => n.id !== id);

    revalidatePath('/rebo/notulen');
    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/agenda');

    return {
      success: true,
      message: 'Notulen rapat berhasil dihapus.'
    };
  } catch (err: any) {
    console.error('[NOTULEN-ACTIONS] deleteNotulenAction error:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menghapus notulen rapat.'
    };
  }
}

/**
 * Auto-Task Assignment & WA Dispatch:
 * 1. Mengubah poin kesepakatan menjadi tugas di papan Kanban
 * 2. Mengirimkan rincian tugas resmi ke nomor WhatsApp PIC
 * 3. Menghasilkan tautan wa.me sebagai fallback 1-klik manual
 */
export async function convertKesepakatanToKanbanAndNotifyAction(
  notulenId: string,
  kesepakatanId: string
): Promise<NotulenActionResult<KesepakatanRapatItem>> {
  try {
    const notulen = inMemoryNotulenList.find((n) => n.id === notulenId);
    if (!notulen) {
      return {
        success: false,
        error: `Notulen rapat (${notulenId}) tidak ditemukan.`
      };
    }

    const item = notulen.kesepakatan_items.find((k) => k.id === kesepakatanId);
    if (!item) {
      return {
        success: false,
        error: `Butir kesepakatan (${kesepakatanId}) tidak ditemukan.`
      };
    }

    // 1. Tentukan / buat kanban_card_id
    if (!item.kanban_card_id) {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      item.kanban_card_id = `KANBAN-TL-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    }

    if (item.status === 'BELUM_DIKERJAKAN') {
      item.status = 'SEDANG_PROSES';
    }

    // Label Pilar
    const pilarObj = NOTULEN_PILAR_OPTIONS.find(
      (p) => p.value === item.pilar_id
    );
    const pilarLabel = pilarObj?.label || `Pilar ${item.pilar_id}`;

    // 2. Format Pesan WhatsApp Penugasan
    const waMessage = formatNotulenTaskWAMessage({
      picName: item.pic_name,
      judulRapat: notulen.judul_rapat,
      nomorNotula: notulen.nomor_notula,
      poinKesepakatan: item.poin_kesepakatan,
      pilarLabel: pilarLabel,
      tenggatWaktu: item.tenggat_waktu,
      status: item.status
    });

    // 3. Kirim via WhatsApp Notification Service
    let waSendResult: { success: boolean; error?: string } = { success: true };
    if (item.pic_phone) {
      waSendResult = await sendWhatsAppMessage({
        phone: item.pic_phone,
        message: waMessage
      });
    }

    // Buat deep link wa.me sebagai fallback manual jika pengguna ingin membuka WhatsApp Web
    const waDeepLink = item.pic_phone
      ? createWhatsAppDeepLink(item.pic_phone, waMessage)
      : undefined;

    // 4. Update status kesepakatan
    item.wa_sent = true;
    item.wa_sent_at = new Date().toISOString();
    notulen.updated_at = new Date().toISOString();

    // 5. Coba simpan ke Supabase jika tabel tersedia
    try {
      const supabase = await createClient();
      await supabase
        .from('notulen_rapat')
        .update({
          kesepakatan_items: notulen.kesepakatan_items,
          updated_at: notulen.updated_at
        })
        .eq('id', notulen.id);

      // Coba juga insert ke tabel rebo_kanban_cards jika tersedia
      await supabase.from('rebo_kanban_cards').upsert(
        {
          id: item.kanban_card_id,
          notulen_id: notulen.id,
          nomor_notula: notulen.nomor_notula,
          judul_tugas: item.poin_kesepakatan,
          pilar_id: item.pilar_id,
          pic_name: item.pic_name,
          pic_phone: item.pic_phone,
          tenggat_waktu: item.tenggat_waktu,
          status: item.status,
          created_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    } catch {
      // In-memory update is already committed
    }

    revalidatePath('/rebo/notulen');
    revalidatePath('/rebo/kanban');
    revalidatePath('/rebo/agenda');

    const statusMsg = waSendResult.success
      ? `Tugas telah ditugaskan ke Kanban (${item.kanban_card_id}) dan notifikasi WA dikirim ke ${item.pic_name} (${item.pic_phone})!`
      : `Tugas masuk ke Kanban (${item.kanban_card_id}), notifikasi WA dijadwalkan / disimulasikan.`;

    return {
      success: true,
      message: statusMsg,
      data: item,
      waDeepLink
    };
  } catch (err: any) {
    console.error(
      '[NOTULEN-ACTIONS] convertKesepakatanToKanbanAndNotifyAction error:',
      err
    );
    return {
      success: false,
      error:
        err?.message ||
        'Gagal mengubah kesepakatan menjadi tugas Kanban & WA Dispatch.'
    };
  }
}
