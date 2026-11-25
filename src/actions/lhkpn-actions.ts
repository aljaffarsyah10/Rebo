/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import {
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import {
  LHKPNReport,
  LHKPNSummary,
  SubmitBuktiLaporInput,
  DEFAULT_MOCK_LHKPN_REPORTS,
  calculateLHKPNSummary,
  calculateDaysUntilDeadline,
  formatLHKPNReminderWAMessage
} from '@/lib/compliance/lhkpn-types';

// ==============================================================================
// IN-MEMORY PERSISTENCE STORE
// Mempertahankan status pelaporan & reminder secara real-time pada sesi server
// ==============================================================================
const globalLHKPNStore: LHKPNReport[] = [...DEFAULT_MOCK_LHKPN_REPORTS];

function getStore(): LHKPNReport[] {
  return globalLHKPNStore;
}

/**
 * 1. Mengambil Rekapitulasi & Daftar Kepatuhan e-LHKPN & e-LHKASN
 */
export async function getLHKPNComplianceListAction(
  tahun: number = 2026
): Promise<{
  success: boolean;
  data: LHKPNReport[];
  summary: LHKPNSummary;
  error?: string;
}> {
  try {
    const store = getStore();
    const filtered = store.filter((r) => r.tahun_pelaporan === tahun);
    const summary = calculateLHKPNSummary(filtered, tahun);

    return {
      success: true,
      data: filtered,
      summary
    };
  } catch (err: any) {
    console.error('[LHKPN] Gagal mengambil data kepatuhan:', err);
    return {
      success: false,
      data: [],
      summary: calculateLHKPNSummary([], tahun),
      error: err?.message || 'Gagal mengambil data kepatuhan'
    };
  }
}

/**
 * 2. Form Mandiri Pegawai: Submit Bukti Nomor & Tautan Tanda Terima e-LHKPN/e-LHKASN
 */
export async function submitBuktiLaporAction(
  data: SubmitBuktiLaporInput
): Promise<{
  success: boolean;
  data?: LHKPNReport;
  error?: string;
}> {
  try {
    if (!data.nomor_tanda_terima || data.nomor_tanda_terima.trim().length < 5) {
      return {
        success: false,
        error: 'Nomor tanda terima elektronik wajib diisi minimal 5 karakter.'
      };
    }

    if (!data.tanggal_lapor) {
      return {
        success: false,
        error: 'Tanggal pelaporan wajib dipilih.'
      };
    }

    const store = getStore();
    let targetIndex = -1;

    if (data.id) {
      targetIndex = store.findIndex((r) => r.id === data.id);
    } else if (data.nip) {
      targetIndex = store.findIndex((r) => r.nip === data.nip);
    } else if (data.nama_pegawai) {
      targetIndex = store.findIndex(
        (r) => r.nama_pegawai.toLowerCase() === data.nama_pegawai?.toLowerCase()
      );
    }

    if (targetIndex === -1) {
      return {
        success: false,
        error: 'Pegawai tidak ditemukan dalam daftar wajib lapor BPS Sitaro.'
      };
    }

    const existing = store[targetIndex];
    const updated: LHKPNReport = {
      ...existing,
      status: 'PROSES_VERIFIKASI',
      tanggal_lapor: data.tanggal_lapor,
      nomor_tanda_terima: data.nomor_tanda_terima.trim(),
      bukti_tanda_terima_url:
        data.bukti_tanda_terima_url?.trim() || existing.bukti_tanda_terima_url,
      catatan_verifikasi:
        data.catatan_tambahan?.trim() ||
        'Bukti baru saja diunggah pegawai. Menunggu verifikasi Subbagian Umum / Tim Kepatuhan.',
      tipe_laporan: data.tipe_laporan || existing.tipe_laporan
    };

    store[targetIndex] = updated;

    revalidatePath('/rebo/compliance/lhkpn');

    return {
      success: true,
      data: updated
    };
  } catch (err: any) {
    console.error('[LHKPN] Gagal submit bukti lapor:', err);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menyimpan bukti'
    };
  }
}

/**
 * 3. Verifikasi Bukti Lapor oleh Kasubbag Umum / Admin Kepatuhan
 */
export async function verifyBuktiLaporAction(
  id: string,
  isApproved: boolean,
  catatan?: string
): Promise<{
  success: boolean;
  data?: LHKPNReport;
  error?: string;
}> {
  try {
    const store = getStore();
    const targetIndex = store.findIndex((r) => r.id === id);

    if (targetIndex === -1) {
      return { success: false, error: 'Data laporan tidak ditemukan.' };
    }

    const existing = store[targetIndex];
    const nowIso = new Date().toISOString();

    const updated: LHKPNReport = {
      ...existing,
      status: isApproved ? 'SUDAH_LAPOR' : 'BELUM_LAPOR',
      catatan_verifikasi:
        catatan?.trim() ||
        (isApproved
          ? 'Bukti tanda terima telah diverifikasi absah & sesuai ketentuan.'
          : 'Bukti tanda terima ditolak. Mohon unggah ulang bukti yang valid.'),
      verified_at: isApproved ? nowIso : undefined,
      verified_by: isApproved
        ? 'Kasubbag Umum & Tim Kepatuhan'
        : existing.verified_by
    };

    store[targetIndex] = updated;

    revalidatePath('/rebo/compliance/lhkpn');

    return {
      success: true,
      data: updated
    };
  } catch (err: any) {
    console.error('[LHKPN] Gagal verifikasi laporan:', err);
    return {
      success: false,
      error:
        err?.message || 'Terjadi kesalahan sistem saat memverifikasi laporan'
    };
  }
}

/**
 * 4. Mengirim Pesan Pengingat WhatsApp Personal ke Pegawai
 */
export async function sendLHKPNWAReminderAction(reportId: string): Promise<{
  success: boolean;
  message?: string;
  deepLink?: string;
  reminderCount?: number;
  error?: string;
}> {
  try {
    const store = getStore();
    const targetIndex = store.findIndex((r) => r.id === reportId);

    if (targetIndex === -1) {
      return { success: false, error: 'Pegawai tidak ditemukan.' };
    }

    const report = store[targetIndex];
    const daysUntilDeadline = calculateDaysUntilDeadline(
      report.tahun_pelaporan
    );
    const message = formatLHKPNReminderWAMessage(report, daysUntilDeadline);
    const deepLink = createWhatsAppDeepLink(report.no_whatsapp, message);

    // Kirim via gateway / webhook otomatis
    const sendResult = await sendWhatsAppMessage({
      phone: report.no_whatsapp,
      message
    });

    // Update status reminder count di memory
    report.reminder_count = (report.reminder_count || 0) + 1;
    report.last_reminder_sent_at = new Date().toISOString();
    store[targetIndex] = report;

    revalidatePath('/rebo/compliance/lhkpn');

    return {
      success: true,
      message: sendResult.success
        ? `Pengingat WhatsApp berhasil dikirim ke ${report.nama_pegawai} (${report.no_whatsapp}).`
        : `Pengingat disiapkan. Gunakan tautan deep link WhatsApp jika gateway tidak aktif.`,
      deepLink,
      reminderCount: report.reminder_count
    };
  } catch (err: any) {
    console.error('[LHKPN] Gagal mengirim pengingat WhatsApp:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim pengingat WhatsApp'
    };
  }
}

/**
 * 5. 1-Klik Mengirim Pengingat Serentak (Broadcast) ke Seluruh Pegawai yang Belum Lapor
 */
export async function broadcastLHKPNRemindersAction(
  tahun: number = 2026
): Promise<{
  success: boolean;
  totalTarget: number;
  totalSent: number;
  totalFailed: number;
  recipients: string[];
  error?: string;
}> {
  try {
    const store = getStore();
    const pendingReports = store.filter(
      (r) => r.tahun_pelaporan === tahun && r.status !== 'SUDAH_LAPOR'
    );

    if (pendingReports.length === 0) {
      return {
        success: true,
        totalTarget: 0,
        totalSent: 0,
        totalFailed: 0,
        recipients: []
      };
    }

    const daysUntilDeadline = calculateDaysUntilDeadline(tahun);
    const sentNames: string[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const report of pendingReports) {
      const message = formatLHKPNReminderWAMessage(report, daysUntilDeadline);
      const res = await sendWhatsAppMessage({
        phone: report.no_whatsapp,
        message
      });

      report.reminder_count = (report.reminder_count || 0) + 1;
      report.last_reminder_sent_at = new Date().toISOString();

      if (res.success) {
        sentCount++;
      } else {
        failedCount++;
      }
      sentNames.push(report.nama_pegawai);
    }

    revalidatePath('/rebo/compliance/lhkpn');

    return {
      success: true,
      totalTarget: pendingReports.length,
      totalSent: sentCount,
      totalFailed: failedCount,
      recipients: sentNames
    };
  } catch (err: any) {
    console.error('[LHKPN] Gagal broadcast pengingat:', err);
    return {
      success: false,
      totalTarget: 0,
      totalSent: 0,
      totalFailed: 0,
      recipients: [],
      error: err?.message || 'Gagal menyiarkan pengingat WhatsApp'
    };
  }
}
