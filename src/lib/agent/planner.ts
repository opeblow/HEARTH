import type { Place, PlanItem, Prefs } from "@/lib/domain";

const THEMES = [
  { week: 1, theme: "Settle in", title: "Your first week: land softly" },
  { week: 2, theme: "Find your people", title: "Week two: stop being a stranger" },
  { week: 3, theme: "Explore", title: "Week three: let the city surprise you" },
  { week: 4, theme: "Make it yours", title: "Week four: start a routine you keep" },
];

/** Greedy nearest-neighbour ordering to reduce back-and-forth travel. */
function orderGeographically(places: Place[]): Place[] {
  const withCoords = places.filter((p) => p.coords);
  if (withCoords.length < 2) return places;
  const remaining = [...withCoords];
  const first = remaining.shift();
  if (!first) return places;
  const ordered = [first];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    remaining.forEach((candidate, i) => {
      const d = distance(last?.coords, candidate.coords);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    if (next) ordered.push(next);
  }
  const withoutCoords = places.filter((p) => !p.coords);
  return [...ordered, ...withoutCoords];
}

function distance(
  a: { lat: number; lon: number } | undefined,
  b: { lat: number; lon: number } | undefined,
): number {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dLat = a.lat - b.lat;
  const dLon = a.lon - b.lon;
  return Math.hypot(dLat, dLon);
}

export function buildPlan(places: Place[], prefs: Prefs): PlanItem[] {
  const comfort = places.filter((p) => p.bucket === "comfort");
  const community = places.filter((p) => p.bucket === "community");
  const discovery = places.filter((p) => p.bucket === "discovery");

  const week1 = orderGeographically(comfort.slice(0, 3));
  const week2 = orderGeographically(community.slice(0, 3));
  const week3 = orderGeographically(discovery.slice(0, 3));
  const week4 = orderGeographically(
    [...comfort.slice(3), ...community.slice(3), ...discovery.slice(3)].slice(0, 3),
  );

  const who =
    prefs.who === "couple" ? "together" : prefs.who === "group" ? "as a group" : "on your own";

  const buckets: Array<{ items: Place[]; detail: (p: Place[]) => string; extra: string }> = [
    {
      items: week1,
      detail: (p) =>
        p.length > 0
          ? `Start with what you already know: ${names(p)}. Doing these ${who} in week one shortens the distance between your old city and this one.`
          : "We couldn't ground comfort picks for this city yet — see the note in your results.",
      extra: "Book nothing. Just go. The point is familiarity, not a checklist.",
    },
    {
      items: week2,
      detail: (p) =>
        p.length > 0
          ? `Head to ${names(p)}. These are the rooms where people who share your taste already gather — go at least twice.`
          : "No grounded community picks yet; try widening your anchors.",
      extra: "Second visits are where a place becomes yours. Return once more this week.",
    },
    {
      items: week3,
      detail: (p) =>
        p.length > 0
          ? `Now the stretch: ${names(p)}. These sit just outside your known taste, chosen to widen it.`
          : "No grounded discovery picks yet.",
      extra: "Give yourself permission to dislike one of these. That's data, not failure.",
    },
    {
      items: week4,
      detail: (p) =>
        p.length > 0
          ? `Turn visits into rituals: ${names(p)}. Pick two to repeat at the same time each week.`
          : "You've covered the essentials — repeat your favourites this week.",
      extra: "Rituals beat novelty for belonging. Repetition is the whole trick.",
    },
  ];

  return THEMES.map((theme, i) => {
    const bucket = buckets[i]!;
    return {
      id: `plan-w${theme.week}`,
      week: theme.week,
      theme: theme.theme,
      title: theme.title,
      description: `${bucket.detail(bucket.items)} ${bucket.extra}`,
      placeIds: bucket.items.map((p) => p.entityId),
    } satisfies PlanItem;
  });
}

function names(places: Place[]): string {
  const list = places.map((p) => p.name);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0]!;
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}
