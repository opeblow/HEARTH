import type { Metadata } from "next";
import { WhatLeavesDevice } from "@/components/hearth/what-leaves-device";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Hearth keeps your taste on your device. See exactly what stays, what leaves, and delete everything with one click.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">Privacy</p>
      <h1 className="mt-4 font-display text-4xl text-foreground-strong sm:text-5xl">
        Your taste is yours.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-pretty">
        No accounts. No profile on our servers. No ad trackers. Hearth asks Qloo what it needs to
        answer, keeps everything else on your device, and lets you erase it whenever you like.
      </p>

      <div className="mt-12">
        <WhatLeavesDevice />
      </div>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted text-pretty">
        <h2 className="font-display text-xl text-foreground-strong">The fine print, honestly</h2>
        <p>
          Rate limiting and the daily Qloo budget are enforced using a hashed, short-lived
          identifier derived from your connection — not a cookie that follows you. It exists to stop
          abuse and keep the API bill sane.
        </p>
        <p>
          Share cards are the only thing that outlives your session, and only because you asked for
          them. They contain whitelisted place fields, expire after 30 days, and are protected by a
          delete token held on your device.
        </p>
        <p>
          If a language model is configured, it never receives a free-text description of you —
          only the grounded list of places to be organised.
        </p>
      </section>
    </div>
  );
}
