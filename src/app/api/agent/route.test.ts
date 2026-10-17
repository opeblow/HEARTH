import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/agent/route";

/**
 * Exercises the SSE endpoint end to end in-process: validation, streaming, and
 * the terminal result event. With no keys configured this runs on the fixture
 * engine, so the assertions are deterministic and need no network.
 */

const payload = {
  anchors: [
    { id: "a-1", name: "Afrobeats night", type: "place", tags: ["afrobeats", "music"] },
    { id: "a-2", name: "Third-wave coffee", type: "place", tags: ["coffee"] },
  ],
  origin: "Lagos",
  destination: "Toronto",
  prefs: {
    familiarity: 0.4,
    vibe: "balanced",
    budget: "mid",
    dietary: [],
    accessibility: [],
    who: "solo",
  },
};

function request(body: unknown) {
  return new Request("http://localhost/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(body),
  });
}

async function readEvents(res: Response): Promise<Array<{ type: string; [k: string]: unknown }>> {
  const text = await res.text();
  return text
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => JSON.parse(line.slice(5).trim()));
}

describe("POST /api/agent", () => {
  it("streams trace events and ends with a result", async () => {
    const res = await POST(request(payload));
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const events = await readEvents(res);
    expect(events.at(-1)?.type).toBe("result");
    expect(events.filter((e) => e.type === "trace").length).toBeGreaterThan(5);
  });

  it("returns 400 for a malformed body", async () => {
    const res = await POST(request({ nope: true }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when there are no anchors", async () => {
    const res = await POST(request({ ...payload, anchors: [] }));
    expect(res.status).toBe(400);
  });
});
