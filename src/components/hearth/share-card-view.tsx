import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUCKET_META } from "@/lib/domain";
import type { ShareCard } from "@/lib/domain";

/**
 * A shared card is shown read-only. It carries only grounded places — no
 * anchors, no personal notes, no identity.
 */
export function ShareCardView({ card }: { card: ShareCard }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
        Shared with you
      </p>
      <h1 className="mt-4 font-display text-4xl text-foreground-strong sm:text-5xl">
        {card.title}
      </h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <MapPin className="size-4" /> {card.destination} · {card.picks.length} grounded places
      </p>

      <ol className="mt-10 space-y-3">
        {card.picks.map((place) => {
          const meta = BUCKET_META[place.bucket];
          return (
            <li
              key={place.entityId}
              className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg text-foreground-strong">{place.name}</h2>
                <Badge variant={meta.badge}>{meta.label}</Badge>
              </div>
              {place.neighbourhood && (
                <p className="mt-1 font-mono text-xs text-muted-2">{place.neighbourhood}</p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{place.reason}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-8">
        <Link href="/start">
          <Button size="lg">Make your own bridge</Button>
        </Link>
        <span className="font-mono text-xs text-muted-2">
          This card expires 30 days after it was created.
        </span>
      </div>
    </div>
  );
}
