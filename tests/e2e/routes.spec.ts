import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "../../src/lib/routes";

// Every page in the central registry must load, show a heading and pass an accessibility scan.
for (const route of ROUTES) {
  test(`${route.path} loads and passes accessibility checks`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    const res = await page.goto(route.path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeAttached();
    if (route.status === "planned") {
      await expect(page.getByText(`It becomes functional in Phase ${route.phase}`)).toBeVisible();
    }

    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(scan.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}
