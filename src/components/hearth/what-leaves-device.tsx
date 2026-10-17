"use client";

import * as React from "react";
import { Check, Globe, Laptop, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { deleteEverything } from "@/lib/store";

const STAYS = [
  "Your anchors and their tags",
  "Your origin and destination cities",
  "Your preferences (vibe, budget, who's coming)",
  "Your last result",
  "Share delete-tokens",
];

const LEAVES = [
  {
    title: "Anchor queries to Qloo",
    body: "Only the entity ids and city needed for the search. No name, no account, no email.",
  },
  {
    title: "Composition prompt (only if an LLM is configured)",
    body: "The list of already-grounded places, wrapped and marked as untrusted data.",
  },
  {
    title: "A share card (only when you create one)",
    body: "Whitelisted place fields, 30-day expiry, deletable by you at any time.",
  },
];

export function WhatLeavesDevice() {
  const [open, setOpen] = React.useState(false);
  const [wiped, setWiped] = React.useState(false);

  const wipe = async () => {
    await deleteEverything();
    setWiped(true);
    setOpen(false);
  };

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface/60 p-6">
          <div className="flex items-center gap-2 text-sage">
            <Laptop className="size-5" />
            <h2 className="font-display text-xl text-foreground-strong">Stays on your device</h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {STAYS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-sage" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[0.7rem] text-muted-2">
            Stored in your browser (IndexedDB &amp; session storage). Not on our servers.
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface/60 p-6">
          <div className="flex items-center gap-2 text-ember">
            <Globe className="size-5" />
            <h2 className="font-display text-xl text-foreground-strong">
              Leaves only when needed
            </h2>
          </div>
          <ul className="mt-4 space-y-4">
            {LEAVES.map((item) => (
              <li key={item.title}>
                <p className="text-sm text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted text-pretty">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-rose/30 bg-rose/5 p-6">
        <div>
          <h2 className="font-display text-xl text-foreground-strong">
            {wiped ? "Everything is gone." : "Delete everything"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted text-pretty">
            {wiped
              ? "Your local profile, run and share tokens have been removed from this device."
              : "Removes your anchors, preferences and last result from this device immediately. There is no account to delete."}
          </p>
        </div>
        <Button variant="danger" onClick={() => setOpen(true)} disabled={wiped}>
          <Trash2 className="size-4" />
          {wiped ? "Deleted" : "Delete my data"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} titleId="wipe-title">
        <div className="border-b border-border p-5">
          <h2 id="wipe-title" className="font-display text-lg text-foreground-strong">
            Delete everything on this device?
          </h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted text-pretty">
            This clears your saved anchors, preferences and last result from this browser. Share
            cards you created live on the server and can be removed separately from the Blend page.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={wipe}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>
        <DialogClose onClose={() => setOpen(false)} />
      </Dialog>
    </div>
  );
}
