import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home page (Phase 0 placeholder)", () => {
  it("shows the site name, all four companions and an honest status", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Sanatana AI" })).toBeInTheDocument();
    for (const name of ["Krishna", "Shiva", "Hanuman", "Parvati"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("AI chat is not connected yet.")).toBeInTheDocument();
  });
});
