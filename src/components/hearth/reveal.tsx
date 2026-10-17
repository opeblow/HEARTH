"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals content as it enters the viewport — one soft rise, once. Uses an
 * IntersectionObserver (no layout thrash) and fully respects reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 18,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        {
          transitionDelay: `${delay}ms`,
          "--reveal-distance": `${distance}px`,
        } as React.CSSProperties
      }
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-[var(--reveal-distance)] opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
