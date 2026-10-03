import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import type { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import type { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { WormController } from "../../src/game/domain/ai/WormController";
import { huntMovementBalance } from "../../src/game/data/huntMovementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it("a fatal rocket cannot erase an already committed fatal boss collision", () => {
  const run = new RunFactory("simultaneous").create({ seed: 33, mode: "hunt", fixtureId: "ascent-boss" });
  run.step(neutralActionFrame(1));
  const state = run as unknown as { actors: ActorRegistry; locomotion: WormLocomotion };
  state.locomotion.reset({ position: { x: 10, y: -1616 }, direction: { x: -1, y: 0 }, speed: 800 });
  for (const id of ["worm", "hunter"]) {
    const actor = state.actors.get(id); if (!actor) throw new Error("Missing actor.");
    state.actors.update({ ...actor, health: 1, invulnerableUntilTick: 0 });
  }
  const frame = run.step({ ...neutralActionFrame(2), aimWorld: { x: 10, y: -1616 }, primary: { held: true, pressed: true, released: false } });
  expect(frame.result?.reason).toBe("hunter-defeated");
  expect(frame.events.filter(e => e.type === "run-ended")).toHaveLength(1);
});

it("support spawns above a risen summit hazard rather than remaining buried", () => {
  const run = new RunFactory("summit-support").create({ seed: 21, mode: "hunt", fixtureId: "ascent-boss" });
  for (let tick = 1; tick <= 1000; tick++) run.step(neutralActionFrame(tick));
  const snapshot = run.snapshot(), ground = snapshot.hunt?.allies.filter(a => a.kind === "ally.ground") ?? [];
  expect(ground).toHaveLength(2);
  expect(ground.every(a => a.position.y + 16 < (snapshot.world?.surfaceY ?? 0))).toBe(true);
});

it("ascent targeting keeps a sensed decoy useful after the first minute", () => {
  const run = new RunFactory("decoy").create({ seed: 1, mode: "hunt" });
  const controller = new WormController(huntMovementBalance, new FlatTerrainProfile(0), 5, false);
  const perception = { self: run.snapshot().worm, relay: { x: 0, y: 200 }, hunter: { position: { x: 90, y: -16 }, observedTick: 3601 }, surfaceY: 0 };
  const random = new RandomSource(1).stream("ai");
  controller.step(perception, 3601, random);
  expect(controller.step(perception, 3613, random).target).toEqual(perception.hunter.position);
});
