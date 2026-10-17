"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Draws a curved animated beam between two elements inside a shared container.
 * Positions are measured, so it survives responsive layout changes.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  className,
  curvature = 40,
  duration = 5,
  delay = 0,
  reverse = false,
  tone = "var(--ember)",
  active = true,
  width = 2,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  className?: string;
  curvature?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  tone?: string;
  active?: boolean;
  width?: number;
}) {
  const [path, setPath] = React.useState<string>("");
  const [dims, setDims] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const id = React.useId().replace(/:/g, "");

  const update = React.useCallback(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;
    const cb = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ax = a.left - cb.left + a.width / 2;
    const ay = a.top - cb.top + a.height / 2;
    const bx = b.left - cb.left + b.width / 2;
    const by = b.top - cb.top + b.height / 2;
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2 - curvature;
    setDims({ w: cb.width, h: cb.height });
    setPath(`M ${ax},${ay} Q ${mx},${my} ${bx},${by}`);
  }, [containerRef, fromRef, toRef, curvature]);

  React.useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (fromRef.current) ro.observe(fromRef.current);
    if (toRef.current) ro.observe(toRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update, containerRef, fromRef, toRef]);

  if (!path) return null;

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      width={dims.w}
      height={dims.h}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      fill="none"
    >
      <defs>
        <linearGradient id={`beam-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={tone} stopOpacity="0" />
          <stop offset="50%" stopColor={tone} stopOpacity={active ? 1 : 0.25} />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke="var(--border-strong)"
        strokeWidth={width}
        strokeDasharray="3 6"
        strokeLinecap="round"
      />
      <path
        d={path}
        stroke={`url(#beam-${id})`}
        strokeWidth={width + 1}
        strokeLinecap="round"
      />
      {active && (
        <circle r={width + 1.5} fill={tone} className="motion-reduce:hidden">
          <animateMotion
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
            path={path}
            keyPoints={reverse ? "1;0" : "0;1"}
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
        </circle>
      )}
    </svg>
  );
}
