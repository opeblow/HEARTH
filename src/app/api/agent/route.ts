import { z } from "zod";
import { runAgent } from "@/lib/agent/run";
import { encodeSse } from "@/lib/agent/events";
import { enforceRateLimit } from "@/lib/security/ratelimit";
import { getBudget } from "@/lib/qloo/cache";
import { serverEnv } from "@/lib/security/env";
import { normaliseCity } from "@/lib/security/sanitize";
import { handleOptions, withCors } from "@/lib/security/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const anchorSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  type: z.enum(["place", "artist", "film", "tv", "dining", "brand", "book", "podcast"]),
  imageUrl: z.string().max(500).optional(),
  tags: z.array(z.string().max(60)).max(20),
});

const prefsSchema = z.object({
  familiarity: z.number().min(0).max(1),
  vibe: z.enum(["quiet", "balanced", "lively"]),
  budget: z.enum(["low", "mid", "high"]),
  dietary: z.array(z.string().max(40)).max(10),
  accessibility: z.array(z.string().max(40)).max(10),
  who: z.enum(["solo", "couple", "group"]),
});

const bodySchema = z
  .object({
    anchors: z.array(anchorSchema).min(1).max(10),
    origin: z.string().max(60).optional(),
    destination: z.string().min(1).max(60),
    prefs: prefsSchema,
  })
  .strict();

export async function POST(request: Request) {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  const limit = await enforceRateLimit(request);
  if (!limit.ok) {
    return withCors(
      new Response(
        JSON.stringify({ error: "You're moving fast. Try again in a minute." }),
        { status: 429, headers: { "content-type": "application/json", "Retry-After": "60" } },
      ),
      request,
    );
  }

  const env = serverEnv();
  const spent = await getBudget("qloo").catch(() => 0);
  if (spent >= env.DAILY_QLOO_BUDGET) {
    return withCors(
      new Response(
        JSON.stringify({ error: "The live demo is resting for today. Please try again tomorrow." }),
        { status: 503, headers: { "content-type": "application/json" } },
      ),
      request,
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return withCors(
      new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 }),
      request,
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return withCors(
      new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 }),
      request,
    );
  }

  const input = {
    anchors: parsed.data.anchors,
    origin: parsed.data.origin ? normaliseCity(parsed.data.origin) : undefined,
    destination: normaliseCity(parsed.data.destination),
    prefs: parsed.data.prefs,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));
      try {
        for await (const event of runAgent(input)) {
          send(encodeSse(event));
        }
      } catch (err) {
        console.error("[agent] run failed", err instanceof Error ? err.message : "unknown");
        send(encodeSse({ type: "error", message: "The agent hit a problem. Please try again." }));
      } finally {
        controller.close();
      }
    },
  });

  return withCors(
    new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    }),
    request,
  );
}
