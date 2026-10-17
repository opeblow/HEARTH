"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/hearth/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/hearth/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/start", label: "Bring your taste" },
  { href: "/bridge", label: "Taste bridge" },
  { href: "/plan", label: "30-day plan" },
  { href: "/blend", label: "Blend" },
  { href: "/proof", label: "Proof" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);

  // The scrolled state is applied via a data attribute set on the DOM node
  // (not React state) so the server and client render identical markup — no
  // hydration mismatch — and scrolling never triggers a re-render.
  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onScroll = () => {
      if (window.scrollY > 8) el.setAttribute("data-scrolled", "true");
      else el.removeAttribute("data-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav
        ref={navRef}
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full border border-border bg-canvas/70 px-3 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease-out-quint)] data-[scrolled=true]:border-border-strong data-[scrolled=true]:bg-canvas/85 data-[scrolled=true]:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]"
      >
        <Logo className="pl-1" />

        <ul className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2 text-foreground-strong"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/start"
            className="hidden rounded-full bg-ember px-4 py-2 text-sm font-medium text-ember-ink shadow-[var(--glow-ember)] transition-transform hover:scale-[1.02] sm:inline-flex"
          >
            Start
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>

      <Dialog open={open} onOpenChange={setOpen} titleId="mobile-menu-title" className="w-[min(92vw,26rem)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 id="mobile-menu-title" className="text-base font-medium text-foreground-strong">
            Menu
          </h2>
          <DialogClose onClose={() => setOpen(false)} />
        </div>
        <ul className="p-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-[var(--radius)] px-4 py-3 text-sm text-foreground hover:bg-surface-2"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-3">
          <Link
            href="/start"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-full bg-ember px-4 py-3 text-sm font-medium text-ember-ink shadow-[var(--glow-ember)]"
          >
            Start with your taste
          </Link>
        </div>
      </Dialog>
    </header>
  );
}
