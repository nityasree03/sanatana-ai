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

test("Karma Reflection Mirror: write, discuss in chat (not sent), make a Sankalpa", async ({
  page,
}) => {
  await page.goto("/karma-reflection");
  await page.getByRole("button", { name: "Turn on saving on this device" }).click();
  await page.getByRole("textbox", { name: "My intention" }).fill("Help my sister study");
  await page.getByRole("textbox", { name: "My next step" }).fill("Rest before helping");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await expect(page.getByRole("article", { name: /Reflection of/ })).toBeVisible();
  expect(await axe(page)).toEqual([]);

  await page.getByRole("button", { name: "Make my next step a Sankalpa" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Add Sankalpa" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();

  await page.getByRole("button", { name: "Discuss with a companion" }).click();
  await page.getByRole("dialog").getByRole("radio", { name: "Shiva" }).check();
  await page.getByRole("dialog").getByRole("button", { name: "Open the chat" }).click();
  await expect(page).toHaveURL(/\/chat\?companion=shiva&draft=1$/);
  await expect(page.getByRole("textbox", { name: "Message Shiva" })).toHaveValue(
    /My intention: Help my sister study/,
  );
  await expect(page.getByRole("region", { name: /Wisdom thread/ })).toHaveCount(0); // nothing sent

  await page.goto("/daily-sankalpa");
  const today = page.getByRole("region", { name: /^Today/ });
  await today.getByRole("checkbox", { name: "Rest before helping" }).check();
  await expect(page.getByText(/Kept on 1 of 1 planned day this past week/)).toBeVisible();
  expect(await axe(page)).toEqual([]);
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: /^Today/ })
      .getByRole("checkbox", { name: "Rest before helping" }),
  ).toBeChecked();
});
