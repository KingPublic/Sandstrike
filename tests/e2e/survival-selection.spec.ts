import { expect, test } from "@playwright/test";
import { characters } from "../../src/game/data/characters";

test("all ten kits are selectable with their own active skill and original identity", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  for (const character of characters) {
    await page.goto("./");
    await page.getByRole("button", { name: "Enter desert" }).click();
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.getByRole("button", { name: character.role === "worm" ? "Choose Rampage" : "Choose Hunt" }).click();
    await page.getByRole("combobox", { name: "Character", exact: true }).selectOption(character.id);
    await page.getByRole("combobox", { name: "Environment" }).selectOption(character.role === "worm" ? "ruins" : "frozen");
    await expect(page.locator("[data-character-description]")).toContainText(character.skill.name);
    await page.getByRole("button", { name: character.role === "worm" ? "Start Rampage" : "Start Hunt" }).click();
    await expect(page.locator("canvas")).toBeFocused();
    expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().characterId)).toBe(character.id);
    await page.keyboard.press(character.role === "worm" ? "Space" : "KeyQ");
    await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().abilities[0]?.active), { intervals: [30] }).toBe(true);
    await page.screenshot({ path: `docs/verification/character-${character.id}.png` });
  }
  expect(errors).toEqual([]);
});

test("chosen character and theme survive retry and page reload", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Rampage" }).click();
  await page.getByRole("combobox", { name: "Character", exact: true }).selectOption("rift-spitter");
  await page.getByRole("combobox", { name: "Environment" }).selectOption("frozen");
  await page.getByRole("button", { name: "Start Rampage" }).click();
  await expect(page.locator("canvas")).toBeFocused();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "End run", exact: true }).click();
  await page.getByRole("button", { name: "Confirm end run" }).click();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator("canvas")).toBeFocused();
  expect(await page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().characterId)).toBe("rift-spitter");
  await page.reload();
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Rampage" }).click();
  await expect(page.getByRole("combobox", { name: "Character", exact: true })).toHaveValue("rift-spitter");
  await expect(page.getByRole("combobox", { name: "Environment" })).toHaveValue("frozen");
});
