import { expect, test } from "@playwright/test";

test("natural Hunt breach follows its visible warning sector", async ({ page }) => {
  test.setTimeout(60_000);
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 376940, mode: "hunt" }));
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.tracking.breachBracket !== undefined), { timeout: 30_000 }).toBe(true);
  await page.screenshot({ path: "docs/verification/phase-c-warning.png" });
  const crossing = await page.evaluate(async () => {
    return new Promise<{ tick: number; x: number; bracket?: { left: number; right: number; warningTick: number } }>(resolve => {
      const observe = () => {
        const frame = window.__SANDSTRIKE_TEST__?.snapshot();
        if (frame && frame.worm.head.position.y <= 0) {
          const bracket = frame.hunt?.tracking.breachBracket;
          resolve({ tick: frame.tick, x: frame.worm.head.position.x, ...(bracket ? { bracket } : {}) });
        } else requestAnimationFrame(observe);
      };
      requestAnimationFrame(observe);
    });
  });
  expect(crossing.bracket).toBeDefined();
  expect(crossing.tick - (crossing.bracket?.warningTick ?? crossing.tick)).toBeGreaterThanOrEqual(60);
  expect(crossing.x).toBeGreaterThanOrEqual(crossing.bracket?.left ?? Infinity);
  expect(crossing.x).toBeLessThanOrEqual(crossing.bracket?.right ?? -Infinity);
  await page.screenshot({ path: "docs/verification/phase-c-breach.png" });
  expect(failures).toEqual([]);
});
