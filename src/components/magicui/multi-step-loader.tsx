import * as React from "react";
import { cn } from "@/lib/utils";

export type LoaderStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
  detail?: string;
};

/**
 * Bound to real streamed trace events — never a fake timer.
 */
export function MultiStepLoader({
  steps,
  className,
}: {
  steps: LoaderStep[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-1", className)} aria-live="polite">
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 transition-colors",
            step.status === "active" && "bg-surface-2",
          )}
        >
          <StepIcon status={step.status} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm",
                step.status === "pending" ? "text-muted-2" : "text-foreground",
              )}
            >
              {step.label}
            </p>
            {step.detail && (
              <p className="truncate font-mono text-[0.7rem] text-muted-2">
                {step.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepIcon({ status }: { status: LoaderStep["status"] }) {
  if (status === "done") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
        <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
          <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose/15 text-rose">
        <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
          <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="grid size-5 shrink-0 place-items-center" aria-hidden="true">
        <span className="size-3.5 animate-spin rounded-full border-2 border-ember border-t-transparent" />
      </span>
    );
  }
  return (
    <span className="grid size-5 shrink-0 place-items-center" aria-hidden="true">
      <span className="size-1.5 rounded-full bg-muted-3" />
    </span>
  );
}
