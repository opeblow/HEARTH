import { NextResponse } from "next/server";
import { z } from "zod";
import { createShareCard, deleteShareCard, getShareCard } from "@/lib/share";
import { enforceRateLimit } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";

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
  const limit = await enforceRateLimit(request);
  if (!limit.ok) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { id, deleteToken } = await createShareCard(parsed.data);
  return NextResponse.json({ id, deleteToken, url: `/s/${id}` }, { status: 201 });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const card = await getShareCard(id);
  if (!card) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(
    { card },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}

const deleteSchema = z.object({ id: z.string().length(32), deleteToken: z.string().min(8).max(80) });

export async function DELETE(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const ok = await deleteShareCard(parsed.data.id, parsed.data.deleteToken);
  if (!ok) return NextResponse.json({ error: "Could not delete." }, { status: 403 });
  return NextResponse.json({ deleted: true });
}
