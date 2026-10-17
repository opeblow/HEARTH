"use client";

import * as React from "react";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { SourceBadge } from "@/components/hearth/source-badge";
import type { RunResult } from "@/lib/domain";

export function TraceButton({ run }: { run: RunResult }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Terminal className="size-4" />
        View trace
      </Button>
      <Dialog open={open} onOpenChange={setOpen} titleId="trace-title">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <h2 id="trace-title" className="text-lg text-foreground-strong">
              Agent trace
            </h2>
            <p className="font-mono text-xs text-muted-2">
              {run.callsSucceeded} of {run.callsTotal} Qloo calls succeeded ·{" "}
              {run.verifierRejected} ungrounded removed
            </p>
          </div>
          <DialogClose onClose={() => setOpen(false)} />
        </div>
        <div className="p-5">
          <SourceBadge source={run.source} className="mb-4" />
          <ol className="space-y-2 font-mono text-xs">
            {run.trace.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ember" />
                <span className="text-muted">
                  <span className="text-foreground">{t.label}</span>
                  {t.detail ? ` — ${t.detail}` : ""}
                </span>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-sage" />
              <span className="min-w-0 break-all text-muted">
                <span className="text-foreground">Queries used</span> — {run.queriesUsed} · run{" "}
                {run.runId}
              </span>
            </li>
          </ol>
        </div>
      </Dialog>
    </>
  );
}
