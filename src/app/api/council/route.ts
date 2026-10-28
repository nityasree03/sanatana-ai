import { z } from "zod";
import { getProvider } from "@/lib/ai";
import {
  failureKind,
  groundedAnswer,
  withHref,
  type ChatCitation,
  type LinkedPassage,
} from "@/lib/chat/answer";
import { chatPassages } from "@/lib/chat/retrieval";
import { CRISIS_REPLY, mentionsSelfHarm } from "@/lib/chat/safety";
import { getCompanion, type CompanionId } from "@/lib/companions";
import {
  COUNCIL_COST,
  COUNCIL_INSTRUCTIONS,
  COUNCIL_ORDER,
  MAX_QUESTION,
  SYNTHESIS_SCHEMA,
  SYNTHESIS_SYSTEM,
  parseSynthesis,
  synthesisPrompt,
  type Synthesis,
} from "@/lib/council/council";
import { rateLimit } from "@/lib/rateLimit";
import { embedQueryOnServer } from "@/lib/scripture/serverEmbed";

const Body = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Write a question first.")
    .max(MAX_QUESTION, `Questions can be up to ${MAX_QUESTION} characters.`),
});

export interface CouncilAnswer {
  companion: CompanionId;
  /** "ai" = the companion answered; "scripture-only" = passages only (no AI or it failed). */
  mode: "ai" | "scripture-only";
  reply?: string;
  grounded?: boolean;
  citations: ChatCitation[];
  related: LinkedPassage[];
}

export interface CouncilResponse {
  mode: "ai" | "scripture-only" | "crisis";
  provider?: string;
  practice?: boolean;
  answers: CouncilAnswer[];
  /** AI comparison of the answers (only when at least two companions answered). */
  synthesis?: Synthesis;
  notice?: string;
  crisisReply?: string;
}

const NOTICES = {
  notConnected:
    "The AI isn't connected on this site yet, so each companion shows passages from their own texts instead.",
  quota:
    "The free AI service has reached its limit for now, so some companions show passages instead. Please try again later.",
  partial: "Some companions couldn't answer this time; they show related passages instead.",
};

function ipOf(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/**
 * POST /api/council — one question, four separate grounded answers (one AI call per companion,
 * each drawing on that companion's own texts) and an AI comparison of them. Nothing is stored or
 * logged. A Council question counts as 5 messages towards the chat limits.
 */
export async function POST(request: Request) {
  const ip = ipOf(request);
  const perMinute = rateLimit(
    `chat:${ip}`,
    Number(process.env.CHAT_MINUTE_LIMIT) || 12,
    60_000,
    COUNCIL_COST,
  );
  if (!perMinute.ok) {
    return Response.json(
      { error: "The Council needs a short pause between questions. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(perMinute.retryAfter) } },
    );
  }
  const perDay = rateLimit(
    `chat-day:${ip}`,
    Number(process.env.CHAT_DAILY_LIMIT) || 60,
    86_400_000,
    COUNCIL_COST,
  );
  if (!perDay.ok) {
    return Response.json(
      {
        error:
          "You've reached today's limit for this free site (a Council question counts as 5 messages). Please come back tomorrow.",
      },
      { status: 429, headers: { "Retry-After": String(perDay.retryAfter) } },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "The request could not be read." }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid question." },
      { status: 400 },
    );
  }
  const { question } = parsed.data;

  // Safety first: never sent to the AI, and answered once, not four times.
  if (mentionsSelfHarm(question)) {
    const res: CouncilResponse = { mode: "crisis", answers: [], crisisReply: CRISIS_REPLY };
    return Response.json(res);
  }

  const vector = (await embedQueryOnServer(question)) ?? undefined;
  const passagesFor = Object.fromEntries(
    COUNCIL_ORDER.map((id) => [
      id,
      chatPassages({ query: question, vector, companion: id, total: 5, ownOnly: true }),
    ]),
  ) as Record<CompanionId, ReturnType<typeof chatPassages>>;
  const passagesOnly = (id: CompanionId): CouncilAnswer => ({
    companion: id,
    mode: "scripture-only",
    citations: [],
    related: passagesFor[id].slice(0, 3).map(withHref),
  });

  const provider = getProvider();
  if (!provider) {
    const res: CouncilResponse = {
      mode: "scripture-only",
      answers: COUNCIL_ORDER.map(passagesOnly),
      notice: NOTICES.notConnected,
    };
    return Response.json(res);
  }

  // Four separate calls, in parallel; one failing does not stop the others.
  const settled = await Promise.allSettled(
    COUNCIL_ORDER.map((id) =>
      groundedAnswer({
        provider,
        companion: id,
        history: [],
        latest: question,
        passages: passagesFor[id],
        extraSystem: COUNCIL_INSTRUCTIONS,
      }),
    ),
  );
  const kinds: string[] = [];
  const answers: CouncilAnswer[] = settled.map((s, i) => {
    const id = COUNCIL_ORDER[i];
    if (s.status === "rejected") {
      kinds.push(failureKind(s.reason));
      return passagesOnly(id);
    }
    const cited = new Set(s.value.citations.map((c) => c.id));
    return {
      companion: id,
      mode: "ai",
      reply: s.value.reply,
      grounded: s.value.grounded,
      citations: s.value.citations,
      related: passagesFor[id]
        .filter((p) => !cited.has(p.id))
        .slice(0, 2)
        .map(withHref),
    };
  });
  if (kinds.length) console.error(`council: AI errors (${kinds.join(",")})`); // never log content

  const answered = answers.filter((a) => a.mode === "ai" && a.reply);
  let synthesis: Synthesis | undefined;
  if (answered.length >= 2) {
    try {
      const result = await provider.generate({
        system: SYNTHESIS_SYSTEM,
        turns: [
          {
            role: "user",
            text: synthesisPrompt(
              question,
              answered.map((a) => ({ name: getCompanion(a.companion).name, reply: a.reply! })),
            ),
          },
        ],
        jsonSchema: SYNTHESIS_SCHEMA as unknown as Record<string, unknown>,
        temperature: 0.3,
        maxOutputTokens: 600,
      });
      synthesis = parseSynthesis(result.text);
    } catch (err) {
      console.error(`council: comparison failed (${failureKind(err)})`);
    }
  }

  const res: CouncilResponse = {
    mode: answered.length ? "ai" : "scripture-only",
    provider: provider.label,
    practice: provider.practice || undefined,
    answers,
    synthesis,
    notice:
      kinds.length === 0 ? undefined : kinds.includes("quota") ? NOTICES.quota : NOTICES.partial,
  };
  return Response.json(res);
}
