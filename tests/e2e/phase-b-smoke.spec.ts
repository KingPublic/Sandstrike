import { expect, test } from "@playwright/test";
import { startRampage, openRampagePreview } from "./helpers";

test("combined combat, warning, protected pause, record reload and retry", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  page.on("requestfailed", (request) => failures.push(request.url()));
  await startRampage(page, { seed: 901, fixtureId: "phase-b-smoke" });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().score.infantryDestroyed)).toBe(4);
  await expect(page.locator("[data-hud-threat]")).toContainText("Incoming");
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().threat.band)).toBe(1);
  await page.keyboard.down("ArrowUp"); await page.keyboard.press("Space"); await page.keyboard.press("Shift"); await page.keyboard.up("ArrowUp");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const before = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot());
  expect(before?.score.preyConsumed).toBe(3); expect(before?.score.infantryDestroyed).toBe(4);
  expect(before?.actors.find((actor) => actor.id === "worm")?.health).toBe(44);
  await page.waitForTimeout(100); expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot())).toEqual(before);
  await page.getByRole("button", { name: "Resume run" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run", exact: true }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await expect(page.locator("[data-run-result]")).toHaveCount(1);
  await expect(page.locator("[data-record-status]")).toContainText("New local record");
  const stored = await page.evaluate(() => localStorage.getItem("sandstrike.e2e.save.v1"));
  expect(stored).not.toBeNull();
  await page.reload();
  await startRampage(page, { seed: 902, fixtureId: "phase-b-smoke" });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().score.infantryDestroyed)).toBe(4);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run", exact: true }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await expect(page.locator("[data-record-status]")).toContainText("Local best");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(failures).toEqual([]);
});

test("lethal damage reaches one Results view without a manual exit", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 903, fixtureId: "rampage-defeat" }));
  await openRampagePreview(page); await page.getByRole("button", { name: "Start classic arena" }).click();
  await expect(page.getByText("Worm defeated", { exact: true })).toBeVisible();
  await expect(page.locator("[data-run-result]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Retry" })).toBeFocused();
});
