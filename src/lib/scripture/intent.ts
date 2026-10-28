import type { Passage } from "./types";

/**
 * Teaching passages: texts whose purpose is instruction (dialogues on how to live, Upanishads,
 * hymns of the Goddess's teaching) as opposed to narrative. Used to rank personal questions.
 */
const TEACHING_WORKS = new Set([
  "bhagavad-gita",
  "gita-telang",
  "gita-arnold",
  "isa-upanishad",
  "katha-upanishad",
  "kena-upanishad",
  "svetasvatara-upanishad",
  "upanishads-hume",
  "devi-gita",
]);

export function isTeaching(p: Passage): boolean {
  if (TEACHING_WORKS.has(p.work_id)) return true;
  // The Gita chapters inside Ganguli's Mahabharata are teaching too.
  return p.work_id === "mahabharata" && /Bhagavad Gita/i.test(p.section);
}

const PERSONAL =
  /\b(i|i'm|im|i've|me|my|mine|myself|we|our|us)\b|^(how|what|why|should|can|could|is it|am i|will)\b/i;

/** Does the question sound personal ("how do I…", "my mind…") rather than about a story? */
export function isPersonalQuestion(query: string): boolean {
  return PERSONAL.test(query.trim());
}
