import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { installSpeechFakes, speechCtl } from "./speechFakes";

const avatar = (page: import("@playwright/test").Page) =>
  page.locator("figure[data-avatar-state]").first();

test("speak a message: transcript appears for editing, then send it", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat?companion=hanuman");
  await page.getByRole("button", { name: "Start voice input" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "listening");
  await speechCtl.say(page, "How do I keep", false);
  const box = page.getByRole("textbox", { name: "Message Hanuman" });
  await expect(box).toHaveValue("How do I keep");
  await speechCtl.say(page, "How do I keep going", true);
  await speechCtl.micEnd(page);
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "idle");
  await expect(box).toHaveValue("How do I keep going");
  await box.fill("How do I keep going when I'm tired?");
  await box.press("Enter");
  await expect(
    page.getByRole("log").getByText("How do I keep going when I'm tired?"),
  ).toBeVisible();
});

test("listen to a reply, see the speaking state, stop, and replay", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat?companion=parvati");
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "idle");
  expect(await speechCtl.spoken(page)).toEqual([]); // never speaks by itself

  await page.getByRole("button", { name: "Listen to Parvati's reply" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "speaking");
  await expect(page.getByRole("button", { name: "Stop speaking" })).toBeVisible();
  await page.getByRole("button", { name: "Stop speaking" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "idle");

  await page.getByRole("button", { name: "Listen to Parvati's reply" }).click();
  await speechCtl.finishSpeech(page);
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "idle");
  expect(await speechCtl.spoken(page)).toHaveLength(2);
});

test("'Speak replies' reads new replies aloud and can be muted", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat");
  await page.getByRole("button", { name: "Speak replies: off" }).click();
  await page.getByRole("textbox", { name: "Message Krishna" }).fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "speaking");
  await page.getByRole("button", { name: "Speak replies: on" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "idle");
});

test("browsers without voice input get a clear message and typing still works", async ({
  page,
}) => {
  await installSpeechFakes(page, { mic: false });
  await page.goto("/chat");
  await page.getByRole("button", { name: "Start voice input" }).click();
  await expect(page.getByRole("status")).toContainText("isn't available in this browser");
  await page.getByRole("textbox", { name: "Message Krishna" }).fill("Typed instead");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log").getByText("Typed instead")).toBeVisible();
});

test("a blocked microphone shows the error state and a helpful message", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat?companion=shiva");
  await page.getByRole("button", { name: "Start voice input" }).click();
  await speechCtl.micError(page, "not-allowed");
  await speechCtl.micEnd(page);
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "error");
  await expect(page.getByRole("status")).toContainText("microphone is blocked");
});

test("chat with voice controls passes accessibility checks while speaking", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat?companion=krishna");
  await page.getByRole("button", { name: "Listen to Krishna's reply" }).click();
  await expect(avatar(page)).toHaveAttribute("data-avatar-state", "speaking");
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test("reduced motion: portraits stop animating", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/chat");
  const iterations = await page
    .locator(".illustrated .ill-blinking")
    .first()
    .evaluate((el) => getComputedStyle(el).animationIterationCount);
  expect(iterations).toBe("1");
});

test("the portrait shows the right expression for each state", async ({ page }) => {
  await installSpeechFakes(page);
  await page.goto("/chat?companion=hanuman");
  const visible = (expr: string) =>
    page
      .locator(`.illustrated .ill-${expr}`)
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity) > 0.5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Start voice input" }).click();
  await expect.poll(() => visible("listening")).toBe(true);
  await page.getByRole("button", { name: "Stop voice input" }).click();
  await expect.poll(() => visible("listening")).toBe(false);
  await page.getByRole("button", { name: "Listen to Hanuman's reply" }).click();
  await expect.poll(() => visible("speaking")).toBe(true);
});
