import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { StartClient } from "./start-client";

export const metadata: Metadata = {
  title: "Bring your taste",
  description:
    "Add the places, music, food and films that made your old city feel like home, then pick where you're moving.",
};

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <StartClient />
    </Suspense>
  );
}
