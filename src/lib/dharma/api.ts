import "server-only";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";
import { DHARMA_LIMITS } from "./model";

/** Shared input checks and rate limits for the Dharma Lab endpoints. */
export const DilemmaFields = {
  dilemma: z
    .string()
    .trim()
    .min(1, "Describe your decision first.")
    .max(DHARMA_LIMITS.dilemma, `Keep the description under ${DHARMA_LIMITS.dilemma} characters.`),
  values: z.string().trim().max(DHARMA_LIMITS.context).optional(),
  limits: z.string().trim().max(DHARMA_LIMITS.context).optional(),
};

export function ipOf(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Same per-visitor limits as the chat; `cost` = number of AI calls this request makes. */
export function checkLimits(request: Request, cost: number): Response | null {
  const ip = ipOf(request);
  const minute = rateLimit(`chat:${ip}`, Number(process.env.CHAT_MINUTE_LIMIT) || 12, 60_000, cost);
  if (!minute.ok)
    return Response.json(
      { error: "Please wait a minute before asking again." },
      { status: 429, headers: { "Retry-After": String(minute.retryAfter) } },
    );
  const day = rateLimit(
    `chat-day:${ip}`,
    Number(process.env.CHAT_DAILY_LIMIT) || 60,
    86_400_000,
    cost,
  );
  if (!day.ok)
    return Response.json(
      { error: "You've reached today's limit for this free site. Please come back tomorrow." },
      { status: 429, headers: { "Retry-After": String(day.retryAfter) } },
    );
  return null;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
