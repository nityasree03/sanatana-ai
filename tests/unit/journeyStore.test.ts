import { beforeEach, describe, expect, it } from "vitest";
import {
  JOURNEY_KEY,
  addItem,
  deleteEverything,
  disableSaving,
  enableSaving,
  exportJourney,
  importJourney,
  loadJourney,
  localDate,
  removeItem,
  updateItem,
} from "@/lib/journey/store";

beforeEach(() => localStorage.clear());

const goal = { text: "Be patient with my brother", note: "" };

describe("journey store", () => {
  it("saves nothing until the person turns saving on", () => {
    expect(() => addItem("goals", goal)).toThrow(/turned off/);
    expect(localStorage.getItem(JOURNEY_KEY)).toBeNull();
    enableSaving();
    const g = addItem("goals", goal);
    expect(loadJourney().journey.goals).toEqual([g]);
    expect(g.id).toBeTruthy();
  });

  it("edits and deletes items", () => {
    enableSaving();
    const g = addItem("goals", goal);
    updateItem("goals", g.id, { text: "Be kind to my brother" });
    expect(loadJourney().journey.goals[0].text).toBe("Be kind to my brother");
    removeItem("goals", g.id);
    expect(loadJourney().journey.goals).toEqual([]);
  });

  it("turning saving off can keep the data (read-only) or delete it", () => {
    enableSaving();
    addItem("goals", goal);
    disableSaving(true);
    expect(loadJourney().journey).toMatchObject({ enabled: false, goals: [{ text: goal.text }] });
    expect(() => addItem("goals", goal)).toThrow();
    disableSaving(false);
    expect(localStorage.getItem(JOURNEY_KEY)).toBeNull();
  });

  it("'delete everything' removes all saved data", () => {
    enableSaving();
    addItem("goals", goal);
    deleteEverything();
    expect(localStorage.getItem(JOURNEY_KEY)).toBeNull();
    expect(loadJourney().journey.enabled).toBe(false);
  });

  it("exports to a file and imports it back (replace and merge)", () => {
    enableSaving();
    const g = addItem("goals", goal);
    addItem("sankalpas", {
      text: "Walk after dinner",
      schedule: { kind: "daily" },
      status: "active",
      done: [localDate()],
    });
    const file = JSON.stringify(exportJourney());
    expect(JSON.parse(file)).toMatchObject({
      app: "sanatana-ai",
      kind: "journey-export",
      version: 1,
    });
    expect(file).not.toContain('"enabled"');

    deleteEverything();
    enableSaving();
    expect(importJourney(file, "replace")).toEqual({
      goals: 1,
      leaves: 0,
      reflections: 0,
      sankalpas: 1,
    });
    expect(loadJourney().journey.goals[0].id).toBe(g.id);

    // Merge: a local edit newer than the file is kept; new local items are kept.
    updateItem("goals", g.id, { text: "Edited later" });
    addItem("goals", { text: "Another goal", note: "" });
    importJourney(file, "merge");
    const texts = loadJourney()
      .journey.goals.map((x) => x.text)
      .sort();
    expect(texts).toEqual(["Another goal", "Edited later"]);
  });

  it("rejects files that aren't valid exports, without changing anything", () => {
    enableSaving();
    addItem("goals", goal);
    const before = localStorage.getItem(JOURNEY_KEY);
    expect(() => importJourney("not json", "replace")).toThrow(
      /isn't a Sanatana AI journey export/,
    );
    expect(() =>
      importJourney(
        JSON.stringify({
          app: "sanatana-ai",
          kind: "journey-export",
          version: 1,
          exportedAt: "x",
          data: { version: 1, goals: [{ id: "1", text: "" }] },
        }),
        "replace",
      ),
    ).toThrow();
    expect(() =>
      importJourney(
        JSON.stringify({
          app: "sanatana-ai",
          kind: "journey-export",
          version: 1,
          exportedAt: "x",
          data: {
            version: 1,
            leaves: [
              {
                id: "1",
                passageId: "p",
                reference: "r",
                excerpt: "e",
                href: "https://evil.example",
                theme: "t",
                source: "chat",
                createdAt: "x",
                updatedAt: "x",
              },
            ],
          },
        }),
        "replace",
      ),
    ).toThrow();
    expect(localStorage.getItem(JOURNEY_KEY)).toBe(before);
  });

  it("reports damaged data and leaves it untouched", () => {
    localStorage.setItem(JOURNEY_KEY, "{broken");
    expect(loadJourney()).toMatchObject({ damaged: true, journey: { enabled: false } });
    expect(() => enableSaving()).toThrow(/could not be read/);
    expect(localStorage.getItem(JOURNEY_KEY)).toBe("{broken");
    deleteEverything();
    expect(loadJourney().damaged).toBe(false);
  });

  it("uses the local calendar date for 'today'", () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
