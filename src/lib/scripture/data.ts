import "server-only";
import embeddingsJson from "@/data/scripture/embeddings.json";
import manifestJson from "@/data/scripture/manifest.json";
import passagesJson from "@/data/scripture/passages.json";
import worksJson from "@/data/scripture/works.json";
import type { Passage, Work } from "./types";
import type { EmbeddingFile } from "./vectors";

/** Scripture data produced by scripture-pipeline (server-side only; never sent whole to browsers). */
export const PASSAGES = passagesJson as unknown as Passage[];
export const WORKS = worksJson as unknown as Work[];
export const MANIFEST = manifestJson as {
  dataVersion: string;
  builtAt: string;
  passageCount: number;
};
export const EMBEDDINGS = embeddingsJson as unknown as EmbeddingFile;

const byId = new Map(PASSAGES.map((p) => [p.id, p]));

export function getPassage(id: string): Passage | undefined {
  return byId.get(id);
}

/** Works where at least one passage shows its original-language text. */
export const WORKS_WITH_ORIGINAL = new Set(
  PASSAGES.filter((p) => p.original).map((p) => p.work_id),
);

export function getWork(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id);
}

/** Passages of one section of a work, in reading order. sectionIndex is 1-based. */
export function getSectionPassages(workId: string, sectionIndex: number): Passage[] {
  const work = getWork(workId);
  const section = work?.sections[sectionIndex - 1];
  if (!section) return [];
  return PASSAGES.filter((p) => p.work_id === workId && p.section === section).sort(
    (a, b) => a.order - b.order,
  );
}

/** Every source used by any work, keyed by id (small; safe to pass to client components). */
export function sourcesById(): Record<string, import("./types").SourceInfo> {
  const out: Record<string, import("./types").SourceInfo> = {};
  for (const w of WORKS) for (const s of w.sources) out[s.id] = s;
  return out;
}

export function sectionHref(workId: string, sectionIndex: number): string {
  return `/scriptures/${workId}/${sectionIndex}`;
}

/** "work_id|section" -> chapter page URL, for linking search results to their context. */
export function sectionLinks(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const w of WORKS)
    w.sections.forEach((s, i) => (out[`${w.id}|${s}`] = sectionHref(w.id, i + 1)));
  return out;
}
