import "server-only";
import { createGeminiProvider } from "./gemini";
import { createPracticeProvider } from "./practice";
import type { AiProvider } from "./types";

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

/**
 * Which AI to use, from server-side environment variables only:
 * - AI_PROVIDER=practice  → offline practice provider (tests, demos)
 * - GEMINI_API_KEY set    → Gemini (GEMINI_MODEL, optional GEMINI_FALLBACK_MODEL)
 * - otherwise             → null: chat works in scripture-only mode
 */
export function getProvider(env: NodeJS.ProcessEnv = process.env): AiProvider | null {
  if (env.AI_PROVIDER === "practice") return createPracticeProvider();
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "your-key-here") return null;
  return createGeminiProvider({
    apiKey,
    model: env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    fallbackModel: env.GEMINI_FALLBACK_MODEL?.trim() || undefined,
  });
}

export { AiError } from "./types";
export type { AiProvider, ChatTurn } from "./types";
