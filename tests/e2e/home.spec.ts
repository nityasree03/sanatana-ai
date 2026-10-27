import { expect, test } from "@playwright/test";

test("home page loads and shows the honest Phase 0 status", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Sanatana AI");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sanatana AI");
  await expect(page.getByText("AI chat is not connected yet.")).toBeVisible();
});
