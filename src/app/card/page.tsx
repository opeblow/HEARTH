import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CardClient } from "./card-client";

export const metadata: Metadata = {
  title: "Shared bridge",
  description: "A grounded set of places, shared through Hearth.",
  robots: { index: false, follow: false },
};

export default function CardPage() {
  return (
    <main>
      <Suspense>
        <CardClient />
      </Suspense>
      <p className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <Link href="/" className="font-mono text-xs text-muted-2 hover:text-ember">
          hearth
        </Link>
      </p>
    </main>
  );
}
