import { cn } from "@/lib/utils";
import type { RunSource } from "@/lib/domain";

const LABELS: Record<RunSource, { text: string; tone: string }> = {
  live: { text: "Live Qloo", tone: "text-sage border-sage/40 bg-sage/10" },
  cached: { text: "Cached Qloo data", tone: "text-gold border-gold/40 bg-gold/10" },
  demo: { text: "Demo data", tone: "text-ember border-border-ember bg-ember/10" },
};

/**
 * Honesty label. Every result is badged with where it came from — live Qloo,
 * cached Qloo, or the recorded demo dataset. Never hidden.
 */
export function SourceBadge({
  source,
  className,
}: {
  source: RunSource;
  className?: string;
}) {
  const label = LABELS[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider",
        label.tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label.text}
    </span>
  );
}
