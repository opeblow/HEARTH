import type { Prefs } from "@/lib/domain";

/**
 * Curated demo personas — the zero-typing path to a real result.
 *
 * Client-safe by design: it ships only names and preferences, never the fixture
 * catalogue. `anchorNames` are resolved against the live Qloo search API at
 * apply time, so personas work as well live as they do against fixtures.
 */
export type Persona = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  blurb: string;
  anchorNames: string[];
  prefs: Pick<Prefs, "familiarity" | "vibe" | "budget" | "who">;
};

export const PERSONAS: Persona[] = [
  {
    id: "persona-lagos-toronto",
    name: "Adaeze",
    origin: "Lagos",
    destination: "Toronto",
    blurb: "MSc student leaving Lagos for Toronto in September. Wants the music and the food first.",
    anchorNames: ["Terra Kulture", "Freedom Park Lagos", "Nike Art Gallery", "Lagos Island", "Suya"],
    prefs: { familiarity: 0.55, vibe: "lively", budget: "low", who: "solo" },
  },
  {
    id: "persona-seoul-berlin",
    name: "Ji-woo",
    origin: "Seoul",
    destination: "Berlin",
    blurb: "Product designer moving for a studio job. Trade a Hongdae night for Berlin's equivalent.",
    anchorNames: ["Hongdae", "Euljiro", "Seongsu-dong", "Gwangjang Market"],
    prefs: { familiarity: 0.42, vibe: "balanced", budget: "mid", who: "solo" },
  },
  {
    id: "persona-return-accra",
    name: "Kwame",
    origin: "London",
    destination: "Accra",
    blurb: "Returning to Accra after a decade in London. Relearning the city as a resident, not a visitor.",
    anchorNames: ["+233 Jazz Bar & Grill", "Nubuke Foundation", "Jamestown", "Makola Market"],
    prefs: { familiarity: 0.6, vibe: "balanced", budget: "mid", who: "couple" },
  },
];

export function findPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
