"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type MapPoint = { name: string; lat: number; lon: number };

const W = 1000;
const H = 500;

function project(lat: number, lon: number) {
  return {
    x: ((lon + 180) / 360) * W,
    y: ((90 - lat) / 180) * H,
  };
}

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const cx = (a.x + b.x) / 2;
  const cy = Math.min(a.y, b.y) - dist * 0.38;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

/**
 * A cartographic hero visual: a graticule globe with plotted cities and an
 * animated ember arc travelling from an origin to a destination. Built from
 * real coordinates, drawn honestly as a graticule rather than fake coastlines.
 */
export function WorldMap({
  from,
  to,
  extras = [],
  className,
  label = true,
}: {
  from: MapPoint;
  to: MapPoint;
  extras?: MapPoint[];
  className?: string;
  label?: boolean;
}) {
  const a = project(from.lat, from.lon);
  const b = project(to.lat, to.lon);
  const path = React.useMemo(() => arcPath(a, b), [a.x, a.y, b.x, b.y]); // eslint-disable-line react-hooks/exhaustive-deps

  const graticule = React.useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let lon = -180; lon <= 180; lon += 30) {
      const p = project(0, lon);
      lines.push({ x1: p.x, y1: 0, x2: p.x, y2: H });
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const p = project(lat, 0);
      lines.push({ x1: 0, y1: p.y, x2: W, y2: p.y });
    }
    return lines;
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Taste travelling from ${from.name} to ${to.name}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="map-fade" cx="50%" cy="42%" r="72%">
            <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.10" />
            <stop offset="55%" stopColor="var(--ember)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--ember)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#map-fade)" />

        <g stroke="var(--border)" strokeWidth={1} opacity={0.6}>
          {graticule.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>

        {/* City nodes */}
        {[from, ...extras, to].map((p) => {
          const c = project(p.lat, p.lon);
          return (
            <g key={`${p.name}-${p.lat}`}>
              <circle cx={c.x} cy={c.y} r={7} fill="var(--ember)" opacity={0.14} />
              <circle cx={c.x} cy={c.y} r={2.6} fill="var(--ember)" />
            </g>
          );
        })}

        {/* Arc */}
        <path
          d={path}
          fill="none"
          stroke="url(#arc-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          className="motion-safe:animate-beam-dash"
        />
        <circle r={5} fill="var(--ember-bright)">
          <animateMotion
            dur="4.5s"
            repeatCount="indefinite"
            path={path}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
        </circle>

        {/* Endpoints */}
        <circle cx={a.x} cy={a.y} r={5} fill="var(--canvas)" stroke="var(--ember)" strokeWidth={2}>
          <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={b.x} cy={b.y} r={5} fill="var(--canvas)" stroke="var(--gold)" strokeWidth={2} />

        {label && (
          <g
            fontFamily="var(--font-mono), monospace"
            fontSize={15}
            style={{ letterSpacing: "0.02em" }}
          >
            <text x={a.x + 12} y={a.y - 10} fill="var(--muted)">
              {from.name}
            </text>
            <text x={b.x + 12} y={b.y - 10} fill="var(--gold)">
              {to.name}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
