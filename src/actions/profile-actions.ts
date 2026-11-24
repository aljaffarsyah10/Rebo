/* eslint-disable no-console */
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserSession } from '@/lib/auth/session';
import { currentUser } from '@clerk/nextjs/server';
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import type { UserProfileData } from '@/types/rebo';

// ==============================================================================
// 1. Zod Validation Schemas
// ==============================================================================

const profileInputSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap wajib diisi minimal 2 karakter.'),
  no_wa: z
    .string()
    .trim()
    .min(8, 'Nomor WhatsApp wajib diisi minimal 8 digit.')
    .refine(
      (val) => {
        const formatted = formatPhoneNumber(val);
        // Validasi nomor WhatsApp Indonesia: berawalan 628 dengan panjang 10 s.d. 15 digit angka
        return /^628[0-9]{7,13}$/.test(formatted);
      },
      {
        message:
          'Format nomor WhatsApp tidak valid. Gunakan format 08xxx atau 628xxx (contoh: 082190010001).'
      }
    ),
  pilar_tugas: z
    .union([z.number().int().min(1).max(6), z.null(), z.undefined()])
    .optional(),
  notif_wa_approval: z.boolean().default(true),
  notif_wa_revision: z.boolean().default(true),
  notif_wa_deadline: z.boolean().default(true)
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export interface ProfileActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  waDeepLink?: string;
}

/**
 * Mendapatkan client Supabase mandiri dengan service role / anon key
 * untuk memastikan update data profil pengguna tidak terkendala token session.
 */
function getIndependentSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// ==============================================================================
// 2. GET USER PROFILE ACTION
// ==============================================================================

/**
 * Mengambil profil dan preferensi notifikasi pengguna aktif berdasarkan sesi Clerk saat ini.
 * Jika baris di tabel `public.users` belum tersedia, dibuatkan entri default otomatis.
 */
export async function getUserProfileAction(): Promise<
  ProfileActionResult<UserProfileData>
> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Sesi berakhir atau Anda belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const clerkUser = await currentUser().catch(() => null);
    const email =
      session.email ||
      clerkUser?.emailAddresses?.find(
        (e) => e.id === clerkUser?.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      '';
    const fullName =
      session.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      clerkUser?.username ||
      'Pegawai BPS Sitaro';

    const client = getIndependentSupabaseClient();
    if (!client) {
      // Fallback menggunakan server client bawaan jika env key tidak lengkap
      const supabaseServer = await createServerSupabaseClient();
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .maybeSingle();

      if (error) {
        console.warn(
          '[PROFILE-ACTIONS] Supabase query warning:',
          error.message
        );
      }

      if (data) {
        return {
          success: true,
          data: {
            id: data.id,
            email: data.email || email,
            full_name: data.full_name || fullName,
            no_wa: data.no_wa || '',
            telepon: data.telepon || data.no_wa || '',
            role: data.role || session.role || 'operator',
            pilar_tugas:
              data.pilar_tugas ??
              (session.assignedPilarId
                ? parseInt(session.assignedPilarId, 10)
                : null),
            assigned_pilar_id:
              data.assigned_pilar_id ??
              (session.assignedPilarId
                ? parseInt(session.assignedPilarId, 10)
                : null),
            notif_wa_approval: data.notif_wa_approval ?? true,
            notif_wa_revision: data.notif_wa_revision ?? true,
            notif_wa_deadline: data.notif_wa_deadline ?? true,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        };
      }
    } else {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .maybeSingle();

      if (error) {
        console.warn(
          '[PROFILE-ACTIONS] Independent client warning:',
          error.message
        );
      }

      if (data) {
        return {
          success: true,
          data: {
            id: data.id,
            email: data.email || email,
            full_name: data.full_name || fullName,
            no_wa: data.no_wa || '',
            telepon: data.telepon || data.no_wa || '',
            role: data.role || session.role || 'operator',
            pilar_tugas:
              data.pilar_tugas ??
              (session.assignedPilarId
                ? parseInt(session.assignedPilarId, 10)
                : null),
            assigned_pilar_id:
              data.assigned_pilar_id ??
              (session.assignedPilarId
                ? parseInt(session.assignedPilarId, 10)
                : null),
            notif_wa_approval: data.notif_wa_approval ?? true,
            notif_wa_revision: data.notif_wa_revision ?? true,
            notif_wa_deadline: data.notif_wa_deadline ?? true,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        };
      }

      // Baris belum ada: inisialisasi baris baru untuk pengguna ini
      const defaultPilar = session.assignedPilarId
        ? parseInt(session.assignedPilarId, 10)
        : null;
      const initialPayload = {
        id: session.userId,
        email,
        full_name: fullName,
        no_wa: '',
        telepon: '',
        role: session.role || 'operator',
        assigned_pilar_id: defaultPilar,
        pilar_tugas: defaultPilar,
        notif_wa_approval: true,
        notif_wa_revision: true,
        notif_wa_deadline: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: inserted, error: insertErr } = await client
        .from('users')
        .insert(initialPayload)
        .select()
        .maybeSingle();

      if (!insertErr && inserted) {
        return {
          success: true,
          data: inserted as UserProfileData
        };
      }
    }

    // Default object jika belum tersimpan di DB
    return {
      success: true,
      data: {
        id: session.userId,
        email,
        full_name: fullName,
        no_wa: '',
        telepon: '',
        role: session.role || 'operator',
        pilar_tugas: session.assignedPilarId
          ? parseInt(session.assignedPilarId, 10)
          : null,
        assigned_pilar_id: session.assignedPilarId
          ? parseInt(session.assignedPilarId, 10)
          : null,
        notif_wa_approval: true,
        notif_wa_revision: true,
        notif_wa_deadline: true
      }
    };
  } catch (error: any) {
    console.error('[PROFILE-ACTIONS] Error in getUserProfileAction:', error);
    return {
      success: false,
      error: error?.message || 'Gagal memuat profil pengguna.'
    };
  }
}

// ==============================================================================
// 3. UPDATE USER PROFILE ACTION
// ==============================================================================

/**
 * Menyimpan profil pengguna, nomor WhatsApp (format 628xxx), pilar tugas,
 * dan preferensi notifikasi WA, serta mencatat audit log.
 */
export async function updateUserProfileAction(
  input: ProfileInput
): Promise<ProfileActionResult<UserProfileData>> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error:
          'Sesi berakhir atau Anda belum login. Silakan masuk terlebih dahulu.'
      };
    }

    const parseResult = profileInputSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors
        .map((e) => e.message)
        .join(', ');
      return {
        success: false,
        error: `Validasi gagal: ${errorMsg}`
      };
    }

    const validated = parseResult.data;
    const formattedPhone = formatPhoneNumber(validated.no_wa);
    const now = new Date().toISOString();

    const client = getIndependentSupabaseClient();
    const supabase = client || (await createServerSupabaseClient());

    // 1. Ambil data profil lama untuk audit log
    const { data: oldUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .maybeSingle();

    const updatePayload = {
      full_name: validated.full_name,
      no_wa: formattedPhone,
      telepon: formattedPhone,
      pilar_tugas: validated.pilar_tugas ?? null,
      assigned_pilar_id: validated.pilar_tugas ?? null,
      notif_wa_approval: validated.notif_wa_approval,
      notif_wa_revision: validated.notif_wa_revision,
      notif_wa_deadline: validated.notif_wa_deadline,
      updated_at: now
    };

    let resultUser: any = null;

    if (oldUser) {
      const { data: updated, error: updateErr } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', session.userId)
        .select()
        .maybeSingle();

      if (updateErr) {
        throw new Error(updateErr.message);
      }
      resultUser = updated;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert({
          id: session.userId,
          email: session.email || '',
          role: session.role || 'operator',
          ...updatePayload,
          created_at: now
        })
        .select()
        .maybeSingle();

      if (insertErr) {
        throw new Error(insertErr.message);
      }
      resultUser = inserted;
    }

    // 2. Rekam mutasi ke tabel audit_log
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: null,
        action: 'UPDATE_USER_PROFILE',
        old_state: oldUser
          ? {
              full_name: oldUser.full_name,
              no_wa: oldUser.no_wa,
              pilar_tugas: oldUser.pilar_tugas,
              notif_wa_approval: oldUser.notif_wa_approval,
              notif_wa_revision: oldUser.notif_wa_revision,
              notif_wa_deadline: oldUser.notif_wa_deadline
            }
          : null,
        new_state: {
          full_name: validated.full_name,
          no_wa: formattedPhone,
          pilar_tugas: validated.pilar_tugas,
          notif_wa_approval: validated.notif_wa_approval,
          notif_wa_revision: validated.notif_wa_revision,
          notif_wa_deadline: validated.notif_wa_deadline
        },
        user_id: session.userId,
        user_name: validated.full_name || session.fullName || 'Pengguna',
        role: session.role || 'operator',
        created_at: now
      });
    } catch (auditErr: any) {
      console.warn(
        '[PROFILE-ACTIONS] Notice recording audit log:',
        auditErr?.message
      );
    }

    // 3. Revalidasi path
    revalidatePath('/rebo/profile');
    revalidatePath('/rebo/admin/kontak');
    revalidatePath('/rebo/formRB');

    return {
      success: true,
      message: 'Profil dan preferensi notifikasi WhatsApp berhasil disimpan.',
      data: resultUser as UserProfileData
    };
  } catch (error: any) {
    console.error('[PROFILE-ACTIONS] Error in updateUserProfileAction:', error);
    return {
      success: false,
      error:
        error?.message || 'Terjadi kesalahan saat memperbarui profil pengguna.'
    };
  }
}

// ==============================================================================
// 4. TEST NOTIFICATION TO SELF ACTION
// ==============================================================================

/**
 * Mengirimkan pesan percobaan interaktif ke nomor WhatsApp pribadi pengguna
 * untuk memastikan nomor terdaftar dan WhatsApp Gateway berjalan normal.
 */
export async function sendTestNotificationToSelfAction(
  phone: string
): Promise<ProfileActionResult<{ phone: string }>> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error: 'Sesi berakhir atau Anda belum login.'
      };
    }

    if (!phone || !phone.trim()) {
      return {
        success: false,
        error: 'Nomor WhatsApp belum diisi.'
      };
    }

    const formattedPhone = formatPhoneNumber(phone.trim());
    if (!/^628[0-9]{7,13}$/.test(formattedPhone)) {
      return {
        success: false,
        error:
          'Format nomor tidak valid. Gunakan format 08xxx atau 628xxx (contoh: 082190010001).'
      };
    }

    const userName = session.fullName || 'Rekan Pegawai BPS Sitaro';
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Makassar',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const testMessage = `🔔 *[UJI COBA NOTIFIKASI PERSONAL REBO V2]*

Halo *${userName}*,

Ini adalah pesan pengujian koneksi notifikasi WhatsApp personal dari Sistem REBO BPS Kabupaten Kepulauan Sitaro.

📱 *Nomor Terdaftar:* ${formattedPhone}
🕒 *Waktu Pengujian:* ${timestamp} WITA
✅ *Status:* Terhubung dengan WhatsApp Gateway

Dengan mengaktifkan preferensi notifikasi, Anda akan menerima pembaruan instan saat bukti dukung yang Anda unggah disetujui, memerlukan revisi, atau mendekati batas tenggat waktu evaluasi.

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;

    const deepLink = createWhatsAppDeepLink(formattedPhone, testMessage);

    const sendResult = await sendWhatsAppMessage({
      phone: formattedPhone,
      message: testMessage
    });

    // Catat ke audit log
    const client = getIndependentSupabaseClient();
    const supabase = client || (await createServerSupabaseClient());
    try {
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: null,
        action: 'TEST_WA_SELF',
        old_state: null,
        new_state: {
          phone: formattedPhone,
          user_id: session.userId,
          user_name: userName,
          success: sendResult.success,
          error: sendResult.error || null
        },
        user_id: session.userId,
        user_name: userName,
        role: session.role || 'operator',
        created_at: new Date().toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[PROFILE-ACTIONS] Notice recording audit log for test WA:',
        auditErr?.message
      );
    }

    if (!sendResult.success) {
      return {
        success: false,
        error:
          sendResult.error ||
          'WhatsApp Gateway sedang offline atau belum terhubung. Anda dapat menggunakan tombol kirim manual via WhatsApp Web.',
        waDeepLink: deepLink
      };
    }

    return {
      success: true,
      message: `Pesan uji coba berhasil dikirim ke nomor ${formattedPhone}. Silakan periksa aplikasi WhatsApp Anda.`,
      waDeepLink: deepLink,
      data: { phone: formattedPhone }
    };
  } catch (error: any) {
    console.error(
      '[PROFILE-ACTIONS] Error in sendTestNotificationToSelfAction:',
      error
    );
    return {
      success: false,
      error: error?.message || 'Gagal mengirim pesan uji coba WhatsApp.'
    };
  }
}
