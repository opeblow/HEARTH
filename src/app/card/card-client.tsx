"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ShareCardView } from "@/components/hearth/share-card-view";
import { Skeleton } from "@/components/ui/skeleton";
import { apiUrl } from "@/lib/api";
import type { ShareCard } from "@/lib/domain";

/**
 * Client-side share card view. Used by static hosting (Cloudflare Pages),
 * where /s/:id is rewritten here via public/_redirects and the card is
 * fetched from the API with the configured base URL.
 */
export function CardClient() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [card, setCard] = React.useState<ShareCard | null>(null);
  const [state, setState] = React.useState<"loading" | "ready" | "missing">("loading");

  React.useEffect(() => {
    if (!/^[a-f0-9]{32}$/.test(id)) {
      setState("missing");
      return;
    }
    let cancelled = false;
    fetch(apiUrl(`/api/share?id=${id}`))
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        const data = (await res.json()) as { card: ShareCard };
        if (!cancelled) {
          setCard(data.card);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (state === "missing" || !card) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground-strong">Card not found</h1>
        <p className="mt-3 text-sm text-muted">
          This share link is invalid or the card has been revoked.
        </p>
      </div>
    );
  }

  return <ShareCardView card={card} />;
}
