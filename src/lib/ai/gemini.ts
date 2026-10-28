import "server-only";
import { AiError, type AiProvider, type GenerateRequest, type GenerateResult } from "./types";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 25_000;

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

/**
 * Google Gemini via its REST API (no SDK). The API key is read on the server only and sent in
 * a header, never in the URL, so it does not end up in logs. A fallback model (optional) is
 * tried once when the main model is out of quota or unavailable.
 */
export function createGeminiProvider(opts: {
  apiKey: string;
  model: string;
  fallbackModel?: string;
  fetchImpl?: typeof fetch;
}): AiProvider {
  const doFetch = opts.fetchImpl ?? fetch;

  async function call(model: string, req: GenerateRequest): Promise<GenerateResult> {
    const body = {
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      generationConfig: {
        temperature: req.temperature ?? 0.6,
        maxOutputTokens: req.maxOutputTokens ?? 1024,
        ...(req.jsonSchema
          ? { responseMimeType: "application/json", responseJsonSchema: req.jsonSchema }
          : {}),
      },
    };
    let res: Response;
    try {
      res = await doFetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": opts.apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      throw new AiError("unavailable", `Could not reach Gemini: ${(err as Error).message}`);
    }
    let data: GeminiResponse;
    try {
      data = (await res.json()) as GeminiResponse;
    } catch {
      throw new AiError("bad-response", `Gemini returned status ${res.status} without JSON`);
    }
    if (res.status === 429) throw new AiError("quota", data.error?.message ?? "Rate limit reached");
    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404)
      throw new AiError(
        "config",
        data.error?.message ?? `Gemini rejected the request (${res.status})`,
      );
    if (!res.ok)
      throw new AiError("unavailable", data.error?.message ?? `Gemini error ${res.status}`);
    if (data.promptFeedback?.blockReason)
      throw new AiError(
        "blocked",
        `Blocked by Gemini safety filters (${data.promptFeedback.blockReason})`,
      );
    const cand = data.candidates?.[0];
    if (cand?.finishReason === "SAFETY" || cand?.finishReason === "PROHIBITED_CONTENT")
      throw new AiError("blocked", "Gemini's safety filters stopped this reply");
    const text = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    if (!text.trim()) throw new AiError("bad-response", "Gemini returned an empty reply");
    return { text, model };
  }

  return {
    label: "Gemini",
    model: opts.model,
    practice: false,
    async generate(req) {
      try {
        return await call(opts.model, req);
      } catch (err) {
        const retry =
          opts.fallbackModel &&
          err instanceof AiError &&
          (err.kind === "quota" || err.kind === "unavailable");
        if (!retry) throw err;
        return call(opts.fallbackModel!, req);
      }
    },
  };
}
