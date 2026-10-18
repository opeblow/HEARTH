/**
 * Client-side API base. Same-origin by default (single-deploy). For split
 * hosting (e.g. Cloudflare Pages frontend + Render backend) set
 * NEXT_PUBLIC_API_BASE_URL at build time to the backend's public URL.
 */
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
