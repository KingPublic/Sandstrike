import { expect, type Page } from "@playwright/test";
import type { NextRunConfiguration } from "../../src/game/debug/E2EDebugBridge";
export async function openRampagePreview(page: Page, variant: "classic" | "ascent" = "classic"): Promise<void> {
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  // Existing worm specs assert the classic arena, so classic is the helper default.
  await page.getByRole("button", { name: variant === "classic" ? "Choose classic arena" : "Choose Rampage" }).click();
}
export async function startRampage(page: Page, configuration?: NextRunConfiguration, variant: "classic" | "ascent" = "classic"): Promise<void> {
  await page.goto("./");
  if (configuration) { await page.waitForFunction(() => window.__SANDSTRIKE_TEST__ !== undefined); await page.evaluate((next) => window.__SANDSTRIKE_TEST__?.configureNextRun(next), configuration); }
  await openRampagePreview(page, variant);
  await page.getByRole("button", { name: variant === "classic" ? "Start classic arena" : "Start Rampage" }).click();
  await expect(page.getByRole("status")).toContainText("Rampage ready");
  await expect(page.locator("canvas")).toBeFocused();
}
export async function restartWithConfiguration(page: Page, configuration: NextRunConfiguration): Promise<void> {
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run", exact: true }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await expect(page.getByRole("heading", { name: "Run complete" })).toBeVisible();
  await page.evaluate((next) => window.__SANDSTRIKE_TEST__?.configureNextRun(next), configuration);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator("canvas")).toBeFocused();
}
