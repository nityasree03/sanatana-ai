import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Wisdom for Generations: levels and topics, accessible, no server calls", async ({ page }) => {
  const apiCalls: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) apiCalls.push(r.url());
  });
  await page.goto("/wisdom-for-generations");
  await page.getByRole("button", { name: "When anger comes" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "When anger comes" })).toBeVisible();
  await page.getByRole("radio", { name: "Teen" }).check();
  await expect(page.getByText(/chain reaction/)).toBeVisible();
  await expect(
    page.getByRole("article", { name: "When anger comes" }).getByRole("article"),
  ).toHaveCount(2);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  expect(apiCalls).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});
