import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function axe(page: import("@playwright/test").Page) {
  const scan = await new AxeBuilder({ page }).analyze();
  return scan.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
}

test("My Dharma Journey: nothing is saved before opting in; goals work; page is accessible", async ({
  page,
}) => {
  await page.goto("/my-journey");
  await expect(page.getByRole("button", { name: "Turn on saving on this device" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("sanatana-journey"))).toBeNull();
  expect(await axe(page)).toEqual([]);
  await page.getByRole("button", { name: "Turn on saving on this device" }).click();
  await page.getByRole("textbox", { name: "Goal" }).fill("Be patient with my family");
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByRole("list", { name: "Saved goals" })).toContainText(
    "Be patient with my family",
  );
  await page.reload();
  await expect(page.getByRole("list", { name: "Saved goals" })).toContainText(
    "Be patient with my family",
  );
  expect(await axe(page)).toEqual([]);
});

test("save a verse from the Scripture Explorer and find it on the Wisdom Tree", async ({
  page,
}) => {
  await page.goto("/scriptures/bhagavad-gita/2");
  await page.getByRole("button", { name: /^Save to Wisdom Tree ?: Bhagavad Gita 2\.47$/ }).click();
  const dialog = page.getByRole("dialog", { name: "Save to your Wisdom Tree" });
  await dialog.getByRole("radio", { name: "Duty and action" }).check();
  await dialog.getByRole("button", { name: "Turn on saving and save" }).click();
  await expect(page.getByText(/Saved to your/).first()).toBeVisible();

  await page.getByRole("link", { name: "Wisdom Tree" }).first().click();
  await expect(page.getByRole("tab", { name: "Wisdom Tree" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const leaf = page.getByRole("button", { name: "Bhagavad Gita 2.47, Duty and action" });
  await leaf.focus();
  await page.keyboard.press("Enter");
  const details = page.getByRole("article", { name: "Bhagavad Gita 2.47" });
  await expect(details.getByRole("link", { name: "Bhagavad Gita 2.47" })).toHaveAttribute(
    "href",
    "/scriptures/bhagavad-gita/2#bg-2.47",
  );
  expect(await axe(page)).toEqual([]);
});
