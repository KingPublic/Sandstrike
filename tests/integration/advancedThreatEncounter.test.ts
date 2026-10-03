import { expect, it } from "vitest";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { spawnActor } from "../../src/game/data/actors";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
for (const [kind, y] of [["vehicle", -18], ["aerial", -180]] as const) it(`${kind} swept contacts reward destruction only once`, () => {
  const run = new GameSession({ seed: 1, movement: { ...movementBalance, initialPosition: { x: 0, y: y + 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: 460 }, terrain: new FlatTerrainProfile(0), actors: [spawnActor("target", `actor.${kind}`, { x: 0, y })] });
  const events = [];
  for (let tick = 1; tick <= 120; tick++) events.push(...run.step(neutralActionFrame(tick)).events);
  expect(events.filter(e => e.type === "actor-destroyed" && e.targetId === "target")).toHaveLength(1);
  expect(run.snapshot().score.basePoints).toBe(kind === "vehicle" ? 500 : 750);
});
