import { describe, expect, it } from "vitest";

import { movementBalance } from "../../src/game/data/movementBalance";
import { computeCameraFraming } from "../../src/game/rendering/CameraFraming";

describe("computeCameraFraming", () => {
  it("preserves the close movement framing near the surface", () => {
    const framing = computeCameraFraming(
      {
        position: { x: 120, y: 180 },
        velocity: { x: 360, y: 0 },
      },
      900,
      movementBalance,
    );

    expect(framing).toEqual({ centerX: 256.8, centerY: 180, zoom: 1 });
  });

  it("zooms and recenters to retain the surface and a deeply burrowed head", () => {
    const framing = computeCameraFraming(
      {
        position: { x: 100, y: 1_400 },
        velocity: { x: 0, y: 360 },
      },
      900,
      movementBalance,
    );
    const halfWorldHeight = 900 / framing.zoom / 2;

    expect(framing.zoom).toBeGreaterThanOrEqual(0.55);
    expect(framing.zoom).toBeLessThan(0.65);
    expect(framing.centerY - halfWorldHeight).toBeLessThanOrEqual(0);
    expect(framing.centerY + halfWorldHeight).toBeGreaterThanOrEqual(1_400);
  });

  it("keeps the complete useful depth range framed before reaching world limits", () => {
    const framing = computeCameraFraming(
      {
        position: { x: 100, y: 1_700 },
        velocity: { x: 0, y: 360 },
      },
      900,
      movementBalance,
    );
    const halfWorldHeight = 900 / framing.zoom / 2;

    expect(framing.zoom).toBeGreaterThanOrEqual(0.45);
    expect(framing.centerY - halfWorldHeight).toBeLessThanOrEqual(0);
    expect(framing.centerY + halfWorldHeight).toBeGreaterThanOrEqual(1_700);
  });

  it("prioritizes the worm when a compact canvas cannot also retain the surface", () => {
    const framing = computeCameraFraming(
      {
        position: { x: 100, y: 1_700 },
        velocity: { x: 0, y: 360 },
      },
      532,
      movementBalance,
    );
    const halfWorldHeight = 532 / framing.zoom / 2;

    expect(framing.zoom).toBe(0.45);
    expect(framing.centerY + halfWorldHeight).toBeGreaterThanOrEqual(1_840);
  });

  it("returns finite bounded framing for invalid frame measurements", () => {
    const framing = computeCameraFraming(
      {
        position: { x: 0, y: -420 },
        velocity: { x: 0, y: -460 },
      },
      Number.NaN,
      movementBalance,
    );

    expect(framing.zoom).toBe(1);
    expect(framing.centerY).toBe(-210);
    expect(Object.values(framing).every(Number.isFinite)).toBe(true);
  });
});
