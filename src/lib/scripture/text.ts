/**
 * Text normalisation shared by the keyword index (server) and queries (browser and server).
 * Keeping one implementation guarantees both sides split words the same way.
 */

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by do does for from had has have he her his i if in into is it its me my " +
    "no nor not of on or our she so than that the their them then there these they this those to too us was we " +
    "were what when where which who whom why will with would you your yours " +
    // archaic forms common in 19th-century translations
    "thee thou thy thine ye hath doth dost art shalt wilt unto upon o oh"
  ).split(" "),
);

/** Lower-case, remove accents (â → a), keep letters and digits. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Very small English stemmer: enough to match "fears/feared/fearing" with "fear". */
export function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("ly")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokenize(text: string): string[] {
  return normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/**
 * Modern words people type, mapped to words the old translations use. Expansions count for
 * half as much as the words actually typed.
 */
const RELATED: Record<string, string[]> = {
  fear: ["afraid", "dread", "terror"],
  afraid: ["fear", "dread"],
  anxious: ["anxiety", "sorrow", "grief", "care"],
  anxiety: ["sorrow", "grief", "care"],
  worry: ["sorrow", "grief", "care", "anxiety"],
  stress: ["sorrow", "grief", "distress"],
  sad: ["sorrow", "grief"],
  duty: ["dharma"],
  dharma: ["duty", "righteousness"],
  work: ["action", "karma"],
  action: ["work", "karma"],
  karma: ["action", "work"],
  anger: ["wrath"],
  angry: ["wrath", "anger"],
  god: ["lord", "deva"],
  goddess: ["devi", "mother"],
  mother: ["devi", "goddess"],
  self: ["atman"],
  soul: ["self", "atman"],
  peace: ["tranquil", "calm", "rest"],
  calm: ["peace", "tranquil"],
  courage: ["valour", "valor", "hero", "bold"],
  strength: ["strong", "might", "power"],
  devotion: ["bhakti", "love", "worship"],
  love: ["devotion", "dear"],
  death: ["dying", "mortal", "die"],
  mind: ["manas", "thought"],
  meditation: ["yoga", "meditate"],
  failure: ["defeat", "loss"],
  success: ["victory", "attainment"],
};

export function expandQuery(text: string): { term: string; weight: number }[] {
  const terms = new Map<string, number>();
  for (const word of normalise(text).split(" ")) {
    if (word.length < 2 || STOPWORDS.has(word)) continue;
    terms.set(stem(word), 1);
    for (const r of RELATED[word] ?? RELATED[stem(word)] ?? []) {
      const s = stem(r);
      if (!terms.has(s)) terms.set(s, 0.5);
    }
  }
  return [...terms].map(([term, weight]) => ({ term, weight }));
}
