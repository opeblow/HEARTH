import { describe, expect, it, vi } from "vitest";

/**
 * Guards the split-hosting CORS path. A browser sending a JSON POST (or the SSE
 * agent call) preflights with OPTIONS first; if a route does not export an
 * OPTIONS handler, Next answers 204 without the allow-origin header and the
 * browser blocks the request.
 */

const ORIGIN = "https://hearth-1cq.pages.dev";

type RouteModule = { OPTIONS: (request: Request) => Response };

async function loadRoutes() {
  const [agent, search, share, health] = (await Promise.all([
    import("@/app/api/agent/route"),
    import("@/app/api/search/route"),
    import("@/app/api/share/route"),
    import("@/app/api/health/route"),
  ])) as unknown as [RouteModule, RouteModule, RouteModule, RouteModule];
  return { agent, search, share, health };
}

function preflight(origin: string | null) {
  const headers: Record<string, string> = { "access-control-request-method": "POST" };
  if (origin) headers.origin = origin;
  return new Request("http://localhost/api/search", { method: "OPTIONS", headers });
}

describe("CORS preflight", () => {
  // Importing four route modules is slow; the default 5s timeout is too tight.
  const timeout = 30_000;

  it("answers OPTIONS on every route with the allowlisted origin", async () => {
    vi.stubEnv("CORS_ALLOW_ORIGINS", ORIGIN);
    vi.resetModules();
    for (const route of Object.values(await loadRoutes())) {
      const res = route.OPTIONS(preflight(ORIGIN));
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
      expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    }
    vi.unstubAllEnvs();
  }, timeout);

  it("omits CORS headers for an origin that is not allowlisted", async () => {
    vi.stubEnv("CORS_ALLOW_ORIGINS", ORIGIN);
    vi.resetModules();
    const { agent } = await loadRoutes();
    const res = agent.OPTIONS(preflight("https://evil.example"));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    vi.unstubAllEnvs();
  }, timeout);

  it("stays same-origin only when CORS_ALLOW_ORIGINS is unset", async () => {
    vi.stubEnv("CORS_ALLOW_ORIGINS", "");
    vi.resetModules();
    const { search } = await loadRoutes();
    expect(search.OPTIONS(preflight(ORIGIN)).headers.get("access-control-allow-origin")).toBeNull();
    vi.unstubAllEnvs();
  }, timeout);
});
