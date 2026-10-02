import { expect, it } from "vitest";

import { RunFactory } from "../../src/game/application/RunFactory";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { spawnActor } from "../../src/game/data/actors";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { WORM_RETURN_TICKS } from "../../src/game/domain/hunt/WormLifeDirector";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

function doomed() {
  return new GameSession({
    seed: 7, mode: "hunt", ascent: true, movement: arcadeMovementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 1,
    actors: [spawnActor("hunter", "actor.hunter", { x: -180, y: -16 })],
    initialProjectiles: [{ position: { x: 0, y: 900 }, direction: { x: 1, y: 0 } }],
  });
}

it("removes a killed worm for 600 ticks and returns a stronger one without resetting the run", () => {
  const session = doomed();
  let deathTick = 0;
  for (let tick = 1; tick <= 60 && deathTick === 0; tick += 1) {
    if (session.step(neutralActionFrame(tick)).snapshot.wormLife?.phase === "absent") deathTick = tick;
  }
  expect(deathTick).toBeGreaterThan(0);
  const killed = session.snapshot();
  expect(killed.wormLife?.kills).toBe(1);
  expect(killed.wormLife?.returnTick).toBe(deathTick + WORM_RETURN_TICKS);
  const hidden = killed.actors.find(actor => actor.id === "worm");
  expect(hidden?.health).toBe(0);
  expect(hidden?.collision.layer).toBe(0);
  const hunterHealth = killed.hunt?.hunterHealth ?? 0;
  const surfaceAtDeath = killed.world?.surfaceY ?? 0;

  for (let tick = deathTick + 1; tick <= deathTick + WORM_RETURN_TICKS - 1; tick += 1) session.step(neutralActionFrame(tick));
  expect(session.snapshot().wormLife).toMatchObject({ phase: "absent", returnInTicks: 1 });

  for (let tick = deathTick + WORM_RETURN_TICKS; tick <= deathTick + WORM_RETURN_TICKS + 19; tick += 1) session.step(neutralActionFrame(tick));
  const returned = session.snapshot();
  const worm = returned.actors.find(actor => actor.id === "worm");
  expect(returned.wormLife).toMatchObject({ phase: "alive", generation: 1, kills: 1 });
  expect(worm?.health).toBe(worm?.maxHealth);
  expect(worm?.collision.layer).toBe(1);
  expect(worm?.position.y).toBeGreaterThan(returned.world?.surfaceY ?? 0);
  expect(returned.hunt?.hunterHealth).toBe(hunterHealth);
  expect(returned.tick).toBe(deathTick + WORM_RETURN_TICKS + 19);
  expect(returned.world?.surfaceY).toBeLessThan(surfaceAtDeath);
  expect(session.step(neutralActionFrame(deathTick + WORM_RETURN_TICKS + 20)).result).toBeUndefined();
});

it("keeps ascent runs alive and pursuing elevated Hunters after a kill", () => {
  const run = new RunFactory("pursuit").create({ seed: 11, mode: "hunt" });
  expect(run.snapshot().wormLife).toMatchObject({ phase: "alive", generation: 0 });
  for (let tick = 1; tick <= 900; tick += 1) {
    const frame = run.step(neutralActionFrame(tick));
    const worm = frame.snapshot.worm;
    expect(Number.isFinite(worm.head.position.x + worm.head.position.y)).toBe(true);
    for (const follower of worm.followers) expect(Number.isFinite(follower.position.x + follower.position.y)).toBe(true);
    if (frame.snapshot.wormLife?.phase === "absent") expect(frame.snapshot.actors.find(actor => actor.id === "worm")?.collision.layer).toBe(0);
  }
  expect(run.snapshot().hunt?.wormHealth).toBeGreaterThan(0);
});
