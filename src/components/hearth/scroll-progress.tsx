"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * A thin ember rail at the very top that tracks reading progress. Warm on
 * purpose — the same single light source, never a cool tech gradient.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,var(--ember-deep),var(--ember),var(--gold))] shadow-[0_0_18px_-2px_var(--ember)]"
    />
  );
}
