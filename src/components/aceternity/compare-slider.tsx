"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Draggable before/after comparison. Keyboard accessible via a range input.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "LLM only",
  afterLabel = "Hearth",
  className,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const [pos, setPos] = React.useState(52);

  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <div className="relative">
          {after}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            aria-hidden="true"
          >
            {before}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-ember"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border-ember bg-canvas text-ember shadow-[var(--glow-ember)]">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-canvas/85 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-muted backdrop-blur">
          {beforeLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-ember/90 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-ember-ink">
          {afterLabel}
        </span>
      </div>
      <label className="sr-only" htmlFor="compare-slider">
        Reveal the Hearth answer versus the LLM-only answer
      </label>
      <input
        id="compare-slider"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="mt-4 h-1.5 w-full cursor-ew-resize appearance-none rounded-full bg-surface-3 accent-[var(--ember)]"
      />
    </div>
  );
}
