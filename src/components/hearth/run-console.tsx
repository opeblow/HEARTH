"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MultiStepLoader, type LoaderStep } from "@/components/magicui/multi-step-loader";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { saveRun } from "@/lib/store";
import type { EntityRef, Prefs, RunResult, TraceEvent } from "@/lib/domain";

type Props = {
  anchors: EntityRef[];
  origin?: string;
  destination: string;
  prefs: Prefs;
  onError?: (message: string) => void;
  onResult?: (result: RunResult) => void;
  autoStart?: boolean;
  label?: string;
};

function stepsFromTrace(trace: TraceEvent[]): LoaderStep[] {
  return trace.map((t) => ({
    id: t.id,
    label: t.label,
    detail: t.detail,
    status: t.status,
  }));
}

export function RunConsole({
  anchors,
  origin,
  destination,
  prefs,
  onError,
  onResult,
  autoStart,
  label,
}: Props) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);
  const [trace, setTrace] = React.useState<TraceEvent[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async () => {
    setRunning(true);
    setError(null);
    setTrace([]);

    try {
      const res = await fetch(apiUrl("/api/agent"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ anchors, origin, destination, prefs }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "The agent could not start.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: RunResult | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim()) as
            | { type: "trace"; event: TraceEvent }
            | { type: "result"; result: RunResult }
            | { type: "error"; message: string };

          if (payload.type === "trace") {
            setTrace((prev) => {
              const idx = prev.findIndex((t) => t.id === payload.event.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = payload.event;
                return next;
              }
              return [...prev, payload.event];
            });
          } else if (payload.type === "result") {
            result = payload.result;
          } else if (payload.type === "error") {
            throw new Error(payload.message);
          }
        }
      }

      if (result) {
        saveRun(result);
        if (onResult) {
          onResult(result);
          setRunning(false);
        } else {
          router.push("/bridge");
        }
      } else {
        throw new Error("The agent finished without a result.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      onError?.(message);
      setRunning(false);
    }
  }, [anchors, origin, destination, prefs, router, onError, onResult]);

  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (!autoStart || startedRef.current) return;
    if (anchors.length === 0 || destination.trim().length === 0) return;
    startedRef.current = true;
    void run();
  }, [autoStart, anchors.length, destination, run]);

  return (
    <div>
      <Button
        size="lg"
        onClick={run}
        disabled={running || anchors.length === 0 || destination.trim().length === 0}
        className="w-full"
      >
        {running ? <Loader2 className="size-5 animate-spin" /> : null}
        {running ? "Working…" : (label ?? "Find my places")}
      </Button>

      {(running || trace.length > 0) && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
              Agent trace
            </span>
            <span className="font-mono text-[0.7rem] text-muted-2">
              {trace.filter((t) => t.callsTotal != null).slice(-1)[0]?.callsSucceeded ?? 0} of{" "}
              {trace.filter((t) => t.callsTotal != null).slice(-1)[0]?.callsTotal ?? 0} Qloo calls
              succeeded
            </span>
          </div>
          <MultiStepLoader steps={stepsFromTrace(trace)} />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-[var(--radius)] border border-rose/40 bg-rose/10 p-4 text-sm text-rose"
        >
          <p className="font-medium">That didn&apos;t work.</p>
          <p className="mt-1 text-rose/90">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={run}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
