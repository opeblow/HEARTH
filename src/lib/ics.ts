import type { Place, PlanItem } from "@/lib/domain";

/**
 * Generates a calendar file locally — nothing about the plan leaves the device
 * unless the user chooses to export it.
 */
export function buildIcs({
  plan,
  places,
  destination,
  uidPrefix = "hearth",
}: {
  plan: PlanItem[];
  places: Place[];
  destination: string;
  uidPrefix?: string;
}): string {
  const byId = new Map(places.map((p) => [p.entityId, p]));
  const start = new Date();
  start.setHours(18, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hearth//Soft Landing//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  plan.forEach((item, index) => {
    const eventStart = new Date(start);
    eventStart.setDate(start.getDate() + item.week * 7);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventEnd.getHours() + 2);

    const firstPlace = item.placeIds.map((id) => byId.get(id)).find(Boolean);
    const location = firstPlace
      ? `${firstPlace.name}${firstPlace.neighbourhood ? `, ${firstPlace.neighbourhood}` : ""}, ${destination}`
      : destination;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uidPrefix}-w${item.week}-${index}@hearth.app`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(eventStart)}`,
      `DTEND:${stamp(eventEnd)}`,
      `SUMMARY:${escapeIcs(`Hearth · ${item.theme}: ${item.title}`)}`,
      `DESCRIPTION:${escapeIcs(item.description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
