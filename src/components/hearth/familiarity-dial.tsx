"use client";

import { RangeSlider } from "@/components/ui/range-slider";
import { cn } from "@/lib/utils";

export function FamiliarityDial({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const pct = Math.round(value * 100);
  const label =
    value < 0.2
      ? "Keep it close to home"
      : value < 0.45
        ? "Mostly familiar, a little new"
        : value < 0.7
          ? "A fair mix of both"
          : value < 0.9
            ? "Push me toward the new"
            : "Surprise me completely";

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface-2/50 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.8rem] font-medium text-foreground">Familiarity dial</span>
        <span className="font-mono text-xs text-ember">
          {value < 0.5 ? "Home" : "Discovery"} · {pct}%
        </span>
      </div>
      <RangeSlider
        className="mt-4"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Familiarity: home to surprise me"
        aria-valuetext={label}
      />
      <div className="mt-2 flex justify-between font-mono text-[0.68rem] uppercase tracking-wider text-muted-2">
        <span>Home</span>
        <span>Surprise me</span>
      </div>
      <p className={cn("mt-3 text-sm text-muted")}>{label}.</p>
    </div>
  );
}
