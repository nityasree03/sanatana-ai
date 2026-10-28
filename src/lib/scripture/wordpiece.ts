/**
 * BERT "uncased" WordPiece tokenizer, matching Hugging Face `tokenizers` for
 * Xenova/all-MiniLM-L6-v2 (BertNormalizer: clean text, CJK spacing, lowercase + strip accents;
 * BertPreTokenizer: split on whitespace and punctuation; WordPiece with "##" continuations).
 * Written here so the server needs no native AI libraries. Parity is tested against the
 * Python tokenizer the passages were embedded with (tests/unit/wordpiece.test.ts).
 */

export interface Encoded {
  ids: number[];
  attentionMask: number[];
}

const MAX_CHARS_PER_WORD = 100;

function isControl(cp: number): boolean {
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return false;
  const ch = String.fromCodePoint(cp);
  return /\p{Cc}|\p{Cf}/u.test(ch);
}

function isWhitespace(cp: number): boolean {
  if (cp === 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d) return true;
  return /\p{Zs}/u.test(String.fromCodePoint(cp));
}

function isPunctuation(cp: number): boolean {
  // BERT treats all non-letter/number ASCII as punctuation, plus Unicode P* categories.
  if (
    (cp >= 33 && cp <= 47) ||
    (cp >= 58 && cp <= 64) ||
    (cp >= 91 && cp <= 96) ||
    (cp >= 123 && cp <= 126)
  )
    return true;
  return /\p{P}/u.test(String.fromCodePoint(cp));
}

function isChinese(cp: number): boolean {
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2a6df) ||
    (cp >= 0x2a700 && cp <= 0x2b73f) ||
    (cp >= 0x2b740 && cp <= 0x2b81f) ||
    (cp >= 0x2b820 && cp <= 0x2ceaf) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x2f800 && cp <= 0x2fa1f)
  );
}

function normalise(text: string): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0 || cp === 0xfffd || isControl(cp)) continue;
    if (isWhitespace(cp)) out += " ";
    else if (isChinese(cp)) out += ` ${ch} `;
    else out += ch;
  }
  // lowercase, then strip accents (NFD and drop combining marks)
  return out
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}

function preTokenize(text: string): string[] {
  const words: string[] = [];
  let cur = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (isWhitespace(cp)) {
      if (cur) words.push(cur);
      cur = "";
    } else if (isPunctuation(cp)) {
      if (cur) words.push(cur);
      words.push(ch);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur) words.push(cur);
  return words;
}

export class WordPieceTokenizer {
  private readonly vocab: Map<string, number>;
  private readonly unk: number;
  private readonly cls: number;
  private readonly sep: number;

  constructor(vocabList: readonly string[]) {
    this.vocab = new Map(vocabList.map((t, i) => [t, i]));
    this.unk = this.id("[UNK]");
    this.cls = this.id("[CLS]");
    this.sep = this.id("[SEP]");
  }

  private id(token: string): number {
    const v = this.vocab.get(token);
    if (v === undefined) throw new Error(`Token ${token} missing from vocabulary`);
    return v;
  }

  private wordPiece(word: string): number[] {
    const chars = Array.from(word);
    if (chars.length > MAX_CHARS_PER_WORD) return [this.unk];
    const out: number[] = [];
    let start = 0;
    while (start < chars.length) {
      let end = chars.length;
      let found: number | undefined;
      while (start < end) {
        const piece = (start > 0 ? "##" : "") + chars.slice(start, end).join("");
        found = this.vocab.get(piece);
        if (found !== undefined) break;
        end--;
      }
      if (found === undefined) return [this.unk];
      out.push(found);
      start = end;
    }
    return out;
  }

  /** Encode one text: [CLS] tokens [SEP], truncated to maxLength tokens in total. */
  encode(text: string, maxLength = 256): Encoded {
    const pieces = preTokenize(normalise(text)).flatMap((w) => this.wordPiece(w));
    const ids = [this.cls, ...pieces.slice(0, maxLength - 2), this.sep];
    return { ids, attentionMask: ids.map(() => 1) };
  }
}
