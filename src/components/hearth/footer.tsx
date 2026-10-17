import Link from "next/link";
import { Logo } from "@/components/hearth/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/start", label: "Bring your taste" },
      { href: "/bridge", label: "Taste bridge" },
      { href: "/plan", label: "30-day plan" },
      { href: "/blend", label: "Blend" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/proof", label: "Proof" },
      { href: "/privacy", label: "Privacy" },
      { href: "/proof#method", label: "Methodology" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">
            Hearth moves your taste across borders. Every place it recommends comes from the
            Qloo taste graph — an LLM alone cannot do this reliably.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-2">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-2 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for the Qloo “Agents, but with taste” hackathon. Open source, MIT.</p>
          <p className="font-mono">No accounts · data stays on your device</p>
        </div>
      </div>
    </footer>
  );
}
