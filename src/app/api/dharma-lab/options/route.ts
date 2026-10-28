import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { failureKind } from "@/lib/chat/answer";
import { CRISIS_REPLY, mentionsSelfHarm } from "@/lib/chat/safety";
import { DilemmaFields, checkLimits, readJson } from "@/lib/dharma/api";
import type { SuggestedOption } from "@/lib/dharma/model";
import { OPTIONS_SCHEMA, OPTIONS_SYSTEM, optionsPrompt, parseOptions } from "@/lib/dharma/prompts";

const Body = z.object({
  ...DilemmaFields,
  existing: z.array(z.string().trim().max(120)).max(8).optional(),
});

export interface OptionsResponse {
  mode: "ai" | "unavailable" | "crisis";
  practice?: boolean;
  options: SuggestedOption[];
  notice?: string;
  crisisReply?: string;
}

const FAILED: Record<string, string> = {
  quota: "The free AI service has reached its limit for now. You can still write your own paths.",
  unavailable: "The AI service didn't respond. You can still write your own paths, or try again.",
  blocked: "The AI's safety filter declined this. You can still write your own paths.",
  failed: "Something went wrong suggesting paths. You can still write your own, or try again.",
};

/** POST /api/dharma-lab/options — three suggested paths. Not stored or logged. */
export async function POST(request: Request) {
  const limited = checkLimits(request, 1);
  if (limited) return limited;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  const input = parsed.data;

  if ([input.dilemma, input.values, input.limits].some((t) => t && mentionsSelfHarm(t))) {
    const res: OptionsResponse = { mode: "crisis", options: [], crisisReply: CRISIS_REPLY };
    return Response.json(res);
  }

  const provider = getProvider();
  if (!provider) {
    const res: OptionsResponse = {
      mode: "unavailable",
      options: [],
      notice: "The AI isn't connected on this site yet. You can write your own paths below.",
    };
    return Response.json(res);
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await provider.generate({
        system: OPTIONS_SYSTEM,
        turns: [{ role: "user", text: optionsPrompt(input, input.existing) }],
        jsonSchema: OPTIONS_SCHEMA as unknown as Record<string, unknown>,
        temperature: 0.7,
        maxOutputTokens: 1400,
      });
      const res: OptionsResponse = {
        mode: "ai",
        practice: provider.practice || undefined,
        options: parseOptions(result.text),
      };
      return Response.json(res);
    } catch (err) {
      const kind = failureKind(err);
      if (kind !== "failed" || attempt === 1) {
        console.error(`dharma-lab options: AI error (${kind})`); // never log content
        const res: OptionsResponse = { mode: "unavailable", options: [], notice: FAILED[kind] };
        return Response.json(res);
      }
    }
  }
  return Response.json({ error: "Unexpected" }, { status: 500 });
}
