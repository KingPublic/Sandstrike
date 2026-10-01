import { describe, expect, it } from "vitest";
import { ScoreSystem } from "../../src/game/domain/scoring/ScoreSystem";
import { ComboSystem } from "../../src/game/domain/scoring/ComboSystem";
import { reward } from "../fixtures/rewards";

describe("typed scoring", () => {
  it("credits base values, variety and reduced repeat rewards once", () => {
    const score = new ScoreSystem();
    const combo = new ComboSystem().snapshot();
    expect(score.consume([reward("a")], combo).points).toBe(100);
    expect(score.consume([reward("b")], combo).points).toBe(50);
    expect(score.consume([reward("c", "infantry")], combo).points).toBe(312);
    expect(score.snapshot().basePoints).toBe(450);
    expect(score.consume([reward("c", "infantry"), { type: "actor-removed", tick: 2, actorId: "x", cause: "destroyed", position: { x: 0, y: 0 } }], combo).points).toBe(0);
  });
  it("rewards multiple targets in a breach and remains stable for reordered events", () => {
    const a = new ScoreSystem();
    const b = new ScoreSystem();
    const breach = { type: "worm-breached" as const, tick: 1, position: { x: 0, y: 0 } };
    const combo = new ComboSystem().snapshot();
    expect(a.consume([breach, reward("a"), reward("b", "infantry")], combo).points).toBe(475);
    expect(a.snapshot()).toEqual((b.consume([reward("b", "infantry"), breach, reward("a")], combo), b.snapshot()));
  });
});
