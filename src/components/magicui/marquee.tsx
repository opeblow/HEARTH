"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Infinite horizontal marquee. Pauses on hover; static under reduced-motion. */
export function Marquee({
  children,
  className,
  duration = 42,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="flex shrink-0 motion-safe:animate-marquee-x group-hover:[animation-play-state:paused]"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {children}
        {children}
      </div>
    </div>
  );
}
