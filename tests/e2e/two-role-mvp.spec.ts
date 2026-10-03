import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";
test("advanced Rampage pressure then Hunt has fresh actors and records", async ({ page }, info) => {
  const failures: string[] = []; page.on("pageerror", e => failures.push(e.message)); page.on("console", e => { if (e.type() === "error") failures.push(e.text()); });
  await startRampage(page, { seed: 882, fixtureId: "rampage-band-3" });
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().threat.band)).toBe(3);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().actors.some(a => a.tags.includes("vehicle")))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().actors.some(a => a.tags.includes("aerial")))).toBe(true);
  await page.screenshot({ path: info.outputPath("advanced-rampage.png") });
  await page.getByRole("button", { name: "Pause", exact: true }).click(); const paused = await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot()); await page.waitForTimeout(100); expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot())).toEqual(paused);
  await page.getByRole("button", { name: "End run", exact: true }).click(); await page.getByRole("button", { name: "Confirm end run" }).click(); await expect(page.locator("[data-run-result]")).toHaveCount(1);
  await page.locator("[data-result-change]").click(); await page.getByRole("button", { name: "Choose Hunt" }).click(); await page.getByRole("button", { name: "Start Hunt" }).click(); await expect(page.getByRole("status")).toContainText("Hunt ready");
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().actors.map(a => a.id))).toEqual(["hunter", "relay", "worm"]);
  await page.keyboard.down("KeyQ"); await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.snare.phase)).toBe("arming"); await page.keyboard.up("KeyQ");
  await page.screenshot({ path: info.outputPath("natural-hunt.png") });
  await page.getByRole("button", { name: "Pause", exact: true }).click(); await page.getByRole("button", { name: "End run", exact: true }).click(); await page.getByRole("button", { name: "Confirm end run" }).click();
  await page.reload(); expect(await page.evaluate(() => localStorage.getItem("sandstrike.e2e.save.v1"))).toContain('"huntSeen":true'); expect(failures).toEqual([]);
});
