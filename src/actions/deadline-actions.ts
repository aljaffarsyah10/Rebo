/* eslint-disable no-console */
'use server';

/**
 * Server Actions untuk Notifikasi Pengingat Batas Waktu (Deadline) LKE ZI/RB
 *
 * Mengintegrasikan pengingat batas waktu pengisian Lembar Kerja Evaluasi (LKE)
 * dengan Redis Message Queue dan Redis Sorted Set (Delayed/Scheduled Queue).
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import { enqueueWhatsAppNotification } from '@/lib/redis/queue';
import {
  executeReminders,
  DEADLINE_MILESTONES,
  type ReminderExecutionResult
} from '@/lib/notifications/reminders';
import {
  getPilarContact,
  DEFAULT_PILAR_CONTACTS
} from '@/lib/notifications/contacts';
import { formatDeadlineReminderMessage } from '@/lib/notifications/whatsapp';
import { createClient } from '@/lib/supabase/server';

export interface DeadlineActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Mengirimkan pengingat tenggat waktu evaluasi LKE ZI/RB ke PIC Pilar secara instan
 * melalui antrean Redis (non-blocking).
 *
 * @param targetPilarId ID Pilar spesifik (1-6) atau undefined untuk semua pilar yang belum selesai
 */
export async function sendDeadlineReminderAction(
  targetPilarId?: number
): Promise<DeadlineActionResult<ReminderExecutionResult>> {
  try {
    const session = await getCurrentUserSession();
    if (!isAdmin(session.role) && !isTPI(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Admin atau Tim Verifikator yang dapat memicu pengingat deadline.'
      };
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://rebo-bps-sitaro.vercel.app';

    const execResult = await executeReminders({
      mode: 'deadline',
      force: true,
      targetPilarId,
      appUrl
    });

    revalidatePath('/rebo/overview');
    revalidatePath('/rebo/monitoring');
    revalidatePath('/rebo/admin/kontak');

    return {
      success: execResult.success,
      message:
        execResult.summaryText ||
        'Notifikasi pengingat deadline berhasil didaftarkan ke antrean sistem.',
      data: execResult
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[DEADLINE-ACTIONS] Error sendDeadlineReminderAction:',
      err?.message
    );
    return {
      success: false,
      error: err?.message || 'Gagal memproses pengiriman pengingat deadline.'
    };
  }
}

/**
 * Menjadwalkan pengingat batas waktu ke masa depan menggunakan Redis Delayed Queue (Sorted Set).
 * Menjadwalkan notifikasi peringatan H-30, H-14, H-7, H-3, dan H-1 menjelang tanggal selesai periode.
 */
export async function scheduleDelayedDeadlineAlertsAction(
  targetPilarId?: number
): Promise<
  DeadlineActionResult<{ scheduledCount: number; milestones: number[] }>
> {
  try {
    const session = await getCurrentUserSession();
    if (!isAdmin(session.role)) {
      return {
        success: false,
        error:
          'Akses ditolak: Hanya Admin yang dapat menjadwalkan notifikasi delayed.'
      };
    }

    const supabase = await createClient();
    const { data: activePeriode, error } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !activePeriode || !activePeriode.tanggal_selesai) {
      return {
        success: false,
        error: 'Periode evaluasi aktif dengan tanggal selesai tidak ditemukan.'
      };
    }

    const deadlineDate = new Date(activePeriode.tanggal_selesai);
    const deadlineMs = deadlineDate.getTime();
    const nowMs = Date.now();

    let scheduledCount = 0;
    const scheduledMilestones: number[] = [];

    // Jadwalkan untuk setiap milestone (H-30, H-14, H-7, H-3, H-1)
    for (const hDay of DEADLINE_MILESTONES) {
      const scheduledTimeMs = deadlineMs - hDay * 24 * 60 * 60 * 1000;

      // Hanya jadwalkan jika waktu tersebut ada di masa depan (minimal 1 jam dari sekarang)
      if (scheduledTimeMs > nowMs + 3600 * 1000) {
        // Tentukan target pilar (1-6)
        const pilarsToSchedule = targetPilarId
          ? [targetPilarId]
          : [1, 2, 3, 4, 5, 6];

        for (const pilarId of pilarsToSchedule) {
          const pic = await getPilarContact(pilarId);
          if (!pic?.noWa) continue;

          const namaPilar =
            DEFAULT_PILAR_CONTACTS[pilarId]?.namaPilar || `Pilar ${pilarId}`;

          const reminderMsg = formatDeadlineReminderMessage({
            namaPic: pic.namaPic,
            namaPilar,
            pilarId,
            tahun: activePeriode.tahun,
            tanggalSelesaiFormatted: activePeriode.tanggal_selesai,
            sisaHari: hDay,
            belumDiisi: 0,
            perluRevisi: 0,
            menungguReview: 0,
            disetujui: 0,
            total: 0,
            persenDisetujui: 0
          });

          const enqueueRes = await enqueueWhatsAppNotification({
            type: 'DEADLINE_ALERT',
            targetPhone: pic.noWa,
            message: reminderMsg,
            scheduledAt: new Date(scheduledTimeMs),
            metadata: {
              source: 'scheduled_delayed_deadline',
              milestoneH: hDay,
              pilarId,
              periodeId: activePeriode.id
            }
          });

          if (enqueueRes.success) {
            scheduledCount++;
          }
        }

        scheduledMilestones.push(hDay);
      }
    }

    return {
      success: true,
      message: `Berhasil menjadwalkan ${scheduledCount} pengingat delayed ke Redis untuk milestone [${scheduledMilestones.join(', ')}].`,
      data: {
        scheduledCount,
        milestones: scheduledMilestones
      }
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      '[DEADLINE-ACTIONS] Error scheduleDelayedDeadlineAlertsAction:',
      err?.message
    );
    return {
      success: false,
      error: err?.message || 'Gagal menjadwalkan notifikasi deadline ke Redis.'
    };
  }
}
