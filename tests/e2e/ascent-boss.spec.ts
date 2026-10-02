import { expect, test, type Page } from "@playwright/test";

async function startBoss(page: Page): Promise<void> {
  await page.goto("./");
  await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 4711, mode: "hunt", fixtureId: "ascent-boss" }));
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
}

test("summit boss stage blocks rockets, restocks the crate and stays finite", async ({ page }) => {
  test.setTimeout(60_000);
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await startBoss(page);

  await expect(page.locator('[data-hunt-field="boss"]')).toContainText("Boss 600 / 600");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.rpg.owned ?? false), { timeout: 15_000 }).toBe(true);
  await expect(page.locator('[data-hunt-field="rpg"]')).toContainText("RPG 2 / 2");

  await page.evaluate(() => {
    const api = window.__SANDSTRIKE_TEST__;
    if (!api) throw new Error("Missing test bridge");
    const snapshot = api.snapshot(), off = { held: false, pressed: false, released: false };
    api.enqueueActions(Array.from({ length: 300 }, (_, index) => ({
      tick: snapshot.tick + index + 1, moveX: 0, moveY: 0, aimX: 0, aimY: 0,
      aimWorld: { x: snapshot.worm.head.position.x, y: snapshot.worm.head.position.y },
      primary: { held: true, pressed: false, released: false },
      secondary: off, ability: off, boost: off, jump: off, drop: off, interact: off, pause: off, confirm: off, back: off,
    })));
  });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.rpg.rockets ?? 2), { timeout: 20_000 }).toBeLessThan(2);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.rpg.rockets ?? 0), { timeout: 20_000 }).toBe(2);
  await page.screenshot({ path: "docs/verification/survival-boss.png" });

  const staged = await page.evaluate(() => {
    const snapshot = window.__SANDSTRIKE_TEST__?.snapshot();
    return { stage: snapshot?.hunt?.boss.stage, frozen: snapshot?.world?.frozen, surfaceY: snapshot?.world?.surfaceY, tick: snapshot?.tick };
  });
  expect(staged.stage).toBe("boss");
  expect(staged.frozen).toBe(true);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().world?.surfaceY)).toBe(staged.surfaceY);
  expect(failures).toEqual([]);
});
