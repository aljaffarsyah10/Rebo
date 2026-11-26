/* eslint-disable no-console */
/**
 * Automated Reminders & Progress Recap Engine untuk REBO V2
 *
 * Mengotomasi:
 * 1. Pengingat batas waktu pengisian Lembar Kerja Evaluasi (LKE) ZI/RB ke PIC Pilar
 *    (khusus pilar yang masih memiliki indikator 'Belum Diisi' atau 'Perlu Revisi').
 * 2. Rekapitulasi progres mingguan / eksekutif ke Admin & Pimpinan BPS Sitaro.
 * 3. Pencatatan audit trail otomatis ke tabel `public.audit_log`.
 */

import { createClient } from '@supabase/supabase-js';
import {
  getPilarContact,
  getAllContacts,
  getDefaultNotificationReceiver
} from './contacts';
import {
  sendWhatsAppMessage,
  formatDeadlineReminderMessage,
  formatWeeklyRecapMessage
} from './whatsapp';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';
import type { PeriodeEvaluasi } from '@/types/rebo';

export interface PilarProgressStat {
  pilarId: number;
  namaPilar: string;
  total: number;
  belumDiisi: number;
  perluRevisi: number;
  menungguReview: number;
  disetujui: number;
  persenDisetujui: number;
  hasPendingTasks: boolean;
  pic?: {
    namaPic: string;
    noWa: string;
  } | null;
}

export interface GlobalProgressStats {
  total: number;
  belumDiisi: number;
  perluRevisi: number;
  menungguReview: number;
  disetujui: number;
  persenDisetujui: number;
}

export interface ReminderEngineOptions {
  mode?: 'all' | 'deadline' | 'recap';
  force?: boolean; // Paksa kirim pengingat meskipun bukan hari milestone H-30, H-14, H-7, H-3, H-1
  dryRun?: boolean; // Mode preview simulasi (tidak mengirim pesan WA sungguhan)
  targetPilarId?: number; // Filter khusus 1 pilar tertentu (1-6)
  customDeadline?: string; // Tanggal deadline khusus (YYYY-MM-DD)
  appUrl?: string; // Base URL aplikasi REBO
}

export interface PilarReminderDetail {
  pilarId: number;
  namaPilar: string;
  picName: string;
  phone: string;
  stats: PilarProgressStat;
  message: string;
  sent: boolean;
  simulated: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

export interface AdminRecapDetail {
  recipients: string[];
  message: string;
  sent: boolean;
  simulated: boolean;
  error?: string;
}

export interface ReminderExecutionResult {
  success: boolean;
  timestamp: string;
  mode: 'all' | 'deadline' | 'recap';
  dryRun: boolean;
  periode: {
    id: string;
    tahun: number;
    nama: string;
    tanggalSelesai: string;
    sisaHari: number;
  };
  isDeadlineMilestone: boolean;
  milestoneLabel: string;
  globalStats: GlobalProgressStats;
  pilarResults: PilarReminderDetail[];
  adminRecapResult?: AdminRecapDetail | null;
  auditLogsCount: number;
  summaryText: string;
  error?: string;
}

// Standar hari pengingat deadline ZI/RB
export const DEADLINE_MILESTONES = [30, 14, 7, 3, 1, 0];

// Mapping pilar fungsional (1-6) standar ZI/RB BPS Sitaro
export const PILAR_NAMES: Record<number, string> = {
  1: 'Pilar 1 - Manajemen Perubahan',
  2: 'Pilar 2 - Penataan Tatalaksana',
  3: 'Pilar 3 - Penataan Sistem Manajemen SDM',
  4: 'Pilar 4 - Penguatan Akuntabilitas',
  5: 'Pilar 5 - Penguatan Pengawasan',
  6: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik'
};

function getSupabaseClient() {
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
 * Normalisasi id_pilar (1-12) dari database menjadi functional pilarId (1-6)
 * (Pilar 1 & 7 = Pilar 1, Pilar 2 & 8 = Pilar 2, dst)
 */
export function normalizeFunctionalPilarId(idPilar: number): number {
  if (idPilar <= 6) return idPilar;
  return ((idPilar - 1) % 6) + 1;
}

/**
 * Format tanggal Indonesia ramah pengguna (contoh: 31 Desember 2026)
 */
export function formatIndonesianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Eksekusi Engine Pengingat Deadline & Rekapitulasi Progres Notifikasi WhatsApp
 */
export async function executeWaReminderEngine(
  options: ReminderEngineOptions = {}
): Promise<ReminderExecutionResult> {
  const mode = options.mode || 'all';
  const dryRun = Boolean(options.dryRun);
  const force = Boolean(options.force);
  const targetPilar = options.targetPilarId
    ? Number(options.targetPilarId)
    : null;
  const appUrl =
    options.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const timestamp = new Date().toISOString();

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error(
      'Koneksi Supabase tidak terkonfigurasi (NEXT_PUBLIC_SUPABASE_URL / KEY missing).'
    );
  }

  // 1. Ambil Periode Evaluasi Aktif
  const { data: periodeRows, error: pError } = await supabase
    .from('periode_evaluasi')
    .select('*')
    .eq('is_active', true)
    .order('tahun', { ascending: false })
    .limit(1);

  if (pError || !periodeRows || periodeRows.length === 0) {
    // Fallback ke periode tahun terbaru jika tidak ada flag is_active
    const { data: fallbackRows } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .order('tahun', { ascending: false })
      .limit(1);

    if (!fallbackRows || fallbackRows.length === 0) {
      throw new Error('Tidak ada data periode evaluasi di database.');
    }
  }

  const activePeriode: PeriodeEvaluasi = (
    periodeRows && periodeRows.length > 0 ? periodeRows[0] : null
  ) as any;

  const tahunPeriode = activePeriode?.tahun || new Date().getFullYear();
  const namaPeriode =
    activePeriode?.nama_periode || `Evaluasi PMPRB ${tahunPeriode}`;

  // Tentukan tanggal deadline selesai
  let tanggalSelesaiStr =
    options.customDeadline ||
    activePeriode?.tanggal_selesai ||
    `${tahunPeriode}-12-31`;

  // Hitung sisa hari jelang deadline
  const now = new Date();
  const deadlineDate = new Date(`${tanggalSelesaiStr}T23:59:59+08:00`);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isDeadlineMilestone = DEADLINE_MILESTONES.includes(sisaHari);
  let milestoneLabel = `H-${sisaHari}`;
  if (sisaHari === 0) milestoneLabel = 'HARI-H';
  if (sisaHari < 0) milestoneLabel = `TERLEWAT (${Math.abs(sisaHari)} hari)`;

  // 2. Ambil data struktur pilar & pertanyaan
  const { data: subpilarData, error: spError } = await supabase
    .from('subpilar')
    .select('id_subpilar, id_pilar, pertanyaan (id_pertanyaan)');

  if (spError || !subpilarData) {
    throw new Error(
      `Gagal mengambil master data subpilar/pertanyaan: ${spError?.message}`
    );
  }

  // Petakan id_pertanyaan ke functional pilar (1-6)
  const questionToPilarMap = new Map<string, number>();
  for (const sp of subpilarData) {
    const functionalPilarId = normalizeFunctionalPilarId(Number(sp.id_pilar));
    const questions = (sp as any).pertanyaan || [];
    for (const q of questions) {
      questionToPilarMap.set(String(q.id_pertanyaan), functionalPilarId);
    }
  }

  // 3. Ambil data pertanyaan_periode untuk periode aktif
  const { data: ppData, error: ppError } = await supabase
    .from('pertanyaan_periode')
    .select('id_pertanyaan, status_kelengkapan')
    .eq('id_periode', activePeriode.id);

  if (ppError) {
    throw new Error(
      `Gagal mengambil data pertanyaan_periode: ${ppError.message}`
    );
  }

  // Inisialisasi statistik 6 pilar
  const statsByPilar: Record<number, PilarProgressStat> = {};
  for (let i = 1; i <= 6; i++) {
    statsByPilar[i] = {
      pilarId: i,
      namaPilar: PILAR_NAMES[i] || `Pilar ${i}`,
      total: 0,
      belumDiisi: 0,
      perluRevisi: 0,
      menungguReview: 0,
      disetujui: 0,
      persenDisetujui: 0,
      hasPendingTasks: false,
      pic: null
    };
  }

  // Agregasi status kelengkapan per pilar
  for (const pp of ppData || []) {
    const fPilarId = questionToPilarMap.get(String(pp.id_pertanyaan));
    if (fPilarId && statsByPilar[fPilarId]) {
      const pilarStat = statsByPilar[fPilarId];
      pilarStat.total += 1;
      const status = Number(pp.status_kelengkapan);
      if (status === 0) pilarStat.belumDiisi += 1;
      else if (status === 1) pilarStat.menungguReview += 1;
      else if (status === 2) pilarStat.disetujui += 1;
      else if (status === 3) pilarStat.perluRevisi += 1;
    }
  }

  // Hitung persentase dan muat info PIC untuk tiap pilar
  const globalStats: GlobalProgressStats = {
    total: 0,
    belumDiisi: 0,
    perluRevisi: 0,
    menungguReview: 0,
    disetujui: 0,
    persenDisetujui: 0
  };

  for (let i = 1; i <= 6; i++) {
    const pStat = statsByPilar[i];
    pStat.persenDisetujui =
      pStat.total > 0 ? Math.round((pStat.disetujui / pStat.total) * 100) : 0;
    pStat.hasPendingTasks = pStat.belumDiisi + pStat.perluRevisi > 0;
    pStat.pic = await getPilarContact(i);

    globalStats.total += pStat.total;
    globalStats.belumDiisi += pStat.belumDiisi;
    globalStats.perluRevisi += pStat.perluRevisi;
    globalStats.menungguReview += pStat.menungguReview;
    globalStats.disetujui += pStat.disetujui;
  }

  globalStats.persenDisetujui =
    globalStats.total > 0
      ? Math.round((globalStats.disetujui / globalStats.total) * 100)
      : 0;

  const tanggalSelesaiFormatted = formatIndonesianDate(tanggalSelesaiStr);

  const pilarResults: PilarReminderDetail[] = [];
  const auditLogsToInsert: any[] = [];

  // ==============================================================================
  // 4. Pengiriman Notifikasi Pengingat Deadline ke PIC Pilar
  // ==============================================================================
  const shouldProcessDeadline = mode === 'all' || mode === 'deadline';

  if (shouldProcessDeadline) {
    const isTriggerEligible = force || isDeadlineMilestone;

    for (let i = 1; i <= 6; i++) {
      if (targetPilar && targetPilar !== i) continue;

      const pStat = statsByPilar[i];
      const pic = pStat.pic;
      const picName = pic?.namaPic || `Koordinator Pilar ${i}`;
      const phone = pic?.noWa || '';

      // Cek apakah pilar memiliki tugas yang masih tertunda
      if (!pStat.hasPendingTasks) {
        pilarResults.push({
          pilarId: i,
          namaPilar: pStat.namaPilar,
          picName,
          phone,
          stats: pStat,
          message: '',
          sent: false,
          simulated: dryRun,
          skipped: true,
          reason:
            'Pilar sudah 100% lengkap (tidak ada indikator Belum Diisi / Perlu Revisi)'
        });
        continue;
      }

      if (!isTriggerEligible) {
        pilarResults.push({
          pilarId: i,
          namaPilar: pStat.namaPilar,
          picName,
          phone,
          stats: pStat,
          message: '',
          sent: false,
          simulated: dryRun,
          skipped: true,
          reason: `Hari ini (H-${sisaHari}) bukan milestone deadline standar [${DEADLINE_MILESTONES.join(', ')}]. Gunakan opsi force=true untuk memicu manual.`
        });
        continue;
      }

      // Format template pengingat deadline
      const reminderMsg = formatDeadlineReminderMessage({
        namaPic: picName,
        namaPilar: pStat.namaPilar,
        pilarId: i,
        tahun: tahunPeriode,
        tanggalSelesaiFormatted,
        sisaHari,
        belumDiisi: pStat.belumDiisi,
        perluRevisi: pStat.perluRevisi,
        menungguReview: pStat.menungguReview,
        disetujui: pStat.disetujui,
        total: pStat.total,
        persenDisetujui: pStat.persenDisetujui,
        appUrl
      });

      let sent = false;
      let errorMsg: string | undefined;

      if (!dryRun) {
        if (phone) {
          // Masukkan ke antrean Redis secara non-blocking
          const enqueueRes = await enqueueWhatsAppNotification({
            type: 'DEADLINE_ALERT',
            targetPhone: phone,
            message: reminderMsg,
            metadata: {
              source: 'reminder_engine_deadline',
              pilarId: i,
              pilarNama: pStat.namaPilar,
              pic: picName,
              sisaHari,
              milestone: milestoneLabel
            }
          });
          sent = enqueueRes.success;
          if (!enqueueRes.success) {
            errorMsg = enqueueRes.error;
          }
        } else {
          errorMsg = 'Nomor WhatsApp PIC tidak ditemukan.';
        }

        // Catat ke audit_log
        auditLogsToInsert.push({
          id_pertanyaan_periode: null,
          action: 'NOTIF_WA_DEADLINE_REMINDER',
          old_state: null,
          new_state: {
            pilarId: i,
            pilarNama: pStat.namaPilar,
            pic: picName,
            phone,
            sisaHari,
            milestone: milestoneLabel,
            stats: {
              belumDiisi: pStat.belumDiisi,
              perluRevisi: pStat.perluRevisi,
              menungguReview: pStat.menungguReview,
              disetujui: pStat.disetujui,
              total: pStat.total
            },
            status: sent ? 'SENT' : 'FAILED',
            error: errorMsg || null
          },
          user_id: 'SYSTEM_CRON',
          user_name: 'REBO Reminder Engine',
          role: 'SYSTEM',
          created_at: timestamp
        });
      }

      pilarResults.push({
        pilarId: i,
        namaPilar: pStat.namaPilar,
        picName,
        phone,
        stats: pStat,
        message: reminderMsg,
        sent: dryRun ? false : sent,
        simulated: dryRun,
        error: errorMsg
      });
    }
  }

  // ==============================================================================
  // 5. Pengiriman Rekapitulasi Progres ke Admin / Pimpinan BPS Sitaro
  // ==============================================================================
  let adminRecapResult: AdminRecapDetail | null = null;
  const shouldProcessRecap = mode === 'all' || mode === 'recap';

  if (shouldProcessRecap) {
    const recapMsg = formatWeeklyRecapMessage({
      tahun: tahunPeriode,
      namaPeriode,
      tanggalSelesaiFormatted,
      sisaHari,
      globalStats,
      pilarList: Object.values(statsByPilar),
      appUrl
    });

    // Ambil nomor kontak Admin / Verifikator
    const allContacts = await getAllContacts();
    const adminRecipients: string[] = [];

    allContacts
      .filter(
        (c) =>
          (c.kategori === 'admin' || c.kategori === 'verifikator') &&
          c.is_active &&
          c.no_wa
      )
      .forEach((c) => {
        if (!adminRecipients.includes(c.no_wa)) {
          adminRecipients.push(c.no_wa);
        }
      });

    if (adminRecipients.length === 0) {
      adminRecipients.push(getDefaultNotificationReceiver());
    }

    let recapSent = false;
    let recapError: string | undefined;

    if (!dryRun) {
      for (const adminPhone of adminRecipients) {
        // Masukkan ke antrean Redis secara non-blocking
        const enqueueRes = await enqueueWhatsAppNotification({
          type: 'DEADLINE_ALERT',
          targetPhone: adminPhone,
          message: recapMsg,
          metadata: {
            source: 'reminder_engine_recap',
            sisaHari,
            tahun: tahunPeriode
          }
        });
        if (enqueueRes.success) recapSent = true;
        else recapError = enqueueRes.error;
      }

      // Catat ke audit_log
      auditLogsToInsert.push({
        id_pertanyaan_periode: null,
        action: 'NOTIF_WA_WEEKLY_RECAP',
        old_state: null,
        new_state: {
          periodeId: activePeriode.id,
          tahun: tahunPeriode,
          sisaHari,
          milestone: milestoneLabel,
          globalStats,
          recipients: adminRecipients,
          status: recapSent ? 'SENT' : 'FAILED',
          error: recapError || null
        },
        user_id: 'SYSTEM_CRON',
        user_name: 'REBO Recap Engine',
        role: 'SYSTEM',
        created_at: timestamp
      });
    }

    adminRecapResult = {
      recipients: adminRecipients,
      message: recapMsg,
      sent: dryRun ? false : recapSent,
      simulated: dryRun,
      error: recapError
    };
  }

  // 6. Tulis semua audit_log secara batch jika bukan dryRun
  let auditLogsCount = 0;
  if (!dryRun && auditLogsToInsert.length > 0) {
    try {
      const { data: insertedLogs, error: logError } = await supabase
        .from('audit_log')
        .insert(auditLogsToInsert)
        .select('id');

      if (logError) {
        console.warn(
          '[REMINDER-ENGINE] Warning inserting audit logs:',
          logError.message
        );
      } else {
        auditLogsCount = insertedLogs?.length || auditLogsToInsert.length;
      }
    } catch (err: any) {
      console.warn(
        '[REMINDER-ENGINE] Exception inserting audit logs:',
        err.message
      );
    }
  }

  const sentCount = pilarResults.filter((r) => r.sent).length;
  const skippedCount = pilarResults.filter((r) => r.skipped).length;

  const summaryText =
    `[REBO Reminder Engine] Mode=${mode}, DryRun=${dryRun}. ` +
    `Periode=${tahunPeriode} (${milestoneLabel}, sisa ${sisaHari} hari). ` +
    `PIC Reminders: ${sentCount} terkirim, ${skippedCount} dilewati. ` +
    `Admin Recap: ${adminRecapResult ? (adminRecapResult.sent || dryRun ? 'SUCCESS' : 'FAILED') : 'SKIPPED'}. ` +
    `Audit Logs: ${auditLogsCount} tercatat.`;

  console.log(summaryText);

  return {
    success: true,
    timestamp,
    mode,
    dryRun,
    periode: {
      id: activePeriode.id,
      tahun: tahunPeriode,
      nama: namaPeriode,
      tanggalSelesai: tanggalSelesaiStr,
      sisaHari
    },
    isDeadlineMilestone,
    milestoneLabel,
    globalStats,
    pilarResults,
    adminRecapResult,
    auditLogsCount,
    summaryText
  };
}

// Alias untuk kemudahan integrasi Server Actions
export const executeReminders = executeWaReminderEngine;
