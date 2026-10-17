import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type ?? "text"}
    className={cn(
      "h-11 w-full rounded-[var(--radius)] border border-border bg-surface-2/60 px-4 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:border-border-ember focus:bg-surface-2 focus:outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[var(--radius)] border border-border bg-surface-2/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:border-border-ember focus:bg-surface-2 focus:outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
