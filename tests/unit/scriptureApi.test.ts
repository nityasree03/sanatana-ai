// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/scripture/search/route";

function req(body: unknown, ip = "10.0.0.1") {
  return new Request("http://localhost/api/scripture/search", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/scripture/search", () => {
  it("returns hits for a valid query", async () => {
    const res = await POST(req({ query: "Uma golden", limit: 3, meaning: false }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.usedMeaning).toBe(false);
    expect(json.hits.length).toBeGreaterThan(0);
    expect(json.hits.length).toBeLessThanOrEqual(3);
  });
  it("rejects a query that is too short with a friendly message", async () => {
    const res = await POST(req({ query: "a" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/at least 2/);
  });
  it("rejects unknown filters and malformed JSON", async () => {
    expect((await POST(req({ query: "soul", workId: "made-up" }))).status).toBe(400);
    expect((await POST(req("{not json"))).status).toBe(400);
  });
  // Runs 61 real searches; give it room when the whole suite runs in parallel.
  it("rate-limits a flood from one address", { timeout: 20_000 }, async () => {
    let last = 200;
    for (let i = 0; i < 61; i++) last = (await POST(req({ query: "soul" }, "10.9.9.9"))).status;
    expect(last).toBe(429);
  });
});
