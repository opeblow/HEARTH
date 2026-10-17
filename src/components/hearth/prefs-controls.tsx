"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { Field } from "@/components/ui/field";
import { FamiliarityDial } from "@/components/hearth/familiarity-dial";
import { cn } from "@/lib/utils";
import type { Budget, Prefs, Vibe, Who } from "@/lib/domain";

const VIBE_OPTIONS = [
  { value: "quiet" as Vibe, label: "Quiet" },
  { value: "balanced" as Vibe, label: "Balanced" },
  { value: "lively" as Vibe, label: "Lively" },
];

const BUDGET_OPTIONS = [
  { value: "low" as Budget, label: "Budget" },
  { value: "mid" as Budget, label: "Mid" },
  { value: "high" as Budget, label: "Splurge" },
];

const WHO_OPTIONS = [
  { value: "solo" as Who, label: "Solo" },
  { value: "couple" as Who, label: "Couple" },
  { value: "group" as Who, label: "Group" },
];

const DIETARY = ["Vegetarian", "Vegan", "Plant-based", "Halal", "Gluten-free"];
const ACCESS = ["Step-free access", "Wheelchair", "Quiet space"];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-border-ember bg-ember/10 text-ember-bright"
          : "border-border bg-surface-2/60 text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function PrefsControls({
  prefs,
  onChange,
}: {
  prefs: Prefs;
  onChange: (next: Prefs) => void;
}) {
  return (
    <div className="space-y-6">
      <FamiliarityDial
        value={prefs.familiarity}
        onChange={(familiarity) => onChange({ ...prefs, familiarity })}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Vibe" htmlFor="vibe">
          <SegmentedControl
            ariaLabel="Vibe"
            options={VIBE_OPTIONS}
            value={prefs.vibe}
            onChange={(vibe) => onChange({ ...prefs, vibe })}
            size="sm"
          />
        </Field>
        <Field label="Budget" htmlFor="budget">
          <SegmentedControl
            ariaLabel="Budget"
            options={BUDGET_OPTIONS}
            value={prefs.budget}
            onChange={(budget) => onChange({ ...prefs, budget })}
            size="sm"
          />
        </Field>
        <Field label="Who is coming" htmlFor="who">
          <SegmentedControl
            ariaLabel="Who is coming"
            options={WHO_OPTIONS}
            value={prefs.who}
            onChange={(who) => onChange({ ...prefs, who })}
            size="sm"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Dietary needs" hint="optional" htmlFor="dietary">
          <div className="flex flex-wrap gap-2">
            {DIETARY.map((d) => (
              <Chip
                key={d}
                active={prefs.dietary.includes(d.toLowerCase())}
                onClick={() => onChange({ ...prefs, dietary: toggle(prefs.dietary, d.toLowerCase()) })}
              >
                {d}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Accessibility" hint="optional" htmlFor="access">
          <div className="flex flex-wrap gap-2">
            {ACCESS.map((a) => (
              <Chip
                key={a}
                active={prefs.accessibility.includes(a.toLowerCase())}
                onClick={() =>
                  onChange({ ...prefs, accessibility: toggle(prefs.accessibility, a.toLowerCase()) })
                }
              >
                {a}
              </Chip>
            ))}
          </div>
        </Field>
      </div>
      <p className="font-mono text-[0.7rem] text-muted-2">
        Dietary and accessibility inputs are used for filtering only and are never stored on the
        server.
      </p>
    </div>
  );
}
