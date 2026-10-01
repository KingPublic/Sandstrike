import { expect, test, type Page } from "@playwright/test";
import { startRampage, restartWithConfiguration } from "./helpers";

function collectFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    failures.push(`page: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    failures.push(`request: ${request.url()}`);
  });
  return failures;
}

async function bootMovement(page: Page): Promise<void> {
  await startRampage(page);
  await page.waitForFunction(() => window.__SANDSTRIKE_TEST__ !== undefined);
}

async function configureAndSettle(page: Page, seed: number): Promise<void> {
  await restartWithConfiguration(page, { seed });
  await page.waitForFunction(
    () => (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) >= 3,
  );
}

test.describe("responsive movement controls", () => {
  test.use({
    hasTouch: true,
    viewport: { width: 915, height: 412 },
  });

  test("keyboard and synthetic touch steer through the same movement rules", async ({
    page,
  }) => {
    const failures = collectFailures(page);
    await bootMovement(page);

    await configureAndSettle(page, 101);
    const keyboardStart = await page.evaluate(
      () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0,
    );
    await page.keyboard.down("ArrowDown");
    await page.waitForFunction(
      (startTick) =>
        (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) >= startTick + 20,
      keyboardStart,
    );
    await page.keyboard.up("ArrowDown");
    const keyboardSnapshot = await page.evaluate(() =>
      window.__SANDSTRIKE_TEST__?.snapshot(),
    );

    await configureAndSettle(page, 101);
    const joystick = page.locator('[data-touch-control="joystick"]');
    await expect(joystick).toBeVisible();
    const bounds = await joystick.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) {
      throw new Error("Touch joystick bounds are unavailable.");
    }
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const touchStart = await page.evaluate(
      () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0,
    );
    await joystick.dispatchEvent("pointerdown", {
      bubbles: true,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
      pointerId: 41,
      pointerType: "touch",
    });
    await joystick.dispatchEvent("pointermove", {
      bubbles: true,
      clientX: centerX,
      clientY: bounds.y + bounds.height,
      isPrimary: true,
      pointerId: 41,
      pointerType: "touch",
    });
    await page.waitForFunction(
      (startTick) =>
        (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) >= startTick + 20,
      touchStart,
    );
    await joystick.dispatchEvent("pointerup", {
      bubbles: true,
      clientX: centerX,
      clientY: bounds.y + bounds.height,
      isPrimary: true,
      pointerId: 41,
      pointerType: "touch",
    });
    const touchSnapshot = await page.evaluate(() =>
      window.__SANDSTRIKE_TEST__?.snapshot(),
    );

    expect(keyboardSnapshot?.worm.head.tangent.y).toBeGreaterThan(0);
    expect(touchSnapshot?.worm.head.tangent.y).toBeGreaterThan(0);
    expect(keyboardSnapshot?.worm.speed).toBeGreaterThan(120);
    expect(touchSnapshot?.worm.speed).toBeGreaterThan(120);
    expect(
      Math.abs(
        (keyboardSnapshot?.worm.speed ?? 0) -
          (touchSnapshot?.worm.speed ?? 0),
      ),
    ).toBeLessThan(35);
    expect(failures).toEqual([]);
  });

  test("portrait and visibility interruptions freeze ticks and require deliberate resume", async ({
    page,
  }) => {
    const failures = collectFailures(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await bootMovement(page);
    await configureAndSettle(page, 202);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("heading", { name: "Rotate to landscape" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Resume run" }),
    ).toBeVisible();
    const portraitTick = await page.evaluate(
      () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? -1,
    );
    await page.waitForTimeout(220);
    expect(
      await page.evaluate(
        () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? -2,
      ),
    ).toBe(portraitTick);

    await page.setViewportSize({ width: 844, height: 390 });
    const resume = page.getByRole("button", { name: "Resume run" });
    await expect(resume).toBeEnabled();
    await resume.click();
    await page.waitForFunction(
      (frozenTick) =>
        (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) > frozenTick,
      portraitTick,
    );

    const boost = page.locator('[data-touch-control="boost"]');
    const boostBounds = await boost.boundingBox();
    expect(boostBounds).not.toBeNull();
    if (!boostBounds) {
      throw new Error("Burst control bounds are unavailable.");
    }
    await boost.dispatchEvent("pointerdown", {
      bubbles: true,
      clientX: boostBounds.x + boostBounds.width / 2,
      clientY: boostBounds.y + boostBounds.height / 2,
      isPrimary: true,
      pointerId: 52,
      pointerType: "touch",
    });
    await page.waitForTimeout(40);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const hiddenSnapshot = await page.evaluate(() =>
      window.__SANDSTRIKE_TEST__?.snapshot(),
    );
    await page.waitForTimeout(220);
    expect(
      await page.evaluate(
        () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? -2,
      ),
    ).toBe(hiddenSnapshot?.tick);

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(
      page.getByRole("heading", { name: "Session protected" }),
    ).toBeVisible();
    await resume.click();
    await page.waitForFunction(
      (frozenTick) =>
        (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) > frozenTick + 4,
      hiddenSnapshot?.tick ?? 0,
    );
    const resumedSnapshot = await page.evaluate(() =>
      window.__SANDSTRIKE_TEST__?.snapshot(),
    );
    expect(resumedSnapshot?.worm.burstCooldownSeconds ?? 0).toBeLessThanOrEqual(
      hiddenSnapshot?.worm.burstCooldownSeconds ?? 0,
    );
    expect(Number.isFinite(resumedSnapshot?.worm.head.position.x)).toBe(true);
    expect(Number.isFinite(resumedSnapshot?.worm.head.position.y)).toBe(true);
    expect(failures).toEqual([]);
  });

  test("supports simultaneous steering and Burst at representative landscape sizes", async ({
    page,
  }) => {
    const failures = collectFailures(page);
    await bootMovement(page);

    for (const [index, viewport] of [
      { width: 915, height: 412 },
      { width: 844, height: 390 },
      { width: 1024, height: 768 },
    ].entries()) {
      await page.setViewportSize(viewport);
      await configureAndSettle(page, 300 + index);

      const joystick = page.locator('[data-touch-control="joystick"]');
      const boost = page.locator('[data-touch-control="boost"]');
      const primary = page.locator('[data-touch-control="primary"]');
      await expect(joystick).toBeVisible();
      await expect(boost).toBeVisible();
      await expect(primary).toBeVisible();

      const joystickBounds = await joystick.boundingBox();
      const boostBounds = await boost.boundingBox();
      const primaryBounds = await primary.boundingBox();
      expect(joystickBounds).not.toBeNull();
      expect(boostBounds).not.toBeNull();
      expect(primaryBounds).not.toBeNull();
      if (!joystickBounds || !boostBounds || !primaryBounds) {
        throw new Error("Representative touch controls have no layout bounds.");
      }
      for (const bounds of [joystickBounds, boostBounds, primaryBounds]) {
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.y).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
      }

      const startTick = await page.evaluate(
        () => window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0,
      );
      const joystickCenter = {
        x: joystickBounds.x + joystickBounds.width / 2,
        y: joystickBounds.y + joystickBounds.height / 2,
      };
      await joystick.dispatchEvent("pointerdown", {
        bubbles: true,
        clientX: joystickCenter.x,
        clientY: joystickCenter.y,
        isPrimary: true,
        pointerId: 60 + index * 2,
        pointerType: "touch",
      });
      await joystick.dispatchEvent("pointermove", {
        bubbles: true,
        clientX: joystickBounds.x + joystickBounds.width,
        clientY: joystickBounds.y + joystickBounds.height,
        isPrimary: true,
        pointerId: 60 + index * 2,
        pointerType: "touch",
      });
      await boost.dispatchEvent("pointerdown", {
        bubbles: true,
        clientX: boostBounds.x + boostBounds.width / 2,
        clientY: boostBounds.y + boostBounds.height / 2,
        isPrimary: true,
        pointerId: 61 + index * 2,
        pointerType: "touch",
      });
      await page.waitForFunction(
        (tick) =>
          (window.__SANDSTRIKE_TEST__?.snapshot().tick ?? 0) >= tick + 12,
        startTick,
      );
      await joystick.dispatchEvent("pointerup", {
        bubbles: true,
        clientX: joystickBounds.x + joystickBounds.width,
        clientY: joystickBounds.y + joystickBounds.height,
        isPrimary: true,
        pointerId: 60 + index * 2,
        pointerType: "touch",
      });
      await boost.dispatchEvent("pointerup", {
        bubbles: true,
        clientX: boostBounds.x + boostBounds.width / 2,
        clientY: boostBounds.y + boostBounds.height / 2,
        isPrimary: true,
        pointerId: 61 + index * 2,
        pointerType: "touch",
      });

      const snapshot = await page.evaluate(() =>
        window.__SANDSTRIKE_TEST__?.snapshot(),
      );
      expect(snapshot?.worm.burstCooldownSeconds ?? 0).toBeGreaterThan(1.3);
      expect(snapshot?.worm.head.tangent.y ?? 0).toBeGreaterThan(0);
      expect(Number.isFinite(snapshot?.worm.head.position.x)).toBe(true);
      expect(Number.isFinite(snapshot?.worm.head.position.y)).toBe(true);
    }

    expect(failures).toEqual([]);
  });
});
