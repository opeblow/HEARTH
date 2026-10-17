"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Link2, Trash2, Users } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RunConsole } from "@/components/hearth/run-console";
import { SourceBadge } from "@/components/hearth/source-badge";
import { PageHeader } from "@/components/hearth/page-header";
import { Reveal } from "@/components/hearth/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { BUCKET_META, DEFAULT_PREFS, type EntityRef, type Place, type RunResult, type ShareCard } from "@/lib/domain";
import { loadProfile, loadRun, saveShareToken, listShareTokens } from "@/lib/store";

export function BlendClient() {
  const params = useSearchParams();
  const [run, setRun] = React.useState<RunResult | null>(null);
  const [myAnchors, setMyAnchors] = React.useState<EntityRef[]>([]);
  const [published, setPublished] = React.useState<{ id: string; token: string } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [joinId, setJoinId] = React.useState(params.get("id") ?? "");
  const [card, setCard] = React.useState<ShareCard | null>(null);
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const [blendResult, setBlendResult] = React.useState<RunResult | null>(null);

  React.useEffect(() => {
    const r = loadRun();
    setRun(r);
    if (r) setMyAnchors(r.anchors);
    else void loadProfile().then((p) => setMyAnchors(p?.anchors ?? []));
  }, []);

  const loadCard = React.useCallback(async (id: string) => {
    setJoinError(null);
    setCard(null);
    setBlendResult(null);
    if (!/^[a-f0-9]{32}$/.test(id)) {
      setJoinError("That doesn't look like a Hearth link id.");
      return;
    }
    try {
      const res = await fetch(`/api/share?id=${id}`);
      if (!res.ok) throw new Error("not found");
      const data = (await res.json()) as { card: ShareCard };
      setCard(data.card);
    } catch {
      setJoinError("We couldn't find that card. It may have expired.");
    }
  }, []);

  React.useEffect(() => {
    if (joinId) void loadCard(joinId);
  }, [joinId, loadCard]);

  const publish = async () => {
    if (!run || run.places.length === 0) return;
    const picks = run.places.slice(0, 8);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: `Hearth picks for ${run.destination}`, destination: run.destination, picks }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { id: string; deleteToken: string };
      setPublished({ id: data.id, token: data.deleteToken });
      await saveShareToken(data.id, data.deleteToken);
    } catch {
      setJoinError("Could not publish the card.");
    }
  };

  const removeShare = async () => {
    if (!published) return;
    const tokens = await listShareTokens();
    const token = tokens[published.id] ?? published.token;
    await fetch("/api/share", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: published.id, deleteToken: token }),
    });
    setPublished(null);
  };

  const copyLink = async () => {
    if (!published) return;
    const url = `${window.location.origin}/s/${published.id}`;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const theirAnchors: EntityRef[] = React.useMemo(
    () =>
      card
        ? card.picks.map((p) => ({
            id: `theirs-${p.entityId}`,
            name: p.name,
            type: p.type,
            tags: p.tags,
          }))
        : [],
    [card],
  );
  const blendedAnchors = React.useMemo(
    () => [...myAnchors, ...theirAnchors].slice(0, 10),
    [myAnchors, theirAnchors],
  );

  const overlap = React.useMemo(() => {
    if (!blendResult || !card) return null;
    const myTags = new Set(myAnchors.flatMap((a) => a.tags));
    const theirTags = new Set(card.picks.flatMap((p) => p.tags));
    const shared = blendResult.places.filter(
      (p) => p.tags.some((t) => myTags.has(t)) && p.tags.some((t) => theirTags.has(t)),
    );
    return { shared, score: blendResult.places.length ? shared.length / blendResult.places.length : 0 };
  }, [blendResult, card, myAnchors]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="Blend"
        title={"Find a place you'll both love."}
        copy="Share your picks with a private link, or paste someone else's. Hearth combines both taste profiles and shows where they overlap. No accounts, no names."
      />

      {/* Create */}
      <Reveal delay={90} className="mt-12">
        <section>
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground-strong">
          <Link2 className="size-5 text-ember" /> Share your bridge
        </h2>
        {!run ? (
          <p className="mt-3 text-sm text-muted">
            Run Hearth once and your picks become shareable here.
          </p>
        ) : published ? (
          <div className="mt-4">
            <BorderBeam className="rounded-[var(--radius-lg)]">
              <div className="p-5">
                <p className="text-sm text-muted">Your private link (expires in 30 days):</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-[var(--radius)] border border-border bg-canvas-deep/60 px-3 py-2 font-mono text-xs text-foreground">
                    /s/{published.id}
                  </code>
                  <Button size="sm" variant="secondary" onClick={copyLink}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={removeShare}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
                <p className="mt-3 font-mono text-[0.7rem] text-muted-2">
                  The delete token is stored on this device. Delete removes the card for everyone.
                </p>
              </div>
            </BorderBeam>
          </div>
        ) : (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5">
            <p className="text-sm text-muted">
              We&apos;ll publish your top {Math.min(8, run.places.length)} picks. No anchors, no
              personal notes — whitelisted fields only, with a 30-day expiry.
            </p>
            <Button className="mt-4" onClick={publish}>
              <Link2 className="size-4" /> Create share link
            </Button>
          </div>
        )}
        </section>
      </Reveal>

      {/* Join */}
      <Reveal delay={140} className="mt-12">
        <section>
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground-strong">
          <Users className="size-5 text-ember" /> Blend with a link
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Their link id" htmlFor="join-id" className="min-w-[16rem] flex-1">
            <Input
              id="join-id"
              placeholder="paste the 32-character id"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.trim())}
              maxLength={32}
            />
          </Field>
          <Button variant="secondary" onClick={() => loadCard(joinId)}>
            Load
          </Button>
        </div>
        {joinError && <p className="mt-3 text-sm text-rose">{joinError}</p>}

        {card && (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-strong">{card.title}</p>
                <p className="font-mono text-[0.7rem] text-muted-2">
                  {card.destination} · {card.picks.length} picks
                </p>
              </div>
              <SourceBadge source={blendResult?.source ?? "demo"} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {card.picks.map((p) => (
                <li key={p.entityId}>
                  <Badge variant={BUCKET_META[p.bucket].badge}>{p.name}</Badge>
                </li>
              ))}
            </ul>

            {myAnchors.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Add your own anchors first (run Hearth once), then blend.
              </p>
            ) : (
              <div className="mt-5">
                <RunConsole
                  anchors={blendedAnchors}
                  destination={card.destination}
                  prefs={DEFAULT_PREFS}
                  label="Find places we'll both love"
                  onResult={setBlendResult}
                />
              </div>
            )}
          </div>
        )}

        {overlap && (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border-ember bg-surface/60 p-5">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ember">
              Overlap
            </p>
            <p className="mt-2 font-display text-3xl text-foreground-strong">
              {Math.round(overlap.score * 100)}%
            </p>
            <p className="mt-1 text-sm text-muted">
              of the results share taste signals with both of you.
            </p>
            <ul className="mt-4 space-y-2">
              {overlap.shared.slice(0, 6).map((p: Place) => (
                <li key={p.entityId} className="text-sm text-foreground">
                  <span className="text-ember">◆</span> {p.name}{" "}
                  <span className="text-muted-2">— {p.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </section>
      </Reveal>
    </div>
  );
}
