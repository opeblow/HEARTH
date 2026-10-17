"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible dialog built on the native <dialog> element: real focus trapping,
 * Escape to close, inert background. No extra dependencies.
 */
export function Dialog({
  open,
  onOpenChange,
  titleId,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };
    const onClose = () => onOpenChange(false);
    el.addEventListener("cancel", onCancel);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("cancel", onCancel);
      el.removeEventListener("close", onClose);
    };
  }, [onOpenChange]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[min(92vw,44rem)] max-h-[88dvh] overflow-y-auto rounded-[var(--radius-xl)] border border-border-strong bg-surface p-0 text-foreground shadow-[var(--shadow-lg)] backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

export function DialogClose({
  onClose,
  label = "Close",
}: {
  onClose: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
