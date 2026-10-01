import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";
import type { PresentationMetrics } from "../../src/game/debug/PresentationMetrics";

for (const viewport of [{ width: 1440, height: 900 }, { width: 844, height: 390 }]) {
  test(`measured seeded encounter ${String(viewport.width)}x${String(viewport.height)}`, async ({ page, browser }, testInfo) => {
    await page.setViewportSize(viewport);
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    await startRampage(page, { seed: 811 });
    const initial = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.presentation());
    expect(initial).toHaveProperty("metrics");
    const measurement = await page.evaluate(async () => {
      const bridge = window.__SANDSTRIKE_TEST__;
      if (!bridge) throw new Error("Missing test bridge");
      const samples: PresentationMetrics[] = [];
      const start = performance.now();
      const memory = () => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null;
      const memoryBefore = memory();
      const firstTick = bridge.snapshot().tick;
      for (let tick = firstTick + 1; tick <= firstTick + 900; tick += 1) {
        const angle = -Math.PI / 4 + (tick - firstTick) * 0.003;
        const neutral = { held: false, pressed: false, released: false };
        bridge.enqueueActions([{ tick, moveX: Math.cos(angle), moveY: Math.sin(angle), aimX: 1, aimY: 0, primary: { ...neutral, held: tick % 60 < 6, pressed: tick % 60 === 0 }, boost: { ...neutral, pressed: tick % 240 === 0 }, secondary: neutral, ability: neutral, interact: neutral, pause: neutral, confirm: neutral, back: neutral }]);
      }
      while (performance.now() - start < 12_000) {
        await new Promise<void>((resolve) => { requestAnimationFrame(() => { resolve(); }); });
        const metrics = bridge.presentation().metrics;
        if (metrics) samples.push(metrics);
      }
      const sorted = (key: "frameMs" | "simulationMsPerTick") => samples.map((sample) => sample[key]).sort((a, b) => a - b);
      const frames = sorted("frameMs"); const simulation = sorted("simulationMsPerTick");
      const percentile = (values: number[], fraction: number) => values[Math.min(values.length - 1, Math.floor(values.length * fraction))] ?? 0;
      const max = (key: "actors" | "shapes" | "projectiles" | "particles" | "totalDroppedMs") => Math.max(0, ...samples.map((sample) => sample[key]));
      const snapshot = bridge.snapshot();
      return { userAgent: navigator.userAgent, seed: snapshot.seed, elapsedMs: performance.now() - start, ticks: snapshot.tick - firstTick, samples: samples.length, frameMs: { median: percentile(frames, 0.5), p95: percentile(frames, 0.95), p99: percentile(frames, 0.99) }, simulationMsPerTick: { median: percentile(simulation, 0.5), p95: percentile(simulation, 0.95) }, slowFramesOver33ms: frames.filter((value) => value > 33.34).length, maxActors: max("actors"), maxShapes: max("shapes"), maxProjectiles: max("projectiles"), maxParticles: max("particles"), totalDroppedMs: max("totalDroppedMs"), memoryBefore, memoryAfter: memory(), score: snapshot.score.points, health: snapshot.actors.find((actor) => actor.id === "worm")?.health, eventOverflows: snapshot.diagnostics.eventOverflowCount };
    });
    expect(measurement.ticks).toBeGreaterThan(600);
    expect(measurement.eventOverflows).toBe(0);
    expect(measurement.maxParticles).toBeLessThanOrEqual(48);
    expect(failures).toEqual([]);
    const evidence = { browser: browser.version(), build: "optimized E2E build", viewport, ...measurement, failures };
    console.log(`PERFORMANCE ${JSON.stringify(evidence)}`);
    await testInfo.attach("encounter-performance", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
  });
}
