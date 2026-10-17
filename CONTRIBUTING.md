# Contributing to Hearth

Thanks for helping. Hearth is small enough to stay coherent and opinionated
enough to need care — this guide keeps changes reviewable.

## Ground rules

1. **Every recommendation stays grounded.** No code path may present a place
   that isn't in the current run's Qloo results. The verifier
   (`src/lib/agent/verifier.ts`) is the gate; don't route around it.
2. **No fake-live data.** Fixture/demo results must be labelled
   `source: "demo"`. Never synthesise a "live" response at read time.
3. **Secrets stay server-side.** Nothing under `NEXT_PUBLIC_`, nothing logged.

## Getting set up

Requires Node >= 22.13 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # optional; the demo runs with no keys
pnpm dev
```

## Before you open a PR

Run the same gate CI runs:

```bash
pnpm verify      # typecheck + lint + tests
pnpm build       # make sure the production build still passes
```

- Add or update tests for any behaviour change. `pnpm test` must pass.
- Keep `pnpm lint` green. We use the Next flat ESLint config
  (`eslint.config.mjs`). `react-hooks/set-state-in-effect` is intentionally off
  for mount-time browser reads (see the comment in that config).
- Write commit messages in the imperative mood (`add tariff cache`, not
  `added`). Keep them focused; one concern per commit.

## Where things live

| Area | Path |
| --- | --- |
| Agent loop (fan-out, streaming, compose, verify) | `src/lib/agent/run.ts` |
| Grounding verifier | `src/lib/agent/verifier.ts` |
| Plan builder | `src/lib/agent/planner.ts` |
| LLM client (optional) | `src/lib/agent/llm.ts` |
| Qloo client / cache / queries / fixtures | `src/lib/qloo/` |
| Env, sanitisation, rate limiting | `src/lib/security/` |
| API routes | `src/app/api/` |
| Design system + components | `src/components/` |

## Style

- TypeScript strict. Prefer explicit domain types from `src/lib/domain.ts`.
- Validate every boundary with Zod (env, request bodies, upstream responses,
  model output). Don't trust untyped JSON.
- Prefer small pure functions in `src/lib/*` — they're easier to test.
- Match the surrounding code; don't reformat unrelated files in the same PR.
- No comments unless they explain *why*, not *what*.

## Reporting bugs and requesting features

Open an issue with steps to reproduce, expected vs actual, and your environment
(Node/pnpm versions, `QLOO_MODE`). For security issues, do **not** open a public
issue — follow [SECURITY.md](./SECURITY.md).

By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).
