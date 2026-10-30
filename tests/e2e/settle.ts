import type { Page } from "@playwright/test";

/**
 * Wait for one-off entrance animations (fade-ins) to finish, so an accessibility scan sees the
 * final colours rather than half-faded text. Looping animations are left running.
 */
export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}
