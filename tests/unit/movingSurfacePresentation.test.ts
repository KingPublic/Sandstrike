import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { clippedCircle } from "../../src/game/rendering/SurfaceClip";
import { TrackingSystem } from "../../src/game/domain/hunt/TrackingSystem";
import { assistExposedAim } from "../../src/game/domain/hunt/HuntAiming";
import { RpgSystem } from "../../src/game/domain/hunt/RpgSystem";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it("clips and tracks relative to the risen surface, not the original floor", () => {
  expect(clippedCircle({ x: 0, y: -1100 }, 20, -1180)).toEqual([]);
  const partial = clippedCircle({ x: 0, y: -1170 }, 20, -1180);
  expect(partial.length).toBeGreaterThan(3);
  expect(partial.every(p => p.y <= -1180)).toBe(true);
  const snapshot = new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot();
  const worm = { ...snapshot.worm, head: { ...snapshot.worm.head, position: { x: 100, y: -1100 } }, followers: [] };
  const snare = { phase: "none" as const, placedTick: 0, triggeredTick: 0, readyTick: 0, revealUntilTick: 0 };
  expect(new TrackingSystem().step(worm, undefined, snare, 1, -1180).band).toBe("near");
  expect(assistExposedAim({ x: 0, y: -1110 }, { x: 1, y: 0 }, worm, 1, -1180)).toEqual({ x: 1, y: 0 });
});
it("a rocket cannot hit the buried part of an exposed circle at the risen surface", () => {
  const rpg = new RpgSystem(); rpg.pickup(1);
  const action = { ...neutralActionFrame(2), aimX: 1, primary: { held: true, pressed: true, released: false } };
  const frame = rpg.step(action, { position: { x: 0, y: -1170 }, regions: [{ index: 0, radius: 25, position: { x: 100, y: -1170 } }], surfaceY: -1180 }, 2);
  expect(frame.shot).toBeDefined(); expect(frame.commands).toEqual([]);
});
