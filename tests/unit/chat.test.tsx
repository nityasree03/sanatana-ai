import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let query = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query),
}));

import { ChatScreen, MAX_MESSAGE_LENGTH, NOT_CONNECTED_REPLY } from "@/components/ChatScreen";

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  query = "";
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.useRealTimers());

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

  it("shows the user's message, then the honest not-connected reply", () => {
    render(<ChatScreen />);
    fireEvent.change(input(), { target: { value: "What is dharma?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("What is dharma?")).toBeInTheDocument();
    expect(screen.getByText("Thinking…")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByText(NOT_CONNECTED_REPLY)).toBeInTheDocument();
    expect(input()).toHaveValue("");
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

  it("switches companion, notes the change and remembers the choice", () => {
    render(<ChatScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Parvati" }));
    expect(screen.getByRole("heading", { name: "Chat with Parvati" })).toBeInTheDocument();
    expect(screen.getByText(/You're now talking with Parvati/)).toBeInTheDocument();
    expect(localStorage.getItem("sanatana-companion")).toBe("parvati");
  });

  it("explains honestly that voice input is not ready yet", () => {
    render(<ChatScreen />);
    fireEvent.click(screen.getByRole("button", { name: /voice input/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/arrives in Phase 2/);
  });
});
