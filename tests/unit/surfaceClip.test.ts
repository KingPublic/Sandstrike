import { expect, it } from "vitest";
import { clipAboveSurface, clippedCircle } from "../../src/game/rendering/SurfaceClip";
it("omits fully buried geometry and clips every crossing vertex at the surface", () => {
  expect(clippedCircle({ x: 0, y: 100 }, 20)).toEqual([]);
  const partial = clippedCircle({ x: 0, y: 10 }, 20);
  expect(partial.length).toBeGreaterThan(3); expect(partial.every(p => p.y <= 0)).toBe(true);
  expect(clipAboveSurface([{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }])).toEqual([{ x: -10, y: 0 }, { x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 0 }]);
});
