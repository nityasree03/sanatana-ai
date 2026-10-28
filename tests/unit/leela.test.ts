// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { isKnownLeelaPath } from "@/proxy";
import { getCompanion } from "@/lib/companions";
import { SCENES, getMoment } from "@/lib/leela/scenes";
import { getPassage, sectionLinks } from "@/lib/scripture/data";

// The text each scene says it follows (its passages must come from that work).
const WORK: Record<string, string> = {
  "arjunas-despair": "bhagavad-gita",
  "nachiketa-and-death": "katha-upanishad",
  "the-great-leap": "valmiki-ramayana",
  "umas-penance": "kumarasambhava",
};

describe("Living Leela scenes", () => {
  it("has exactly one scene per companion", () => {
    expect(SCENES.map((s) => s.companion).sort()).toEqual(
      ["hanuman", "krishna", "parvati", "shiva"].sort(),
    );
  });

  for (const scene of SCENES) {
    describe(scene.title, () => {
      const ids = scene.moments.map((m) => m.id);

      it("cites only real passages from the text it names, in reading order", () => {
        for (const m of scene.moments) {
          expect(m.passages.length, m.id).toBeGreaterThan(0);
          for (const id of m.passages) {
            const p = getPassage(id);
            expect(p, `${scene.id}/${m.id}: ${id}`).toBeDefined();
            expect(p!.work_id).toBe(WORK[scene.id]);
          }
          const orders = m.passages.map((id) => getPassage(id)!.order);
          expect(orders, `${m.id} passages out of order`).toEqual(
            [...orders].sort((a, b) => a - b),
          );
        }
      });

      it("has unique moments, valid choices, short retellings and a question for the companion", () => {
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toContain(scene.start);
        for (const m of scene.moments) {
          for (const c of m.choices) expect(ids, `${m.id} -> ${c.to}`).toContain(c.to);
          expect(new Set(m.choices.map((c) => c.label)).size).toBe(m.choices.length);
          expect(m.retelling.length).toBeLessThan(600);
          expect(m.ask.endsWith("?")).toBe(true);
        }
      });

      it("reaches every moment from the start, and every moment can reach an ending", () => {
        const seen = new Set<string>([scene.start]);
        const queue = [scene.start];
        while (queue.length) {
          for (const c of getMoment(scene, queue.shift()!)!.choices)
            if (!seen.has(c.to)) {
              seen.add(c.to);
              queue.push(c.to);
            }
        }
        expect([...seen].sort()).toEqual([...ids].sort());

        const canEnd = (id: string, visiting = new Set<string>()): boolean => {
          const m = getMoment(scene, id)!;
          if (m.choices.length === 0) return true;
          if (visiting.has(id)) return false;
          visiting.add(id);
          return m.choices.some((c) => canEnd(c.to, new Set(visiting)));
        };
        for (const id of ids) expect(canEnd(id), `${id} cannot reach an ending`).toBe(true);
      });

      it("keeps detours as side trips: they return to the story and never end it", () => {
        for (const m of scene.moments.filter((x) => x.detour)) {
          expect(m.choices).toHaveLength(1);
          expect(getMoment(scene, m.choices[0].to)!.detour).toBeFalsy();
        }
        // Exactly one ending, so every path tells the same story.
        expect(scene.moments.filter((m) => m.choices.length === 0)).toHaveLength(1);
      });

      it("links 'read more' to the chapter its ending comes from", () => {
        const end = scene.moments.find((m) => m.choices.length === 0)!;
        const p = getPassage(end.passages[0])!;
        expect(scene.readMore.href).toBe(sectionLinks()[`${p.work_id}|${p.section}`]);
        expect(getCompanion(scene.companion)).toBeDefined();
      });
    });
  }

  it("only the four scene URLs exist", () => {
    expect(isKnownLeelaPath("/living-leela")).toBe(true);
    expect(isKnownLeelaPath("/living-leela/the-great-leap")).toBe(true);
    expect(isKnownLeelaPath("/living-leela/no-such-scene")).toBe(false);
    expect(isKnownLeelaPath("/living-leela/the-great-leap/extra")).toBe(false);
  });
});
