import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { ReflectionMirror } from "@/components/journey/ReflectionMirror";
import { reflectionMessage } from "@/lib/journey/reflection";
import type { Reflection } from "@/lib/journey/schema";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  push.mockReset();
});
const saved = () => JSON.parse(localStorage.getItem("sanatana-journey") ?? "null");

function fill(label: string, value: string, scope: HTMLElement = document.body) {
  fireEvent.change(within(scope).getByRole("textbox", { name: label }), { target: { value } });
}

function start() {
  render(<ReflectionMirror />);
  fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
}

describe("Karma Reflection Mirror", () => {
  it("has no scores, and saves nothing before opting in", () => {
    render(<ReflectionMirror />);
    expect(localStorage.getItem("sanatana-journey")).toBeNull();
    expect(document.body.textContent).toMatch(/There are no scores here/);
    expect(document.body.textContent).not.toMatch(
      /\b(points|score:|level \d|good karma|bad karma)\b/i,
    );
  });

  it("saves a reflection, refuses an empty one, edits and deletes", () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "Save reflection" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write at least one part");
    fill("My intention", "Help my sister with her exam");
    fill("What I learned", "I get impatient when tired");
    fill("My next step", "Rest before helping");
    fireEvent.click(screen.getByRole("button", { name: "Save reflection" }));
    expect(saved().reflections[0]).toMatchObject({
      intention: "Help my sister with her exam",
      learning: "I get impatient when tired",
      nextStep: "Rest before helping",
      action: "",
    });
    const card = screen.getByRole("article", { name: /Reflection of/ });
    expect(within(card).getByText("Help my sister with her exam")).toBeInTheDocument();
    expect(within(card).queryByText("What I did")).not.toBeInTheDocument(); // empty parts hidden

    fireEvent.click(within(card).getByRole("button", { name: /^Edit/ }));
    fill("What I did", "Explained two chapters", card);
    fireEvent.click(within(card).getByRole("button", { name: "Save changes" }));
    expect(saved().reflections[0].action).toBe("Explained two chapters");

    fireEvent.click(within(card).getByRole("button", { name: /^Delete/ }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete reflection" }),
    );
    expect(saved().reflections).toEqual([]);
  });

  it("'Discuss with a companion' shows exactly what goes into the chat box and keeps it out of the URL", () => {
    start();
    fill("My intention", "Be honest with my manager");
    fireEvent.click(screen.getByRole("button", { name: "Save reflection" }));
    fireEvent.click(screen.getByRole("button", { name: "Discuss with a companion" }));
    const dialog = screen.getByRole("dialog", { name: "Discuss with a companion" });
    expect(within(dialog).getByText(/Nothing is sent until you press Send/)).toBeInTheDocument();
    expect(within(dialog).getByText(/My intention: Be honest with my manager/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: "Hanuman" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Open the chat" }));
    expect(push).toHaveBeenCalledWith("/chat?companion=hanuman&draft=1");
    expect(push.mock.calls[0][0]).not.toMatch(/honest/);
    expect(sessionStorage.getItem("sanatana-chat-draft")).toMatch(/Be honest with my manager/);
  });

  it("turns the next step into a Sankalpa linked to the reflection", () => {
    start();
    fill("My next step", "Walk for 20 minutes after dinner");
    fireEvent.click(screen.getByRole("button", { name: "Save reflection" }));
    fireEvent.click(screen.getByRole("button", { name: "Make my next step a Sankalpa" }));
    const dialog = screen.getByRole("dialog", { name: "Make my next step a Sankalpa" });
    expect(within(dialog).getByRole("textbox", { name: "Intention" })).toHaveValue(
      "Walk for 20 minutes after dinner",
    );
    fireEvent.click(within(dialog).getByRole("radio", { name: "On chosen days" }));
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Saturday" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Add Sankalpa" }));
    const s = saved();
    expect(s.sankalpas[0]).toMatchObject({
      text: "Walk for 20 minutes after dinner",
      schedule: { kind: "weekdays", days: [1, 2, 3, 4, 5, 6] },
      status: "active",
      fromReflection: s.reflections[0].id,
    });
    expect(screen.getByRole("dialog", { name: "Sankalpa added" })).toBeInTheDocument();
  });
});

describe("reflection message", () => {
  it("fits one chat message, sharing the space between filled parts", () => {
    const long = "x".repeat(1900);
    const r: Reflection = {
      id: "r",
      date: "2026-10-28",
      intention: long,
      action: long,
      outcome: "",
      learning: "short",
      nextStep: long,
      createdAt: "t",
      updatedAt: "t",
    };
    const m = reflectionMessage(r);
    expect(m.shortened).toBe(true);
    expect(m.text.length).toBeLessThanOrEqual(2000);
    expect(m.text).toMatch(/What I learned: short/);
    expect(m.text).not.toMatch(/What happened/);
  });
});
