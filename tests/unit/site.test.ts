import { describe, expect, it } from "vitest";
import { COMPANIONS, SITE } from "@/lib/site";

describe("site information", () => {
  it("lists exactly the four planned companions", () => {
    expect(COMPANIONS.map((c) => c.id)).toEqual(["krishna", "shiva", "hanuman", "parvati"]);
  });

  it("states clearly that companions are AI simulations", () => {
    expect(SITE.aiDisclosure).toMatch(/AI simulations/);
    expect(SITE.aiDisclosure).toMatch(/not the deities/);
  });
});
