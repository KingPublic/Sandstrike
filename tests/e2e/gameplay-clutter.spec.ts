import { expect, test } from "@playwright/test";

for (const debug of [false, true]) {
  test(`Hunter technical overlays require explicit debug: ${String(debug)}`, async ({ page }) => {
    const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("./");
    await page.evaluate(debugAI => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 33, mode: "hunt", debugAI }), debug);
    await page.getByRole("button", { name: "Enter desert" }).click();
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.getByRole("button", { name: "Choose Hunt" }).click();
    await page.getByRole("button", { name: "Start Hunt" }).click();
    await expect(page.locator("canvas")).toBeFocused();
    for (const field of ["height", "tracking", "worm", "support"]) {
      if (debug) await expect(page.locator(`[data-hunt-field="${field}"]`)).toBeVisible();
      else await expect(page.locator(`[data-hunt-field="${field}"]`)).toBeHidden();
    }
    if (!debug) {
      await expect(page.locator(".context-prompt")).toHaveCount(0);
      await expect(page.locator('[data-hunt-field="boss"]')).toHaveText("Reach the rooftop");
      await page.screenshot({ path: "docs/verification/survival-hunt-clean.png" });
    }
    expect(errors).toEqual([]);
  });
}
