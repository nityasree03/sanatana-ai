import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import WisdomPage from "@/app/wisdom-for-generations/page";
import { COMPANIONS } from "@/lib/companions";
import { LEVELS, TOPICS, getTopic } from "@/lib/generations/topics";
import { normalise } from "@/lib/learning/lessons";
import { getPassage } from "@/lib/scripture/data";

describe("Wisdom for Generations topics", () => {
  it("has 8 distinct topics covering all four companions", () => {
    expect(TOPICS).toHaveLength(8);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(8);
    for (const c of COMPANIONS)
      expect(
        TOPICS.some((t) => t.companion === c.id),
        c.id,
      ).toBe(true);
    expect(getTopic("truth")?.title).toBe("Telling the truth");
  });

  for (const t of TOPICS)
    it(`${t.title}: verses exist, the key line is word for word, and every level is written`, () => {
      const text = t.passages.map((id) => {
        const p = getPassage(id);
        expect(p, id).toBeDefined();
        expect(p!.companions).toContain(t.companion);
        return normalise(p!.translation.text);
      });
      expect(t.passages).toContain(t.key.passage);
      expect(normalise(getPassage(t.key.passage)!.translation.text)).toContain(
        normalise(t.key.quote),
      );
      for (const l of LEVELS) {
        expect(t.explain[l].length, `${t.id} ${l}`).toBeGreaterThan(60);
        expect(t.talk[l]).toMatch(/\?$/);
      }
      expect(t.explain.child.length).toBeLessThan(t.explain.adult.length);
      // Words in quotation marks that come from these verses must really be there.
      const all = text.join(" ").toLowerCase();
      for (const m of `${t.explain.teen} ${t.explain.adult}`.matchAll(/“([^”]+)”/g)) {
        const q = normalise(m[1]).toLowerCase().replace(/[,.]$/, "");
        if (/^satyam eva jayate$/.test(q)) continue; // the Sanskrit of the key line
        // (Our own phrases use single quotes ‘…’, so they are not checked here.)
        expect(all, `${t.id}: “${m[1]}”`).toContain(q);
      }
    });
});

describe("Wisdom for Generations page", () => {
  it("switches level and topic, and shows the verse with its source", () => {
    render(WisdomPage());
    expect(
      screen.getByRole("heading", { level: 2, name: "Being friendly to everyone" }),
    ).toBeVisible();
    expect(screen.getByText(/Krishna says the people he loves best/)).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Teen" }));
    expect(screen.getByText(/Is it possible to wish someone well/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Telling the truth" }));
    expect(screen.getByRole("button", { name: "Telling the truth" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    const article = screen.getByRole("article", { name: "Telling the truth" });
    expect(within(article).getByText(/national motto/)).toBeVisible();
    expect(within(article).getByRole("link", { name: /Mundaka Upanishad 3.1.6/ })).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Adult" }));
    expect(within(article).getByText(/make honesty safe/)).toBeVisible();
  });
});
