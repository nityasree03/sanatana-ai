import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settleAnimations } from "./settle";

async function axe(page: import("@playwright/test").Page) {
  await settleAnimations(page);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
}

test("Home by day: Temple Dawn hero with the four companions", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText(/Talk with four AI companions/);
  await expect(
    page.getByRole("link", { name: /Shiva Stillness that sees through change/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Scripture Explorer \d+ texts and [\d,]+ passages/ }),
  ).toBeVisible();
  await expect(page.getByText(/AI is not connected yet/)).toHaveCount(0);
  await axe(page);
});

test("Home by night: Kailash Night constellation picks a companion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("sanatana-theme", "dark"));
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("Four companions. One sky of verses.");
  const sky = page.getByRole("group", { name: "Choose a companion" });
  await expect(sky.getByRole("button", { name: "Shiva" })).toHaveAttribute("aria-pressed", "true");
  await sky.getByRole("button", { name: "Hanuman" }).click();
  await expect(sky.getByRole("button", { name: "Hanuman" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText(/What challenge are you facing\?/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Talk with Hanuman" })).toHaveAttribute(
    "href",
    "/chat?companion=hanuman",
  );
  await axe(page);
});

test("Home: animations are off when the device asks for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const name = await page
    .locator(".arch-bob")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
});
