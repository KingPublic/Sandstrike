import { expect, test, type Page } from "@playwright/test";
import { startRampage } from "./helpers";

/** Helicopters patrol 220px above the surface in Rampage. */
const HELICOPTER_ALTITUDE = 220;

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

function waitForSurfaceApproach(page: Page): Promise<void> {
  return expect
    .poll(
      () =>
        page.evaluate(() => {
          const worm = window.__SANDSTRIKE_TEST__?.snapshot().worm;
          return (
            worm?.phase === "underground" &&
            worm.head.position.y > -60 &&
            worm.head.velocity.y < -200
          );
        }),
      { timeout: 10_000, intervals: [10] },
    )
    .toBe(true);
}

test("holding up and pressing Burst launches the worm past the helicopter altitude", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await startRampage(page);

  const sampling = samplePeak(page, 3000);
  await page.keyboard.down("ArrowUp");
  await waitForSurfaceApproach(page);
  await page.keyboard.press("Shift");
  const peak = await sampling;
  await page.keyboard.up("ArrowUp");

  expect(-peak).toBeGreaterThan(HELICOPTER_ALTITUDE + 20);
  expect(errors).toEqual([]);
});

test("a full-size touch Burst button leaps the worm on a phone viewport", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 915, height: 412 });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 3 }),
  );
  await startRampage(page);

  const joystick = page.locator('[data-touch-control="joystick"]');
  const boost = page.locator('[data-touch-control="boost"]');
  const primary = page.locator('[data-touch-control="primary"]');
  await expect(boost).toBeVisible();
  const boostBounds = await boost.boundingBox();
  const primaryBounds = await primary.boundingBox();
  expect(boostBounds).not.toBeNull();
  expect(primaryBounds).not.toBeNull();
  if (!boostBounds || !primaryBounds) {
    throw new Error("Touch controls have no layout bounds.");
  }
  expect(Math.abs(boostBounds.width - primaryBounds.width)).toBeLessThan(2);

  const joystickBounds = await joystick.boundingBox();
  if (!joystickBounds) {
    throw new Error("Joystick has no layout bounds.");
  }
  const centerX = joystickBounds.x + joystickBounds.width / 2;
  const centerY = joystickBounds.y + joystickBounds.height / 2;
  const sampling = samplePeak(page, 3000);
  await joystick.dispatchEvent("pointerdown", {
    bubbles: true,
    clientX: centerX,
    clientY: centerY,
    isPrimary: true,
    pointerId: 71,
    pointerType: "touch",
  });
  await joystick.dispatchEvent("pointermove", {
    bubbles: true,
    clientX: centerX,
    clientY: joystickBounds.y,
    isPrimary: true,
    pointerId: 71,
    pointerType: "touch",
  });
  await waitForSurfaceApproach(page);
  await boost.dispatchEvent("pointerdown", {
    bubbles: true,
    clientX: boostBounds.x + boostBounds.width / 2,
    clientY: boostBounds.y + boostBounds.height / 2,
    isPrimary: true,
    pointerId: 72,
    pointerType: "touch",
  });
  await expect(boost).toHaveAttribute("data-ready", "false");
  await page.waitForTimeout(350);
  await page.screenshot({ path: "docs/verification/worm-leap-mobile.png" });
  const peak = await sampling;
  await expect(boost).toHaveAttribute("data-ready", "true", {
    timeout: 4000,
  });
  await boost.dispatchEvent("pointerup", {
    bubbles: true,
    pointerId: 72,
    pointerType: "touch",
  });
  await joystick.dispatchEvent("pointerup", {
    bubbles: true,
    pointerId: 71,
    pointerType: "touch",
  });

  expect(-peak).toBeGreaterThan(HELICOPTER_ALTITUDE + 20);
  expect(errors).toEqual([]);
});
