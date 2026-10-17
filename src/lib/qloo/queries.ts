import type { InsightParams } from "@/lib/qloo/schemas";
import type { Bucket, Prefs } from "@/lib/domain";

/**
 * Query builders. Keeping the Qloo parameter shapes in one place makes the
 * multi-call strategy auditable, powers the trace drawer, and gives the live
 * client a single place to build requests from.
 */

export function resolveQuery(text: string) {
  return { query: text.trim(), take: 6 };
}

export function comfortQuery(
  anchorIds: string[],
  destination: string,
  prefs: Prefs,
): InsightParams {
  return {
    filter: {
      type: "urn:entity:place",
      location: { query: destination },
      popularity: popularityBand(prefs.familiarity, "comfort"),
    },
    signal: { interests: { entities: anchorIds } },
    take: 8,
  };
}

export function communityQuery(
  anchorIds: string[],
  destination: string,
  prefs: Prefs,
): InsightParams {
  // The API rejects our former `operator` block; the community flavour is
  // carried by a mid-popularity band plus the anchor signal instead.
  return {
    filter: {
      type: "urn:entity:place",
      location: { query: destination },
      popularity: popularityBand(prefs.familiarity, "community"),
    },
    signal: { interests: { entities: anchorIds } },
    take: 8,
  };
}

export function discoveryQuery(
  anchorIds: string[],
  destination: string,
  excludeIds: string[],
  prefs: Prefs,
): InsightParams {
  return {
    filter: {
      type: "urn:entity:place",
      location: { query: destination },
      exclude: { entities: excludeIds },
      popularity: popularityBand(prefs.familiarity, "discovery"),
    },
    signal: { interests: { entities: anchorIds } },
    bias: { trends: true },
    take: 8,
  };
}

export function crossDomainQuery(anchorIds: string[], type: string, destination: string): InsightParams {
  return {
    filter: { type, location: { query: destination } },
    signal: { interests: { entities: anchorIds } },
    take: 6,
  };
}

export function compassQuery(anchorIds: string[], hood: string, destination: string): InsightParams {
  return {
    filter: { location: { query: `${hood}, ${destination}` } },
    signal: { interests: { entities: anchorIds } },
    take: 10,
  };
}

export function blendQuery(anchorIdsA: string[], anchorIdsB: string[], destination: string): InsightParams {
  return {
    filter: { type: "urn:entity:place", location: { query: destination } },
    signal: { interests: { entities: [...anchorIdsA, ...anchorIdsB] } },
    take: 10,
  };
}

/** The familiarity dial maps onto a Qloo popularity band, distinct per bucket. */
export function popularityBand(familiarity: number, bucket: Bucket): { min: number; max: number } {
  const f = Math.min(1, Math.max(0, familiarity));
  if (bucket === "comfort") {
    // Feels like home: lean mainstream, but never only the very top.
    return { min: 0.45, max: 0.98 };
  }
  if (bucket === "community") {
    // Where your people gather: the broad middle.
    return { min: 0.2, max: 0.85 };
  }
  // Discovery: adjacent, fresh. More surprise pushes the ceiling lower.
  return { min: 0.02, max: Math.max(0.35, 0.8 - 0.45 * f) };
}
