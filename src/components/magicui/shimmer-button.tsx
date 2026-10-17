"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Primary CTA. A solid ember pill with a slow light sweep.
 * Used only for the single primary action on a screen.
 */
export function ShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-full bg-ember px-7 text-[0.95rem] font-medium text-ember-ink shadow-[var(--glow-ember)] transition-transform duration-200 ease-[var(--ease-out-quint)] hover:scale-[1.015] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-5",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 motion-safe:animate-shimmer-slide"
        style={{ "--shimmer-duration": "3.4s" } as React.CSSProperties}
      >
        <span className="absolute inset-y-0 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />
      </span>
    </button>
  );
}
