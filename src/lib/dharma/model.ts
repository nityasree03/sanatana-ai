import { z } from "zod";
import { COMPANIONS, type CompanionId } from "@/lib/companions";

/**
 * Dharma Lab decision map: a deterministic state model, separate from anything an AI writes.
 * Every change goes through `reduce()`, a pure function, so the map's behaviour can be tested
 * exactly: options, points, perspectives and the person's decision persist as they were made.
 * AI text only ever enters as data (suggested options, perspectives) and is labelled as such.
 */

const companionIds = COMPANIONS.map((c) => c.id) as [CompanionId, ...CompanionId[]];
const stamp = z.string().min(1);
const id = z.string().min(1).max(64);

export const DHARMA_LIMITS = {
  dilemma: 2000,
  context: 500,
  title: 120,
  summary: 500,
  point: 300,
  firstStep: 300,
  note: 1000,
  options: 8,
  points: 12,
} as const;

export const PointKind = z.enum(["up", "down", "unknown"]);
export type PointKind = z.infer<typeof PointKind>;

export const PointSchema = z.object({
  id,
  kind: PointKind,
  text: z.string().trim().min(1).max(DHARMA_LIMITS.point),
});

export const PerspectiveCitationSchema = z.object({
  passageId: z.string().min(1).max(80),
  reference: z.string().min(1).max(200),
  translator: z.string().max(120).default(""),
  excerpt: z.string().max(600),
  href: z.string().regex(/^\/scriptures\//),
  how: z.string().max(300).default(""),
  reflection: z.string().max(300).default(""),
});

export const PerspectiveSchema = z.object({
  id,
  companion: z.enum(companionIds),
  reply: z.string().max(2500),
  grounded: z.boolean(),
  citations: z.array(PerspectiveCitationSchema).max(3),
  askedAt: stamp,
});

export const OptionSchema = z.object({
  id,
  title: z.string().trim().min(1).max(DHARMA_LIMITS.title),
  summary: z.string().max(DHARMA_LIMITS.summary).default(""),
  firstStep: z.string().max(DHARMA_LIMITS.firstStep).default(""),
  points: z
    .array(PointSchema)
    .max(DHARMA_LIMITS.points * 3)
    .default([]),
  /** Where the option came from: suggested by the AI, or written by the person. */
  origin: z.enum(["ai", "me"]),
  perspectives: z.array(PerspectiveSchema).max(12).default([]),
});

export const DecisionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("option"), optionId: id, note: z.string().max(DHARMA_LIMITS.note) }),
  z.object({ kind: z.literal("not-yet"), note: z.string().max(DHARMA_LIMITS.note) }),
]);

export const DecisionMapSchema = z.object({
  id,
  dilemma: z.string().max(DHARMA_LIMITS.dilemma),
  values: z.string().max(DHARMA_LIMITS.context).default(""),
  limits: z.string().max(DHARMA_LIMITS.context).default(""),
  options: z.array(OptionSchema).max(DHARMA_LIMITS.options).default([]),
  decision: DecisionSchema.nullable().default(null),
  createdAt: stamp,
  updatedAt: stamp,
});

export type Point = z.infer<typeof PointSchema>;
export type Perspective = z.infer<typeof PerspectiveSchema>;
export type PerspectiveCitation = z.infer<typeof PerspectiveCitationSchema>;
export type DecisionOption = z.infer<typeof OptionSchema>;
export type Decision = z.infer<typeof DecisionSchema>;
export type DecisionMap = z.infer<typeof DecisionMapSchema>;

/** An option as the AI suggests it (before it becomes part of the map). */
export interface SuggestedOption {
  title: string;
  summary: string;
  upsides: string[];
  downsides: string[];
  unknowns: string[];
  firstStep: string;
}

export type Action =
  | { type: "setText"; field: "dilemma" | "values" | "limits"; value: string }
  | { type: "addOption"; title: string; summary?: string; firstStep?: string }
  | { type: "addSuggested"; options: SuggestedOption[] }
  | {
      type: "updateOption";
      optionId: string;
      patch: Partial<Pick<DecisionOption, "title" | "summary" | "firstStep">>;
    }
  | { type: "removeOption"; optionId: string }
  | { type: "addPoint"; optionId: string; kind: PointKind; text: string }
  | { type: "updatePoint"; optionId: string; pointId: string; text: string }
  | { type: "removePoint"; optionId: string; pointId: string }
  | { type: "addPerspectives"; optionId: string; perspectives: Omit<Perspective, "id">[] }
  | { type: "removePerspective"; optionId: string; perspectiveId: string }
  | { type: "decide"; decision: Decision }
  | { type: "clearDecision" }
  | { type: "load"; map: DecisionMap };

export interface ReduceDeps {
  now: () => string;
  newId: () => string;
}

export function emptyMap(deps: ReduceDeps): DecisionMap {
  const t = deps.now();
  return {
    id: deps.newId(),
    dilemma: "",
    values: "",
    limits: "",
    options: [],
    decision: null,
    createdAt: t,
    updatedAt: t,
  };
}

const clip = (s: string, n: number) => s.trim().slice(0, n);

function mapOption(
  map: DecisionMap,
  optionId: string,
  f: (o: DecisionOption) => DecisionOption,
): DecisionMap {
  return { ...map, options: map.options.map((o) => (o.id === optionId ? f(o) : o)) };
}

/** Apply one action. Pure: same map + same action → same result (given the same ids/times). */
export function reduce(map: DecisionMap, action: Action, deps: ReduceDeps): DecisionMap {
  const next = ((): DecisionMap => {
    switch (action.type) {
      case "setText": {
        const max = action.field === "dilemma" ? DHARMA_LIMITS.dilemma : DHARMA_LIMITS.context;
        return { ...map, [action.field]: action.value.slice(0, max) };
      }
      case "addOption": {
        const title = clip(action.title, DHARMA_LIMITS.title);
        if (!title || map.options.length >= DHARMA_LIMITS.options) return map;
        const option: DecisionOption = {
          id: deps.newId(),
          title,
          summary: clip(action.summary ?? "", DHARMA_LIMITS.summary),
          firstStep: clip(action.firstStep ?? "", DHARMA_LIMITS.firstStep),
          points: [],
          origin: "me",
          perspectives: [],
        };
        return { ...map, options: [...map.options, option] };
      }
      case "addSuggested": {
        const room = DHARMA_LIMITS.options - map.options.length;
        const added = action.options
          .slice(0, Math.max(room, 0))
          .filter((s) => s.title.trim())
          .map((s): DecisionOption => ({
            id: deps.newId(),
            title: clip(s.title, DHARMA_LIMITS.title),
            summary: clip(s.summary, DHARMA_LIMITS.summary),
            firstStep: clip(s.firstStep, DHARMA_LIMITS.firstStep),
            origin: "ai",
            perspectives: [],
            points: (
              [
                ["up", s.upsides],
                ["down", s.downsides],
                ["unknown", s.unknowns],
              ] as const
            ).flatMap(([kind, list]) =>
              list
                .map((t) => clip(t, DHARMA_LIMITS.point))
                .filter(Boolean)
                .slice(0, DHARMA_LIMITS.points)
                .map((text) => ({ id: deps.newId(), kind, text })),
            ),
          }));
        return { ...map, options: [...map.options, ...added] };
      }
      case "updateOption":
        return mapOption(map, action.optionId, (o) => ({
          ...o,
          ...(action.patch.title !== undefined && {
            title: clip(action.patch.title, DHARMA_LIMITS.title) || o.title,
          }),
          ...(action.patch.summary !== undefined && {
            summary: clip(action.patch.summary, DHARMA_LIMITS.summary),
          }),
          ...(action.patch.firstStep !== undefined && {
            firstStep: clip(action.patch.firstStep, DHARMA_LIMITS.firstStep),
          }),
        }));
      case "removeOption": {
        const options = map.options.filter((o) => o.id !== action.optionId);
        // A decision for a removed option no longer means anything: clear it.
        const decision =
          map.decision?.kind === "option" && map.decision.optionId === action.optionId
            ? null
            : map.decision;
        return { ...map, options, decision };
      }
      case "addPoint": {
        const text = clip(action.text, DHARMA_LIMITS.point);
        if (!text) return map;
        return mapOption(map, action.optionId, (o) =>
          o.points.filter((p) => p.kind === action.kind).length >= DHARMA_LIMITS.points
            ? o
            : { ...o, points: [...o.points, { id: deps.newId(), kind: action.kind, text }] },
        );
      }
      case "updatePoint": {
        const text = clip(action.text, DHARMA_LIMITS.point);
        return mapOption(map, action.optionId, (o) => ({
          ...o,
          points: text
            ? o.points.map((p) => (p.id === action.pointId ? { ...p, text } : p))
            : o.points.filter((p) => p.id !== action.pointId),
        }));
      }
      case "removePoint":
        return mapOption(map, action.optionId, (o) => ({
          ...o,
          points: o.points.filter((p) => p.id !== action.pointId),
        }));
      case "addPerspectives":
        return mapOption(map, action.optionId, (o) => ({
          ...o,
          perspectives: [
            ...action.perspectives.map((p) => ({ ...p, id: deps.newId() })),
            ...o.perspectives,
          ].slice(0, 12),
        }));
      case "removePerspective":
        return mapOption(map, action.optionId, (o) => ({
          ...o,
          perspectives: o.perspectives.filter((p) => p.id !== action.perspectiveId),
        }));
      case "decide": {
        const d = action.decision;
        if (d.kind === "option" && !map.options.some((o) => o.id === d.optionId)) return map;
        return { ...map, decision: { ...d, note: d.note.slice(0, DHARMA_LIMITS.note) } };
      }
      case "clearDecision":
        return { ...map, decision: null };
      case "load":
        return action.map;
    }
  })();
  return next === map || action.type === "load" ? next : { ...next, updatedAt: deps.now() };
}

export function pointCounts(o: DecisionOption): Record<PointKind, number> {
  return {
    up: o.points.filter((p) => p.kind === "up").length,
    down: o.points.filter((p) => p.kind === "down").length,
    unknown: o.points.filter((p) => p.kind === "unknown").length,
  };
}
