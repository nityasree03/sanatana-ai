import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KidsApp } from "@/components/kids/KidsApp";
import { makeCheck } from "@/components/kids/CaregiverSetup";
import { PROGRESS_KEY, SESSION_KEY } from "@/lib/kids/settings";
import { fakeOutput } from "./fakeSpeech";

const refs = { "vp-5.10.3": "Vishnu Purana 5.10, passage 3" };

function start(
  opts: { age?: RegExp; progress?: boolean; breakAfter?: string; activities?: boolean } = {},
) {
  const out = fakeOutput();
  const utils = render(<KidsApp references={refs} output={out.adapter} seed={4} minuteMs={10} />);
  const { a, b } = makeCheck(4);
  fireEvent.change(screen.getByLabelText(/Grown-up check/), { target: { value: String(a + b) } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("radio", { name: opts.age ?? /Ages 6–9/ }));
  if (opts.progress)
    fireEvent.click(screen.getByRole("checkbox", { name: /Remember which stories/ }));
  if (opts.activities === false)
    fireEvent.click(screen.getByRole("checkbox", { name: /Include picture choices/ }));
  if (opts.breakAfter)
    fireEvent.change(screen.getByRole("combobox", { name: /Gentle break reminder/ }), {
      target: { value: opts.breakAfter },
    });
  fireEvent.click(screen.getByRole("button", { name: "Start story time" }));
  return { out, ...utils };
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe("Sanatana Kids", () => {
  it("keeps settings closed until the grown-up check is answered", () => {
    render(<KidsApp references={refs} output={fakeOutput().adapter} seed={4} />);
    expect(screen.queryByRole("radio", { name: /Ages/ })).toBeNull();
    fireEvent.change(screen.getByLabelText(/Grown-up check/), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Please ask a grown-up/)).toBeVisible();
    expect(screen.queryByRole("radio", { name: /Ages/ })).toBeNull();
  });

  it("asks for an age range before starting", () => {
    render(<KidsApp references={refs} output={fakeOutput().adapter} seed={4} />);
    const { a, b } = makeCheck(4);
    fireEvent.change(screen.getByLabelText(/Grown-up check/), { target: { value: String(a + b) } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Start story time" }));
    expect(screen.getByText("Please choose a learning range.")).toBeVisible();
  });

  it("stores settings for this tab only, and nothing long-term unless progress is on", () => {
    start();
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).toMatchObject({ age: "6-9" });
    expect(localStorage.length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    for (let i = 0; i < 20 && screen.queryByRole("button", { name: /^(Next|Skip)/ }); i++)
      fireEvent.click(screen.getByRole("button", { name: /^(Next|Skip)/ }));
    expect(screen.getByText("The end")).toBeVisible();
    expect(localStorage.length).toBe(0);
  });

  it("with progress on, keeps only finished story ids, and deletes them on request", () => {
    start({ progress: true, activities: false });
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!)).toEqual({
      version: 1,
      finished: ["mountain-umbrella"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Choose another story" }));
    expect(screen.getByText("Finished before")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Grown-ups: settings" }));
    const { a, b } = makeCheck(4);
    fireEvent.change(screen.getByLabelText(/Grown-up check/), { target: { value: String(a + b) } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete saved progress" }));
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it("tells the story for the chosen age, with the verse line only for 10–12", () => {
    start({ age: /Ages 4–5/ });
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    expect(screen.getByText(/Little Krishna asked/)).toBeVisible();
    expect(screen.queryByText(/From the text:/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "← All stories" }));
    fireEvent.click(screen.getByRole("button", { name: "Grown-ups: settings" }));
    const { a, b } = makeCheck(4);
    fireEvent.change(screen.getByLabelText(/Grown-up check/), { target: { value: String(a + b) } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("radio", { name: /Ages 10–12/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start story time" }));
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    expect(screen.getByText(/foster-father Nanda/)).toBeVisible();
    expect(screen.getByText(/From the text: Vishnu Purana 5.10, passage 3/)).toBeVisible();
  });

  it("reads aloud only after Play, then reads each new page; Pause stops it", () => {
    const { out } = start();
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    expect(out.spoken).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(out.spoken[0]).toMatchObject({
      text: expect.stringMatching(/^Autumn came to Vraja/),
      rate: 0.9,
    });
    fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    expect(out.spoken[1].text).toMatch(/^Krishna said/);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    expect(out.spoken).toHaveLength(2);
  });

  it("gives a hint, not a 'wrong', and praises the right answer", () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    expect(screen.getByRole("button", { name: /^Skip/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "A golden crown" }));
    expect(screen.getByText(/Good try! Think about who gives the village milk/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "The cows and the hill" }));
    expect(screen.getByText(/Yes! The cows and Govardhana Hill/)).toBeVisible();
    expect(screen.getByRole("button", { name: /^Next/ })).toBeVisible();
  });

  it("solves the order puzzle and the matching game by tapping", () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    while (!screen.queryByText("Tap the pictures in the order they happened."))
      fireEvent.click(screen.getByRole("button", { name: /^(Next|Skip)/ }));
    const pics = within(screen.getByRole("list", { name: "Pictures to put in order" }));
    fireEvent.click(pics.getByRole("button", { name: "The storm" }));
    expect(screen.getByText(/Good try! What happened first\?/)).toBeVisible();
    for (const n of ["The festival", "The storm", "The mountain umbrella", "The sun comes out"])
      fireEvent.click(pics.getByRole("button", { name: n }));
    expect(screen.getByText(/You remembered the whole story in order/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
    fireEvent.click(screen.getByRole("button", { name: "Indra" }));
    fireEvent.click(screen.getByRole("button", { name: "The hill Krishna lifted" }));
    expect(screen.getByText(/Let's look at “Indra” again/)).toBeVisible();
    for (const [l, r] of [
      ["Indra", "King of the clouds and rain"],
      ["Govardhana", "The hill Krishna lifted"],
      ["Cowherds", "People who look after cows"],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: l }));
      fireEvent.click(screen.getByRole("button", { name: r }));
    }
    expect(screen.getByText(/Great matching!/)).toBeVisible();
  });

  it("shows a gentle break reminder after the chosen time", () => {
    vi.useFakeTimers();
    const { out } = start({ breakAfter: "15" });
    fireEvent.click(screen.getByRole("button", { name: "Read The Mountain Umbrella" }));
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => vi.advanceTimersByTime(15 * 10));
    const dialog = screen.getByRole("dialog", { name: "Time for a little break?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Stop for now" }));
    expect(screen.getByRole("heading", { name: "Story time" })).toBeVisible();
    expect(out.spoken.length).toBe(1);
  });
});
