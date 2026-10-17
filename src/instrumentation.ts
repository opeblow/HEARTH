/**
 * Runs once when the server boots. Validating the environment here means a
 * misconfigured production deploy fails immediately and loudly, instead of on
 * the first user request. Skipped during `next build`, which needs no runtime
 * dependencies.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { serverEnv } = await import("@/lib/security/env");
  serverEnv();
}
