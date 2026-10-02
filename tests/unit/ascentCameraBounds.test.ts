import { expect, it } from "vitest";
import { cameraWorldBounds } from "../../src/game/rendering/CameraFraming";
import { ascentArena } from "../../src/game/data/ascentArena";

it("the ascent camera can frame the whole rooftop instead of stopping below it", () => {
  const bounds = cameraWorldBounds(ascentArena.bounds);
  expect(bounds.top).toBeLessThan(ascentArena.summitY - 600);
  expect(bounds.bottom).toBe(ascentArena.bounds.bottom);
  expect(cameraWorldBounds().top).toBe(-1200);
});
