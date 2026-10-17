import Link from "next/link";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  MapPin,
  Layers,
  Network,
} from "lucide-react";
import { Spotlight } from "@/components/aceternity/spotlight";
import { WorldMap } from "@/components/aceternity/world-map";
import { FlipWords } from "@/components/aceternity/flip-words";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Marquee } from "@/components/magicui/marquee";
import { Reveal } from "@/components/hearth/reveal";
import { ThemeToggle } from "@/components/hearth/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERSONAS } from "@/lib/personas";

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Lagos: { lat: 6.5, lon: 3.4 },
  Toronto: { lat: 43.65, lon: -79.38 },
  Seoul: { lat: 37.57, lon: 126.98 },
  Berlin: { lat: 52.52, lon: 13.4 },
  London: { lat: 51.51, lon: -0.13 },
  Accra: { lat: 5.6, lon: -0.19 },
  Lisbon: { lat: 38.72, lon: -9.14 },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* ------------------------------------------------------------ Hero */}
      <Spotlight className="rounded-[var(--radius-2xl)]">
        <section className="relative grid items-center gap-12 overflow-hidden pt-16 pb-20 md:pt-24 lg:grid-cols-[1.05fr_1fr]">
          <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="ember" className="gap-2 py-1">
                <Sparkles className="size-3.5" />
                Taste transfer, powered by Qloo
              </Badge>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
                Agents, but with taste
              </span>
            </div>

            <h1 className="mt-7 font-display text-[2.5rem] leading-[1.04] tracking-[-0.03em] text-foreground-strong text-balance sm:text-6xl lg:text-[4.1rem]">
              Move cities without <br className="hidden sm:block" />
              losing your taste.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Tell Hearth the places, music, food and films that made your old city feel like
              home. It finds their equivalents in the city you&apos;re moving to — then turns
              them into a 30-day soft-landing plan.
            </p>

            <p className="mt-6 font-display text-xl text-foreground sm:text-2xl">
              Find your{" "}
              <FlipWords
                words={["bar", "playlist", "people", "dinner table", "Sunday spot", "scene"]}
              />{" "}
              on the other side.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={`/start?persona=${PERSONAS[0]?.id ?? ""}`}>
                <ShimmerButton>
                  Start with a demo persona
                  <ArrowRight className="size-4" />
                </ShimmerButton>
              </Link>
              <Link href="/start">
                <Button variant="secondary" size="lg">
                  Bring your own taste
                </Button>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs text-muted-2">
                No account. No email. Your profile stays on your device.
              </p>
              <ThemeToggle variant="pill" />
            </div>

            <dl className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border pt-6">
              {[
                { k: "Grounding", v: "100%" },
                { k: "Cities", v: "5+" },
                { k: "Setup", v: "zero" },
              ].map((s) => (
                <div key={s.k} className="flex items-baseline gap-2">
                  <dt className="font-mono text-[0.68rem] uppercase tracking-wider text-muted-2">
                    {s.k}
                  </dt>
                  <dd className="font-display text-lg text-foreground-strong">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal delay={120} className="relative">
            <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface/60 shadow-[var(--shadow-lg)] backdrop-blur">
              <div className="rim-light pointer-events-none absolute inset-x-0 top-0 h-px" />
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
                  Taste in transit
                </span>
                <span className="font-mono text-[0.7rem] text-ember">Lagos → Toronto</span>
              </div>
              <WorldMap
                from={{ name: "Lagos", ...(CITY_COORDS.Lagos ?? { lat: 0, lon: 0 }) }}
                to={{ name: "Toronto", ...(CITY_COORDS.Toronto ?? { lat: 0, lon: 0 }) }}
                extras={[{ name: "Accra", ...(CITY_COORDS.Accra ?? { lat: 0, lon: 0 }) }]}
                className="h-[20rem] w-full sm:h-[24rem]"
              />
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                {[
                  { k: "Comfort", v: "3 places" },
                  { k: "Community", v: "3 rooms" },
                  { k: "Discovery", v: "3 fresh" },
                ].map((cell) => (
                  <div key={cell.k} className="px-4 py-3">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-2">
                      {cell.k}
                    </p>
                    <p className="text-sm text-foreground">{cell.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </Spotlight>

      {/* -------------------------------------------------- How it works */}
      <section className="border-t border-border py-20">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="A grounded agent, not a chat box with opinions."
            copy="Hearth makes many small, typed Qloo calls, then a verifier removes anything the model cannot trace back to Qloo data. You see the whole trace."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              t: "Intake",
              d: "Your anchors are resolved to real Qloo entities — a bar, an artist, a film, a dish.",
            },
            {
              n: "02",
              t: "Transfer",
              d: "The same signal is replayed with your destination city as the location filter.",
            },
            {
              n: "03",
              t: "Verify",
              d: "Every place is checked against this run's results. Ungrounded items are dropped and counted.",
            },
            {
              n: "04",
              t: "Compose",
              d: "A 30-day plan, grouped into Comfort, Community and Discovery, ordered to cut travel.",
            },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="lift h-full rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6">
                <span className="font-mono text-xs text-ember">{step.n}</span>
                <h3 className="mt-3 text-lg text-foreground-strong">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{step.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Buckets */}
      <section className="border-t border-border py-20">
        <Reveal>
          <SectionHeading
            eyebrow="The three rooms"
            title="Comfort first. Community second. Discovery third."
            copy="People settle in an order, so Hearth recommends in one. Not eighty options — three groups of three, chosen well."
          />
        </Reveal>
        <Reveal delay={120}>
          <BentoGrid className="mt-12">
            <BentoGridItem span={1} className="lift md:min-h-[15rem]">
              <Badge variant="comfort" className="w-fit">Comfort</Badge>
              <h3 className="mt-4 text-xl text-foreground-strong">Feels like home</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The rooms you already know how to be yourself in, translated to a new map.
              </p>
              <div className="mt-auto pt-6 font-mono text-[0.7rem] text-muted-2">
                signal: anchors → filter.type=place
              </div>
            </BentoGridItem>
            <BentoGridItem span={1} className="lift md:min-h-[15rem]">
              <Badge variant="community" className="w-fit">Community</Badge>
              <h3 className="mt-4 text-xl text-foreground-strong">Where your people gather</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The specific rooms where people who share your taste already go — found by tag, not by rating.
              </p>
              <div className="mt-auto pt-6 font-mono text-[0.7rem] text-muted-2">
                signal + operator.filter.tags=union
              </div>
            </BentoGridItem>
            <BentoGridItem span={1} className="lift md:min-h-[15rem]">
              <Badge variant="discovery" className="w-fit">Discovery</Badge>
              <h3 className="mt-4 text-xl text-foreground-strong">Just beyond your taste</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Adjacent, fresh picks with your comfort results excluded, tuned by the familiarity dial.
              </p>
              <div className="mt-auto pt-6 font-mono text-[0.7rem] text-muted-2">
                filter.exclude.entities + popularity band
              </div>
            </BentoGridItem>
          </BentoGrid>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ Personas */}
      <section className="border-t border-border py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Or borrow someone else's taste"
            title="Three moves, three stories."
            copy="Start from a real persona — no typing — and watch the agent work. Swap the city any time."
          />
        </Reveal>
        <Reveal delay={120}>
          <Marquee className="mt-12" duration={48}>
            {PERSONAS.map((persona) => {
              const from = CITY_COORDS[persona.origin];
              const to = CITY_COORDS[persona.destination];
              return (
                <Link
                  key={persona.id}
                  href={`/start?persona=${persona.id}`}
                  className="group mx-3 block w-[20rem] shrink-0 rounded-[var(--radius-lg)] border border-border bg-surface/70 p-6 transition-colors hover:border-border-ember"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg text-foreground-strong">
                      {persona.name}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-ember">
                      <MapPin className="size-3" />
                      {persona.origin} → {persona.destination}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">
                    {persona.blurb}
                  </p>
                  <div className="mt-5 h-px w-full bg-border" />
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-2">
                    <span className="font-mono">
                      {from ? `${from.lat},${from.lon}` : ""} → {to ? `${to.lat},${to.lon}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ember transition-transform group-hover:translate-x-0.5">
                      Run <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </Marquee>
        </Reveal>
      </section>

      {/* ----------------------------------------------------- Contract */}
      <section className="border-t border-border py-20">
        <Reveal>
          <div className="grid items-center gap-10 rounded-[var(--radius-2xl)] border border-border bg-surface/50 p-8 md:grid-cols-2 md:p-12">
            <div>
              <Badge variant="outline" className="w-fit">
                <ShieldCheck className="size-3.5" /> The grounding contract
              </Badge>
              <h2 className="mt-5 font-display text-3xl text-foreground-strong sm:text-4xl">
                No place appears unless Qloo returned it.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
                <TextGenerateEffect text="The model writes reasons and plans. It never invents a venue. A deterministic verifier rejects any id that was not in this run's Qloo results, and the rejection count is published on the proof page." />
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-canvas-deep/60 p-5 font-mono text-xs leading-relaxed">
              {[
                ["llm → ", "reason { entityId: \"ca-tor-afro\" }"],
                ["verify ← ", "entityId ∈ qloo_results ? keep : drop"],
                ["result → ", "3 comfort · 3 community · 3 discovery"],
              ].map(([a, b]) => (
                <div key={a} className="flex gap-3 py-1.5">
                  <span className="text-ember">{a}</span>
                  <span className="text-muted">{b}</span>
                </div>
              ))}
              <div className="mt-3 border-t border-border pt-3 text-muted-2">
                ungrounded removed: <span className="text-sage">counted, never shown</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- Proof */}
      <section className="border-t border-border py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, k: "Grounding", v: "100%", d: "of recommended places trace to a Qloo entity id." },
            { icon: Network, k: "Cities outside the usual", v: "5+", d: "Lagos, Accra, Seoul and more — not just US/EU." },
            { icon: HeartHandshake, k: "Built for", v: "New arrivals", d: "Students, expats, returnees, relocation teams." },
          ].map((s, i) => (
            <Reveal key={s.k} delay={i * 90}>
              <div className="lift h-full rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6">
                <s.icon className="size-5 text-ember" />
                <p className="mt-4 font-display text-3xl text-foreground-strong">{s.v}</p>
                <p className="mt-1 text-sm text-foreground">{s.k}</p>
                <p className="mt-2 text-sm text-muted text-pretty">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link href="/proof" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-auto w-full whitespace-normal! py-3.5 text-center sm:h-13 sm:w-auto sm:whitespace-nowrap!"
            >
              <Layers className="size-4" />
              See Hearth vs an LLM-only baseline
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/privacy" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="h-auto w-full whitespace-normal! py-3.5 text-center sm:h-13 sm:w-auto sm:whitespace-nowrap!"
            >
              <Compass className="size-4" />
              What stays on your device
            </Button>
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------- Final CTA */}
      <section className="pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border-ember bg-surface/60 px-8 py-16 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-24 h-48 motion-safe:animate-ember-pulse"
              style={{
                background:
                  "radial-gradient(50% 100% at 50% 100%, color-mix(in oklab, var(--ember) 30%, transparent), transparent 70%)",
              }}
            />
            <h2 className="relative font-display text-3xl text-foreground-strong sm:text-5xl">
              Your next city is waiting to feel like home.
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-base text-muted text-pretty">
              Two clicks, under twenty seconds, one real result.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`/start?persona=${PERSONAS[0]?.id ?? ""}`}>
                <ShimmerButton>
                  Start with a demo persona
                  <ArrowRight className="size-4" />
                </ShimmerButton>
              </Link>
              <Link href="/start">
                <Button variant="secondary" size="lg">
                  Bring your own taste
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl leading-tight text-foreground-strong sm:text-4xl text-balance">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{copy}</p>
    </div>
  );
}
