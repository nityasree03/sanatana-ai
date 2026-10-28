import { describe, expect, it } from "vitest";
import {
  DecisionMapSchema,
  emptyMap,
  pointCounts,
  reduce,
  type Action,
  type DecisionMap,
} from "@/lib/dharma/model";

// Deterministic ids and times, so every result can be compared exactly.
function deps() {
  let n = 0;
  let t = 0;
  return {
    newId: () => `id${++n}`,
    now: () => `2026-10-28T10:00:${String(t++).padStart(2, "0")}.000Z`,
  };
}

function run(actions: Action[]) {
  const d = deps();
  return actions.reduce((m, a) => reduce(m, a, d), emptyMap(d));
}

const SUGGESTED = [
  {
    title: "Take the new job",
    summary: "Move to the city role.",
    upsides: ["Growth", "Higher pay"],
    downsides: ["Long commute"],
    unknowns: ["Team culture"],
    firstStep: "Ask to meet the team",
  },
  {
    title: "Stay and ask for more responsibility",
    summary: "",
    upsides: ["Stability"],
    downsides: [],
    unknowns: ["Whether the manager agrees"],
    firstStep: "Book a talk with my manager",
  },
  {
    title: "Wait a month and gather information",
    summary: "",
    upsides: [],
    downsides: ["Offer may expire"],
    unknowns: [],
    firstStep: "Ask the new company for a deadline",
  },
];

describe("Dharma Lab decision model", () => {
  it("keeps the dilemma, context and three suggested paths with their points, marked as AI", () => {
    const m = run([
      { type: "setText", field: "dilemma", value: "Should I change jobs?" },
      { type: "setText", field: "values", value: "Family time" },
      { type: "addSuggested", options: SUGGESTED },
    ]);
    expect(m.dilemma).toBe("Should I change jobs?");
    expect(m.values).toBe("Family time");
    expect(m.options.map((o) => o.title)).toEqual(SUGGESTED.map((s) => s.title));
    expect(m.options.every((o) => o.origin === "ai")).toBe(true);
    expect(pointCounts(m.options[0])).toEqual({ up: 2, down: 1, unknown: 1 });
    expect(DecisionMapSchema.parse(m)).toEqual(m);
  });

  it("edits, adds and removes options and points exactly as asked", () => {
    let m = run([
      { type: "addSuggested", options: SUGGESTED },
      { type: "addOption", title: "  Talk to my parents first  " },
    ]);
    const mine = m.options[3];
    expect(mine).toMatchObject({ title: "Talk to my parents first", origin: "me", points: [] });
    const d = deps();
    m = reduce(
      m,
      { type: "updateOption", optionId: mine.id, patch: { firstStep: "Call tonight" } },
      d,
    );
    m = reduce(m, { type: "addPoint", optionId: mine.id, kind: "up", text: "Their experience" }, d);
    m = reduce(m, { type: "addPoint", optionId: mine.id, kind: "unknown", text: "   " }, d); // ignored
    const pt = m.options[3].points[0];
    m = reduce(
      m,
      { type: "updatePoint", optionId: mine.id, pointId: pt.id, text: "Their advice" },
      d,
    );
    expect(m.options[3]).toMatchObject({
      firstStep: "Call tonight",
      points: [{ kind: "up", text: "Their advice" }],
    });
    m = reduce(m, { type: "updatePoint", optionId: mine.id, pointId: pt.id, text: "" }, d); // empty = remove
    expect(m.options[3].points).toEqual([]);
    m = reduce(m, { type: "removeOption", optionId: m.options[1].id }, d);
    expect(m.options.map((o) => o.title)).toEqual([
      "Take the new job",
      "Wait a month and gather information",
      "Talk to my parents first",
    ]);
  });

  it("an empty title never replaces an existing one, and limits are enforced", () => {
    let m = run([{ type: "addOption", title: "Option A" }]);
    const d = deps();
    m = reduce(m, { type: "updateOption", optionId: m.options[0].id, patch: { title: "   " } }, d);
    expect(m.options[0].title).toBe("Option A");
    for (let i = 0; i < 20; i++) m = reduce(m, { type: "addOption", title: `X${i}` }, d);
    expect(m.options).toHaveLength(8);
    expect(reduce(m, { type: "addOption", title: "" }, d)).toBe(m); // no-op keeps identity
  });

  it("records the person's decision, including 'not yet', and clears it if that path is removed", () => {
    let m = run([{ type: "addSuggested", options: SUGGESTED }]);
    const d = deps();
    m = reduce(
      m,
      {
        type: "decide",
        decision: { kind: "option", optionId: m.options[2].id, note: "Need facts" },
      },
      d,
    );
    expect(m.decision).toEqual({ kind: "option", optionId: m.options[2].id, note: "Need facts" });
    // Deciding for a path that doesn't exist is refused.
    expect(
      reduce(m, { type: "decide", decision: { kind: "option", optionId: "nope", note: "" } }, d),
    ).toBe(m);
    m = reduce(m, { type: "removeOption", optionId: m.options[2].id }, d);
    expect(m.decision).toBeNull();
    m = reduce(m, { type: "decide", decision: { kind: "not-yet", note: "Talk to family" } }, d);
    expect(m.decision).toEqual({ kind: "not-yet", note: "Talk to family" });
  });

  it("stores perspectives on the path they were asked about, newest first", () => {
    let m = run([{ type: "addSuggested", options: SUGGESTED }]);
    const d = deps();
    const p = (companion: "krishna" | "shiva", reply: string) => ({
      companion,
      reply,
      grounded: true,
      askedAt: "2026-10-28T10:00:00.000Z",
      citations: [
        {
          passageId: "bg-2.47",
          reference: "Bhagavad Gita 2.47",
          translator: "Annie Besant",
          excerpt: "Thy business is with the action only",
          href: "/scriptures/bhagavad-gita/2#bg-2.47",
          how: "On action",
          reflection: "Act today",
        },
      ],
    });
    m = reduce(
      m,
      { type: "addPerspectives", optionId: m.options[0].id, perspectives: [p("krishna", "A")] },
      d,
    );
    m = reduce(
      m,
      { type: "addPerspectives", optionId: m.options[0].id, perspectives: [p("shiva", "B")] },
      d,
    );
    expect(m.options[0].perspectives.map((x) => x.reply)).toEqual(["B", "A"]);
    expect(m.options[1].perspectives).toEqual([]);
    m = reduce(
      m,
      {
        type: "removePerspective",
        optionId: m.options[0].id,
        perspectiveId: m.options[0].perspectives[0].id,
      },
      d,
    );
    expect(m.options[0].perspectives.map((x) => x.reply)).toEqual(["A"]);
  });

  it("a saved map loads back exactly, and updatedAt moves only when something changes", () => {
    const m: DecisionMap = run([
      { type: "setText", field: "dilemma", value: "Q" },
      { type: "addSuggested", options: SUGGESTED },
    ]);
    const roundTrip = DecisionMapSchema.parse(JSON.parse(JSON.stringify(m)));
    const d = deps();
    expect(reduce(emptyMap(d), { type: "load", map: roundTrip }, d)).toEqual(m);
    const same = reduce(
      m,
      { type: "addPoint", optionId: m.options[0].id, kind: "up", text: "" },
      d,
    );
    expect(same.updatedAt).toBe(m.updatedAt);
  });
});
