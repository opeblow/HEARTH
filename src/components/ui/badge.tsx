import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-muted",
        ember: "border-border-ember bg-ember/10 text-ember-bright",
        comfort: "border-gold/30 bg-gold/10 text-gold",
        community: "border-rose/30 bg-rose/10 text-rose",
        discovery: "border-sage/30 bg-sage/10 text-sage",
        outline: "border-border-strong bg-transparent text-muted",
        live: "border-sage/40 bg-sage/10 text-sage",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
