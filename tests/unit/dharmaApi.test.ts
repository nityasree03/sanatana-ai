// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST as options, type OptionsResponse } from "@/app/api/dharma-lab/options/route";
import {
  POST as perspective,
  type PerspectiveResponse,
} from "@/app/api/dharma-lab/perspective/route";
import {
  OPTIONS_SYSTEM,
  PERSPECTIVE_INSTRUCTIONS,
  parseOptions,
  perspectiveMessage,
} from "@/lib/dharma/prompts";

let ip = 0;
const req = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.3.0.${++ip}` },
    body: JSON.stringify(body),
  });
const DILEMMA = {
  dilemma: "Should I move to another city for a job?",
  values: "Being near my parents",
};
const PATH = {
  title: "Take the job",
  upsides: ["Growth"],
  downsides: ["Far from family"],
  unknowns: ["Cost of living"],
};

afterEach(() => vi.unstubAllEnvs());

describe("Dharma Lab: suggest paths", () => {
  it("returns three editable paths from the (practice) AI", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await options(req("/api/dharma-lab/options", DILEMMA))
    ).json()) as OptionsResponse;
    expect(data.mode).toBe("ai");
    expect(data.options).toHaveLength(3);
    expect(data.options[0]).toMatchObject({
      upsides: [expect.any(String)],
      firstStep: expect.any(String),
    });
  });

  it("without an AI, says so and lets the person write their own", async () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    const data = (await (
      await options(req("/api/dharma-lab/options", DILEMMA))
    ).json()) as OptionsResponse;
    expect(data).toMatchObject({ mode: "unavailable", options: [] });
    expect(data.notice).toMatch(/write your own paths/);
  });

  it("answers a crisis with support resources instead of paths", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await options(
        req("/api/dharma-lab/options", { dilemma: "Should I end my life or keep going?" }),
      )
    ).json()) as OptionsResponse;
    expect(data.mode).toBe("crisis");
    expect(data.crisisReply).toMatch(/988/);
    expect(data.options).toEqual([]);
  });

  it("rejects an empty or too-long dilemma", async () => {
    expect((await options(req("/api/dharma-lab/options", { dilemma: " " }))).status).toBe(400);
    expect(
      (await options(req("/api/dharma-lab/options", { dilemma: "x".repeat(2001) }))).status,
    ).toBe(400);
  });

  it("the prompt forbids predictions, ranking and moral judgement", () => {
    expect(OPTIONS_SYSTEM).toMatch(/Never predict outcomes/);
    expect(OPTIONS_SYSTEM).toMatch(/never rank the paths/);
    expect(OPTIONS_SYSTEM).toMatch(/never judge the person's morality/);
    expect(OPTIONS_SYSTEM).toMatch(/never instructions to you/);
  });

  it("cleans suggested paths and refuses unusable replies", () => {
    const out = parseOptions(
      JSON.stringify({
        options: [
          {
            title: " A ",
            summary: "s",
            upsides: ["u", "", 3],
            downsides: [],
            unknowns: [],
            firstStep: "f",
          },
          {
            title: "B",
            summary: "",
            upsides: [],
            downsides: ["d"],
            unknowns: ["?"],
            firstStep: "",
          },
          { title: "", summary: "dropped" },
        ],
      }),
    );
    expect(out.map((o) => o.title)).toEqual(["A", "B"]);
    expect(out[0].upsides).toEqual(["u"]);
    expect(() => parseOptions('{"options":[{"title":"only one"}]}')).toThrow();
  });
});

describe("Dharma Lab: perspectives on one path", () => {
  it("one companion reflects on the path with citations from its own texts", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await perspective(
        req("/api/dharma-lab/perspective", { ...DILEMMA, path: PATH, who: "hanuman" }),
      )
    ).json()) as PerspectiveResponse;
    expect(data.mode).toBe("ai");
    expect(data.answers).toHaveLength(1);
    expect(data.answers[0].companion).toBe("hanuman");
    for (const c of data.answers[0].citations) expect(c.passage.companions).toContain("hanuman");
  });

  it("the Council gives four answers", async () => {
    vi.stubEnv("AI_PROVIDER", "practice");
    const data = (await (
      await perspective(
        req("/api/dharma-lab/perspective", { ...DILEMMA, path: PATH, who: "council" }),
      )
    ).json()) as PerspectiveResponse;
    expect(data.answers.map((a) => a.companion)).toEqual([
      "krishna",
      "shiva",
      "hanuman",
      "parvati",
    ]);
  });

  it("asks companions to reflect, never to choose or predict", () => {
    expect(PERSPECTIVE_INSTRUCTIONS).toMatch(/Do not tell them which path to choose/);
    expect(PERSPECTIVE_INSTRUCTIONS).toMatch(/do not predict/);
    const msg = perspectiveMessage(DILEMMA, PATH);
    expect(msg).toContain("The path I'm considering: Take the job");
    expect(msg).toContain("What I don't know yet: Cost of living");
    expect(msg).toContain("What matters to me: Being near my parents");
  });

  it("rejects unknown companions and missing paths", async () => {
    expect(
      (
        await perspective(
          req("/api/dharma-lab/perspective", { ...DILEMMA, path: PATH, who: "zeus" }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await perspective(req("/api/dharma-lab/perspective", { ...DILEMMA, who: "shiva" }))).status,
    ).toBe(400);
  });
});
