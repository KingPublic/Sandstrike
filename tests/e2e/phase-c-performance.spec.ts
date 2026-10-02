import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { startRampage } from "./helpers";
async function measure(page: Page) {
  return page.evaluate(async () => {
    const samples: { frameMs: number; simulationMs: number; actors: number; projectiles: number; particles: number; droppedMs: number }[] = [];
    const started = performance.now(); const initialTick = window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0;
    await new Promise<void>(resolve => {
      const collect = () => { const m = window.__SANDSTRIKE_TEST__?.presentation().metrics; if (m) samples.push({ frameMs: m.frameMs, simulationMs: m.simulationMsPerTick, actors: m.actors, projectiles: m.projectiles, particles: m.particles, droppedMs: m.totalDroppedMs }); if (performance.now() - started >= 6000) resolve(); else requestAnimationFrame(collect); }; requestAnimationFrame(collect);
    });
    const values = samples.map(s => s.frameMs).sort((a, b) => a - b);
    const percentile = (p: number) => values[Math.min(values.length - 1, Math.floor(values.length * p))] ?? 0;
    return { initialTick, finalTick: window.__SANDSTRIKE_TEST__?.snapshot().tick, samples: samples.length, frameMedian: percentile(.5), frameP95: percentile(.95), frameP99: percentile(.99), maxActors: Math.max(...samples.map(s => s.actors)), maxProjectiles: Math.max(...samples.map(s => s.projectiles)), maxParticles: Math.max(...samples.map(s => s.particles)), maxDroppedMs: Math.max(...samples.map(s => s.droppedMs)), simulationP95: samples.map(s => s.simulationMs).sort((a, b) => a - b)[Math.floor(samples.length * .95)] ?? 0 };
  });
}
test("records host-only Hunt and full-band Rampage performance", async ({ page }, info) => {
  const failures: string[] = []; page.on("pageerror", e => failures.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click(); await page.getByRole("button", { name: "Play", exact: true }).click(); await page.getByRole("button", { name: "Choose Hunt" }).click(); await page.getByRole("button", { name: "Start Hunt" }).click(); await expect(page.getByRole("status")).toContainText("Hunt ready");
  const hunt = await measure(page); await page.screenshot({ path: info.outputPath("natural-hunt-performance.png") });
  await startRampage(page, { seed: 889, fixtureId: "rampage-band-3" });
  await page.keyboard.down("ArrowUp"); await page.keyboard.press("Shift"); await page.keyboard.up("ArrowUp");
  const rampage = await measure(page); await page.screenshot({ path: info.outputPath("advanced-performance.png") });
  expect(failures).toEqual([]); expect(hunt.samples).toBeGreaterThan(50); expect(rampage.samples).toBeGreaterThan(50); expect(rampage.maxProjectiles).toBeLessThanOrEqual(24); expect(rampage.maxParticles).toBeLessThanOrEqual(48);
  writeFileSync("docs/PHASE_C_PERFORMANCE.json", JSON.stringify({ date: "2026-10-02", environment: "Headless Chromium on this development host; 1440x900 CSS viewport; not physical hardware evidence", hunt, rampage }, null, 2));
});
