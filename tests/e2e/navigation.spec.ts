import { expect, test } from "@playwright/test";

test("the All pages menu opens, lists every section and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "All pages" }).click();
  const menu = page.getByRole("navigation", { name: "All pages" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: /Dharma Lab/ }).click();
  await expect(page).toHaveURL(/\/dharma-lab$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dharma Lab" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "All pages" })).toHaveCount(0);
});

test("keyboard users can skip to the main content", async ({ page }) => {
  await page.goto("/about");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
});

test("on phones the companion panel can be hidden and shown", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout only");
  await page.goto("/chat");
  const toggle = page.getByRole("button", { name: "Hide companion" });
  await toggle.click();
  await expect(page.getByRole("button", { name: "Show companion" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page.getByRole("button", { name: "Krishna", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Show companion" }).click();
  await expect(page.getByRole("button", { name: "Krishna", exact: true })).toBeVisible();
});
