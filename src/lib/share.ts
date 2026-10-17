import "server-only";
import type { ShareCard } from "@/lib/domain";
import { cacheDelete, cacheGet, cacheSet } from "@/lib/qloo/cache";

/**
 * Share cards. Unguessable id, 30-day TTL, whitelisted fields only (no anchors,
 * no personal notes), and a single-use delete token stored hashed.
 */

const TTL_SECONDS = 60 * 60 * 24 * 30;

function key(id: string) {
  return `share:${id}`;
}

function tokenKey(id: string) {
  return `share-token:${id}`;
}

export function randomId(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createShareCard(
  card: Omit<ShareCard, "id" | "createdAt" | "ttlSeconds">,
): Promise<{ id: string; deleteToken: string }> {
  const id = randomId();
  const deleteToken = randomId();
  const record: ShareCard = {
    id,
    title: card.title.slice(0, 80),
    destination: card.destination.slice(0, 60),
    picks: card.picks.slice(0, 8),
    createdAt: new Date().toISOString(),
    ttlSeconds: TTL_SECONDS,
  };
  await cacheSet(key(id), record, TTL_SECONDS);
  await cacheSet(tokenKey(id), await sha256Hex(deleteToken), TTL_SECONDS);
  return { id, deleteToken };
}

export async function getShareCard(id: string): Promise<ShareCard | null> {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;
  return cacheGet<ShareCard>(key(id));
}

export async function deleteShareCard(id: string, deleteToken: string): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/.test(id)) return false;
  const stored = await cacheGet<string>(tokenKey(id));
  if (!stored) return false;
  const provided = await sha256Hex(deleteToken);
  if (provided !== stored) return false;
  await cacheDelete(key(id));
  await cacheDelete(tokenKey(id));
  return true;
}
