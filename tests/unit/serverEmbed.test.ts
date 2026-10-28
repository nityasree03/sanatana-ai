// @vitest-environment node
import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { MODEL_PATH, embedQueryOnServer } from "@/lib/scripture/serverEmbed";
import fixture from "./fixtures/queryVector.json";

// The model is downloaded at build time (scripts/fetch-model.mjs); skip if it is absent.
describe.skipIf(!existsSync(MODEL_PATH))("server-side meaning search", () => {
  it("produces the same vector as the Python pipeline", async () => {
    const v = await embedQueryOnServer(fixture.query);
    expect(v).toHaveLength(384);
    const cos = v!.reduce((s, x, i) => s + x * fixture.vector[i], 0);
    expect(cos).toBeGreaterThan(0.9999);
  });
});
