import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The test server uses the offline practice AI (playwright.config.ts).
test("Divine Council: one question, four cited answers and a labelled comparison", async ({
  page,
}) => {
  await page.goto("/divine-council");
  await expect(page.getByRole("heading", { level: 1, name: "Divine Council" })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Your question for the Council" })
    .fill("How do I keep going when I feel discouraged?");
  await page.getByRole("button", { name: "Ask the Council" }).click();
  for (const name of ["Krishna", "Shiva", "Hanuman", "Parvati"]) {
    const card = page.getByRole("article", { name });
    await expect(card).toBeVisible();
    await expect(card.getByText(/AI interpretation · practice mode/)).toBeVisible();
    await expect(card.getByRole("region", { name: `${name}'s wisdom thread` })).toBeVisible();
  }
  const compare = page.getByRole("region", { name: "Where they agree and differ" });
  await expect(compare.getByText(/AI comparison of the answers above/)).toBeVisible();

  // A cited passage opens in the Scripture Explorer.
  const link = page.getByRole("article", { name: "Hanuman" }).getByRole("link").first();
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^\/scriptures\/.+#/);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
