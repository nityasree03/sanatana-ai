import "server-only";
import type { CompanionId } from "@/lib/companions";
import { Bm25Index } from "./bm25";
import { EMBEDDINGS, PASSAGES } from "./data";
import type { Passage, SearchHit } from "./types";
import { cosineAll, decodeVectors } from "./vectors";

let keywordIndex: Bm25Index | null = null;
let vectorData: Int8Array | null = null;
const RRF_K = 60;
const MIN_COSINE = 0.25;

function index(): Bm25Index {
  // Title words count too, so "Sundar" or "Katha" find their passages.
  keywordIndex ??= new Bm25Index(
    PASSAGES.map((p) => `${p.work} ${p.section} ${p.translation.text}`),
  );
  return keywordIndex;
}

export interface SearchOptions {
  query: string;
  /** Optional unit-length query vector from the browser's meaning-search model. */
  vector?: number[];
  workId?: string;
  companion?: CompanionId;
  limit?: number;
}

function ranks(
  scores: Float64Array,
  allowed: (p: Passage) => boolean,
  floor: number,
): Map<number, number> {
  const order = [...scores.keys()]
    .filter((i) => scores[i] > floor && allowed(PASSAGES[i]))
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 100);
  return new Map(order.map((docIndex, rank) => [docIndex, rank]));
}

/**
 * Hybrid search: keyword (BM25) ranks and meaning (vector) ranks are merged with
 * reciprocal rank fusion, so a passage found by both methods rises to the top.
 */
export function searchScripture(opts: SearchOptions): SearchHit[] {
  const allowed = (p: Passage) =>
    (!opts.workId || p.work_id === opts.workId) &&
    (!opts.companion || p.companions.includes(opts.companion));
  const kw = ranks(index().score(opts.query), allowed, 0);
  let vec = new Map<number, number>();
  if (opts.vector && opts.vector.length === EMBEDDINGS.dims) {
    vectorData ??= decodeVectors(EMBEDDINGS);
    vec = ranks(
      cosineAll(opts.vector, vectorData, EMBEDDINGS.dims, EMBEDDINGS.scale),
      allowed,
      MIN_COSINE,
    );
  }
  const fused = new Map<number, { score: number; by: Set<"keyword" | "meaning"> }>();
  for (const [doc, rank] of kw)
    fused.set(doc, { score: 1 / (RRF_K + rank), by: new Set(["keyword"]) });
  for (const [doc, rank] of vec) {
    const cur = fused.get(doc) ?? { score: 0, by: new Set() };
    cur.score += 1 / (RRF_K + rank);
    cur.by.add("meaning");
    fused.set(doc, cur);
  }
  return [...fused]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, opts.limit ?? 10)
    .map(([doc, v]) => ({
      passage: PASSAGES[doc],
      score: Number(v.score.toFixed(5)),
      matchedBy: [...v.by],
    }));
}
