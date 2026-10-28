import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Dharma Lab: dilemma → suggested paths → map → perspective → decision → save", async ({
  page,
}) => {
  await page.goto("/dharma-lab");
  await page
    .getByRole("textbox", { name: "What am I trying to decide?" })
    .fill("Should I change my college major?");
  await page.getByRole("button", { name: "Suggest 3 paths" }).click();
  await expect(page.getByText(/suggested by AI, yours to edit/)).toHaveCount(3);
  const map = page.getByRole("group", { name: "Decision map with 3 paths" });
  await expect(map).toBeVisible();

  await map.getByRole("button", { name: /^Path 2:/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /4\. Perspectives on path 2/ })).toBeVisible();
  await page.getByRole("button", { name: "Ask Krishna about this path" }).click();
  await expect(page.getByRole("article", { name: "Krishna's perspective" })).toBeVisible();

  const decide = page.getByRole("region", { name: "5. My decision" });
  await decide.getByRole("radio", { name: "I'm not ready to decide yet" }).check();
  await decide.getByRole("button", { name: "Record my decision" }).click();
  await expect(decide.getByText(/I'm not ready to decide yet\./)).toBeVisible();

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);

  await page.getByRole("button", { name: "Save in My Dharma Journey" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Turn on saving and save" }).click();
  await expect(page.getByText(/Saved in My Dharma Journey on this device/).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "What am I trying to decide?" })).toHaveValue(
    "Should I change my college major?",
  );
  await expect(page.getByText("My saved decisions (1)")).toBeVisible();
});
