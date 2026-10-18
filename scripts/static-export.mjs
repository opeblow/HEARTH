/**
 * Static-export build for split hosting (Cloudflare Pages frontend, API on a
 * Node host such as Render). Next.js cannot export dynamic route handlers or
 * server-rendered dynamic pages, so the server-only routes are temporarily
 * moved out of the app directory for the duration of the build and restored
 * afterwards. Requires:
 *   STATIC_EXPORT=1 NEXT_PUBLIC_API_BASE_URL=https://your-api-host pnpm build:static
 *
 * On the CDN, /s/:id is rewritten to the client /card page (public/_redirects)
 * and /api/* is never called locally — it points at NEXT_PUBLIC_API_BASE_URL.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// Server-only routes: API handlers + the server-rendered share page.
const serverDirs = ["src/app/api", "src/app/s"];
// Inside node_modules so tsc and the Next router both ignore the stash.
const stashRoot = path.join(root, "node_modules", ".hearth-server-stash");

const moved = [];
for (const rel of serverDirs) {
  const from = path.join(root, rel);
  const to = path.join(stashRoot, rel);
  if (!existsSync(from)) continue;
  mkdirSync(path.dirname(to), { recursive: true });
  rmSync(to, { recursive: true, force: true });
  renameSync(from, to);
  moved.push([from, to]);
}

// Generated type shims from previous dev/build runs still point at the routes
// we just moved aside; drop them so they are regenerated cleanly.
for (const stale of [".next/dev", ".next/types", "out"]) {
  rmSync(path.join(root, stale), { recursive: true, force: true });
}

let exitCode = 1;
try {
  const result = spawnSync("next build", { stdio: "inherit", env: process.env, shell: true });
  if (result.error) console.error("[static-export]", result.error.message);
  exitCode = result.status ?? 1;
} finally {
  for (const [from, to] of moved) {
    if (existsSync(to) && !existsSync(from)) renameSync(to, from);
  }
  rmSync(stashRoot, { recursive: true, force: true });
}

process.exit(exitCode);
