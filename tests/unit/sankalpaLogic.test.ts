import { describe, expect, it } from "vitest";
import {
  addDays,
  buildIcs,
  icsEscape,
  icsFold,
  isPlannedOn,
  progressText,
  recentDays,
  toggleDone,
} from "@/lib/journey/sankalpa";
import type { Sankalpa } from "@/lib/journey/schema";

const base = (over: Partial<Sankalpa>): Sankalpa => ({
  id: "s1",
  text: "Walk after dinner",
  schedule: { kind: "daily" },
  status: "active",
  done: [],
  createdAt: "2026-10-01T09:00:00.000Z",
  updatedAt: "2026-10-01T09:00:00.000Z",
  ...over,
});

describe("Sankalpa schedule and progress", () => {
  it("knows which days are planned (2026-10-28 is a Wednesday)", () => {
    expect(isPlannedOn({ kind: "daily" }, "2026-10-28")).toBe(true);
    expect(isPlannedOn({ kind: "once", date: "2026-10-28" }, "2026-10-28")).toBe(true);
    expect(isPlannedOn({ kind: "once", date: "2026-10-28" }, "2026-10-29")).toBe(false);
    expect(isPlannedOn({ kind: "weekdays", days: [3] }, "2026-10-28")).toBe(true);
    expect(isPlannedOn({ kind: "weekdays", days: [1, 5] }, "2026-10-28")).toBe(false);
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("counts kept days only among planned days, never before it was created", () => {
    const s = base({ done: ["2026-10-26", "2026-10-28"], createdAt: "2026-10-25T10:00:00.000Z" });
    const week = recentDays(s, "2026-10-28");
    expect(week).toHaveLength(7);
    expect(week.filter((d) => d.planned).map((d) => d.date)).toEqual([
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
    ]);
    expect(progressText(s, "2026-10-28")).toBe("Kept on 2 of 4 planned days this past week");
    expect(
      progressText(base({ schedule: { kind: "once", date: "2026-10-20" } }), "2026-10-28"),
    ).toBe("The day has passed");
  });

  it("marks and unmarks a day", () => {
    expect(toggleDone(["2026-10-27"], "2026-10-28")).toEqual(["2026-10-27", "2026-10-28"]);
    expect(toggleDone(["2026-10-27", "2026-10-28"], "2026-10-28")).toEqual(["2026-10-27"]);
  });
});

describe("calendar file", () => {
  it("escapes text and folds long lines at 75 octets without breaking characters", () => {
    expect(icsEscape("a, b; c\\d\nnext")).toBe("a\\, b\\; c\\\\d\\nnext");
    const folded = icsFold(`SUMMARY:${"ॐ".repeat(40)}`);
    for (const line of folded.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"ॐ".repeat(40)}`);
  });

  it("builds a weekly reminder starting on the next planned day, with an alarm", () => {
    const s = base({ text: "Read, then rest", schedule: { kind: "weekdays", days: [5, 1] } });
    const ics = buildIcs(s, {
      time: "07:30",
      today: "2026-10-28",
      now: new Date("2026-10-28T12:00:00Z"),
    });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20261030T073000\r\n"); // Friday 30 Oct is the next planned day
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO,FR\r\n");
    expect(ics).toContain("SUMMARY:Sankalpa: Read\\, then rest\r\n");
    expect(ics).toContain("BEGIN:VALARM\r\nACTION:DISPLAY\r\n");
    expect(ics).toContain("DTSTAMP:20261028T120000Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("a one-off intention has no repeat rule", () => {
    const ics = buildIcs(base({ schedule: { kind: "once", date: "2026-11-02" } }), {
      time: "18:00",
      today: "2026-10-28",
    });
    expect(ics).toContain("DTSTART:20261102T180000");
    expect(ics).not.toContain("RRULE");
  });
});
