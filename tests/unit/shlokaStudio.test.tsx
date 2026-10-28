import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShlokaStudio, type ShlokaVerse } from "@/components/shloka/ShlokaStudio";
import { fakeInput, fakeOutput } from "./fakeSpeech";

const verses: ShlokaVerse[] = [
  {
    id: "bg-2.47",
    title: "Do your part; let go of the fruit",
    reference: "Bhagavad Gita 2.47",
    href: "/scriptures/bhagavad-gita/2#bg-2.47",
    lines: [
      {
        devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        iast: "karmaṇyevādhikāraste mā phaleṣu kadācana|",
      },
      {
        devanagari: "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि",
        iast: "mā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi",
      },
    ],
    english: "Thy business is with the action only, never with its fruits…",
    translator: "Annie Besant",
  },
  {
    id: "isa-1",
    title: "All this is covered by the Lord",
    reference: "Isa Upanishad 1",
    href: "/scriptures/isa-upanishad/1#isa-1",
    lines: [
      { devanagari: "ईशा वास्यमिदँ सर्वं", iast: "īśā vāsyamidam̐ sarvaṃ" },
      { devanagari: "तेन त्यक्तेन भुञ्जीथा", iast: "tena tyaktena bhuñjīthā" },
    ],
    english: "All this…",
    translator: "Swami Paramananda",
  },
];

function setup() {
  const out = fakeOutput();
  const mic = fakeInput();
  render(<ShlokaStudio verses={verses} pauseMs={1000} output={out.adapter} input={mic.adapter} />);
  return { out, mic };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Shloka Practice Studio", () => {
  it("shows each line in Devanagari and IAST, and the English for the whole verse", () => {
    setup();
    const line1 = screen.getByRole("button", { name: /Line 1/ });
    expect(line1).toHaveAttribute("aria-pressed", "true");
    expect(line1.querySelector('[lang="sa"]')).toHaveTextContent("कर्मण्येवाधिकारस्ते");
    expect(line1.querySelector('[lang="sa-Latn"]')).toHaveTextContent("karmaṇyevādhikāraste");
    expect(screen.getByText(/English \(whole verse\) · Annie Besant/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Read Bhagavad Gita 2.47/ })).toHaveAttribute(
      "href",
      "/scriptures/bhagavad-gita/2#bg-2.47",
    );
  });

  it("plays a line slowly in a Hindi voice", () => {
    const { out } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Line 2/ }));
    fireEvent.click(screen.getByRole("button", { name: "Listen slowly to line 2" }));
    expect(out.spoken[0]).toMatchObject({ text: verses[0].lines[1].devanagari, rate: 0.55 });
    expect(screen.getByText("Playing line 2…")).toBeVisible();
    act(() => out.finish());
    expect(screen.queryByText(/Playing/)).toBeNull();
  });

  it("repeats a line three times with a pause for the learner after each", () => {
    const { out } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Repeat line 1 3 times with pauses" }));
    for (let n = 1; n <= 3; n++) {
      expect(out.spoken).toHaveLength(n);
      expect(screen.getByText(`Playing line 1 (${n} of 3)…`)).toBeVisible();
      act(() => out.finish());
      expect(screen.getByText(`Your turn: say line 1 (${n} of 3).`)).toBeVisible();
      act(() => vi.advanceTimersByTime(1000));
    }
    expect(out.spoken).toHaveLength(3);
    expect(screen.queryByText(/Your turn|Playing/)).toBeNull();
  });

  it("stops the repeats when the learner switches verse", () => {
    const { out } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Repeat line 1 3 times with pauses" }));
    act(() => out.finish());
    fireEvent.change(screen.getByRole("combobox", { name: "Choose a verse" }), {
      target: { value: "1" },
    });
    act(() => vi.advanceTimersByTime(5000));
    expect(out.spoken).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Isa Upanishad 1" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Line 1/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("checks a recitation only after opting in, and names missed words", () => {
    const { mic } = setup();
    expect(screen.queryByRole("button", { name: "Recite line 1" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: /Check my recitation/ }));
    fireEvent.click(screen.getByRole("button", { name: "Recite line 1" }));
    expect(screen.getByText(/Listening… say line 1 now/)).toBeVisible();
    act(() => {
      mic.final("कर्मण्येवाधिकारस्ते मा");
      mic.end();
    });
    const result = screen.getByText(/similar \(approximate\)/).parentElement!.parentElement!;
    expect(within(result).getByText(/Words to practise/)).toHaveTextContent("फलेषु (phaleṣu)");
  });

  it("ignores a late result from an earlier line", () => {
    const { mic } = setup();
    fireEvent.click(screen.getByRole("checkbox", { name: /Check my recitation/ }));
    fireEvent.click(screen.getByRole("button", { name: "Recite line 1" }));
    act(() => mic.final("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"));
    fireEvent.click(screen.getByRole("button", { name: /Line 2/ }));
    expect(screen.queryByText(/similar/)).toBeNull();
    expect(screen.getByRole("button", { name: "Recite line 2" })).toBeVisible();
  });
});
