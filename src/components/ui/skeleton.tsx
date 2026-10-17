import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] bg-surface-2",
        "after:absolute after:inset-0 after:animate-shimmer-slide after:bg-[linear-gradient(90deg,transparent,rgba(245,239,230,0.06),transparent)]",
        className,
      )}
      {...props}
    />
  );
}
