import { describe, expect, it } from "vitest";
import {
  DEMO_PERSONAS,
  buildAnchorRefs,
  getCityPlaces,
} from "@/lib/qloo/fixtures";
import {
  hasCity,
  resolveAnchors,
  runFixtureCrossDomain,
  runFixtureInsights,
  runFixtureNeighbourhoods,
} from "@/lib/qloo/engine";
import { DEFAULT_PREFS } from "@/lib/domain";

describe("demo personas (the zero-setup path)", () => {
  it("every persona's anchors actually resolve", () => {
    for (const persona of DEMO_PERSONAS) {
      const refs = buildAnchorRefs(persona.anchorIds);
      expect(refs.length, persona.id).toBe(persona.anchorIds.length);
    }
  });

  it("every persona's destination exists in the dataset", () => {
    for (const persona of DEMO_PERSONAS) {
      expect(hasCity(persona.destination), persona.id).toBe(true);
      expect(getCityPlaces(persona.destination).length, persona.id).toBeGreaterThan(0);
    }
  });

  it("produces grounded places end-to-end for each persona", () => {
    for (const persona of DEMO_PERSONAS) {
      const anchors = buildAnchorRefs(persona.anchorIds);
      for (const bucket of ["comfort", "community", "discovery"] as const) {
        const places = runFixtureInsights({
          anchors,
          destination: persona.destination,
          bucket,
          prefs: { ...DEFAULT_PREFS, ...persona.prefs },
        });
        for (const p of places) {
          expect(p.bucket).toBe(bucket);
          expect(p.reason.length).toBeGreaterThan(0);
          expect(p.entityId).toMatch(/^[a-z]{2}-/);
        }
      }
    }
  });
});

describe("resolveAnchors", () => {
  it("finds anchors by tag", () => {
    const hits = resolveAnchors("afrobeats");
    expect(hits.length).toBeGreaterThan(0);
  });

  it("returns nothing for empty input", () => {
    expect(resolveAnchors("   ")).toEqual([]);
  });
});

describe("cross-domain + neighbourhoods", () => {
  const anchors = buildAnchorRefs(DEMO_PERSONAS[0]!.anchorIds);

  it("returns grounded cross-domain entities", () => {
    const entities = runFixtureCrossDomain(anchors);
    expect(entities.length).toBeGreaterThan(0);
    for (const e of entities) expect(e.tags.length).toBeGreaterThan(0);
  });

  it("scores neighbourhoods within a sane band", () => {
    const hoods = runFixtureNeighbourhoods(anchors, DEMO_PERSONAS[0]!.destination);
    expect(hoods.length).toBeGreaterThan(0);
    for (const h of hoods) {
      expect(h.score).toBeGreaterThanOrEqual(0.2);
      expect(h.score).toBeLessThanOrEqual(0.97);
      expect(h.highlights.length).toBeGreaterThan(0);
    }
  });
});
