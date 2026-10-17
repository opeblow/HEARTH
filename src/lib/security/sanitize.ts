/**
 * Free-text hygiene. Runs before any user text reaches the LLM, and wraps
 * untrusted text so the model treats it as data, never as instructions.
 */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/g;
const LONG_DIGITS_RE = /\b\d{6,}\b/g;

export function scrubFreeText(input: string): string {
  return input
    .replace(EMAIL_RE, "[email]")
    .replace(PHONE_RE, "[number]")
    .replace(LONG_DIGITS_RE, "[number]")
    .slice(0, 500);
}

const INJECTION_PATTERNS = [
  /ignore\s+(?:all|any|the|previous|above|\s)+instructions/i,
  /disregard (the )?(system|previous)/i,
  /reveal (your )?(system )?prompt/i,
  /print (your )?(api )?key/i,
  /you are now/i,
  /act as/i,
  /developer mode/i,
  /\bsystem\s*:/i,
];

export function looksLikeInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(input));
}

export function wrapUntrusted(label: string, text: string): string {
  const safe = scrubFreeText(text).replace(/[`*_#<>]/g, "");
  return `<data source="${label}">\n${safe}\n</data>`;
}

/** Basic entity id shape guard for anything crossing a boundary. */
export function isEntityId(value: string): boolean {
  return /^[a-z]{2}-[a-z]{3}-[a-z0-9-]{2,40}$/i.test(value) || /^[a-z]{2}-[a-z0-9-]{2,40}$/i.test(value);
}

export function normaliseCity(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s'.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}
