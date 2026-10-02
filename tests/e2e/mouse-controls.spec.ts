import { expect, test, type Page } from "@playwright/test";
import { startRampage } from "./helpers";

/** Helicopters patrol 220px above the surface in Rampage. */
const HELICOPTER_ALTITUDE = 220;

async function startHunt(page: Page): Promise<void> {
  await page.goto("./");
  await page.getByRole("button", { name: "Enter desert" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Choose Hunt" }).click();
  await page.getByRole("button", { name: "Start Hunt" }).click();
  await expect(page.getByRole("status")).toContainText("Hunt ready");
}

function samplePeak(page: Page, milliseconds: number): Promise<number> {
  return page.evaluate(
    (duration) =>
      new Promise<number>((resolve) => {
        let peak = 0;
        const started = performance.now();
        const sample = (): void => {
          const worm = window.__SANDSTRIKE_TEST__?.snapshot().worm;
          if (worm) {
            peak = Math.min(peak, worm.head.position.y);
          }
          if (performance.now() - started >= duration) {
            resolve(peak);
          } else {
            requestAnimationFrame(sample);
          }
        };
        sample();
      }),
    milliseconds,
  );
}

test("right click bursts the worm in Rampage", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await startRampage(page);
  await expressRampage(page, "mouse");
  expect(errors).toEqual([]);
});

test("right click dodges in Hunt", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await startHunt(page);
  await expect.poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0), { timeout: 10_000 }).toBeGreaterThan(30);

  const before = await page.evaluate(() => {
    const s = window.__SANDSTRIKE_TEST__?.snapshot();
    return { tick: s?.tick ?? 0, dodgeReadyTick: s?.hunt?.hunter.dodgeReadyTick ?? 0 };
  });
  const canvas = await page.locator("canvas").boundingBox();
  if (!canvas) throw new Error("Canvas has no bounds.");
  await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2, { button: "right" });
  await expect
    .poll(() => page.evaluate(() => window.__SANDSTRIKE_TEST__?.snapshot().hunt?.hunter.dodgeReadyTick ?? 0), { timeout: 5_000, intervals: [30] })
    .toBeGreaterThan(before.dodgeReadyTick);
  expect(errors).toEqual([]);
});

async function expressRampage(page: Page, input: "mouse" | "keyboard"): Promise<void> {
  const sampling = samplePeak(page, 3000);
  await page.keyboard.down("ArrowUp");
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const worm = window.__SANDSTRIKE_TEST__?.snapshot().worm;
          return worm?.phase === "underground" && worm.head.position.y > -60 && worm.head.velocity.y < -200;
        }),
      { timeout: 10_000, intervals: [10] },
    )
    .toBe(true);
  if (input === "mouse") {
    const canvas = await page.locator("canvas").boundingBox();
    if (!canvas) throw new Error("Canvas has no bounds.");
    await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2, { button: "right" });
  } else {
    await page.keyboard.press("Shift");
  }
  const peak = await sampling;
  await page.keyboard.up("ArrowUp");
  expect(-peak).toBeGreaterThan(HELICOPTER_ALTITUDE + 20);
}
