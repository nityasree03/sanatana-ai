import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import WisdomMapPage from "@/app/wisdom-map/page";
import { EDGES } from "@/lib/wisdomMap/graph";

const map = () => screen.getByRole("group", { name: "Wisdom Knowledge Map" });
const details = () => screen.getByRole("region", { name: /./ });

describe("Wisdom Knowledge Map UI", () => {
  it("starts on The Self and lists its connections with verse links", () => {
    render(WisdomMapPage());
    expect(screen.getByRole("heading", { level: 2, name: "The Self (Atman)" })).toBeVisible();
    const n = EDGES.filter((e) => e.from === "self" || e.to === "self").length;
    expect(screen.getByText(new RegExp(`^${n} connections, each with its verse`))).toBeVisible();
    const links = within(details()).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(n);
    for (const l of links) expect(l.getAttribute("href")).toMatch(/^\/scriptures\//);
  });

  it("selects a node with the keyboard and marks it pressed", () => {
    render(WisdomMapPage());
    const hanuman = within(map()).getByRole("button", { name: "Hanuman" });
    hanuman.focus();
    fireEvent.keyDown(hanuman, { key: "Enter" });
    expect(hanuman).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 2, name: "Hanuman" })).toBeVisible();
    expect(within(details()).getByRole("button", { name: "Hanuman serves Rama" })).toBeVisible();
    fireEvent.keyDown(within(map()).getByRole("button", { name: "Sita" }), { key: " " });
    expect(screen.getByRole("heading", { level: 2, name: "Sita" })).toBeVisible();
  });

  it("follows a connection from the details panel", () => {
    render(WisdomMapPage());
    fireEvent.click(within(map()).getByRole("button", { name: "Hanuman" }));
    fireEvent.click(within(details()).getByRole("button", { name: "Hanuman serves Rama" }));
    expect(screen.getByRole("heading", { level: 2, name: "Rama" })).toBeVisible();
  });

  it("dims nodes outside the chosen companion's texts", () => {
    render(WisdomMapPage());
    fireEvent.click(screen.getByRole("radio", { name: "Parvati's texts" }));
    const g = within(map());
    expect(g.getByRole("button", { name: "Uma (Parvati)" })).toHaveAttribute("opacity", "1");
    expect(g.getByRole("button", { name: "Hanuman" })).toHaveAttribute("opacity", "0.3");
    fireEvent.click(screen.getByRole("radio", { name: "Everything" }));
    expect(g.getByRole("button", { name: "Hanuman" })).toHaveAttribute("opacity", "1");
  });

  it("offers every link as an accessible table", () => {
    render(WisdomMapPage());
    const table = screen.getByRole("table", { hidden: true });
    expect(within(table).getAllByRole("row", { hidden: true })).toHaveLength(EDGES.length + 1);
    expect(screen.getByText(`All ${EDGES.length} links as a list`)).toBeInTheDocument();
  });
});
