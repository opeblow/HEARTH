import { cn } from "@/lib/utils";

/** Fixed background: warm vignette + fine grain. Reads as print, not gradient. */
export function Ambient({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 -z-10", className)}>
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--ember) 9%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 55%, color-mix(in oklab, var(--canvas-deep) 90%, transparent))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
