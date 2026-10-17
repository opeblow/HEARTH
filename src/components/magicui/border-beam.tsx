import * as React from "react";
import { cn } from "@/lib/utils";

/** A slow light travelling around the border of a rounded container. */
export function BorderBeam({
  children,
  className,
  duration = 8,
  tone = "var(--ember)",
  radius = "var(--radius-xl)",
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  tone?: string;
  radius?: string;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius: radius, padding: "1px" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden motion-safe:animate-spin"
        style={{
          borderRadius: radius,
          animationDuration: `${duration}s`,
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 300deg, ${tone} 340deg, transparent 360deg)`,
        }}
      />
      <div
        className="relative h-full w-full bg-surface"
        style={{ borderRadius: `calc(${radius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}
