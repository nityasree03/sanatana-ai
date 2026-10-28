import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: start the real website and check it in a real browser.
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    // Offline stand-in AI for tests only; production never sets this.
    env: { AI_PROVIDER: "practice" },
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
