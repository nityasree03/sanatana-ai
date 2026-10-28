import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The test server runs with AI_PROVIDER=practice (see playwright.config.ts): replies come from an
// offline stand-in that cites real passages found by the real search.
test("choose a companion, send a message and get a grounded reply with a wisdom thread", async ({
  page,
}) => {
  await page.goto("/companions");
  await page.getByRole("link", { name: "Chat with Shiva" }).click();
  await expect(page).toHaveURL(/\/chat\?companion=shiva/);
  await expect(page.getByRole("heading", { name: "Chat with Shiva" })).toBeAttached();

  const box = page.getByRole("textbox", { name: "Message Shiva" });
  await box.fill("How can I stay calm when things change?");
  await box.press("Enter");
  const log = page.getByRole("log");
  await expect(log.getByText("How can I stay calm when things change?")).toBeVisible();
  await expect(log.getByText(/Practice mode: no real AI is connected/)).toBeVisible();
  await expect(page.getByText("Practice mode (no real AI)")).toBeVisible();
  const thread = log.getByRole("region", { name: /Wisdom thread/ });
  await expect(thread.getByText("Verified scripture", { exact: false }).first()).toBeVisible();
  // A cited verse opens in the Scripture Explorer at that passage.
  const first = thread.getByRole("link").first();
  const href = await first.getAttribute("href");
  expect(href).toMatch(/^\/scriptures\/[a-z-]+\/\d+#/);
  await first.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.#]/g, "\\$&") + "$"));
});

test("a message about self-harm gets support resources, not an AI reply", async ({ page }) => {
  await page.goto("/chat?companion=krishna");
  await page.getByRole("textbox", { name: "Message Krishna" }).fill("I don't want to live anymore");
  await page.getByRole("button", { name: "Send message" }).click();
  const log = page.getByRole("log");
  await expect(log.getByText(/988/)).toBeVisible();
  await expect(log.getByText("Support resources")).toBeVisible();
  await expect(log.getByText(/Practice mode/)).toHaveCount(0);
});

test("switching companions changes the chat", async ({ page }) => {
  await page.goto("/chat");
  await page.getByRole("button", { name: "Hanuman" }).click();
  await expect(page.getByRole("heading", { name: "Chat with Hanuman" })).toBeAttached();
  await expect(page.getByRole("log").getByText(/You're now talking with Hanuman/)).toBeVisible();
});

test("chat page passes accessibility checks after a conversation, in night theme", async ({
  page,
}) => {
  await page.goto("/chat?companion=parvati");
  await page.getByRole("button", { name: "Night theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("textbox", { name: "Message Parvati" }).fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page
      .getByRole("log")
      .getByText(/Practice mode: no real AI/)
      .first(),
  ).toBeVisible();
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test("night theme is remembered after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Night theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
