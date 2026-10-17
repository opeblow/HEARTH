import type { Bucket, Coords, EntityRef, EntityType, Place } from "@/lib/domain";

/**
 * Recorded/demo taste data.
 *
 * This module is the fixture layer the spec requires: when no QLOO_API_KEY is
 * present the app runs against these recorded entities so a judge can use the
 * product end-to-end with zero setup. Everything served from here is labelled
 * `source: "demo"` in the API response and in the UI. Swapping in a real key
 * routes the same interface to the live Qloo Insights API.
 */

type CatalogPlace = {
  id: string;
  name: string;
  city: string;
  type: EntityType;
  tags: string[];
  coords: Coords;
  neighbourhood: string;
  price?: 1 | 2 | 3 | 4;
  bucket?: Bucket;
};

type Anchor = {
  id: string;
  name: string;
  type: EntityType;
  tags: string[];
  city?: string;
};

/** [id, name, city, type, lat, lon, neighbourhood, tags, price, bucket] */
const PLACE_ROWS: Array<
  [string, string, string, EntityType, number, number, string, string[], number, Bucket]
> = [
  // ---------------------------------------------------------------- Toronto
  ["ca-tor-kensington", "Kensington Market", "Toronto", "place", 43.6544, -79.4019, "Kensington", ["market", "vintage", "street-food", "community", "diaspora", "walkable"], 1, "community"],
  ["ca-tor-afro", "Afrobeat Lounge at The Garrison", "Toronto", "place", 43.6453, -79.4187, "Parkdale", ["afrobeats", "dance", "late-night", "live-music", "diaspora"], 2, "community"],
  ["ca-tor-rotate", "Rotate This", "Toronto", "place", 43.6479, -79.4189, "Parkdale", ["vinyl", "records", "independent", "music"], 2, "comfort"],
  ["ca-tor-ago", "Art Gallery of Ontario", "Toronto", "place", 43.6536, -79.3925, "Grange Park", ["art", "gallery", "design", "heritage"], 2, "comfort"],
  ["ca-tor-revue", "Revue Cinema", "Toronto", "place", 43.6487, -79.4490, "Junction", ["arthouse", "cinema", "independent", "community"], 2, "comfort"],
  ["ca-tor-ideal", "I Deal Coffee", "Toronto", "place", 43.6547, -79.4040, "Kensington", ["specialty-coffee", "third-wave", "quiet", "walkable"], 1, "comfort"],
  ["ca-tor-littlejamaica", "Little Jamaica on Eglinton West", "Toronto", "place", 43.6970, -79.4450, "York", ["caribbean", "reggae", "diaspora", "street-food", "community", "market"], 1, "comfort"],
  ["ca-tor-rav", "Bar Raval", "Toronto", "place", 43.6475, -79.4066, "Little Italy", ["cocktails", "small-plates", "design", "late-night", "lively"], 3, "discovery"],
  ["ca-tor-harbour", "Harbourfront Centre", "Toronto", "place", 43.6387, -79.3822, "Waterfront", ["community", "live-music", "art", "family", "accessible"], 1, "community"],
  ["ca-tor-patois", "Patois", "Toronto", "dining", 43.6475, -79.4035, "Queen West", ["caribbean", "asthma-friendly", "vegan", "small-plates", "lively"], 3, "discovery"],
  ["ca-tor-hole", "Hole in the Wall", "Toronto", "dining", 43.6500, -79.4180, "Parkdale", ["plant-based", "vegan", "vegetarian", "brunch", "step-free"], 2, "discovery"],
  ["ca-tor-high", "High Park", "Toronto", "place", 43.6465, -79.4637, "High Park", ["park", "quiet", "family", "walkable", "accessible"], 1, "discovery"],

  // ----------------------------------------------------------------- Berlin
  ["de-ber-berghain", "Berghain / Panorama Bar", "Berlin", "place", 52.5111, 13.4432, "Friedrichshain", ["techno", "electronic", "late-night", "club", "dance", "lively"], 3, "community"],
  ["de-ber-oye", "Oye Records", "Berlin", "place", 52.4876, 13.4266, "Neukölln", ["vinyl", "records", "electronic", "independent"], 2, "comfort"],
  ["de-ber-markthalle", "Markthalle Neun", "Berlin", "place", 52.5020, 13.4317, "Kreuzberg", ["market", "street-food", "community", "walkable"], 1, "comfort"],
  ["de-ber-kino", "Kino International", "Berlin", "place", 52.5211, 13.4230, "Mitte", ["arthouse", "cinema", "design", "heritage"], 2, "comfort"],
  ["de-ber-barn", "The Barn Coffee", "Berlin", "place", 52.5296, 13.4013, "Mitte", ["specialty-coffee", "third-wave", "quiet", "design"], 2, "comfort"],
  ["de-ber-museum", "Museum Island", "Berlin", "place", 52.5169, 13.4010, "Mitte", ["art", "heritage", "gallery", "walkable"], 2, "discovery"],
  ["de-ber-tempelhof", "Tempelhofer Feld", "Berlin", "place", 52.4730, 13.4030, "Tempelhof", ["park", "community", "quiet", "accessible", "family"], 1, "community"],
  ["de-ber-prince", "Prince Charles", "Berlin", "place", 52.5010, 13.3900, "Kreuzberg", ["cocktails", "electronic", "late-night", "lively", "dance"], 3, "discovery"],
  ["de-ber-readme", "Do You Read Me?!", "Berlin", "place", 52.5333, 13.3600, "Mitte", ["design", "books", "independent", "quiet"], 2, "discovery"],
  ["de-ber-mauerpark", "Mauerpark Flohmarkt", "Berlin", "place", 52.5410, 13.4020, "Prenzlauer Berg", ["vintage", "market", "community", "family", "walkable"], 1, "discovery"],
  ["de-ber-anle", "Ankerklause", "Berlin", "place", 52.4901, 13.4290, "Neukölln", ["late-night", "canal", "cocktails", "lively", "music"], 2, "community"],
  ["de-ber-ramen", "Hako Ramen Kreuzberg", "Berlin", "dining", 52.4990, 13.4180, "Kreuzberg", ["ramen", "asian", "step-free", "lively", "no-alcohol"], 2, "comfort"],

  // ------------------------------------------------------------------ Accra
  ["gh-acc-233", "+233 Jazz Bar & Grill", "Accra", "place", 5.5700, -0.1900, "Cantonments", ["jazz", "highlife", "live-music", "community", "late-night", "lively"], 3, "comfort"],
  ["gh-acc-nubuke", "Nubuke Foundation", "Accra", "place", 5.6200, -0.1800, "East Legon", ["art", "gallery", "community", "design"], 1, "community"],
  ["gh-acc-jamestown", "Jamestown Café", "Accra", "place", 5.5390, -0.2110, "Jamestown", ["specialty-coffee", "art", "heritage", "community", "walkable"], 1, "community"],
  ["gh-acc-mix", "The Mix Design Hub", "Accra", "place", 5.6300, -0.1800, "Osu", ["design", "community", "coworking", "coffee"], 2, "discovery"],
  ["gh-acc-makola", "Makola Market", "Accra", "place", 5.5480, -0.2070, "Central", ["market", "textiles", "street-food", "community", "diaspora"], 1, "comfort"],
  ["gh-acc-labadi", "Labadi Beach", "Accra", "place", 5.5560, -0.1450, "Labadi", ["beach", "community", "family", "music", "street-food"], 1, "community"],
  ["gh-acc-vidya", "Vidya Bookstore", "Accra", "place", 5.6350, -0.1700, "Osu", ["books", "independent", "art", "quiet"], 1, "comfort"],
  ["gh-acc-sky", "Sky Bar 25", "Accra", "place", 5.5680, -0.1870, "Airport City", ["cocktails", "views", "lively", "late-night"], 3, "discovery"],
  ["gh-acc-lavilla", "La Villa Boutique", "Accra", "dining", 5.5900, -0.1900, "Kokomlemle", ["west-african", "continental", "small-plates", "garden", "step-free"], 3, "discovery"],
  ["gh-acc-du", "W.E.B. Du Bois Centre", "Accra", "place", 5.5650, -0.1950, "Cantonments", ["heritage", "community", "art", "quiet"], 1, "discovery"],
  ["gh-acc-oxford", "Osu Oxford Street", "Accra", "place", 5.5590, -0.1750, "Osu", ["market", "nightlife", "street-food", "lively", "walkable"], 1, "discovery"],
  ["gh-acc-beachclub", "Sandbox Beach Club", "Accra", "place", 5.5500, -0.1500, "Labadi", ["beach", "music", "community", "lively", "family"], 2, "community"],

  // ----------------------------------------------------------------- Lisbon
  ["pt-lis-lx", "LX Factory", "Lisbon", "place", 38.7030, -9.1780, "Alcântara", ["design", "market", "creative", "community", "street-food"], 2, "comfort"],
  ["pt-lis-pink", "Pink Street, Cais do Sodré", "Lisbon", "place", 38.7070, -9.1450, "Cais do Sodré", ["nightlife", "dance", "late-night", "lively", "cocktails"], 2, "community"],
  ["pt-lis-timeout", "Time Out Market", "Lisbon", "place", 38.7070, -9.1450, "Cais do Sodré", ["market", "food", "community", "walkable"], 2, "comfort"],
  ["pt-lis-fado", "Clube de Fado", "Lisbon", "place", 38.7110, -9.1320, "Alfama", ["fado", "live-music", "heritage", "quiet", "intimate"], 3, "comfort"],
  ["pt-lis-ler", "Ler Devagar", "Lisbon", "place", 38.7030, -9.1780, "Alcântara", ["books", "design", "creative", "quiet"], 1, "comfort"],
  ["pt-lis-graca", "Miradouro da Graça", "Lisbon", "place", 38.7170, -9.1310, "Graça", ["views", "quiet", "community", "walkable"], 1, "community"],
  ["pt-lis-carcavelos", "Praia de Carcavelos", "Lisbon", "place", 38.6790, -9.3350, "Carcavelos", ["beach", "surf", "family", "accessible"], 1, "discovery"],
  ["pt-lis-coph", "Copenhagen Coffee Lab", "Lisbon", "place", 38.7150, -9.1400, "Baixa", ["specialty-coffee", "third-wave", "quiet", "design"], 2, "comfort"],
  ["pt-lis-sao", "Cinema São Jorge", "Lisbon", "place", 38.7190, -9.1440, "Avenida", ["arthouse", "cinema", "heritage", "community"], 2, "comfort"],
  ["pt-lis-arroios", "Mercado de Arroios", "Lisbon", "place", 38.7320, -9.1340, "Arroios", ["market", "street-food", "community", "walkable"], 1, "discovery"],
  ["pt-lis-amor", "Pensão Amor", "Lisbon", "place", 38.7080, -9.1430, "Cais do Sodré", ["cocktails", "late-night", "literary", "lively", "intimate"], 2, "discovery"],
  ["pt-lis-ladra", "Feira da Ladra", "Lisbon", "place", 38.7160, -9.1250, "Alfama", ["vintage", "market", "community", "walkable"], 1, "discovery"],

  // ----------------------------------------------------------------- London
  ["gb-lon-dishoom", "Dishoom Shoreditch", "London", "dining", 51.5240, -0.0780, "Shoreditch", ["indian", "brunch", "small-plates", "step-free", "family"], 2, "comfort"],
  ["gb-lon-roughtrade", "Rough Trade East", "London", "place", 51.5190, -0.0760, "Shoreditch", ["vinyl", "records", "independent", "music"], 2, "comfort"],
  ["gb-lon-fabric", "fabric", "London", "place", 51.5210, -0.1080, "Farringdon", ["electronic", "techno", "late-night", "club", "dance", "lively"], 3, "community"],
  ["gb-lon-borough", "Borough Market", "London", "place", 51.5055, -0.0910, "Southwark", ["market", "food", "street-food", "community", "walkable"], 2, "comfort"],
  ["gb-lon-barbican", "Barbican Centre", "London", "place", 51.5200, -0.0940, "Barbican", ["art", "cinema", "community", "design", "accessible"], 2, "community"],
  ["gb-lon-boxpark", "Boxpark Shoreditch", "London", "place", 51.5230, -0.0760, "Shoreditch", ["street-food", "community", "lively", "music"], 2, "community"],
  ["gb-lon-daunt", "Daunt Books Marylebone", "London", "place", 51.5180, -0.1520, "Marylebone", ["books", "independent", "heritage", "quiet"], 2, "comfort"],
  ["gb-lon-heath", "Hampstead Heath", "London", "place", 51.5620, -0.1650, "Hampstead", ["park", "quiet", "family", "walkable", "accessible"], 1, "discovery"],
  ["gb-lon-portobello", "Portobello Road Market", "London", "place", 51.5170, -0.2060, "Notting Hill", ["vintage", "market", "community", "walkable"], 1, "discovery"],
  ["gb-lon-jazz", "Ronnie Scott's Jazz Club", "London", "place", 51.5140, -0.1340, "Soho", ["jazz", "live-music", "late-night", "intimate", "lively"], 3, "comfort"],
  ["gb-lon-coffee", "Ozone Coffee Roasters", "London", "place", 51.5280, -0.0780, "Shoreditch", ["specialty-coffee", "third-wave", "design"], 2, "discovery"],
  ["gb-lon-soho", "Soho Theatre", "London", "place", 51.5140, -0.1330, "Soho", ["comedy", "theatre", "arthouse", "community"], 2, "discovery"],
];

export const PLACES: CatalogPlace[] = PLACE_ROWS.map(
  ([id, name, city, type, lat, lon, neighbourhood, tags, price, bucket]) => ({
    id,
    name,
    city,
    type,
    tags,
    coords: { lat, lon },
    neighbourhood,
    price: price as 1 | 2 | 3 | 4,
    bucket,
  }),
);

/** Cross-domain flavour: artists, films and brands that carry a city's taste. */
export const CROSS_DOMAIN: Array<{
  id: string;
  name: string;
  city: string;
  type: EntityType;
  tags: string[];
}> = [
  { id: "ar-burna", name: "Burna Boy", city: "Lagos", type: "artist", tags: ["afrobeats", "dance", "diaspora"] },
  { id: "ar-fela", name: "Fela Kuti", city: "Lagos", type: "artist", tags: ["afrobeat", "live-music", "heritage"] },
  { id: "ar-ayra", name: "Ayra Starr", city: "Lagos", type: "artist", tags: ["afrobeats", "pop"] },
  { id: "ar-newjeans", name: "NewJeans", city: "Seoul", type: "artist", tags: ["pop", "electronic", "design"] },
  { id: "ar-idles", name: "(G)I-DLE", city: "Seoul", type: "artist", tags: ["pop", "dance"] },
  { id: "ar-sarkodie", name: "Sarkodie", city: "Accra", type: "artist", tags: ["hiplife", "hip-hop", "diaspora"] },
  { id: "ar-ambolley", name: "Gyedu-Blay Ambolley", city: "Accra", type: "artist", tags: ["highlife", "jazz", "heritage"] },
  { id: "ar-amalia", name: "Amália Rodrigues", city: "Lisbon", type: "artist", tags: ["fado", "heritage", "intimate"] },
  { id: "fl-parasite", name: "Parasite", city: "Seoul", type: "film", tags: ["arthouse", "cinema", "social-realism"] },
  { id: "fl-burning", name: "Burning", city: "Seoul", type: "film", tags: ["arthouse", "cinema", "mystery"] },
  { id: "fl-tabu", name: "Tabu", city: "Lisbon", type: "film", tags: ["arthouse", "cinema", "heritage"] },
  { id: "fl-atlantics", name: "Atlantics", city: "Dakar", type: "film", tags: ["arthouse", "cinema", "diaspora"] },
  { id: "br-voj", name: "Voices of Jamaica", city: "London", type: "brand", tags: ["reggae", "diaspora", "music"] },
  { id: "br-ape", name: "A.P.C.", city: "Berlin", type: "brand", tags: ["design", "minimal", "independent"] },
];

/** Searchable anchors used by the entity-resolution step. */
export const ANCHORS: Anchor[] = [
  { id: "an-afrobeats-bar", name: "Afrobeats night at a Victoria Island bar", type: "place", tags: ["afrobeats", "dance", "late-night"], city: "Lagos" },
  { id: "an-freedom-park", name: "Freedom Park Lagos", type: "place", tags: ["live-music", "community", "heritage"], city: "Lagos" },
  { id: "an-terra-kulture", name: "Terra Kulture", type: "place", tags: ["art", "community", "theatre"], city: "Lagos" },
  { id: "an-nike-art", name: "Nike Art Gallery", type: "place", tags: ["art", "gallery", "heritage"], city: "Lagos" },
  { id: "an-suya", name: "Suya spot in Ikeja", type: "dining", tags: ["street-food", "grilled", "late-night"], city: "Lagos" },
  { id: "an-lagos-island", name: "Lagos Island night market", type: "place", tags: ["market", "street-food", "community"], city: "Lagos" },
  { id: "an-hongdae-vinyl", name: "Hongdae vinyl bar", type: "place", tags: ["vinyl", "electronic", "late-night"], city: "Seoul" },
  { id: "an-euljiro-cafe", name: "Euljiro loft cafe", type: "place", tags: ["specialty-coffee", "design", "quiet"], city: "Seoul" },
  { id: "an-gwangjang", name: "Gwangjang Market food alley", type: "place", tags: ["market", "street-food", "community"], city: "Seoul" },
  { id: "an-bukchon", name: "Bukchon Hanok Village", type: "place", tags: ["heritage", "quiet", "design"], city: "Seoul" },
  { id: "an-seongsu", name: "Seongsu-dong design district", type: "place", tags: ["design", "art", "creative"], city: "Seoul" },
  { id: "an-233", name: "+233 Jazz Bar & Grill", type: "place", tags: ["jazz", "highlife", "live-music"], city: "Accra" },
  { id: "an-makola", name: "Makola Market", type: "place", tags: ["market", "textiles", "community"], city: "Accra" },
  { id: "an-jamestown", name: "Jamestown Café", type: "place", tags: ["specialty-coffee", "art", "community"], city: "Accra" },
  { id: "an-labadi", name: "Labadi Beach", type: "place", tags: ["beach", "community", "music"], city: "Accra" },
  { id: "an-nubuke", name: "Nubuke Foundation", type: "place", tags: ["art", "gallery", "community"], city: "Accra" },
  { id: "an-lx", name: "LX Factory", type: "place", tags: ["design", "market", "creative"], city: "Lisbon" },
  { id: "an-fado", name: "Fado house in Alfama", type: "place", tags: ["fado", "live-music", "intimate"], city: "Lisbon" },
  { id: "an-feiradaladra", name: "Feira da Ladra flea market", type: "place", tags: ["vintage", "market", "community"], city: "Lisbon" },
  { id: "an-berliner", name: "Berlin underground techno club", type: "place", tags: ["techno", "electronic", "late-night"], city: "Berlin" },
  { id: "an-recordshop", name: "Independent record shop", type: "place", tags: ["vinyl", "records", "independent"], city: "" },
  { id: "an-arthouse", name: "Arthouse cinema", type: "place", tags: ["arthouse", "cinema", "independent"], city: "" },
  { id: "an-thirdwave", name: "Third-wave coffee bar", type: "dining", tags: ["specialty-coffee", "third-wave", "quiet"], city: "" },
  { id: "an-bookshop", name: "Independent bookshop", type: "place", tags: ["books", "independent", "quiet"], city: "" },
  { id: "an-park", name: "Big city park", type: "place", tags: ["park", "quiet", "walkable"], city: "" },
  { id: "an-house", name: "Late-night house music", type: "artist", tags: ["electronic", "dance", "late-night"], city: "" },
  { id: "an-korean-bbq", name: "Korean BBQ with friends", type: "dining", tags: ["korean-bbq", "small-plates", "lively"], city: "Seoul" },
  { id: "an-indie-radio", name: "Indie radio show", type: "artist", tags: ["independent", "music", "electronic"], city: "" },
];

/** Destination neighbourhood glossary. */
export const NEIGHBOURHOODS: Record<
  string,
  Array<{ id: string; name: string; coords: Coords; highlights: string[]; blurb: string }>
> = {
  Toronto: [
    { id: "hood-tor-kensington", name: "Kensington Market", coords: { lat: 43.6544, lon: -79.4019 }, highlights: ["market", "vintage", "street-food"], blurb: "Caribbean, Latin and counterculture food stalls pressed together — the quickest route to feeling local." },
    { id: "hood-tor-parkdale", name: "Parkdale", coords: { lat: 43.6453, lon: -79.4187 }, highlights: ["afrobeats", "vinyl", "late-night"], blurb: "Where Toronto's West African and Caribbean nightlife actually happens, records included." },
    { id: "hood-tor-littleitaly", name: "Little Italy", coords: { lat: 43.6475, lon: -79.4066 }, highlights: ["cocktails", "small-plates", "design"], blurb: "Late, warm and walkable — good for a first solo Friday back out in the world." },
    { id: "hood-tor-york", name: "Little Jamaica (York)", coords: { lat: 43.697, lon: -79.445 }, highlights: ["reggae", "caribbean", "community"], blurb: "Eglinton West's reggae strip: patties, sound systems and the closest thing to home cooking." },
  ],
  Berlin: [
    { id: "hood-ber-kreuzberg", name: "Kreuzberg", coords: { lat: 52.499, lon: 13.418 }, highlights: ["market", "techno", "community"], blurb: "Turkish markets by day, the loudest rooms in Europe by night. Dead centre of Berlin's social life." },
    { id: "hood-ber-neukolln", name: "Neukölln", coords: { lat: 52.4876, lon: 13.4266 }, highlights: ["vinyl", "coffee", "late-night"], blurb: "Where record shops, canals and second-gen food meet. Good for building a small circle fast." },
    { id: "hood-ber-mitte", name: "Mitte", coords: { lat: 52.5296, lon: 13.4013 }, highlights: ["design", "coffee", "art"], blurb: "Quiet, designed and central — for the days you want calm and a good coffee, not a queue." },
    { id: "hood-ber-prenzlauer", name: "Prenzlauer Berg", coords: { lat: 52.541, lon: 13.402 }, highlights: ["vintage", "family", "market"], blurb: "Gentle, green, market-and-fleamarket rhythm. The softer version of Berlin." },
  ],
  Accra: [
    { id: "hood-acc-osu", name: "Osu", coords: { lat: 5.559, lon: -0.175 }, highlights: ["nightlife", "design", "market"], blurb: "Accra's main street for food, music and people-watching — start here on a Friday." },
    { id: "hood-acc-jamestown", name: "Jamestown", coords: { lat: 5.539, lon: -0.211 }, highlights: ["heritage", "coffee", "art"], blurb: "The old colonial port turned creative quarter. Galleries, boxing gyms and the best light in the city." },
    { id: "hood-acc-cantonments", name: "Cantonments", coords: { lat: 5.57, lon: -0.19 }, highlights: ["jazz", "dining", "quiet"], blurb: "Calmer, greener and where live highlife and jazz still play properly." },
    { id: "hood-acc-labadi", name: "Labadi", coords: { lat: 5.556, lon: -0.145 }, highlights: ["beach", "music", "community"], blurb: "Beach, drums and Sunday crowds. The Accra you remember from visits home." },
  ],
  Lisbon: [
    { id: "hood-lis-alcantara", name: "Alcântara", coords: { lat: 38.703, lon: -9.178 }, highlights: ["design", "market", "creative"], blurb: "LX Factory's creative sprawl: bookshops, studios and street food under the bridge." },
    { id: "hood-lis-cais", name: "Cais do Sodré", coords: { lat: 38.707, lon: -9.145 }, highlights: ["nightlife", "market", "late-night"], blurb: "Pink Street's bar-and-market energy. Loud, social and easy to meet people." },
    { id: "hood-lis-alfama", name: "Alfama", coords: { lat: 38.711, lon: -9.132 }, highlights: ["fado", "heritage", "vintage"], blurb: "Fado, tiled alleys and weekend flea markets — the city's memory, up on a hill." },
    { id: "hood-lis-graca", name: "Graça", coords: { lat: 38.717, lon: -9.131 }, highlights: ["views", "quiet", "community"], blurb: "Viewpoints, local tascas and neighbours who talk to you. The softest landing in Lisbon." },
  ],
  London: [
    { id: "hood-lon-shoreditch", name: "Shoreditch", coords: { lat: 51.524, lon: -0.078 }, highlights: ["vinyl", "street-food", "nightlife"], blurb: "Records, boxparks and late bars. Where new arrivals cluster first." },
    { id: "hood-lon-soho", name: "Soho", coords: { lat: 51.514, lon: -0.134 }, highlights: ["jazz", "theatre", "late-night"], blurb: "Jazz cellars, small theatres and coffee — walkable and reliably alive." },
    { id: "hood-lon-southwark", name: "Southwark", coords: { lat: 51.5055, lon: -0.091 }, highlights: ["market", "food", "community"], blurb: "Borough Market mornings, riverside evenings. Good food is never far." },
    { id: "hood-lis-notting", name: "Notting Hill", coords: { lat: 51.517, lon: -0.206 }, highlights: ["vintage", "market", "community"], blurb: "Portobello antiques and a real neighbourhood feel on the west side." },
  ],
};

/** Curated personas so a judge reaches a real result with zero typing. */
export const DEMO_PERSONAS: Array<{
  id: string;
  name: string;
  origin: string;
  destination: string;
  blurb: string;
  anchorIds: string[];
  prefs: { familiarity: number; vibe: "quiet" | "balanced" | "lively"; budget: "low" | "mid" | "high"; who: "solo" | "couple" | "group" };
}> = [
  {
    id: "persona-lagos-toronto",
    name: "Adaeze",
    origin: "Lagos",
    destination: "Toronto",
    blurb: "MSc student leaving Lagos for Toronto in September. Wants the music and the food first.",
    anchorIds: ["an-afrobeats-bar", "an-suya", "an-freedom-park", "an-terra-kulture", "an-lagos-island"],
    prefs: { familiarity: 0.55, vibe: "lively", budget: "low", who: "solo" },
  },
  {
    id: "persona-seoul-berlin",
    name: "Ji-woo",
    origin: "Seoul",
    destination: "Berlin",
    blurb: "Product designer moving for a studio job. Trade a Hongdae night for Berlin's equivalent.",
    anchorIds: ["an-hongdae-vinyl", "an-euljiro-cafe", "an-seongsu", "an-gwangjang"],
    prefs: { familiarity: 0.42, vibe: "balanced", budget: "mid", who: "solo" },
  },
  {
    id: "persona-return-accra",
    name: "Kwame",
    origin: "London",
    destination: "Accra",
    blurb: "Returning to Accra after a decade in London. Relearning the city as a resident, not a visitor.",
    anchorIds: ["an-233", "an-nubuke", "an-jamestown", "an-makola"],
    prefs: { familiarity: 0.6, vibe: "balanced", budget: "mid", who: "couple" },
  },
];

export function getCityPlaces(city: string): CatalogPlace[] {
  return PLACES.filter((p) => p.city === city);
}

export function buildAnchorRefs(anchorIds: string[]): EntityRef[] {
  return anchorIds
    .map((id) => ANCHORS.find((a) => a.id === id))
    .filter((a): a is Anchor => Boolean(a))
    .map((a) => ({ id: a.id, name: a.name, type: a.type, tags: a.tags }));
}
