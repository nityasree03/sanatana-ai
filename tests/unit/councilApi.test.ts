// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiProvider } from "@/lib/ai";

vi.mock("server-only", () => ({}));

// Lets one test swap in a provider that fails for a single companion.
let override: AiProvider | null | undefined;
vi.mock("@/lib/ai", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/ai")>();
  return {
    ...real,
    getProvider: (env?: NodeJS.ProcessEnv) =>
      override !== undefined ? override : real.getProvider(env),
  };
});

import { POST, type CouncilResponse } from "@/app/api/council/route";
import { createPracticeProvider } from "@/lib/ai/practice";
import { parseSynthesis } from "@/lib/council/council";
import { rateLimit } from "@/lib/rateLimit";

let ipCounter = 0;
function req(body: unknown, ip = `10.2.0.${++ipCounter}`) {
  return new Request("http://localhost/api/council", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  override = undefined;
});

describe("POST /api/council", () => {
  it("without an AI, each companion shows passages from its own texts", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    const data = (await (
      await POST(req({ question: "how do I find courage" }))
    ).json()) as CouncilResponse;
    expect(data.mode).toBe("scripture-only");
    expect(data.notice).toMatch(/isn't connected/);
    expect(data.answers.map((a) => a.companion)).toEqual([
      "krishna",
      "shiva",
      "hanuman",
      "parvati",
    ]);
    for (const a of data.answers) {
      expect(a.reply).toBeUndefined();
      expect(a.related.length).toBeGreaterThan(0);
      for (const p of a.related) expect(p.companions).toContain(a.companion);
    }
    expect(data.synthesis).toBeUndefined();
  });

  it("with the practice AI, gives four separate cited answers and a labelled comparison", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await POST(req({ question: "how do I stay calm when I am afraid" }))
    ).json()) as CouncilResponse;
    expect(data.mode).toBe("ai");
    expect(data.practice).toBe(true);
    expect(data.answers).toHaveLength(4);
    for (const a of data.answers) {
      expect(a.mode).toBe("ai");
      expect(a.citations.length).toBeGreaterThan(0);
      // Council answers draw only on the companion's own texts, so perspectives stay distinct.
      for (const c of a.citations) {
        expect(c.passage.companions).toContain(a.companion);
        expect(c.passage.href).toContain(`#${c.id}`);
        expect(c.reflection).toBeTruthy();
      }
    }
    expect(data.synthesis?.agree.length).toBeGreaterThan(0);
    expect(data.synthesis?.differ.length).toBeGreaterThan(0);
  });

  it("answers a crisis message once with support resources and never calls the AI", async () => {
    const generate = vi.fn();
    override = { label: "Spy", model: "m", practice: false, generate };
    const data = (await (
      await POST(req({ question: "I want to end my life" }))
    ).json()) as CouncilResponse;
    expect(data.mode).toBe("crisis");
    expect(data.crisisReply).toMatch(/988/);
    expect(data.answers).toEqual([]);
    expect(generate).not.toHaveBeenCalled();
  });

  it("keeps the other answers when one companion fails", async () => {
    const practice = createPracticeProvider();
    override = {
      ...practice,
      label: "Test",
      practice: false,
      generate: async (r) => {
        if (r.system.includes('"Shiva"')) throw new Error("boom");
        return practice.generate(r);
      },
    };
    const data = (await (
      await POST(req({ question: "how should I deal with failure" }))
    ).json()) as CouncilResponse;
    const shiva = data.answers.find((a) => a.companion === "shiva")!;
    expect(shiva.mode).toBe("scripture-only");
    expect(shiva.related.length).toBeGreaterThan(0);
    expect(data.answers.filter((a) => a.mode === "ai")).toHaveLength(3);
    expect(data.notice).toMatch(/couldn't answer/);
    expect(data.synthesis).toBeDefined();
  });

  it("rejects empty and too-long questions", async () => {
    expect((await POST(req({ question: "   " }))).status).toBe(400);
    expect((await POST(req({ question: "x".repeat(1001) }))).status).toBe(400);
  });

  it("counts a Council question as 5 messages towards the daily limit", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("CHAT_DAILY_LIMIT", "9");
    const ip = "10.2.9.9";
    expect((await POST(req({ question: "what is dharma" }, ip))).status).toBe(200);
    const second = await POST(req({ question: "what is karma" }, ip));
    expect(second.status).toBe(429);
    expect((await second.json()).error).toMatch(/counts as 5 messages/);
  });
});

describe("council helpers", () => {
  it("rate limits by cost", () => {
    expect(rateLimit("cost-test", 6, 60_000, 5).ok).toBe(true);
    expect(rateLimit("cost-test", 6, 60_000, 1).ok).toBe(true);
    expect(rateLimit("cost-test", 6, 60_000, 1).ok).toBe(false);
  });
  it("cleans the AI comparison and rejects an empty one", () => {
    expect(
      parseSynthesis('```json\n{"agree":[" A ", "", 3],"differ":["B","C","D","E"]}\n```'),
    ).toEqual({ agree: ["A"], differ: ["B", "C", "D"] });
    expect(() => parseSynthesis('{"agree":[],"differ":[]}')).toThrow();
  });
});
