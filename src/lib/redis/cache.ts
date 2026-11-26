/* eslint-disable no-console */
/**
 * Redis Caching Layer for REBO V2
 *
 * Menyediakan utilitas caching terpadu:
 * - getCachedOrFetch: membaca cache dengan fallback otomatis ke fetcher
 * - invalidateCacheKey: menghapus cache berdasarkan key
 * - invalidateCachePattern: menghapus cache berdasarkan pola / prefix key
 *
 * Dilengkapi graceful fallback jika Redis sedang offline/gangguan, sehingga
 * kueri aplikasi tetap berjalan lancar tanpa error/interupsi.
 */

import { getRedisClient } from './client';

export const CACHE_KEYS = {
  PILAR_SCORES: 'cache:pilar_scores',
  PILAR_SCORES_PEMENUHAN: 'cache:pilar_scores:pemenuhan',
  MONITORING_GLOBAL: 'cache:monitoring:global',
  PERIODE_ACTIVE: 'cache:periode:active',
  LEADERBOARD: 'cache:leaderboard',
  BADGES: 'cache:badges'
} as const;

/**
 * Mengambil data dari cache Redis jika tersedia, atau memanggil fungsi fetcher()
 * untuk memuat data segar dan menyimpannya ke cache dengan TTL yang ditentukan.
 *
 * @param key Kunci identifikasi cache di Redis (contoh: 'cache:pilar_scores:2026')
 * @param ttlSeconds Masa aktif cache dalam detik (default: 300 detik = 5 menit)
 * @param fetcher Fungsi asinkron untuk mengambil data langsung dari sumber utama (DB)
 */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds = 300,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!key || typeof key !== 'string') {
    return fetcher();
  }

  try {
    const redis = getRedisClient();
    const cachedData = await redis.get<T>(key);

    if (cachedData !== null && cachedData !== undefined) {
      if (typeof cachedData === 'string') {
        try {
          return JSON.parse(cachedData) as T;
        } catch {
          return cachedData as unknown as T;
        }
      }
      return cachedData;
    }
  } catch (readErr) {
    console.warn(
      `[Redis Cache] Gagal membaca key "${key}", fallback ke fetcher:`,
      readErr
    );
  }

  // Jika tidak ditemukan di cache atau terjadi error pembacaan, panggil fetcher
  const freshData = await fetcher();

  // Simpan data segar ke Redis di latar belakang secara asynchronous
  try {
    const redis = getRedisClient();
    await redis.set(key, freshData, { ex: Math.max(1, ttlSeconds) });
  } catch (writeErr) {
    console.warn(
      `[Redis Cache] Gagal menyimpan cache untuk key "${key}":`,
      writeErr
    );
  }

  return freshData;
}

/**
 * Menghapus satu atau beberapa key spesifik dari cache Redis
 */
export async function invalidateCacheKey(...keys: string[]): Promise<number> {
  if (!keys || keys.length === 0) return 0;
  try {
    const redis = getRedisClient();
    return await redis.del(...keys);
  } catch (err) {
    console.warn('[Redis Cache] Gagal menghapus cache keys:', keys, err);
    return 0;
  }
}

/**
 * Menghapus cache berdasarkan prefix atau pola.
 * Mendukung penghapusan langsung jika key diawali atau diakhiri pattern.
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  if (!pattern || typeof pattern !== 'string') return 0;

  try {
    const redis = getRedisClient();
    // Jika pattern persis sebuah key tanpa wildcard, langsung hapus
    if (!pattern.includes('*')) {
      return await redis.del(pattern);
    }

    // Jika pattern wildcard, hapus key-key umum yang sering digunakan
    const cleanPattern = pattern.replace(/\*/g, '');
    const knownKeys = [
      CACHE_KEYS.PILAR_SCORES,
      CACHE_KEYS.PILAR_SCORES_PEMENUHAN,
      CACHE_KEYS.MONITORING_GLOBAL,
      CACHE_KEYS.PERIODE_ACTIVE,
      CACHE_KEYS.LEADERBOARD,
      CACHE_KEYS.BADGES
    ];

    const matchedKeys = knownKeys.filter((k) => k.includes(cleanPattern));
    if (matchedKeys.length > 0) {
      return await redis.del(...matchedKeys);
    }

    return 0;
  } catch (err) {
    console.warn(`[Redis Cache] Gagal invalidate pattern "${pattern}":`, err);
    return 0;
  }
}

/**
 * Menghapus seluruh cache agregasi skor, monitoring, leaderboard, dan lencana
 * ketika ada mutasi bukti dukung, verifikasi, atau status kanban.
 */
export async function invalidateReboScoreCaches(
  periodeId?: string | null
): Promise<number> {
  const keysToInvalidate: string[] = [
    CACHE_KEYS.PILAR_SCORES,
    CACHE_KEYS.PILAR_SCORES_PEMENUHAN,
    CACHE_KEYS.MONITORING_GLOBAL,
    CACHE_KEYS.LEADERBOARD,
    CACHE_KEYS.BADGES
  ];

  if (periodeId) {
    keysToInvalidate.push(
      `${CACHE_KEYS.MONITORING_GLOBAL}:${periodeId}`,
      `${CACHE_KEYS.LEADERBOARD}:${periodeId}`,
      `${CACHE_KEYS.PILAR_SCORES}:${periodeId}`
    );
  }

  return invalidateCacheKey(...keysToInvalidate);
}
