import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { BlendClient } from "./blend-client";

export const metadata: Metadata = {
  title: "Blend",
  description:
    "Combine two taste profiles through a private link and see the places you'll both love.",
};

export default function BlendPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <BlendClient />
    </Suspense>
  );
}
