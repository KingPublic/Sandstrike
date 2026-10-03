import { expect, test, type Page } from "@playwright/test";
import { startRampage } from "./helpers";

async function startAscentHunt(page: Page): Promise<void> {
  await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Rampage", exact: true }).click();
  await page.getByRole("button", { name: "Start Rampage", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Rampage ready");
}

test("Rampage hunts five Hunter bots up the rising sand", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.setViewportSize({ width: 1280, height: 720 });
  await startAscentHunt(page);
  await expect(page.locator("[data-rampage-hud]")).toBeVisible();

  const start = await page.evaluate(() => {
    const snapshot = window.__SANDSTRIKE_TEST__?.snapshot();
    return { surfaceY: snapshot?.world?.surfaceY ?? 0, total: snapshot?.rivals?.total ?? 0 };
  });
  expect(start.total).toBe(5);
  await expect(page.locator("[data-hud-threat]")).toContainText("Hunters 5 / 5");

  // A rival deploys and the sand keeps climbing under it.
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().rivals?.deployed ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().rivals?.units[0]?.position.y ?? 0), { timeout: 30_000, intervals: [500] }).toBeLessThan(-20);
  const later = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().world?.surfaceY ?? 0);
  expect(later).toBeLessThan(start.surfaceY);

  // Carrion is the worm's only healing, so it must appear in the sand.
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.presentation().actorIds.some((id) => id.startsWith("carrion.")) ?? false), { timeout: 30_000, intervals: [500] }).toBe(true);
  await page.screenshot({ path: "docs/verification/rampage-hunt.png" });
  expect(errors).toEqual([]);
});

test("Rampage Classic still starts the old arena run", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await startRampage(page);
  const snapshot = await page.evaluate(() => {
    const state = window.__SANDSTRIKE_TEST__?.snapshot();
    return { rivals: state?.rivals !== undefined, world: state?.world !== undefined, arcade: state?.arcade === true };
  });
  expect(snapshot).toEqual({ rivals: false, world: false, arcade: true });
  expect(errors).toEqual([]);
});
