// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createGeminiProvider } from "@/lib/ai/gemini";
import { getProvider } from "@/lib/ai";
import { AiError } from "@/lib/ai/types";
import { parseReply, userTurnWithPassages } from "@/lib/chat/grounding";
import { REPLY_SCHEMA, systemPrompt } from "@/lib/chat/personas";
import { chatPassages, searchTextFor } from "@/lib/chat/retrieval";
import { mentionsSelfHarm } from "@/lib/chat/safety";
import { getPassage } from "@/lib/scripture/data";

const p247 = getPassage("bg-2.47")!;
const p248 = getPassage("bg-2.48")!;

describe("crisis check", () => {
  it.each([
    "I want to kill myself",
    "sometimes I think about suicide",
    "i don't want to live anymore",
    "everyone would be better off without me",
    "I've been self-harming again",
    "I want to end my life",
    "I've been thinking about ending my life.",
    "I keep thinking of taking my own life",
    "sometimes I wish I were dead",
    "I don't want to wake up tomorrow",
    "there's no point in living",
    "I've been cutting myself",
    "thinking about an overdose",
  ])("flags: %s", (t) => expect(mentionsSelfHarm(t)).toBe(true));
  it.each([
    "how do I stop getting angry",
    "Arjuna did not want to kill his teachers",
    "what does the Gita say about death",
    "I'm dying to know what Krishna says",
    "Krishna ends the war's confusion for Arjuna",
    "how do I end my day peacefully",
    "my life feels busy at the end of each week",
  ])("does not flag: %s", (t) => expect(mentionsSelfHarm(t)).toBe(false));
});

describe("grounding checks", () => {
  it("keeps only citations to passages that were provided", () => {
    const raw = JSON.stringify({
      reply: "Act without clinging to results.",
      citations: [
        { id: "bg-2.47", how: "Work, not its fruits." },
        { id: "bg-99.1", how: "invented" },
        { id: "[bg-2.48]", how: "Evenness." },
        { id: "bg-2.47", how: "duplicate" },
      ],
      grounded: true,
    });
    const r = parseReply(raw, [p247, p248]);
    expect(r.citations.map((c) => c.id)).toEqual(["bg-2.47", "bg-2.48"]);
    expect(r.rejectedCitations).toEqual(["bg-99.1"]);
    expect(r.grounded).toBe(true);
  });
  it("treats a reply without valid citations as ungrounded, whatever the AI claims", () => {
    const r = parseReply(
      JSON.stringify({
        reply: "Some thoughts.",
        citations: [{ id: "x-1", how: "" }],
        grounded: true,
      }),
      [p247],
    );
    expect(r.grounded).toBe(false);
    expect(r.citations).toEqual([]);
  });
  it("accepts JSON wrapped in a code fence and rejects non-JSON", () => {
    expect(
      parseReply('```json\n{"reply":"ok","citations":[],"grounded":false}\n```', []).reply,
    ).toBe("ok");
    expect(() => parseReply("Sure! Here's my answer", [])).toThrow();
  });
  it("puts passage ids, references and translators in front of the question", () => {
    const turn = userTurnWithPassages("How do I act?", [p247]);
    expect(turn).toContain("[bg-2.47] Bhagavad Gita 2.47 — Annie Besant translation");
    expect(turn.trim().endsWith("How do I act?")).toBe(true);
  });
});

describe("personas", () => {
  it("every companion prompt says it is an AI, forbids invented verses and predictions", () => {
    for (const id of ["krishna", "shiva", "hanuman", "parvati"] as const) {
      const s = systemPrompt(id);
      expect(s).toMatch(/AI simulation/);
      expect(s).toMatch(/Never invent verses/);
      expect(s).toMatch(/No predictions/);
    }
    expect(REPLY_SCHEMA.required).toEqual(["reply", "citations", "grounded"]);
  });
});

describe("chat retrieval", () => {
  it("prefers the companion's texts, keeps at most two passages per chapter and returns six", () => {
    const ps = chatPassages({
      query: "how do I stay strong when things are hard",
      companion: "hanuman",
    });
    expect(ps.length).toBeLessThanOrEqual(6);
    expect(ps.slice(0, 2).some((p) => p.companions.includes("hanuman"))).toBe(true);
    const perSection = new Map<string, number>();
    for (const p of ps) perSection.set(p.section, (perSection.get(p.section) ?? 0) + 1);
    expect(Math.max(...perSection.values())).toBeLessThanOrEqual(2);
  });
  it("adds the previous question to short follow-ups", () => {
    expect(searchTextFor(["how do I control anger", "why?"])).toBe("how do I control anger why?");
    expect(searchTextFor(["a", "what does the Gita say about duty and action"])).toBe(
      "what does the Gita say about duty and action",
    );
  });
});

describe("AI provider selection", () => {
  it("uses no AI without a key, practice only when asked, Gemini with a key", () => {
    expect(getProvider({} as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(
      getProvider({ GEMINI_API_KEY: "your-key-here" } as unknown as NodeJS.ProcessEnv),
    ).toBeNull();
    expect(getProvider({ AI_PROVIDER: "practice" } as unknown as NodeJS.ProcessEnv)?.practice).toBe(
      true,
    );
    const g = getProvider({ GEMINI_API_KEY: "k" } as unknown as NodeJS.ProcessEnv);
    expect(g?.label).toBe("Gemini");
    expect(g?.model).toBe("gemini-3.8-flash");
  });
});

describe("Gemini adapter (mocked network)", () => {
  const ok = (text: string) =>
    new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }] }),
      {
        status: 200,
      },
    );

  it("sends the key in a header (not the URL), the system prompt and the JSON schema", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(ok('{"reply":"hi","citations":[],"grounded":false}'));
    const g = createGeminiProvider({ apiKey: "SECRET", model: "gemini-test", fetchImpl });
    const r = await g.generate({
      system: "SYS",
      turns: [{ role: "user", text: "Q" }],
      jsonSchema: { type: "object" },
    });
    expect(r.text).toContain('"reply":"hi"');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent",
    );
    expect(String(url)).not.toContain("SECRET");
    expect(init.headers["x-goog-api-key"]).toBe("SECRET");
    const body = JSON.parse(init.body);
    expect(body.systemInstruction.parts[0].text).toBe("SYS");
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "Q" }] }]);
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseJsonSchema).toEqual({ type: "object" });
  });

  it("maps quota errors and tries the fallback model once", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 }),
      )
      .mockResolvedValueOnce(ok("fallback answer"));
    const g = createGeminiProvider({
      apiKey: "k",
      model: "main",
      fallbackModel: "lite",
      fetchImpl,
    });
    const r = await g.generate({ system: "s", turns: [{ role: "user", text: "q" }] });
    expect(r).toEqual({ text: "fallback answer", model: "lite" });
    expect(String(fetchImpl.mock.calls[1][0])).toContain("/models/lite:generateContent");
  });

  it("reports quota, safety blocks and bad keys as typed errors", async () => {
    const cases: [Response, string][] = [
      [new Response(JSON.stringify({ error: { message: "q" } }), { status: 429 }), "quota"],
      [
        new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), {
          status: 200,
        }),
        "blocked",
      ],
      [
        new Response(JSON.stringify({ candidates: [{ finishReason: "SAFETY" }] }), { status: 200 }),
        "blocked",
      ],
      [
        new Response(JSON.stringify({ error: { message: "API key not valid" } }), { status: 400 }),
        "config",
      ],
      [new Response(JSON.stringify({ error: {} }), { status: 503 }), "unavailable"],
    ];
    for (const [res, kind] of cases) {
      const g = createGeminiProvider({
        apiKey: "k",
        model: "m",
        fetchImpl: vi.fn().mockResolvedValue(res),
      });
      await expect(
        g.generate({ system: "s", turns: [{ role: "user", text: "q" }] }),
      ).rejects.toMatchObject({ kind });
    }
    expect(new AiError("quota", "x")).toBeInstanceOf(Error);
  });
});
