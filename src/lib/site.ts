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
  repoUrl: "https://github.com/nityasree03/sanatana-ai",
  creator: "Nitya Sree Madishetty",
  /** How the companion portraits were made (shown in the footer and on the About page). */
  portraitCredit:
    "Companion portraits: AI-generated with ChatGPT from original text descriptions, selected and directed by Nitya Sree Madishetty.",
  /** Which portrait set the site uses: "illustrated" artwork or the drawn "classic" SVGs. */
  avatarStyle: "illustrated" as "illustrated" | "classic",
  /** The build phase the website is currently in. */
  currentPhase: 8,
} as const;

/** Keys used for small browser-only preferences. Nothing here leaves the device. */
export const STORAGE_KEYS = {
  theme: "sanatana-theme",
  companion: "sanatana-companion",
  portraits: "sanatana-portraits",
} as const;
