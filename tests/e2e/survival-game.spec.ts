import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";

async function choose(page: Page, mode: "Rampage" | "Hunt", id: string): Promise<void> {
  await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: `Choose ${mode}` }).click();
  await page.getByRole("combobox", { name: "Character", exact: true }).selectOption(id);
  await page.getByRole("button", { name: `Start ${mode}` }).click();
  await expect(page.locator("canvas")).toBeFocused();
}

test("revised results retain ownership and a role switch clears skill entities", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await choose(page, "Rampage", "cinder-wyrm");
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().skill?.projectiles.length ?? 0)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run", exact: true }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sandstrike.e2e.save.v1") ?? "{}") as { schemaVersion?: number; selection?: { wormId?: string } });
  expect(saved.schemaVersion).toBe(3); expect(saved.selection?.wormId).toBe("cinder-wyrm");
  await page.locator("[data-result-change]").click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("combobox", { name: "Character", exact: true }).selectOption("engineer");
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.locator("canvas")).toBeFocused();
  const fresh = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot());
  expect(fresh?.characterId).toBe("engineer");
  expect(fresh?.skill?.projectiles).toEqual([]);
  expect(fresh?.skill?.decoy).toBeUndefined();
  expect(fresh?.actors.some(a => a.tags.includes("vehicle"))).toBe(false);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 844, height: 390 }, { width: 1024, height: 768 }]) {
  test(`Hunter skill, jump and interruption at ${String(viewport.width)}x${String(viewport.height)}`, async ({ page }, info) => {
    const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
    await page.setViewportSize(viewport);
    await page.addInitScript(() => Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }));
    await choose(page, "Hunt", "siegebreaker");
    await expect(page.locator('[data-hunt-field="boss"]')).toHaveText("Reach the rooftop");
    await page.locator('[data-touch-control="ability"]').dispatchEvent("pointerdown", { pointerId: 11, pointerType: "touch" });
    await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().skill?.ability.active)).toBe(true);
    const before = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.y ?? 0);
    await page.locator('[data-touch-control="jump"]').dispatchEvent("pointerdown", { pointerId: 12, pointerType: "touch" });
    await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.position.y ?? 0)).toBeLessThan(before - 12);
    for (const name of ["primary", "ability", "jump", "boost"]) {
      const box = await page.locator(`[data-touch-control="${name}"]`).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44); expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.project.name.includes("pages") ? info.outputPath("hunter.png") : `docs/verification/survival-hunt-${String(viewport.width)}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("heading", { name: "Rotate to landscape" })).toBeVisible();
    const paused = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick)).toBe(paused);
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Resume run" }).click();
    await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0)).toBeGreaterThan(paused ?? 0);
    expect(errors).toEqual([]);
  });
}

test("records bounded host performance for the summit with allied support", async ({ page }, info) => {
  await page.goto("./");
  await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 4711, mode: "hunt", fixtureId: "ascent-boss", characterId: "ranger" }));
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.locator('[data-hunt-field="boss"]')).toContainText("Boss 3600 / 3600");
  const result = await page.evaluate(async () => {
    const samples: { frame: number; simulation: number; actors: number; particles: number; projectiles: number }[] = [];
    const started = performance.now();
    await new Promise<void>(resolve => {
      const collect = () => {
        const m = window.__SANDSTRIKE_TEST__?.presentation().metrics;
        if (m) samples.push({ frame: m.frameMs, simulation: m.simulationMsPerTick, actors: m.actors, particles: m.particles, projectiles: m.projectiles });
        if (performance.now() - started >= 5000) resolve(); else requestAnimationFrame(collect);
      }; requestAnimationFrame(collect);
    });
    const values = samples.map(s => s.frame).sort((a, b) => a - b);
    return { samples: samples.length, frameMedian: values[Math.floor(values.length * .5)], frameP95: values[Math.floor(values.length * .95)], simulationMax: Math.max(...samples.map(s => s.simulation)), maxActors: Math.max(...samples.map(s => s.actors)), maxParticles: Math.max(...samples.map(s => s.particles)), maxProjectiles: Math.max(...samples.map(s => s.projectiles)), allies: window.__SANDSTRIKE_TEST__?.snapshot().hunt?.allies.length };
  });
  expect(result.samples).toBeGreaterThan(50);
  expect(result.maxParticles).toBeLessThanOrEqual(48);
  expect(result.maxProjectiles).toBeLessThanOrEqual(24);
  expect(result.allies).toBeGreaterThan(0);
  if (!info.project.name.includes("pages")) writeFileSync("docs/SURVIVAL_PERFORMANCE.json", JSON.stringify({ date: "2026-10-02", environment: "Headless Chromium host sample; not physical device evidence", boss: result }, null, 2));
});
