import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("choose a companion, send a message and get the honest reply", async ({ page }) => {
  await page.goto("/companions");
  await page.getByRole("link", { name: "Chat with Shiva" }).click();
  await expect(page).toHaveURL(/\/chat\?companion=shiva/);
  await expect(page.getByRole("heading", { name: "Chat with Shiva" })).toBeAttached();

  const box = page.getByRole("textbox", { name: "Message Shiva" });
  await box.fill("How can I stay calm when things change?");
  await box.press("Enter");
  const log = page.getByRole("log");
  await expect(log.getByText("How can I stay calm when things change?")).toBeVisible();
  await expect(log.getByText(/not connected to the AI yet/)).toBeVisible();
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
      .getByText(/not connected/)
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
