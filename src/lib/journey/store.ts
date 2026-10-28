import {
  EMPTY_JOURNEY,
  ExportSchema,
  JourneySchema,
  type Goal,
  type Journey,
  type JourneyExport,
  type Leaf,
  type Reflection,
  type Sankalpa,
} from "./schema";
import type { DecisionMap } from "@/lib/dharma/model";

/**
 * The browser-only journey store. Nothing is written until the person opts in (enabled = true).
 * Data never leaves the device unless the person exports it or chooses to send a piece to a
 * companion in the chat.
 */

export const JOURNEY_KEY = "sanatana-journey";
const CHANGE_EVENT = "sanatana-journey-change";

export type Collection = "goals" | "leaves" | "reflections" | "sankalpas" | "decisions";
type ItemOf<C extends Collection> = C extends "goals"
  ? Goal
  : C extends "leaves"
    ? Leaf
    : C extends "reflections"
      ? Reflection
      : C extends "sankalpas"
        ? Sankalpa
        : DecisionMap;

export interface LoadResult {
  journey: Journey;
  /** True when stored data could not be read (it is left untouched until the person acts). */
  damaged: boolean;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function storageAvailable(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem("sanatana-probe", "1");
    s.removeItem("sanatana-probe");
    return true;
  } catch {
    return false;
  }
}

export function loadJourney(): LoadResult {
  const raw = storage()?.getItem(JOURNEY_KEY);
  if (!raw) return { journey: EMPTY_JOURNEY, damaged: false };
  try {
    const parsed = JourneySchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { journey: parsed.data, damaged: false };
  } catch {
    // fall through
  }
  return { journey: EMPTY_JOURNEY, damaged: true };
}

function write(j: Journey | null) {
  const s = storage();
  if (!s) throw new Error("This browser is not letting the site save data.");
  if (j === null) s.removeItem(JOURNEY_KEY);
  else s.setItem(JOURNEY_KEY, JSON.stringify(JourneySchema.parse(j)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to changes from this tab and other tabs. */
export function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === JOURNEY_KEY || e.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function now(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Local calendar date, e.g. "2026-10-28" (not UTC, so "today" matches the person's day). */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ---------------- Consent ---------------- */

export function enableSaving() {
  const { journey, damaged } = loadJourney();
  if (damaged) throw new Error("Saved data could not be read. Delete it first.");
  write({ ...journey, enabled: true });
}

/** Turn saving off. Either delete everything, or keep it on the device (read-only). */
export function disableSaving(keepData: boolean) {
  if (!keepData) return write(null);
  const { journey } = loadJourney();
  write({ ...journey, enabled: false });
}

export function deleteEverything() {
  write(null);
}

/* ---------------- Items ---------------- */

function requireEnabled(): Journey {
  const { journey, damaged } = loadJourney();
  if (damaged) throw new Error("Saved data could not be read.");
  if (!journey.enabled) throw new Error("Saving is turned off. Turn it on to save.");
  return journey;
}

export function addItem<C extends Collection>(
  collection: C,
  item: Omit<ItemOf<C>, "id" | "createdAt" | "updatedAt">,
): ItemOf<C> {
  const j = requireEnabled();
  const t = now();
  const full = { ...item, id: newId(), createdAt: t, updatedAt: t } as ItemOf<C>;
  write({ ...j, [collection]: [full, ...(j[collection] as ItemOf<C>[])] });
  return full;
}

export function updateItem<C extends Collection>(
  collection: C,
  itemId: string,
  patch: Partial<Omit<ItemOf<C>, "id" | "createdAt">>,
) {
  const j = requireEnabled();
  const list = j[collection] as ItemOf<C>[];
  write({
    ...j,
    [collection]: list.map((x) => (x.id === itemId ? { ...x, ...patch, updatedAt: now() } : x)),
  });
}

export function removeItem(collection: Collection, itemId: string) {
  const j = requireEnabled();
  write({
    ...j,
    [collection]: (j[collection] as { id: string }[]).filter((x) => x.id !== itemId),
  });
}

/** Save a Dharma Lab map under its own id (insert or replace). */
export function upsertDecision(map: DecisionMap) {
  const j = requireEnabled();
  const others = j.decisions.filter((d) => d.id !== map.id);
  write({ ...j, decisions: [map, ...others] });
}

/* ---------------- Export / import ---------------- */

export function exportJourney(j: Journey = loadJourney().journey): JourneyExport {
  const { enabled: _enabled, ...data } = j;
  void _enabled;
  return { app: "sanatana-ai", kind: "journey-export", version: 1, exportedAt: now(), data };
}

export type ImportMode = "merge" | "replace";

export interface ImportSummary {
  goals: number;
  leaves: number;
  reflections: number;
  sankalpas: number;
  decisions: number;
}

/**
 * Import an exported file. "merge" keeps existing items and adds or updates by id (the newer
 * version wins); "replace" swaps everything. Invalid files are rejected without changing anything.
 */
export function importJourney(text: string, mode: ImportMode): ImportSummary {
  let parsed: JourneyExport;
  try {
    parsed = ExportSchema.parse(JSON.parse(text));
  } catch {
    throw new Error("This file isn't a Sanatana AI journey export, or it is damaged.");
  }
  const j = requireEnabled();
  const merge = <T extends { id: string; updatedAt: string }>(mine: T[], theirs: T[]): T[] => {
    if (mode === "replace") return theirs;
    const byId = new Map(mine.map((x) => [x.id, x]));
    for (const t of theirs) {
      const m = byId.get(t.id);
      if (!m || t.updatedAt > m.updatedAt) byId.set(t.id, t);
    }
    return [...byId.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  };
  const d = parsed.data;
  write({
    ...j,
    goals: merge(j.goals, d.goals),
    leaves: merge(j.leaves, d.leaves),
    reflections: merge(j.reflections, d.reflections),
    sankalpas: merge(j.sankalpas, d.sankalpas),
    decisions: merge(j.decisions, d.decisions),
  });
  return {
    goals: d.goals.length,
    leaves: d.leaves.length,
    reflections: d.reflections.length,
    sankalpas: d.sankalpas.length,
    decisions: d.decisions.length,
  };
}
