"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { PlaceholderSearch } from "@/components/aceternity/placeholders-and-vanish-input";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { EntityRef } from "@/lib/domain";

const PLACEHOLDERS = [
  "Afrobeats night in Victoria Island…",
  "Hongdae vinyl bar…",
  "Gwangjang market food alley…",
  "Fado house in Alfama…",
  "A third-wave coffee bar…",
  "Nubuke Foundation…",
];

const TYPE_LABEL: Record<EntityRef["type"], string> = {
  place: "Place",
  artist: "Artist",
  film: "Film",
  tv: "TV",
  dining: "Dining",
  brand: "Brand",
  book: "Book",
  podcast: "Podcast",
};

export function AnchorSearch({
  anchors,
  onChange,
  max = 10,
}: {
  anchors: EntityRef[];
  onChange: (next: EntityRef[]) => void;
  max?: number;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<EntityRef[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const selectedIds = React.useMemo(() => new Set(anchors.map((a) => a.id)), [anchors]);
  const full = anchors.length >= max;

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { entities: EntityRef[] };
        setResults(data.entities);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search is unavailable. You can still type and add a custom anchor below.");
        }
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(handle);
  }, [query]);

  const add = (ref: EntityRef) => {
    if (selectedIds.has(ref.id) || full) return;
    onChange([...anchors, ref]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const remove = (id: string) => onChange(anchors.filter((a) => a.id !== id));

  const addCustom = () => {
    const q = query.trim();
    if (!q || full) return;
    onChange([
      ...anchors,
      { id: `custom-${q.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`, name: q, type: "place", tags: [] },
    ]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div>
      <PlaceholderSearch
        placeholders={PLACEHOLDERS}
        value={query}
        onChange={setQuery}
        onSubmit={addCustom}
        ariaLabel="Search for a place, artist, film, dish or brand you already love"
      >
        {open && (
          <div
            role="listbox"
            aria-label="Search results"
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-[var(--radius-lg)] border border-border-strong bg-surface shadow-[var(--shadow-lg)]"
          >
            {loading && (
              <div className="px-4 py-3 font-mono text-xs text-muted-2">Searching…</div>
            )}
            {!loading && results.length === 0 && (
              <button
                type="button"
                onClick={addCustom}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-muted hover:bg-surface-2"
              >
                <Plus className="size-4 text-ember" />
                Add “{query.trim()}” as a custom anchor
              </button>
            )}
            {results.map((ref) => {
              const disabled = selectedIds.has(ref.id) || full;
              return (
                <button
                  key={ref.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  disabled={disabled}
                  onClick={() => add(ref)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                    disabled ? "opacity-40" : "hover:bg-surface-2",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full border border-border bg-surface-2 font-mono text-[0.65rem] text-muted">
                      {ref.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-sm text-foreground">{ref.name}</span>
                  </span>
                  <Badge variant="outline">{TYPE_LABEL[ref.type]}</Badge>
                </button>
              );
            })}
          </div>
        )}
      </PlaceholderSearch>

      {error && <p className="mt-2 text-xs text-rose">{error}</p>}

      <div className="mt-4">
        {anchors.length === 0 ? (
          <p className="rounded-[var(--radius)] border border-dashed border-border px-4 py-6 text-center text-sm text-muted-2">
            Add 1–10 things you already love. These are the signal Hearth transfers.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {anchors.map((a) => (
              <li key={a.id}>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-2 py-1.5 pl-3 pr-1.5 text-sm text-foreground">
                  <span className="grid size-4 place-items-center rounded-full bg-ember/20 font-mono text-[0.55rem] text-ember">
                    {a.name.slice(0, 1).toUpperCase()}
                  </span>
                  {a.name}
                  <span className="font-mono text-[0.62rem] uppercase text-muted-2">
                    {TYPE_LABEL[a.type]}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    aria-label={`Remove ${a.name}`}
                    className="grid size-6 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-3 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-right font-mono text-[0.7rem] text-muted-2">
          {anchors.length}/{max} anchors{full ? " · max reached" : ""}
        </p>
      </div>
    </div>
  );
}
