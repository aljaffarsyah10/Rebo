/* eslint-disable no-console */
/**
 * REBO V2 — Standalone Redis Background Worker & Auto-Dispatcher
 *
 * Mengambil antrean pesan dari `wa_queue:pending`, mempromosikan pesan terjadwal
 * dari `wa_queue:delayed` saat jatuh tempo, mengirimkan ke WhatsApp Gateway REST API,
 * dan mengelola retry exponential backoff (cold-start tolerance) & DLQ.
 *
 * Lisensi: Bebas / Open Source
 * Tim ZI & Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro
 */

const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables dari direktori saat ini, .env.local, atau .env root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WA_GATEWAY_URL =
  process.env.WA_GATEWAY_URL ||
  process.env.WHATSAPP_GATEWAY_URL ||
  'http://localhost:8000/send-message';
const API_KEY =
  process.env.API_KEY ||
  process.env.WA_GATEWAY_API_KEY ||
  process.env.WHATSAPP_API_KEY ||
  '';
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '2000', 10);
const DISPATCH_PACING_MS = parseInt(
  process.env.DISPATCH_PACING_MS || '2500',
  10
); // Jeda anti-spam 2.5 detik antar pesan
const REQUEST_TIMEOUT_MS = parseInt(
  process.env.REQUEST_TIMEOUT_MS || '25000',
  10
); // 25 detik toleransi cold start Render free-tier

const QUEUE_KEYS = {
  PENDING: 'wa_queue:pending',
  DELAYED: 'wa_queue:delayed',
  DLQ: 'wa_queue:dlq',
  RECENT_JOBS: 'wa_queue:recent_jobs',
  JOB_PREFIX: 'wa_job:'
};

const JOB_TTL_SECONDS = 86400; // 24 jam simpan snapshot status job

let redisClient = null;
let isShuttingDown = false;

/**
 * Membuat koneksi ioredis dengan retry strategy tangguh
 */
function createRedisConnection() {
  const maskedUrl = REDIS_URL.replace(/:\/\/.*@/, '://***@');
  console.log(`[Worker] Menghubungkan ke Redis: ${maskedUrl}...`);

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 1000, 10000);
      console.warn(
        `[Worker] Koneksi Redis terputus. Mencoba reconnect dalam ${delay}ms... (Percobaan ${times})`
      );
      return delay;
    }
  });

  client.on('connect', () => {
    console.log('✅ [Worker] Berhasil terhubung ke Redis server!');
  });

  client.on('ready', () => {
    console.log('⚡ [Worker] Redis client siap memproses antrean.');
  });

  client.on('error', (err) => {
    console.error('[Worker] Redis Error:', err.message);
  });

  return client;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Menghitung jeda waktu backoff secara eksponensial:
 * - Percobaan 1: 5 detik (5000 ms)
 * - Percobaan 2: 15 detik (15000 ms)
 * - Percobaan 3: 30 detik (30000 ms)
 * - Percobaan 4+: 60 detik (60000 ms)
 *
 * Memastikan pesan otomatis terkirim tanpa bantuan manual saat instance Render sedang cold-start (17,6 detik).
 */
function getBackoffDelayMs(attempts) {
  if (attempts === 1) return 5000;
  if (attempts === 2) return 15000;
  if (attempts === 3) return 30000;
  return 60000;
}

/**
 * Mempromosikan pesan bertenggat waktu dari `wa_queue:delayed` ke `wa_queue:pending`
 * saat score (unix timestamp ms) <= waktu saat ini.
 */
async function promoteDelayedJobs() {
  try {
    const now = Date.now();
    const dueJobIds = await redisClient.zrangebyscore(
      QUEUE_KEYS.DELAYED,
      0,
      now
    );
    if (!dueJobIds || dueJobIds.length === 0) return 0;

    let promotedCount = 0;
    for (const jobId of dueJobIds) {
      // Hapus dari delayed; jika sukses (>0), masukkan ke pending (FIFO LPUSH)
      const removed = await redisClient.zrem(QUEUE_KEYS.DELAYED, jobId);
      if (removed > 0) {
        await redisClient.lpush(QUEUE_KEYS.PENDING, jobId);
        promotedCount++;
        console.log(
          `[Worker] ⏰ Memindahkan job delayed [${jobId}] ke antrean pending (siap dieksekusi).`
        );
      }
    }
    return promotedCount;
  } catch (err) {
    console.error('[Worker] Gagal mempromosikan delayed jobs:', err.message);
    return 0;
  }
}

/**
 * Mengambil detail pekerjaan dari Redis (`wa_job:{id}`)
 */
async function getJob(jobId) {
  try {
    const raw = await redisClient.get(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`);
    if (raw) {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    }

    // Fallback: baca jika tersimpan dalam struktur Redis Hash
    const hash = await redisClient.hgetall(`${QUEUE_KEYS.JOB_PREFIX}${jobId}`);
    if (hash && Object.keys(hash).length > 0) {
      return {
        id: hash.id || jobId,
        type: hash.type || 'TEST_WA',
        targetPhone: hash.targetPhone || '',
        message: hash.message || '',
        metadata: hash.metadata ? JSON.parse(hash.metadata) : undefined,
        status: hash.status || 'pending',
        attempts: Number(hash.attempts) || 0,
        maxAttempts: Number(hash.maxAttempts) || 5,
        createdAt: hash.createdAt || new Date().toISOString(),
        updatedAt: hash.updatedAt,
        scheduledAt: hash.scheduledAt,
        error: hash.error || null
      };
    }
    return null;
  } catch (err) {
    console.error(`[Worker] Gagal membaca job [${jobId}]:`, err.message);
    return null;
  }
}

/**
 * Menyimpan status pekerjaan terbaru ke Redis dengan TTL 24 jam
 */
async function saveJob(job) {
  try {
    await redisClient.set(
      `${QUEUE_KEYS.JOB_PREFIX}${job.id}`,
      JSON.stringify(job),
      'EX',
      JOB_TTL_SECONDS
    );
  } catch (err) {
    console.error(
      `[Worker] Gagal menyimpan snapshot job [${job.id}]:`,
      err.message
    );
  }
}

/**
 * Mengirimkan pesan notifikasi ke WhatsApp Gateway HTTP endpoint
 */
async function sendToGateway(targetPhone, message) {
  let endpoint = WA_GATEWAY_URL.trim().replace(/\/+$/, '');
  if (!endpoint.endsWith('/send-message')) {
    endpoint += '/send-message';
  }

  const headers = {
    'Content-Type': 'application/json'
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const payload = {
    phone: targetPhone,
    target: targetPhone,
    message: message,
    text: message
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        data?.error ||
        `HTTP ${response.status} ${response.statusText} dari WhatsApp Gateway`;
      return { success: false, error: errMsg };
    }

    if (data && data.success === false) {
      return {
        success: false,
        error: data.error || 'WhatsApp Gateway mengembalikan status gagal'
      };
    }

    return {
      success: true,
      messageId: data?.messageId || data?.id || null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    let errMsg = err.message;
    if (err.name === 'AbortError' || errMsg.toLowerCase().includes('timeout')) {
      errMsg = `Request timeout (${REQUEST_TIMEOUT_MS / 1000}s) — WhatsApp Gateway kemungkinan sedang cold-start di Render`;
    }
    return { success: false, error: errMsg };
  }
}

/**
 * Memproses satu pekerjaan dari antrean pending
 */
async function processJob(jobId) {
  const job = await getJob(jobId);
  if (!job) {
    console.warn(
      `[Worker] Job [${jobId}] tidak ditemukan datanya di Redis. Dilewati.`
    );
    return;
  }

  console.log(
    `[Worker] 🚀 Memproses job [${job.id}] (${job.type || 'NOTIF'}) ke nomor ${job.targetPhone}...`
  );

  // 1. Update status menjadi 'processing'
  job.status = 'processing';
  job.processedAt = new Date().toISOString();
  job.updatedAt = new Date().toISOString();
  await saveJob(job);

  // 2. Kirim pesan ke WhatsApp Gateway
  const result = await sendToGateway(job.targetPhone, job.message);

  if (result.success) {
    // 3a. Berhasil terkirim (delivered)
    job.status = 'delivered';
    job.deliveredAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    job.error = null;
    if (result.messageId) {
      job.metadata = { ...(job.metadata || {}), messageId: result.messageId };
    }
    await saveJob(job);

    console.log(
      `✅ [Worker] Job [${job.id}] sukses terkirim ke ${job.targetPhone}! (MsgID: ${result.messageId || 'OK'})`
    );
  } else {
    // 3b. Gagal terkirim -> evaluasi backoff atau kirim ke DLQ
    job.attempts = (Number(job.attempts) || 0) + 1;
    const maxAttempts = Number(job.maxAttempts) || 5;

    if (job.attempts < maxAttempts) {
      const delayMs = getBackoffDelayMs(job.attempts);
      const scheduledTime = Date.now() + delayMs;

      job.status = 'pending';
      job.scheduledAt = new Date(scheduledTime).toISOString();
      job.updatedAt = new Date().toISOString();
      job.error = `Percobaan ${job.attempts}/${maxAttempts} gagal: ${result.error}`;

      await saveJob(job);
      await redisClient.zadd(QUEUE_KEYS.DELAYED, scheduledTime, job.id);

      console.warn(
        `⚠️ [Worker] Pengiriman job [${job.id}] gagal: ${result.error}. Menjadwalkan ulang retry #${job.attempts} dalam ${delayMs / 1000} detik.`
      );
    } else {
      job.status = 'failed';
      job.updatedAt = new Date().toISOString();
      job.error = `Batas percobaan (${maxAttempts}x) tercapai. Error terakhir: ${result.error}`;

      await saveJob(job);
      await redisClient.lpush(QUEUE_KEYS.DLQ, job.id);

      console.error(
        `❌ [Worker] Job [${job.id}] gagal permanen setelah ${job.attempts} percobaan. Dipindahkan ke DLQ (${QUEUE_KEYS.DLQ}): ${result.error}`
      );
    }
  }

  // 4. Pacing / Throttling Anti-Spam: jeda 2-3 detik antar pengiriman pesan
  console.log(
    `[Worker] ⏳ Menunggu jeda anti-spam ${DISPATCH_PACING_MS / 1000}s sebelum memproses job berikutnya...`
  );
  await sleep(DISPATCH_PACING_MS);
}

/**
 * Loop utama worker
 */
async function startWorker() {
  redisClient = createRedisConnection();

  console.log('\n======================================================');
  console.log('🤖 REBO V2 — REDIS BACKGROUND WORKER & AUTO-DISPATCHER');
  console.log(
    `   Redis URL        : ${REDIS_URL.replace(/:\/\/.*@/, '://***@')}`
  );
  console.log(`   Gateway URL      : ${WA_GATEWAY_URL}`);
  console.log(`   Poll Interval    : ${POLL_INTERVAL_MS}ms`);
  console.log(`   Pacing Interval  : ${DISPATCH_PACING_MS}ms`);
  console.log(`   Request Timeout  : ${REQUEST_TIMEOUT_MS}ms`);
  console.log('======================================================\n');

  while (!isShuttingDown) {
    try {
      // 1. Promosikan pekerjaan dari delayed queue yang sudah jatuh tempo
      await promoteDelayedJobs();

      // 2. Ambil 1 job dari antrean pending (FIFO: rpop)
      const jobId = await redisClient.rpop(QUEUE_KEYS.PENDING);

      if (jobId) {
        await processJob(jobId);
      } else {
        // Antrean kosong, tidur sejenak sesuai POLL_INTERVAL_MS
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (loopErr) {
      console.error('[Worker] Error pada worker loop:', loopErr.message);
      await sleep(3000);
    }
  }

  console.log('[Worker] Worker loop berhenti secara normal.');
}

/**
 * Menangani graceful shutdown saat menerima sinyal SIGINT/SIGTERM
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(
      `\n[Worker] Menerima sinyal ${signal}. Menutup koneksi Redis dan mematikan worker...`
    );

    try {
      if (redisClient) {
        await redisClient.quit();
      }
    } catch (e) {
      // Abaikan error saat quit
    }

    console.log('[Worker] Background worker berhenti dengan aman.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Menangani uncaughtException & unhandledRejection agar transient network error
 * tidak langsung mematikan proses worker secara tiba-tiba.
 */
function setupProcessErrorHandlers() {
  process.on('uncaughtException', (err) => {
    console.error(
      '[Worker] Uncaught Exception (ditangani agar worker tetap berjalan):',
      err?.stack || err?.message || err
    );
  });

  process.on('unhandledRejection', (reason) => {
    console.error(
      '[Worker] Unhandled Promise Rejection (ditangani agar worker tetap berjalan):',
      reason?.stack || reason?.message || reason
    );
  });
}

setupProcessErrorHandlers();
setupGracefulShutdown();
startWorker().catch((err) => {
  console.error('[Worker] Fatal Worker Crash:', err);
  process.exit(1);
});
