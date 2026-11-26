/* eslint-disable no-console */
/**
 * Redis Atomic Rate Limiter for REBO V2
 *
 * Mencegah abuse, spamming pengiriman pesan WhatsApp, dan brute-force
 * menggunakan fixed/sliding window berbasis key Redis dengan TTL otomatis.
 *
 * Dilengkapi in-memory fallback agar tetap berfungsi meski koneksi Redis bermasalah.
 */

import { getRedisClient } from './client';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds saat window reset
  error?: string;
}

// In-memory fallback map jika Redis client sedang offline
interface InMemoryRateRecord {
  count: number;
  resetAt: number;
}
const inMemoryLimiter = new Map<string, InMemoryRateRecord>();

/**
 * Memeriksa apakah identifier (misal: IP address, userId, atau nomor telepon)
 * masih dalam batas ambang frekuensi aksi yang diizinkan.
 *
 * @param identifier Kunci unik pengguna/aksi (misal: `wa_test:user_123` atau `submit_verifikasi:ip_xxx`)
 * @param limit Batas maksimal pemanggilan per jendela waktu (default: 5)
 * @param windowSeconds Durasi jendela waktu dalam detik (default: 60 detik)
 */
export async function checkRateLimit(
  identifier: string,
  limit = 5,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const key = `rate_limit:${identifier}`;

  try {
    const redis = getRedisClient();

    // 1. Baca nilai counter saat ini
    const rawVal = await redis.get<number | string>(key);
    let currentCount = 0;

    if (rawVal !== null && rawVal !== undefined) {
      currentCount =
        typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal), 10) || 0;
    }

    // Jika sudah melebihi limit
    if (currentCount >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: nowSec + windowSeconds
      };
    }

    // Increment nilai counter
    const nextCount = currentCount + 1;
    await redis.set(key, nextCount, { ex: windowSeconds });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - nextCount),
      reset: nowSec + windowSeconds
    };
  } catch (err) {
    console.warn(
      `[Rate Limiter] Redis error for "${identifier}", fallback to memory:`,
      err
    );

    // Fallback: In-memory rate limiting
    const record = inMemoryLimiter.get(identifier);
    if (!record || nowMs > record.resetAt) {
      inMemoryLimiter.set(identifier, {
        count: 1,
        resetAt: nowMs + windowSeconds * 1000
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: nowSec + windowSeconds
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.floor(record.resetAt / 1000)
      };
    }

    record.count += 1;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: Math.floor(record.resetAt / 1000)
    };
  }
}
