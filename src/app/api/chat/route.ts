import { z } from "zod";
import { getProvider, type ChatTurn } from "@/lib/ai";
import {
  failureKind,
  groundedAnswer,
  withHref,
  type ChatCitation,
  type LinkedPassage,
} from "@/lib/chat/answer";
import { chatPassages, searchTextFor } from "@/lib/chat/retrieval";
import { CRISIS_REPLY, mentionsSelfHarm } from "@/lib/chat/safety";
import { COMPANIONS, getCompanion, type CompanionId } from "@/lib/companions";
import { rateLimit } from "@/lib/rateLimit";
import { embedQueryOnServer } from "@/lib/scripture/serverEmbed";

const MAX_MESSAGE = 2000;
const companionIds = COMPANIONS.map((c) => c.id) as [CompanionId, ...CompanionId[]];

const Message = z.object({
  role: z.enum(["user", "companion"]),
  text: z
    .string()
    .trim()
    .min(1)
    .max(MAX_MESSAGE, `Messages can be up to ${MAX_MESSAGE} characters.`),
});

const Body = z.object({
  companion: z.enum(companionIds),
  messages: z.array(Message).min(1).max(20),
  /** Companion Handoff: earlier messages the person chose to share from another companion. */
  shared: z
    .object({ from: z.enum(companionIds), messages: z.array(Message).min(1).max(10) })
    .optional(),
});

export type ChatRequest = z.input<typeof Body>;

export type { ChatCitation, LinkedPassage };

/** GET /api/chat — whether an AI is connected (no secrets: only the provider's label). */
export function GET() {
  const provider = getProvider();
  return Response.json({ ai: provider?.label ?? null, practice: provider?.practice ?? false });
}

export interface ChatResponse {
  mode: "ai" | "scripture-only" | "crisis";
  /** "Gemini", "Practice mode"; absent without AI. */
  provider?: string;
  practice?: boolean;
  reply?: string;
  grounded?: boolean;
  citations: ChatCitation[];
  /** Related passages found by search (shown when there is no AI reply, or as "more to read"). */
  related: LinkedPassage[];
  notice?: string;
}

const NOTICES = {
  notConnected:
    "The AI isn't connected on this site yet, so here are passages from the library related to your message.",
  quota:
    "The free AI service has reached its limit for now. Meanwhile, here are passages related to your message. Please try again later.",
  unavailable:
    "The AI service didn't respond. Here are related passages instead; please try again in a moment.",
  blocked: "The AI's safety filter declined this message. Here are related passages instead.",
  failed: "Something went wrong with the AI reply. Here are related passages instead.",
};

function ipOf(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** POST /api/chat — one grounded reply from the chosen companion. Messages are not stored or logged. */
export async function POST(request: Request) {
  const ip = ipOf(request);
  const perMinute = rateLimit(`chat:${ip}`, Number(process.env.CHAT_MINUTE_LIMIT) || 12);
  if (!perMinute.ok) {
    return Response.json(
      { error: "You're sending messages quickly. Wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(perMinute.retryAfter) } },
    );
  }
  const perDay = rateLimit(
    `chat-day:${ip}`,
    Number(process.env.CHAT_DAILY_LIMIT) || 60,
    86_400_000,
  );
  if (!perDay.ok) {
    return Response.json(
      {
        error:
          "You've reached today's message limit for this free site. Please come back tomorrow.",
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
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 },
    );
  }
  const { companion, messages, shared } = parsed.data;
  const userMessages = [...(shared?.messages ?? []), ...messages]
    .filter((m) => m.role === "user")
    .map((m) => m.text);
  const latest = messages.at(-1);
  if (!latest || latest.role !== "user") {
    return Response.json({ error: "The last message must be from you." }, { status: 400 });
  }

  // Safety first: a message that may mention self-harm never goes to the AI.
  if (mentionsSelfHarm(latest.text)) {
    const res: ChatResponse = { mode: "crisis", reply: CRISIS_REPLY, citations: [], related: [] };
    return Response.json(res);
  }

  const query = searchTextFor(userMessages);
  const vector = (await embedQueryOnServer(query)) ?? undefined;
  const passages = chatPassages({ query, vector, companion });
  const scriptureOnly = (notice: string): ChatResponse => ({
    mode: "scripture-only",
    citations: [],
    related: passages.slice(0, 4).map(withHref),
    notice,
  });

  const provider = getProvider();
  if (!provider) return Response.json(scriptureOnly(NOTICES.notConnected));

  // Earlier turns as plain text (last 8), then the latest message with the verified passages.
  const history: ChatTurn[] = messages.slice(-9, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    text: m.text,
  }));
  try {
    const answer = await groundedAnswer({
      provider,
      companion,
      history,
      latest: latest.text,
      passages,
      shared: shared && { fromName: getCompanion(shared.from).name, messages: shared.messages },
    });
    const { citations } = answer;
    const cited = new Set(citations.map((c) => c.id));
    const res: ChatResponse = {
      mode: "ai",
      provider: provider.label,
      practice: provider.practice || undefined,
      reply: answer.reply,
      grounded: answer.grounded,
      citations,
      related: passages
        .filter((p) => !cited.has(p.id))
        .slice(0, 3)
        .map(withHref),
    };
    return Response.json(res);
  } catch (err) {
    const kind = failureKind(err);
    console.error(`chat: AI error (${kind})`); // never log message content
    const notice =
      kind === "quota"
        ? NOTICES.quota
        : kind === "unavailable"
          ? NOTICES.unavailable
          : kind === "blocked"
            ? NOTICES.blocked
            : NOTICES.failed;
    return Response.json(scriptureOnly(notice));
  }
}
