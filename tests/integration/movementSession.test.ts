import { describe, expect, it } from "vitest";

import { movementBalance } from "../../src/game/data/movementBalance";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import {
  neutralActionFrame,
  type ActionFrame,
} from "../../src/game/input/ActionFrame";

function scriptedAction(tick: number): ActionFrame {
  const neutral = neutralActionFrame(tick);
  return Object.freeze({
    ...neutral,
    moveX: Math.sin(tick / 24) * 0.25,
    moveY: tick < 70 ? -1 : 0.7,
    boost: Object.freeze({
      held: tick === 12,
      pressed: tick === 12,
      released: tick === 13,
    }),
  });
}

function runFixture(): {
  readonly snapshots: readonly unknown[];
  readonly events: readonly unknown[];
} {
  const session = new GameSession({
    seed: 0x51a7,
    movement: {
      ...movementBalance,
      initialPosition: { x: 0, y: 24 },
      initialDirection: { x: 0, y: -1 },
      initialSpeed: movementBalance.cruiseSpeed,
    },
    terrain: new FlatTerrainProfile(0),
  });
  const snapshots: unknown[] = [];
  const events: unknown[] = [];

  for (let tick = 1; tick <= 180; tick += 1) {
    const result = session.step(scriptedAction(tick));
    snapshots.push(result.snapshot);
    events.push(...result.events);
  }

  return Object.freeze({
    snapshots: Object.freeze(snapshots),
    events: Object.freeze(events),
  });
}

describe("GameSession deterministic movement", () => {
  it("replays head, followers, phases, ticks, and ordered events exactly", () => {
    const first = runFixture();
    const second = runFixture();

    expect(first).toEqual(second);
    expect(first.snapshots).toHaveLength(180);
    expect(first.events.length).toBeGreaterThan(0);
    expect(Object.isFrozen(first.snapshots.at(-1))).toBe(true);
  });

  it("keeps domain source independent from rendering and browser APIs", () => {
    const domainSources = import.meta.glob<string>(
      "../../src/game/domain/**/*.ts",
      {
        eager: true,
        import: "default",
        query: "?raw",
      },
    );

    for (const [file, source] of Object.entries(domainSources)) {
      expect(source, file).not.toMatch(
        /(?:from\s+["'][^"']*(?:rendering|phaser)|\b(?:window|document|localStorage)\b)/u,
      );
    }
  });
});
