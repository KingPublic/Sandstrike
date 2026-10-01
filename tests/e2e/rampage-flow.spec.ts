import { expect, test } from "@playwright/test";

test("real menu, protected pause, Results, retry and main menu", async ({ page }) => {
  await page.addInitScript({ content: `(() => { const active = new Set(); const add = window.addEventListener.bind(window); const remove = window.removeEventListener.bind(window); window.addEventListener = function(type, listener, options) { if (type === 'keydown') active.add(listener); return add(type, listener, options); }; window.removeEventListener = function(type, listener, options) { if (type === 'keydown') active.delete(listener); return remove(type, listener, options); }; window.__KEYBOARD_COUNT__ = () => active.size; })();` });
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto("./");
  await page.waitForFunction(() => window.__SANDSTRIKE_TEST__ !== undefined);
  await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 91, fixtureId: "rampage-short" }));
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "How to Play" }).click();
  await expect(page.getByRole("heading", { name: "How to Play" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Credits", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Credits", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Rampage" }).click();
  await page.getByRole("button", { name: "Start Rampage" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("canvas")).toBeFocused();
  const keyboardCount = await page.evaluate(() => (window as unknown as Window & { __KEYBOARD_COUNT__: () => number }).__KEYBOARD_COUNT__());
  const beforeRejectedSetup = await page.evaluate(() => {
    const seed = window.__SANDSTRIKE_TEST__?.snapshot().seed;
    try { window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 100 }); return false; }
    catch { return window.__SANDSTRIKE_TEST__?.snapshot().seed === seed; }
  });
  expect(beforeRejectedSetup).toBe(true);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Run paused" })).toBeVisible();
  await page.getByRole("button", { name: "Resume run" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot());
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot())).toEqual(paused);
  await page.getByRole("button", { name: "Resume run" }).click();
  await expect(page.locator("canvas")).toBeFocused();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run" }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await expect(page.getByRole("heading", { name: "Run complete" })).toBeVisible();
  await expect(page.locator("[data-run-result]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Retry" })).toBeFocused();
  const first = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().sessionId);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().sessionId)).not.toBe(first);
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __KEYBOARD_COUNT__: () => number }).__KEYBOARD_COUNT__())).toBe(keyboardCount);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run" }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeFocused();
  expect(failures).toEqual([]);
});
