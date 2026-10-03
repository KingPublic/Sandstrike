import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { controlReadiness } from "../../src/game/ui/ControlReadiness";

const pressed = Object.freeze({ held: true, pressed: true, released: false });

it("reports a spent Burst as not ready until its cooldown ends", () => {
  const run = new GameSession({ mode: "rampage", arcade: true, seed: 3, movement: arcadeMovementBalance, terrain: new FlatTerrainProfile(0) });
  expect(controlReadiness(run.snapshot()).boost).toBe(1);
  const burst = run.step({ ...neutralActionFrame(1), boost: pressed });
  expect(controlReadiness(burst.snapshot).boost).toBe(0);
  for (let tick = 2; tick <= 120; tick++) run.step(neutralActionFrame(tick));
  expect(controlReadiness(run.snapshot()).boost).toBe(1);
});

it("reports a spent dodge and skill as not ready in Hunt", () => {
  const run = new RunFactory("readiness").create({ seed: 5, mode: "hunt" });
  expect(controlReadiness(run.snapshot())).toEqual({ boost: 1, ability: 1, primary: 1 });
  const frame = run.step({ ...neutralActionFrame(1), boost: pressed, ability: pressed });
  const ready = controlReadiness(frame.snapshot);
  expect(ready.boost).toBeLessThan(0.1);
  expect(ready.ability).toBeLessThan(0.1);
  expect(ready.primary).toBe(1);
});

it("fills the rifle gauge while the magazine reloads", () => {
  const run = new RunFactory("readiness").create({ seed: 5, mode: "hunt" });
  for (let tick = 1; tick <= 400; tick++) {
    const frame = run.step({ ...neutralActionFrame(tick), aimY: -1, primary: { held: true, pressed: tick === 1, released: false } });
    const ready = controlReadiness(frame.snapshot);
    expect(ready.primary).toBeGreaterThanOrEqual(0);
    expect(ready.primary).toBeLessThanOrEqual(1);
    if ((frame.snapshot.hunt?.rifle.reloadUntilTick ?? 0) > frame.snapshot.tick) {
      expect(ready.primary).toBeLessThan(1);
      return;
    }
  }
  throw new Error("The rifle never started reloading.");
});
