import { expandQuery, tokenize } from "./text";

/** Okapi BM25 keyword index: rewards rare words that appear often in short passages. */
export class Bm25Index {
  private readonly k1 = 1.2;
  private readonly b = 0.75;
  private readonly docTerms: Map<string, number>[] = [];
  private readonly docLengths: number[] = [];
  private readonly docFreq = new Map<string, number>();
  private avgLength = 0;

  constructor(docs: string[]) {
    for (const doc of docs) {
      const counts = new Map<string, number>();
      const tokens = tokenize(doc);
      for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
      this.docTerms.push(counts);
      this.docLengths.push(tokens.length);
      for (const t of counts.keys()) this.docFreq.set(t, (this.docFreq.get(t) ?? 0) + 1);
    }
    this.avgLength = this.docLengths.reduce((a, c) => a + c, 0) / Math.max(docs.length, 1);
  }

  /** Scores for every document (0 when nothing matches). */
  score(query: string): Float64Array {
    const n = this.docTerms.length;
    const scores = new Float64Array(n);
    for (const { term, weight } of expandQuery(query)) {
      const df = this.docFreq.get(term);
      if (!df) continue;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      for (let i = 0; i < n; i++) {
        const tf = this.docTerms[i].get(term);
        if (!tf) continue;
        const norm = tf + this.k1 * (1 - this.b + (this.b * this.docLengths[i]) / this.avgLength);
        scores[i] += weight * idf * ((tf * (this.k1 + 1)) / norm);
      }
    }
    return scores;
  }
}
