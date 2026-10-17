import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Timeline, type TimelineItem } from "@/components/aceternity/timeline";
import { PageHeader } from "@/components/hearth/page-header";
import { Reveal } from "@/components/hearth/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The grounding contract",
  description:
    "How Hearth guarantees every recommendation traces back to a real Qloo entity — and what happens to anything that doesn't.",
};

const STEPS: TimelineItem[] = [
  {
    id: "ask",
    eyebrow: "01 · Ask",
    title: "Your anchors become queries",
    description:
      "Your picks are resolved to Qloo entity ids. The API is asked, in Qloo's own vocabulary, for places adjacent to those ids in the destination city.",
    bullets: [
      "No free-text prompt is ever sent to a model with the power to invent places.",
      "Insight, cross-domain and neighbourhood calls are budgeted and tallied.",
    ],
  },
  {
    id: "collect",
    eyebrow: "02 · Collect",
    title: "Only Qloo answers are collected",
    description:
      "Every candidate carries the entity id it came from. Anything Qloo didn't return simply isn't in the pool.",
    bullets: [
      "Live, cached and demo results are labelled the same way, everywhere, always.",
      "A failed call reduces the count — it never invents a filler.",
    ],
  },
  {
    id: "compose",
    eyebrow: "03 · Compose",
    title: "Narrative is optional and sandboxed",
    description:
      "If a language model is configured, it may only write the week themes and blurbs — and only over the list of real places already collected.",
    bullets: [
      "Its output is validated against a strict schema.",
      "If any id it mentions isn't in the grounded set, the whole composition is thrown away.",
      "Untrusted data is wrapped and marked as data, never followed as instructions.",
    ],
  },
  {
    id: "verify",
    eyebrow: "04 · Verify",
    title: "The verifier removes the rest",
    description:
      "Before anything reaches you, every place is checked against the set of entities this run actually retrieved. The count of removed items is shown to you.",
    bullets: [
      "You can open the agent trace on any result and read every step.",
      "If the verifier removed something, we say so — we don't quietly drop it.",
    ],
  },
];

export default function ProofPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="The grounding contract"
        title="Nothing here is invented."
        copy="An AI that recommends places is only worth trusting if it can prove where each one came from. Hearth can. Every place traces to a Qloo entity — and the ones that don't are removed before you see them."
      >
        <Badge variant="ember">
          <ShieldCheck className="size-3.5" /> Grounded by construction
        </Badge>
      </PageHeader>

      <Reveal delay={140} className="mt-12">
        <Timeline items={STEPS} />
      </Reveal>

      <Reveal className="mt-16">
        <section id="method" className="rounded-[var(--radius-xl)] border border-border bg-surface/60 p-6">
          <h2 className="font-display text-xl text-foreground-strong">
            What the demo dataset is — and isn&apos;t
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">
            Until a Qloo key is configured, Hearth runs on a small, recorded dataset with the same
            shape as a live response. It is clearly badged{" "}
            <span className="text-ember">Demo data</span> on every screen it touches. It exists so you
            can see the whole experience honestly — not to look like a live call.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">
            Plug in a key and the exact same pipeline runs against the live Taste API: the badges
            change to <span className="text-sage">Live Qloo</span> or{" "}
            <span className="text-gold">Cached Qloo data</span>, and nothing else does.
          </p>
        </section>
      </Reveal>

      <Reveal delay={90} className="mt-12">
        <div className="flex flex-wrap gap-3">
          <Link href="/start">
            <Button size="lg">
              See it run
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="secondary" size="lg">
              What leaves your device
            </Button>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
