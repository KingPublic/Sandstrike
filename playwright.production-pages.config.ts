import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "static-hosting.spec.ts",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4176/Sandstrike/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-production-pages",
      metadata: { buildKind: "production" },
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "npm run build:pages && npm run preview -- --mode pages --host 127.0.0.1 --port 4176 --strictPort",
    url: "http://127.0.0.1:4176/Sandstrike/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
