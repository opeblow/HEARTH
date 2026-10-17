import { describe, expect, it } from "vitest";
import { clamp, formatAffinity, hashString, slugify } from "@/lib/utils";

describe("clamp", () => {
  it("bounds values to the range", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

describe("formatAffinity", () => {
  it("renders an em dash for missing or NaN affinity", () => {
    expect(formatAffinity(undefined)).toBe("—");
    expect(formatAffinity(Number.NaN)).toBe("—");
  });

  it("rounds honestly and never rounds up past the value", () => {
    expect(formatAffinity(0.842)).toBe("84%");
    expect(formatAffinity(0)).toBe("0%");
  });
});

describe("slugify", () => {
  it("produces url-safe slugs", () => {
    expect(slugify("São Paulo, Brazil!")).toBe("sao-paulo-brazil");
  });
});

describe("hashString", () => {
  it("is deterministic and non-negative", () => {
    expect(hashString("hearth")).toBe(hashString("hearth"));
    expect(hashString("hearth")).toBeGreaterThanOrEqual(0);
  });

  it("separates different inputs", () => {
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});
