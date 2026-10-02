import { expect, test } from "@playwright/test";
for (const viewport of [{ width: 1440, height: 900 }, { width: 915, height: 412 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) test(`Hunt controls and pause at ${String(viewport.width)}x${String(viewport.height)}`, async ({ page }, info) => {
  await page.setViewportSize(viewport); await page.addInitScript(() => Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }));
  await page.goto("./"); await page.getByRole("button", { name: "Enter desert" }).click(); await page.getByRole("button", { name: "Play", exact: true }).click(); await page.getByRole("button", { name: "Choose Hunt" }).click(); await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.locator("[data-hunt-hud]")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
  await expect(page.locator("canvas")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0)).toBeGreaterThan(10);
  const before = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.x ?? 0);
  await page.keyboard.down("KeyD"); await page.mouse.move(viewport.width * .6, viewport.height * .25); await page.mouse.down();
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.x ?? 0)).toBeGreaterThan(before + 12);
  await page.mouse.up(); await page.keyboard.up("KeyD");
  for (const name of ["primary", "boost", "ability"]) { const box = await page.locator(`[data-touch-control="${name}"]`).boundingBox(); expect(box?.width).toBeGreaterThanOrEqual(44); expect(box?.height).toBeGreaterThanOrEqual(44); }
  await page.locator('[data-touch-control="primary"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 8, clientX: viewport.width - 40, clientY: viewport.height - 80 });
  await page.locator('[data-touch-control="ability"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 9 });
  await page.locator('[data-touch-control="boost"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 10 });
  await page.getByRole("button", { name: "Pause", exact: true }).click(); const paused = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick);
  await page.waitForTimeout(100); expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick)).toBe(paused);
  await page.getByRole("button", { name: "Resume run" }).click(); await page.screenshot({ path: info.outputPath("hunt-controls.png") });
  await page.setViewportSize({ width: 390, height: 844 }); await expect(page.getByRole("heading", { name: "Rotate to landscape" })).toBeVisible();
});
