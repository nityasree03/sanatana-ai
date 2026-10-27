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
  /** Which portrait set the site uses: "illustrated" artwork or the drawn "classic" SVGs. */
  avatarStyle: "illustrated" as "illustrated" | "classic",
  /** The build phase the website is currently in. */
  currentPhase: 3,
} as const;

/** Keys used for small browser-only preferences. Nothing here leaves the device. */
export const STORAGE_KEYS = {
  theme: "sanatana-theme",
  companion: "sanatana-companion",
} as const;
