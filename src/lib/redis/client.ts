/* eslint-disable no-console */
/**
 * Adaptive Redis Client Singleton for REBO V2
 *
 * Priority 1: Upstash Redis REST (@upstash/redis) for Vercel Serverless / Edge
 * Priority 2: ioredis for Long-Running Worker / Docker / VM / Local Redis
 * Priority 3: Graceful In-Memory Mock Fallback if environment variables are not set
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import type { IRedisClient, RedisHealthStatus, RedisProvider } from './types';

// Global symbol declaration for preserving client across Next.js dev reloads
declare global {
  // eslint-disable-next-line no-var
  var __rebo_redis_client__: IRedisClient | undefined;
}

/**
 * In-Memory Mock Redis Implementation for zero-crash fallback
 */
class InMemoryRedisClient implements IRedisClient {
  public provider: RedisProvider = 'in-memory';
  private strings = new Map<string, { value: string; expireAt?: number }>();
  private lists = new Map<string, string[]>();
  private zsets = new Map<string, Map<string, number>>();
  private hashes = new Map<string, Map<string, string>>();
  private timers = new Map<string, NodeJS.Timeout>();

  private isExpired(key: string): boolean {
    const item = this.strings.get(key);
    if (item && item.expireAt && Date.now() > item.expireAt) {
      this.strings.delete(key);
      return true;
    }
    return false;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get<T = string>(key: string): Promise<T | null> {
    if (this.isExpired(key)) return null;
    const item = this.strings.get(key);
    if (!item) return null;
    try {
      return JSON.parse(item.value) as T;
    } catch {
      return item.value as unknown as T;
    }
  }

  async set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number }
  ): Promise<'OK'> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);
    let expireAt: number | undefined;

    if (options?.ex) {
      expireAt = Date.now() + options.ex * 1000;
    } else if (options?.px) {
      expireAt = Date.now() + options.px;
    }

    this.strings.set(key, { value: serialized, expireAt });

    if (expireAt) {
      this.clearKeyTimer(key);
      const delay = Math.max(0, expireAt - Date.now());
      const timer = setTimeout(() => {
        this.strings.delete(key);
        this.lists.delete(key);
        this.zsets.delete(key);
        this.hashes.delete(key);
      }, delay);
      if (timer.unref) timer.unref();
      this.timers.set(key, timer);
    }

    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      this.clearKeyTimer(key);
      if (
        this.strings.delete(key) ||
        this.lists.delete(key) ||
        this.zsets.delete(key) ||
        this.hashes.delete(key)
      ) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async lpush(key: string, ...elements: (string | number)[]): Promise<number> {
    const list = this.lists.get(key) || [];
    for (const el of elements) {
      list.unshift(String(el));
    }
    this.lists.set(key, list);
    return list.length;
  }

  async rpush(key: string, ...elements: (string | number)[]): Promise<number> {
    const list = this.lists.get(key) || [];
    for (const el of elements) {
      list.push(String(el));
    }
    this.lists.set(key, list);
    return list.length;
  }

  async lpop(key: string): Promise<string | null> {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    const item = list.shift() ?? null;
    return item;
  }

  async rpop(key: string): Promise<string | null> {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    const item = list.pop() ?? null;
    return item;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.lists.get(key) || [];
    const end = stop < 0 ? list.length + stop + 1 : stop + 1;
    return list.slice(start, end);
  }

  async llen(key: string): Promise<number> {
    const list = this.lists.get(key);
    return list ? list.length : 0;
  }

  async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
    const list = this.lists.get(key) || [];
    const end = stop < 0 ? list.length + stop + 1 : stop + 1;
    this.lists.set(key, list.slice(start, end));
    return 'OK';
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    let zset = this.zsets.get(key);
    if (!zset) {
      zset = new Map<string, number>();
      this.zsets.set(key, zset);
    }
    const isNew = !zset.has(member);
    zset.set(member, score);
    return isNew ? 1 : 0;
  }

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]> {
    const zset = this.zsets.get(key);
    if (!zset) return [];

    const minScore = min === '-inf' ? -Infinity : Number(min);
    const maxScore = max === '+inf' ? Infinity : Number(max);

    const filtered: Array<{ member: string; score: number }> = [];
    zset.forEach((score, member) => {
      if (score >= minScore && score <= maxScore) {
        filtered.push({ member, score });
      }
    });

    filtered.sort((a, b) => a.score - b.score);
    return filtered.map((item) => item.member);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const zset = this.zsets.get(key);
    if (!zset) return 0;
    let count = 0;
    for (const member of members) {
      if (zset.delete(member)) count++;
    }
    return count;
  }

  async zcard(key: string): Promise<number> {
    const zset = this.zsets.get(key);
    return zset ? zset.size : 0;
  }

  async hset(
    key: string,
    objOrField: Record<string, unknown> | string,
    value?: unknown
  ): Promise<number> {
    let hash = this.hashes.get(key);
    if (!hash) {
      hash = new Map<string, string>();
      this.hashes.set(key, hash);
    }

    let addedOrUpdated = 0;
    if (typeof objOrField === 'string') {
      const valStr = typeof value === 'string' ? value : JSON.stringify(value);
      hash.set(objOrField, valStr);
      addedOrUpdated++;
    } else if (typeof objOrField === 'object' && objOrField !== null) {
      for (const [f, v] of Object.entries(objOrField)) {
        const valStr = typeof v === 'string' ? v : JSON.stringify(v);
        hash.set(f, valStr);
        addedOrUpdated++;
      }
    }
    return addedOrUpdated;
  }

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    const hash = this.hashes.get(key);
    if (!hash) return null;
    const val = hash.get(field);
    if (val === undefined) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }

  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    const hash = this.hashes.get(key);
    if (!hash || hash.size === 0) return null;
    const obj: Record<string, string> = {};
    hash.forEach((v, k) => {
      obj[k] = v;
    });
    return obj as unknown as T;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const hasKey =
      this.strings.has(key) ||
      this.lists.has(key) ||
      this.zsets.has(key) ||
      this.hashes.has(key);

    if (!hasKey) return 0;

    this.clearKeyTimer(key);
    const timer = setTimeout(() => {
      this.strings.delete(key);
      this.lists.delete(key);
      this.zsets.delete(key);
      this.hashes.delete(key);
    }, seconds * 1000);
    if (timer.unref) timer.unref();
    this.timers.set(key, timer);

    return 1;
  }

  private clearKeyTimer(key: string) {
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(key);
    }
  }
}

/**
 * Upstash Redis Wrapper adhering to IRedisClient
 */
class UpstashRedisWrapper implements IRedisClient {
  public provider: RedisProvider = 'upstash';
  public rawClient: UpstashRedis;

  constructor(client: UpstashRedis) {
    this.rawClient = client;
  }

  async ping(): Promise<string> {
    return await this.rawClient.ping();
  }

  async get<T = string>(key: string): Promise<T | null> {
    const result = await this.rawClient.get<T>(key);
    return result ?? null;
  }

  async set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number }
  ): Promise<'OK' | string | null> {
    const opts: Record<string, unknown> = {};
    if (options?.ex) opts.ex = options.ex;
    if (options?.px) opts.px = options.px;
    return (await this.rawClient.set(key, value, opts)) as 'OK' | string | null;
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return await this.rawClient.del(...keys);
  }

  async lpush(key: string, ...elements: (string | number)[]): Promise<number> {
    if (elements.length === 0) return 0;
    return await this.rawClient.lpush(key, ...elements);
  }

  async rpush(key: string, ...elements: (string | number)[]): Promise<number> {
    if (elements.length === 0) return 0;
    return await this.rawClient.rpush(key, ...elements);
  }

  async lpop(key: string): Promise<string | null> {
    const res = await this.rawClient.lpop<unknown>(key);
    if (res === null || res === undefined) return null;
    return typeof res === 'string' ? res : JSON.stringify(res);
  }

  async rpop(key: string): Promise<string | null> {
    const res = await this.rawClient.rpop<unknown>(key);
    if (res === null || res === undefined) return null;
    return typeof res === 'string' ? res : JSON.stringify(res);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const res = await this.rawClient.lrange<unknown[]>(key, start, stop);
    if (!Array.isArray(res)) return [];
    return res.map((item) =>
      typeof item === 'string' ? item : JSON.stringify(item)
    );
  }

  async llen(key: string): Promise<number> {
    return await this.rawClient.llen(key);
  }

  async ltrim(
    key: string,
    start: number,
    stop: number
  ): Promise<'OK' | string> {
    return (await this.rawClient.ltrim(key, start, stop)) as 'OK' | string;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const res = await this.rawClient.zadd(key, { score, member });
    return res ?? 0;
  }

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]> {
    // Upstash zrange with { byScore: true }
    const minVal = min === '-inf' ? '-inf' : min;
    const maxVal = max === '+inf' ? '+inf' : max;
    const res = await this.rawClient.zrange<string[]>(
      key,
      minVal as any,
      maxVal as any,
      {
        byScore: true
      }
    );
    return Array.isArray(res) ? res.map(String) : [];
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    if (members.length === 0) return 0;
    return await this.rawClient.zrem(key, ...members);
  }

  async zcard(key: string): Promise<number> {
    return await this.rawClient.zcard(key);
  }

  async hset(
    key: string,
    objOrField: Record<string, unknown> | string,
    value?: unknown
  ): Promise<number> {
    if (typeof objOrField === 'string') {
      return await this.rawClient.hset(key, { [objOrField]: value });
    }
    return await this.rawClient.hset(key, objOrField);
  }

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    const res = await this.rawClient.hget<T>(key, field);
    return res ?? null;
  }

  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    const res = await this.rawClient.hgetall<Record<string, unknown>>(key);
    if (!res || Object.keys(res).length === 0) return null;
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(res)) {
      normalized[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
    return normalized as unknown as T;
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.rawClient.expire(key, seconds);
  }
}

/**
 * ioredis Wrapper adhering to IRedisClient with automatic In-Memory fallback on connection drop
 */
class IORedisWrapper implements IRedisClient {
  public provider: RedisProvider = 'ioredis';
  public rawClient: any;
  private fallbackClient = new InMemoryRedisClient();
  private isFailing = false;

  constructor(client: any) {
    this.rawClient = client;
  }

  private handleFallback<T>(
    operation: () => Promise<T>,
    fallbackOp: () => Promise<T>
  ): Promise<T> {
    if (this.isFailing) {
      return fallbackOp();
    }
    return operation().catch((err: any) => {
      const isConnError =
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'ENOTFOUND' ||
        err?.message?.includes('max retries') ||
        err?.message?.includes('Connection is closed');
      if (isConnError) {
        if (!this.isFailing) {
          console.warn(
            `[Redis Client] Server TCP tidak merespons (${err.message}). Beralih otomatis ke In-Memory Queue (Ultra-Cepat).`
          );
          this.isFailing = true;
        }
        return fallbackOp();
      }
      throw err;
    });
  }

  async ping(): Promise<string> {
    return this.handleFallback(
      () => this.rawClient.ping(),
      () => this.fallbackClient.ping()
    );
  }

  async get<T = string>(key: string): Promise<T | null> {
    return this.handleFallback(
      async () => {
        const val = await this.rawClient.get(key);
        if (val === null || val === undefined) return null;
        try {
          return JSON.parse(val) as T;
        } catch {
          return val as unknown as T;
        }
      },
      () => this.fallbackClient.get<T>(key)
    );
  }

  async set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number }
  ): Promise<'OK' | string | null> {
    return this.handleFallback(
      async () => {
        const serialized =
          typeof value === 'string' ? value : JSON.stringify(value);
        if (options?.ex) {
          return await this.rawClient.set(key, serialized, 'EX', options.ex);
        }
        if (options?.px) {
          return await this.rawClient.set(key, serialized, 'PX', options.px);
        }
        return await this.rawClient.set(key, serialized);
      },
      () => this.fallbackClient.set(key, value, options)
    );
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.handleFallback(
      () => this.rawClient.del(...keys),
      () => this.fallbackClient.del(...keys)
    );
  }

  async lpush(key: string, ...elements: (string | number)[]): Promise<number> {
    if (elements.length === 0) return 0;
    return this.handleFallback(
      () => this.rawClient.lpush(key, ...elements),
      () => this.fallbackClient.lpush(key, ...elements)
    );
  }

  async rpush(key: string, ...elements: (string | number)[]): Promise<number> {
    if (elements.length === 0) return 0;
    return this.handleFallback(
      () => this.rawClient.rpush(key, ...elements),
      () => this.fallbackClient.rpush(key, ...elements)
    );
  }

  async lpop(key: string): Promise<string | null> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.lpop(key);
        return res ?? null;
      },
      () => this.fallbackClient.lpop(key)
    );
  }

  async rpop(key: string): Promise<string | null> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.rpop(key);
        return res ?? null;
      },
      () => this.fallbackClient.rpop(key)
    );
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.lrange(key, start, stop);
        return Array.isArray(res) ? res : [];
      },
      () => this.fallbackClient.lrange(key, start, stop)
    );
  }

  async llen(key: string): Promise<number> {
    return this.handleFallback(
      () => this.rawClient.llen(key),
      () => this.fallbackClient.llen(key)
    );
  }

  async ltrim(
    key: string,
    start: number,
    stop: number
  ): Promise<'OK' | string> {
    return this.handleFallback(
      async () =>
        (await this.rawClient.ltrim(key, start, stop)) as 'OK' | string,
      () => this.fallbackClient.ltrim(key, start, stop)
    );
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.handleFallback(
      () => this.rawClient.zadd(key, score, member),
      () => this.fallbackClient.zadd(key, score, member)
    );
  }

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.zrangebyscore(key, min, max);
        return Array.isArray(res) ? res : [];
      },
      () => this.fallbackClient.zrangebyscore(key, min, max)
    );
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    if (members.length === 0) return 0;
    return this.handleFallback(
      () => this.rawClient.zrem(key, ...members),
      () => this.fallbackClient.zrem(key, ...members)
    );
  }

  async zcard(key: string): Promise<number> {
    return this.handleFallback(
      () => this.rawClient.zcard(key),
      () => this.fallbackClient.zcard(key)
    );
  }

  async hset(
    key: string,
    objOrField: Record<string, unknown> | string,
    value?: unknown
  ): Promise<number> {
    return this.handleFallback(
      async () => {
        if (typeof objOrField === 'string') {
          const valStr =
            typeof value === 'string' ? value : JSON.stringify(value);
          return await this.rawClient.hset(key, objOrField, valStr);
        }
        const map: Record<string, string> = {};
        for (const [k, v] of Object.entries(objOrField)) {
          map[k] = typeof v === 'string' ? v : JSON.stringify(v);
        }
        return await this.rawClient.hset(key, map);
      },
      () => this.fallbackClient.hset(key, objOrField, value)
    );
  }

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.hget(key, field);
        if (res === null || res === undefined) return null;
        try {
          return JSON.parse(res) as T;
        } catch {
          return res as unknown as T;
        }
      },
      () => this.fallbackClient.hget<T>(key, field)
    );
  }

  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    return this.handleFallback(
      async () => {
        const res = await this.rawClient.hgetall(key);
        if (!res || Object.keys(res).length === 0) return null;
        return res as unknown as T;
      },
      () => this.fallbackClient.hgetall<T>(key)
    );
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.handleFallback(
      () => this.rawClient.expire(key, seconds),
      () => this.fallbackClient.expire(key, seconds)
    );
  }
}

/**
 * Instantiate or get cached singleton Redis client
 */
export function getRedisClient(): IRedisClient {
  if (globalThis.__rebo_redis_client__) {
    return globalThis.__rebo_redis_client__;
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const redisUrl = process.env.REDIS_URL;

  // Prioritas 1: Upstash REST API (Vercel Serverless / Edge compatible)
  if (upstashUrl && upstashToken) {
    try {
      const client = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken
      });
      globalThis.__rebo_redis_client__ = new UpstashRedisWrapper(client);
      return globalThis.__rebo_redis_client__;
    } catch (err) {
      console.warn('[Redis] Failed to initialize Upstash Redis client:', err);
    }
  }

  // Prioritas 2: ioredis via TCP connection (Worker / Render / VM / Local)
  // Hanya inisialisasi jika redisUrl terisi non-kosong
  if (redisUrl && redisUrl.trim()) {
    try {
      // Dynamic require ensures safety across Next.js runtimes
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const IORedis = require('ioredis');
      const RedisClass = IORedis.default || IORedis;
      const ioredisClient = new RedisClass(redisUrl, {
        maxRetriesPerRequest: 0,
        connectTimeout: 800,
        lazyConnect: true,
        enableAutoPipelining: true,
        retryStrategy: () => null // Jangan retry berulang-ulang jika server mati
      });

      // Catch error event to prevent unhandled node exceptions on connection drop
      ioredisClient.on('error', (e: any) => {
        // Heningkan error event yang bising saat Redis offline
        if (e?.code !== 'ECONNREFUSED') {
          console.warn('[Redis ioredis warning]', e?.message || e);
        }
      });

      globalThis.__rebo_redis_client__ = new IORedisWrapper(ioredisClient);
      return globalThis.__rebo_redis_client__;
    } catch (err) {
      console.warn(
        '[Redis] Failed to initialize ioredis client, falling back to in-memory:',
        err
      );
    }
  }

  // Prioritas 3: Graceful fallback in-memory cache/mock (Prevents build failure & zero-latency)
  globalThis.__rebo_redis_client__ = new InMemoryRedisClient();
  return globalThis.__rebo_redis_client__;
}

/**
 * Check Redis health, provider type, ping latency, and memory usage
 */
export async function getRedisHealthStatus(): Promise<RedisHealthStatus> {
  const startTime = Date.now();
  try {
    const client = getRedisClient();
    const pongPromise = client.ping();
    const pong = await Promise.race([
      pongPromise,
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout (1000ms)')), 1000)
      )
    ]);
    const latencyMs = Math.max(1, Date.now() - startTime);

    let memoryUsage: string | null = null;
    if (
      client.provider === 'ioredis' &&
      (client as IORedisWrapper).rawClient?.info
    ) {
      try {
        const info = await (client as IORedisWrapper).rawClient.info('memory');
        const match =
          typeof info === 'string' && info.match(/used_memory_human:(.+)/);
        if (match) {
          memoryUsage = match[1].trim();
        }
      } catch {
        // Ignore info failure if command restricted
      }
    } else if (client.provider === 'in-memory') {
      memoryUsage = 'in-memory (mock)';
    } else if (client.provider === 'upstash') {
      memoryUsage = 'serverless (upstash)';
    }

    return {
      connected: pong === 'PONG' || pong === 'pong' || !!pong,
      provider: client.provider,
      latencyMs,
      memoryUsage,
      error: null
    };
  } catch (err: any) {
    return {
      connected: false,
      provider: 'none',
      latencyMs: Date.now() - startTime,
      memoryUsage: null,
      error: err?.message || 'Failed to ping Redis instance'
    };
  }
}
