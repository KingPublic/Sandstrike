import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";

test("quick Space activates Sandguard while a held upward steer keeps a building-height arc", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await startRampage(page);
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().abilities.some(a => a.id === "skill.sandguard" && a.active))).toBe(true);
  await expect(page.locator("[data-hud-bite]")).toContainText("Sandguard");
  await page.keyboard.down("ArrowUp");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().worm.head.position.y ?? 0), { timeout: 10_000, intervals: [50] }).toBeLessThan(-65);
  await page.screenshot({ path: "docs/verification/survival-building-breach.png" });
  const arc = await page.evaluate(() => new Promise<{ peak: number; fell: boolean; returned: boolean }>(resolve => {
    const started = performance.now(); let peak = 0, fell = false, returned = false;
    const sample = () => {
      const worm = window.__SANDSTRIKE_TEST__?.snapshot().worm;
      if (worm) { peak = Math.min(peak, worm.head.position.y); fell ||= worm.head.position.y < 0 && worm.head.velocity.y > 0; returned ||= worm.phase === "reentering"; }
      if (performance.now() - started >= 2200) resolve({ peak, fell, returned });
      else requestAnimationFrame(sample);
    };
    sample();
  }));
  expect(arc.peak).toBeGreaterThan(-210);
  expect(arc.fell).toBe(true);
  expect(arc.returned).toBe(true);
  await page.keyboard.up("ArrowUp");
  expect(errors).toEqual([]);
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
