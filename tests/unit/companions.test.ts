import { describe, expect, it } from "vitest";
import { COMPANIONS, getCompanion, isCompanionId } from "@/lib/companions";

describe("companions", () => {
  it("has exactly Krishna, Shiva, Hanuman and Parvati", () => {
    expect(COMPANIONS.map((c) => c.id)).toEqual(["krishna", "shiva", "hanuman", "parvati"]);
  });

  it("gives each companion a distinct voice, themes and source preferences", () => {
    expect(new Set(COMPANIONS.map((c) => c.voice)).size).toBe(4);
    for (const c of COMPANIONS) {
      expect(c.themes.length).toBeGreaterThan(0);
      expect(c.sourcePreferences.length).toBeGreaterThan(0);
      expect(c.greeting).toBeTruthy();
    }
  });

  it("only accepts known companion ids from the URL", () => {
    expect(isCompanionId("shiva")).toBe(true);
    expect(isCompanionId("zeus")).toBe(false);
    expect(isCompanionId(null)).toBe(false);
    expect(() => getCompanion("hanuman")).not.toThrow();
  });
});
