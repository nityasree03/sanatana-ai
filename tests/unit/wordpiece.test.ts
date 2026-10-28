// @vitest-environment node
import { describe, expect, it } from "vitest";
import vocab from "@/data/scripture/minilm-vocab.json";
import { WordPieceTokenizer } from "@/lib/scripture/wordpiece";
import cases from "./fixtures/wordpiece.json";

describe("WordPiece tokenizer parity with Hugging Face tokenizers", () => {
  const tok = new WordPieceTokenizer(vocab as string[]);
  it(`matches the Python tokenizer on ${cases.length} texts`, () => {
    const mismatches = cases.filter((c) => tok.encode(c.text).ids.join(",") !== c.ids.join(","));
    expect(mismatches.map((m) => m.text.slice(0, 60))).toEqual([]);
  });
});
