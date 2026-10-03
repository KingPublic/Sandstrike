import { describe, expect, it } from "vitest";
import { InfantryController } from "../../src/game/domain/ai/InfantryController";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import type { PerceptionSnapshot } from "../../src/game/domain/ai/PerceptionSnapshot";

function perception(x = 300, tick = 1): PerceptionSnapshot {
  return Object.freeze({ selfId: "soldier", selfPosition: { x: 0, y: -16 }, visibleTarget: { id: "worm", position: { x, y: -20 } }, recentTarget: undefined, tick });
}

describe("infantry perception FSM", () => {
  it("telegraphs every shot, locks perceived aim and enforces dwell/cadence", () => {
    const controller = new InfantryController();
    const random = new RandomSource(1).stream("ai.soldier");
    const shots: number[] = [];
    const telegraphs: number[] = [];
    for (let tick = 1; tick < 400; tick += 1) {
      const previousState = controller.snapshot().state;
      const decision = controller.step(perception(tick < 10 ? 300 : 999, tick), tick, random);
      if (decision.state === "telegraph" && previousState !== "telegraph") telegraphs.push(tick);
      if (decision.fire) {
        shots.push(tick);
        expect(decision.aimPoint).toBeDefined();
        expect(tick - (telegraphs.at(-1) ?? tick)).toBeGreaterThanOrEqual(36);
      }
      if (tick === 20) expect(decision.aimPoint?.x).toBe(300);
    }
    expect(shots.length).toBeGreaterThan(2);
    expect((shots[1] ?? 0) - (shots[0] ?? 0)).toBeGreaterThanOrEqual(90);
  });
  it("repositions laterally and ignores absent/expired knowledge", () => {
    const controller = new InfantryController();
    const random = new RandomSource(5).stream("ai");
    const close = controller.step(perception(40), 1, random);
    expect(close.state).toBe("reposition");
    expect(close.moveX).toBeLessThan(0);
    const hidden = new InfantryController().step({ selfId: "soldier", selfPosition: { x: 0, y: -16 }, visibleTarget: undefined, recentTarget: { position: { x: 500, y: -20 }, observedTick: 1 }, tick: 200 }, 200, random);
    expect(hidden.fire).toBe(false);
    expect(hidden.aimPoint).toBeUndefined();
  });
  it("produces identical immutable decisions from equal perception history", () => {
    const first = new InfantryController();
    const second = new InfantryController();
    const a = new RandomSource(7).stream("ai");
    const b = new RandomSource(7).stream("ai");
    for (let tick = 1; tick < 180; tick += 1) {
      expect(first.step(perception(0, tick), tick, a)).toEqual(second.step(perception(0, tick), tick, b));
    }
    expect(Object.isFrozen(first.snapshot())).toBe(true);
  });
});
