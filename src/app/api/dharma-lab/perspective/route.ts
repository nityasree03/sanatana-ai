import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { failureKind, groundedAnswer, type ChatCitation } from "@/lib/chat/answer";
import { chatPassages } from "@/lib/chat/retrieval";
import { CRISIS_REPLY, mentionsSelfHarm } from "@/lib/chat/safety";
import { COMPANIONS, type CompanionId } from "@/lib/companions";
import { COUNCIL_ORDER } from "@/lib/council/council";
import { DilemmaFields, checkLimits, readJson } from "@/lib/dharma/api";
import { DHARMA_LIMITS } from "@/lib/dharma/model";
import { PERSPECTIVE_INSTRUCTIONS, perspectiveMessage } from "@/lib/dharma/prompts";
import { embedQueryOnServer } from "@/lib/scripture/serverEmbed";

const companionIds = COMPANIONS.map((c) => c.id) as [CompanionId, ...CompanionId[]];
const pointList = z
  .array(z.string().trim().min(1).max(DHARMA_LIMITS.point))
  .max(DHARMA_LIMITS.points);

const Body = z.object({
  ...DilemmaFields,
  path: z.object({
    title: z.string().trim().min(1).max(DHARMA_LIMITS.title),
    summary: z.string().trim().max(DHARMA_LIMITS.summary).optional(),
    upsides: pointList.optional(),
    downsides: pointList.optional(),
    unknowns: pointList.optional(),
  }),
  /** One companion, or "council" for all four (4 AI calls). */
  who: z.union([z.enum(companionIds), z.literal("council")]),
});

export interface PerspectiveAnswer {
  companion: CompanionId;
  mode: "ai" | "failed";
  reply?: string;
  grounded?: boolean;
  citations: ChatCitation[];
}

export interface PerspectiveResponse {
  mode: "ai" | "unavailable" | "crisis";
  practice?: boolean;
  answers: PerspectiveAnswer[];
  notice?: string;
  crisisReply?: string;
}

/** POST /api/dharma-lab/perspective — how one companion (or all four) sees one path. Not stored. */
export async function POST(request: Request) {
  let who: unknown;
  const json = await readJson(request);
  const parsed = Body.safeParse(json);
  if (parsed.success) who = parsed.data.who;
  const limited = checkLimits(request, who === "council" ? 4 : 1);
  if (limited) return limited;
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  const { path, ...input } = parsed.data;

  const texts = [input.dilemma, input.values, input.limits, path.title, path.summary];
  if (texts.some((t) => t && mentionsSelfHarm(t))) {
    const res: PerspectiveResponse = { mode: "crisis", answers: [], crisisReply: CRISIS_REPLY };
    return Response.json(res);
  }

  const provider = getProvider();
  if (!provider) {
    const res: PerspectiveResponse = {
      mode: "unavailable",
      answers: [],
      notice: "The AI isn't connected on this site yet, so companions can't comment on paths.",
    };
    return Response.json(res);
  }

  const companions = input.who === "council" ? COUNCIL_ORDER : [input.who];
  const message = perspectiveMessage(input, path);
  const query = `${input.dilemma} ${path.title}`;
  const vector = (await embedQueryOnServer(query)) ?? undefined;
  const settled = await Promise.allSettled(
    companions.map((id) =>
      groundedAnswer({
        provider,
        companion: id,
        history: [],
        latest: message,
        passages: chatPassages({ query, vector, companion: id, total: 5, ownOnly: true }),
        extraSystem: PERSPECTIVE_INSTRUCTIONS,
      }),
    ),
  );
  const kinds: string[] = [];
  const answers: PerspectiveAnswer[] = settled.map((s, i) => {
    if (s.status === "rejected") {
      kinds.push(failureKind(s.reason));
      return { companion: companions[i], mode: "failed", citations: [] };
    }
    return {
      companion: companions[i],
      mode: "ai",
      reply: s.value.reply,
      grounded: s.value.grounded,
      citations: s.value.citations,
    };
  });
  if (kinds.length) console.error(`dharma-lab perspective: AI errors (${kinds.join(",")})`);
  const res: PerspectiveResponse = {
    mode: answers.some((a) => a.mode === "ai") ? "ai" : "unavailable",
    practice: provider.practice || undefined,
    answers,
    notice: kinds.length
      ? kinds.includes("quota")
        ? "The free AI service has reached its limit for now. Please try again later."
        : "Some companions couldn't answer this time. Please try again."
      : undefined,
  };
  return Response.json(res);
}
