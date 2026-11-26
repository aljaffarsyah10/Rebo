/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  type AgendaAksiZI,
  DEFAULT_AGENDA_LIST,
  formatAgendaWAReminder
} from '@/lib/agenda/agenda-types';
import {
  getAllContacts,
  DEFAULT_PILAR_CONTACTS
} from '@/lib/notifications/contacts';
import {
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';

// Server-side in-memory cache untuk fallback jika tabel Supabase belum ada / offline
let inMemoryAgendaList: AgendaAksiZI[] = [...DEFAULT_AGENDA_LIST];

export interface AgendaFilterParams {
  pilarId?: string;
  kategori?: string;
  bulan?: number; // 1 - 12
  tahun?: number; // contoh: 2026
  status?: string;
}

export interface AgendaActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  stats?: {
    total: number;
    terjadwal: number;
    berlangsung: number;
    selesai: number;
    rapat: number;
    sosialisasi: number;
    deadline: number;
    monev: number;
    evaluasi: number;
  };
}

/**
 * Mengambil daftar agenda aksi ZI/RB BPS Sitaro dengan filter opsional
 */
export async function getAgendaListAction(
  filter?: AgendaFilterParams
): Promise<AgendaActionResult<AgendaAksiZI[]>> {
  try {
    let items: AgendaAksiZI[] = [];

    try {
      const supabase = await createClient();
      const { data: dbData, error } = await supabase
        .from('agenda_aksi_zi')
        .select('*')
        .order('tanggal_mulai', { ascending: true });

      if (error || !dbData || dbData.length === 0) {
        items = [...inMemoryAgendaList];
      } else {
        items = dbData as AgendaAksiZI[];
        inMemoryAgendaList = [...items];
      }
    } catch {
      items = [...inMemoryAgendaList];
    }

    // Hitung statistik keseluruhan sebelum filter
    const total = items.length;
    const terjadwal = items.filter((i) => i.status === 'TERJADWAL').length;
    const berlangsung = items.filter((i) => i.status === 'BERLANGSUNG').length;
    const selesai = items.filter((i) => i.status === 'SELESAI').length;

    const rapat = items.filter((i) => i.kategori === 'RAPAT_KOORDINASI').length;
    const sosialisasi = items.filter(
      (i) => i.kategori === 'SOSIALISASI'
    ).length;
    const deadline = items.filter(
      (i) => i.kategori === 'DEADLINE_BUKTI'
    ).length;
    const monev = items.filter((i) => i.kategori === 'MONEV_BERKALA').length;
    const evaluasi = items.filter((i) => i.kategori === 'EVALUASI_TPI').length;

    // Terapkan filter jika disediakan
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

    if (filter?.kategori && filter.kategori !== 'ALL') {
      filtered = filtered.filter((i) => i.kategori === filter.kategori);
    }

    if (filter?.status && filter.status !== 'ALL') {
      filtered = filtered.filter((i) => i.status === filter.status);
    }

    if (filter?.tahun) {
      filtered = filtered.filter((i) => {
        const year = new Date(i.tanggal_mulai).getFullYear();
        return year === filter.tahun;
      });
    }

    if (filter?.bulan) {
      filtered = filtered.filter((i) => {
        const month = new Date(i.tanggal_mulai).getMonth() + 1;
        return month === filter.bulan;
      });
    }

    // Urutkan tanggal mulai ascending
    filtered.sort((a, b) => {
      return (
        new Date(a.tanggal_mulai).getTime() -
        new Date(b.tanggal_mulai).getTime()
      );
    });

    return {
      success: true,
      data: filtered,
      message: `Berhasil memuat ${filtered.length} agenda.`,
      stats: {
        total,
        terjadwal,
        berlangsung,
        selesai,
        rapat,
        sosialisasi,
        deadline,
        monev,
        evaluasi
      }
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[AGENDA-ACTIONS] Error getAgendaListAction:', err?.message);
    return {
      success: false,
      data: inMemoryAgendaList,
      error: err?.message || 'Gagal memuat agenda aksi ZI.'
    };
  }
}

/**
 * Membuat agenda baru atau memperbarui agenda yang sudah ada
 */
export async function createOrUpdateAgendaAction(
  data: Partial<AgendaAksiZI>
): Promise<AgendaActionResult<AgendaAksiZI>> {
  try {
    const isEdit = !!data.id;
    const now = new Date().toISOString();

    const agendaRecord: AgendaAksiZI = {
      id:
        data.id ||
        `agenda-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      judul: data.judul?.trim() || 'Agenda Baru ZI/RB',
      deskripsi: data.deskripsi?.trim() || '',
      tanggal_mulai:
        data.tanggal_mulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: data.tanggal_selesai || undefined,
      waktu: data.waktu?.trim() || '09:00 - 11:30 WITA',
      lokasi: data.lokasi?.trim() || 'Aula Sasahara BPS Sitaro',
      kategori: data.kategori || 'RAPAT_KOORDINASI',
      pilar_id: data.pilar_id || 'SEMUA',
      peserta_target:
        data.peserta_target?.trim() ||
        'Seluruh Tim Kerja RB & Koordinator Pilar',
      status: data.status || 'TERJADWAL',
      link_meeting_or_drive: data.link_meeting_or_drive?.trim() || '',
      reminder_wa_sent: data.reminder_wa_sent ?? false,
      reminder_wa_sent_at: data.reminder_wa_sent_at,
      created_at: data.created_at || now,
      updated_at: now
    };

    // Simpan ke Supabase jika tabel tersedia
    try {
      const supabase = await createClient();
      if (isEdit) {
        await supabase
          .from('agenda_aksi_zi')
          .update(agendaRecord)
          .eq('id', agendaRecord.id);
      } else {
        await supabase.from('agenda_aksi_zi').insert([agendaRecord]);
      }
    } catch (dbErr: any) {
      console.warn(
        '[AGENDA-ACTIONS] DB fallback to in-memory:',
        dbErr?.message
      );
    }

    // Update in-memory cache
    if (isEdit) {
      const idx = inMemoryAgendaList.findIndex((i) => i.id === agendaRecord.id);
      if (idx !== -1) {
        inMemoryAgendaList[idx] = {
          ...inMemoryAgendaList[idx],
          ...agendaRecord
        };
      } else {
        inMemoryAgendaList.push(agendaRecord);
      }
    } else {
      inMemoryAgendaList.unshift(agendaRecord);
    }

    revalidatePath('/rebo/agenda');

    return {
      success: true,
      data: agendaRecord,
      message: isEdit
        ? `Agenda "${agendaRecord.judul}" berhasil diperbarui.`
        : `Agenda "${agendaRecord.judul}" berhasil ditambahkan.`
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[AGENDA-ACTIONS] Error createOrUpdateAgendaAction:',
      err?.message
    );
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan agenda aksi ZI.'
    };
  }
}

/**
 * Menghapus agenda aksi ZI
 */
export async function deleteAgendaAction(
  id: string
): Promise<AgendaActionResult<boolean>> {
  try {
    try {
      const supabase = await createClient();
      await supabase.from('agenda_aksi_zi').delete().eq('id', id);
    } catch (dbErr: any) {
      console.warn('[AGENDA-ACTIONS] DB delete fallback:', dbErr?.message);
    }

    inMemoryAgendaList = inMemoryAgendaList.filter((i) => i.id !== id);

    revalidatePath('/rebo/agenda');

    return {
      success: true,
      data: true,
      message: 'Agenda berhasil dihapus.'
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[AGENDA-ACTIONS] Error deleteAgendaAction:', err?.message);
    return {
      success: false,
      data: false,
      error: err?.message || 'Gagal menghapus agenda.'
    };
  }
}

/**
 * Mengirim notifikasi pengingat agenda ke nomor WA peserta terkait (1-Klik atau Otomatis H-1)
 */
export async function sendAgendaWAReminderAction(agendaId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  recipientsCount: number;
  deepLink?: string;
  reminderSentAt?: string;
}> {
  try {
    // Cari agenda
    const agenda = inMemoryAgendaList.find((i) => i.id === agendaId);
    if (!agenda) {
      return {
        success: false,
        message: 'Agenda tidak ditemukan.',
        recipientsCount: 0
      };
    }

    // Format pesan
    const messageText = formatAgendaWAReminder(agenda);

    // Ambil daftar kontak
    let contactsList: Array<{ nama: string; noWa: string }> = [];
    try {
      const contacts = await getAllContacts();
      if (contacts && contacts.length > 0) {
        contactsList = contacts.map((c) => ({
          nama: c.nama_pic,
          noWa: c.no_wa
        }));
      }
    } catch {
      // Gunakan default kontak
    }

    if (contactsList.length === 0) {
      // Gunakan DEFAULT_PILAR_CONTACTS
      contactsList = Object.values(DEFAULT_PILAR_CONTACTS).map((c) => ({
        nama: c.namaPic,
        noWa: c.noWa
      }));
    }

    // Filter penerima berdasarkan pilar_id
    let targetRecipients: Array<{ nama: string; noWa: string }> = [];
    if (agenda.pilar_id && agenda.pilar_id !== 'SEMUA') {
      const pilarNum = parseInt(agenda.pilar_id, 10);
      const defaultPilar = DEFAULT_PILAR_CONTACTS[pilarNum];
      if (defaultPilar) {
        targetRecipients.push({
          nama: defaultPilar.namaPic,
          noWa: defaultPilar.noWa
        });
      } else {
        targetRecipients = contactsList.slice(0, 3);
      }
    } else {
      // Seluruh Tim ZI (PIC Pilar 1-6)
      targetRecipients = contactsList;
    }

    if (targetRecipients.length === 0) {
      targetRecipients.push({
        nama: 'PIC Pilar ZI BPS Sitaro',
        noWa: '082190010001'
      });
    }

    // Kirim pesan WhatsApp ke antrean Redis secara non-blocking
    const enqueuePromises = targetRecipients.map((recipient) =>
      enqueueWhatsAppNotification({
        type: 'AGENDA_REMINDER',
        targetPhone: recipient.noWa,
        message: messageText,
        metadata: {
          source: 'broadcast_agenda',
          agendaId: agenda.id,
          judul: agenda.judul,
          recipientNama: recipient.nama,
          pilarId: agenda.pilar_id
        }
      })
    );

    await Promise.all(enqueuePromises);

    // Buat deep link wa.me utama untuk opsi buka manual di browser
    const primaryPhone = targetRecipients[0].noWa;
    const deepLink = createWhatsAppDeepLink(primaryPhone, messageText);

    // Update status reminder pada agenda
    const now = new Date().toISOString();
    agenda.reminder_wa_sent = true;
    agenda.reminder_wa_sent_at = now;

    // Sync ke DB jika ada
    try {
      const supabase = await createClient();
      await supabase
        .from('agenda_aksi_zi')
        .update({
          reminder_wa_sent: true,
          reminder_wa_sent_at: now
        })
        .eq('id', agendaId);
    } catch (e: any) {
      console.warn('[AGENDA-ACTIONS] DB reminder update fallback:', e?.message);
    }

    revalidatePath('/rebo/agenda');

    return {
      success: true,
      message: `Pengingat WhatsApp berhasil dikirim ke ${targetRecipients.length} kontak peserta (${targetRecipients.map((r) => r.nama).join(', ')}).`,
      recipientsCount: targetRecipients.length,
      deepLink,
      reminderSentAt: now
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[AGENDA-ACTIONS] Error sendAgendaWAReminderAction:',
      err?.message
    );
    return {
      success: false,
      message: 'Gagal mengirim pengingat WhatsApp.',
      error: err?.message,
      recipientsCount: 0
    };
  }
}
