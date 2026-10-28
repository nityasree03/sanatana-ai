import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CouncilScreen } from "@/components/council/CouncilScreen";
import { fakeOutput } from "./fakeSpeech";

const ORDER = ["krishna", "shiva", "hanuman", "parvati"] as const;
const passage = (id: string, companion: string) => ({
  id,
  reference: `Ref ${id}`,
  href: `/scriptures/x/1#${id}`,
  companions: [companion],
  translation: { text: `Verified text of ${id}.`, translator: "Translator" },
});
let posted: unknown[] = [];

function mockServer(body: unknown) {
  posted = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/chat")
        return new Response(JSON.stringify({ ai: "Practice mode", practice: true }));
      posted.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify(body));
    }),
  );
}

const AI_RESULT = {
  mode: "ai",
  practice: true,
  answers: ORDER.map((c) => ({
    companion: c,
    mode: "ai",
    reply: `Answer from ${c}.`,
    grounded: true,
    citations: [
      {
        id: `${c}-1`,
        how: `Why ${c}-1 fits.`,
        reflection: `Try ${c}'s step.`,
        passage: passage(`${c}-1`, c),
      },
    ],
    related: [],
  })),
  synthesis: { agree: ["All four stress steadiness."], differ: ["Hanuman stresses action."] },
};

async function flush() {
  for (let i = 0; i < 6; i++) await act(async () => {});
}
const box = () => screen.getByRole("textbox", { name: "Your question for the Council" });

beforeEach(() => mockServer(AI_RESULT));
afterEach(() => vi.unstubAllGlobals());

describe("Divine Council", () => {
  it("asks once and shows four separate answers with Truth Lens and a labelled comparison", async () => {
    render(<CouncilScreen speechOutput={fakeOutput().adapter} />);
    fireEvent.change(box(), { target: { value: "How do I stay steady?" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask the Council" }));
    expect(screen.getByText(/this takes 10–20 seconds/)).toBeInTheDocument();
    await flush();
    expect(posted).toEqual([{ question: "How do I stay steady?" }]);
    // Focus moves to the answers so keyboard and screen-reader users land on them.
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: /The Council on/ }));
    for (const name of ["Krishna", "Shiva", "Hanuman", "Parvati"]) {
      const card = screen.getByRole("article", { name });
      expect(within(card).getByText(`Answer from ${name.toLowerCase()}.`)).toBeInTheDocument();
      expect(within(card).getByText(/AI interpretation · practice mode/)).toBeInTheDocument();
      expect(within(card).getByText("AI-suggested reflection:")).toBeInTheDocument();
      expect(within(card).getByText(/Verified scripture · Translator/)).toBeInTheDocument();
    }
    const compare = screen.getByRole("region", { name: "Where they agree and differ" });
    expect(within(compare).getByText(/AI comparison of the answers above/)).toBeInTheDocument();
    expect(within(compare).getByText("All four stress steadiness.")).toBeInTheDocument();
  });

  it("'Listen to all' speaks the four answers in turn with each voice, and Stop stops", async () => {
    const out = fakeOutput();
    render(<CouncilScreen speechOutput={out.adapter} />);
    fireEvent.change(box(), { target: { value: "Q" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask the Council" }));
    await flush();
    fireEvent.click(screen.getByRole("button", { name: /Listen to all/ }));
    expect(out.spoken.map((s) => s.text)).toEqual(["Krishna. Answer from krishna."]);
    act(() => out.finish());
    act(() => out.finish());
    expect(out.spoken.map((s) => s.text.split(".")[0])).toEqual(["Krishna", "Shiva", "Hanuman"]);
    expect(new Set(out.spoken.map((s) => s.pitch)).size).toBe(3); // each companion's own voice
    fireEvent.click(screen.getByRole("button", { name: "■ Stop" }));
    act(() => out.finish());
    expect(out.spoken).toHaveLength(3); // Parvati never started
  });

  it("listening to one card while another speaks does not continue the old queue", async () => {
    const out = fakeOutput();
    render(<CouncilScreen speechOutput={out.adapter} />);
    fireEvent.change(box(), { target: { value: "Q" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask the Council" }));
    await flush();
    fireEvent.click(screen.getByRole("button", { name: /Listen to all/ }));
    fireEvent.click(screen.getByRole("button", { name: "Listen to Parvati's answer" }));
    act(() => out.finish());
    expect(out.spoken.map((s) => s.text.split(".")[0])).toEqual(["Krishna", "Parvati"]);
  });

  it("shows one support reply for a crisis message, and a friendly error for empty questions", async () => {
    mockServer({ mode: "crisis", answers: [], crisisReply: "Please call 988." });
    render(<CouncilScreen speechOutput={fakeOutput().adapter} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask the Council" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write a question first.");
    fireEvent.click(screen.getByRole("button", { name: EXAMPLE_FIRST }));
    fireEvent.click(screen.getByRole("button", { name: "Ask the Council" }));
    await flush();
    expect(screen.getByText("Please call 988.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});

const EXAMPLE_FIRST = "How do I handle anger towards someone I love?";
