import "server-only";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/security/env";

/**
 * Cache, rate limiting and budget counters.
 *
 * Uses Upstash Redis when configured (serverless-friendly, survives cold
 * starts). Falls back to an in-process store so the app runs with zero setup.
 * Cache values are always real responses — never synthesised at read time.
 */

type MemoryEntry = { value: string; expiresAt: number };

const memory = new Map<string, MemoryEntry>();

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const env = serverEnv();
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (client) {
    const value = await client.get<T>(key);
    return value ?? null;
  }
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const client = getRedis();
  if (client) {
    await client.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, {
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  if (memory.size > 500) {
    const now = Date.now();
    for (const [k, v] of memory) if (v.expiresAt < now) memory.delete(k);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedis();
  if (client) {
    await client.del(key);
    return;
  }
  memory.delete(key);
}

/** Fixed-window rate limiter. Returns whether the caller may proceed. */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds = 60,
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `rl:${identifier}:${window}`;
  const client = getRedis();

  if (client) {
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSeconds);
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: (window + 1) * windowSeconds * 1000,
    };
  }

  const entry = memory.get(key);
  const count = (entry ? (JSON.parse(entry.value) as number) : 0) + 1;
  memory.set(key, {
    value: JSON.stringify(count),
    expiresAt: (window + 1) * windowSeconds * 1000,
  });
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: (window + 1) * windowSeconds * 1000,
  };
}

/** Daily spend counters with a soft-off switch semantics. */
export function todayKey(prefix: string): string {
  const d = new Date().toISOString().slice(0, 10);
  return `${prefix}:${d}`;
}

export async function incrementBudget(
  kind: "qloo" | "llm",
  by = 1,
): Promise<number> {
  const key = todayKey(`budget:${kind}`);
  const client = getRedis();
  if (client) {
    const next = await client.incrby(key, by);
    await client.expire(key, 60 * 60 * 26);
    return next;
  }
  const entry = memory.get(key);
  const next = (entry ? (JSON.parse(entry.value) as number) : 0) + by;
  memory.set(key, { value: JSON.stringify(next), expiresAt: Date.now() + 60 * 60 * 26 * 1000 });
  return next;
}

export async function getBudget(kind: "qloo" | "llm"): Promise<number> {
  const key = todayKey(`budget:${kind}`);
  const client = getRedis();
  if (client) return (await client.get<number>(key)) ?? 0;
  const entry = memory.get(key);
  return entry ? (JSON.parse(entry.value) as number) : 0;
}
