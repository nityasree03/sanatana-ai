/**
 * Central site information.
 * Keeping these values in one place means every page, test and document
 * reads from the same source instead of repeating text.
 */

export const SITE = {
  name: "Sanatana AI",
  tagline: "Scripture-grounded conversations with four AI companions",
  /** Shown wherever companions appear, so nobody mistakes them for divine contact. */
  aiDisclosure:
    "The companions are AI simulations inspired by tradition. They are not the deities themselves and do not offer divine contact.",
} as const;

export type CompanionId = "krishna" | "shiva" | "hanuman" | "parvati";

export interface CompanionSummary {
  id: CompanionId;
  name: string;
  /** Short description of the companion's voice and focus (from the blueprint). */
  focus: string;
}

/** The four companions planned in the blueprint. Full profiles arrive in Phase 1. */
export const COMPANIONS: readonly CompanionSummary[] = [
  { id: "krishna", name: "Krishna", focus: "Warm and philosophical: duty, action and uncertainty" },
  {
    id: "shiva",
    name: "Shiva",
    focus: "Calm and contemplative: change, presence and self-awareness",
  },
  {
    id: "hanuman",
    name: "Hanuman",
    focus: "Encouraging and humble: perseverance, devotion and service",
  },
  {
    id: "parvati",
    name: "Parvati",
    focus: "Compassionate and strong: balance, care and inner strength",
  },
] as const;
