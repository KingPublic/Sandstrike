import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";

test("quick Space activates Sandguard while the worm steers and leaps high", async ({ page }) => {
  await startRampage(page);
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().abilities.some(a => a.id === "skill.sandguard" && a.active))).toBe(true);
  await expect(page.locator("[data-hud-bite]")).toContainText("Sandguard");
  await page.keyboard.down("ArrowUp");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().worm.head.position.y ?? 0), { timeout: 10_000 }).toBeLessThan(-450);
  await page.keyboard.up("ArrowUp");
  await page.screenshot({ path: "docs/verification/survival-high-breach.png" });
});

test("touch Skill is independent from steering and Burst on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.addInitScript(() => Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }));
  await startRampage(page);
  const skill = page.locator('[data-touch-control="primary"]');
  await expect(skill).toHaveText("Sandguard");
  await skill.dispatchEvent("pointerdown", { pointerId: 20, pointerType: "touch" });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().abilities.some(a => a.id === "skill.sandguard" && a.active))).toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const tick = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick)).toBe(tick);
});
