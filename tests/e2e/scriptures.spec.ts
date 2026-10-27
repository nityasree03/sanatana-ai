import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function axe(page: import("@playwright/test").Page) {
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return scan.violations.map((v) => `${v.id}: ${v.help}`);
}

test("keyword search finds a verse and links to it in its chapter", async ({ page }) => {
  await page.goto("/scriptures");
  await page.getByLabel("Search words or a question").fill("Hanuman leap ocean");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Using keywords.");
  const first = page.locator("ol article").first();
  await expect(first).toContainText("Ramayana");
  await expect(await axe(page)).toEqual([]);

  await first.getByRole("heading").getByRole("link").click();
  await expect(page).toHaveURL(/\/scriptures\/valmiki-ramayana\/\d+#ram-5\./);
  const id = new URL(page.url()).hash.slice(1);
  // Next keeps the previous page hidden in the DOM after client navigation (Cache Components),
  // so check the visible copy and that the browser scrolled to it.
  const verse = page.locator(`article[id="${id}"]:visible`);
  await expect(verse).toBeInViewport();
});

test("filters limit results to one text", async ({ page }) => {
  await page.goto("/scriptures");
  await page.getByLabel("Filter by text").selectOption("kena-upanishad");
  await page.getByLabel("Search words or a question").fill("Uma golden");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const cards = page.locator("ol article");
  await expect(cards.first()).toBeVisible();
  for (const text of await cards.locator("h3").allInnerTexts()) expect(text).toContain("Kena");
});

test("too-short searches explain what to do", async ({ page }) => {
  await page.goto("/scriptures");
  await page.getByLabel("Search words or a question").fill("a");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/at least 2/i);
});

test("a chapter shows Sanskrit, IAST, English and the source licence", async ({ page }) => {
  const res = await page.goto("/scriptures/bhagavad-gita/2");
  expect(res?.status()).toBe(200);
  const verse = page.locator('article[id="bg-2.47"]');
  await expect(verse.locator('[lang="sa"]')).toContainText("कर्मण्येवाधिकारस्ते");
  await expect(verse).toContainText("karmaṇyevādhikāraste");
  await verse.getByText("Source and licence").click();
  await expect(verse).toContainText("Annie Besant");
  await expect(verse).toContainText(/public domain/i);
  await expect(await axe(page)).toEqual([]);
});

test("a work page lists its chapters and sources", async ({ page }) => {
  await page.goto("/scriptures/svetasvatara-upanishad");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Svetasvatara");
  await expect(page.getByText(/OCR/).first()).toBeVisible();
  await expect(await axe(page)).toEqual([]);
});

for (const path of [
  "/scriptures/nope",
  "/scriptures/bhagavad-gita/99",
  "/scriptures/bhagavad-gita/2/x",
]) {
  test(`${path} is a real 404`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This page could not be found",
    );
    await expect(page.getByRole("link", { name: "Scripture Explorer" }).last()).toBeVisible();
  });
}
