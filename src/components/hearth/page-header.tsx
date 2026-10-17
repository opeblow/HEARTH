import type { ReactNode } from "react";
import { Reveal } from "@/components/hearth/reveal";
import { cn } from "@/lib/utils";

/**
 * The shared hero for every inner page. Keeps the eyebrow / display heading /
 * lede trio and the faint architectural grid identical across the app, so the
 * inner pages read as the same product as the landing page.
 */
export function PageHeader({
  eyebrow,
  title,
  copy,
  children,
  className,
  wide = false,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: ReactNode;
  children?: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <header className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="grid-backdrop pointer-events-none absolute inset-x-0 -top-12 -z-10 h-72"
      />
      <Reveal>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-foreground-strong text-balance sm:text-5xl">
          {title}
        </h1>
        {copy && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-muted text-pretty",
              wide ? "max-w-2xl" : "max-w-xl",
            )}
          >
            {copy}
          </p>
        )}
      </Reveal>
      {children && (
        <Reveal delay={90}>
          <div className="mt-6">{children}</div>
        </Reveal>
      )}
    </header>
  );
}
