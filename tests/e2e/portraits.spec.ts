import { expect, test } from "@playwright/test";

const visibleSrc = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".illustrated img.ill-happy")];
    return imgs.filter((i) => i.offsetParent !== null).map((i) => i.getAttribute("src"));
  });

test("Portrait switch: child by default, adult when chosen, remembered, Kids stays child", async ({
  page,
  isMobile,
}) => {
  await page.goto("/companions");
  expect((await visibleSrc(page)).every((s) => s?.includes("/child/"))).toBe(true);

  let scope = page.getByRole("banner");
  if (isMobile) {
    await page.getByRole("button", { name: "All pages" }).click();
    scope = page.getByRole("navigation", { name: "All pages" });
  }
  await scope.getByRole("button", { name: "Child portraits: switch to adult" }).click();
  await expect(
    scope.getByRole("button", { name: "Adult portraits: switch to child" }),
  ).toBeVisible();
  const adult = await visibleSrc(page);
  expect(adult.length).toBeGreaterThan(0);
  expect(adult.every((s) => s?.includes("/adult/"))).toBe(true);

  await page.reload();
  expect((await visibleSrc(page)).every((s) => s?.includes("/adult/"))).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("sanatana-portraits"))).toBe("adult");

  await page.goto("/kids");
  await page.evaluate(() =>
    sessionStorage.setItem(
      "sanatana-kids-session",
      JSON.stringify({ age: "6-9", narration: false, rate: 0.9, activities: true, breakAfter: 0 }),
    ),
  );
  await page.reload();
  await expect(page.getByRole("heading", { name: "Story time" })).toBeVisible();
  const kids = await visibleSrc(page);
  expect(kids.length).toBe(4);
  expect(kids.every((s) => s?.includes("/child/"))).toBe(true);
});

test("no page is wider than a phone screen", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout only");
  for (const path of ["/", "/chat?companion=shiva", "/companions", "/kids"]) {
    await page.goto(path);
    const [scrollW, clientW] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(scrollW, path).toBeLessThanOrEqual(clientW);
  }
});
