"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Search field with rotating example placeholders, wired to a live query.
 * The dropdown is composed from children so the parent controls positioning.
 */
export function PlaceholderSearch({
  placeholders,
  value,
  onChange,
  onSubmit,
  className,
  children,
  inputId = "hearth-search",
  ariaLabel = "Search for a place, artist, film, dish or brand",
  disabled,
}: {
  placeholders: string[];
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  inputId?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [phIndex, setPhIndex] = React.useState(0);

  React.useEffect(() => {
    if (placeholders.length <= 1) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(
      () => setPhIndex((i) => (i + 1) % placeholders.length),
      3200,
    );
    return () => clearInterval(id);
  }, [placeholders.length]);

  return (
    <div className={cn("relative", className)}>
      <div
        role="search"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.(value);
          }
        }}
        className="relative"
      >
        <div className="group flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface/80 px-4 py-1.5 backdrop-blur transition-colors focus-within:border-border-ember">
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-muted-2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <label htmlFor={inputId} className="sr-only">
            {ariaLabel}
          </label>
          <input
            id={inputId}
            type="search"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholders[phIndex] ?? "Search…"}
            className="h-12 w-full bg-transparent text-[0.95rem] text-foreground placeholder:text-muted-2 focus:outline-none"
          />
          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onChange("")}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-3 hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
