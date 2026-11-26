/**
 * Redis & WhatsApp Queue Types for REBO V2
 */

export type WhatsAppMessageType =
  | 'TEST_WA'
  | 'REVISI_BUKTI'
  | 'APPROVAL_BUKTI'
  | 'DEADLINE_ALERT'
  | 'AGENDA_REMINDER'
  | 'WBS_STATUS';

export type QueueJobStatus = 'pending' | 'processing' | 'delivered' | 'failed';

export interface WhatsAppQueuePayload {
  id: string;
  type: WhatsAppMessageType;
  targetPhone: string;
  message: string;
  metadata?: Record<string, unknown>;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  deliveredAt?: string;
  error?: string | null;
}

export type RedisProvider = 'upstash' | 'ioredis' | 'in-memory' | 'none';

export interface RedisHealthStatus {
  connected: boolean;
  provider: RedisProvider;
  latencyMs: number;
  memoryUsage?: string | null;
  error?: string | null;
}

export interface IRedisClient {
  provider: RedisProvider;
  ping(): Promise<string>;
  get<T = string>(key: string): Promise<T | null>;
  set(
    key: string,
    value: unknown,
    options?: { ex?: number; px?: number }
  ): Promise<'OK' | string | null>;
  del(...keys: string[]): Promise<number>;
  lpush(key: string, ...elements: (string | number)[]): Promise<number>;
  rpush(key: string, ...elements: (string | number)[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  rpop(key: string): Promise<string | null>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  llen(key: string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]>;
  zrem(key: string, ...members: string[]): Promise<number>;
  hset(
    key: string,
    objOrField: Record<string, unknown> | string,
    value?: unknown
  ): Promise<number>;
  hget<T = string>(key: string, field: string): Promise<T | null>;
  hgetall<T = Record<string, string>>(key: string): Promise<T | null>;
  expire(key: string, seconds: number): Promise<number>;
  rawClient?: unknown;
}
