"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A single, low-contrast ember spotlight that follows the pointer.
 * One signature atmosphere effect for the landing hero — nothing else competes.
 */
export function Spotlight({
  className,
  children,
  intensity = 0.16,
}: {
  className?: string;
  children?: React.ReactNode;
  intensity?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  const onMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    },
    [reduced],
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Resting ember light — always present so the page never looks empty.
          Sized down on phones so it can never create horizontal scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12%] h-[18rem] w-[18rem] -translate-x-1/2 opacity-70 sm:h-[36rem] sm:w-[36rem]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--ember) 40%, transparent), transparent 72%)",
          filter: "blur(40px)",
        }}
      />
      {pos && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, color-mix(in oklab, var(--ember) ${Math.round(
              intensity * 100,
            )}%, transparent), transparent 65%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
