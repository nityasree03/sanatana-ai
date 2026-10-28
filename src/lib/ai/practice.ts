import type { AiProvider } from "./types";

/**
 * Offline stand-in for tests and local demos. It does not think: it echoes which passages it was
 * given, in the same JSON shape the real AI must return, and every reply says it is practice mode.
 * It is only used when AI_PROVIDER=practice is set explicitly.
 */
export function createPracticeProvider(): AiProvider {
  return {
    label: "Practice mode",
    model: "practice",
    practice: true,
    async generate(req) {
      const last = req.turns.at(-1)?.text ?? "";
      const ids = [...last.matchAll(/^\[([a-z0-9.\-]+)\]/gm)].map((m) => m[1]).slice(0, 2);
      return {
        model: "practice",
        text: JSON.stringify({
          reply:
            "Practice mode: no real AI is connected, so this is a placeholder reply. " +
            (ids.length
              ? "The passages below were found for your question; read them in full in the Scripture Explorer."
              : "No passage in the library matched your question."),
          citations: ids.map((id) => ({ id, how: "Found by the search for your question." })),
          grounded: ids.length > 0,
        }),
      };
    },
  };
}
