# Security Policy

Hearth is a small, server-rendered app that talks to the Qloo Taste API and an
optional LLM provider. We take the security of its users and their data
seriously. Thank you for helping keep it safe.

## Supported versions

Hearth is pre-1.0. Only the latest `main` is supported with security fixes.

| Version | Supported |
| --- | --- |
| `main` (latest) | Yes |
| Older tags | No |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately using either channel:

- GitHub's [private vulnerability reporting](../../security/advisories/new)
  (preferred), or
- Email **security@example.com** with the subject `Hearth security`.

Include as much as you can:

- A description of the issue and its impact.
- Steps to reproduce (or a proof of concept).
- Affected route, file, or dependency.
- Your environment and `QLOO_MODE`.

We aim to acknowledge within **3 business days** and to provide a remediation
timeline within **10 business days**. Please give us a reasonable window to fix
the issue before any public disclosure; we're happy to credit you in the
advisory unless you prefer otherwise.

## Our security model

What Hearth does to protect users (and what changed here is reviewable):

- **Secrets are server-only.** `QLOO_API_KEY`, `LLM_API_KEY`, and Redis
  credentials are read exclusively via `src/lib/security/env.ts` in server
  contexts. They are never prefixed `NEXT_PUBLIC_` and never sent to the client.
- **No personal data store.** Hearth has no user database. Your profile lives in
  the browser's `localStorage`. Shared result cards live in the cache with a TTL
  and can be revoked via `DELETE /api/share`.
- **Validated boundaries.** Environment, request bodies, upstream Qloo responses,
  and LLM output are all parsed with Zod. Model output cannot introduce entity
  ids that weren't in the run (the verifier drops them).
- **Abuse controls.** Per-IP rate limiting on mutating routes and daily spend
  budgets for Qloo and LLM calls.
- **Hardened responses.** Strict Content-Security-Policy plus HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, COOP/CORP, and a
  restrictive `Permissions-Policy`, configured in `next.config.ts`.
- **Prompt-injection handling.** Search input that looks like an injection
  attempt is refused and truncated rather than echoed into prompts.
- **Automated scanning.** CodeQL (`security-and-quality`) runs on every push and
  PR and weekly; Dependabot tracks dependency and action updates.

## Scope

In scope: the application code in this repository and its configuration.

Out of scope: vulnerabilities in third-party services (report those to Qloo, your
LLM provider, or Upstash directly) and issues that require a compromised host or
device.

## Safe harbor

We will not pursue legal action against researchers who act in good faith,
avoid privacy violations and service disruption, and disclose responsibly.
