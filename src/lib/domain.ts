export type EntityType =
  | "place"
  | "artist"
  | "film"
  | "tv"
  | "dining"
  | "brand"
  | "book"
  | "podcast";

export type Bucket = "comfort" | "community" | "discovery";

export type EntityRef = {
  id: string;
  name: string;
  type: EntityType;
  imageUrl?: string;
  tags: string[];
};

export type Coords = { lat: number; lon: number };

export type Place = {
  entityId: string;
  name: string;
  bucket: Bucket;
  type: EntityType;
  coords?: Coords;
  neighbourhood?: string;
  /** 0..1 Qloo affinity, shown honestly and never rounded up. */
  affinity?: number;
  tags: string[];
  /** Grounded one-sentence explanation built from anchors + Qloo tags. */
  reason: string;
  imageUrl?: string;
  priceLevel?: 1 | 2 | 3 | 4;
  anchorIds: string[];
};

export type Neighbourhood = {
  id: string;
  name: string;
  score: number;
  blurb: string;
  coords?: Coords;
  highlights: string[];
};

export type PlanItem = {
  id: string;
  week: number;
  theme: string;
  title: string;
  description: string;
  placeIds: string[];
};

export type TraceStatus = "pending" | "active" | "done" | "error";

export type TraceEvent = {
  id: string;
  kind:
    | "resolve"
    | "transfer"
    | "community"
    | "discovery"
    | "cross-domain"
    | "compass"
    | "compose"
    | "verify"
    | "done";
  label: string;
  detail?: string;
  status: TraceStatus;
  callsSucceeded?: number;
  callsTotal?: number;
};

export type Who = "solo" | "couple" | "group";
export type Vibe = "quiet" | "balanced" | "lively";
export type Budget = "low" | "mid" | "high";

export type Prefs = {
  /** 0 = pure comfort, 1 = surprise me. */
  familiarity: number;
  vibe: Vibe;
  budget: Budget;
  dietary: string[];
  accessibility: string[];
  who: Who;
};

export const DEFAULT_PREFS: Prefs = {
  familiarity: 0.4,
  vibe: "balanced",
  budget: "mid",
  dietary: [],
  accessibility: [],
  who: "solo",
};

export type Profile = {
  anchors: EntityRef[];
  originCity?: string;
  destinationCity?: string;
  prefs: Prefs;
  createdAt: string;
};

export type RunSource = "live" | "cached" | "demo";

export type RunResult = {
  runId: string;
  origin?: string;
  destination: string;
  anchors: EntityRef[];
  places: Place[];
  neighbourhoods: Neighbourhood[];
  plan: PlanItem[];
  trace: TraceEvent[];
  source: RunSource;
  queriesUsed: number;
  verifierRejected: number;
  callsSucceeded: number;
  callsTotal: number;
  createdAt: string;
};

export type ShareCard = {
  id: string;
  title: string;
  destination: string;
  picks: Place[];
  createdAt: string;
  ttlSeconds: number;
};

export const BUCKET_META: Record<
  Bucket,
  { label: string; blurb: string; tone: string; badge: "comfort" | "community" | "discovery" }
> = {
  comfort: {
    label: "Comfort",
    blurb: "Places that feel like the ones you left behind.",
    tone: "var(--gold)",
    badge: "comfort",
  },
  community: {
    label: "Community",
    blurb: "Where the people who share your taste already gather.",
    tone: "var(--rose)",
    badge: "community",
  },
  discovery: {
    label: "Discovery",
    blurb: "Adjacent, fresh — a new city you'll actually like.",
    tone: "var(--sage)",
    badge: "discovery",
  },
};
