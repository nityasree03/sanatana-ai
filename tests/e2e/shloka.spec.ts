import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { installSpeechFakes, speechCtl } from "./speechFakes";

test("Shloka Practice: pick a verse, repeat a line, check a recitation", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/shloka-practice");
  // The Listen buttons appear only once the page is interactive.
  await expect(page.getByRole("button", { name: "Listen to line 1" })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Choose a verse" })
    .selectOption({ label: "Katha Upanishad 1.3.14: Arise, awake" });
  await expect(
    page.getByRole("heading", { level: 2, name: "Katha Upanishad 1.3.14" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Line \d/ })).toHaveCount(4);

  await page.getByRole("button", { name: /Line 1/ }).click();
  await page.getByRole("button", { name: "Repeat line 1 3 times with pauses" }).click();
  expect(await speechCtl.spoken(page)).toEqual(["उत्तिष्ठत जाग्रत"]);
  await speechCtl.finishSpeech(page);
  await expect(page.getByText("Your turn: say line 1 (1 of 3).")).toBeVisible();
  await expect(page.getByText("Playing line 1 (2 of 3)…")).toBeVisible({ timeout: 6000 });
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByText(/Playing|Your turn/)).toHaveCount(0);

  await page.getByRole("checkbox", { name: /Check my recitation/ }).check();
  await page.getByRole("button", { name: "Recite line 1" }).click();
  await speechCtl.say(page, "उत्तिष्ठत जाग्रत");
  await speechCtl.micEnd(page);
  await expect(page.getByText(/Very close: about \d+% similar/)).toBeVisible();
  await expect(page.getByText("Every word was heard.")).toBeVisible();

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
});

test("Shloka Practice: without voices or a microphone the text is still there", async ({
  page,
}) => {
  await installSpeechFakes(page, { mic: false, voice: false });
  await page.addInitScript(() =>
    Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true }),
  );
  await page.goto("/shloka-practice");
  await expect(page.getByText(/no voices for reading aloud/)).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Check my recitation/ })).toHaveCount(0);
  await expect(page.locator('[lang="sa"]').first()).toBeVisible();
});
