import type { Metadata } from "next";
import { BridgeClient } from "./bridge-client";

export const metadata: Metadata = {
  title: "Taste bridge",
  description:
    "Your anchors, translated into grounded places in a new city, grouped into Comfort, Community and Discovery.",
};

export default function BridgePage() {
  return <BridgeClient />;
}
