import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DharmaLab } from "@/components/dharma/DharmaLab";

const posted: { url: string; body: Record<string, unknown> }[] = [];
const PATHS = ["Take the job", "Stay and grow here", "Wait and gather information"].map(
  (title, i) => ({
    title,
    summary: `Summary ${i}`,
    upsides: [`Up ${i}`],
    downsides: [`Down ${i}`],
    unknowns: [`Unknown ${i}`],
    firstStep: `First step ${i}`,
  }),
);

function server(ai: string | null = "Practice mode") {
  posted.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/chat") return new Response(JSON.stringify({ ai, practice: true }));
      const body = JSON.parse(String(init?.body));
      posted.push({ url, body });
      if (url === "/api/dharma-lab/options")
        return new Response(JSON.stringify({ mode: "ai", options: PATHS }));
      return new Response(
        JSON.stringify({
          mode: "ai",
          answers: [
            {
              companion: body.who,
              mode: "ai",
              reply: `Reflection from ${body.who}`,
              grounded: true,
              citations: [
                {
                  id: "bg-2.47",
                  how: "About action",
                  reflection: "Take one step",
                  passage: {
                    id: "bg-2.47",
                    reference: "Bhagavad Gita 2.47",
                    href: "/scriptures/bhagavad-gita/2#bg-2.47",
                    companions: ["krishna"],
                    translation: {
                      text: "Thy business is with the action only.",
                      translator: "Annie Besant",
                    },
                  },
                },
              ],
            },
          ],
        }),
      );
    }),
  );
}

async function flush() {
  for (let i = 0; i < 6; i++) await act(async () => {});
}
const saved = () => JSON.parse(localStorage.getItem("sanatana-journey") ?? "null");

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  server();
});
afterEach(() => vi.unstubAllGlobals());

async function withPaths() {
  render(<DharmaLab />);
  await flush();
  fireEvent.change(screen.getByRole("textbox", { name: "What am I trying to decide?" }), {
    target: { value: "Should I move for a job?" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /What matters to me/ }), {
    target: { value: "Family" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Suggest 3 paths" }));
  await flush();
}

describe("Dharma Lab", () => {
  it("suggests three editable paths, labelled as AI, and shows them on the map", async () => {
    await withPaths();
    expect(posted[0]).toMatchObject({
      url: "/api/dharma-lab/options",
      body: { dilemma: "Should I move for a job?", values: "Family", existing: [] },
    });
    expect(screen.getAllByText(/suggested by AI, yours to edit/)).toHaveLength(3);
    const map = screen.getByRole("group", { name: "Decision map with 3 paths" });
    expect(
      within(map).getByRole("button", {
        name: /^Path 1: Take the job ?1 up · 1 down · 1 unknown$/,
      }),
    ).toBeInTheDocument();

    // Edit a title (commits when leaving the field) and a point; add and remove paths.
    const title = screen.getByRole("textbox", { name: "Path 1 title" });
    fireEvent.change(title, { target: { value: "" } });
    fireEvent.blur(title);
    expect(title).toHaveValue("Take the job"); // an empty title never replaces the old one
    fireEvent.change(title, { target: { value: "Take the city job" } });
    fireEvent.blur(title);
    fireEvent.change(
      screen.getByRole("textbox", { name: /Add a downside for Take the city job/ }),
      {
        target: { value: "Rent is high" },
      },
    );
    fireEvent.click(
      within(screen.getByRole("article", { name: "Path 1: Take the city job" })).getAllByRole(
        "button",
        { name: "Add to downsides" },
      )[0],
    );
    expect(
      within(map).getByRole("button", {
        name: /^Path 1: Take the city job ?1 up · 2 down · 1 unknown$/,
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "A path of my own" }), {
      target: { value: "Ask my parents" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add my own path" }));
    expect(screen.getByText(/Path 4 · my own/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove path 2: Stay and grow here" }));
    expect(screen.getByRole("group", { name: "Decision map with 3 paths" })).toBeInTheDocument();
  });

  it("selecting a branch (keyboard) asks a companion about that path and keeps the answer with its sources", async () => {
    await withPaths();
    const node = screen.getByRole("button", { name: /Path 3: Wait and gather information/ });
    fireEvent.keyDown(node, { key: "Enter" });
    expect(
      screen.getByRole("heading", {
        name: /4\. Perspectives on path 3: Wait and gather information/,
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Shiva" }));
    fireEvent.click(screen.getByRole("button", { name: "Ask Shiva about this path" }));
    await flush();
    expect(posted.at(-1)).toMatchObject({
      url: "/api/dharma-lab/perspective",
      body: {
        who: "shiva",
        path: { title: "Wait and gather information", unknowns: ["Unknown 2"] },
      },
    });
    const card = screen.getByRole("article", { name: "Shiva's perspective" });
    expect(within(card).getByText("Reflection from shiva")).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Bhagavad Gita 2.47" })).toHaveAttribute(
      "href",
      "/scriptures/bhagavad-gita/2#bg-2.47",
    );
    expect(within(card).getByText("AI-suggested reflection:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /^Path 3: Wait and gather information ?.*1 perspective/,
      }),
    ).toBeInTheDocument();
  });

  it("records the person's decision; removing that path clears it; 'not yet' is a real choice", async () => {
    await withPaths();
    const decide = () => screen.getByRole("region", { name: "5. My decision" });
    fireEvent.click(within(decide()).getByRole("button", { name: "Record my decision" }));
    expect(within(decide()).getByRole("alert")).toHaveTextContent(/Choose a path/);
    fireEvent.click(within(decide()).getByRole("radio", { name: "Path 2: Stay and grow here" }));
    fireEvent.click(within(decide()).getByRole("button", { name: "Record my decision" }));
    expect(within(decide()).getByText(/I choose “Stay and grow here”/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Path 2: Stay and grow here ?.*✓ my choice$/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove path 2: Stay and grow here" }));
    expect(within(decide()).queryByText(/Recorded/)).not.toBeInTheDocument();
    fireEvent.click(within(decide()).getByRole("radio", { name: "I'm not ready to decide yet" }));
    fireEvent.change(
      within(decide()).getByRole("textbox", { name: "What would help me decide?" }),
      {
        target: { value: "Talk to my sister" },
      },
    );
    fireEvent.click(within(decide()).getByRole("button", { name: "Record my decision" }));
    expect(within(decide()).getByText(/I'm not ready to decide yet\./)).toBeInTheDocument();
    expect(within(decide()).getByText("Note: Talk to my sister")).toBeInTheDocument();
  });

  it("saves to the journey only after consent, then keeps the saved copy in step; can delete it", async () => {
    await withPaths();
    fireEvent.click(screen.getByRole("button", { name: "Save in My Dharma Journey" }));
    expect(localStorage.getItem("sanatana-journey")).toBeNull();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Turn on saving and save" }),
    );
    await flush();
    expect(saved().decisions).toHaveLength(1);
    expect(saved().decisions[0].options.map((o: { title: string }) => o.title)).toEqual(
      PATHS.map((p) => p.title),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "What am I trying to decide?" }), {
      target: { value: "Should I move for a job abroad?" },
    });
    await flush();
    expect(saved().decisions[0].dilemma).toBe("Should I move for a job abroad?");
    fireEvent.click(screen.getByRole("button", { name: "Delete this saved map" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete map" }));
    await flush();
    expect(saved().decisions).toEqual([]);
    expect(screen.getByRole("textbox", { name: "What am I trying to decide?" })).toHaveValue("");
  });

  it("an unsaved map survives a reload in the same tab", async () => {
    const { unmount } = await (async () => {
      const r = render(<DharmaLab />);
      await flush();
      return r;
    })();
    fireEvent.change(screen.getByRole("textbox", { name: "What am I trying to decide?" }), {
      target: { value: "Keep me" },
    });
    await flush();
    unmount();
    render(<DharmaLab />);
    await flush();
    expect(screen.getByRole("textbox", { name: "What am I trying to decide?" })).toHaveValue(
      "Keep me",
    );
  });

  it("without an AI, suggestions and perspectives are unavailable but writing your own works", async () => {
    server(null);
    render(<DharmaLab />);
    await flush();
    expect(screen.getByRole("button", { name: "Suggest 3 paths" })).toBeDisabled();
    expect(screen.getByText(/write your own paths below/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "A path of my own" }), {
      target: { value: "Option A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add my own path" }));
    fireEvent.click(screen.getByRole("button", { name: "Select path 1" }));
    expect(screen.getByRole("button", { name: "Ask Krishna about this path" })).toBeDisabled();
    expect(posted).toEqual([]);
  });
});
