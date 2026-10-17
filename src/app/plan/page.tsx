import type { Metadata } from "next";
import { PlanClient } from "./plan-client";

export const metadata: Metadata = {
  title: "30-day plan",
  description:
    "A grounded four-week soft-landing plan built from verified places, ordered to cut travel. Export to your calendar.",
};

export default function PlanPage() {
  return <PlanClient />;
}
