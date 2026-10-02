import { expect, it } from "vitest";
import { TrackingSystem } from "../../src/game/domain/hunt/TrackingSystem";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { movementBalance } from "../../src/game/data/movementBalance";
it("quantizes hidden movement and removes exact trace at reveal deadline", () => {
  const tracking = new TrackingSystem(), worm = new WormLocomotion(movementBalance).snapshot();
  const at = (x: number) => ({ ...worm, head: { ...worm.head, position: { x, y: 180 } } });
  const snare = { phase: "none" as const, placedTick: 0, triggeredTick: 0, readyTick: 0, revealUntilTick: 0 };
  expect(tracking.step(at(1), undefined, snare, 1)).toEqual(tracking.step(at(110), undefined, snare, 1));
  expect(tracking.step(at(1), undefined, { ...snare, revealUntilTick: 120 }, 119).exactTrace).toEqual({ x: 1, y: 180 });
  expect(tracking.step(at(1), undefined, { ...snare, revealUntilTick: 120 }, 120).exactTrace).toBeUndefined();
});
