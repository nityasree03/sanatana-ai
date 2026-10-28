// Scripture retrieval evaluation. Run with: npm run eval:scripture
// Writes results.json next to this file. Numbers come only from running this script.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { EMBEDDINGS, PASSAGES } from "@/lib/scripture/data";
import { searchScripture } from "@/lib/scripture/search";
import { cosineAll, decodeVectors } from "@/lib/scripture/vectors";
import main from "./queries.json";
import heldout from "./heldout.json";
import vectors from "./query_vectors.json";

type Mode = "keyword" | "keyword+teaching" | "meaning" | "hybrid" | "hybrid+teaching";
const K = 5;
const decoded = decodeVectors(EMBEDDINGS);

function rank(mode: Mode, query: string, vector: number[]): string[] {
  if (mode === "meaning") {
    const s = cosineAll(vector, decoded, EMBEDDINGS.dims, EMBEDDINGS.scale);
    return [...s.keys()]
      .sort((a, b) => s[b] - s[a])
      .slice(0, 10)
      .map((i) => PASSAGES[i].id);
  }
  const hits = searchScripture({
    query,
    vector: mode.startsWith("keyword") ? undefined : vector,
    limit: 10,
    teachingPreference: mode.endsWith("+teaching") ? "auto" : "off",
  });
  return hits.map((h) => h.passage.id);
}

function evaluate(set: typeof main, outName: string) {
  const modes: Mode[] = ["keyword", "keyword+teaching", "meaning", "hybrid", "hybrid+teaching"];
  const perQuery: Record<string, Record<Mode, { top5: string[]; recall: number; rr: number }>> = {};
  const summary: Record<
    string,
    Record<Mode, { recallAt5: number; hitAt5: number; mrrAt10: number }>
  > = {};

  for (const q of set.queries) {
    const vec = (vectors as Record<string, number[]>)[q.id];
    expect(vec, q.id).toHaveLength(EMBEDDINGS.dims);
    perQuery[q.id] = {} as never;
    for (const mode of modes) {
      const ranked = rank(mode, q.query, vec);
      const rel = new Set(q.relevant);
      const found = ranked.slice(0, K).filter((id) => rel.has(id)).length;
      const first = ranked.findIndex((id) => rel.has(id));
      perQuery[q.id][mode] = {
        top5: ranked.slice(0, K),
        recall: found / Math.min(rel.size, K),
        rr: first === -1 ? 0 : 1 / (first + 1),
      };
    }
  }

  for (const group of ["all", "life", "topic"]) {
    const qs = set.queries.filter((q) => group === "all" || q.style === group);
    summary[group] = {} as never;
    for (const mode of modes) {
      const r = qs.map((q) => perQuery[q.id][mode]);
      const avg = (f: (x: (typeof r)[number]) => number) =>
        Number((r.reduce((s, x) => s + f(x), 0) / r.length).toFixed(3));
      summary[group][mode] = {
        recallAt5: avg((x) => x.recall),
        hitAt5: avg((x) => (x.recall > 0 ? 1 : 0)),
        mrrAt10: avg((x) => x.rr),
      };
    }
  }

  const out = {
    ranAt: new Date().toISOString(),
    datasetVersion: set.version,
    queries: set.queries.length,
    passages: PASSAGES.length,
    model: EMBEDDINGS.model,
    definitions: {
      recallAt5: "share of a query's relevant passages (capped at 5) found in the top 5, averaged",
      hitAt5: "share of queries with at least one relevant passage in the top 5",
      mrrAt10: "mean of 1/rank of the first relevant passage in the top 10 (0 if none)",
    },
    summary,
    perQuery,
  };
  writeFileSync(join(__dirname, outName), JSON.stringify(out, null, 2) + "\n");
  console.table(
    Object.fromEntries(
      Object.entries(summary).flatMap(([g, m]) =>
        Object.entries(m).map(([mode, v]) => [`${g}/${mode}`, v]),
      ),
    ),
  );
}

test("scripture retrieval metrics (main set)", () => evaluate(main, "results.json"));
test("scripture retrieval metrics (held-out set)", () =>
  evaluate(heldout as typeof main, "results-heldout.json"));
