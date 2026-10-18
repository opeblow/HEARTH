/**
 * CORS for split hosting (separate frontend origin calling this API).
 * Allowlist comes from CORS_ALLOW_ORIGINS (comma-separated origins, e.g.
 * "https://abc.pages.dev"). Unset = same-origin only, no CORS headers.
 */
const ALLOWED = (process.env.CORS_ALLOW_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const normalised = origin.trim().replace(/\/+$/, "");
  return ALLOWED.includes(normalised);
}

function corsHeadersFor(origin: string | null): Record<string, string> {
  if (!isOriginAllowed(origin)) return {};
  return {
    "access-control-allow-origin": origin as string,
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

/** Answers a CORS preflight. Returns null when the request is not a preflight. */
export function handleOptions(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  const origin = request.headers.get("origin");
  const base = { status: 204, headers: corsHeadersFor(origin) };
  if (!isOriginAllowed(origin)) {
    return new Response(null, { status: 204 });
  }
  return new Response(null, base);
}

/** Adds CORS headers to a route response when the origin is allowlisted. */
export function withCors<T extends Response>(response: T, request: Request): T {
  const headers = corsHeadersFor(request.headers.get("origin"));
  for (const [key, value] of Object.entries(headers)) {
    if (key === "vary" && response.headers.has("vary")) continue;
    response.headers.set(key, value);
  }
  return response;
}
