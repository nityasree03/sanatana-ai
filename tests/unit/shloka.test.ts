import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { getPassage } from "@/lib/scripture/data";
import { compareRecitation, simplify } from "@/lib/shloka/compare";
import { SHLOKAS, pairLines } from "@/lib/shloka/verses";
import { pickVoice } from "@/lib/speech/webSpeechOutput";

describe("Shloka verses", () => {
  it("has 12 distinct verses, each with Sanskrit and IAST that pair line by line", () => {
    expect(SHLOKAS).toHaveLength(12);
    expect(new Set(SHLOKAS.map((s) => s.passage)).size).toBe(12);
    for (const s of SHLOKAS) {
      const p = getPassage(s.passage);
      expect(p, s.passage).toBeDefined();
      expect(p!.original?.script).toBe("Devanagari");
      expect(p!.transliteration?.scheme).toBe("IAST");
      expect(p!.verification_status).toBe("verified-clean-source");
      const lines = pairLines(p!.original!.text, p!.transliteration!.text);
      expect(lines.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("refuses to pair lines that do not match", () => {
    expect(() => pairLines("क\nख", "ka")).toThrow();
  });
});

const line = {
  devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
  iast: "karmaṇyevādhikāraste mā phaleṣu kadācana|",
};

describe("Recitation check", () => {
  it("simplifies away punctuation, virama and spacing", () => {
    expect(simplify("मा फलेषु कदाचन।")).toBe(simplify("मा फलेषुकदाचन"));
    expect(simplify("सङ्गोऽस्त्व")).toBe(simplify("सङ्गोस्त्व"));
    expect(simplify("kadācana|")).toBe("kadacana");
  });

  it("treats a faithful recitation as close, with nothing missed", () => {
    const r = compareRecitation("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", line);
    expect(r.band).toBe("close");
    expect(r.missed).toEqual([]);
  });

  it("tolerates small recognition differences", () => {
    const r = compareRecitation("कर्मणये वाधिकारस्ते मा फलेशु कदाचन", line);
    expect(r.band).toBe("close");
  });

  it("names words that were left out", () => {
    const r = compareRecitation("कर्मण्येवाधिकारस्ते मा", line);
    expect(r.band).not.toBe("close");
    expect(r.missed).toEqual([2, 3]);
  });

  it("compares Latin-letter transcripts with the IAST line", () => {
    expect(compareRecitation("karmanyevadhikaraste ma phaleshu kadachana", line).band).toBe(
      "close",
    );
    expect(compareRecitation("hello there", line).band).toBe("far");
    expect(compareRecitation("", line).band).toBe("far");
  });
});

describe("pickVoice", () => {
  const voices = [
    { lang: "en-IN" },
    { lang: "en-US" },
    { lang: "hi_IN" },
  ] as SpeechSynthesisVoice[];
  const synth = { getVoices: () => voices } as unknown as SpeechSynthesis;
  it("prefers Indian English for English and a Hindi voice for Hindi", () => {
    expect(pickVoice(synth, "en-GB")?.lang).toBe("en-IN");
    expect(pickVoice(synth, "hi-IN")?.lang).toBe("hi_IN");
    expect(pickVoice(synth, "ta-IN")).toBeNull();
  });
});
