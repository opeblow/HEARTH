import type { RunResult, TraceEvent } from "@/lib/domain";

export type AgentEvent =
  | { type: "trace"; event: TraceEvent }
  | { type: "result"; result: RunResult }
  | { type: "error"; message: string };

let counter = 0;
export function traceId(prefix = "t"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function trace(
  kind: TraceEvent["kind"],
  label: string,
  extra: Partial<TraceEvent> = {},
): TraceEvent {
  return {
    id: traceId(kind),
    kind,
    label,
    status: "active",
    ...extra,
  };
}

export function encodeSse(event: AgentEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
