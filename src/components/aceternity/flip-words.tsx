"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export function FlipWords({
  words,
  interval = 2600,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (words.length <= 1) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const current = words[index] ?? words[0] ?? "";

  return (
    <span className={cn("relative inline-grid", className)}>
      <span className="invisible" aria-hidden="true">
        {words.reduce((a, b) => (a.length >= b.length ? a : b), "")}
      </span>
      <span className="absolute inset-0 flex items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-ember-bright"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
