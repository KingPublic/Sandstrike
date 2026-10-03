import { expect, it } from "vitest";
import { ThreatDirector } from "../../src/game/domain/spawning/ThreatDirector";
import { SpawnDirector } from "../../src/game/domain/spawning/SpawnDirector";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
it("warns sequentially across all bands even after a large score jump", () => {
  const director = new ThreatDirector();
  expect(director.step({ tick: 1, basePoints: 99999 }, []).band).toBe(0);
  expect(director.step({ tick: 120, basePoints: 99999 }, []).band).toBe(0);
  expect(director.step({ tick: 121, basePoints: 99999 }, []).band).toBe(1);
  expect(director.step({ tick: 122, basePoints: 99999 }, []).warningTicksRemaining).toBe(120);
  expect(director.step({ tick: 242, basePoints: 99999 }, []).band).toBe(2);
  expect(director.step({ tick: 243, basePoints: 99999 }, []).warningTicksRemaining).toBe(120);
  expect(director.step({ tick: 363, basePoints: 99999 }, []).band).toBe(3);
});
it("introduces vehicles at band 2 and aerial pressure only at band 3", () => {
  const director = new SpawnDirector(), random = new RandomSource(88).stream("spawn");
  const commands = [];
  for (let tick = 1; tick <= 3000; tick++) commands.push(...director.step({ tick, actors: [], playerPosition: { x: 0, y: 180 }, playerHealth: 100, band: 3, cameraHalfWidth: 600, surfaceY: 0 }, random));
  expect(commands.some(c => c.definitionId === "actor.vehicle")).toBe(true); expect(commands.some(c => c.definitionId === "actor.aerial")).toBe(true);
});
