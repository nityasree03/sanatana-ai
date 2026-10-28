import type { CompanionId } from "@/lib/companions";

/** Learning ranges chosen by the caregiver. */
export const AGE_RANGES = ["4-5", "6-9", "10-12"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const AGE_LABEL: Record<AgeRange, string> = {
  "4-5": "Ages 4–5",
  "6-9": "Ages 6–9",
  "10-12": "Ages 10–12",
};

/** Text written for each age range. */
export type ByAge = Record<AgeRange, string>;

export interface Scene {
  id: string;
  /** Picture id (see components/kids/art). */
  art: string;
  /** Describes the picture for screen readers. */
  alt: string;
  /** A short name for the scene, used in the order puzzle. */
  label: string;
  text: ByAge;
  /** Library passages this scene retells. */
  passages: string[];
  /** For ages 10–12: a real line from one of the passages (checked by a test). */
  verse: { passage: string; quote: string };
}

interface ActivityBase {
  id: string;
  /** Ages this activity is shown to. */
  ages: AgeRange[];
  /** Shown after this scene. */
  after: string;
  prompt: string;
  /** Kind words shown once it is done. */
  praise: string;
}

export type Activity =
  | (ActivityBase & {
      kind: "picture-choice";
      options: { label: string; art: string }[];
      answer: number;
      /** Shown on a wrong try: a gentle hint, never a "wrong". */
      hint: string;
    })
  | (ActivityBase & {
      kind: "question";
      options: string[];
      answer: number;
      hint: string;
    })
  | (ActivityBase & {
      kind: "sequence";
      /** Scene ids in the order they happen; shown mixed up. */
      scenes: string[];
    })
  | (ActivityBase & {
      kind: "match";
      pairs: { left: string; right: string }[];
    });

export interface Story {
  id: string;
  companion: CompanionId;
  title: string;
  /** One line for the story shelf. */
  blurb: string;
  /** Where the story comes from, in plain words. */
  source: string;
  /** What we changed or left out, and why. */
  adaptation: string;
  /** Learning goals, shown to the caregiver. */
  objectives: string[];
  scenes: Scene[];
  activities: Activity[];
  /** The gentle takeaway at the end. */
  takeaway: ByAge;
}
