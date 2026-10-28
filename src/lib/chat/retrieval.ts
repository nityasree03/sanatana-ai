import "server-only";
import type { CompanionId } from "@/lib/companions";
import { searchScripture } from "@/lib/scripture/search";
import type { Passage } from "@/lib/scripture/types";

/**
 * Passages for one chat turn: first from the chosen companion's own texts, then the best matches
 * from the whole library, with teaching passages preferred for personal questions. At most two
 * passages per chapter, so one long story does not crowd out everything else.
 */
export function chatPassages(opts: {
  query: string;
  vector?: number[];
  companion: CompanionId;
  total?: number;
}): Passage[] {
  const total = opts.total ?? 6;
  const common = { query: opts.query, vector: opts.vector, teachingPreference: "auto" as const };
  const own = searchScripture({ ...common, companion: opts.companion, limit: 12 });
  const all = searchScripture({ ...common, limit: 12 });
  const picked: Passage[] = [];
  const perSection = new Map<string, number>();
  const take = (p: Passage) => {
    if (picked.length >= total || picked.some((x) => x.id === p.id)) return;
    const key = `${p.work_id}|${p.section}`;
    if ((perSection.get(key) ?? 0) >= 2) return;
    perSection.set(key, (perSection.get(key) ?? 0) + 1);
    picked.push(p);
  };
  own.slice(0, 8).forEach((h, i) => i < 4 && take(h.passage));
  all.forEach((h) => take(h.passage));
  own.forEach((h) => take(h.passage));
  return picked;
}

/** The text to search with: the latest message, plus the previous one if the latest is a short follow-up. */
export function searchTextFor(userMessages: string[]): string {
  const last = userMessages.at(-1) ?? "";
  if (last.split(/\s+/).length >= 6 || userMessages.length < 2) return last;
  return `${userMessages.at(-2)} ${last}`;
}
