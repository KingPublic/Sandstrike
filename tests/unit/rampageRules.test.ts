import { describe, expect, it } from "vitest";
import { RampageRules } from "../../src/game/domain/modes/RampageRules";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";

function snapshot(health = 100) { return new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), playerHealth: health }).snapshot(); }
describe("one authoritative Rampage result", () => {
  it("prioritizes defeat over same-boundary exit and never emits a second result", () => {
    const rules = new RampageRules();
    const frame = { ...snapshot(0), tick: 120, score: { points: 500, basePoints: 350, preyConsumed: 1, infantryDestroyed: 1 } };
    const request = { type: "RequestEnd" as const, reason: "player-ended" as const, requestedTick: 120 };
    const first = rules.observe(frame, [{ type: "actor-healed", tick: 10, actorId: "worm", amount: 8, position: { x: 0, y: 0 } }], [request]);
    expect(first.result).toMatchObject({ reason: "defeated", score: 500, durationSeconds: 2, preyConsumed: 1, infantryDestroyed: 1, healthRecovered: 8 });
    expect(first.events.filter((event) => event.type === "run-ended")).toHaveLength(1);
    expect(Object.isFrozen(first.result)).toBe(true);
    expect(rules.observe(frame, [], [request]).events).toHaveLength(0);
  });
  it("ends only for zero health or a confirmed command", () => {
    const rules = new RampageRules();
    expect(rules.observe({ ...snapshot(), tick: 99_999 }, [], []).result).toBeUndefined();
    expect(rules.observe(snapshot(), [], [{ type: "RequestEnd", reason: "player-ended", requestedTick: 0 }]).result?.reason).toBe("player-ended");
  });
});
