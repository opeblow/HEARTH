import "server-only";
import type { Coords, EntityRef, Neighbourhood, Place, Prefs, RunSource } from "@/lib/domain";
import { serverEnv, qlooMode } from "@/lib/security/env";
import {
  qlooInsightsResponseSchema,
  qlooSearchResponseSchema,
} from "@/lib/qloo/schemas";
import type { InsightParams, QlooEntity } from "@/lib/qloo/schemas";
import { cacheGet, cacheSet } from "@/lib/qloo/cache";
import {
  runFixtureCrossDomain,
  runFixtureInsights,
  runFixtureNeighbourhoods,
  resolveAnchors,
} from "@/lib/qloo/engine";

/**
 * The single choke point for Qloo access. Holds the key (server only), applies
 * timeouts/retries/caching, validates every response, and normalises results
 * into the app's domain types. Live mode is the only mode in production; the
 * recorded fixture engine is a development fallback and marks source "demo".
 */

export class QlooError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "QlooError";
  }
}

const CACHE_TTL: Record<string, number> = {
  search: 60 * 60 * 24,
  insights: 60 * 60 * 24,
  cross: 60 * 60 * 24,
  hoods: 60 * 60 * 24,
};

function cacheKey(kind: string, params: unknown): string {
  return `qloo:${kind}:${JSON.stringify(params)}`;
}

/**
 * In-flight request coalescing. When several callers ask for the same thing at
 * once (e.g. the agent fans out and a second run starts before the first
 * finishes), they share one network round trip instead of racing duplicates.
 */
const inflight = new Map<string, Promise<unknown>>();

function dedupe<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const pending = loader().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 4): Promise<Response> {
  const timeoutMs = serverEnv().QLOO_TIMEOUT_MS;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.status >= 500 && attempt < attempts - 1) {
        await backoff(attempt);
        continue;
      }
      // Qloo rate-limits bursts; back off and retry rather than dropping a whole
      // domain. Honour Retry-After when present.
      if (res.status === 429 && attempt < attempts - 1) {
        await backoff(attempt, res.headers.get("retry-after"));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < attempts - 1) await backoff(attempt);
    }
  }
  throw new QlooError(
    `Qloo request failed after ${attempts} attempts: ${
      lastError instanceof Error ? lastError.message : "unknown"
    }`,
  );
}

function backoff(attempt: number, retryAfter?: string | null): Promise<void> {
  const header = retryAfter != null ? Number(retryAfter) : NaN;
  const base =
    Number.isFinite(header) && header > 0 ? Math.min(header * 1000, 8000) : 700 * 2 ** attempt;
  const jitter = Math.random() * 250;
  return new Promise((r) => setTimeout(r, base + jitter));
}

function authHeaders(): HeadersInit {
  const env = serverEnv();
  if (!env.QLOO_API_KEY) throw new QlooError("QLOO_API_KEY is not configured");
  return {
    "x-api-key": env.QLOO_API_KEY,
    accept: "application/json",
    "content-type": "application/json",
  };
}

/* ------------------------------------------------------------------ probe */

/**
 * Lightweight liveness probe for health checks: one tiny search, short-cached
 * so uptime monitors don't burn budget. Never throws.
 */
export async function probeQloo(): Promise<{ ok: boolean; status?: number }> {
  if (qlooMode() !== "live") return { ok: false };
  const key = "health:qloo";
  const cached = await cacheGet<boolean>(key).catch(() => null);
  if (cached !== null) return { ok: cached };

  try {
    const env = serverEnv();
    const url = new URL(`${env.QLOO_BASE_URL}/search`);
    url.searchParams.set("query", "coffee");
    url.searchParams.set("take", "1");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url.toString(), {
      headers: authHeaders(),
      signal: controller.signal,
      method: "GET",
    });
    clearTimeout(timer);
    await cacheSet(key, res.ok, res.ok ? 120 : 30).catch(() => undefined);
    return { ok: res.ok, status: res.status };
  } catch {
    await cacheSet(key, false, 30).catch(() => undefined);
    return { ok: false };
  }
}

/* ------------------------------------------------------------------ search */

export async function searchEntities(
  query: string,
  types?: string[],
): Promise<{ entities: EntityRef[]; source: RunSource }> {
  const q = query.trim().slice(0, 80);
  if (!q) return { entities: [], source: qlooMode() === "live" ? "live" : "demo" };

  if (qlooMode() === "fixtures") {
    return { entities: resolveAnchors(q), source: "demo" };
  }

  const key = cacheKey("search", { q, types });
  const cached = await cacheGet<EntityRef[]>(key);
  if (cached) return { entities: cached, source: "cached" };

  const entities = await dedupe(key, async () => {
    const env = serverEnv();
    const url = new URL(`${env.QLOO_BASE_URL}/search`);
    url.searchParams.set("query", q);
    url.searchParams.set("take", "6");
    if (types?.length) url.searchParams.set("type", types.join(","));

    const res = await fetchWithRetry(url.toString(), { headers: authHeaders(), method: "GET" });
    if (!res.ok) throw new QlooError("Qloo entity search failed", res.status);
    const json = qlooSearchResponseSchema.parse(await res.json());

    const mapped: EntityRef[] = (json.results ?? []).map((e) => mapEntityRef(e));

    await cacheSet(key, mapped, CACHE_TTL.search ?? 3600);
    return mapped;
  });

  return { entities, source: "live" };
}

/* --------------------------------------------------------------- insights */

export type InsightsResult = {
  places: Place[];
  source: RunSource;
};

export async function insights(
  params: InsightParams,
  ctx: { anchors: EntityRef[]; destination: string; bucket: Place["bucket"]; prefs: Prefs },
): Promise<InsightsResult> {
  if (qlooMode() === "fixtures") {
    return {
      places: runFixtureInsights({
        anchors: ctx.anchors,
        destination: ctx.destination,
        bucket: ctx.bucket,
        prefs: ctx.prefs,
        take: params.take,
        exclude: params.filter?.exclude?.entities,
      }),
      source: "demo",
    };
  }

  const key = cacheKey("insights", params);
  const cached = await cacheGet<Place[]>(key);
  if (cached) return { places: cached, source: "cached" };

  const places = await dedupe(key, async () => {
    const env = serverEnv();
    const res = await fetchWithRetry(`${env.QLOO_BASE_URL}/insights`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new QlooError(`Qloo insights failed (${res.status})`, res.status);
    const json = qlooInsightsResponseSchema.parse(await res.json());

    const weights = anchorWeights(ctx.anchors);
    const anchorTagPool = new Set(ctx.anchors.flatMap((a) => a.tags)).size;
    const entities = json.results?.entities ?? [];
    const mapped: Place[] = entities.map((e) =>
      mapPlace(e, { bucket: ctx.bucket, anchors: ctx.anchors, weights, anchorTagPool }),
    );

    await cacheSet(key, mapped, CACHE_TTL.insights ?? 3600);
    return mapped;
  });

  return { places, source: "live" };
}

/* ----------------------------------------------------------- cross-domain */

export async function crossDomain(
  anchors: EntityRef[],
  destination: string,
): Promise<{ entities: EntityRef[]; source: RunSource }> {
  if (qlooMode() === "fixtures") {
    return { entities: runFixtureCrossDomain(anchors), source: "demo" };
  }
  const params = { anchors: anchors.map((a) => a.id), destination };
  const key = cacheKey("cross", params);
  const cached = await cacheGet<EntityRef[]>(key);
  if (cached) return { entities: cached, source: "cached" };

  const entities = await dedupe(key, async () => {
    const env = serverEnv();
    const wanted = ["urn:entity:artist", "urn:entity:movie", "urn:entity:brand"];
    const results = await Promise.allSettled(
      wanted.map(async (type) => {
        const res = await fetchWithRetry(`${env.QLOO_BASE_URL}/insights`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            filter: { type, location: { query: destination } },
            signal: { interests: { entities: anchors.map((a) => a.id) } },
            take: 4,
          } satisfies InsightParams),
        });
        if (!res.ok) throw new QlooError("cross-domain failed", res.status);
        const json = qlooInsightsResponseSchema.parse(await res.json());
        return (json.results?.entities ?? []).map<EntityRef>((e) => mapEntityRef(e));
      }),
    );

    const mapped = results
      .filter((r): r is PromiseFulfilledResult<EntityRef[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    await cacheSet(key, mapped, CACHE_TTL.cross ?? 3600);
    return mapped;
  });

  return { entities, source: "live" };
}

/* ---------------------------------------------------------- neighbourhoods */

export async function neighbourhoods(
  anchors: EntityRef[],
  destination: string,
): Promise<{ hoods: Neighbourhood[]; source: RunSource }> {
  if (qlooMode() === "fixtures") {
    return { hoods: runFixtureNeighbourhoods(anchors, destination), source: "demo" };
  }
  const params = { anchors: anchors.map((a) => a.id), destination };
  const key = cacheKey("hoods", params);
  const cached = await cacheGet<Neighbourhood[]>(key);
  if (cached) return { hoods: cached, source: "cached" };

  const hoods = await dedupe(key, async () => {
    const env = serverEnv();
    // One pull of grounded places for the destination, then group by the real
    // `properties.neighborhood` the API returns — no hardcoded neighbourhoods.
    const res = await fetchWithRetry(`${env.QLOO_BASE_URL}/insights`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        filter: { type: "urn:entity:place", location: { query: destination } },
        signal: { interests: { entities: anchors.map((a) => a.id) } },
        take: 30,
      } satisfies InsightParams),
    });
    if (!res.ok) throw new QlooError(`compass failed (${res.status})`, res.status);
    const json = qlooInsightsResponseSchema.parse(await res.json());

    const weights = anchorWeights(anchors);
    const anchorTagPool = new Set(anchors.flatMap((a) => a.tags)).size;
    const places = (json.results?.entities ?? []).map((e) =>
      mapPlace(e, { bucket: "community", anchors, weights, anchorTagPool }),
    );

    await cacheSet(key, buildHoods(places, destination), CACHE_TTL.hoods ?? 3600);
    return buildHoods(places, destination);
  });

  return { hoods, source: "live" };
}

/* --------------------------------------------------------------- helpers */

function anchorWeights(anchors: EntityRef[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const a of anchors) for (const t of a.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return map;
}

function mapEntityRef(e: QlooEntity): EntityRef {
  return {
    id: e.entity_id,
    name: e.name ?? e.properties?.name ?? e.entity_id,
    type: normalizeType(e.subtype ?? e.type),
    imageUrl: imageUrlOf(e),
    tags: tagNames(e).slice(0, 20),
  };
}

function mapPlace(
  e: QlooEntity,
  ctx: { bucket: Place["bucket"]; anchors: EntityRef[]; weights: Map<string, number>; anchorTagPool: number },
): Place {
  const allTags = tagNames(e);
  const shared = allTags.filter((t) => ctx.weights.has(t));
  const anchor = ctx.anchors.find((a) => a.tags.some((t) => allTags.includes(t)));
  const shareRatio = ctx.anchorTagPool ? shared.length / Math.min(ctx.anchorTagPool, 8) : 0;
  const popularity = e.popularity ?? 0.5;

  const affinity =
    e.affinity != null
      ? Math.min(0.98, e.affinity)
      : clamp01(0.2 + 0.5 * Math.min(1, shareRatio) + 0.25 * popularity);

  return {
    entityId: e.entity_id,
    name: e.name ?? e.properties?.name ?? e.entity_id,
    bucket: ctx.bucket,
    type: normalizeType(e.subtype ?? e.type),
    coords: coordsOf(e),
    neighbourhood: e.properties?.neighborhood?.trim() || e.properties?.geocode?.name,
    affinity,
    tags: allTags.slice(0, 20),
    imageUrl: imageUrlOf(e),
    priceLevel: clampPrice(e.properties?.price_level ?? undefined),
    anchorIds: anchor ? [anchor.id] : [],
    reason:
      shared.length > 0 && anchor
        ? `Shares ${joinWords(shared.slice(0, 2))} with ${anchor.name}.`
        : `A grounded match from the Qloo taste graph for your anchors.`,
  };
}

/**
 * Neighbourhoods are derived from the real `neighborhood` values the API
 * returns for grounded places: grouped, scored by density × affinity, and
 * described from the tags those places actually share.
 */
function buildHoods(places: Place[], destination: string): Neighbourhood[] {
  const groups = new Map<string, Place[]>();
  for (const p of places) {
    const hood = p.neighbourhood?.trim();
    if (!hood) continue;
    const bucket = groups.get(hood);
    if (bucket) bucket.push(p);
    else groups.set(hood, [p]);
  }
  if (groups.size === 0) return [];

  const maxCount = Math.max(...[...groups.values()].map((g) => g.length));
  const hoods: Neighbourhood[] = [];
  for (const [name, group] of groups) {
    const avgAffinity =
      group.reduce((acc, p) => acc + (p.affinity ?? 0.5), 0) / group.length;
    const density = maxCount > 0 ? group.length / maxCount : 0;
    const score = clamp(0.1, 0.97, 0.55 * density + 0.45 * avgAffinity);
    const highlights = topTags(group, 3);
    const withCoords = group.filter((p) => p.coords);
    const coords =
      withCoords.length > 0
        ? {
            lat: withCoords.reduce((a, p) => a + (p.coords?.lat ?? 0), 0) / withCoords.length,
            lon: withCoords.reduce((a, p) => a + (p.coords?.lon ?? 0), 0) / withCoords.length,
          }
        : undefined;
    hoods.push({
      id: slug(`${name}-${destination}`),
      name,
      score: Number(score.toFixed(3)),
      coords,
      highlights,
      blurb:
        highlights.length > 0
          ? `${group.length} grounded stop${group.length === 1 ? "" : "s"} cluster here, strongest around ${joinWords(highlights)}.`
          : `${group.length} grounded stop${group.length === 1 ? "" : "s"} cluster here.`,
    });
  }

  hoods.sort((a, b) => b.score - a.score);
  return hoods.slice(0, 6);
}

function topTags(places: Place[], n: number): string[] {
  const counts = new Map<string, number>();
  for (const p of places) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([t]) => t);
}

function tagEntries(e: QlooEntity): { name?: string; type?: string; id?: string }[] {
  const fromEntity = e.tags ?? [];
  const fromProps = (e.properties?.tags ?? []).map((t) => (typeof t === "string" ? { name: t } : t));
  return [...fromEntity, ...fromProps];
}

const GENERIC_TAGS = new Set([
  "place",
  "destination",
  "point of interest",
  "establishment",
  "business",
  "service",
  "services",
  "onsite services",
  "facility",
]);

/**
 * Tags ordered by how much they say about taste: genre / category / cuisine
 * first, ambience next, plumbing (parking, payments, restrooms) last. Keeps the
 * reason line honest *and* worth reading.
 */
function tagPriority(t: { name?: string; type?: string; id?: string }): number {
  const name = (t.name ?? "").toLowerCase();
  if (GENERIC_TAGS.has(name)) return 9;
  const key = `${t.type ?? ""} ${t.id ?? ""}`.toLowerCase();
  if (/genre|category|cuisine|style|music|interest|specialty/.test(key)) return 0;
  if (/ambience|mood|atmosphere|vibe|quality/.test(key)) return 1;
  if (/setting|neighborhood_characteristic|place_type|activity|audience/.test(key)) return 2;
  if (/time_of_day_fit|amenity|children|payment|accessib|parking|service/.test(key)) return 8;
  return 4;
}

function tagNames(e: QlooEntity): string[] {
  const best = new Map<string, number>();
  for (const t of tagEntries(e)) {
    const name = t.name;
    if (!name) continue;
    const p = tagPriority(t);
    const prev = best.get(name);
    if (prev == null || p < prev) best.set(name, p);
  }
  return [...best.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
}

function imageUrlOf(e: QlooEntity): string | undefined {
  const img = e.properties?.image;
  if (typeof img === "string") return img;
  if (img?.url) return img.url;
  const first = e.properties?.images?.[0];
  if (typeof first === "string") return first;
  return first?.url;
}

function coordsOf(e: QlooEntity): Coords | undefined {
  const raw = { ...(e.location ?? {}), ...(e.properties?.geolocation ?? {}) } as Record<string, unknown>;
  const lat = numberOr(raw.lat, raw.latitude);
  const lon = numberOr(raw.lon, raw.longitude);
  if (lat != null && lon != null) return { lat, lon };
  return undefined;
}

function numberOr(...values: unknown[]): number | undefined {
  for (const v of values) if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function normalizeType(type: string | undefined): EntityRef["type"] {
  const t = (type ?? "").toLowerCase();
  if (t.includes("artist")) return "artist";
  if (t.includes("movie") || t.includes("film")) return "film";
  if (t.includes("tv")) return "tv";
  if (t.includes("brand")) return "brand";
  if (t.includes("book")) return "book";
  if (t.includes("podcast")) return "podcast";
  if (t.includes("dining") || t.includes("restaurant") || t.includes("food")) return "dining";
  return "place";
}

function clampPrice(value: number | undefined): 1 | 2 | 3 | 4 | undefined {
  if (value == null) return undefined;
  const n = Math.round(value);
  if (n < 1) return 1;
  if (n > 4) return 4;
  return n as 1 | 2 | 3 | 4;
}

function clamp01(n: number): number {
  return clamp(0.1, 0.98, n);
}

function clamp(min: number, max: number, n: number): number {
  return Math.min(max, Math.max(min, n));
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
