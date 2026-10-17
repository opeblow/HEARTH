import type {
  Bucket,
  EntityRef,
  Neighbourhood,
  Place,
  Prefs,
} from "@/lib/domain";
import { hashString } from "@/lib/utils";
import {
  ANCHORS,
  CROSS_DOMAIN,
  NEIGHBOURHOODS,
  PLACES,
  getCityPlaces,
} from "@/lib/qloo/fixtures";

/**
 * A local taste engine over the recorded catalog. It behaves like the parts of
 * Qloo we rely on — tag-based affinity between an anchor set and destination
 * entities, popularity banding, and neighbourhood density — so the product is
 * genuinely reactive even before a key is configured. With a live key the same
 * shapes are produced by the real Insights API.
 */

const COMMUNITY_TAGS = new Set([
  "community",
  "diaspora",
  "live-music",
  "market",
  "beach",
  "family",
  "park",
  "coffee",
  "specialty-coffee",
  "theatre",
  "surf",
  "coworking",
]);

const FOOD_TAGS = new Set([
  "street-food",
  "ramen",
  "west-african",
  "indian",
  "caribbean",
  "korean-bbq",
  "small-plates",
  "brunch",
  "grilled",
  "food",
  "continental",
  "plant-based",
  "vegan",
  "vegetarian",
]);

const DIET_TAGS = new Set(["vegan", "vegetarian", "plant-based", "halal", "gluten-free"]);
const ACCESS_TAGS = new Set(["step-free", "accessible", "wheelchair"]);

function pseudoPopularity(id: string): number {
  return (hashString(id) % 1000) / 1000;
}

function jitter(id: string, spread = 0.05): number {
  return ((hashString(`j:${id}`) % 1000) / 1000 - 0.5) * 2 * spread;
}

function anchorWeightMap(anchors: EntityRef[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const a of anchors) {
    for (const t of a.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

function sharedTags(placeTags: string[], weights: Map<string, number>): string[] {
  return placeTags
    .filter((t) => weights.has(t))
    .sort((a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0));
}

function scoringAnchors(place: Place, anchors: EntityRef[], weights: Map<string, number>) {
  const ids = anchors
    .filter((a) => a.tags.some((t) => place.tags.includes(t)))
    .map((a) => a.id);
  return ids;
}

function rawPlace(p: (typeof PLACES)[number]): Omit<Place, "reason" | "anchorIds" | "bucket"> {
  return {
    entityId: p.id,
    name: p.name,
    type: p.type,
    coords: p.coords,
    neighbourhood: p.neighbourhood,
    priceLevel: p.price,
    tags: p.tags,
  };
}

function affinityFor(
  placeTags: string[],
  anchors: EntityRef[],
  weights: Map<string, number>,
): number {
  const score = sharedTags(placeTags, weights).reduce(
    (acc, t) => acc + (weights.get(t) ?? 0),
    0,
  );
  const denom = Math.max(2, anchors.length * 1.6);
  return Math.min(0.98, Math.max(0.08, score / denom));
}

function passesFilters(
  p: (typeof PLACES)[number],
  prefs: Prefs,
  bucket: Bucket,
): boolean {
  const isFood = p.type === "dining" || p.tags.some((t) => FOOD_TAGS.has(t));

  if (prefs.budget === "low" && (p.price ?? 1) > 2) return false;
  if (prefs.budget === "mid" && (p.price ?? 1) > 3) return false;

  if (prefs.dietary.length > 0 && isFood) {
    const wanted = prefs.dietary.filter((d) => DIET_TAGS.has(d));
    if (wanted.length > 0 && !wanted.some((d) => p.tags.includes(d))) return false;
  }

  if (prefs.accessibility.some((a) => ACCESS_TAGS.has(a))) {
    if (isFood && !p.tags.some((t) => ACCESS_TAGS.has(t))) return false;
  }

  // The familiarity dial biases which bucket gets the strong rooms.
  if (bucket === "discovery") {
    const pop = pseudoPopularity(p.id);
    if (pop > 0.78) return false; // discovery deliberately avoids the mega-popular
  }
  return true;
}

function vibeBoost(tags: string[], prefs: Prefs): number {
  let boost = 0;
  if (prefs.vibe === "lively" && tags.some((t) => ["lively", "dance", "late-night", "music", "club"].includes(t))) {
    boost += 0.06;
  }
  if (prefs.vibe === "quiet" && tags.some((t) => ["quiet", "intimate", "views", "park"].includes(t))) {
    boost += 0.06;
  }
  return boost;
}

function toPlace(
  p: (typeof PLACES)[number],
  bucket: Bucket,
  anchors: EntityRef[],
  weights: Map<string, number>,
  prefs: Prefs,
): Place {
  const base = affinityFor(p.tags, anchors, weights) + vibeBoost(p.tags, prefs) + jitter(p.id);
  const affinity = Math.min(0.98, Math.max(0.06, base));
  const shared = sharedTags(p.tags, weights);
  const anchorForTag = anchors.find((a) => shared.some((t) => a.tags.includes(t)));
  const reason =
    shared.length > 0 && anchorForTag
      ? `Shares ${shared.slice(0, 2).join(" and ")} with ${anchorForTag.name}, and sits in ${p.neighbourhood}.`
      : `Adjacent to your taste through ${shared[0] ?? p.tags[0] ?? "the neighbourhood"}, a useful first step in ${p.neighbourhood}.`;
  return {
    ...rawPlace(p),
    bucket,
    affinity: Number(affinity.toFixed(3)),
    reason,
    anchorIds: scoringAnchors({ ...rawPlace(p), bucket, affinity, reason, anchorIds: [] } as Place, anchors, weights),
  };
}

export type InsightsRequest = {
  anchors: EntityRef[];
  destination: string;
  bucket: Bucket;
  exclude?: string[];
  take?: number;
  prefs: Prefs;
};

export function runFixtureInsights(req: InsightsRequest): Place[] {
  const weights = anchorWeightMap(req.anchors);
  const pool = getCityPlaces(req.destination).filter((p) =>
    passesFilters(p, req.prefs, req.bucket),
  );

  const exclude = new Set(req.exclude ?? []);
  const take = req.take ?? 8;

  let chosen: Array<(typeof PLACES)[number]>;

  if (req.bucket === "comfort") {
    chosen = [...pool].sort(
      (a, b) =>
        affinityFor(b.tags, req.anchors, weights) - affinityFor(a.tags, req.anchors, weights),
    );
  } else if (req.bucket === "community") {
    chosen = pool
      .filter((p) => p.tags.some((t) => COMMUNITY_TAGS.has(t)))
      .sort(
        (a, b) =>
          affinityFor(b.tags, req.anchors, weights) - affinityFor(a.tags, req.anchors, weights),
      );
  } else {
    chosen = pool
      .filter((p) => !exclude.has(p.id))
      .filter((p) => sharedTags(p.tags, weights).length <= 2)
      .sort((a, b) => pseudoPopularity(a.id) - pseudoPopularity(b.id));
  }

  chosen = chosen.filter((p) => (req.bucket === "discovery" ? true : !exclude.has(p.id)));

  return chosen
    .slice(0, take)
    .map((p) => toPlace(p, req.bucket, req.anchors, weights, req.prefs));
}

export function resolveAnchors(query: string, limit = 6): EntityRef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool: Array<{ id: string; name: string; type: EntityRef["type"]; tags: string[] }> = [
    ...ANCHORS.map((a) => ({ id: a.id, name: a.name, type: a.type, tags: a.tags })),
    ...CROSS_DOMAIN.map((c) => ({ id: c.id, name: c.name, type: c.type, tags: c.tags })),
    ...PLACES.map((p) => ({ id: p.id, name: p.name, type: p.type, tags: p.tags })),
  ];
  const scored = pool
    .map((e) => {
      const name = e.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score += 6;
      else if (name.includes(q)) score += 4;
      if (e.tags.some((t) => t.includes(q))) score += 3;
      if (q.split(/\s+/).some((w) => w.length > 2 && name.includes(w))) score += 1;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const seen = new Set<string>();
  return scored
    .filter(({ e }) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .map(({ e }) => ({ id: e.id, name: e.name, type: e.type, tags: e.tags }));
}

export function runFixtureCrossDomain(anchors: EntityRef[], limit = 6): EntityRef[] {
  const weights = anchorWeightMap(anchors);
  return CROSS_DOMAIN.map((c) => ({
    entity: c,
    score: c.tags.reduce((acc, t) => acc + (weights.get(t) ?? 0), 0) + jitter(c.id, 0.2),
  }))
    .filter((x) => x.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entity }) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      tags: entity.tags,
    }));
}

export function runFixtureNeighbourhoods(
  anchors: EntityRef[],
  destination: string,
): Neighbourhood[] {
  const list = NEIGHBOURHOODS[destination] ?? [];
  const weights = anchorWeightMap(anchors);
  return list
    .map((h) => {
      const raw =
        h.highlights.reduce((acc, t) => acc + (weights.get(t) ?? 0), 0) +
        jitter(h.id, 0.4) +
        0.5;
      const score = Math.min(0.97, Math.max(0.2, raw / Math.max(2, anchors.length)));
      return { id: h.id, name: h.name, coords: h.coords, highlights: h.highlights, blurb: h.blurb, score: Number(score.toFixed(3)) };
    })
    .sort((a, b) => b.score - a.score);
}

export function hasCity(city: string): boolean {
  return PLACES.some((p) => p.city.toLowerCase() === city.trim().toLowerCase());
}
