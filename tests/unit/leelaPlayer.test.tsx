import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { LeelaPlayer } from "@/components/leela/LeelaPlayer";
import { withHref } from "@/lib/chat/answer";
import { getScene } from "@/lib/leela/scenes";
import { getPassage } from "@/lib/scripture/data";

const scene = getScene("arjunas-despair")!;
const passages = Object.fromEntries(
  scene.moments.flatMap((m) => m.passages).map((id) => [id, withHref(getPassage(id)!)]),
);
const choose = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("Living Leela player", () => {
  it("shows a labelled retelling with the verified passages it comes from", () => {
    render(<LeelaPlayer scene={scene} passages={passages} />);
    expect(screen.getByRole("heading", { name: "Between the two armies" })).toBeInTheDocument();
    expect(screen.getByText("Retelling (our summary, not scripture)")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Bhagavad Gita 1.21" });
    expect(link.getAttribute("href")).toMatch(/^\/scriptures\/bhagavad-gita\/1#bg-1\.21$/);
    expect(screen.getAllByText(/Verified scripture · Annie Besant/).length).toBe(3);
  });

  it("lets the person take a detour and come back, records the path, and reaches the end", () => {
    render(<LeelaPlayer scene={scene} passages={passages} />);
    choose("Look at who Arjuna sees");
    choose("Notice what happens to his body");
    expect(screen.getByText("A closer look")).toBeInTheDocument();
    choose(/Back to the story/);
    expect(screen.getByRole("heading", { name: "“I will not fight”" })).toBeInTheDocument();
    choose("See how Krishna first answers");
    choose("Go on to the teaching about action");
    expect(screen.getByRole("heading", { name: "The end of this scene" })).toBeInTheDocument();
    const path = screen.getByRole("navigation", { name: "Your path through the scene" });
    expect(
      within(path)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      "1. Between the two armies",
      "2. Kinsmen on both sides",
      "3. Closer look: when grief reaches the body",
      "4. “I will not fight”",
      "5. Krishna's first answer",
      "6. Act, without clinging to the results",
    ]);
    expect(screen.getByRole("link", { name: "Read Gita chapter 2 in full" })).toHaveAttribute(
      "href",
      "/scriptures/bhagavad-gita/2",
    );
    choose("Start again");
    expect(screen.getByRole("heading", { name: "Between the two armies" })).toBeInTheDocument();
    expect(within(path).getAllByRole("listitem")).toHaveLength(1);
  });

  it("offers the moment's question to the companion's chat, to edit before sending", () => {
    render(<LeelaPlayer scene={scene} passages={passages} />);
    const ask = screen.getByRole("link", { name: /Ask Krishna about this moment/ });
    const url = new URL(ask.getAttribute("href")!, "http://x");
    expect(url.pathname).toBe("/chat");
    expect(url.searchParams.get("companion")).toBe("krishna");
    expect(url.searchParams.get("ask")).toBe(scene.moments[0].ask);
  });
});
