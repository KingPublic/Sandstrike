import { describe, expect, it } from "vitest";

import { movementBalance } from "../../src/game/data/movementBalance";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import type { WormMotionPhase } from "../../src/game/domain/movement/WormMovementTypes";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

const DT = 1 / 60;

describe("WormLocomotion terrain crossing", () => {
  it("sweeps a fast head through one legal breach and re-entry sequence", () => {
    const terrain = new FlatTerrainProfile(0);
    const locomotion = new WormLocomotion({
      ...movementBalance,
      initialPosition: { x: 0, y: 10 },
      initialDirection: { x: 0, y: -1 },
      initialSpeed: movementBalance.cruiseSpeed,
    });
    const transitionTargets: WormMotionPhase[] = [];
    let airborneVelocityY: number | undefined;
    let laterAirborneVelocityY: number | undefined;
    let reentryTick: number | undefined;
    let undergroundTick: number | undefined;

    for (let tick = 1; tick <= 240; tick += 1) {
      const events = locomotion.step(neutralActionFrame(tick), DT, terrain);
      expect(events.filter((event) => event.type === "phase-changed")).toHaveLength(
        events.some((event) => event.type === "phase-changed") ? 1 : 0,
      );
      for (const event of events) {
        if (event.type === "phase-changed") {
          transitionTargets.push(event.to);
          if (event.to === "reentering") {
            reentryTick = tick;
          }
          if (event.to === "underground" && reentryTick !== undefined) {
            undergroundTick = tick;
          }
        }
      }

      const snapshot = locomotion.snapshot();
      if (snapshot.phase === "airborne") {
        if (airborneVelocityY === undefined) {
          airborneVelocityY = snapshot.head.velocity.y;
        } else {
          laterAirborneVelocityY ??= snapshot.head.velocity.y;
        }
      }
      if (undergroundTick !== undefined) {
        break;
      }
    }

    expect(transitionTargets).toEqual([
      "breaching",
      "airborne",
      "reentering",
      "underground",
    ]);
    expect(airborneVelocityY).toBeDefined();
    expect(laterAirborneVelocityY).toBeGreaterThan(airborneVelocityY ?? Infinity);
    expect(reentryTick).toBeDefined();
    expect(undergroundTick).toBeDefined();
    expect(((undergroundTick ?? 0) - (reentryTick ?? 0)) * DT).toBeLessThanOrEqual(
      movementBalance.maxForcedReentrySeconds + DT,
    );
  });

  it("uses surface hysteresis and does not duplicate a crossing event", () => {
    const terrain = new FlatTerrainProfile(0);
    const locomotion = new WormLocomotion({
      ...movementBalance,
      initialPosition: { x: 0, y: 1 },
      initialDirection: { x: 0, y: -1 },
      initialSpeed: movementBalance.cruiseSpeed,
    });
    let breachTransitions = 0;

    for (let tick = 1; tick <= 12; tick += 1) {
      const events = locomotion.step(neutralActionFrame(tick), DT, terrain);
      breachTransitions += events.filter(
        (event) =>
          event.type === "phase-changed" && event.to === "breaching",
      ).length;
    }

    expect(breachTransitions).toBe(1);
    expect(["breaching", "airborne"]).toContain(locomotion.snapshot().phase);
    expect(locomotion.snapshot().head.position.y).toBeLessThan(
      movementBalance.surfaceHysteresis,
    );
  });

  it("validates terrain heights and initial motion vectors", () => {
    expect(() => new FlatTerrainProfile(Number.NaN)).toThrow(RangeError);
    expect(
      () =>
        new WormLocomotion({
          ...movementBalance,
          initialDirection: { x: 0, y: 0 },
        }),
    ).toThrow(RangeError);
  });
});
