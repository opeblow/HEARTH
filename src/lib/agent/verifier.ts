import type { Place } from "@/lib/domain";

/**
 * The Grounding Contract, enforced in code.
 *
 * The agent may not present a place that is not present in this run's Qloo
 * results. This verifier is the hard gate: any id absent from `allowedIds` is
 * dropped and counted. Duplicates are merged. Order is preserved.
 */
export function verifyPlaces(
  places: Place[],
  allowedIds: Set<string>,
): { kept: Place[]; rejected: number } {
  const byId = new Map<string, Place>();
  let rejected = 0;

  for (const place of places) {
    if (!allowedIds.has(place.entityId)) {
      rejected += 1;
      continue;
    }
    const existing = byId.get(place.entityId);
    if (!existing) {
      byId.set(place.entityId, place);
      continue;
    }
    // Merge duplicates: keep the stronger affinity, union anchors and tags.
    byId.set(place.entityId, {
      ...existing,
      affinity: Math.max(existing.affinity ?? 0, place.affinity ?? 0) || undefined,
      anchorIds: Array.from(new Set([...existing.anchorIds, ...place.anchorIds])),
      tags: Array.from(new Set([...existing.tags, ...place.tags])),
    });
  }

  return { kept: Array.from(byId.values()), rejected };
}

/** Collect the set of entity ids a run is allowed to reference. */
export function allowedIdSet(...groups: Array<Array<{ entityId: string } | { id: string }>>): Set<string> {
  const set = new Set<string>();
  for (const group of groups) {
    for (const item of group) {
      if ("entityId" in item) set.add(item.entityId);
      else set.add(item.id);
    }
  }
  return set;
}
