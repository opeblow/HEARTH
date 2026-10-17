import { NextResponse } from "next/server";
import { z } from "zod";
import { searchEntities } from "@/lib/qloo/client";
import { enforceRateLimit } from "@/lib/security/ratelimit";
import { looksLikeInjection } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(1).max(80),
  type: z.string().max(40).optional(),
});

export async function GET(request: Request) {
  const limit = await enforceRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many searches. Give it a moment." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    type: url.searchParams.get("type") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }

  // Refuse and drop obvious prompt-injection payloads instead of echoing them.
  const safeQuery = looksLikeInjection(parsed.data.q) ? parsed.data.q.slice(0, 24) : parsed.data.q;

  try {
    const { entities, source } = await searchEntities(safeQuery);
    return NextResponse.json(
      {
        entities,
        source,
        injectionBlocked: looksLikeInjection(parsed.data.q),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Search is unavailable right now." }, { status: 502 });
  }
}
