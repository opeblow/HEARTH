"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Map as MapIcon, Share2 } from "lucide-react";
import { TasteBridge } from "@/components/hearth/taste-bridge";
import { PlaceCard } from "@/components/hearth/place-card";
import { HoodCompass } from "@/components/hearth/hood-compass";
import { TraceButton } from "@/components/hearth/trace-drawer";
import { SourceBadge } from "@/components/hearth/source-badge";
import { PageHeader } from "@/components/hearth/page-header";
import { Reveal } from "@/components/hearth/reveal";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BUCKET_META, type Bucket } from "@/lib/domain";
import { loadRun } from "@/lib/store";

const ORDER: Bucket[] = ["comfort", "community", "discovery"];

export function BridgeClient() {
  const [run, setRun] = React.useState<ReturnType<typeof loadRun>>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRun(loadRun());
    setLoaded(true);
  }, []);

  const anchorNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const a of run?.anchors ?? []) map.set(a.id, a.name);
    return map;
  }, [run]);

  const anchorNamesFor = (ids: string[]) =>
    ids.map((id) => anchorNameById.get(id) ?? anchorLabelFromId(id)).filter(Boolean);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground-strong">
          No result to show yet.
        </h1>
        <p className="mt-3 text-muted">
          Run the agent with a demo persona — it takes two clicks.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/start?persona=persona-lagos-toronto">
            <Button>Start with a demo persona</Button>
          </Link>
          <Link href="/start">
            <Button variant="secondary">Bring your own taste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <PageHeader
          className="max-w-2xl flex-1"
          eyebrow="The taste bridge"
          title={run.origin ? `${run.origin} → ${run.destination}` : run.destination}
          copy={`${run.places.length} grounded places across ${run.neighbourhoods.length} neighbourhoods.${
            run.verifierRejected > 0
              ? ` ${run.verifierRejected} ungrounded suggestion${run.verifierRejected === 1 ? "" : "s"} were removed before you saw them.`
              : " Every place traces back to a Qloo entity."
          }`}
        />
        <Reveal delay={120} className="flex flex-col items-start gap-3 sm:items-end">
          <SourceBadge source={run.source} />
          <div className="flex gap-2">
            <TraceButton run={run} />
            <Link href="/plan">
              <Button size="sm">
                See the 30-day plan
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Bridge visual */}
      <Reveal delay={80} className="mt-10">
        <section className="rounded-[var(--radius-2xl)] border border-border bg-surface/40 p-6 md:p-8">
          <div className="mb-2 flex items-center gap-2">
            <MapIcon className="size-4 text-ember" />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
              How your taste travelled
            </span>
          </div>
          <p className="mb-6 max-w-lg text-sm text-muted text-pretty">
            Hover a match to see exactly which of your anchors produced it.
          </p>
          <TasteBridge anchors={run.anchors ?? []} places={run.places} />
        </section>
      </Reveal>

      {/* Buckets */}
      {ORDER.map((bucket, i) => {
        const places = run.places.filter((p) => p.bucket === bucket);
        const meta = BUCKET_META[bucket];
        if (places.length === 0) return null;
        return (
          <Reveal key={bucket} delay={i * 90} className="mt-14">
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Badge variant={meta.badge}>{meta.label}</Badge>
                  <p className="mt-3 max-w-xl text-sm text-muted text-pretty">{meta.blurb}</p>
                </div>
                <span className="font-mono text-xs text-muted-2">{places.length} places</span>
              </div>
              <BentoGrid className="mt-6">
                {places.map((place) => (
                  <BentoGridItem
                    key={place.entityId}
                    span={1}
                    className={activeId === place.entityId ? "border-border-ember" : undefined}
                  >
                    <PlaceCard
                      place={place}
                      anchorNames={anchorNamesFor(place.anchorIds)}
                      active={activeId === place.entityId}
                      onHover={setActiveId}
                      className="border-0 bg-transparent p-0 hover:border-0"
                    />
                  </BentoGridItem>
                ))}
              </BentoGrid>
            </section>
          </Reveal>
        );
      })}

      {/* Compass */}
      <Reveal className="mt-16">
        <section>
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-ember" />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
              Neighbourhood compass
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl text-foreground-strong sm:text-3xl">
            Where to live, ranked by fit — not by rent.
          </h2>
          <div className="mt-6">
            <HoodCompass hoods={run.neighbourhoods} destination={run.destination} />
          </div>
        </section>
      </Reveal>

      {/* Actions */}
      <Reveal className="mt-16">
        <section className="flex flex-wrap gap-3">
          <Link href="/plan">
            <Button size="lg">
              Build my 30-day plan
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/blend">
            <Button variant="secondary" size="lg">
              <Share2 className="size-4" />
              Blend with someone
            </Button>
          </Link>
          <Link href="/start">
            <Button variant="ghost" size="lg">
              Start over
            </Button>
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function anchorLabelFromId(id: string): string {
  const map: Record<string, string> = {
    "an-afrobeats-bar": "Afrobeats night",
    "an-freedom-park": "Freedom Park",
    "an-terra-kulture": "Terra Kulture",
    "an-nike-art": "Nike Art Gallery",
    "an-suya": "Suya spot",
    "an-lagos-island": "Lagos night market",
    "an-hongdae-vinyl": "Hongdae vinyl bar",
    "an-euljiro-cafe": "Euljiro loft cafe",
    "an-gwangjang": "Gwangjang market",
    "an-bukchon": "Bukchon Hanok Village",
    "an-seongsu": "Seongsu design district",
    "an-233": "+233 Jazz Bar",
    "an-makola": "Makola Market",
    "an-jamestown": "Jamestown Café",
    "an-labadi": "Labadi Beach",
    "an-nubuke": "Nubuke Foundation",
    "an-lx": "LX Factory",
    "an-fado": "Fado house",
    "an-feiradaladra": "Feira da Ladra",
  };
  return map[id] ?? "";
}
