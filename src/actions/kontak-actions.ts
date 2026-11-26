/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import {
  getAllContacts,
  DEFAULT_PILAR_CONTACTS,
  type KontakPilarRecord
} from '@/lib/notifications/contacts';
import {
  sendWhatsAppMessage,
  formatPhoneNumber,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';
import {
  executeReminders,
  type ReminderExecutionResult,
  type PilarReminderDetail
} from '@/lib/notifications/reminders';

export interface GatewayStatusResult {
  configured: boolean;
  online: boolean;
  connected: boolean;
  gatewayUrl: string;
  phone: string | null;
  botName: string | null;
  hasActiveQr: boolean;
  message: string;
}

export interface KontakActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Mendapatkan client Supabase mandiri dengan service role / anon key
 * untuk memastikan operasi database kontak pilar tidak terhalang masalah session/cookie.
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
// 1. GET KONTAK LIST
// ==============================================================================

/**
 * Mengambil seluruh daftar kontak PIC 6 Pilar ZI dan Tim Verifikator dari database Supabase
 * dengan fallback otomatis ke DEFAULT_PILAR_CONTACTS jika koneksi offline/data kosong.
 */
export async function getKontakListAction(): Promise<
  KontakActionResult<KontakPilarRecord[]>
> {
  try {
    const contacts = await getAllContacts();
    return {
      success: true,
      data: contacts,
      message: `Berhasil memuat ${contacts.length} kontak pilar & verifikator.`
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[KONTAK-ACTIONS] Error getKontakListAction:', err?.message);
    return {
      success: false,
      data: [],
      error: err?.message || 'Gagal memuat daftar kontak pilar.'
    };
  }
}

// ==============================================================================
// 2. UPDATE KONTAK
// ==============================================================================

/**
 * Memperbarui data kontak PIC pilar atau verifikator dan merevalidasi cache halaman.
 */
export async function updateKontakAction(
  id: number,
  data: {
    nama_pic: string;
    no_wa: string;
    jabatan?: string;
    email?: string;
    is_active?: boolean;
  }
): Promise<KontakActionResult<KontakPilarRecord>> {
  try {
    // 1. Verifikasi Otorisasi (Admin atau TPI)
    const session = await getCurrentUserSession();
    if (!isAdmin(session.role) && !isTPI(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Administrator atau Tim Verifikator yang berhak mengubah kontak.'
      };
    }

    // 2. Validasi input
    if (!data.nama_pic || !data.nama_pic.trim()) {
      return {
        success: false,
        error: 'Nama PIC tidak boleh kosong.'
      };
    }

    if (!data.no_wa || !data.no_wa.trim()) {
      return {
        success: false,
        error: 'Nomor WhatsApp tidak boleh kosong.'
      };
    }

    // Sanitasi menyeluruh non-digit & normalisasi 08.../+62... -> 628...
    const cleanNoWa = formatPhoneNumber(data.no_wa.trim());
    if (!cleanNoWa || cleanNoWa.length < 9) {
      return {
        success: false,
        error:
          'Format nomor WhatsApp tidak valid. Masukkan nomor HP Indonesia yang sah (minimal 9 digit).'
      };
    }

    // 3. Siapkan client Supabase
    let supabase: any = null;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      supabase = getIndependentSupabaseClient();
    }

    if (!supabase) {
      supabase = getIndependentSupabaseClient();
    }

    if (!supabase) {
      return {
        success: false,
        error: 'Koneksi ke database Supabase gagal diinisialisasi.'
      };
    }

    // 4. Periksa apakah record sudah ada berdasarkan id
    const { data: existing, error: checkErr } = await supabase
      .from('kontak_pilar')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    let resultRecord: KontakPilarRecord;

    if (existing && !checkErr) {
      // Update record yang ada
      const updatePayload: Record<string, unknown> = {
        nama_pic: data.nama_pic.trim(),
        no_wa: cleanNoWa,
        updated_at: new Date().toISOString()
      };

      if (data.jabatan !== undefined)
        updatePayload.jabatan = data.jabatan.trim();
      if (data.email !== undefined) updatePayload.email = data.email.trim();
      if (data.is_active !== undefined)
        updatePayload.is_active = data.is_active;

      const { data: updated, error: updateErr } = await supabase
        .from('kontak_pilar')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (updateErr) {
        throw new Error(
          `Gagal memperbarui record kontak: ${updateErr.message}`
        );
      }
      resultRecord = updated as KontakPilarRecord;
    } else {
      // Record belum ada (misal data baru dari fallback statis), lakukan INSERT
      const isPilar = id >= 1 && id <= 6;
      const fallback = isPilar ? DEFAULT_PILAR_CONTACTS[id] : null;

      const insertPayload = {
        id_pilar: isPilar ? id : null,
        kategori: isPilar ? 'pilar' : 'verifikator',
        nama_pilar:
          fallback?.namaPilar ||
          (isPilar ? `Pilar ${id}` : 'Tim Verifikator Internal ZI/RB'),
        nama_pic: data.nama_pic.trim(),
        jabatan:
          data.jabatan?.trim() ||
          (isPilar
            ? `Koordinator ${fallback?.namaPilar || `Pilar ${id}`}`
            : 'Tim Verifikator Internal ZI/RB BPS Sitaro'),
        no_wa: cleanNoWa,
        email:
          data.email?.trim() ||
          (isPilar
            ? `pilar${id}.sitaro@bps.go.id`
            : 'verifikator.sitaro@bps.go.id'),
        is_active: data.is_active !== undefined ? data.is_active : true,
        updated_at: new Date().toISOString()
      };

      const { data: inserted, error: insErr } = await supabase
        .from('kontak_pilar')
        .insert(insertPayload)
        .select()
        .single();

      if (insErr) {
        throw new Error(`Gagal membuat record kontak baru: ${insErr.message}`);
      }
      resultRecord = inserted as KontakPilarRecord;
    }

    // 5. Revalidasi cache Next.js
    revalidatePath('/rebo/admin/kontak');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      data: resultRecord,
      message: `Kontak ${resultRecord.nama_pic} (${resultRecord.nama_pilar || 'Pilar'}) berhasil diperbarui!`
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[KONTAK-ACTIONS] Error updateKontakAction:', err?.message);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat memperbarui kontak.'
    };
  }
}

/**
 * Menambahkan kontak baru (PIC Pilar atau Verifikator) dengan sanitasi nomor WhatsApp
 * dan normalisasi ke standar internasional 628...
 */
export async function createKontakAction(data: {
  nama_pic: string;
  no_wa: string;
  jabatan?: string;
  email?: string;
  id_pilar?: number | null;
  nama_pilar?: string;
  kategori?: string;
  is_active?: boolean;
}): Promise<KontakActionResult<KontakPilarRecord>> {
  try {
    const session = await getCurrentUserSession();
    if (!isAdmin(session.role) && !isTPI(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Administrator atau Tim Verifikator yang berhak menambahkan kontak.'
      };
    }

    if (!data.nama_pic || !data.nama_pic.trim()) {
      return {
        success: false,
        error: 'Nama PIC tidak boleh kosong.'
      };
    }

    if (!data.no_wa || !data.no_wa.trim()) {
      return {
        success: false,
        error: 'Nomor WhatsApp tidak boleh kosong.'
      };
    }

    const cleanNoWa = formatPhoneNumber(data.no_wa.trim());
    if (!cleanNoWa || cleanNoWa.length < 9) {
      return {
        success: false,
        error:
          'Format nomor WhatsApp tidak valid. Masukkan nomor HP Indonesia yang sah (minimal 9 digit).'
      };
    }

    let supabase: any = null;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      supabase = getIndependentSupabaseClient();
    }

    if (!supabase) {
      supabase = getIndependentSupabaseClient();
    }

    if (!supabase) {
      return {
        success: false,
        error: 'Koneksi ke database Supabase gagal diinisialisasi.'
      };
    }

    const isPilar =
      data.id_pilar !== undefined &&
      data.id_pilar !== null &&
      data.id_pilar >= 1 &&
      data.id_pilar <= 6;

    const insertPayload = {
      id_pilar: isPilar ? data.id_pilar : null,
      kategori: data.kategori || (isPilar ? 'pilar' : 'verifikator'),
      nama_pilar:
        data.nama_pilar?.trim() ||
        (isPilar ? `Pilar ${data.id_pilar}` : 'Tim Verifikator Internal ZI/RB'),
      nama_pic: data.nama_pic.trim(),
      jabatan:
        data.jabatan?.trim() ||
        (isPilar
          ? `Koordinator Pilar ${data.id_pilar}`
          : 'Tim Verifikator Internal ZI/RB BPS Sitaro'),
      no_wa: cleanNoWa,
      email: data.email?.trim() || '',
      is_active: data.is_active !== undefined ? data.is_active : true,
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error: insErr } = await supabase
      .from('kontak_pilar')
      .insert(insertPayload)
      .select()
      .single();

    if (insErr) {
      throw new Error(`Gagal membuat record kontak baru: ${insErr.message}`);
    }

    revalidatePath('/rebo/admin/kontak');
    revalidatePath('/rebo/overview');

    return {
      success: true,
      data: inserted as KontakPilarRecord,
      message: `Kontak ${inserted.nama_pic} berhasil ditambahkan!`
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[KONTAK-ACTIONS] Error createKontakAction:', err?.message);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat menambahkan kontak baru.'
    };
  }
}

// ==============================================================================
// 3. SEND TEST NOTIFICATION
// ==============================================================================

/**
 * Mengirimkan pesan WhatsApp pengujian interaktif ke nomor yang dipilih
 * melalui Redis Queue (non-blocking) untuk diproses otomatis oleh Worker.
 */
export async function sendTestNotificationAction(
  phone: string,
  targetName: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  jobId?: string;
  status?: string;
  waDeepLink?: string;
}> {
  try {
    if (!phone || !phone.trim()) {
      return {
        success: false,
        error: 'Nomor WhatsApp tujuan wajib diisi.',
        message: ''
      };
    }

    const cleanPhone = formatPhoneNumber(phone.trim());
    if (!cleanPhone) {
      return {
        success: false,
        error: 'Nomor WhatsApp tujuan tidak valid.',
        message: ''
      };
    }

    const recipientName = targetName?.trim() || 'Bapak/Ibu PIC';

    const now = new Date();
    const timeFormatted = now.toLocaleString('id-ID', {
      timeZone: 'Asia/Makassar',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const testMessage = `🔔 *UJI COBA NOTIFIKASI WHATSAPP - REBO V2*
*BPS KABUPATEN KEPULAUAN SITARO*

Halo *${recipientName}*,

Pesan ini merupakan uji coba notifikasi resmi dari sistem *REBO V2 (Reformasi Birokrasi Online)* BPS Kabupaten Kepulauan Sitaro.

━━━━━━━━━━━━━━━━━━━━━
📋 *Status Pengujian:*
• Status Antrean : 🟡 Masuk Antrean Redis & Diproses Worker
• Waktu Pengujian : ${timeFormatted} WITA
• Nomor Tujuan   : ${cleanPhone}
━━━━━━━━━━━━━━━━━━━━━

Nomor WhatsApp Anda telah terdaftar sebagai saluran resmi untuk menerima:
1. 📤 Pemberitahuan Pengajuan Bukti Dukung ZI/RB
2. ✅ Konfirmasi Persetujuan Verifikasi Bukti Dukung
3. ⚠️ Catatan & Permintaan Revisi dari Verifikator
4. ⏰ Peringatan Batas Waktu Pengisian LKE (H-14, H-7, H-3)

Terima kasih atas dedikasi dan kerja sama dalam pembangunan Zona Integritas BPS Kabupaten Kepulauan Sitaro! 🙏

_Pesan otomatis dikirim oleh Sistem REBO V2 BPS Sitaro via Redis Queue_`;

    // 1. Daftarkan pekerjaan ke antrean Redis secara non-blocking (< 20ms)
    const enqueueRes = await enqueueWhatsAppNotification({
      type: 'TEST_WA',
      targetPhone: cleanPhone,
      message: testMessage,
      metadata: {
        recipientName,
        source: 'admin_kontak_test',
        enqueuedAt: now.toISOString()
      }
    });

    if (!enqueueRes.success || !enqueueRes.jobId) {
      return {
        success: false,
        error:
          enqueueRes.error ||
          'Gagal mendaftarkan pesan uji coba ke antrean Redis.',
        message: ''
      };
    }

    // 2. Catat audit log tanpa memblokir alur
    try {
      const session = await getCurrentUserSession().catch(() => null);
      const client = getIndependentSupabaseClient();
      const supabase = client || (await createServerSupabaseClient());
      await supabase.from('audit_log').insert({
        id_pertanyaan_periode: null,
        action: 'TEST_WA_KONTAK',
        old_state: null,
        new_state: {
          phone: cleanPhone,
          target_name: recipientName,
          jobId: enqueueRes.jobId,
          status: 'queued',
          queued: true
        },
        user_id: session?.userId || null,
        user_name: session?.fullName || 'Administrator',
        role: session?.role || 'admin',
        created_at: new Date().toISOString()
      });
    } catch (auditErr: any) {
      console.warn(
        '[KONTAK-ACTIONS] Notice recording audit log for test WA:',
        auditErr?.message
      );
    }

    return {
      success: true,
      message: `Pesan uji coba untuk ${recipientName} (${cleanPhone}) berhasil didaftarkan ke antrean sistem (Redis Queue) dengan Job ID: ${enqueueRes.jobId}. Worker akan mengirimkannya otomatis ke WhatsApp.`,
      jobId: enqueueRes.jobId,
      status: 'queued'
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[KONTAK-ACTIONS] Error sendTestNotificationAction:',
      err?.message
    );
    return {
      success: false,
      message: '',
      error:
        err?.message ||
        'Terjadi kesalahan saat mendaftarkan pengujian WhatsApp ke antrean.'
    };
  }
}

// ==============================================================================
// 4. TRIGGER MANUAL REMINDER
// ==============================================================================

/**
 * Memanggil fungsi executeReminders dari src/lib/notifications/reminders.ts
 * secara manual atas permintaan admin.
 */
export async function triggerManualReminderAction(
  mode: 'deadline' | 'recap'
): Promise<{
  success: boolean;
  message: string;
  result?: ReminderExecutionResult;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!isAdmin(session.role) && !isTPI(session.role)) {
      return {
        success: false,
        message:
          'Akses ditolak: Hanya Admin atau Tim Verifikator yang berhak menjalankan pengingat manual.',
        error: 'Unauthorized'
      };
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://rebo-bps-sitaro.vercel.app';

    // Panggil executeReminders dengan opsi force: true agar terkirim langsung
    const execResult = await executeReminders({
      mode,
      force: true,
      appUrl
    });

    if (execResult.success) {
      let summaryText = execResult.summaryText;
      if (!summaryText) {
        if (mode === 'deadline') {
          const sentCount = execResult.pilarResults.filter(
            (r: PilarReminderDetail) => r.sent
          ).length;
          summaryText = `Pengingat deadline berhasil diproses untuk ${execResult.pilarResults.length} pilar (${sentCount} pesan terkirim).`;
        } else {
          summaryText =
            'Rekapitulasi mingguan berhasil dikirimkan ke nomor Admin & Tim Verifikator.';
        }
      }

      return {
        success: true,
        message: summaryText,
        result: execResult
      };
    } else {
      return {
        success: false,
        message: execResult.error || 'Gagal memproses pengingat manual.',
        error: execResult.error,
        result: execResult
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[KONTAK-ACTIONS] Error triggerManualReminderAction:',
      err?.message
    );
    return {
      success: false,
      message:
        err?.message || 'Terjadi kesalahan saat mengeksekusi pengingat manual.',
      error: err?.message
    };
  }
}

// ==============================================================================
// 5. GET GATEWAY STATUS
// ==============================================================================

/**
 * Memeriksa endpoint WHATSAPP_GATEWAY_URL/ atau /health untuk mengetahui apakah
 * gateway aktif dan status koneksi WhatsApp saat ini.
 */
export async function getGatewayStatusAction(): Promise<GatewayStatusResult> {
  const rawUrl =
    process.env.WHATSAPP_GATEWAY_URL || process.env.WA_GATEWAY_URL || '';

  if (!rawUrl.trim()) {
    return {
      configured: false,
      online: false,
      connected: false,
      gatewayUrl: '',
      phone: null,
      botName: null,
      hasActiveQr: false,
      message:
        'URL WhatsApp Gateway belum dikonfigurasi di Environment Variables (WHATSAPP_GATEWAY_URL).'
    };
  }

  const baseUrl = rawUrl.trim().replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    // Tingkatkan timeout dari 4500ms ke 10000ms untuk toleransi cold start Render
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const isConnected =
        data.status === 'CONNECTED' || data.connected === true;

      return {
        configured: true,
        online: true,
        connected: isConnected,
        gatewayUrl: baseUrl,
        phone: data.phone || null,
        botName: data.service || 'REBO V2 WhatsApp Gateway',
        hasActiveQr: Boolean(data.hasActiveQr),
        message:
          data.message ||
          (isConnected
            ? 'WhatsApp Gateway Aktif & Terhubung'
            : 'WhatsApp Gateway Aktif, Belum Terhubung')
      };
    }

    // Coba fallback ke /health
    const healthController = new AbortController();
    const healthTimeout = setTimeout(() => healthController.abort(), 8000);

    const healthRes = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: healthController.signal,
      cache: 'no-store'
    });
    clearTimeout(healthTimeout);

    if (healthRes.ok) {
      const healthData = await healthRes.json();
      return {
        configured: true,
        online: true,
        connected: Boolean(healthData.connected),
        gatewayUrl: baseUrl,
        phone: null,
        botName: 'REBO V2 WhatsApp Gateway',
        hasActiveQr: false,
        message: healthData.connected
          ? 'WhatsApp Terhubung'
          : 'WhatsApp Belum Terhubung'
      };
    }

    return {
      configured: true,
      online: false,
      connected: false,
      gatewayUrl: baseUrl,
      phone: null,
      botName: null,
      hasActiveQr: false,
      message: `Gateway merespons dengan HTTP Status ${res.status}`
    };
  } catch (error: unknown) {
    const err = error as Error;
    const isTimeout =
      err?.name === 'AbortError' ||
      err?.name === 'TimeoutError' ||
      err?.message?.toLowerCase().includes('aborted') ||
      err?.message?.toLowerCase().includes('timeout');

    return {
      configured: true,
      online: false,
      connected: false,
      gatewayUrl: baseUrl,
      phone: null,
      botName: null,
      hasActiveQr: false,
      message: isTimeout
        ? 'Koneksi ke gateway timeout (10 detik). Layanan di Render mungkin sedang tertidur (sleep) atau sedang booting.'
        : `Tidak dapat menghubungi gateway (${err?.message || 'Offline'}).`
    };
  }
}
