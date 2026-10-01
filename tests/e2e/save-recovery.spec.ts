import { expect, test } from "@playwright/test";
import { startRampage } from "./helpers";
import valid from "../fixtures/save/v1-valid.json" with { type: "json" };

for (const state of ["empty", "valid", "backup", "corrupt", "future", "throwing"] as const) {
  test(`storage ${state} remains playable and settings operable`, async ({ page }) => {
    const failures: string[] = []; page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    page.on("requestfailed", (request) => failures.push(request.url()));
    await page.addInitScript(({ kind, raw }) => {
      if (kind === "throwing") { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError"); } }); return; }
      localStorage.clear();
      if (kind === "corrupt") localStorage.setItem("sandstrike.e2e.save.v1", "{broken");
      if (kind === "valid") localStorage.setItem("sandstrike.e2e.save.v1", raw);
      if (kind === "backup") { localStorage.setItem("sandstrike.e2e.save.v1", "{broken"); localStorage.setItem("sandstrike.e2e.save.v1.backup", raw); }
      if (kind === "future") localStorage.setItem("sandstrike.e2e.save.v1", '{"schemaVersion":99}');
    }, { kind: state, raw: JSON.stringify(valid) });
    await startRampage(page, { seed: 12 });
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    if (state === "valid" || state === "backup") await expect(page.getByLabel("Reduced motion", { exact: true })).toBeChecked();
    await page.getByLabel("Reduced motion", { exact: true }).check();
    await page.getByRole("button", { name: "Reset saved data" }).click();
    await expect(page.getByRole("button", { name: "Confirm reset" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel reset" }).click();
    await expect(page.getByLabel("Reduced motion", { exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Close settings" }).click();
    await page.getByRole("button", { name: "Resume run" }).click();
    await expect(page.locator("canvas")).toBeFocused(); expect(failures).toEqual([]);
  });
}
test("settings survive reload and reset needs explicit confirmation", async ({ page }) => {
  await startRampage(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Reduced motion", { exact: true }).check();
  await page.reload();
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Reduced motion", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Reset saved data" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  await expect(page.getByLabel("Reduced motion", { exact: true })).not.toBeChecked();
});
