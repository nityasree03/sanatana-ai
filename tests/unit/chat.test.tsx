import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let query = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query),
}));

import { ChatScreen, MAX_MESSAGE_LENGTH } from "@/components/ChatScreen";
import { fakeInput, fakeOutput } from "./fakeSpeech";

const REPLY = "Act, and let go of the fruits. (test reply)";
const posted: {
  companion: string;
  messages: { role: string; text: string }[];
  shared?: { from: string; messages: { role: string; text: string }[] };
}[] = [];

function mockServer() {
  posted.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init || init.method !== "POST")
        return new Response(JSON.stringify({ ai: "Practice mode", practice: true }));
      posted.push(JSON.parse(String(init.body)));
      return new Response(
        JSON.stringify({
          mode: "ai",
          provider: "Practice mode",
          practice: true,
          reply: REPLY,
          grounded: true,
          citations: [
            {
              id: "bg-2.47",
              how: "It speaks of action without attachment.",
              reflection: "Choose one task today and do it without checking the outcome.",
              passage: {
                id: "bg-2.47",
                reference: "Bhagavad Gita 2.47",
                href: "/scriptures/bhagavad-gita/2#bg-2.47",
                translation: {
                  text: "Thy business is with the action only, never with its fruits.",
                  translator: "Annie Besant",
                },
              },
            },
          ],
          related: [],
        }),
      );
    }),
  );
}

/** Let the stand-in server's promises settle. */
async function flush() {
  for (let i = 0; i < 6; i++) await act(async () => {});
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  query = "";
  mockServer();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function input() {
  return screen.getByRole("textbox", { name: /message/i });
}

describe("ChatScreen", () => {
  it("opens with the companion from the URL", () => {
    query = "companion=hanuman";
    render(<ChatScreen />);
    expect(screen.getByRole("heading", { name: "Chat with Hanuman" })).toBeInTheDocument();
  });

  it("ignores unknown companions in the URL and falls back to Krishna", () => {
    query = "companion=unknown";
    render(<ChatScreen />);
    expect(screen.getByRole("heading", { name: "Chat with Krishna" })).toBeInTheDocument();
  });

  it("shows the user's message, then the AI reply labelled as interpretation with its wisdom thread", async () => {
    render(<ChatScreen />);
    fireEvent.change(input(), { target: { value: "What is dharma?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("What is dharma?")).toBeInTheDocument();
    expect(screen.getByText("Thinking…")).toBeInTheDocument();
    await flush();
    expect(screen.getByText(REPLY)).toBeInTheDocument();
    expect(screen.getByText(/AI interpretation · practice mode/)).toBeInTheDocument(); // reply label
    const thread = screen.getByRole("region", { name: /Wisdom thread/ });
    // Truth Lens: the three layers are separate and labelled
    const lens = within(thread).getByText("AI interpretation:");
    expect(lens.nextElementSibling).toHaveTextContent("It speaks of action without attachment.");
    expect(
      within(thread).getByText("AI-suggested reflection:").nextElementSibling,
    ).toHaveTextContent("Choose one task today");
    expect(within(thread).getByText(/Verified scripture · Annie Besant/)).toBeInTheDocument();
    expect(within(thread).getByRole("link", { name: "Bhagavad Gita 2.47" })).toHaveAttribute(
      "href",
      "/scriptures/bhagavad-gita/2#bg-2.47",
    );
    expect(within(thread).getByText(/never with its fruits/)).toBeInTheDocument();
    expect(input()).toHaveValue("");
    expect(posted[0]).toEqual({
      companion: "krishna",
      messages: [{ role: "user", text: "What is dharma?" }],
    });
  });

  it("sends the conversation so far, without greetings", async () => {
    render(<ChatScreen />);
    fireEvent.change(input(), { target: { value: "First" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    fireEvent.change(input(), { target: { value: "Second" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    expect(posted[1].messages).toEqual([
      { role: "user", text: "First" },
      { role: "companion", text: REPLY },
      { role: "user", text: "Second" },
    ]);
  });

  it("sends with Enter but not Shift+Enter", () => {
    render(<ChatScreen />);
    fireEvent.change(input(), { target: { value: "Hello" } });
    fireEvent.keyDown(input(), { key: "Enter", shiftKey: true });
    const log = screen.getByRole("log");
    expect(within(log).queryByText("Hello")).not.toBeInTheDocument();
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(within(log).getByText("Hello")).toBeInTheDocument();
  });

  it("refuses empty and too-long messages with a clear error", () => {
    render(<ChatScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write a message first.");

    fireEvent.change(input(), { target: { value: "a".repeat(MAX_MESSAGE_LENGTH + 1) } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/up to 2000 characters/);
  });

  it("switches straight away when there is nothing to share, and remembers the choice", () => {
    render(<ChatScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Parvati" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chat with Parvati" })).toBeInTheDocument();
    expect(screen.getByText(/started fresh \(nothing shared from Krishna\)/)).toBeInTheDocument();
    expect(localStorage.getItem("sanatana-companion")).toBe("parvati");
  });
});

describe("Companion Handoff", () => {
  async function talkToKrishna() {
    render(<ChatScreen />);
    fireEvent.change(input(), { target: { value: "I feel lost at work" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
  }

  it("asks what to share; only the ticked messages go to the new companion", async () => {
    await talkToKrishna();
    fireEvent.click(screen.getByRole("button", { name: "Shiva" }));
    const dialog = screen.getByRole("dialog", { name: "Switch to Shiva?" });
    const boxes = within(dialog).getAllByRole("checkbox");
    expect(boxes).toHaveLength(2); // my message + Krishna's reply, both ticked by default
    expect(boxes.every((b) => (b as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(boxes[1]); // keep only my own message
    fireEvent.click(within(dialog).getByRole("button", { name: "Share 1 message" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/1 message shared from Krishna/)).toBeInTheDocument();

    fireEvent.change(input(), { target: { value: "What would you add?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    const last = posted.at(-1)!;
    expect(last.companion).toBe("shiva");
    expect(last.messages).toEqual([{ role: "user", text: "What would you add?" }]);
    expect(last.shared).toEqual({
      from: "krishna",
      messages: [{ role: "user", text: "I feel lost at work" }],
    });
  });

  it("'Start fresh' shares nothing", async () => {
    await talkToKrishna();
    fireEvent.click(screen.getByRole("button", { name: "Hanuman" }));
    fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));
    expect(screen.getByText(/started fresh/)).toBeInTheDocument();
    fireEvent.change(input(), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    expect(posted.at(-1)!.shared).toBeUndefined();
    expect(posted.at(-1)!.messages).toEqual([{ role: "user", text: "Hello" }]);
  });

  it("Cancel and Escape keep the current companion; sharing needs at least one message", async () => {
    await talkToKrishna();
    fireEvent.click(screen.getByRole("button", { name: "Parvati" }));
    let dialog = screen.getByRole("dialog");
    for (const b of within(dialog).getAllByRole("checkbox")) fireEvent.click(b);
    expect(within(dialog).getByRole("button", { name: "Share 0 messages" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("heading", { name: "Chat with Krishna" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Parvati" }));
    dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chat with Krishna" })).toBeInTheDocument();
  });
});

function avatarState() {
  return document.querySelector("[data-avatar-state]")?.getAttribute("data-avatar-state");
}

describe("ChatScreen voice", () => {
  it("puts spoken words into the box for editing, without sending", () => {
    const mic = fakeInput();
    render(<ChatScreen speechInput={mic.adapter} speechOutput={fakeOutput().adapter} />);
    fireEvent.change(input(), { target: { value: "Please" } });
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    expect(avatarState()).toBe("listening");
    expect(screen.getByRole("button", { name: "Stop voice input" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    act(() => mic.interim("help me"));
    expect(input()).toHaveValue("Please help me");
    act(() => mic.final("help me decide"));
    act(() => mic.end());
    expect(input()).toHaveValue("Please help me decide");
    expect(avatarState()).toBe("idle");
    // Nothing was sent automatically
    expect(within(screen.getByRole("log")).queryByText("Please help me decide")).toBeNull();
  });

  it("explains when voice input is not supported, and typing still works", () => {
    render(
      <ChatScreen speechInput={fakeInput(false).adapter} speechOutput={fakeOutput().adapter} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    expect(screen.getByRole("status")).toHaveTextContent(/isn't available in this browser/);
    fireEvent.change(input(), { target: { value: "Typed" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(within(screen.getByRole("log")).getByText("Typed")).toBeInTheDocument();
  });

  it("shows a friendly message and the error state when the microphone is blocked", () => {
    const mic = fakeInput();
    render(<ChatScreen speechInput={mic.adapter} speechOutput={fakeOutput().adapter} />);
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    act(() => mic.error("not-allowed"));
    act(() => mic.end());
    expect(screen.getByRole("status")).toHaveTextContent(/microphone is blocked/);
    expect(avatarState()).toBe("error");
    act(() => vi.advanceTimersByTime(3100));
    expect(avatarState()).toBe("idle");
  });

  it("never speaks on its own; Listen speaks with the companion's voice settings and Stop stops", () => {
    const voice = fakeOutput();
    query = "companion=shiva";
    render(<ChatScreen speechInput={fakeInput().adapter} speechOutput={voice.adapter} />);
    expect(voice.spoken).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Listen to Shiva's reply" }));
    expect(voice.spoken[0]).toMatchObject({ rate: 0.88, pitch: 0.85 });
    expect(avatarState()).toBe("speaking");

    fireEvent.click(screen.getByRole("button", { name: "Stop reading Shiva's reply" }));
    expect(avatarState()).toBe("idle");

    // Replay works
    fireEvent.click(screen.getByRole("button", { name: "Listen to Shiva's reply" }));
    expect(voice.spoken).toHaveLength(2);
    act(() => voice.finish());
    expect(avatarState()).toBe("idle");
  });

  it("reads new replies aloud only after 'Speak replies' is switched on, and mutes when off", async () => {
    const voice = fakeOutput();
    render(<ChatScreen speechInput={fakeInput().adapter} speechOutput={voice.adapter} />);
    fireEvent.change(input(), { target: { value: "One" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    expect(voice.spoken).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Speak replies: off" }));
    fireEvent.change(input(), { target: { value: "Two" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await flush();
    expect(voice.spoken.map((s) => s.text)).toEqual([REPLY]);
    expect(avatarState()).toBe("speaking");

    fireEvent.click(screen.getByRole("button", { name: "Speak replies: on" }));
    expect(avatarState()).toBe("idle");
  });

  it("stops speaking when the microphone starts (interruption)", () => {
    const voice = fakeOutput();
    render(<ChatScreen speechInput={fakeInput().adapter} speechOutput={voice.adapter} />);
    fireEvent.click(screen.getByRole("button", { name: "Listen to Krishna's reply" }));
    expect(avatarState()).toBe("speaking");
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    expect(avatarState()).toBe("listening");
  });

  it("explains when spoken replies are not supported", () => {
    render(
      <ChatScreen speechInput={fakeInput().adapter} speechOutput={fakeOutput(false).adapter} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Listen to Krishna's reply" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Spoken replies aren't available/);
    expect(avatarState()).toBe("idle");
  });
});
