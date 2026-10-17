"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Hearth error boundary:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
        Something broke
      </p>
      <h1 className="mt-4 font-display text-4xl text-foreground-strong">
        That wasn&apos;t supposed to happen.
      </h1>
      <p className="mt-3 max-w-md text-muted text-pretty">
        Nothing you entered was lost — it stays on your device. Try again, and if it keeps failing,
        the Qloo service may be briefly unavailable.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
