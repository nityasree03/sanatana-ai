import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

describe("site information", () => {
  it("states clearly that companions are AI simulations", () => {
    expect(SITE.aiDisclosure).toMatch(/AI simulations/);
    expect(SITE.aiDisclosure).toMatch(/not the deities/);
  });
});
