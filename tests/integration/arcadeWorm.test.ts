import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { spawnActor } from "../../src/game/data/actors";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";

it("normal Rampage breaches around building height and returns under gravity", () => {
  const run = new RunFactory("arc").create({ seed: 818, mode: "rampage" });
  let highest = 0;
  for (let tick = 1; tick <= 240; tick++) {
    const frame = run.step({ ...neutralActionFrame(tick), moveY: -1 });
    highest = Math.min(highest, frame.snapshot.worm.head.position.y);
    expect(frame.snapshot.worm.followers.every(p => Number.isFinite(p.position.x + p.position.y))).toBe(true);
    if (frame.result) break;
  }
  expect(highest).toBeLessThan(-65);
  expect(highest).toBeGreaterThan(-200);
});
it("a mouth contact feeds at low speed without pressing Bite", () => {
  const run = new GameSession({ mode: "rampage", arcade: true, seed: 1, movement: { ...movementBalance, initialPosition: { x: 0, y: -10 }, initialSpeed: 90 }, terrain: new FlatTerrainProfile(0), playerHealth: 50, actors: [spawnActor("food", "actor.prey", { x: 38, y: -10 })] });
  const frame = run.step(neutralActionFrame(1));
  expect(frame.events.filter(e => e.type === "target-consumed")).toHaveLength(1);
  expect(frame.snapshot.actors.find(a => a.id === "worm")?.health).toBe(58);
  expect(run.step(neutralActionFrame(2)).events.filter(e => e.type === "target-consumed")).toHaveLength(0);
});
it("body contact at low speed does not eat", () => {
  const run = new GameSession({ mode: "rampage", arcade: true, seed: 1, movement: { ...movementBalance, initialPosition: { x: 0, y: -10 }, initialSpeed: 90 }, terrain: new FlatTerrainProfile(0), actors: [spawnActor("food", "actor.prey", { x: -15, y: -10 })] });
  expect(run.step(neutralActionFrame(1)).events.filter(e => e.type === "target-consumed")).toHaveLength(0);
});

it("Sandguard protects a wounded worm from an immediate shot without healing", () => {
  const run = new GameSession({ mode: "rampage", arcade: true, seed: 1, playerHealth: 50,
    movement: movementBalance, terrain: new FlatTerrainProfile(0),
    initialProjectiles: [{ position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } }] });
  const frame = run.step({ ...neutralActionFrame(1), ability: { held: true, pressed: true, released: false } });
  expect(frame.snapshot.actors.find(a => a.id === "worm")?.health).toBe(50);
  expect(frame.snapshot.actors.find(a => a.id === "worm")?.invulnerableUntilTick).toBe(181);
  expect(frame.events.some(e => e.type === "damage-applied" && e.blocked === "invulnerable")).toBe(true);
});
