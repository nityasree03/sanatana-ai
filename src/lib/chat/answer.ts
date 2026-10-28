import "server-only";
import { AiError, type AiProvider, type ChatTurn } from "@/lib/ai";
import { getPassage, sectionLinks } from "@/lib/scripture/data";
import type { Passage } from "@/lib/scripture/types";
import type { CompanionId } from "@/lib/companions";
import { parseReply, userTurnWithPassages } from "./grounding";
import { REPLY_SCHEMA, systemPrompt } from "./personas";

/** A passage plus the Scripture Explorer link to read it in its chapter. */
export type LinkedPassage = Passage & { href: string };

/** One Truth Lens entry: verified passage + AI interpretation + AI-suggested reflection. */
export interface ChatCitation {
  id: string;
  /** AI interpretation: how the passage relates to the answer. */
  how: string;
  /** AI-suggested practical reflection inspired by the passage (not scripture). */
  reflection: string;
  passage: LinkedPassage;
}

let links: Record<string, string> | null = null;
export function withHref(p: Passage): LinkedPassage {
  links ??= sectionLinks();
  return { ...p, href: `${links[`${p.work_id}|${p.section}`] ?? "/scriptures"}#${p.id}` };
}

export interface GroundedAnswer {
  reply: string;
  grounded: boolean;
  citations: ChatCitation[];
}

/**
 * Ask the AI for one grounded reply and check it. A reply that cannot be read (bad JSON, empty
 * text) is retried once, because that failure is usually a one-off; quota, outage and safety
 * blocks are not retried here (the provider already tries its fallback model).
 */
export async function groundedAnswer(opts: {
  provider: AiProvider;
  companion: CompanionId;
  history: ChatTurn[];
  latest: string;
  passages: Passage[];
  /** Extra system instructions, e.g. for the Divine Council. */
  extraSystem?: string;
  attempts?: number;
}): Promise<GroundedAnswer> {
  const { provider, companion, history, latest, passages, extraSystem } = opts;
  const attempts = opts.attempts ?? 2;
  const turns: ChatTurn[] = [
    ...history,
    { role: "user", text: userTurnWithPassages(latest, passages) },
  ];
  const system = extraSystem
    ? `${systemPrompt(companion)}\n\n${extraSystem}`
    : systemPrompt(companion);
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await provider.generate({
        system,
        turns,
        jsonSchema: REPLY_SCHEMA as unknown as Record<string, unknown>,
        temperature: 0.6,
        maxOutputTokens: 1100,
      });
      const reply = parseReply(result.text, passages);
      const citations = reply.citations
        .filter((c) => getPassage(c.id))
        .map((c) => ({ ...c, passage: withHref(getPassage(c.id)!) }));
      return { reply: reply.reply, grounded: reply.grounded, citations };
    } catch (err) {
      lastError = err;
      const retryable = !(err instanceof AiError) || err.kind === "bad-response";
      if (!retryable) break;
    }
  }
  throw lastError;
}

/** Map an AI failure to a short kind for notices and logs (never log message content). */
export function failureKind(err: unknown): "quota" | "unavailable" | "blocked" | "failed" {
  if (
    err instanceof AiError &&
    (err.kind === "quota" || err.kind === "unavailable" || err.kind === "blocked")
  )
    return err.kind;
  return "failed";
}
