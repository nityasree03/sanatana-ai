import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXPRESSIONS, expressionSrc } from "@/components/avatars/IllustratedPortrait";
import { COMPANIONS } from "@/lib/companions";

describe("illustrated portrait assets", () => {
  it("has all six expressions for every companion, each a reasonable size", () => {
    for (const c of COMPANIONS) {
      for (const e of EXPRESSIONS) {
        const file = path.join(__dirname, "../../public", expressionSrc(c.id, e));
        expect(existsSync(file), file).toBe(true);
        const kb = statSync(file).size / 1024;
        expect(kb).toBeGreaterThan(5);
        expect(kb).toBeLessThan(120);
      }
    }
  });
});
