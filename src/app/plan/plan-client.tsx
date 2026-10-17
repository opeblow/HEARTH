"use client";

import * as React from "react";
import { CalendarPlus, Printer, Sparkles } from "lucide-react";
import { Timeline, type TimelineItem } from "@/components/aceternity/timeline";
import { Confetti } from "@/components/magicui/confetti";
import { PageHeader } from "@/components/hearth/page-header";
import { Reveal } from "@/components/hearth/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { loadRun } from "@/lib/store";
import type { RunResult } from "@/lib/domain";

export function PlanClient() {
  const [run, setRun] = React.useState<RunResult | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [fire, setFire] = React.useState(false);

  React.useEffect(() => {
    const r = loadRun();
    setRun(r);
    setLoaded(true);
    if (r) {
      const t = setTimeout(() => setFire(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground-strong">No plan yet.</h1>
        <p className="mt-3 text-muted">Run Hearth first, then your plan appears here.</p>
      </div>
    );
  }

  const placeById = new Map(run.places.map((p) => [p.entityId, p]));
  const items: TimelineItem[] = run.plan.map((plan) => {
    const places = plan.placeIds.map((id) => placeById.get(id)).filter(Boolean);
    return {
      id: plan.id,
      eyebrow: `Week ${plan.week} · ${plan.theme}`,
      title: plan.title,
      description: plan.description,
      bullets: places.map((p) => `${p!.name} — ${p!.neighbourhood ?? run.destination}`),
      meta: places.length > 0 ? `${places.length} grounded places` : "no grounded places",
    };
  });

  const exportIcs = () => {
    const ics = buildIcs({ plan: run.plan, places: run.places, destination: run.destination });
    downloadIcs(`hearth-${run.destination.toLowerCase()}-soft-landing`, ics);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Confetti fire={fire} />
      <PageHeader
        eyebrow="Your soft landing"
        title="Thirty days to stop feeling new."
        copy="Four weeks, ordered to cut travel. Every place below is one Hearth already grounded in Qloo — nothing new is invented here."
      >
        <div className="flex flex-wrap items-center gap-3 no-print">
          <Badge variant="outline">
            <Sparkles className="size-3.5" /> {run.destination}
          </Badge>
          <Button size="sm" onClick={exportIcs}>
            <CalendarPlus className="size-4" />
            Export to calendar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print view
          </Button>
        </div>
      </PageHeader>

      <Reveal delay={120} className="mt-12">
        <Timeline items={items} />
      </Reveal>

      <Reveal className="mt-16">
        <p className="font-mono text-xs text-muted-2">
          The .ics file is generated on your device. Nothing about this plan is sent anywhere.
        </p>
      </Reveal>
    </div>
  );
}
