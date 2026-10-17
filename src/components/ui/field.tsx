import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  htmlFor,
  children,
  optional,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[0.8rem] font-medium tracking-wide text-foreground"
        >
          {label}
          {optional && (
            <span className="ml-2 text-xs font-normal text-muted-2">optional</span>
          )}
        </label>
        {hint && <span className="text-xs text-muted-2">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
