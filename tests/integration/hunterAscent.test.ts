import { expect, it } from "vitest";

import { RunFactory } from "../../src/game/application/RunFactory";
import { ascentArena, ascentHunterBalance } from "../../src/game/data/ascentArena";
import { AscentWorld } from "../../src/game/domain/world/AscentWorld";
import { neutralActionFrame, type ActionFrame } from "../../src/game/input/ActionFrame";

const hold = (tick: number, overrides: Partial<ActionFrame>): ActionFrame => ({ ...neutralActionFrame(tick), ...overrides });

it("starts ascent runs on the base platform with a rising world below the summit", () => {
  const run = new RunFactory("ascent").create({ seed: 5, mode: "hunt" });
  const snapshot = run.snapshot();
  expect(snapshot.world?.stage).toBe("ascent");
  expect(snapshot.world?.surfaceY).toBe(ascentArena.initialSurface);
  expect(snapshot.hunt?.hunter.grounded).toBe(true);
  expect(snapshot.hunt?.hunter.position).toEqual({ x: -180, y: -16 });
  for (let tick = 1; tick <= 60; tick++) run.step(neutralActionFrame(tick));
  expect(run.snapshot().world?.surfaceY).toBeCloseTo(ascentArena.initialSurface - ascentArena.riseSpeed, 6);
});

it("jumps, lands one-way on a ledge and drops through on demand", () => {
  const run = new RunFactory("jump").create({ seed: 9, mode: "hunt" });
  for (let tick = 1; tick <= 40; tick++) run.step(hold(tick, { moveX: 1 }));
  const beforeJump = run.snapshot().hunt?.hunter.position.x ?? 0;
  expect(beforeJump).toBeGreaterThan(-100);
  run.step(hold(41, { jump: { held: true, pressed: true, released: false } }));
  for (let tick = 42; tick <= 100; tick++) run.step(neutralActionFrame(tick));
  const landed = run.snapshot().hunt?.hunter;
  expect(landed?.grounded).toBe(true);
  expect(landed?.platformId).toBe("ledge.0");
  expect(landed?.position.y).toBe(-90 - ascentHunterBalance.halfHeight);
  run.step(hold(101, { drop: { held: true, pressed: true, released: false } }));
  for (let tick = 102; tick <= 140; tick++) run.step(neutralActionFrame(tick));
  const dropped = run.snapshot().hunt?.hunter;
  expect(dropped?.platformId).toBe("base");
  expect(dropped?.position.y).toBe(-ascentHunterBalance.halfHeight);
});

it("does not lift a buried Hunter and applies burial damage after the grace window", () => {
  const run = new RunFactory("buried").create({ seed: 3, mode: "hunt", fixtureId: "ascent-buried" });
  let burialEvents = 0;
  // The hazard starts level with the feet, so burial begins on the first raised tick.
  for (let tick = 1; tick <= ascentArena.burialGraceTicks + 10; tick++) {
    const frame = run.step(neutralActionFrame(tick));
    burialEvents += frame.events.filter(event => event.type === "damage-applied" && event.abilityId === "hazard.burial").length;
    expect(frame.snapshot.hunt?.hunter.position.y).toBe(-ascentHunterBalance.halfHeight);
  }
  expect(burialEvents).toBe(0);
  for (let tick = ascentArena.burialGraceTicks + 11; tick <= ascentArena.burialGraceTicks + 400; tick++) {
    const frame = run.step(neutralActionFrame(tick));
    burialEvents += frame.events.filter(event => event.type === "damage-applied" && event.abilityId === "hazard.burial").length;
  }
  expect(burialEvents).toBeGreaterThan(0);
  expect(run.snapshot().hunt?.hunterHealth).toBeLessThan(100);
});

it("freezes the rising hazard once the summit stage begins", () => {
  const world = new AscentWorld();
  world.step(600, "ascent");
  const rising = world.snapshot().surfaceY;
  const boss = world.step(600, "boss");
  expect(boss.stage).toBe("boss");
  expect(boss.surfaceY).toBeLessThanOrEqual(ascentArena.summitY + 420);
  expect(world.step(6000, "boss").surfaceY).toBe(boss.surfaceY);
  expect(rising).toBeGreaterThan(boss.surfaceY);
  expect(world.isAtSummit({ x: 0, y: ascentArena.summitY })).toBe(true);
  expect(world.isAtSummit({ x: 1800, y: ascentArena.summitY })).toBe(false);
});
