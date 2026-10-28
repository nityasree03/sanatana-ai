import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Wisdom Map: pick a node, read its verse, follow it to the scripture", async ({ page }) => {
  await page.goto("/wisdom-map");
  const map = page.getByRole("group", { name: "Wisdom Knowledge Map" });
  await map.getByRole("button", { name: "Nachiketa" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Nachiketa" })).toBeVisible();

  await page.getByRole("radio", { name: "Krishna's texts" }).check();
  await page.getByText(/links as a list/).click();
  await expect(page.getByRole("table")).toBeVisible();

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);

  const region = page.getByRole("region", { name: "Nachiketa" });
  const verse = region.getByRole("link").first();
  const href = await verse.getAttribute("href");
  await verse.click();
  await expect(page).toHaveURL(new RegExp(`${href!.split("#")[0]}`));
});
