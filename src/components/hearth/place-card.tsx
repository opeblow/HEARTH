"use client";

import { MapPin } from "lucide-react";
import { CircularProgress } from "@/components/magicui/circular-progress";
import { Badge } from "@/components/ui/badge";
import { Card3D } from "@/components/aceternity/card-3d";
import { BUCKET_META, type Place } from "@/lib/domain";
import { cn, formatAffinity } from "@/lib/utils";

const MONOGRAMS = ["◆", "▲", "●", "■", "◇", "△", "○", "□"];

export function PlaceCard({
  place,
  anchorNames = [],
  active,
  onHover,
  className,
}: {
  place: Place;
  anchorNames?: string[];
  active?: boolean;
  onHover?: (id: string | null) => void;
  className?: string;
}) {
  const meta = BUCKET_META[place.bucket];
  const monogram = MONOGRAMS[place.name.length % MONOGRAMS.length] ?? "◆";

  return (
    <Card3D intensity={5}>
      <article
        onMouseEnter={() => onHover?.(place.entityId)}
        onMouseLeave={() => onHover?.(null)}
        onFocus={() => onHover?.(place.entityId)}
        onBlur={() => onHover?.(null)}
        tabIndex={0}
        aria-label={`${place.name}, ${meta.label}, affinity ${formatAffinity(place.affinity)}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-surface/70 p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-0.5 hover:shadow-[var(--shadow)]",
          active ? "border-border-ember" : "border-border hover:border-border-strong",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-[var(--radius)] text-lg transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:scale-105"
            style={{
              backgroundColor: `color-mix(in oklab, ${meta.tone} 14%, transparent)`,
              color: meta.tone,
            }}
            aria-hidden="true"
          >
            {monogram}
          </div>
          <CircularProgress
            value={place.affinity ?? 0}
            size={52}
            strokeWidth={4}
            tone={meta.tone}
            label="Affinity"
          />
        </div>

        <h3 className="mt-4 text-lg leading-snug text-foreground-strong">{place.name}</h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-2">
          <Badge variant={meta.badge}>{meta.label}</Badge>
          {place.neighbourhood && (
            <span className="inline-flex items-center gap-1 font-mono">
              <MapPin className="size-3" />
              {place.neighbourhood}
            </span>
          )}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted text-pretty">{place.reason}</p>

        {anchorNames.length > 0 && (
          <p className="mt-3 font-mono text-[0.68rem] text-muted-2">
            explains: {anchorNames.slice(0, 3).join(" · ")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {place.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.62rem] text-muted-2"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Card3D>
  );
}
