import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let query = "";
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));

import { MyJourneyScreen } from "@/components/journey/MyJourneyScreen";

beforeEach(() => {
  localStorage.clear();
  query = "";
});
const saved = () => JSON.parse(localStorage.getItem("sanatana-journey") ?? "null");

describe("My Dharma Journey", () => {
  it("asks for consent before saving anything, then lets the person add, edit and delete goals", async () => {
    render(<MyJourneyScreen />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByText(/only in this browser on this device/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
    expect(saved().enabled).toBe(true);

    fireEvent.change(screen.getByRole("textbox", { name: "Goal" }), {
      target: { value: "Read one Gita verse a day" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save goal" }));
    const list = screen.getByRole("list", { name: "Saved goals" });
    expect(within(list).getByText("Read one Gita verse a day")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit goal: Read one Gita verse a day" }));
    const edit = within(list).getByRole("textbox", { name: "Goal" });
    fireEvent.change(edit, { target: { value: "Read two verses a day" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(saved().goals[0].text).toBe("Read two verses a day");

    fireEvent.click(screen.getByRole("button", { name: "Delete goal: Read two verses a day" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete goal" }),
    );
    expect(saved().goals).toEqual([]);
    expect(screen.getByText("No goals saved yet.")).toBeInTheDocument();
  });

  it("refuses an empty goal with a clear message", () => {
    render(<MyJourneyScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
    fireEvent.click(screen.getByRole("button", { name: "Save goal" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write your goal first.");
  });

  it("exports a file, can turn saving off keeping data read-only, and can delete everything", async () => {
    const createURL = vi.fn(() => "blob:x");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: createURL, revokeObjectURL: vi.fn() }),
    );
    render(<MyJourneyScreen initialTab="data" />);
    fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
    fireEvent.click(screen.getByRole("tab", { name: "Goals" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Goal" }), {
      target: { value: "Walk daily" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save goal" }));
    fireEvent.click(screen.getByRole("tab", { name: "My data" }));
    expect(screen.getByText(/1 goal · 0 Wisdom Tree leaves/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export my data" }));
    expect(createURL).toHaveBeenCalledTimes(1);
    const blob = (createURL.mock.calls[0] as unknown as [Blob])[0];
    const exported = JSON.parse(await blob.text());
    expect(exported).toMatchObject({
      kind: "journey-export",
      data: { goals: [{ text: "Walk daily" }] },
    });

    fireEvent.click(screen.getByRole("button", { name: "Turn saving off" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it on this device (read-only)" }));
    expect(saved()).toMatchObject({ enabled: false, goals: [{ text: "Walk daily" }] });
    expect(
      screen.getByText(/Saving is off. What you saved earlier is shown read-only/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Goals" }));
    expect(screen.getByText("Walk daily")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete goal/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "My data" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete everything" }));
    await act(async () => {
      fireEvent.click(
        within(screen.getByRole("dialog")).getByRole("button", { name: "Delete everything" }),
      );
    });
    expect(localStorage.getItem("sanatana-journey")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Turn on saving on this device" }),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("opens the tab named in the link (?tab=tree), and the person can still switch", () => {
    query = "tab=tree";
    render(<MyJourneyScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
    expect(screen.getByRole("tab", { name: "Wisdom Tree" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Goals" }));
    expect(screen.getByRole("tab", { name: "Goals" })).toHaveAttribute("aria-selected", "true");
  });

  it("tabs follow the keyboard pattern (arrow keys)", () => {
    render(<MyJourneyScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Turn on saving on this device" }));
    const goals = screen.getByRole("tab", { name: "Goals" });
    goals.focus();
    fireEvent.keyDown(goals, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Wisdom Tree" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Wisdom Tree" }));
  });
});
