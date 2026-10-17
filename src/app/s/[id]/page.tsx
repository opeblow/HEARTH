import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareCardView } from "@/components/hearth/share-card-view";
import { getShareCard } from "@/lib/share";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared bridge",
  description: "A grounded set of places, shared through Hearth.",
  robots: { index: false, follow: false },
};

export default async function SharedCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getShareCard(id);
  if (!card) notFound();

  return (
    <main>
      <ShareCardView card={card} />
      <p className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <Link href="/" className="font-mono text-xs text-muted-2 hover:text-ember">
          hearth
        </Link>
      </p>
    </main>
  );
}
