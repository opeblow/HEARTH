# Hearth

**Rebuild your cultural home in any city.**

Hearth is a taste-transfer agent. You tell it the places, music, food and films
that made your old city feel like home; it finds their equivalents in the city
you're moving to, then turns them into a 30-day soft-landing plan grouped into
**Comfort**, **Community** and **Discovery**.

It is built on the [Qloo Taste API](https://www.qloo.com), and it is deliberately
obsessive about one thing: **it never invents a place.** Every recommendation is
grounded in a real Qloo entity returned by the current run, and a deterministic
verifier drops anything the model can't trace back.

[![CI](https://github.com/OWNER/hearth/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![CodeQL](https://github.com/OWNER/hearth/actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-e7b66a.svg)](./LICENSE)

---

## Contents

- [Why Hearth](#why-hearth)
- [How it works](#how-it-works)
- [The grounding contract](#the-grounding-contract)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Performance](#performance)
- [Architecture](#architecture)
- [API](#api)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Why Hearth

Relocation tools optimise for logistics — rent, schools, commute. None of them
answer the question that actually decides whether a move feels survivable:
*where do I go to feel like myself again?* LLM-only answers hallucinate venues
that don't exist and default to a US/EU canon. Hearth answers with real,
taste-graph-grounded places, in cities the usual tools ignore (Lagos, Accra,
Seoul, Lisbon, Berlin, Toronto), and shows its work.

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

The whole loop streams back to the browser as a typed trace, so you watch it
resolve anchors, fan out across the taste graph, rank neighbourhoods and write
the plan.

## The grounding contract

- The LLM writes *reasons* and the *plan narrative*. It never invents a venue.
- The model may only reference entity ids that appear in the current run's Qloo
  responses. A deterministic verifier (`src/lib/agent/verifier.ts`) enforces
  this; rejected items are counted and surfaced on `/proof`, never shown.
- If no LLM key is configured, Hearth falls back to the deterministic composer —
  the product still works end to end, fully grounded.
- If no Qloo key is configured, Hearth serves a **recorded fixture engine** and
  labels every result `source: "demo"` in the UI. It is honest about it, never
  fake-live.

## Quick start

Requires **Node >= 20.11** and **pnpm**.

```bash
pnpm install
cp .env.example .env.local   # optional: add keys, or just run the demo
pnpm dev
```

Open http://localhost:3000. With no keys, Hearth runs entirely on the fixture
engine — every page works, no setup.

To run live, set `QLOO_API_KEY` (and optionally an LLM key) in `.env.local`.

## Environment variables

All variables are **server-side only** (see `.env.example`). The Qloo and LLM
keys are never prefixed `NEXT_PUBLIC_` and never reach the browser.

| Variable | Default | Purpose |
| --- | --- | --- |
| `QLOO_API_KEY` | — | Qloo Taste API key. Absent → fixtures mode. |
| `QLOO_BASE_URL` | `https://api.qloo.com/v2` | Qloo API base URL. |
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

## Architecture

```
src/
  app/                     Next.js App Router
    page.tsx               Landing
    start/                 Intake: anchors + preferences
    bridge/                The taste transfer itself (streamed run)
    plan/                  30-day soft-landing plan
    blend/                 Blend two people's taste
    proof/                 Hearth vs an LLM-only baseline
    privacy/               What stays on your device
    s/[id]/                Shared result card
    api/                   agent (SSE), search, share, health
  components/
    hearth/                Product components
    aceternity/ magicui/   Motion/layout primitives
    ui/                    Design-system primitives
  lib/
    agent/                 run loop, verifier, planner, prompts, llm, events
    qloo/                  client, cache, queries, schemas, fixtures, engine
    security/              env, sanitize, ratelimit
    domain.ts shared.ts ics.ts store.ts utils.ts
```

- **Framework:** Next.js 16 (App Router, React 19, Turbopack).
- **Styling:** Tailwind CSS v4 with a token-driven warm-cinematic design system.
- **Data:** Qloo Taste API; optional Upstash Redis for cache/limits/budgets.
- **Validation:** Zod at every boundary (env, request bodies, upstream responses, LLM output).

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/agent` | Runs the agent; responds with a `text/event-stream` of typed trace events ending in a `result`. |
| `GET` | `/api/search?q=` | Resolves an anchor query to Qloo entities. |
| `POST`/`GET`/`DELETE` | `/api/share` | Create / read / revoke a shareable result card. |
| `GET` | `/api/health` | Reports Qloo mode, LLM and Redis configuration. |

All mutating routes are rate-limited per IP and guarded by daily budgets.
Requests are validated and shape-checked before any upstream call. Obvious
prompt-injection payloads in search queries are refused and never echoed.

## Testing

```bash
pnpm test        # 45 tests across agent, qloo, security, API and utils
pnpm verify      # typecheck + lint + tests (what CI enforces)
```

Coverage includes the agent control flow (fan-out, discovery post-filter,
grounding), the streaming `/api/agent` route, the verifier, query builders, the
fixture engine, and input sanitisation. The `server-only` marker is stubbed for
tests via `vitest.config.ts` so server modules can be imported directly.

## Deployment

Any Node host works (Vercel, Fly, a container). Steps:

1. Set the environment variables from the table above; never commit secrets.
2. Build and start: `pnpm build && pnpm start`.
3. For production, set `QLOO_MODE=live` with a real `QLOO_API_KEY` so the app
   never serves fixtures to users.

The `next.config.ts` ships a strict Content-Security-Policy and hardening headers
(HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, COOP/CORP,
and a locked-down `Permissions-Policy`).

## Security

See [SECURITY.md](./SECURITY.md). Secrets are server-only; the app has no
database of personal data — profiles stay in the browser's `localStorage`.
Please report vulnerabilities privately rather than via public issues.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). The short version: run `pnpm verify`
before opening a PR, and keep every recommendation grounded.

## License

[MIT](./LICENSE) © Hearth contributors.
