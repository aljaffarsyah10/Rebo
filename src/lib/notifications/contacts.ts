/* eslint-disable no-console */
/**
 * WhatsApp Contacts & Pilar Phone Mapping Resolver untuk REBO V2
 *
 * Mengelola mapping kontak WhatsApp untuk:
 * - 6 Pilar Manajemen ZI/RB BPS Kabupaten Kepulauan Sitaro
 * - Tim Verifikator / TPI (Tim Penilai Internal)
 * - Super Admin / Notifikasi Hotline
 */

import { createClient } from '@supabase/supabase-js';
import { formatPhoneNumber } from './whatsapp';

export interface PilarContact {
  namaPic: string;
  noWa: string;
  namaPilar?: string;
  jabatan?: string;
  email?: string;
}

export interface KontakPilarRecord {
  id: number;
  id_pilar: number | null;
  kategori: string;
  nama_pilar: string | null;
  nama_pic: string;
  jabatan: string | null;
  no_wa: string;
  email: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fallback kontak default jika koneksi database sedang offline atau belum terisi
export const DEFAULT_PILAR_CONTACTS: Record<
  number,
  { namaPic: string; noWa: string; namaPilar: string }
> = {
  1: {
    namaPic: 'PIC Pilar Manajemen Perubahan',
    noWa: '082190010001',
    namaPilar: 'Pilar 1 - Manajemen Perubahan'
  },
  2: {
    namaPic: 'PIC Pilar Penataan Tatalaksana',
    noWa: '082190010002',
    namaPilar: 'Pilar 2 - Penataan Tatalaksana'
  },
  3: {
    namaPic: 'PIC Pilar Manajemen SDM',
    noWa: '082190010003',
    namaPilar: 'Pilar 3 - Penataan Sistem Manajemen SDM'
  },
  4: {
    namaPic: 'PIC Pilar Penguatan Akuntabilitas',
    noWa: '082190010004',
    namaPilar: 'Pilar 4 - Penguatan Akuntabilitas'
  },
  5: {
    namaPic: 'PIC Pilar Penguatan Pengawasan',
    noWa: '082190010005',
    namaPilar: 'Pilar 5 - Penguatan Pengawasan'
  },
  6: {
    namaPic: 'PIC Pilar Pelayanan Publik',
    noWa: '082190010006',
    namaPilar: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik'
  }
};

export const DEFAULT_VERIFIKATOR_NUMBERS: string[] = [
  '082190010000', // Tim Verifikator Utama ZI/RB BPS Sitaro
  '082190010008' // Admin REBO BPS Sitaro
];

/**
 * Inisialisasi client Supabase independen tanpa ketergantungan cookies Next.js
 * agar dapat berjalan di Server Actions, Route Handlers, dan Node scripts.
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Mendapatkan nomor default penerima notifikasi (fallback global / hotline BPS Sitaro).
 * Membaca dari environment variables WHATSAPP_DEFAULT_RECEIVER / WA_DEFAULT_RECEIVER,
 * atau nomor verifikator default jika tidak disetel.
 */
export function getDefaultNotificationReceiver(): string {
  const envReceiver =
    process.env.WHATSAPP_DEFAULT_RECEIVER ||
    process.env.WA_DEFAULT_RECEIVER ||
    '';

  if (envReceiver.trim()) {
    return formatPhoneNumber(envReceiver.trim());
  }

  return formatPhoneNumber('082190010000');
}

/**
 * Mengambil informasi kontak PIC untuk pilar tertentu berdasarkan pilarId (1-6).
 * Membaca tabel `kontak_pilar` di database Supabase dengan fallback ke data statis.
 *
 * @param pilarId Nomor pilar (1 s/d 6)
 * @returns Object berisi namaPic dan noWa terformat (628...), atau null jika pilarId tidak ditemukan.
 */
export async function getPilarContact(
  pilarId: number
): Promise<{ namaPic: string; noWa: string } | null> {
  const normalizedId = Number(pilarId);
  if (isNaN(normalizedId) || normalizedId <= 0) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('kontak_pilar')
        .select('nama_pic, no_wa, nama_pilar, is_active')
        .eq('id_pilar', normalizedId)
        .eq('is_active', true)
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.no_wa) {
        return {
          namaPic: data.nama_pic || `PIC Pilar ${normalizedId}`,
          noWa: formatPhoneNumber(data.no_wa)
        };
      }
    }
  } catch (err) {
    console.warn(
      `[CONTACTS] Warning retrieving contact for pilar ${normalizedId} from db:`,
      err
    );
  }

  // Fallback ke data statis
  const fallback = DEFAULT_PILAR_CONTACTS[normalizedId];
  if (fallback) {
    return {
      namaPic: fallback.namaPic,
      noWa: formatPhoneNumber(fallback.noWa)
    };
  }

  return null;
}

/**
 * Mengambil seluruh nomor kontak WhatsApp verifikator aktif (Tim Verifikator, TPI, Admin).
 * Digunakan saat operator mengajukan bukti dukung baru agar seluruh verifikator mendapat notifikasi.
 *
 * @returns Array nomor WhatsApp terformat (628...) unik dan valid.
 */
export async function getVerifikatorContacts(): Promise<string[]> {
  const contactsSet = new Set<string>();

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('kontak_pilar')
        .select('no_wa, kategori, is_active')
        .in('kategori', ['verifikator', 'admin', 'tpi'])
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        for (const row of data) {
          if (row.no_wa && row.no_wa.trim()) {
            contactsSet.add(formatPhoneNumber(row.no_wa.trim()));
          }
        }
      }
    }
  } catch (err) {
    console.warn(
      '[CONTACTS] Warning retrieving verifikator contacts from db:',
      err
    );
  }

  // Jika belum ada dari database, tambahkan default verifikator numbers
  if (contactsSet.size === 0) {
    for (const num of DEFAULT_VERIFIKATOR_NUMBERS) {
      contactsSet.add(formatPhoneNumber(num));
    }
  }

  // Pastikan default notification receiver juga diikutsertakan jika diset
  const defaultReceiver = getDefaultNotificationReceiver();
  if (defaultReceiver) {
    contactsSet.add(defaultReceiver);
  }

  return Array.from(contactsSet);
}

/**
 * Mengambil seluruh daftar kontak pilar dan verifikator untuk kebutuhan tampilan admin/UI.
 */
export async function getAllContacts(): Promise<KontakPilarRecord[]> {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('kontak_pilar')
        .select('*')
        .order('id_pilar', { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        return data as KontakPilarRecord[];
      }
    }
  } catch (err) {
    console.warn('[CONTACTS] Warning retrieving all contacts:', err);
  }

  // Fallback representasi dari data statis
  const staticList: KontakPilarRecord[] = [];
  let counter = 1;

  for (const [idStr, info] of Object.entries(DEFAULT_PILAR_CONTACTS)) {
    staticList.push({
      id: counter++,
      id_pilar: Number(idStr),
      kategori: 'pilar',
      nama_pilar: info.namaPilar,
      nama_pic: info.namaPic,
      jabatan: `Koordinator ${info.namaPilar}`,
      no_wa: info.noWa,
      email: `pilar${idStr}.sitaro@bps.go.id`,
      is_active: true
    });
  }

  staticList.push({
    id: counter++,
    id_pilar: null,
    kategori: 'verifikator',
    nama_pilar: 'Tim Verifikator Internal ZI/RB',
    nama_pic: 'Tim Verifikator Internal ZI/RB',
    jabatan: 'Koordinator Tim Penilai Internal & Verifikator BPS Sitaro',
    no_wa: '082190010000',
    email: 'verifikator.sitaro@bps.go.id',
    is_active: true
  });

  return staticList;
}
