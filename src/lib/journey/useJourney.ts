"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_JOURNEY } from "./schema";
import { JOURNEY_KEY, loadJourney, subscribe, type LoadResult } from "./store";

const SERVER: LoadResult = { journey: EMPTY_JOURNEY, damaged: false };
let cachedRaw: string | null | undefined;
let cached: LoadResult = SERVER;

function snapshot(): LoadResult {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(JOURNEY_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = loadJourney();
  }
  return cached;
}

/**
 * The person's saved journey, kept in sync with localStorage (also across tabs).
 * `ready` is false during server rendering and the first client render, so pages can avoid
 * flashing "nothing saved" before the browser data is read.
 */
export function useJourney(): LoadResult & { ready: boolean } {
  const result = useSyncExternalStore(subscribe, snapshot, () => SERVER);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return { ...result, ready };
}
