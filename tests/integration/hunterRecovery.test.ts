import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it("ascent dodge grants protection only for its movement window", () => {
  const run = new RunFactory("dodge-recovery").create({ seed: 33, mode: "hunt" });
  run.step({ ...neutralActionFrame(1), boost: { pressed: true, held: true, released: false } });
  const player = run.snapshot().actors.find(a => a.id === "hunter");
  const until = run.snapshot().hunt?.hunter.dodgeUntilTick ?? 0;
  expect(player?.hitInvulnerabilityTicks).toBe(60);
  expect(player?.invulnerableUntilTick).toBe(until);
  expect(until).toBe(13);
  for (let tick = 2; tick <= until; tick++) run.step(neutralActionFrame(tick));
  expect(run.snapshot().actors.find(a => a.id === "hunter")?.invulnerableUntilTick).toBeLessThanOrEqual(run.tick);
});
