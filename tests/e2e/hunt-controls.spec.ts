import { expect, test } from "@playwright/test";
for (const viewport of [{ width: 1440, height: 900 }, { width: 915, height: 412 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) test(`Hunt controls and pause at ${String(viewport.width)}x${String(viewport.height)}`, async ({ page }, info) => {
  await page.setViewportSize(viewport); await page.addInitScript(() => Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }));
  await page.goto("./"); await page.getByRole("button", { name: "Enter desert" }).click(); await page.getByRole("button", { name: "Play", exact: true }).click(); await page.getByRole("button", { name: "Choose Hunt" }).click(); await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.locator("[data-hunt-hud]")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
  await expect(page.locator("canvas")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0)).toBeGreaterThan(10);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.allies.length ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window.__SANDSTRIKE_TEST__?.snapshot().hunt?.allies ?? []).length)).toBeLessThanOrEqual(3);
  const before = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.x ?? 0);
  await page.keyboard.down("KeyD"); await page.mouse.move(viewport.width * .6, viewport.height * .25); await page.mouse.down();
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.x ?? 0)).toBeGreaterThan(before + 12);
  await page.mouse.up(); await page.keyboard.up("KeyD");
  for (const name of ["primary", "boost", "ability"]) { const box = await page.locator(`[data-touch-control="${name}"]`).boundingBox(); expect(box?.width).toBeGreaterThanOrEqual(44); expect(box?.height).toBeGreaterThanOrEqual(44); }
  await page.locator('[data-touch-control="primary"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 8, clientX: viewport.width - 40, clientY: viewport.height - 80 });
  await page.locator('[data-touch-control="ability"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 9 });
  // The touch skill button must really fire the skill, and its readiness ring
  // must reflect the cooldown it just started.
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().skill?.ability.active ?? false)).toBe(true);
  await expect(page.locator('[data-touch-control="ability"]')).toHaveAttribute("data-ready", "false");
  await page.locator('[data-touch-control="boost"]').dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 10 });
  await expect(page.locator('[data-touch-control="boost"]')).toHaveAttribute("data-ready", "false");
  await page.getByRole("button", { name: "Pause", exact: true }).click(); const paused = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick);
  await page.waitForTimeout(100); expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick)).toBe(paused);
  await page.getByRole("button", { name: "Resume run" }).click(); await page.screenshot({ path: info.outputPath("hunt-controls.png") });
  await page.setViewportSize({ width: 390, height: 844 }); await expect(page.getByRole("heading", { name: "Rotate to landscape" })).toBeVisible();
});

test("the Scout grapple has a working touch button on a phone", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 915, height: 412 });
  await page.addInitScript(() => Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }));
  await page.goto("./"); await page.getByRole("button", { name: "Enter desert" }).click(); await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("combobox", { name: "Character", exact: true }).selectOption("scout");
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
  const ability = page.locator('[data-touch-control="ability"]');
  await expect(ability).toBeVisible();
  await expect(ability).toHaveText("Grapple");
  await ability.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 21 });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().skill?.ability.active ?? false)).toBe(true);
  await expect(ability).toHaveAttribute("data-ready", "false");
  await ability.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 21 });
  expect(errors).toEqual([]);
});
