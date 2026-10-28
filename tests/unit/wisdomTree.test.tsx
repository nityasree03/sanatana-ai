import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SaveLeafButton } from "@/components/journey/SaveLeafButton";
import { WisdomTree, branchesOf } from "@/components/journey/WisdomTree";
import type { Leaf } from "@/lib/journey/schema";

beforeEach(() => localStorage.clear());
const saved = () => JSON.parse(localStorage.getItem("sanatana-journey") ?? "null");

const PASSAGE = {
  id: "bg-2.47",
  reference: "Bhagavad Gita 2.47",
  translator: "Annie Besant",
  text: "Thy business is with the action only, never with its fruits.",
  href: "/scriptures/bhagavad-gita/2#bg-2.47",
};

function leaf(i: number, theme: string, extra: Partial<Leaf> = {}): Leaf {
  const t = new Date(2026, 9, 1 + i).toISOString();
  return {
    id: `l${i}`,
    passageId: `p${i}`,
    reference: `Ref ${i}`,
    translator: "T",
    excerpt: `Excerpt ${i}`,
    href: `/scriptures/x/1#p${i}`,
    theme,
    note: "",
    source: "chat",
    createdAt: t,
    updatedAt: t,
    ...extra,
  };
}

function store(leaves: Leaf[]) {
  localStorage.setItem(
    "sanatana-journey",
    JSON.stringify({
      version: 1,
      enabled: true,
      goals: [],
      leaves,
      reflections: [],
      sankalpas: [],
    }),
  );
}

describe("Save to Wisdom Tree", () => {
  it("asks for consent when saving is off, then saves the passage with its link and a chosen theme", () => {
    render(<SaveLeafButton passage={PASSAGE} source="chat" companion="krishna" />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Save to Wisdom Tree ?: Bhagavad Gita 2\.47$/ }),
    );
    const dialog = screen.getByRole("dialog", { name: "Save to your Wisdom Tree" });
    expect(within(dialog).getByText(/Saving on this device is off/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: "My own theme" }));
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Theme name" }), {
      target: { value: "Work" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: /Note/ }), {
      target: { value: "For exam week" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Turn on saving and save" }));
    expect(saved().leaves[0]).toMatchObject({
      passageId: "bg-2.47",
      href: PASSAGE.href,
      theme: "Work",
      note: "For exam week",
      source: "chat",
      companion: "krishna",
      excerpt: PASSAGE.text,
    });
    expect(screen.getByText(/Saved to your/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wisdom Tree" })).toHaveAttribute(
      "href",
      "/my-journey?tab=tree",
    );
  });

  it("shows 'In your Wisdom Tree' for a passage that is already a leaf", () => {
    store([leaf(1, "Peace of mind", { passageId: "bg-2.47" })]);
    render(<SaveLeafButton passage={PASSAGE} source="explorer" />);
    expect(screen.queryByRole("button", { name: /Save/ })).not.toBeInTheDocument();
    expect(screen.getByText(/In your/)).toBeInTheDocument();
  });
});

describe("Wisdom Tree", () => {
  it("groups leaves into branches by theme, largest first, with at most 8 branches", () => {
    const themes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const leaves = themes.flatMap((t, i) =>
      Array.from({ length: 10 - i }, (_, j) => leaf(i * 20 + j, t)),
    );
    const b = branchesOf(leaves);
    expect(b).toHaveLength(8);
    expect(b[0].theme).toBe("A");
    expect(b.at(-1)!.theme).toBe("More themes");
    expect(b.reduce((n, x) => n + x.leaves.length, 0)).toBe(leaves.length);
  });

  it("leaves are keyboard buttons; choosing one shows the passage linked to its scripture", () => {
    const leaves = [
      leaf(1, "Courage and strength"),
      leaf(2, "Peace of mind", { note: "Read before sleep" }),
    ];
    store(leaves);
    render(<WisdomTree leaves={leaves} readOnly={false} />);
    expect(screen.getByRole("group", { name: "Wisdom Tree with 2 branches" })).toBeInTheDocument();
    const leafButton = screen.getByRole("button", { name: "Ref 2, Peace of mind" });
    fireEvent.keyDown(leafButton, { key: "Enter" });
    expect(leafButton).toHaveAttribute("aria-pressed", "true");
    const details = screen.getByRole("article", { name: "Ref 2" });
    expect(within(details).getByRole("link", { name: "Ref 2" })).toHaveAttribute(
      "href",
      "/scriptures/x/1#p2",
    );
    expect(within(details).getByText("Read before sleep")).toBeInTheDocument();
  });

  it("searches and filters the list", () => {
    const leaves = [
      leaf(1, "Courage and strength", { excerpt: "Fear not" }),
      leaf(2, "Peace of mind"),
    ];
    render(<WisdomTree leaves={leaves} readOnly={false} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search your leaves" }), {
      target: { value: "fear" },
    });
    const list = screen.getByRole("list", { name: "Saved leaves" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search your leaves" }), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Branch" }), {
      target: { value: "Peace of mind" },
    });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Showing 1 of 2")).toBeInTheDocument();
  });

  it("edits a leaf's branch and note, and deletes a leaf", () => {
    const leaves = [leaf(1, "Courage and strength")];
    store(leaves);
    const { rerender } = render(<WisdomTree leaves={leaves} readOnly={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit leaf Ref 1" }));
    const dialog = screen.getByRole("dialog", { name: "Edit leaf" });
    fireEvent.click(within(dialog).getByRole("radio", { name: "Devotion and love" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(saved().leaves[0].theme).toBe("Devotion and love");
    rerender(<WisdomTree leaves={saved().leaves} readOnly={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete leaf Ref 1" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete leaf" }),
    );
    expect(saved().leaves).toEqual([]);
  });

  it("read-only mode has no edit or delete", () => {
    const leaves = [leaf(1, "Courage and strength")];
    render(<WisdomTree leaves={leaves} readOnly />);
    expect(screen.queryByRole("button", { name: /Edit leaf|Delete leaf/ })).not.toBeInTheDocument();
  });
});
