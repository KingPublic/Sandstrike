import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["static-hosting.spec.ts", "rampage-flow.spec.ts", "phase-b-smoke.spec.ts", "hunt-flow.spec.ts", "two-role-mvp.spec.ts", "ascent-boss.spec.ts"],
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4174/Sandstrike/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-pages",
      metadata: { buildKind: "e2e" },
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "npm run build:e2e:pages && npm run preview -- --mode e2e-pages --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174/Sandstrike/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
