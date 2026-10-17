"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  bullets?: string[];
};

/**
 * Vertical timeline with a sticky week rail and an ember spine.
 * Purely structural — content is passed in from grounded plan data.
 */
export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-10", className)}>
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-[13px] top-2 w-px bg-border md:left-[15px]"
      />
      {items.map((item, i) => (
        <li key={item.id} className="relative pl-10 md:pl-12">
          <span
            aria-hidden="true"
            className="absolute left-0 top-1 grid size-7 place-items-center rounded-full border border-border-ember bg-surface text-[0.7rem] font-medium text-ember"
          >
            {i + 1}
          </span>
          <div className="sticky top-20 z-10 -mx-1 mb-3 inline-flex items-baseline gap-3 rounded-full bg-canvas/80 px-1 backdrop-blur">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
              {item.eyebrow}
            </p>
          </div>
          <h3 className="text-xl text-foreground-strong md:text-2xl">{item.title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted text-pretty">
            {item.description}
          </p>
          {item.meta && (
            <p className="mt-2 font-mono text-xs text-muted-2">{item.meta}</p>
          )}
          {item.bullets && item.bullets.length > 0 && (
            <ul className="mt-4 space-y-2">
              {item.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-ember"
                  />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
