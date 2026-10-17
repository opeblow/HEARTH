import "server-only";
import { rateLimit } from "@/lib/qloo/cache";
import { serverEnv } from "@/lib/security/env";

/** Derive a stable, non-reversible rate-limit key from the client IP. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const raw = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
  return hashKey(raw);
}

function hashKey(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export async function enforceRateLimit(req: Request): Promise<{
  ok: boolean;
  remaining: number;
  resetAt: number;
}> {
  const limit = serverEnv().RATE_LIMIT_PER_MINUTE;
  return rateLimit(clientIp(req), limit, 60);
}
