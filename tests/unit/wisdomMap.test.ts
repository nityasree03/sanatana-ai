// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { EDGES, NODES, nodeById, passageMentions } from "@/lib/wisdomMap/graph";
import { getPassage } from "@/lib/scripture/data";

describe("Wisdom Knowledge Map data", () => {
  it("has unique nodes, valid positions and no orphan nodes", () => {
    const ids = NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of NODES) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(1000);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(720);
      expect(n.type === "text" ? n.works?.length : n.aliases.length, n.id).toBeGreaterThan(0);
      expect(
        EDGES.some((e) => e.from === n.id || e.to === n.id),
        `${n.id} has no links`,
      ).toBe(true);
    }
  });

  it("has no duplicate links, and every link joins known nodes", () => {
    const keys = EDGES.map((e) => [e.from, e.to].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of EDGES) {
      expect(nodeById(e.from), e.from).toBeDefined();
      expect(nodeById(e.to), e.to).toBeDefined();
      expect(e.evidence.length).toBeGreaterThan(0);
    }
  });

  // The core rule: no invented links. Each evidence passage must exist and mention both ends.
  for (const e of EDGES) {
    it(`"${e.from} ${e.label} ${e.to}" is shown by its passages`, () => {
      for (const id of e.evidence) {
        const p = getPassage(id);
        expect(p, `${id} missing`).toBeDefined();
        expect(passageMentions(nodeById(e.from)!, p!), `${id} doesn't mention ${e.from}`).toBe(
          true,
        );
        expect(passageMentions(nodeById(e.to)!, p!), `${id} doesn't mention ${e.to}`).toBe(true);
      }
    });
  }

  it("matches whole words only (so 'rama' isn't found inside 'Brahma' or 'dharma')", () => {
    const rama = nodeById("rama")!;
    const p = (text: string) => ({ work_id: "x", translation: { text } });
    expect(passageMentions(rama, p("Para Brahma and dharma"))).toBe(false);
    expect(passageMentions(rama, p("Ráma’s spouse"))).toBe(true);
  });
});
