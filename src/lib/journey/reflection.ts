import type { Reflection } from "./schema";
import { MAX_DRAFT } from "./handoff";

export const REFLECTION_FIELDS = [
  { key: "intention", label: "My intention", hint: "What did I mean to do, and why?" },
  { key: "action", label: "What I did", hint: "What actually happened on my side?" },
  { key: "outcome", label: "What happened", hint: "The result, for me and for others." },
  { key: "learning", label: "What I learned", hint: "About myself, others or the situation." },
  { key: "nextStep", label: "My next step", hint: "One small, concrete thing to try next." },
] as const;

export type ReflectionField = (typeof REFLECTION_FIELDS)[number]["key"];

export function isEmptyReflection(r: Pick<Reflection, ReflectionField>) {
  return REFLECTION_FIELDS.every((f) => !r[f.key].trim());
}

/**
 * The message put into the chat box when the person chooses "Discuss with a companion".
 * Long entries are shortened to fit one chat message; the person sees and can edit it before sending.
 */
export function reflectionMessage(r: Reflection): { text: string; shortened: boolean } {
  const head = `Here is a reflection from my journal (${r.date}). What do you see in it, and how might scripture help me with my next step?`;
  const parts = REFLECTION_FIELDS.filter((f) => r[f.key].trim()).map(
    (f) => `${f.label}: ${r[f.key].trim()}`,
  );
  let text = [head, ...parts].join("\n");
  if (text.length <= MAX_DRAFT) return { text, shortened: false };
  // Share the space fairly between the fields that were filled in.
  const budget = Math.floor(
    (MAX_DRAFT - head.length - 20 * parts.length) / Math.max(parts.length, 1),
  );
  text = [
    head,
    ...REFLECTION_FIELDS.filter((f) => r[f.key].trim()).map((f) => {
      const v = r[f.key].trim();
      return `${f.label}: ${v.length > budget ? `${v.slice(0, budget - 1)}…` : v}`;
    }),
  ].join("\n");
  return { text: text.slice(0, MAX_DRAFT), shortened: true };
}
