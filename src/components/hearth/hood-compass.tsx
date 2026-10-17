"use client";

import { CircularProgress } from "@/components/magicui/circular-progress";
import { Badge } from "@/components/ui/badge";
import type { Neighbourhood } from "@/lib/domain";

export function HoodCompass({
  hoods,
  destination,
}: {
  hoods: Neighbourhood[];
  destination: string;
}) {
  if (hoods.length === 0) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-6 text-sm text-muted-2">
        No neighbourhood data was returned for {destination}. Try widening your anchors or
        comparing against a larger city.
      </p>
    );
  }

  return (
    <ol className="grid gap-4 md:grid-cols-2">
      {hoods.map((hood, i) => (
        <li
          key={hood.id}
          className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5"
        >
          <CircularProgress value={hood.score} size={56} strokeWidth={4} label="Fit" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base text-foreground-strong">{hood.name}</h3>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{hood.blurb}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {hood.highlights.map((h) => (
                <Badge key={h} variant="outline">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
