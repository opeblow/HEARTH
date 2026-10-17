import { describe, expect, it } from "vitest";
import {
  blendQuery,
  comfortQuery,
  communityQuery,
  discoveryQuery,
  popularityBand,
} from "@/lib/qloo/queries";
import { DEFAULT_PREFS } from "@/lib/domain";

describe("popularityBand", () => {
  it("keeps discovery's ceiling below comfort's at equal familiarity", () => {
    const comfort = popularityBand(0.5, "comfort");
    const discovery = popularityBand(0.5, "discovery");
    expect(discovery.max).toBeLessThan(comfort.max);
  });

  it("always returns a valid, ordered band", () => {
    for (const familiarity of [0, 0.25, 0.5, 0.75, 1]) {
      for (const bucket of ["comfort", "community", "discovery"] as const) {
        const band = popularityBand(familiarity, bucket);
        expect(band.min).toBeGreaterThanOrEqual(0);
        expect(band.max).toBeLessThanOrEqual(1);
        expect(band.min).toBeLessThanOrEqual(band.max);
      }
    }
  });
});

describe("query builders", () => {
  const anchors = ["an-afrobeats-bar", "an-suya"];

  it("scopes every place query to the destination", () => {
    for (const q of [
      comfortQuery(anchors, "Toronto", DEFAULT_PREFS),
      communityQuery(anchors, "Toronto", DEFAULT_PREFS),
      discoveryQuery(anchors, "Toronto", ["x"], DEFAULT_PREFS),
    ]) {
      expect(q.filter?.location?.query).toBe("Toronto");
      expect(q.filter?.type).toBe("urn:entity:place");
      expect(q.signal?.interests?.entities).toEqual(anchors);
    }
  });

  it("gives community a popularity band and no operator block", () => {
    const q = communityQuery(anchors, "Toronto", DEFAULT_PREFS);
    expect(q.filter?.popularity).toBeDefined();
    expect(q).not.toHaveProperty("operator");
  });

  it("passes exclusions through for discovery", () => {
    const q = discoveryQuery(anchors, "Toronto", ["seen-1"], DEFAULT_PREFS);
    expect(q.filter?.exclude?.entities).toEqual(["seen-1"]);
  });

  it("combines both people's anchors in a blend query", () => {
    const q = blendQuery(["a1"], ["b1"], "Berlin");
    expect(q.signal?.interests?.entities).toEqual(["a1", "b1"]);
  });
});
