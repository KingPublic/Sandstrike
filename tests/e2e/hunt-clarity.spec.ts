import { expect, test, type Page } from "@playwright/test";

async function startAscent(page: Page): Promise<void> {
  await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
}

test("allied soldiers spawn beside the Hunter and shots follow the aim", async ({ page }) => {
  test.setTimeout(60_000);
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await startAscent(page);

  // Ground soldiers must exist and stay on camera with the player, not drift away.
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.allies.some(a => a.kind === "ally.ground") ?? false), { timeout: 20_000 }).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SANDSTRIKE_TEST__?.snapshot();
    const hunter = s?.hunt?.hunter.position;
    const soldiers = s?.hunt?.allies.filter(a => a.kind === "ally.ground") ?? [];
    if (!hunter || soldiers.length === 0) return false;
    return soldiers.every(a => Math.abs(a.position.x - hunter.x) < 460 && Math.abs(a.position.y - hunter.y) < 320);
  }), { timeout: 25_000, intervals: [250] }).toBe(true);
  await page.screenshot({ path: "docs/verification/hunt-squad.png" });

  // Fire at the worm's bearing: the stored pose aim must match the actual shot path.
  await page.evaluate(() => {
    const api = window.__SANDSTRIKE_TEST__;
    if (!api) throw new Error("Missing test bridge");
    const s = api.snapshot(), off = { held: false, pressed: false, released: false };
    api.enqueueActions(Array.from({ length: 120 }, (_, index) => ({
      tick: s.tick + index + 1, moveX: 0, moveY: 0, aimX: 0, aimY: 0,
      aimWorld: { x: s.worm.head.position.x, y: s.worm.head.position.y },
      primary: { held: index < 20, pressed: index === 0, released: false },
      secondary: off, ability: off, boost: off, jump: off, drop: off, interact: off, pause: off, confirm: off, back: off,
    })));
  });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.shotsFired ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
  const geometry = await page.evaluate(() => {
    const s = window.__SANDSTRIKE_TEST__?.snapshot();
    const shot = s?.hunt?.shot, aim = s?.hunt?.aim, hunter = s?.hunt?.hunter.position;
    if (!shot || !aim || !hunter) return undefined;
    const dx = shot.to.x - hunter.x, dy = shot.to.y - hunter.y, length = Math.hypot(dx, dy) || 1;
    return { dot: (dx / length) * aim.x + (dy / length) * aim.y };
  });
  expect(geometry?.dot).toBeGreaterThan(0.96);
  expect(failures).toEqual([]);
});
