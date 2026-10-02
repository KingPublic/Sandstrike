import { expect, test } from "@playwright/test";

test("desktop menus fit the viewport without page scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("./");
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(2);
  await page.getByRole("button", { name: "Enter desert" }).click();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(2);
});
test("all three environments start through real menus", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  for (const themeId of ["desert", "ruins", "frozen"] as const) {
    await page.goto("./");
    await page.getByRole("button", { name: "Enter desert" }).click();
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.getByRole("button", { name: "Choose Rampage" }).click();
    await page.getByRole("combobox", { name: "Environment" }).selectOption(themeId);
    await page.getByRole("button", { name: "Start Rampage" }).click();
    await expect(page.getByRole("status")).toContainText("Rampage ready");
    expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().themeId)).toBe(themeId);
    await page.screenshot({ path: `docs/verification/survival-${themeId}.png` });
  }
  expect(errors).toEqual([]);
});

test("short and phone menus keep actions accessible inside the panel", async ({ page }) => {
  for (const size of [{ width: 720, height: 450 }, { width: 844, height: 390 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await page.goto("./");
    await page.getByRole("button", { name: "Enter desert" }).click();
    await page.getByRole("button", { name: "How to Play", exact: true }).click();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.getByRole("button", { name: "Choose Rampage" }).click();
    await expect(page.getByRole("button", { name: "Start Rampage" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `docs/verification/survival-menu-${String(size.width)}.png` });
  }
});
