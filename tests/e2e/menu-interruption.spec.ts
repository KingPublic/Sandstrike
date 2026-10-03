import { expect, test } from "@playwright/test";

test("title and menu interruptions never expose gameplay pause controls", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("./");
  for (const stage of ["title", "menu", "results"]) {
    if (stage === "menu") await page.getByRole("button", { name: "Enter desert" }).click();
    if (stage === "results") {
      await page.evaluate(() => window.__SANDSTRIKE_TEST__?.configureNextRun({ seed: 4, fixtureId: "rampage-defeat" }));
      await page.getByRole("button", { name: "Play", exact: true }).click();
      await page.getByRole("button", { name: "Choose Rampage" }).click();
      await page.getByRole("button", { name: "Start Rampage" }).click();
      await expect(page.locator("[data-run-result]")).toBeVisible();
    }
    await page.evaluate(() => {
      window.dispatchEvent(new Event("blur"));
      Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
      document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("focus"));
    });
    await expect(page.getByRole("button", { name: "End run", exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Resume run", exact: true })).toBeHidden();
  }
  expect(failures).toEqual([]);
});
