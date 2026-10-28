// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST, type ChatResponse } from "@/app/api/chat/route";

let ipCounter = 0;
function req(body: unknown, ip = `10.1.0.${++ipCounter}`) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const ask = (text: string, companion = "krishna") => ({
  companion,
  messages: [{ role: "user", text }],
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/chat", () => {
  it("without an AI key, answers in scripture-only mode with related passages", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await POST(req(ask("how do I stop getting so angry")));
    const data = (await res.json()) as ChatResponse;
    expect(res.status).toBe(200);
    expect(data.mode).toBe("scripture-only");
    expect(data.notice).toMatch(/isn't connected/);
    expect(data.related.length).toBeGreaterThan(0);
    expect(data.reply).toBeUndefined();
  });

  it("with the practice AI, returns a labelled reply whose citations are real passages", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const res = await POST(req(ask("my mind is restless and won't stay still")));
    const data = (await res.json()) as ChatResponse;
    expect(data.mode).toBe("ai");
    expect(data.practice).toBe(true);
    expect(data.provider).toBe("Practice mode");
    expect(data.reply).toMatch(/Practice mode/);
    expect(data.citations.length).toBeGreaterThan(0);
    for (const c of data.citations) expect(c.passage.id).toBe(c.id);
  });

  it("never sends a message about self-harm to the AI and replies with crisis resources", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await POST(req(ask("I don't want to live anymore")))
    ).json()) as ChatResponse;
    expect(data.mode).toBe("crisis");
    expect(data.reply).toMatch(/988/);
    expect(data.reply).toMatch(/14416/);
  });

  it("falls back to passages when the AI fails", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 }),
      );
    const data = (await (await POST(req(ask("what is my duty")))).json()) as ChatResponse;
    expect(data.mode).toBe("scripture-only");
    expect(data.notice).toMatch(/limit/);
    expect(data.related.length).toBeGreaterThan(0);
    fetchSpy.mockRestore();
  });

  it("rejects bad input", async () => {
    expect((await POST(req("{bad"))).status).toBe(400);
    expect(
      (await POST(req({ companion: "zeus", messages: [{ role: "user", text: "hi" }] }))).status,
    ).toBe(400);
    expect((await POST(req({ companion: "shiva", messages: [] }))).status).toBe(400);
    const long = await POST(req(ask("x".repeat(2001))));
    expect(long.status).toBe(400);
    const lastNotUser = await POST(
      req({
        companion: "shiva",
        messages: [
          { role: "user", text: "hi" },
          { role: "companion", text: "hello" },
        ],
      }),
    );
    expect(lastNotUser.status).toBe(400);
  });

  it("limits how fast one address can send", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    let last = 200;
    for (let i = 0; i < 13; i++)
      last = (await POST(req(ask("hello there friend"), "10.9.9.1"))).status;
    expect(last).toBe(429);
  });
});
