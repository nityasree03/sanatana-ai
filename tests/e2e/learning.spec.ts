import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { installSpeechFakes, speechCtl } from "./speechFakes";

test("Learning Studio: open a lesson, listen to a verse, answer from the verses", async ({
  page,
}) => {
  await installSpeechFakes(page);
  await page.goto("/scripture-learning");
  await page.getByRole("link", { name: "Uma and the great mystery" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Uma and the great mystery" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.locator('[lang="sa"]').first()).toBeVisible();

  await page.getByRole("button", { name: "Listen to Kena Upanishad 4.1 in English" }).click();
  expect((await speechCtl.spoken(page))[0]).toMatch(/^She \(Uma\) said: "It is Brahman/);
  await expect(
    page.getByRole("button", { name: "Stop reading Kena Upanishad 4.1 in English" }),
  ).toBeVisible();
  await speechCtl.finishSpeech(page);

  const q3 = page.getByRole("group", { name: /^3\. What does Uma tell Indra/ });
  await q3.getByRole("radio", { name: /it is Brahman/ }).check();
  await q3.getByRole("button", { name: "Check answer 3" }).click();
  await expect(q3.getByText("Right.")).toBeVisible();
  await q3.getByRole("link", { name: "Kena Upanishad 4.1" }).click();
  await expect(page).toHaveURL(/#kena-4\.1$/);

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
});

test("Learning Studio: index passes an accessibility scan; unknown lessons are 404", async ({
  page,
}) => {
  await page.goto("/scripture-learning");
  await expect(page.getByRole("link")).not.toHaveCount(0);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.map((v) => v.id)).toEqual([]);
  const res = await page.goto("/scripture-learning/not-a-lesson");
  expect(res?.status()).toBe(404);
});
