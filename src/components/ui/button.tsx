import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out-quint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ember text-ember-ink shadow-[var(--glow-ember)] hover:bg-ember-bright",
        secondary:
          "bg-surface-2 text-foreground hairline hover:bg-surface-3 hover:border-border-strong",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-surface-2",
        ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-foreground",
        link: "bg-transparent text-ember underline-offset-4 hover:underline px-0",
        danger:
          "bg-transparent text-rose border border-rose/40 hover:bg-rose/10",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-13 px-7 text-[0.95rem] [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
        "icon-sm": "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
