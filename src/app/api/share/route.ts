import { NextResponse } from "next/server";
import { z } from "zod";
import { createShareCard, deleteShareCard, getShareCard } from "@/lib/share";
import { enforceRateLimit } from "@/lib/security/ratelimit";
import { handleOptions, withCors } from "@/lib/security/cors";

export const dynamic = "force-dynamic";

/** CORS preflight. */
export function OPTIONS(request: Request) {
  return handleOptions(request) ?? new Response(null, { status: 204 });
}

const coordsSchema = z.object({ lat: z.number(), lon: z.number() });

const placeSchema = z.object({
  entityId: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  bucket: z.enum(["comfort", "community", "discovery"]),
  type: z.enum(["place", "artist", "film", "tv", "dining", "brand", "book", "podcast"]),
  coords: coordsSchema.optional(),
  neighbourhood: z.string().max(80).optional(),
  affinity: z.number().min(0).max(1).optional(),
  tags: z.array(z.string().max(60)).max(20),
  reason: z.string().max(400),
  imageUrl: z.string().max(500).optional(),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  anchorIds: z.array(z.string().max(80)).max(20),
});

const createSchema = z
  .object({
    title: z.string().min(1).max(80),
    destination: z.string().min(1).max(60),
    picks: z.array(placeSchema).min(1).max(8),
  })
  .strict();

export async function POST(request: Request) {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  const limit = await enforceRateLimit(request);
  if (!limit.ok) {
    return withCors(
      NextResponse.json({ error: "Slow down a little." }, { status: 429 }),
      request,
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid request." }, { status: 400 }), request);
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return withCors(NextResponse.json({ error: "Invalid request." }, { status: 400 }), request);
  }

  const { id, deleteToken } = await createShareCard(parsed.data);
  return withCors(
    NextResponse.json({ id, deleteToken, url: `/s/${id}` }, { status: 201 }),
    request,
  );
}

export async function GET(request: Request) {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const card = await getShareCard(id);
  if (!card) {
    return withCors(NextResponse.json({ error: "Not found." }, { status: 404 }), request);
  }
  return withCors(
    NextResponse.json(
      { card },
      { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
    ),
    request,
  );
}

const deleteSchema = z.object({ id: z.string().length(32), deleteToken: z.string().min(8).max(80) });

export async function DELETE(request: Request) {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid request." }, { status: 400 }), request);
  }
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) {
    return withCors(NextResponse.json({ error: "Invalid request." }, { status: 400 }), request);
  }

  const ok = await deleteShareCard(parsed.data.id, parsed.data.deleteToken);
  if (!ok) {
    return withCors(NextResponse.json({ error: "Could not delete." }, { status: 403 }), request);
  }
  return withCors(NextResponse.json({ deleted: true }), request);
}
