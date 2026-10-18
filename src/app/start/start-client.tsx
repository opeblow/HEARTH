"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AnchorSearch } from "@/components/hearth/anchor-search";
import { PrefsControls } from "@/components/hearth/prefs-controls";
import { RunConsole } from "@/components/hearth/run-console";
import { apiUrl } from "@/lib/api";
import { PageHeader } from "@/components/hearth/page-header";
import { Reveal } from "@/components/hearth/reveal";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PERSONAS } from "@/lib/personas";
import { DEFAULT_PREFS, type EntityRef, type Prefs } from "@/lib/domain";
import { saveProfile } from "@/lib/store";

const CITY_SUGGESTIONS = [
  "Toronto",
  "Berlin",
  "Accra",
  "Lisbon",
  "London",
  "New York",
  "Paris",
  "Nairobi",
  "São Paulo",
  "Mumbai",
  "Dubai",
  "Amsterdam",
];

/**
 * Resolve persona anchor names against the live search API so a persona is
 * built from real Qloo entities. Names that don't resolve are skipped rather
 * than fabricated.
 */
async function resolveAnchorNames(names: string[]): Promise<EntityRef[]> {
  const settled = await Promise.allSettled(
    names.map(async (name) => {
      const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(name)}`));
      if (!res.ok) return null;
      const data = (await res.json()) as { entities?: EntityRef[] };
      return data.entities?.[0] ?? null;
    }),
  );
  const seen = new Set<string>();
  const refs: EntityRef[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled" || !r.value) continue;
    if (seen.has(r.value.id)) continue;
    seen.add(r.value.id);
    refs.push(r.value);
  }
  return refs;
}

export function StartClient() {
  const params = useSearchParams();
  const personaId = params.get("persona");

  const [anchors, setAnchors] = React.useState<EntityRef[]>([]);
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [autoStart, setAutoStart] = React.useState(false);

  const applyPersona = React.useCallback(async (id: string, auto: boolean) => {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setOrigin(persona.origin);
    setDestination(persona.destination);
    setPrefs({ ...DEFAULT_PREFS, ...persona.prefs, dietary: [], accessibility: [] });
    setAutoStart(false);
    const refs = await resolveAnchorNames(persona.anchorNames);
    setAnchors(refs);
    setAutoStart(auto && refs.length > 0);
  }, []);

  React.useEffect(() => {
    if (personaId) void applyPersona(personaId, true);
  }, [personaId, applyPersona]);

  React.useEffect(() => {
    void saveProfile({
      anchors,
      originCity: origin || undefined,
      destinationCity: destination || undefined,
      prefs,
      createdAt: new Date().toISOString(),
    });
  }, [anchors, origin, destination, prefs]);

  const ready = anchors.length > 0 && destination.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="Bring your home"
        title="What made your old city feel like yours?"
        copy="Add up to ten things — a bar, an artist, a film, a dish, a brand. Then tell Hearth where you're going."
      />

      <Reveal delay={90} className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-muted-2">
            <Sparkles className="size-3.5 text-ember" /> Try a persona
          </span>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPersona(p.id, true)}
              className={cn(
                "rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-ember hover:text-foreground",
              )}
            >
              {p.name} · {p.origin} → {p.destination}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={140} className="mt-10">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <Field label="Your anchors" hint="1–10" htmlFor="anchor-search">
          <AnchorSearch anchors={anchors} onChange={setAnchors} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Where you are now" optional hint="city only" htmlFor="origin">
            <Input
              id="origin"
              list="city-list"
              placeholder="e.g. Lagos"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              maxLength={60}
            />
          </Field>
          <Field label="Where you are moving" htmlFor="destination">
            <Input
              id="destination"
              list="city-list"
              placeholder="e.g. Toronto"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              maxLength={60}
              aria-required="true"
            />
          </Field>
        </div>
        <datalist id="city-list">
          {CITY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <PrefsControls prefs={prefs} onChange={setPrefs} />

        <div className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {anchors.length} anchor{anchors.length === 1 ? "" : "s"}
            </Badge>
            {destination && <Badge variant="ember">{destination}</Badge>}
            <span className="ml-auto font-mono text-[0.7rem] text-muted-2">
              city-level only · no GPS
            </span>
          </div>
          <RunConsole
            anchors={anchors}
            origin={origin || undefined}
            destination={destination}
            prefs={prefs}
            autoStart={autoStart}
          />
          {!ready && (
            <p className="mt-3 text-center text-xs text-muted-2">
              Add at least one anchor and a destination to continue.
            </p>
          )}
        </div>
        </form>
      </Reveal>
    </div>
  );
}
