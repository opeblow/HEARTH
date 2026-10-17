"use client";

import type { Profile, RunResult } from "@/lib/domain";

/**
 * Device-local storage. The profile lives in IndexedDB and never leaves the
 * device; the last run is kept in sessionStorage so a refresh on /bridge still
 * works. Nothing here is ever sent to the server.
 */

const DB_NAME = "hearth-db";
const STORE = "kv";
const PROFILE_KEY = "profile";
const TOKENS_KEY = "share-tokens";
const RUN_KEY = "hearth:run";

function hasIdb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  if (!hasIdb()) return null;
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: unknown): Promise<void> {
  if (!hasIdb()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

async function idbClear(): Promise<void> {
  if (!hasIdb()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await idbSet(PROFILE_KEY, profile);
}

export async function loadProfile(): Promise<Profile | null> {
  return idbGet<Profile>(PROFILE_KEY);
}

export async function saveShareToken(id: string, token: string): Promise<void> {
  const tokens = (await idbGet<Record<string, string>>(TOKENS_KEY)) ?? {};
  tokens[id] = token;
  await idbSet(TOKENS_KEY, tokens);
}

export async function listShareTokens(): Promise<Record<string, string>> {
  return (await idbGet<Record<string, string>>(TOKENS_KEY)) ?? {};
}

export function saveRun(run: RunResult): void {
  try {
    sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
  } catch {
    /* ignore */
  }
}

export function loadRun(): RunResult | null {
  try {
    const raw = sessionStorage.getItem(RUN_KEY);
    return raw ? (JSON.parse(raw) as RunResult) : null;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  try {
    sessionStorage.removeItem(RUN_KEY);
  } catch {
    /* ignore */
  }
}

export async function deleteEverything(): Promise<void> {
  await idbClear();
  try {
    sessionStorage.removeItem(RUN_KEY);
    localStorage.removeItem("hearth.theme");
  } catch {
    /* ignore */
  }
}
