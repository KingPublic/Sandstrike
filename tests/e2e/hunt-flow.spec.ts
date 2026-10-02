import { expect, test, type Page } from "@playwright/test";
async function startHunt(page: Page, fixtureId?: string) {
  await page.goto("./");
  await page.evaluate((fixture) => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 881, mode: "hunt", ...(fixture ? { fixtureId: fixture } : {}) }), fixtureId);
  await page.getByRole("button", { name: "Enter desert" }).click(); await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click(); await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
}
test("Hunt rifle victory, one record, retry and role switch", async ({ page }, info) => {
  const failures: string[] = []; page.on("pageerror", e => failures.push(e.message)); page.on("console", e => { if (e.type() === "error") failures.push(e.text()); });
  await startHunt(page, "hunt-victory");
  await page.evaluate(() => { const api = window.__SANDSTRIKE_TEST__; if (!api) throw new Error("Missing test bridge"); const s = api.snapshot(); const off = { held: false, pressed: false, released: false }; api.enqueueActions([{ tick: s.tick + 1, moveX: 0, moveY: 0, aimX: 1, aimY: -.3, aimWorld: s.worm.head.position, primary: { held: true, pressed: true, released: false }, secondary: off, ability: off, boost: off, interact: off, pause: off, confirm: off, back: off }]); });
  await expect(page.getByText("Worm defeated - relay secured", { exact: true })).toBeVisible();
  await expect(page.locator("[data-run-result]")).toHaveCount(1); await expect(page.locator("[data-record-status]")).toContainText("New local record");
  const stored = await page.evaluate(() => localStorage.getItem("sandstrike.e2e.save.v1")); expect(stored).toContain('"bestVictory"');
  await page.screenshot({ path: info.outputPath("hunt-victory.png") });
  await page.getByRole("button", { name: "Retry" }).click(); await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Pause", exact: true }).click(); await page.getByRole("button", { name: "End run", exact: true }).click(); await page.getByRole("button", { name: "Confirm end run" }).click();
  await page.locator("[data-result-change]").click(); await page.getByRole("button", { name: "Choose Rampage" }).click(); await page.getByRole("button", { name: "Start Rampage" }).click();
  await expect(page.locator("[data-rampage-hud]")).toBeVisible(); expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt)).toBeUndefined();
  expect(failures).toEqual([]);
});
for (const [fixture, label] of [["hunter-defeat", "Ranger defeated"], ["relay-defeat", "Relay destroyed"]] as const) test(`${fixture} automatically ends at the shared combat boundary`, async ({ page }) => {
  await startHunt(page, fixture); await expect(page.getByText(label, { exact: true })).toBeVisible(); await expect(page.locator("[data-run-result]")).toHaveCount(1);
});
test("snare arms, reveals and permits an exposed hit", async ({ page }, info) => {
  await startHunt(page, "hunt-trap"); await page.keyboard.press("KeyQ");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.trapTriggers)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.tracking.exactTrace !== undefined)).toBe(true);
  await page.screenshot({ path: info.outputPath("hunt-trap.png") });
  await page.evaluate(() => { const api = window.__SANDSTRIKE_TEST__; if (!api) return; const s = api.snapshot(), off = { held: false, pressed: false, released: false }; api.enqueueActions(Array.from({ length: 90 }, (_, n) => ({ tick: s.tick + n + 1, moveX: 0, moveY: 0, aimX: 0, aimY: -1, aimWorld: { x: s.worm.head.position.x, y: -100 }, primary: { held: true, pressed: n === 0, released: false }, secondary: off, ability: off, boost: off, interact: off, pause: off, confirm: off, back: off }))); });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.shotsHit)).toBeGreaterThan(0);
});
