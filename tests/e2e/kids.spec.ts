import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { installSpeechFakes, speechCtl } from "./speechFakes";

async function axe(page: Page) {
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
}

test("Kids: caregiver setup, story by keyboard, no server calls, nothing kept", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) apiCalls.push(r.url());
  });
  await installSpeechFakes(page);
  await page.goto("/kids");
  await expect(page.getByText(/Grown-up check: what is/)).toBeVisible();
  await axe(page);

  const label = await page.getByText(/Grown-up check: what is/).textContent();
  const [, a, b] = label!.match(/(\d+) \+ (\d+)/)!;
  await page.getByLabel(/Grown-up check/).fill(String(Number(a) + Number(b)));
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: "Ages 4–5" }).check();
  await axe(page);
  await page.getByRole("button", { name: "Start story time" }).click();
  await expect(page.getByRole("heading", { name: "Story time" })).toBeVisible();
  await axe(page);

  await page.getByRole("button", { name: "Read The Mountain Umbrella" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Little Krishna asked/)).toBeVisible();
  await page.getByRole("button", { name: "Play" }).focus();
  await page.keyboard.press("Enter");
  expect((await speechCtl.spoken(page))[0]).toMatch(/^In the village of Vraja/);
  await speechCtl.finishSpeech(page);
  await axe(page);

  // Keyboard only from here: Next moves focus to the new page's heading.
  const next = page.getByRole("button", { name: /^(Next|Skip)/ });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /Page 2/ })).toBeFocused();
  await next.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "The cows and the hill" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Yes! The cows and Govardhana Hill/)).toBeVisible();
  await axe(page);

  while (!(await page.getByText("Tap the pictures in the order they happened.").isVisible())) {
    await next.focus();
    await page.keyboard.press("Enter");
  }
  for (const n of ["The storm", "The mountain umbrella", "The sun comes out"]) {
    await page.getByRole("button", { name: n }).focus();
    await page.keyboard.press("Enter");
  }
  await expect(page.getByText(/First the storm, then the mountain umbrella/)).toBeVisible();
  await axe(page);
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("The end", { exact: true })).toBeVisible();
  await axe(page);

  expect(apiCalls).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

for (const motion of ["no-preference", "reduce"] as const) {
  test(`Kids: rain animation with reduced motion = ${motion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto("/kids");
    await page.evaluate(() =>
      sessionStorage.setItem(
        "sanatana-kids-session",
        JSON.stringify({
          age: "6-9",
          narration: false,
          rate: 0.9,
          activities: false,
          breakAfter: 0,
        }),
      ),
    );
    await page.reload();
    await page.getByRole("button", { name: "Read The Mountain Umbrella" }).click();
    for (let i = 0; i < 2; i++) await page.getByRole("button", { name: /^Next/ }).click();
    const rain = page.locator(".kids-rain").first();
    await expect(rain).toBeAttached();
    expect(await rain.evaluate((el) => getComputedStyle(el).animationName)).toBe(
      motion === "reduce" ? "none" : "kids-rain",
    );
  });
}
