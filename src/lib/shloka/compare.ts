/**
 * A rough, forgiving comparison between what speech recognition heard and the line being
 * practised. It is a guide for practice, not a judgement of pronunciation: browsers have no
 * Sanskrit recogniser, so we listen in Hindi and compare the letters loosely.
 */

const DEVANAGARI = /[ऀ-ॿ]/;

/** Letters only: no punctuation, dandas, Om sign, avagraha, nukta, virama or spaces. */
export function simplify(text: string): string {
  if (DEVANAGARI.test(text)) {
    return text
      .replace(/[ॐ।॥ऽ़्‌‍]/g, "") // ॐ । ॥ ऽ ़ ् ZWNJ ZWJ
      .replace(/ँ/g, "ं") // chandrabindu → anusvara
      .replace(/[^ऀ-ॿ]/g, "");
  }
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function levenshtein(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** Smallest edit distance between `needle` and any stretch of `hay`. */
function bestInside(hay: string[], needle: string[]): number {
  let prev = new Array(hay.length + 1).fill(0);
  for (let i = 1; i <= needle.length; i++) {
    const cur = [i];
    for (let j = 1; j <= hay.length; j++)
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (needle[i - 1] === hay[j - 1] ? 0 : 1),
      );
    prev = cur;
  }
  return Math.min(...prev);
}

export interface RecitationResult {
  /** 0–1 similarity of the whole line. */
  similarity: number;
  band: "close" | "partly" | "far";
  /** Indexes of words of the line that were not clearly heard. */
  missed: number[];
}

/**
 * Compare a heard transcript with the line. Devanagari transcripts are compared with the
 * Devanagari line; Latin-letter transcripts with the IAST line.
 */
export function compareRecitation(
  heard: string,
  line: { devanagari: string; iast: string },
): RecitationResult {
  const target = DEVANAGARI.test(heard) || !heard.trim() ? line.devanagari : line.iast;
  const h = [...simplify(heard)];
  const t = [...simplify(target)];
  const similarity = t.length
    ? Math.max(0, 1 - levenshtein(h, t) / Math.max(h.length, t.length))
    : 0;
  // Indexes refer to the line's whitespace-separated words (punctuation-only tokens skipped).
  const missed: number[] = [];
  target.split(/\s+/).forEach((word, i) => {
    const w = [...simplify(word)];
    if (w.length && bestInside(h, w) > Math.floor(w.length * 0.34)) missed.push(i);
  });
  const band = similarity >= 0.8 ? "close" : similarity >= 0.5 ? "partly" : "far";
  return { similarity, band, missed };
}
