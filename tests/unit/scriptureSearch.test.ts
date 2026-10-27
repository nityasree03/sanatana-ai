// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { Bm25Index } from "@/lib/scripture/bm25";
import { PASSAGES, WORKS, getSectionPassages } from "@/lib/scripture/data";
import { searchScripture } from "@/lib/scripture/search";
import { expandQuery, normalise, tokenize } from "@/lib/scripture/text";
import { cosineAll, decodeVectors } from "@/lib/scripture/vectors";
import { isKnownScripturePath } from "@/proxy";
import fixture from "./fixtures/queryVector.json";

describe("text helpers", () => {
  it("removes accents so Besant's spellings match plain typing", () => {
    expect(normalise("Pândavas Arjuna")).toBe("pandavas arjuna");
  });
  it("drops stopwords and archaic filler words", () => {
    const tokens = tokenize("Thou art the one who doth act");
    expect(tokens).not.toContain("thou");
    expect(tokens).not.toContain("the");
    expect(tokens.length).toBeGreaterThan(0);
  });
  it("adds related words at half weight", () => {
    const expanded = expandQuery("fear");
    expect(expanded[0]).toEqual({ term: expect.any(String), weight: 1 });
    expect(expanded.some((t) => t.weight === 0.5)).toBe(true);
  });
});

describe("BM25 keyword index", () => {
  const index = new Bm25Index([
    "the monkey leapt across the ocean",
    "the ocean was calm",
    "a song about the moon",
  ]);
  it("ranks the document with more matching terms first", () => {
    const s = index.score("monkey ocean");
    expect(s[0]).toBeGreaterThan(s[1]);
    expect(s[2]).toBe(0);
  });
});

describe("vectors", () => {
  it("decodes int8 base64 vectors and computes cosine", () => {
    const vecs = new Int8Array([127, 0, 0, 127]);
    const b64 = Buffer.from(vecs.buffer).toString("base64");
    const decoded = decodeVectors({ dims: 2, scale: 127, ids: ["a", "b"], vectors: b64 } as never);
    const scores = cosineAll([1, 0], decoded, 2, 127);
    expect(scores[0]).toBeCloseTo(1, 3);
    expect(scores[1]).toBeCloseTo(0, 3);
  });
});

describe("scripture dataset", () => {
  it("has the seven works and 1341 passages", () => {
    expect(WORKS).toHaveLength(7);
    expect(PASSAGES).toHaveLength(1341);
  });
  it("returns chapter passages by 1-based index", () => {
    const ch2 = getSectionPassages("bhagavad-gita", 2);
    expect(ch2[0].id).toBe("bg-2.1");
    expect(ch2).toHaveLength(72);
  });
});

describe("searchScripture", () => {
  it("finds Hanuman's leap with keywords", () => {
    const hits = searchScripture({ query: "Hanuman leap ocean" });
    expect(hits[0].passage.work_id).toBe("valmiki-ramayana");
    expect(hits[0].matchedBy).toEqual(["keyword"]);
  });
  it("respects the work and companion filters", () => {
    const byWork = searchScripture({ query: "soul", workId: "katha-upanishad", limit: 20 });
    expect(byWork.length).toBeGreaterThan(0);
    expect(byWork.every((h) => h.passage.work_id === "katha-upanishad")).toBe(true);
    const byCompanion = searchScripture({ query: "goddess", companion: "parvati", limit: 20 });
    expect(byCompanion.every((h) => h.passage.companions.includes("parvati"))).toBe(true);
  });
  it("returns nothing for words that are not in any passage", () => {
    expect(searchScripture({ query: "smartphone wifi" })).toEqual([]);
  });
  it("uses the meaning vector when given one", () => {
    const hits = searchScripture({ query: fixture.query, vector: fixture.vector, limit: 10 });
    expect(hits.some((h) => h.matchedBy.includes("meaning"))).toBe(true);
    expect(hits.some((h) => h.passage.work_id === "bhagavad-gita")).toBe(true);
  });
  it("ignores a vector with the wrong length", () => {
    const hits = searchScripture({ query: "Hanuman", vector: [1, 2, 3] });
    expect(hits.every((h) => !h.matchedBy.includes("meaning"))).toBe(true);
  });
});

describe("scripture 404 proxy", () => {
  it.each([
    ["/scriptures", true],
    ["/scriptures/bhagavad-gita", true],
    ["/scriptures/bhagavad-gita/18", true],
    ["/scriptures/bhagavad-gita/19", false],
    ["/scriptures/bhagavad-gita/0", false],
    ["/scriptures/bhagavad-gita/02", false],
    ["/scriptures/bhagavad-gita/2/extra", false],
    ["/scriptures/nope", false],
  ])("%s → %s", (path, ok) => {
    expect(isKnownScripturePath(path)).toBe(ok);
  });
});
