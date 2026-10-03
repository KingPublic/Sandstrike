import { expect, it } from "vitest";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

/** Aerial targets patrol at 220px; the head first reaches contact near 164px. */
const AERIAL_CONTACT_CLEARANCE = 164;

function breach(burst: boolean): { readonly peak: number; readonly returned: boolean; readonly falling: boolean; readonly ballistic: boolean } {
  const worm = new WormLocomotion({ ...arcadeMovementBalance, initialPosition: { x: 0, y: 8 }, initialDirection: { x: 0, y: -1 }, initialSpeed: arcadeMovementBalance.cruiseSpeed });
  const terrain = new FlatTerrainProfile(0);
  let peak = 0, returned = false, falling = false, ballistic = true;
  for (let tick = 1; tick <= 150; tick++) {
    const before = worm.snapshot();
    const pressed = burst && tick === 1;
    worm.step({ ...neutralActionFrame(tick), moveY: -1, boost: { held: pressed, pressed, released: false } }, 1 / 60, terrain);
    const after = worm.snapshot();
    peak = Math.min(peak, after.head.position.y);
    if ((before.phase === "airborne" || before.phase === "breaching") && after.phase === "airborne") {
      if (after.head.velocity.y < before.head.velocity.y + arcadeMovementBalance.gravity / 60 - 1e-6) ballistic = false;
      if (after.head.velocity.y > 0) falling = true;
    }
    if (after.phase === "reentering") { returned = true; break; }
  }
  return { peak, returned, falling, ballistic };
}

it.each([false, true])("held upward steering cannot hover after a surface breach (burst %s)", burst => {
  const result = breach(burst);
  expect(result.peak).toBeLessThan(burst ? -240 : -70);
  expect(result.peak).toBeGreaterThan(burst ? -330 : -150);
  expect(result.falling).toBe(true);
  expect(result.returned).toBe(true);
  expect(result.ballistic).toBe(true);
});

it("an upward Burst clears the helicopter patrol altitude with margin", () => {
  expect(-breach(true).peak).toBeGreaterThan(AERIAL_CONTACT_CLEARANCE + 40);
});

it("a plain breach still falls short of the helicopter patrol altitude", () => {
  expect(-breach(false).peak).toBeLessThan(AERIAL_CONTACT_CLEARANCE);
});

it("a downward Burst is a sprint, not a leap", () => {
  const worm = new WormLocomotion({ ...arcadeMovementBalance, initialPosition: { x: 0, y: -40 }, initialDirection: { x: 1, y: 0 }, initialSpeed: arcadeMovementBalance.cruiseSpeed });
  worm.step({ ...neutralActionFrame(1), moveX: 1, moveY: 1, boost: { held: true, pressed: true, released: false } }, 1 / 60, new FlatTerrainProfile(0));
  const after = worm.snapshot();
  expect(after.head.velocity.y).toBeGreaterThan(0);
  expect(after.speed).toBeLessThan(arcadeMovementBalance.burstLiftSpeed);
});
