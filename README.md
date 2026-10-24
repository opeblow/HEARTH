<p align="center">
  <img src="src/app/icon.svg" alt="Hearth" width="84" height="84" />
</p>

<h1 align="center">Hearth</h1>

<p align="center">
  <b>Rebuild your cultural home in any city.</b><br />
  A taste-transfer agent powered by the Qloo Taste Graph.
</p>

<p align="center">
  <a href="https://qloo-product.pages.dev"><b>▶ Try the live app</b></a> ·
  <a href="https://qloo-product.onrender.com/api/health">API health</a>
</p>

<p align="center">
  <a href="https://github.com/opeblow/HEARTH/actions/workflows/ci.yml"><img src="https://github.com/opeblow/HEARTH/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/opeblow/HEARTH/actions/workflows/codeql.yml"><img src="https://github.com/opeblow/HEARTH/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-e7b66a.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Node-%3E%3D22.13-5fa04b.svg" alt="Node >= 22.13" />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/pnpm-11-f69220.svg" alt="pnpm 11" />
</p>

---

<p align="center">
  <a href="https://qloo-product.pages.dev"><img src="docs/landing.jpg" alt="Hearth landing page — open the live app" width="920" /></a>
</p>

---

## Table of contents

- [Overview](#overview)
- [Why Hearth](#why-hearth)
- [Features](#features)
- [How it works](#how-it-works)
- [How we use Qloo](#how-we-use-qloo)
- [The grounding contract](#the-grounding-contract)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Performance](#performance)
- [Data & privacy](#data--privacy)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Hearth is a full-stack taste-transfer agent. You tell it the places, music, food
and films that made your old city feel like home; it finds their true equivalents
in the city you're moving to, then turns them into a 30-day soft-landing plan
grouped into **Comfort**, **Community** and **Discovery**.

It is built on the [Qloo Taste API](https://www.qloo.com) and is deliberately
obsessive about one thing: **it never invents a place.** Every recommendation is
grounded in a real Qloo entity returned by the current run, and a deterministic
verifier drops anything the model can't trace back.

One codebase ships both the product and its backend: Next.js App Router pages
for the frontend, route handlers (`/api/*`) for the agent, search, sharing and
health — deployable to any Node host in one step.

## Why Hearth

Relocation tools optimise for logistics — rent, schools, commute. None of them
answer the question that actually decides whether a move feels survivable:
*where do I go to feel like myself again?*

LLM-only answers hallucinate venues that don't exist and default to a US/EU
canon. Hearth answers with real, taste-graph-grounded places — in cities the
usual tools ignore (Lagos, Accra, Seoul, Lisbon, Berlin, Toronto) — and shows
its work at every step.

## Features

- **Taste intake** — search and resolve real anchors (a bar, an artist, a film,
  a dish, a brand) against the Qloo entity graph, then dial familiarity and
  preferences per category.
- **Cross-city transfer** — the same signal is replayed with your destination as
  the location filter across three buckets: Comfort, Community, Discovery.
- **Grounded agent run** — a streamed, typed agent loop fans out across five
  Qloo domains concurrently and emits a live trace you can watch in the UI.
- **30-day soft-landing plan** — day-by-day itinerary grouped by Comfort,
  Community and Discovery, ordered to cut travel, exportable as an `.ics`
  calendar file.
- **Taste Bridge** — a side-by-side comparison of your origin city's scene and
  its destination-city equivalents.
- **Blend** — merge two people's taste profiles into one shared plan (roommates,
  couples, friends moving together).
- **Share cards** — publish an anonymous, revocable result card at `/s/[id]`
  with a one-time delete token. No account, ever.
- **Honest sourcing** — every result is labelled `live`, `cached` or `demo`, so
  users always know whether they're seeing real Qloo data or the recorded
  development fixtures.
- **Privacy by design** — profiles live in your browser's `localStorage`;
  nothing about you is stored server-side.
- **Strict security posture** — CSP, HSTS, COOP/CORP, locked-down
  `Permissions-Policy`, per-IP rate limiting and daily API budgets.

## How it works

1. **Intake** — your anchors are resolved to real Qloo entities: a bar, an
   artist, a film, a dish, a brand.
2. **Transfer** — the same signal is replayed with your destination as the
   location filter, across three buckets:
   - **Comfort** — places that feel like the ones you left behind.
   - **Community** — where people who share your taste already gather.
   - **Discovery** — adjacent, fresh picks, with your comfort results excluded.
3. **Verify** — every candidate is checked against this run's Qloo results.
   Ungrounded items are dropped and counted.
4. **Compose** — a 30-day plan is assembled and ordered to cut travel.

The whole loop streams back to the browser as a typed SSE trace, so you watch it
resolve anchors, fan out across the taste graph, rank neighbourhoods and write
the plan — in real time, not after a spinner.

## How we use Qloo

Hearth talks to the [Qloo Taste API](https://www.qloo.com) through a single
server-only choke point (`src/lib/qloo/client.ts`). The browser never sees the
Qloo key and never calls Qloo directly.

### Endpoints used

| Qloo endpoint | Purpose in Hearth |
| --- | --- |
| `GET /v2/search` | Resolve free-text anchors ("Dishoom", "Fela Kuti", "In the Mood for Love") to canonical entity ids. Also powers the live anchor search box and the health probe. |
| `POST /v2/insights` | The core transfer primitive. Given anchor entity ids + a destination location filter, Qloo returns ranked entities with affinity scores — this powers the Comfort, Community and Discovery buckets, the cross-domain artist/movie/brand sweep, and neighbourhood grounding. |

### The signal model

- **Anchors are entities, not strings.** Free text is resolved via `/search` to
  Qloo entity ids (`urn:entity:…`). Every downstream call passes those ids as
  the `signal.interests.entities` payload — taste in, taste out.
- **Destination as a filter, not a query.** Each `/insights` call sets
  `filter.location.query` to the destination city, so the graph answers "what
  matches this taste *there*", never a generic global list.
- **Three buckets, one wave.** Comfort, Community and Discovery are three
  `/insights` calls with different signal shaping (anchor-anchored,
  affinity-weighted, and exclusion-filtered respectively). All five domains of
  a run — the three buckets plus cross-domain and neighbourhoods — fan out
  **concurrently**; discovery's "don't repeat comfort/community" rule is applied
  as a local post-filter, not a second serial round trip.
- **Cross-domain sweep.** A parallel fan-out across `artist`, `movie` and
  `brand` types surfaces adjacent culture (the film soundtracks, the brands your
  anchors' audience also loves) filtered to the destination.
- **Real neighbourhoods only.** Neighbourhood rankings are grouped from the
  genuine `properties.neighborhood` values Qloo returns for grounded places —
  no hardcoded district lists, ever.
- **Affinity is legible.** Qloo's affinity scores are normalised to `0..1` and
  surfaced in the UI, so users can see *why* a place ranked.

### Reliability engineering around the API

| Concern | Implementation |
| --- | --- |
| **Validation** | Every Qloo response is parsed with Zod schemas (`src/lib/qloo/schemas.ts`) before it touches app code. A malformed upstream payload fails the domain, never the process. |
| **Timeouts** | Per-request `AbortController` deadline (`QLOO_TIMEOUT_MS`, default 6500 ms). |
| **Retries** | Up to 4 attempts with jittered exponential backoff on 5xx and network errors; `Retry-After` is honoured on 429s. |
| **Caching** | Every response cached 24 h by kind (`search`, `insights`, `cross`, `hoods`) in Upstash Redis (production) or an in-process store (development). Cache hits are labelled `source: "cached"`. |
| **Coalescing** | Concurrent identical requests share one network round trip via an in-flight map — the agent's fan-out can't stampede the same query. |
| **Budgets** | Hard daily caps on Qloo calls (`DAILY_QLOO_BUDGET`) and LLM calls (`DAILY_LLM_BUDGET`), enforced in Redis so they survive deploys. |
| **Health** | `GET /api/health` runs a tiny, short-cached liveness probe (`/search?query=coffee&take=1`) so uptime monitors don't burn budget. |
| **Honest fallback** | With no `QLOO_API_KEY`, a recorded fixture engine serves deterministic demo data labelled `source: "demo"` in the UI. Production boot **refuses** to run in fixture mode. |

## The grounding contract

- The LLM writes *reasons* and the *plan narrative*. It never invents a venue.
- The model may only reference entity ids that appear in the current run's Qloo
  responses. A deterministic verifier (`src/lib/agent/verifier.ts`) enforces
  this; rejected items are counted and surfaced on `/proof`, never shown.
- If no LLM key is configured, Hearth falls back to the deterministic composer —
  the product still works end to end, fully grounded.
- If no Qloo key is configured, Hearth serves a **recorded fixture engine** and
  labels every result `source: "demo"`. It is honest about it, never fake-live.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict), Zod at every boundary |
| Styling | Tailwind CSS v4, token-driven warm-cinematic design system |
| Motion | `motion`, custom Aceternity/MagicUI primitives |
| Data | Qloo Taste API; optional Upstash Redis (cache, rate limits, budgets, share cards) |
| LLM | Any OpenAI-compatible chat-completions endpoint (optional) |
| Testing | Vitest + Testing Library (jsdom) |
| CI | GitHub Actions (typecheck, lint, test, build × Node 22/24) + CodeQL |
| Package manager | pnpm 11 |

## Quick start

Requires **Node >= 22.13** and **pnpm 11**.

```bash
git clone https://github.com/opeblow/HEARTH.git
cd HEARTH
pnpm install
cp .env.example .env.local   # optional: add keys, or just run the demo
pnpm dev
```

Open http://localhost:3000. With no keys, Hearth runs entirely on the fixture
engine — every page works, zero setup.

To run live, set `QLOO_API_KEY` (and optionally an LLM key) in `.env.local`.

## Environment variables

All variables are **server-side only** (see `.env.example`). The Qloo and LLM
keys are never prefixed `NEXT_PUBLIC_` and never reach the browser. Blank values
are treated as unset, so hosts that inject empty vars are safe.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://hearth.app` | Public site URL for metadata / Open Graph. |
| `QLOO_API_KEY` | — | Qloo Taste API key. Absent → fixtures mode. |
| `QLOO_BASE_URL` | `https://hackathon.api.qloo.com/v2` | Qloo API base URL. |
| `QLOO_MODE` | `auto` | `auto` \| `live` \| `fixtures`. `auto` = live when a key exists. |
| `QLOO_TIMEOUT_MS` | `6500` | Per-request Qloo timeout. Lower = snappier, riskier. |
| `LLM_API_KEY` | — | Any OpenAI-compatible key. Absent → deterministic composer. |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible base URL. |
| `LLM_MODEL` | `gpt-4o-mini` | Model used for the plan narrative. |
| `UPSTASH_REDIS_REST_URL` | — | Optional. Unset → in-process cache + limiter. |
| `UPSTASH_REDIS_REST_TOKEN` | — | Optional Upstash token. |
| `RATE_LIMIT_PER_MINUTE` | `12` | Per-IP request budget. |
| `DAILY_QLOO_BUDGET` | `4000` | Hard stop for Qloo calls per day. |
| `DAILY_LLM_BUDGET` | `2000` | Hard stop for LLM calls per day. |

**Production boot is strict** (`src/lib/security/env.ts`): the app refuses to
start in `NODE_ENV=production` unless `QLOO_API_KEY` and both Upstash variables
are set, and it throws if `QLOO_MODE=fixtures` is requested. Mock data can never
be served to production users.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack). |
| `pnpm build` | Production build. |
| `pnpm start` | Serve the production build. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm lint` | ESLint (flat config). |
| `pnpm test` | Vitest, single run. |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm verify` | Type check + lint + tests — the same gate CI runs. |

## Project structure

```
HEARTH/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     CI: typecheck, lint, test, build (Node 22 + 24)
│   │   └── codeql.yml                 CodeQL security scanning
│   ├── dependabot.yml                 Dependency update automation
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── landing.jpg                    Landing page screenshot
├── src/
│   ├── app/                           Next.js App Router
│   │   ├── layout.tsx                 Root layout: fonts, theme, nav
│   │   ├── page.tsx                   Landing page
│   │   ├── icon.svg                   Favicon (served automatically by Next.js)
│   │   ├── globals.css                Design tokens and global styles
│   │   ├── error.tsx                  Client error boundary
│   │   ├── not-found.tsx              Custom 404
│   │   ├── start/                     Intake: anchors + preferences
│   │   ├── bridge/                    The taste transfer (streamed run)
│   │   ├── plan/                      30-day soft-landing plan
│   │   ├── blend/                     Blend two people's taste
│   │   ├── proof/                     Hearth vs an LLM-only baseline
│   │   ├── privacy/                   What stays on your device
│   │   ├── s/[id]/                    Shared result card
│   │   └── api/
│   │       ├── agent/route.ts         POST: SSE agent run (+ route.test.ts)
│   │       ├── search/route.ts        GET: anchor search
│   │       ├── share/route.ts         Create / read / revoke share cards
│   │       └── health/route.ts        GET: config + readiness report
│   ├── components/
│   │   ├── hearth/                    Product components (nav, cards, console, ...)
│   │   ├── aceternity/                Motion/layout primitives (bento, spotlight, ...)
│   │   ├── magicui/                   Animation primitives (marquee, beams, ...)
│   │   └── ui/                        Design-system primitives (button, dialog, ...)
│   ├── lib/
│   │   ├── agent/                     run loop, verifier, planner, prompts, llm, events
│   │   ├── qloo/                      client, cache, queries, schemas, fixtures, engine
│   │   ├── security/                  env validation, sanitize, ratelimit
│   │   ├── domain.ts                  Core domain types
│   │   ├── share.ts                   Share-card data helpers
│   │   ├── ics.ts                     ICS calendar generation
│   │   ├── personas.ts                Taste persona presets
│   │   ├── store.ts                   Client preference store
│   │   └── utils.ts                   Shared utilities
│   ├── instrumentation.ts             Server instrumentation hook
│   └── test/stubs/server-only.ts      Test stub for the server-only marker
├── .env.example                       Environment variable documentation
├── .gitignore                         Ignores secrets, node_modules, production/
├── .nvmrc                             Pinned Node version
├── next.config.ts                     Security headers (CSP/HSTS) + build config
├── package.json                       Scripts and dependencies
├── pnpm-lock.yaml                     Locked dependency tree
├── pnpm-workspace.yaml                pnpm workspace/build configuration
├── postcss.config.mjs                 Tailwind CSS via PostCSS
├── tsconfig.json                      Strict TypeScript config
├── vitest.config.ts                   Vitest test environment
├── eslint.config.mjs                  ESLint flat config
├── README.md  SECURITY.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md  LICENSE
```

## API reference

All mutating routes are rate-limited per IP (`RATE_LIMIT_PER_MINUTE`) and
guarded by daily budgets. Requests are Zod-validated and shape-checked before
any upstream call. Obvious prompt-injection payloads in search queries are
refused and never echoed.

### `POST /api/agent`

Runs the agent. Responds with `text/event-stream` of typed trace events,
ending in a `result` event.

```bash
curl -N -X POST https://your-host/api/agent \
  -H "content-type: application/json" \
  -d '{
    "anchors": [{ "id": "urn:entity:...", "name": "Dishoom", "type": "place" }],
    "origin": "London",
    "destination": "Lisbon",
    "prefs": { "food": true, "music": true, "nightlife": true, "film": true }
  }'
```

Event kinds stream in run order: `run.started` → `anchor.resolved` (per anchor)
→ `domain.started` / `domain.settled` (comfort, community, discovery, cross,
hoods — as each lands) → `verified` (grounding results, including dropped
counts) → `plan.composed` → `result`.

### `GET /api/search?q=`

Resolves an anchor query to Qloo entities (max 6, cached 24 h).

```bash
curl "https://your-host/api/search?q=Fela%20Kuti"
```

### `/api/share`

| Method | Body | Returns |
| --- | --- | --- |
| `POST` | `{ title, destination, picks[] }` (1–8 picks) | `{ id, deleteToken, url }` — `deleteToken` is shown once; it is the only way to revoke. |
| `GET ?id=` | — | The public card payload (`no-store`, `noindex`). |
| `DELETE` | `{ id, deleteToken }` | `{ deleted: true }` or `403`. |

### `GET /api/health`

Dependency status without leaking secrets:

```json
{
  "status": "ok",
  "qloo": { "mode": "live", "reachable": true, "status": 200 },
  "llm": { "configured": true },
  "redis": { "configured": true, "healthy": true },
  "time": "2026-10-17T12:00:00.000Z"
}
```

`status` is `degraded` when Qloo is unreachable or a configured Redis fails.

## Performance

Hearth is built to feel instant, and the agent pipeline is engineered for it:

- **One wave, not five.** The five Qloo domains (comfort, community, discovery,
  cross-domain, neighbourhoods) are independent. They all fan out **concurrently**
  and each result streams to the UI the instant it lands, instead of blocking on
  the slowest call. (`src/lib/agent/run.ts`)
- **No serial exclusion round trip.** Discovery is post-filtered locally against
  comfort/community ids rather than paying a second sequential query — same
  guarantee, one fewer round trip.
- **In-flight coalescing.** Concurrent identical Qloo requests share a single
  network call (`src/lib/qloo/client.ts`).
- **Two-layer cache.** Every Qloo response is cached (24h) in Upstash Redis when
  configured, or an in-process store otherwise. Cache hits return `source: "cached"`.
- **Bounded latency.** Configurable per-request timeout (`QLOO_TIMEOUT_MS`) and
  capped retries with jittered backoff, so a slow upstream degrades instead of hanging.
- **Streamed over SSE.** The client renders trace events as they arrive; time to
  first meaningful paint is not gated on the full run.
- **Tree-shaken imports.** `optimizePackageImports` trims icon/motion/util barrels
  for smaller client bundles.
- **Static where possible.** Marketing and content pages prerender as static;
  only the agent, share, search and health routes are dynamic.

## Data & privacy

- Profiles, anchors and preferences live in the browser's `localStorage` —
  there is no user table and no personal data store.
- Share cards contain only the curated picks the user chose to publish, are
  unindexed (`X-Robots-Tag: noindex`), and are revocable at any time with the
  one-time delete token.
- Server logs never include API keys or request bodies; errors detail
  server-side only and are never echoed to clients.
- The `/privacy` page explains all of this to end users in plain language.

## Testing

```bash
pnpm test        # 45 tests across agent, qloo, security, API and utils
pnpm verify      # typecheck + lint + tests (what CI enforces)
```

Coverage includes the agent control flow (fan-out, discovery post-filter,
grounding), the streaming `/api/agent` route, the verifier, query builders, the
fixture engine, and input sanitisation. The `server-only` marker is stubbed for
tests via `vitest.config.ts` so server modules can be imported directly.

CI runs the full gate on Node 22 and 24, then performs a production build in
fixture mode — the build must succeed with zero secrets.

## Deployment

Any Node host works (Vercel, Fly.io, Render, Railway, a container). Frontend
and backend ship together from this one repo.

### Vercel (recommended)

1. Import the GitHub repo — Vercel auto-detects Next.js.
2. Set the environment variables from the table above (Production + Preview).
3. Deploy. Verify with `GET /api/health`.

### Any Node host

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start       # serves on PORT (default 3000)
```

### Production checklist

- [ ] `QLOO_API_KEY` set (live key)
- [ ] `QLOO_MODE=live` (fixtures are refused at boot anyway)
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (cache, rate
      limits, daily budgets and share cards all live here)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the canonical public URL (drives OG/meta)
- [ ] Optional: `LLM_API_KEY` + `LLM_MODEL` for narrative planning
- [ ] `GET /api/health` returns `"status": "ok"` after deploy
- [ ] Rate-limit and budget values sized for your traffic

## Security

See [SECURITY.md](./SECURITY.md). Highlights:

| Control | Detail |
| --- | --- |
| Content-Security-Policy | Locked to `'self'`; no third-party script/style origins. |
| HSTS | 2 years, `includeSubDomains`, `preload`. |
| Frame protection | `frame-ancestors 'none'` + `X-Frame-Options: DENY`. |
| MIME sniffing | `X-Content-Type-Options: nosniff`. |
| Referrer | `strict-origin-when-cross-origin`. |
| COOP / CORP | `same-origin` for both. |
| Permissions-Policy | Camera, microphone, geolocation, payment, sensors all denied. |
| API hygiene | `no-store` + `noindex` on all `/api/*`; per-IP rate limits; daily budgets. |
| Input handling | Zod validation at every boundary; prompt-injection payloads refused. |
| Secrets | Server-only, validated at boot, never `NEXT_PUBLIC_`, never logged. |

## Accessibility

- Skip-to-content link, semantic landmarks (`header`/`main`/`footer`/`nav`).
- All interactive controls are keyboard-operable with visible focus states.
- The mobile menu dialog is an accessible dialog (`aria-expanded`,
  `aria-label`, focus-managed).
- Theme respects `prefers-color-scheme`; motion respects
  `prefers-reduced-motion`.
- Colour pairs meet WCAG AA contrast in both themes.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| CI fails at `pnpm store path` | Ensure `pnpm-workspace.yaml` declares `packages: ["."]` and CI uses pnpm 11. |
| `Production requires: QLOO_API_KEY` at boot | Set the Qloo + Upstash env vars on the host — this is the strict production guard working as intended. |
| Everything shows `demo` labels | No `QLOO_API_KEY` is visible to the server; check the host's env (not `.env.local`) and `QLOO_MODE`. |
| 429s from the API | Per-IP limit or daily budget hit; raise `RATE_LIMIT_PER_MINUTE` / `DAILY_QLOO_BUDGET` or wait for the window to reset. |
| Slow first run | Cold Upstash + empty cache; subsequent identical runs hit the 24 h cache. |

## Roadmap

- [ ] PWA install + offline intake
- [ ] Multi-city itineraries ("two weeks in Lisbon, then Berlin")
- [ ] Email delivery of the 30-day plan
- [ ] Public share-card images (OG image generation)
- [ ] Community taste blends (share a blend link with friends)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). The short version: run `pnpm verify`
before opening a PR, and keep every recommendation grounded.

## License

[MIT](./LICENSE) © Hearth contributors.
