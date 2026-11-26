/* eslint-disable no-console */
/**
 * WhatsApp Message Queue Producer & Status Reader for REBO V2
 *
 * Mengelola antrean pengiriman pesan notifikasi WhatsApp secara non-blocking
 * menggunakan Redis List, Sorted Set (delayed/scheduled), dan Dead Letter Queue (DLQ).
 */

import { randomUUID } from 'crypto';
import { getRedisClient } from './client';
import type {
  WhatsAppMessageType,
  WhatsAppQueuePayload,
  QueueJobStatus
} from './types';
import {
  formatPhoneNumber,
  sendWhatsAppMessage
} from '@/lib/notifications/whatsapp';

/**
 * Konfigurasi Redis Keys terstandarisasi untuk Antrean REBO
 */
export const QUEUE_KEYS = {
  PENDING: 'wa_queue:pending',
  DELAYED: 'wa_queue:delayed',
  DLQ: 'wa_queue:dlq',
  RECENT_JOBS: 'wa_queue:recent_jobs',
  JOB_PREFIX: 'wa_job:'
} as const;

/**
 * TTL default untuk detail job di Redis (24 jam = 86400 detik)
 */
export const JOB_TTL_SECONDS = 86400;

/**
 * Parameter input untuk pendaftaran pekerjaan antrean WhatsApp
 */
export interface EnqueueWhatsAppOptions {
  type: WhatsAppMessageType;
  targetPhone: string;
  message: string;
  metadata?: Record<string, unknown>;
  maxAttempts?: number;
  scheduledAt?: string | number | Date;
  autoDispatch?: boolean;
}

/**
 * Hasil dari pemanggilan producer enqueue
 */
export interface EnqueueResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Metrik statistik kesehatan antrean Redis
 */
export interface QueueMetrics {
  pending: number;
  delayed: number;
  dlq: number;
  isHealthy: boolean;
}

/**
 * Memasukkan pesan notifikasi WhatsApp ke dalam antrean Redis secara non-blocking (< 20ms).
 *
 * Alur kerja:
 * 1. Sanitasi & Validasi nomor telepon tujuan (format 628xxx).
 * 2. Generate UUID unik untuk jobId.
 * 3. Simpan snapshot data pekerjaan di key `wa_job:{id}` dengan TTL 24 jam.
 * 4. Jika scheduledAt ada di masa depan -> ZADD ke `wa_queue:delayed` (score = timestamp ms).
 * 5. Jika tidak dijadwalkan / segera -> LPUSH ke `wa_queue:pending`.
 * 6. Simpan id ke riwayat `wa_queue:recent_jobs` (maks 100 entri).
 */
export async function enqueueWhatsAppNotification(
  payload: EnqueueWhatsAppOptions
): Promise<EnqueueResult> {
  try {
    if (!payload.targetPhone || typeof payload.targetPhone !== 'string') {
      return {
        success: false,
        error: 'Nomor WhatsApp tujuan wajib diisi.'
      };
    }

    if (
      !payload.message ||
      typeof payload.message !== 'string' ||
      !payload.message.trim()
    ) {
      return {
        success: false,
        error: 'Isi pesan WhatsApp tidak boleh kosong.'
      };
    }

    // Sanitasi dan format ke standar internasional Indonesia (628xxx)
    const normalizedPhone = formatPhoneNumber(payload.targetPhone);
    if (!/^628[0-9]{7,13}$/.test(normalizedPhone)) {
      return {
        success: false,
        error: `Format nomor WhatsApp tidak valid (${payload.targetPhone}). Nomor harus berawalan 08xxx atau 628xxx.`
      };
    }

    // Tentukan waktu penjadwalan (jika ada)
    let scheduledTimestamp: number | null = null;
    if (payload.scheduledAt) {
      if (payload.scheduledAt instanceof Date) {
        scheduledTimestamp = payload.scheduledAt.getTime();
      } else if (typeof payload.scheduledAt === 'number') {
        scheduledTimestamp =
          payload.scheduledAt < 10000000000
            ? payload.scheduledAt * 1000
            : payload.scheduledAt;
      } else if (typeof payload.scheduledAt === 'string') {
        const parsed = new Date(payload.scheduledAt).getTime();
        if (!isNaN(parsed)) {
          scheduledTimestamp = parsed;
        }
      }
    }

    const id = randomUUID();
    const nowIso = new Date().toISOString();
    const isFutureDelayed =
      scheduledTimestamp !== null && scheduledTimestamp > Date.now();

    const jobPayload: WhatsAppQueuePayload = {
      id,
      type: payload.type,
      targetPhone: normalizedPhone,
      message: payload.message.trim(),
      metadata: payload.metadata,
      status: 'pending',
      attempts: 0,
      maxAttempts: payload.maxAttempts ?? 5,
      createdAt: nowIso,
      updatedAt: nowIso,
      scheduledAt: scheduledTimestamp
        ? new Date(scheduledTimestamp).toISOString()
        : undefined
    };

    const redis = getRedisClient();

    // 1. Simpan detail job ke wa_job:{id} dengan TTL 24 jam
    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${id}`, jobPayload, {
      ex: JOB_TTL_SECONDS
    });

    // 2. Masukkan ke antrean delayed jika ada jadwal di masa depan, atau pending jika langsung
    if (isFutureDelayed && scheduledTimestamp) {
      await redis.zadd(QUEUE_KEYS.DELAYED, scheduledTimestamp, id);
    } else {
      await redis.lpush(QUEUE_KEYS.PENDING, id);
    }

    // 3. Catat di riwayat recent jobs untuk pemantauan dasbor
    await redis.lpush(QUEUE_KEYS.RECENT_JOBS, id);
    if (typeof redis.ltrim === 'function') {
      await redis.ltrim(QUEUE_KEYS.RECENT_JOBS, 0, 99);
    }

    // 4. Jika autoDispatch diset true dan bukan delayed, jalankan background auto-dispatch
    if (payload.autoDispatch && !isFutureDelayed) {
      processJobById(id).catch((dispatchErr) => {
        console.warn(
          `[Redis Queue] Auto-dispatch job ${id} warning:`,
          dispatchErr
        );
      });
    }

    return {
      success: true,
      jobId: id
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Redis Queue] Error enqueuing notification:', errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Membaca status dan payload pekerjaan dari Redis key `wa_job:{id}`
 */
export async function getJobStatus(
  jobId: string
): Promise<WhatsAppQueuePayload | null> {
  if (!jobId || typeof jobId !== 'string') return null;

  try {
    const redis = getRedisClient();
    const rawJob = await redis.get<WhatsAppQueuePayload>(
      `${QUEUE_KEYS.JOB_PREFIX}${jobId}`
    );

    if (rawJob) {
      return typeof rawJob === 'string'
        ? (JSON.parse(rawJob) as WhatsAppQueuePayload)
        : rawJob;
    }

    // Fallback: baca jika tersimpan sebagai hash
    const hashData = await redis.hgetall<Record<string, string>>(
      `${QUEUE_KEYS.JOB_PREFIX}${jobId}`
    );
    if (hashData && Object.keys(hashData).length > 0) {
      return {
        id: hashData.id || jobId,
        type: (hashData.type as WhatsAppMessageType) || 'TEST_WA',
        targetPhone: hashData.targetPhone || '',
        message: hashData.message || '',
        metadata: hashData.metadata ? JSON.parse(hashData.metadata) : undefined,
        status: (hashData.status as QueueJobStatus) || 'pending',
        attempts: Number(hashData.attempts) || 0,
        maxAttempts: Number(hashData.maxAttempts) || 5,
        createdAt: hashData.createdAt || new Date().toISOString(),
        updatedAt: hashData.updatedAt,
        processedAt: hashData.processedAt,
        deliveredAt: hashData.deliveredAt,
        scheduledAt: hashData.scheduledAt,
        error: hashData.error || null
      };
    }

    return null;
  } catch (err) {
    console.warn(`[Redis Queue] Error reading job status for ${jobId}:`, err);
    return null;
  }
}

/**
 * Mengambil daftar riwayat pekerjaan notifikasi terbaru untuk tabel pemantauan admin
 */
export async function getRecentJobs(
  limit = 15
): Promise<WhatsAppQueuePayload[]> {
  try {
    const redis = getRedisClient();
    const ids = await redis.lrange(
      QUEUE_KEYS.RECENT_JOBS,
      0,
      Math.max(1, limit) - 1
    );
    if (!ids || ids.length === 0) return [];

    // Filter duplikat sambil mempertahankan urutan kronologis terbaru
    const uniqueIds = Array.from(new Set(ids));
    const jobPromises = uniqueIds.map((id) => getJobStatus(id));
    const results = await Promise.all(jobPromises);

    return results.filter((job): job is WhatsAppQueuePayload => job !== null);
  } catch (err) {
    console.warn('[Redis Queue] Error fetching recent jobs:', err);
    return [];
  }
}

/**
 * Mengambil metrik ringkasan antrean Redis:
 * - pending: jumlah pesan siap kirim di `wa_queue:pending`
 * - delayed: jumlah pesan bertenggat waktu di `wa_queue:delayed`
 * - dlq: jumlah pesan gagal total di `wa_queue:dlq`
 * - isHealthy: status keterhubungan Redis
 */
export async function getQueueMetrics(): Promise<QueueMetrics> {
  try {
    const redis = getRedisClient();
    const [pending, dlq] = await Promise.all([
      redis.llen(QUEUE_KEYS.PENDING),
      redis.llen(QUEUE_KEYS.DLQ)
    ]);

    let delayed = 0;
    if (typeof redis.zcard === 'function') {
      delayed = await redis.zcard(QUEUE_KEYS.DELAYED);
    } else {
      const members = await redis.zrangebyscore(
        QUEUE_KEYS.DELAYED,
        '-inf',
        '+inf'
      );
      delayed = members.length;
    }

    return {
      pending: Number(pending) || 0,
      delayed: Number(delayed) || 0,
      dlq: Number(dlq) || 0,
      isHealthy: true
    };
  } catch (err) {
    console.warn('[Redis Queue] Error reading queue metrics:', err);
    return {
      pending: 0,
      delayed: 0,
      dlq: 0,
      isHealthy: false
    };
  }
}

/**
 * Helper perbaikan 1-klik: Memindahkan seluruh pesan dari Dead Letter Queue (DLQ)
 * kembali ke antrean aktif `wa_queue:pending` dan me-reset status job menjadi 'pending'.
 */
export async function retryFailedJobs(): Promise<{ retriedCount: number }> {
  try {
    const redis = getRedisClient();
    let retriedCount = 0;

    while (true) {
      const jobId = await redis.rpop(QUEUE_KEYS.DLQ);
      if (!jobId) break;

      // Reset snapshot status job jika tersedia
      const existingJob = await getJobStatus(jobId);
      if (existingJob) {
        existingJob.status = 'pending';
        existingJob.attempts = 0;
        existingJob.updatedAt = new Date().toISOString();
        existingJob.error = null;
        await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, existingJob, {
          ex: JOB_TTL_SECONDS
        });
      }

      await redis.lpush(QUEUE_KEYS.PENDING, jobId);
      retriedCount++;
    }

    return { retriedCount };
  } catch (err) {
    console.warn('[Redis Queue] Error retrying failed jobs:', err);
    return { retriedCount: 0 };
  }
}

/**
 * Helper perbaikan 1-klik: Membersihkan seluruh isi Dead Letter Queue (`wa_queue:dlq`)
 */
export async function clearDlq(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.del(QUEUE_KEYS.DLQ);
    return true;
  } catch (err) {
    console.warn('[Redis Queue] Error clearing DLQ:', err);
    return false;
  }
}

/**
 * Ringkasan hasil pemrosesan satu pekerjaan
 */
export interface ProcessedJobSummary {
  id: string;
  type?: WhatsAppMessageType;
  targetPhone?: string;
  success: boolean;
  status: QueueJobStatus;
  attempts: number;
  messageId?: string;
  error?: string | null;
}

/**
 * Hasil dari pemrosesan batch antrean Redis
 */
export interface ProcessBatchResult {
  processed: number;
  successful: number;
  failed: number;
  promotedDelayed: number;
  remainingPending: number;
  jobs: ProcessedJobSummary[];
}

/**
 * Mempromosikan pesan dari `wa_queue:delayed` yang sudah jatuh tempo ke `wa_queue:pending`.
 * Mencari item dengan score <= now (unix timestamp ms).
 */
export async function promoteDelayedJobs(): Promise<number> {
  try {
    const redis = getRedisClient();
    const now = Date.now();
    const dueJobIds = await redis.zrangebyscore(QUEUE_KEYS.DELAYED, 0, now);
    if (!dueJobIds || dueJobIds.length === 0) return 0;

    let promotedCount = 0;
    for (const jobId of dueJobIds) {
      const removed = await redis.zrem(QUEUE_KEYS.DELAYED, jobId);
      if (removed > 0) {
        await redis.lpush(QUEUE_KEYS.PENDING, jobId);
        promotedCount++;
      }
    }
    return promotedCount;
  } catch (err) {
    console.error('[Redis Queue] Error promoting delayed jobs:', err);
    return 0;
  }
}

/**
 * Menghitung jeda waktu backoff secara eksponensial (retry 1: 5s, retry 2: 15s, retry 3: 30s)
 * untuk mengatasi cold-start Render free-tier (~17.6s) secara otomatis.
 */
function getQueueBackoffDelayMs(attempts: number): number {
  if (attempts === 1) return 5000;
  if (attempts === 2) return 15000;
  if (attempts === 3) return 30000;
  return 60000;
}

/**
 * Memproses pekerjaan spesifik berdasarkan jobId secara langsung (Inline Auto-Dispatch).
 * Digunakan untuk pengujian interaktif (TEST_WA) agar pesan langsung terkirim
 * dalam hitungan detik tanpa harus menunggu eksekusi worker eksternal.
 */
export async function processJobById(
  jobId: string
): Promise<ProcessedJobSummary | null> {
  if (!jobId) return null;
  const redis = getRedisClient();
  const job = await getJobStatus(jobId);
  if (!job) return null;

  // 1. Update status ke 'processing'
  const nowIso = new Date().toISOString();
  job.status = 'processing';
  job.processedAt = nowIso;
  job.updatedAt = nowIso;
  await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
    ex: JOB_TTL_SECONDS
  });

  // 2. Kirim pesan melalui WhatsApp Service
  const sendResult = await sendWhatsAppMessage({
    phone: job.targetPhone,
    message: job.message
  });

  if (sendResult.success) {
    job.status = 'delivered';
    job.deliveredAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    job.error = null;
    if (sendResult.messageId) {
      job.metadata = {
        ...(job.metadata || {}),
        messageId: sendResult.messageId
      };
    }
    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
      ex: JOB_TTL_SECONDS
    });

    return {
      id: jobId,
      type: job.type,
      targetPhone: job.targetPhone,
      success: true,
      status: 'delivered',
      attempts: job.attempts,
      messageId: sendResult.messageId
    };
  }

  // 3. Jika gagal kirim
  job.attempts = (Number(job.attempts) || 0) + 1;
  const maxAttempts = Number(job.maxAttempts) || 5;

  // Jika bot belum ditautkan (scan QR), set error deskriptif
  if (sendResult.isDisconnected) {
    job.status = 'failed';
    job.updatedAt = new Date().toISOString();
    job.error =
      sendResult.error || 'Bot WhatsApp belum ditautkan (scan QR code).';
    if (sendResult.qrUrl) {
      job.metadata = {
        ...(job.metadata || {}),
        qrUrl: sendResult.qrUrl,
        isDisconnected: true
      };
    }
    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
      ex: JOB_TTL_SECONDS
    });

    return {
      id: jobId,
      type: job.type,
      targetPhone: job.targetPhone,
      success: false,
      status: 'failed',
      attempts: job.attempts,
      error: job.error
    };
  }

  if (job.attempts < maxAttempts) {
    const delayMs = getQueueBackoffDelayMs(job.attempts);
    const scheduledTime = Date.now() + delayMs;

    job.status = 'pending';
    job.scheduledAt = new Date(scheduledTime).toISOString();
    job.updatedAt = new Date().toISOString();
    job.error = `Percobaan ${job.attempts}/${maxAttempts} gagal: ${sendResult.error}`;

    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
      ex: JOB_TTL_SECONDS
    });
    await redis.zadd(QUEUE_KEYS.DELAYED, scheduledTime, jobId);

    return {
      id: jobId,
      type: job.type,
      targetPhone: job.targetPhone,
      success: false,
      status: 'pending',
      attempts: job.attempts,
      error: job.error
    };
  }

  // Batas percobaan tercapai -> Pindahkan ke DLQ
  job.status = 'failed';
  job.updatedAt = new Date().toISOString();
  job.error = `Batas percobaan (${maxAttempts}) tercapai. Error terakhir: ${sendResult.error}`;

  await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
    ex: JOB_TTL_SECONDS
  });
  await redis.lpush(QUEUE_KEYS.DLQ, jobId);

  return {
    id: jobId,
    type: job.type,
    targetPhone: job.targetPhone,
    success: false,
    status: 'failed',
    attempts: job.attempts,
    error: job.error
  };
}

/**
 * Memproses 1 pekerjaan dari antrean pending (`wa_queue:pending`) via RPOP (FIFO):
 * 1. Update status pekerjaan ke 'processing'.
 * 2. Mengirimkan pesan melalui WhatsApp Gateway.
 * 3. Update status ke 'delivered' jika sukses, atau menjadwalkan ulang ke 'wa_queue:delayed'
 *    dengan exponential backoff jika gagal (dan ke 'wa_queue:dlq' jika mencapai maxAttempts).
 */
export async function processNextJob(): Promise<ProcessedJobSummary | null> {
  const redis = getRedisClient();
  const jobId = await redis.rpop(QUEUE_KEYS.PENDING);
  if (!jobId) return null;

  const job = await getJobStatus(jobId);
  if (!job) {
    console.warn(`[Redis Queue] Job [${jobId}] data not found, skipping.`);
    return null;
  }

  // 1. Update status ke 'processing'
  const nowIso = new Date().toISOString();
  job.status = 'processing';
  job.processedAt = nowIso;
  job.updatedAt = nowIso;
  await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
    ex: JOB_TTL_SECONDS
  });

  // 2. Kirim pesan melalui WhatsApp Service
  const sendResult = await sendWhatsAppMessage({
    phone: job.targetPhone,
    message: job.message
  });

  if (sendResult.success) {
    // 3a. Berhasil terkirim
    job.status = 'delivered';
    job.deliveredAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    job.error = null;
    if (sendResult.messageId) {
      job.metadata = {
        ...(job.metadata || {}),
        messageId: sendResult.messageId
      };
    }
    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
      ex: JOB_TTL_SECONDS
    });

    return {
      id: jobId,
      type: job.type,
      targetPhone: job.targetPhone,
      success: true,
      status: 'delivered',
      attempts: job.attempts,
      messageId: sendResult.messageId
    };
  }

  // 3b. Gagal terkirim -> evaluasi retry dengan exponential backoff atau DLQ
  job.attempts = (Number(job.attempts) || 0) + 1;
  const maxAttempts = Number(job.maxAttempts) || 5;

  if (job.attempts < maxAttempts) {
    const delayMs = getQueueBackoffDelayMs(job.attempts);
    const scheduledTime = Date.now() + delayMs;

    job.status = 'pending';
    job.scheduledAt = new Date(scheduledTime).toISOString();
    job.updatedAt = new Date().toISOString();
    job.error = `Attempt ${job.attempts}/${maxAttempts} failed: ${sendResult.error}`;

    await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
      ex: JOB_TTL_SECONDS
    });
    await redis.zadd(QUEUE_KEYS.DELAYED, scheduledTime, jobId);

    return {
      id: jobId,
      type: job.type,
      targetPhone: job.targetPhone,
      success: false,
      status: 'pending',
      attempts: job.attempts,
      error: job.error
    };
  }

  // Batas percobaan tercapai -> Pindahkan ke Dead Letter Queue (DLQ)
  job.status = 'failed';
  job.updatedAt = new Date().toISOString();
  job.error = `Max attempts (${maxAttempts}) reached. Last error: ${sendResult.error}`;

  await redis.set(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`, job, {
    ex: JOB_TTL_SECONDS
  });
  await redis.lpush(QUEUE_KEYS.DLQ, jobId);

  return {
    id: jobId,
    type: job.type,
    targetPhone: job.targetPhone,
    success: false,
    status: 'failed',
    attempts: job.attempts,
    error: job.error
  };
}

/**
 * Memproses sejumlah pesan secara batch (hingga 5-10 pesan) dari antrean Redis.
 * Cocok dipanggil oleh Route Handler Serverless Vercel Cron.
 */
export async function processQueueBatch(options?: {
  batchSize?: number;
  pacingMs?: number;
}): Promise<ProcessBatchResult> {
  const batchSize = Math.min(Math.max(1, options?.batchSize ?? 5), 10);
  const pacingMs = options?.pacingMs ?? 1500;

  // 1. Promosikan delayed jobs yang sudah jatuh tempo
  const promotedDelayed = await promoteDelayedJobs();

  const results: ProcessedJobSummary[] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < batchSize; i++) {
    const jobResult = await processNextJob();
    if (!jobResult) {
      break; // Antrean habis
    }

    results.push(jobResult);
    if (jobResult.success) {
      successful++;
    } else {
      failed++;
    }

    // Jeda anti-spam jika masih ada pesan berikutnya dalam batch
    if (i < batchSize - 1 && pacingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pacingMs));
    }
  }

  const redis = getRedisClient();
  const remainingPending = await redis.llen(QUEUE_KEYS.PENDING);

  return {
    processed: results.length,
    successful,
    failed,
    promotedDelayed,
    remainingPending: Number(remainingPending) || 0,
    jobs: results
  };
}
