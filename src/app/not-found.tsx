import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
        404 · not found
      </p>
      <h1 className="mt-4 font-display text-4xl text-foreground-strong">
        This corner of the city is empty.
      </h1>
      <p className="mt-3 max-w-md text-muted text-pretty">
        The page you were looking for isn&apos;t here. Shared taste cards expire after 30 days.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Back home</Button>
        </Link>
        <Link href="/start">
          <Button variant="secondary">Start a bridge</Button>
        </Link>
      </div>
    </div>
  );
}
