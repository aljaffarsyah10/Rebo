/* eslint-disable no-console */
'use server';

import { headers } from 'next/headers';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserSession } from '@/lib/auth/session';
import { currentUser } from '@clerk/nextjs/server';
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp';
import {
  type DeviceInfo,
  formatSuspiciousLoginWAMessage
} from '@/lib/security/session-guard';

export interface DeviceVerificationResult {
  success: boolean;
  isNewDevice: boolean;
  alertSent: boolean;
  message?: string;
  error?: string;
}

export interface SessionTimeoutLogParams {
  timeoutMinutes?: number;
  reason?: string;
  lastPath?: string;
}

export interface SecurityActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Mendapatkan client Supabase mandiri dengan service role / anon key
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

/**
 * 1. Verifikasi Login Perangkat & Pengiriman Alert WhatsApp
 *
 * Memeriksa sidik jari perangkat (Browser, OS, platform, resolusi) terhadap riwayat
 * perangkat yang pernah digunakan pengguna. Jika belum pernah dikenali, sistem
 * otomatis mengirimkan notifikasi peringatan keamanan resmi berkop BPS Sitaro ke nomor WhatsApp pegawai.
 */
export async function verifyDeviceLoginAction(
  deviceInfo: DeviceInfo
): Promise<DeviceVerificationResult> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        isNewDevice: false,
        alertSent: false,
        error: 'Sesi berakhir atau pengguna belum login.'
      };
    }

    // Ambil IP address dari request header
    let ipAddress = '127.0.0.1';
    try {
      const headerList = await headers();
      const xForwardedFor = headerList.get('x-forwarded-for');
      if (xForwardedFor) {
        ipAddress = xForwardedFor.split(',')[0].trim();
      } else {
        ipAddress = headerList.get('x-real-ip') || '127.0.0.1';
      }
    } catch {
      // Header tidak dapat diakses (misal pada environment test)
    }

    // Ambil client Supabase
    let supabase = getIndependentSupabaseClient();
    if (!supabase) {
      supabase = await createServerSupabaseClient();
    }

    // 1. Periksa apakah perangkat ini sudah pernah tercatat di audit_log untuk user ini
    let isKnown = false;
    try {
      const { data: existingLogs, error: logErr } = await supabase
        .from('audit_log')
        .select('id, action, new_state')
        .eq('user_id', session.userId)
        .in('action', ['DEVICE_LOGIN', 'DEVICE_VERIFIED'])
        .limit(30);

      if (!logErr && existingLogs && existingLogs.length > 0) {
        // Cek apakah ada record dengan fingerprint yang sama
        isKnown = existingLogs.some((log) => {
          const state = log.new_state as Record<string, any> | null;
          return state?.fingerprint === deviceInfo.fingerprint;
        });
      }
    } catch (err) {
      console.warn(
        '[SECURITY-ACTIONS] Notice querying previous device logs:',
        err
      );
    }

    // Jika perangkat sudah dikenali sebelumnya, catat login biasa & keluar
    if (isKnown) {
      return {
        success: true,
        isNewDevice: false,
        alertSent: false,
        message: 'Perangkat telah dikenali.'
      };
    }

    // 2. Perangkat BARU / MENCURIGAKAN: Ambil nomor WhatsApp pegawai
    let userPhone: string | null = null;
    let userName = session.fullName || 'Pegawai BPS Sitaro';
    let userEmail = session.email;

    try {
      // Prioritaskan dari tabel public.users
      const { data: userData } = await supabase
        .from('users')
        .select('no_wa, telepon, full_name, email')
        .eq('id', session.userId)
        .maybeSingle();

      if (userData?.no_wa || userData?.telepon) {
        userPhone = (userData.no_wa || userData.telepon) as string;
      }
      if (userData?.full_name) {
        userName = userData.full_name;
      }
      if (userData?.email) {
        userEmail = userData.email;
      }
    } catch (err) {
      console.warn(
        '[SECURITY-ACTIONS] Error fetching user phone from db:',
        err
      );
    }

    // Fallback ambil dari profil Clerk
    if (!userPhone) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          if (!userName && (clerkUser.firstName || clerkUser.lastName)) {
            userName =
              [clerkUser.firstName, clerkUser.lastName]
                .filter(Boolean)
                .join(' ')
                .trim() || 'Pegawai BPS Sitaro';
          }
          if (clerkUser.phoneNumbers && clerkUser.phoneNumbers.length > 0) {
            userPhone = clerkUser.phoneNumbers[0].phoneNumber;
          }
        }
      } catch (err) {
        console.warn(
          '[SECURITY-ACTIONS] Error fetching clerk user profile:',
          err
        );
      }
    }

    // 3. Format dan Kirim Notifikasi WhatsApp Peringatan Keamanan
    let alertSent = false;
    if (userPhone) {
      const waMessage = formatSuspiciousLoginWAMessage({
        userName,
        userEmail,
        userPhone,
        userRole: session.role || 'user',
        deviceInfo,
        loginTime: new Date(),
        ipAddress,
        appUrl:
          process.env.APP_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'https://rebo.sitarokab.bps.go.id'
      });

      const waRes = await sendWhatsAppMessage({
        phone: userPhone,
        message: waMessage
      });
      alertSent = waRes.success;

      if (!waRes.success) {
        console.warn(
          '[SECURITY-ACTIONS] Gagal mengirim pesan WA alert:',
          waRes.error
        );
      }
    } else {
      console.info(
        `[SECURITY-ACTIONS] Nomor WA belum disetel untuk ${session.userId}. Notifikasi login dilewati.`
      );
    }

    // 4. Catat event peringatan ke tabel audit trail
    try {
      await supabase.from('audit_log').insert({
        action: 'SUSPICIOUS_LOGIN_ALERT',
        user_id: session.userId,
        user_name: userName,
        role: session.role || 'user',
        new_state: {
          event: 'NEW_DEVICE_LOGIN',
          deviceInfo: {
            fingerprint: deviceInfo.fingerprint,
            browser: deviceInfo.browser,
            browserVersion: deviceInfo.browserVersion,
            os: deviceInfo.os,
            platform: deviceInfo.platform,
            screenResolution: deviceInfo.screenResolution,
            timezone: deviceInfo.timezone,
            language: deviceInfo.language
          },
          ipAddress,
          alertSent,
          recipientPhone: userPhone || 'Belum terdaftar',
          detectedAt: new Date().toISOString()
        }
      });

      // Simpan juga sebagai DEVICE_LOGIN sehingga tidak berulang kali mengirim notifikasi untuk perangkat ini
      await supabase.from('audit_log').insert({
        action: 'DEVICE_LOGIN',
        user_id: session.userId,
        user_name: userName,
        role: session.role || 'user',
        new_state: {
          fingerprint: deviceInfo.fingerprint,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ipAddress,
          registeredAt: new Date().toISOString()
        }
      });
    } catch (err) {
      console.warn('[SECURITY-ACTIONS] Warning inserting audit log:', err);
    }

    return {
      success: true,
      isNewDevice: true,
      alertSent,
      message: alertSent
        ? 'Peringatan login dari perangkat baru telah dikirimkan ke WhatsApp Anda.'
        : 'Perangkat baru terdeteksi dan telah dicatat dalam riwayat keamanan.'
    };
  } catch (error: any) {
    console.error(
      '[SECURITY-ACTIONS] Error in verifyDeviceLoginAction:',
      error
    );
    return {
      success: false,
      isNewDevice: false,
      alertSent: false,
      error: error.message || 'Terjadi kesalahan saat memverifikasi perangkat.'
    };
  }
}

/**
 * 2. Catat Event Sesi Terkunci Otomatis ke Audit Trail (ISO 27001)
 */
export async function logSessionTimeoutAction(
  params?: SessionTimeoutLogParams
): Promise<SecurityActionResult> {
  try {
    const session = await getCurrentUserSession();
    let supabase = getIndependentSupabaseClient();
    if (!supabase) {
      supabase = await createServerSupabaseClient();
    }

    const userId = session.userId || 'system_timeout';
    const userName = session.fullName || 'Pengguna Komputer Bersama';
    const role = session.role || 'user';

    await supabase.from('audit_log').insert({
      action: 'SESSION_AUTO_TIMEOUT',
      user_id: userId,
      user_name: userName,
      role: role,
      new_state: {
        reason: params?.reason || 'INACTIVITY_TIMEOUT_30MIN',
        timeoutMinutes: params?.timeoutMinutes || 30,
        lastPath: params?.lastPath || '/rebo',
        satker: 'BPS Kabupaten Kepulauan Sitaro',
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: 'Event timeout sesi berhasil dicatat ke audit trail.'
    };
  } catch (error: any) {
    console.warn(
      '[SECURITY-ACTIONS] Error recording session timeout log:',
      error
    );
    return {
      success: false,
      error: error.message || 'Gagal mencatat audit trail timeout sesi.'
    };
  }
}

/**
 * 3. Menandai Perangkat Sebagai Terpercaya (Trust Device)
 */
export async function registerTrustedDeviceAction(
  deviceInfo: DeviceInfo
): Promise<SecurityActionResult> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        error: 'Pengguna belum terautentikasi.'
      };
    }

    let supabase = getIndependentSupabaseClient();
    if (!supabase) {
      supabase = await createServerSupabaseClient();
    }

    await supabase.from('audit_log').insert({
      action: 'DEVICE_VERIFIED',
      user_id: session.userId,
      user_name: session.fullName || 'Pegawai BPS Sitaro',
      role: session.role || 'user',
      new_state: {
        fingerprint: deviceInfo.fingerprint,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        verifiedAt: new Date().toISOString(),
        status: 'TRUSTED'
      }
    });

    return {
      success: true,
      message: 'Perangkat berhasil ditambahkan ke daftar tepercaya.'
    };
  } catch (error: any) {
    console.error(
      '[SECURITY-ACTIONS] Error registering trusted device:',
      error
    );
    return {
      success: false,
      error: error.message || 'Gagal mendaftarkan perangkat tepercaya.'
    };
  }
}
