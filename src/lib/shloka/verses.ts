/**
 * Verses for the Shloka Practice Studio. Every one has verified Sanskrit (Devanagari) and an
 * IAST transliteration in the library, with the same number of lines (checked by a test).
 * Titles are our own short names, not scripture.
 */
export const SHLOKAS: { passage: string; title: string }[] = [
  { passage: "bg-2.47", title: "Do your part; let go of the fruit" },
  { passage: "bg-2.14", title: "Cold and heat come and go" },
  { passage: "bg-4.7", title: "Whenever dharma declines" },
  { passage: "bg-4.8", title: "Age after age" },
  { passage: "bg-6.5", title: "Lift yourself by yourself" },
  { passage: "bg-9.26", title: "A leaf, a flower, a fruit, water" },
  { passage: "bg-12.13", title: "Ill-will toward none" },
  { passage: "bg-18.66", title: "Come to me for shelter" },
  { passage: "isa-1", title: "All this is covered by the Lord" },
  { passage: "isa-7", title: "Where is grief for one who sees oneness?" },
  { passage: "katha-1.3.14", title: "Arise, awake" },
  { passage: "kena-2.3", title: "Who thinks he knows It not, knows It" },
];

export interface ShlokaLine {
  devanagari: string;
  iast: string;
}

/** Pair the Devanagari and IAST lines of a verse. */
export function pairLines(devanagari: string, iast: string): ShlokaLine[] {
  const d = devanagari
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const t = iast
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (d.length !== t.length) throw new Error("Devanagari and IAST line counts differ");
  return d.map((devanagari, i) => ({ devanagari, iast: t[i] }));
}
