import { describe, expect, it, vi } from "vitest";

import { movementBalance } from "../../src/game/data/movementBalance";
import { FixedStepRunner } from "../../src/game/domain/session/FixedStepRunner";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { MovementPipeline } from "../../src/game/domain/session/MovementPipeline";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { InputRouter } from "../../src/game/input/InputRouter";
import type {
  InputSource,
  PartialActionFrame,
} from "../../src/game/input/InputSource";

class HeldBurstInput implements InputSource {
  readonly id = "fixture";
  readonly sampledTicks: number[] = [];

  sample(tick: number): PartialActionFrame {
    this.sampledTicks.push(tick);
    return Object.freeze({
      moveY: -1,
      analogSequence: 1,
      buttons: Object.freeze({ boost: true }),
    });
  }

  clear(): void {
    this.sampledTicks.length = 0;
  }
}

describe("MovementPipeline catch-up", () => {
  it("samples each substep, preserves event order, and exposes only the final snapshot", () => {
    const source = new HeldBurstInput();
    const session = new GameSession({
      seed: 7,
      movement: {
        ...movementBalance,
        initialPosition: { x: 0, y: 8 },
        initialDirection: { x: 0, y: -1 },
        initialSpeed: movementBalance.cruiseSpeed,
      },
      terrain: new FlatTerrainProfile(0),
    });
    const pipeline = new MovementPipeline(
      new FixedStepRunner(),
      new InputRouter([source]),
      session,
    );
    const render = vi.fn();

    const frame = pipeline.advance((1000 / 60) * 3);
    render(frame.snapshot, frame.report.alpha);

    expect(source.sampledTicks).toEqual([1, 2, 3]);
    expect(frame.report.steps).toBe(3);
    expect(frame.snapshot.tick).toBe(3);
    expect(frame.events.map((event) => event.type)).toEqual([
      "worm-burst",
      "worm-breached",
      "worm-became-airborne",
    ]);
    expect(frame.events.filter((event) => event.type === "worm-burst")).toHaveLength(
      1,
    );
    expect(render).toHaveBeenCalledOnce();
    expect(render).toHaveBeenCalledWith(frame.snapshot, frame.report.alpha);
  });
});
