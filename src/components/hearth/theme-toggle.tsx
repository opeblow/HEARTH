"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/hearth/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Light / dark switch. `pill` is the labelled, discoverable control used on
 * the landing page; `icon` is the compact one used in the nav. The label always
 * names the mode you'll switch *to*, so the intent is unambiguous.
 */
export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "pill";
  className?: string;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} theme`;

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-label={label}
        title={label}
        className={className}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-border-ember hover:text-foreground",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4 text-ember" />
      ) : (
        <Moon className="size-4 text-ember" />
      )}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
