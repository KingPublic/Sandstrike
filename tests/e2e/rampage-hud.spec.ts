import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";

test.use({ hasTouch: true });
for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 915, height: 412 }, { width: 844, height: 390 }]) {
  test(`readable Rampage HUD at ${String(viewport.width)}x${String(viewport.height)}`, async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    page.on("requestfailed", (request) => failures.push(request.url()));
    await page.setViewportSize(viewport);
    await startRampage(page, { seed: 91, fixtureId: "combat-breach" });
    await expect(page.locator("[data-rampage-hud]")).toBeVisible();
    expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().seed)).toBe(91);
    await page.waitForFunction(() => (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) >= 10);
    const canvas = await page.locator("canvas").boundingBox();
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBeCloseTo(Math.min(viewport.width, viewport.height * 16 / 9), 0);
    await expect(page.locator("[data-hud-health]")).toContainText("100");
    const healthGauge = await page.locator('[data-hud-gauge="health"]').boundingBox();
    expect(healthGauge).not.toBeNull();
    expect(healthGauge?.width ?? 0).toBeGreaterThan(0);
    expect(await page.locator('[data-hud-gauge="health"]').evaluate((element) => (element as HTMLElement).style.getPropertyValue("--fill"))).not.toBe("");
    await page.waitForFunction(() => (window.__SANDSTRIKE_TEST__?.snapshot().actors.length ?? 0) > 1);
    await page.waitForFunction(() => (window.__SANDSTRIKE_TEST__?.presentation().actorIds.length ?? 0) > 0);
    const presentation = await page.evaluate(() => ({ ids: window.__SANDSTRIKE_TEST__?.presentation().actorIds ?? [], expected: window.__SANDSTRIKE_TEST__?.snapshot().actors.filter((a) => a.id !== "worm").map((a) => a.id).sort() }));
    expect(presentation.ids).toEqual(presentation.expected);
    expect(new Set(presentation.ids).size).toBe(presentation.ids.length);
    const boxes = await page.locator("[data-hud-health], [data-hud-score], [data-hud-combo], [data-hud-threat], [data-hud-pause]").evaluateAll((elements) => elements.map((element) => { const b = element.getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom }; }));
    for (const box of boxes) { expect(box.x).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(viewport.width); expect(box.bottom).toBeLessThanOrEqual(viewport.height); }
    for (const [index, a] of boxes.entries()) for (const b of boxes.slice(index + 1)) expect(a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y).toBe(false);
    await page.screenshot({ path: `test-results/rampage-${String(viewport.width)}.png` });
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const frozen = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot());
    await page.getByLabel("Reduced motion", { exact: true }).check();
    await page.getByLabel("Screen shake").fill("0");
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot())).toEqual(frozen);
    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(page.getByRole("button", { name: "Resume run" })).toBeVisible();
    expect(failures).toEqual([]);
  });
}
