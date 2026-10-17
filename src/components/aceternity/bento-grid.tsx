import * as React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-4 md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  children,
  span = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { span?: 1 | 2 | 3 }) {
  const spanClass =
    span === 3 ? "md:col-span-3" : span === 2 ? "md:col-span-2" : "md:col-span-1";
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/70 p-5 transition-colors hover:border-border-strong",
        spanClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
