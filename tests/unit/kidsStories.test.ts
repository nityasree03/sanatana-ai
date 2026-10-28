import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { ART_IDS } from "@/components/kids/art/StoryArt";
import { normalise } from "@/lib/learning/lessons";
import { STORIES, getStory, mixedOrder, storySteps } from "@/lib/kids/stories";
import { AGE_RANGES } from "@/lib/kids/types";
import { getPassage } from "@/lib/scripture/data";

/** Words that shame, frighten or pressure a child; none may appear in what children read. */
const HARSH =
  /\b(wrong|bad|naughty|stupid|wicked|shame|ashamed|fail(ed|ure)?|punish\w*|kill\w*|dead|die[sd]?|blood|evil|hell|never good)\b/i;

describe("Kids stories", () => {
  it("have unique ids and companions", () => {
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
    expect(new Set(STORIES.map((s) => s.companion)).size).toBe(STORIES.length);
    expect(getStory("nope")).toBeUndefined();
  });

  for (const story of STORIES) {
    describe(story.title, () => {
      it("cites library passages of its companion, and quotes them exactly for ages 10–12", () => {
        for (const scene of story.scenes) {
          expect(scene.passages.length).toBeGreaterThan(0);
          for (const id of scene.passages) {
            const p = getPassage(id);
            expect(p, id).toBeDefined();
            expect(p!.companions).toContain(story.companion);
          }
          expect(scene.passages).toContain(scene.verse.passage);
          const text = normalise(getPassage(scene.verse.passage)!.translation.text);
          expect(text, `${scene.id}`).toContain(normalise(scene.verse.quote));
        }
      });

      it("has text for every age and a picture with a description for every scene", () => {
        expect(new Set(story.scenes.map((s) => s.id)).size).toBe(story.scenes.length);
        for (const scene of story.scenes) {
          for (const age of AGE_RANGES)
            expect(scene.text[age].trim().length, `${scene.id} ${age}`).toBeGreaterThan(20);
          // Younger versions are shorter.
          expect(scene.text["4-5"].length).toBeLessThanOrEqual(scene.text["10-12"].length + 20);
          expect(ART_IDS.has(scene.art), scene.art).toBe(true);
          expect(scene.alt.length).toBeGreaterThan(20);
        }
        for (const age of AGE_RANGES) expect(story.takeaway[age].length).toBeGreaterThan(20);
        expect(story.source).toMatch(/public-domain/);
        expect(story.objectives.length).toBeGreaterThanOrEqual(3);
      });

      it("has valid activities, and every age gets at least two", () => {
        const sceneIds = story.scenes.map((s) => s.id);
        for (const a of story.activities) {
          expect(sceneIds, a.id).toContain(a.after);
          expect(a.ages.length).toBeGreaterThan(0);
          if (a.kind === "picture-choice" || a.kind === "question") {
            expect(a.options[a.answer], a.id).toBeDefined();
            expect(new Set(a.options.map((o) => (typeof o === "string" ? o : o.label))).size).toBe(
              a.options.length,
            );
          }
          if (a.kind === "picture-choice")
            for (const o of a.options) expect(ART_IDS.has(o.art), o.art).toBe(true);
          if (a.kind === "sequence") {
            // In story order, and asked only after the last of its scenes.
            const idx = a.scenes.map((id) => sceneIds.indexOf(id));
            expect(idx.every((i) => i >= 0)).toBe(true);
            expect([...idx].sort((x, y) => x - y)).toEqual(idx);
            expect(sceneIds.indexOf(a.after)).toBeGreaterThanOrEqual(Math.max(...idx));
          }
          if (a.kind === "match")
            expect(new Set(a.pairs.map((p) => p.right)).size).toBe(a.pairs.length);
        }
        for (const age of AGE_RANGES)
          expect(
            storySteps(story, age).filter((s) => s.kind === "activity").length,
            age,
          ).toBeGreaterThanOrEqual(2);
      });

      it("uses gentle words in everything a child reads", () => {
        const childText = [
          ...story.scenes.flatMap((s) => Object.values(s.text)),
          ...Object.values(story.takeaway),
          ...story.activities.flatMap((a) => [a.prompt, a.praise, "hint" in a ? a.hint : ""]),
        ];
        for (const t of childText) expect(t, t).not.toMatch(HARSH);
      });
    });
  }
});

describe("story steps", () => {
  const story = STORIES[0];
  it("puts each activity after its scene and ends with the takeaway", () => {
    const steps = storySteps(story, "6-9");
    expect(steps.at(-1)).toEqual({ kind: "end" });
    expect(steps.filter((s) => s.kind === "scene")).toHaveLength(story.scenes.length);
    steps.forEach((s, i) => {
      if (s.kind === "activity") {
        const before = steps
          .slice(0, i)
          .filter((x) => x.kind === "scene")
          .at(-1);
        expect(before?.kind === "scene" && before.scene.id).toBe(s.activity.after);
      }
    });
  });

  it("leaves out activities when the caregiver turns them off", () => {
    expect(storySteps(story, "4-5", false).every((s) => s.kind !== "activity")).toBe(true);
  });

  it("never starts the order puzzle already solved", () => {
    for (let n = 2; n <= 6; n++) {
      const m = mixedOrder(n);
      expect([...m].sort()).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(m).not.toEqual(Array.from({ length: n }, (_, i) => i));
    }
  });
});
