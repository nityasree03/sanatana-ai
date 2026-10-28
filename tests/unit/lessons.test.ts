import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { COMPANIONS } from "@/lib/companions";
import { LESSONS, getLesson, normalise } from "@/lib/learning/lessons";
import { getPassage } from "@/lib/scripture/data";

describe("Scripture Learning Studio lessons", () => {
  it("has 8 lessons with unique ids, two per companion", () => {
    expect(LESSONS).toHaveLength(8);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(8);
    for (const c of COMPANIONS) expect(LESSONS.filter((l) => l.companion === c.id)).toHaveLength(2);
    expect(getLesson("hanuman-leap")?.title).toMatch(/Hanuman/);
    expect(getLesson("nope")).toBeUndefined();
  });

  for (const lesson of LESSONS) {
    describe(lesson.title, () => {
      it("uses only passages that exist, belong to the companion, in reading order", () => {
        const ps = lesson.passages.map((id) => getPassage(id));
        ps.forEach((p, i) => expect(p, lesson.passages[i]).toBeDefined());
        for (const p of ps) expect(p!.companions).toContain(lesson.companion);
        const orders = ps.map((p) => `${p!.work_id}`);
        expect(new Set(orders).size).toBe(1);
        const o = ps.map((p) => p!.order);
        expect([...o].sort((a, b) => a - b)).toEqual(o);
      });

      it("shows each Devanagari key term inside one of its verses", () => {
        const originals = lesson.passages
          .map((id) => getPassage(id)!.original?.text ?? "")
          .join(" ");
        for (const t of lesson.terms)
          if (t.devanagari) expect(originals, `${t.term}`).toContain(t.devanagari);
      });

      it("has 3 questions, each answered word for word by a line of one of its verses", () => {
        expect(lesson.questions).toHaveLength(3);
        for (const q of lesson.questions) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options[q.answer], q.id).toBeDefined();
          expect(lesson.passages).toContain(q.support.passage);
          const text = normalise(getPassage(q.support.passage)!.translation.text);
          expect(text, `${lesson.id} ${q.id}`).toContain(normalise(q.support.quote));
        }
      });
    });
  }

  it("does not always put the right answer in the same place", () => {
    const spots = new Set(LESSONS.flatMap((l) => l.questions.map((q) => q.answer)));
    expect(spots.size).toBeGreaterThanOrEqual(3);
  });
});
