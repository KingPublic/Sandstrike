import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { ascentRampageBalance } from "../../src/game/data/ascentRampage";
import { spawnActor } from "../../src/game/data/actors";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { RampageRules } from "../../src/game/domain/modes/RampageRules";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

const ascentRampage = { seed: 7, mode: "rampage", ascentRampage: true } as const;

it("starts the hunt with the sand rising and the first rival deployed", () => {
  const run = new RunFactory("rivals").create({ ...ascentRampage });
  const start = run.snapshot();
  expect(start.rivals?.total).toBe(ascentRampageBalance.rivals.length);
  expect(start.actors.some((actor) => actor.definitionId === "actor.carrion")).toBe(false);
  for (let tick = 1; tick <= 60; tick += 1) run.step(neutralActionFrame(tick));
  const after = run.snapshot();
  expect(after.rivals?.deployed).toBe(1);
  expect(after.actors.some((actor) => actor.id === "rival.ranger")).toBe(true);
  expect(after.world?.surfaceY).toBeLessThan(start.world?.surfaceY ?? 0);
});

it("rivals climb the tower while the sand chases them", () => {
  const run = new RunFactory("rivals").create({ ...ascentRampage });
  let carrionSeen = 0;
  for (let tick = 1; tick <= 900; tick += 1) {
    const frame = run.step(neutralActionFrame(tick));
    carrionSeen += frame.events.filter((event) => event.type === "actor-spawned" && event.definitionId === "actor.carrion").length;
  }
  const units = run.snapshot().rivals?.units ?? [];
  const lead = units[0];
  if (lead === undefined) throw new Error("Ascent rampage must deploy a rival.");
  expect(units.length).toBeGreaterThanOrEqual(1);
  expect(run.snapshot().rivals?.deployed).toBe(2);
  expect(lead.defeated).toBe(false);
  expect(lead.position.y).toBeLessThan(-20);
  expect(["climb", "advance", "engage"]).toContain(lead.activity);
  expect(carrionSeen).toBeGreaterThan(0);
});

it("eating carrion in the sand is the worm's only healing", () => {
  const run = new GameSession({
    mode: "rampage", arcade: true, ascent: true, seed: 1, characterId: "dune-maw",
    movement: arcadeMovementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 50,
    actors: [spawnActor("bait", "actor.carrion", { x: 38, y: 900 })],
  });
  const frame = run.step(neutralActionFrame(1));
  expect(frame.events.filter((event) => event.type === "target-consumed")).toHaveLength(1);
  expect(run.snapshot().actors.find((actor) => actor.id === "worm")?.health).toBe(58);
});

it("a destroyed worm ends the ascent rampage as a defeat", () => {
  const run = new GameSession({
    mode: "rampage", arcade: true, ascent: true, seed: 3, characterId: "dune-maw",
    movement: arcadeMovementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 1,
    initialProjectiles: [{ position: { x: 200, y: 900 }, direction: { x: -1, y: 0 } }],
  });
  let result = run.step(neutralActionFrame(1)).result;
  for (let tick = 2; tick <= 60 && result === undefined; tick += 1) result = run.step(neutralActionFrame(tick)).result;
  expect(result?.mode).toBe("rampage");
  expect(result?.reason).toBe("defeated");
  expect(result?.mode === "rampage" ? result.ascentRampage : undefined).toBe(true);
});

it("clearing all five rivals wins the run", () => {
  const run = new RunFactory("rivals").create({ ...ascentRampage });
  run.step(neutralActionFrame(1));
  const snapshot = run.snapshot();
  const rivals = snapshot.rivals;
  if (rivals === undefined) throw new Error("Ascent rampage needs a rival snapshot.");
  const update = new RampageRules(1 / 60, true).observe({ ...snapshot, rivals: { ...rivals, defeated: rivals.total, remaining: 0 } }, [], []);
  expect(update.result?.reason).toBe("all-hunters-defeated");
  expect(update.result?.mode === "rampage" ? update.result.huntersDefeated : undefined).toBe(rivals.total);
});
