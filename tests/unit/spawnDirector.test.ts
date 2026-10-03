import { describe, expect, it } from "vitest";
import { SpawnDirector } from "../../src/game/domain/spawning/SpawnDirector";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { spawnActor } from "../../src/game/data/actors";
import type { ActorState } from "../../src/game/domain/actors/Actor";

function sequence() {
  const director = new SpawnDirector();
  const random = new RandomSource(42).stream("spawn");
  const actors: ActorState[] = [];
  const commands = [];
  for (let tick = 1; tick < 4000; tick += 1) {
    const result = director.step({ tick, actors, playerPosition: { x: 0, y: 180 }, playerHealth: 20, band: 1, cameraHalfWidth: 600, surfaceY: 0 }, random);
    for (const command of result) actors.push(spawnActor(command.id, command.definitionId, command.position));
    commands.push(...result);
  }
  return { commands, actors };
}
describe("legal spawn opportunities", () => {
  it("reproduces a seed, caps both populations and leads off camera", () => {
    const first = sequence();
    expect(first).toEqual(sequence());
    expect(first.actors.filter((a) => a.tags.includes("prey"))).toHaveLength(8);
    expect(first.actors.filter((a) => a.tags.includes("infantry"))).toHaveLength(4);
    for (const actor of first.actors) {
      expect(Math.abs(actor.position.x)).toBeGreaterThan(660);
      expect(Math.abs(actor.position.x)).toBeLessThanOrEqual(2360);
      for (const other of first.actors) if (other.id !== actor.id) expect(Math.abs(actor.position.x - other.position.x)).toBeGreaterThanOrEqual(60);
    }
  });
  it("offers low-health prey before the normal cadence and never activates infantry during warning", () => {
    const director = new SpawnDirector();
    const input = { tick: 1, actors: [], playerPosition: { x: 2200, y: 180 }, playerHealth: 20, band: 0 as const, cameraHalfWidth: 600, surfaceY: 0 };
    const commands = director.step(input, new RandomSource(1).stream("spawn"));
    expect(commands[0]?.definitionId).toBe("actor.prey");
    expect(commands[0]?.position.x).toBeLessThan(1540);
  });
});
