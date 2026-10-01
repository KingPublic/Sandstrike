import { describe, expect, it } from "vitest";

import {
  computeViewportLayout,
  type LayoutRect,
  type ViewportLayoutInput,
} from "../../src/game/ui/ViewportLayout";

function input(
  width: number,
  height: number,
  overrides: Partial<ViewportLayoutInput> = {},
): ViewportLayoutInput {
  return {
    cssWidth: width,
    cssHeight: height,
    devicePixelRatio: 1,
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    orientation: width >= height ? "landscape" : "portrait",
    coarsePointer: false,
    touchCapable: false,
    role: "worm",
    ...overrides,
  };
}

function overlaps(first: LayoutRect, second: LayoutRect): boolean {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

describe("computeViewportLayout", () => {
  it.each([
    [1440, 900],
    [1280, 720],
    [1024, 768],
  ])("keeps desktop playfield finite at %sx%s", (width, height) => {
    const layout = computeViewportLayout(input(width, height));

    expect(layout.portraitBlocked).toBe(false);
    expect(layout.touchControlsVisible).toBe(false);
    expect(layout.gameRect).toEqual({ x: 0, y: 0, width, height });
    expect(layout.canvasPixels).toEqual({ width, height });
  });

  it.each([
    [915, 412, { top: 0, right: 18, bottom: 10, left: 18 }],
    [844, 390, { top: 6, right: 24, bottom: 8, left: 24 }],
    [1024, 768, { top: 0, right: 0, bottom: 20, left: 0 }],
  ])(
    "places independent touch controls outside the critical region at %sx%s",
    (width, height, safeArea) => {
      const layout = computeViewportLayout(
        input(width, height, {
          safeArea,
          coarsePointer: true,
          touchCapable: true,
        }),
      );

      expect(layout.touchControlsVisible).toBe(true);
      expect(layout.targetSize).toBeGreaterThanOrEqual(44);
      expect(layout.targetSize).toBeGreaterThanOrEqual(
        Math.min(48, layout.gameRect.height * 0.14),
      );
      expect(overlaps(layout.joystick, layout.criticalRegion)).toBe(false);
      expect(overlaps(layout.primaryButton, layout.criticalRegion)).toBe(false);
      expect(overlaps(layout.boostButton, layout.criticalRegion)).toBe(false);
      expect(overlaps(layout.primaryButton, layout.boostButton)).toBe(false);
      expect(layout.joystick.x).toBeGreaterThanOrEqual(layout.gameRect.x);
      expect(layout.primaryButton.x + layout.primaryButton.width).toBeLessThanOrEqual(
        layout.gameRect.x + layout.gameRect.width,
      );
    },
  );

  it("blocks portrait play while retaining a finite safe game rectangle", () => {
    const layout = computeViewportLayout(
      input(390, 844, {
        orientation: "portrait",
        coarsePointer: true,
        touchCapable: true,
        devicePixelRatio: 3,
        safeArea: { top: 42, right: 0, bottom: 24, left: 0 },
      }),
    );

    expect(layout.portraitBlocked).toBe(true);
    expect(layout.touchControlsVisible).toBe(false);
    expect(layout.gameRect.height).toBe(778);
    expect(layout.canvasPixels).toEqual({ width: 1170, height: 2532 });
  });

  it("rejects non-finite viewport and safe-area measurements", () => {
    expect(() => computeViewportLayout(input(Number.NaN, 720))).toThrow(
      RangeError,
    );
    expect(() =>
      computeViewportLayout(
        input(844, 390, {
          safeArea: { top: 0, right: -1, bottom: 0, left: 0 },
        }),
      ),
    ).toThrow(RangeError);
  });
});
