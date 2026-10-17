"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedList({
  children,
  className,
  stagger = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <ul className={cn(className)}>
      {items.map((child, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.li>
      ))}
    </ul>
  );
}
