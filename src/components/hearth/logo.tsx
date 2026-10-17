import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string;
  href?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Hearth home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative grid size-8 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[10px] bg-ember/15 blur-[6px] transition-opacity group-hover:opacity-100"
        />
        <svg viewBox="0 0 32 32" className="relative size-8" aria-hidden="true">
          <path
            d="M16 3c2.6 4.3 1.4 6.6 0 8.4-1.2 1.5-1.1 3.2.4 4.1 1.3.8 2.6.2 3.2-1.2.6-1.4.3-3 .3-3 3 2.7 5.1 6 5.1 9.5 0 4.6-3.9 8.2-9 8.2s-9-3.6-9-8.2C7 13.4 12.4 8 16 3z"
            fill="none"
            stroke="var(--ember)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="21" r="2.6" fill="var(--ember)" />
        </svg>
      </span>
      {showWord && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-foreground-strong">
          Hearth
        </span>
      )}
    </Link>
  );
}
