import "server-only";
import { z } from "zod";

/**
 * Server environment. Validated once at boot. Secrets live here and only here:
 * they must never be read from client components and never prefixed NEXT_PUBLIC_.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  QLOO_API_KEY: z.string().min(1).optional(),
  QLOO_BASE_URL: z.string().min(1).default("https://hackathon.api.qloo.com/v2"),
  QLOO_MODE: z.enum(["auto", "live", "fixtures"]).default("auto"),
  QLOO_TIMEOUT_MS: z.coerce.number().int().positive().default(6500),

  LLM_API_KEY: z.string().min(1).optional(),
  LLM_BASE_URL: z.string().min(1).default("https://api.openai.com/v1"),
  LLM_MODEL: z.string().min(1).default("gpt-4o-mini"),

  UPSTASH_REDIS_REST_URL: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(12),
  DAILY_QLOO_BUDGET: z.coerce.number().int().positive().default(4000),
  DAILY_LLM_BUDGET: z.coerce.number().int().positive().default(2000),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Treat empty / whitespace-only values as "unset". Hosts routinely inject blank
 * vars for secrets they don't have, and an empty string fails `min(1)` even
 * though the intent is "not configured".
 */
function withoutBlankValues(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string" && value.trim() === "") continue;
    out[key] = value;
  }
  return out;
}

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(withoutBlankValues(process.env));
  if (!parsed.success) {
    // Detail is fine server-side; never echoed to clients.
    console.error("[env] invalid environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment configuration.");
  }

  // Production is strict: real dependencies only, and never mock data.
  if (parsed.data.NODE_ENV === "production") {
    const missing: string[] = [];
    if (!parsed.data.QLOO_API_KEY) missing.push("QLOO_API_KEY");
    if (!parsed.data.UPSTASH_REDIS_REST_URL || !parsed.data.UPSTASH_REDIS_REST_TOKEN) {
      missing.push("UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN");
    }
    if (missing.length > 0) {
      console.error("[env] production is missing required configuration:", missing);
      throw new Error(`Production requires: ${missing.join(", ")}`);
    }
    if (parsed.data.QLOO_MODE === "fixtures") {
      throw new Error("QLOO_MODE=fixtures is not permitted in production.");
    }
  }

  cached = parsed.data;
  return cached;
}

export type QlooMode = "live" | "fixtures";

/**
 * Resolve how the Qloo client should behave.
 * - live: real API calls (requires a key)
 * - fixtures: recorded demo data, clearly labelled in the UI
 *
 * Production is always live — mock data must never be served there. Fixtures
 * remain available in development/test so the product runs with zero setup.
 */
export function qlooMode(): QlooMode {
  const env = serverEnv();
  if (env.NODE_ENV === "production") return "live";
  if (env.QLOO_MODE === "live") {
    if (!env.QLOO_API_KEY) {
      throw new Error("QLOO_MODE=live requires QLOO_API_KEY.");
    }
    return "live";
  }
  if (env.QLOO_MODE === "fixtures") return "fixtures";
  return env.QLOO_API_KEY ? "live" : "fixtures";
}

export function hasLlm(): boolean {
  return Boolean(serverEnv().LLM_API_KEY);
}

export function isDemo(): boolean {
  return qlooMode() === "fixtures";
}
