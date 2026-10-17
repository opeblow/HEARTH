"use client";

import * as React from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { BUCKET_META, type EntityRef, type Place } from "@/lib/domain";
import { cn } from "@/lib/utils";

const MAX_ANCHORS = 6;
const MAX_PLACES = 4;

/**
 * The hero of the results screen: your anchors on the left, the grounded places
 * they produced on the right, with beams that light up on hover or focus.
 */
export function TasteBridge({
  anchors,
  places,
  className,
}: {
  anchors: EntityRef[];
  places: Place[];
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activePlace, setActivePlace] = React.useState<string | null>(null);

  const a0 = React.useRef<HTMLDivElement>(null);
  const a1 = React.useRef<HTMLDivElement>(null);
  const a2 = React.useRef<HTMLDivElement>(null);
  const a3 = React.useRef<HTMLDivElement>(null);
  const a4 = React.useRef<HTMLDivElement>(null);
  const a5 = React.useRef<HTMLDivElement>(null);
  const p0 = React.useRef<HTMLButtonElement>(null);
  const p1 = React.useRef<HTMLButtonElement>(null);
  const p2 = React.useRef<HTMLButtonElement>(null);
  const p3 = React.useRef<HTMLButtonElement>(null);
  const anchorRefs = [a0, a1, a2, a3, a4, a5];
  const placeRefs = [p0, p1, p2, p3];

  const shownAnchors = anchors.slice(0, MAX_ANCHORS);
  const shownPlaces = places.slice(0, MAX_PLACES);

  const anchorLabel = (id: string) =>
    anchors.find((a) => a.id === id)?.name.split(" ").slice(0, 3).join(" ") ?? id;

  const active = activePlace
    ? shownPlaces.find((p) => p.entityId === activePlace)
    : undefined;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="grid grid-cols-2 items-stretch gap-6 md:gap-16">
        {/* Anchors */}
        <div className="relative z-10 flex flex-col justify-center gap-3">
          <p className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-2">
            Your anchors
          </p>
          {shownAnchors.map((a, i) => {
            const on = active?.anchorIds.includes(a.id);
            return (
              <div
                key={a.id}
                ref={anchorRefs[i]}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border bg-surface/80 px-3 py-2 backdrop-blur transition-colors",
                  on ? "border-border-ember text-foreground" : "border-border text-muted",
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ember/15 font-mono text-[0.6rem] text-ember">
                  {a.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate text-xs">{anchorLabel(a.id)}</span>
              </div>
            );
          })}
        </div>

        {/* Places */}
        <div className="relative z-10 flex flex-col justify-center gap-3">
          <p className="mb-1 text-right font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-2">
            Their matches
          </p>
          {shownPlaces.map((p, i) => {
            const on = activePlace === p.entityId;
            const meta = BUCKET_META[p.bucket];
            return (
              <button
                key={p.entityId}
                type="button"
                ref={placeRefs[i]}
                onMouseEnter={() => setActivePlace(p.entityId)}
                onMouseLeave={() => setActivePlace(null)}
                onFocus={() => setActivePlace(p.entityId)}
                onBlur={() => setActivePlace(null)}
                className={cn(
                  "flex items-center justify-end gap-2.5 rounded-full border bg-surface/80 px-3 py-2 text-right backdrop-blur transition-colors",
                  on ? "border-border-ember" : "border-border hover:border-border-strong",
                )}
              >
                <span className="truncate text-xs text-foreground">{p.name}</span>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.tone }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Beams for the active place */}
      {active &&
        active.anchorIds
          .map((anchorId) => ({ anchorId, slot: shownAnchors.findIndex((a) => a.id === anchorId) }))
          .filter(({ slot }) => slot >= 0)
          .map(({ anchorId, slot }, i) => {
            const placeSlot = shownPlaces.findIndex((p) => p.entityId === active.entityId);
            const fromRef = anchorRefs[slot];
            const toRef = placeRefs[placeSlot];
            if (!fromRef || !toRef) return null;
            return (
              <AnimatedBeam
                key={`${active.entityId}-${anchorId}`}
                containerRef={containerRef}
                fromRef={fromRef}
                toRef={toRef}
                curvature={30 + i * 8}
                delay={i * 0.2}
                duration={3}
                tone={BUCKET_META[active.bucket].tone}
              />
            );
          })}
    </div>
  );
}
