import { describe, expect, it } from "vitest";
import { buildPlan } from "@/lib/agent/planner";
import { DEFAULT_PREFS, type Bucket, type Place } from "@/lib/domain";

function place(id: string, bucket: Bucket, lat?: number, lon?: number): Place {
  return {
    entityId: id,
    name: id,
    bucket,
    type: "place",
    tags: [],
    reason: "x",
    anchorIds: [],
    coords: lat != null && lon != null ? { lat, lon } : undefined,
  };
}

describe("buildPlan", () => {
  it("always returns four themed weeks in order", () => {
    const plan = buildPlan([], DEFAULT_PREFS);
    expect(plan).toHaveLength(4);
    expect(plan.map((p) => p.week)).toEqual([1, 2, 3, 4]);
    expect(plan[0]!.theme).toBe("Settle in");
  });

  it("maps comfort/community/discovery to weeks 1..3", () => {
    const places = [
      place("c1", "comfort"),
      place("c2", "comfort"),
      place("m1", "community"),
      place("d1", "discovery"),
    ];
    const plan = buildPlan(places, DEFAULT_PREFS);
    expect(plan[0]!.placeIds).toEqual(["c1", "c2"]);
    expect(plan[1]!.placeIds).toEqual(["m1"]);
    expect(plan[2]!.placeIds).toEqual(["d1"]);
  });

  it("only references ids that were supplied", () => {
    const places = Array.from({ length: 12 }, (_, i) =>
      place(`p${i}`, i % 3 === 0 ? "comfort" : i % 3 === 1 ? "community" : "discovery"),
    );
    const ids = new Set(places.map((p) => p.entityId));
    const plan = buildPlan(places, DEFAULT_PREFS);
    for (const item of plan) {
      for (const id of item.placeIds) expect(ids.has(id)).toBe(true);
    }
  });

  it("explains empty buckets honestly rather than inventing places", () => {
    const plan = buildPlan([], DEFAULT_PREFS);
    expect(plan[0]!.placeIds).toHaveLength(0);
    expect(plan[0]!.description.toLowerCase()).toContain("couldn't ground");
  });

  it("orders week one geographically (nearest neighbour)", () => {
    // c1 and c3 are close; a greedy route shouldn't jump c2 between them.
    const places = [
      place("c1", "comfort", 0, 0),
      place("c2", "comfort", 5, 5),
      place("c3", "comfort", 0.01, 0.01),
    ];
    const plan = buildPlan(places, DEFAULT_PREFS);
    expect(plan[0]!.placeIds).toEqual(["c1", "c3", "c2"]);
  });
});
