import { expect, it } from "vitest";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it.each([false, true])("held upward steering cannot hover after a building-height breach (burst %s)", burst => {
  const worm = new WormLocomotion({ ...arcadeMovementBalance, initialPosition: { x: 0, y: 8 }, initialDirection: { x: 0, y: -1 }, initialSpeed: arcadeMovementBalance.cruiseSpeed });
  const terrain = new FlatTerrainProfile(0);
  let peak = 0, returned = false, falling = false;
  for (let tick = 1; tick <= 150; tick++) {
    const before = worm.snapshot();
    worm.step({ ...neutralActionFrame(tick), moveY: -1, boost: { held: burst && tick === 1, pressed: burst && tick === 1, released: false } }, 1 / 60, terrain);
    const after = worm.snapshot();
    peak = Math.min(peak, after.head.position.y);
    if ((before.phase === "airborne" || before.phase === "breaching") && after.phase === "airborne") {
      expect(after.head.velocity.y).toBeGreaterThanOrEqual(before.head.velocity.y + arcadeMovementBalance.gravity / 60 - 1e-6);
      if (after.head.velocity.y > 0) falling = true;
    }
    if (after.phase === "reentering") { returned = true; break; }
  }
  expect(peak).toBeLessThan(-70);
  expect(peak).toBeGreaterThan(-210);
  expect(falling).toBe(true);
  expect(returned).toBe(true);
});
