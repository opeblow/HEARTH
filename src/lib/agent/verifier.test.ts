import { describe, expect, it } from "vitest";
import { verifyPlaces, allowedIdSet } from "@/lib/agent/verifier";
import type { Place } from "@/lib/domain";

function place(over: Partial<Place> & { entityId: string }): Place {
  return {
    name: over.entityId,
    bucket: "comfort",
    type: "place",
    tags: [],
    reason: "x",
    anchorIds: [],
    ...over,
  };
}

describe("verifyPlaces", () => {
  it("keeps only places whose id is in the allowed set", () => {
    const allowed = new Set(["a", "b"]);
    const { kept, rejected } = verifyPlaces(
      [place({ entityId: "a" }), place({ entityId: "b" }), place({ entityId: "c" })],
      allowed,
    );
    expect(kept.map((p) => p.entityId)).toEqual(["a", "b"]);
    expect(rejected).toBe(1);
  });

  it("rejects everything when the allowed set is empty", () => {
    const { kept, rejected } = verifyPlaces(
      [place({ entityId: "a" }), place({ entityId: "b" })],
      new Set(),
    );
    expect(kept).toHaveLength(0);
    expect(rejected).toBe(2);
  });

  it("merges duplicates, keeping the stronger affinity and unioning anchors/tags", () => {
    const { kept } = verifyPlaces(
      [
        place({ entityId: "a", affinity: 0.4, tags: ["coffee"], anchorIds: ["x"] }),
        place({ entityId: "a", affinity: 0.8, tags: ["quiet"], anchorIds: ["y"] }),
      ],
      new Set(["a"]),
    );
    expect(kept).toHaveLength(1);
    expect(kept[0]!.affinity).toBe(0.8);
    expect(new Set(kept[0]!.tags)).toEqual(new Set(["coffee", "quiet"]));
    expect(new Set(kept[0]!.anchorIds)).toEqual(new Set(["x", "y"]));
  });

  it("preserves first-seen order", () => {
    const { kept } = verifyPlaces(
      [place({ entityId: "b" }), place({ entityId: "a" }), place({ entityId: "c" })],
      new Set(["a", "b", "c"]),
    );
    expect(kept.map((p) => p.entityId)).toEqual(["b", "a", "c"]);
  });
});

describe("allowedIdSet", () => {
  it("collects entityId and id fields", () => {
    const set = allowedIdSet([{ entityId: "a" }], [{ id: "b" }], [{ entityId: "c" }]);
    expect(set).toEqual(new Set(["a", "b", "c"]));
  });
});
