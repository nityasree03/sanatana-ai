import { z } from "zod";
import { COMPANIONS, type CompanionId } from "@/lib/companions";
import { DecisionMapSchema } from "@/lib/dharma/model";

/**
 * Everything a person chooses to save on "My Dharma Journey" pages. It lives only in this browser
 * (localStorage), is saved only after the person opts in, and can be exported, imported or deleted.
 */

const companionIds = COMPANIONS.map((c) => c.id) as [CompanionId, ...CompanionId[]];
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date like 2026-10-28");
const stamp = z.string().min(1); // ISO timestamp
const id = z.string().min(1).max(64);

export const LIMITS = {
  goal: 300,
  note: 1000,
  reflectionField: 2000,
  sankalpa: 200,
  theme: 40,
  excerpt: 600,
} as const;

export const GoalSchema = z.object({
  id,
  text: z.string().trim().min(1).max(LIMITS.goal),
  note: z.string().max(LIMITS.note).default(""),
  createdAt: stamp,
  updatedAt: stamp,
});

export const LeafSource = z.enum(["chat", "council", "leela", "explorer", "dharma-lab"]);

export const LeafSchema = z.object({
  id,
  passageId: z.string().min(1).max(80),
  reference: z.string().min(1).max(200),
  translator: z.string().max(120).default(""),
  excerpt: z.string().max(LIMITS.excerpt),
  href: z.string().regex(/^\/scriptures\//, "Leaves link to the Scripture Explorer"),
  theme: z.string().trim().min(1).max(LIMITS.theme),
  note: z.string().max(LIMITS.note).default(""),
  source: LeafSource,
  companion: z.enum(companionIds).optional(),
  createdAt: stamp,
  updatedAt: stamp,
});

export const ReflectionSchema = z.object({
  id,
  date: isoDate,
  intention: z.string().max(LIMITS.reflectionField).default(""),
  action: z.string().max(LIMITS.reflectionField).default(""),
  outcome: z.string().max(LIMITS.reflectionField).default(""),
  learning: z.string().max(LIMITS.reflectionField).default(""),
  nextStep: z.string().max(LIMITS.reflectionField).default(""),
  createdAt: stamp,
  updatedAt: stamp,
});

export const ScheduleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("once"), date: isoDate }),
  z.object({ kind: z.literal("daily") }),
  z.object({
    kind: z.literal("weekdays"),
    /** 0 = Sunday … 6 = Saturday */
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  }),
]);

export const SankalpaSchema = z.object({
  id,
  text: z.string().trim().min(1).max(LIMITS.sankalpa),
  schedule: ScheduleSchema,
  status: z.enum(["active", "paused"]),
  /** Local dates (YYYY-MM-DD) on which the person marked it done. */
  done: z.array(isoDate).max(800).default([]),
  fromReflection: id.optional(),
  createdAt: stamp,
  updatedAt: stamp,
});

export const JourneySchema = z.object({
  version: z.literal(1),
  /** The person's consent to save on this device. */
  enabled: z.boolean(),
  goals: z.array(GoalSchema).max(200).default([]),
  leaves: z.array(LeafSchema).max(1000).default([]),
  reflections: z.array(ReflectionSchema).max(2000).default([]),
  sankalpas: z.array(SankalpaSchema).max(200).default([]),
  /** Dharma Lab decision maps the person chose to save. */
  decisions: z.array(DecisionMapSchema).max(100).default([]),
});

/** The file format for export/import. */
export const ExportSchema = z.object({
  app: z.literal("sanatana-ai"),
  kind: z.literal("journey-export"),
  version: z.literal(1),
  exportedAt: stamp,
  data: JourneySchema.omit({ enabled: true }),
});

export type Goal = z.infer<typeof GoalSchema>;
export type Leaf = z.infer<typeof LeafSchema>;
export type Reflection = z.infer<typeof ReflectionSchema>;
export type Sankalpa = z.infer<typeof SankalpaSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type JourneyExport = z.infer<typeof ExportSchema>;

export const EMPTY_JOURNEY: Journey = {
  version: 1,
  enabled: false,
  goals: [],
  leaves: [],
  reflections: [],
  sankalpas: [],
  decisions: [],
};

/** Suggested Wisdom Tree branches; people can also type their own. */
export const LEAF_THEMES = [
  "Duty and action",
  "Peace of mind",
  "Courage and strength",
  "Devotion and love",
  "Knowledge of the Self",
  "Relationships",
] as const;
