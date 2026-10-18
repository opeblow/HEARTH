import { NextResponse } from "next/server";
import { qlooMode, hasLlm, serverEnv } from "@/lib/security/env";
import { getBudget } from "@/lib/qloo/cache";
import { probeQloo } from "@/lib/qloo/client";
import { handleOptions, withCors } from "@/lib/security/cors";

export const dynamic = "force-dynamic";

/** CORS preflight. */
export function OPTIONS(request: Request) {
  return handleOptions(request) ?? new Response(null, { status: 204 });
}

/** Dependency status without leaking secrets. */
export async function GET(request: Request) {
  const preflight = handleOptions(request);
  if (preflight) return preflight;
  const env = serverEnv();
  const redisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

  let redisHealthy = false;
  if (redisConfigured) {
    try {
      await getBudget("qloo");
      redisHealthy = true;
    } catch {
      redisHealthy = false;
    }
  }

  let qloo: { mode: string; reachable: boolean; status?: number } = {
    mode: "unknown",
    reachable: false,
  };
  try {
    const probe = await probeQloo();
    qloo = { mode: qlooMode(), reachable: probe.ok, status: probe.status };
  } catch {
    /* misconfiguration — report unreachable rather than 500 */
  }

  const healthy = qloo.reachable && (!redisConfigured || redisHealthy);

  return withCors(
    NextResponse.json(
      {
        status: healthy ? "ok" : "degraded",
        qloo,
        llm: { configured: hasLlm() },
        redis: { configured: redisConfigured, healthy: redisHealthy },
        time: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    ),
    request,
  );
}
