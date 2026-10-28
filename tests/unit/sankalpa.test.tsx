import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailySankalpa } from "@/components/journey/DailySankalpa";
import { localDate } from "@/lib/journey/store";

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());
const saved = () => JSON.parse(localStorage.getItem("sanatana-journey") ?? "null");

function start() {
  render(<DailySankalpa />);
  fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
}
function add(text: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Intention" }), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Add Sankalpa" }));
}

describe("Daily Sankalpa", () => {
  it("adds an intention, shows it for today and marks it kept (and unmarks)", () => {
    start();
    add("Ten quiet minutes before breakfast");
    const today = screen.getByRole("region", { name: /^Today/ });
    const box = within(today).getByRole("checkbox", { name: "Ten quiet minutes before breakfast" });
    fireEvent.click(box);
    expect(saved().sankalpas[0].done).toEqual([localDate()]);
    expect(screen.getByText(/Kept on 1 of 1 planned day this past week/)).toBeInTheDocument();
    fireEvent.click(box);
    expect(saved().sankalpas[0].done).toEqual([]);
  });

  it("pausing removes it from today's list; resuming brings it back", () => {
    start();
    add("Evening walk");
    fireEvent.click(screen.getByRole("button", { name: "Pause Evening walk" }));
    expect(saved().sankalpas[0].status).toBe("paused");
    expect(
      within(screen.getByRole("region", { name: /^Today/ })).getByText(
        "Nothing planned for today.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume Evening walk" }));
    expect(
      within(screen.getByRole("region", { name: /^Today/ })).getByRole("checkbox", {
        name: "Evening walk",
      }),
    ).toBeInTheDocument();
  });

  it("a one-off intention for another day is not on today's list", () => {
    start();
    fireEvent.change(screen.getByRole("textbox", { name: "Intention" }), {
      target: { value: "Call grandmother" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Once" }));
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2099-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Sankalpa" }));
    expect(saved().sankalpas[0].schedule).toEqual({ kind: "once", date: "2099-01-01" });
    expect(screen.getByText("Nothing planned for today.")).toBeInTheDocument();
    expect(screen.getByText(/Not done yet/)).toBeInTheDocument();
  });

  it("edits and deletes", () => {
    start();
    add("Read a verse");
    fireEvent.click(screen.getByRole("button", { name: "Edit Read a verse" }));
    const card = screen.getByRole("article", { name: "Read a verse" });
    fireEvent.change(within(card).getByRole("textbox", { name: "Intention" }), {
      target: { value: "Read two verses" },
    });
    fireEvent.click(within(card).getByRole("button", { name: "Save changes" }));
    expect(saved().sankalpas[0].text).toBe("Read two verses");
    fireEvent.click(screen.getByRole("button", { name: "Delete Read two verses" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete Sankalpa" }),
    );
    expect(saved().sankalpas).toEqual([]);
  });

  it("downloads a calendar file with the chosen reminder time", async () => {
    const createURL = vi.fn(() => "blob:x");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: createURL, revokeObjectURL: vi.fn() }),
    );
    start();
    add("Morning prayer");
    fireEvent.click(screen.getByRole("button", { name: "Add to my calendar: Morning prayer" }));
    const dialog = screen.getByRole("dialog", { name: "Add to my calendar" });
    fireEvent.change(within(dialog).getByLabelText("Reminder time"), {
      target: { value: "06:45" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Download calendar file" }));
    const blob = (createURL.mock.calls[0] as unknown as [Blob])[0];
    const ics = await blob.text();
    expect(blob.type).toBe("text/calendar");
    expect(ics).toMatch(/DTSTART:\d{8}T064500/);
    expect(ics).toContain("RRULE:FREQ=DAILY");
    expect(ics).toContain("SUMMARY:Sankalpa: Morning prayer");
    expect(within(dialog).getByText(/Downloaded/)).toBeInTheDocument();
  });

  it("never shows streaks or scores", () => {
    start();
    add("Be kind");
    expect(document.body.textContent).toMatch(/there are no streaks to break/);
    expect(document.body.textContent).not.toMatch(/\bstreak:|\bpoints\b|\bscore\b/i);
  });
});
