import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Living Leela: choose a scene, explore with a detour, reach the end", async ({ page }) => {
  await page.goto("/living-leela");
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveCount(4);
  await page.getByRole("link", { name: /^Begin The great leap to Lanka$/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "The great leap to Lanka" }),
  ).toBeVisible();
  await expect(page.getByText("Retelling (our summary, not scripture)")).toBeVisible();

  await page.getByRole("button", { name: "Hear his promise and watch the leap" }).click();
  await expect(page.getByRole("heading", { name: "Swift as Rama's arrow" })).toBeFocused();
  await page.getByRole("button", { name: "A mountain rises from the sea" }).click();
  await page.getByRole("button", { name: "Why does the mountain honour him?" }).click();
  await expect(page.getByText("A closer look", { exact: true })).toBeVisible();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  await page.getByRole("button", { name: /Back to the story/ }).click();
  await page.getByRole("button", { name: "Fly on across the sea" }).click();
  await page.getByRole("button", { name: "See the far shore" }).click();
  await expect(page.getByRole("heading", { name: "The end of this scene" })).toBeVisible();

  // Every passage links to the Scripture Explorer.
  const first = page.getByRole("link", { name: /^Ramayana V\.1, lines/ }).first();
  await expect(first).toHaveAttribute("href", /^\/scriptures\/valmiki-ramayana\/1#ram-5\.1\./);

  // Asking the companion opens the chat with the question in the box, not sent.
  await page.getByRole("link", { name: /Ask Hanuman about this moment/ }).click();
  await expect(page.getByRole("textbox", { name: "Message Hanuman" })).toHaveValue(
    "What does it feel like to finish one stage of a long journey?",
  );
  await expect(page.getByRole("region", { name: /Wisdom thread/ })).toHaveCount(0);
});

test("an unknown Living Leela scene is a real 404", async ({ request }) => {
  expect((await request.get("/living-leela/no-such-scene")).status()).toBe(404);
  expect((await request.get("/living-leela/umas-penance")).status()).toBe(200);
});
