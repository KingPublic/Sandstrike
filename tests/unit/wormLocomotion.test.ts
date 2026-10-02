import { describe, expect, it } from "vitest";

import { movementBalance } from "../../src/game/data/movementBalance";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import {
  neutralActionFrame,
  type ActionFrame,
} from "../../src/game/input/ActionFrame";

const DT = 1 / 60;
const TERRAIN = new FlatTerrainProfile(0);

function action(
  tick: number,
  options: { moveX?: number; moveY?: number; boostPressed?: boolean } = {},
): ActionFrame {
  const neutral = neutralActionFrame(tick);
  const boostPressed = options.boostPressed ?? false;
  return Object.freeze({
    ...neutral,
    moveX: options.moveX ?? 0,
    moveY: options.moveY ?? 0,
    boost: Object.freeze({
      held: boostPressed,
      pressed: boostPressed,
      released: false,
    }),
  });
}

function angleBetween(
  before: { readonly x: number; readonly y: number },
  after: { readonly x: number; readonly y: number },
): number {
  const cross = before.x * after.y - before.y * after.x;
  const dot = before.x * after.x + before.y * after.y;
  return Math.abs(Math.atan2(cross, dot));
}

describe("WormLocomotion underground motion", () => {
  it("bounds acceleration at the cruise cap", () => {
    const locomotion = new WormLocomotion({
      ...movementBalance,
      initialSpeed: 100,
    });

    locomotion.step(action(1, { moveX: 1 }), DT, TERRAIN);
    expect(locomotion.snapshot().speed).toBeLessThanOrEqual(
      100 + movementBalance.undergroundAcceleration * DT + 1e-9,
    );

    for (let tick = 2; tick <= 240; tick += 1) {
      locomotion.step(action(tick, { moveX: 1 }), DT, TERRAIN);
    }
    expect(locomotion.snapshot().speed).toBeCloseTo(
      movementBalance.cruiseSpeed,
      8,
    );
  });

  it("rate-limits turning and reduces authority at high speed", () => {
    const slow = new WormLocomotion({
      ...movementBalance,
      initialSpeed: 100,
    });
    const fast = new WormLocomotion({
      ...movementBalance,
      initialSpeed: movementBalance.cruiseSpeed,
    });
    const slowBefore = slow.snapshot().head.tangent;
    const fastBefore = fast.snapshot().head.tangent;

    slow.step(action(1, { moveY: 1 }), DT, TERRAIN);
    fast.step(action(1, { moveY: 1 }), DT, TERRAIN);

    const slowTurn = angleBetween(slowBefore, slow.snapshot().head.tangent);
    const fastTurn = angleBetween(fastBefore, fast.snapshot().head.tangent);
    expect(slowTurn).toBeLessThanOrEqual(
      movementBalance.lowSpeedTurnRate * DT + 1e-9,
    );
    expect(slowTurn).toBeGreaterThan(fastTurn);
    expect(fastTurn).toBeGreaterThan(0);
  });

  it("applies one capped Burst and starts a cooldown without invulnerability", () => {
    const boosted = new WormLocomotion({
      ...movementBalance,
      initialSpeed: 350,
    });
    const baseline = new WormLocomotion({
      ...movementBalance,
      initialSpeed: 350,
    });

    const events = boosted.step(
      action(1, { moveX: 1, boostPressed: true }),
      DT,
      TERRAIN,
    );
    baseline.step(action(1, { moveX: 1 }), DT, TERRAIN);

    expect(events.map((event) => event.type)).toContain("burst");
    expect(boosted.snapshot().speed).toBe(
      Math.min(
        movementBalance.burstSpeedCap,
        baseline.snapshot().speed + movementBalance.burstSpeedGain,
      ),
    );
    expect(boosted.snapshot().burstCooldownSeconds).toBeCloseTo(
      movementBalance.burstCooldownSeconds,
      8,
    );
    expect(boosted.snapshot().burstCooldownTotalSeconds).toBe(
      movementBalance.burstCooldownSeconds,
    );
    expect("invulnerable" in boosted.snapshot()).toBe(false);

    const speedAfterFirst = boosted.snapshot().speed;
    const secondEvents = boosted.step(
      action(2, { boostPressed: true }),
      DT,
      TERRAIN,
    );
    expect(secondEvents.map((event) => event.type)).not.toContain("burst");
    expect(boosted.snapshot().speed).toBeLessThanOrEqual(speedAfterFirst);
  });

  it("returns identical immutable poses for identical action sequences", () => {
    const first = new WormLocomotion(movementBalance);
    const second = new WormLocomotion(movementBalance);

    for (let tick = 1; tick <= 180; tick += 1) {
      const frame = action(tick, {
        moveX: Math.cos(tick / 31),
        moveY: 0.45 + Math.sin(tick / 31) * 0.2,
        boostPressed: tick === 20,
      });
      first.step(frame, DT, TERRAIN);
      second.step(frame, DT, TERRAIN);
    }

    const firstSnapshot = first.snapshot();
    expect(firstSnapshot).toEqual(second.snapshot());
    expect(firstSnapshot.followers).toHaveLength(
      movementBalance.segmentCount - 1,
    );
    expect(Object.isFrozen(firstSnapshot)).toBe(true);
    expect(Object.isFrozen(firstSnapshot.followers)).toBe(true);
    expect(
      firstSnapshot.followers.every(
        (pose) =>
          Number.isFinite(pose.position.x) &&
          Number.isFinite(pose.position.y) &&
          Number.isFinite(pose.tangent.x) &&
          Number.isFinite(pose.tangent.y),
      ),
    ).toBe(true);
  });
});
