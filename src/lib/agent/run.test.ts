import { describe, expect, it } from "vitest";
import { runAgent, type RunInput } from "@/lib/agent/run";
import type { AgentEvent } from "@/lib/agent/events";
import { DEFAULT_PREFS, type Bucket, type EntityRef } from "@/lib/domain";

/**
 * Integration test for the reworked agent loop. With no QLOO_API_KEY and no
 * LLM key configured, the run uses the recorded fixture engine, so these
 * assertions exercise the real control flow: fan-out, streaming, the
 * discovery post-filter, and the grounding verifier.
 */

const input: RunInput = {
  anchors: [
    { id: "a-afrobeats", name: "Afrobeats night", type: "place", tags: ["afrobeats", "music"] },
    { id: "a-coffee", name: "Third-wave coffee", type: "place", tags: ["coffee"] },
  ],
  destination: "Toronto",
  prefs: DEFAULT_PREFS,
};

async function drain(runInput: RunInput = input): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const event of runAgent(runInput)) events.push(event);
  return events;
}

function resultOf(events: AgentEvent[]) {
  const last = events.at(-1);
  if (last?.type !== "result") throw new Error("run did not produce a result");
  return last.result;
}

function idsForBucket(places: ReturnType<typeof resultOf>["places"], bucket: Bucket) {
  return places.filter((p) => p.bucket === bucket).map((p) => p.entityId);
}

describe("runAgent", () => {
  it("streams a trace and ends with a result", async () => {
    const events = await drain();
    expect(events.at(-1)?.type).toBe("result");
    expect(events.some((e) => e.type === "trace")).toBe(true);
  });

  it("runs all five domains exactly once", async () => {
    const result = resultOf(await drain());
    expect(result.callsTotal).toBe(5);
    expect(result.callsSucceeded).toBe(5);
  });

  it("emits a completed trace for every domain", async () => {
    const events = await drain();
    const doneKinds = events
      .filter((e): e is Extract<AgentEvent, { type: "trace" }> => e.type === "trace")
      .filter((e) => e.event.status === "done")
      .map((e) => e.event.kind);
    for (const kind of ["transfer", "community", "discovery", "cross-domain", "compass", "compose", "verify"]) {
      expect(doneKinds).toContain(kind);
    }
  });

  it("never repeats a comfort/community place in discovery", async () => {
    const { places } = resultOf(await drain());
    const discovery = new Set(idsForBucket(places, "discovery"));
    for (const id of [...idsForBucket(places, "comfort"), ...idsForBucket(places, "community")]) {
      expect(discovery.has(id)).toBe(false);
    }
  });

  it("labels fixture runs as demo and grounds every place", async () => {
    const result = resultOf(await drain());
    expect(result.source).toBe("demo");
    expect(result.verifierRejected).toBe(0);
    expect(result.places.length).toBeGreaterThan(0);
    expect(result.neighbourhoods.length).toBeGreaterThan(0);
  });

  it("completes without throwing when the anchor list is empty", async () => {
    const events = await drain({ ...input, anchors: [] });
    const result = resultOf(events);
    expect(result.anchors).toEqual([]);
    expect(Array.isArray(result.places)).toBe(true);
    expect(result.runId).toBeTruthy();
  });
});
