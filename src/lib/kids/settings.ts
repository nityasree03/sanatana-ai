import { z } from "zod";
import { AGE_RANGES } from "./types";

/**
 * Caregiver settings live only for this browser tab (sessionStorage), so a shared device starts
 * fresh. Progress is off by default; when the caregiver turns it on, only the ids of finished
 * stories are kept in this browser. No names, ages or answers are stored.
 */
export const SESSION_KEY = "sanatana-kids-session";
export const PROGRESS_KEY = "sanatana-kids-progress";

export const RATES = [
  { value: 0.75, label: "Slow" },
  { value: 0.9, label: "Normal" },
  { value: 1.05, label: "Quick" },
] as const;

export const BREAKS = [0, 15, 30] as const;

export const SettingsSchema = z.object({
  age: z.enum(AGE_RANGES),
  narration: z.boolean(),
  rate: z.union([z.literal(0.75), z.literal(0.9), z.literal(1.05)]),
  activities: z.boolean(),
  breakAfter: z.union([z.literal(0), z.literal(15), z.literal(30)]),
});
export type KidsSettings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Omit<KidsSettings, "age"> = {
  narration: true,
  rate: 0.9,
  activities: true,
  breakAfter: 0,
};

const ProgressSchema = z.object({
  version: z.literal(1),
  finished: z.array(z.string().max(60)).max(50),
});

function store(kind: "session" | "local"): Storage | null {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function readJson(s: Storage | null, key: string): unknown {
  try {
    const raw = s?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadSettings(): KidsSettings | null {
  const parsed = SettingsSchema.safeParse(readJson(store("session"), SESSION_KEY));
  return parsed.success ? parsed.data : null;
}

export function saveSettings(settings: KidsSettings): void {
  try {
    store("session")?.setItem(SESSION_KEY, JSON.stringify(SettingsSchema.parse(settings)));
  } catch {
    /* settings still work for this page */
  }
}

export function clearSettings(): void {
  try {
    store("session")?.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Finished story ids, or null when progress is not being kept. */
export function loadProgress(): string[] | null {
  const parsed = ProgressSchema.safeParse(readJson(store("local"), PROGRESS_KEY));
  return parsed.success ? parsed.data.finished : null;
}

export function startProgress(): string[] {
  writeProgress([]);
  return [];
}

export function markFinished(storyId: string): string[] | null {
  const current = loadProgress();
  if (current === null) return null; // not kept: write nothing
  const next = current.includes(storyId) ? current : [...current, storyId];
  writeProgress(next);
  return next;
}

/** Stop keeping progress and remove what was kept. */
export function deleteProgress(): void {
  try {
    store("local")?.removeItem(PROGRESS_KEY);
  } catch {
    /* nothing to delete */
  }
}

function writeProgress(finished: string[]) {
  try {
    store("local")?.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, finished }));
  } catch {
    /* storage full or blocked: progress simply isn't kept */
  }
}
