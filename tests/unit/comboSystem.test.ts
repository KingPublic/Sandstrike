import { describe, expect, it } from "vitest";
import { ComboSystem } from "../../src/game/domain/scoring/ComboSystem";
import { reward } from "../fixtures/rewards";

describe("combo credit and expiry", () => {
  it("reduces repeat category credit, rewards variety and caps multiplier", () => {
    const combo = new ComboSystem();
    expect(combo.step([reward("a")], 1).chain).toBe(1);
    expect(combo.step([reward("b")], 2).chain).toBe(1.5);
    expect(combo.step([reward("c", "infantry")], 3).chain).toBe(2.5);
    expect(combo.step([reward("d")], 4).multiplier).toBe(2);
    for (let tick = 5; tick < 20; tick += 1) combo.step([reward(`x${String(tick)}`, tick % 2 ? "infantry" : "prey", tick)], tick);
    expect(combo.snapshot().multiplier).toBe(3);
    expect(combo.snapshot().maximumChain).toBeGreaterThanOrEqual(6);
  });
  it("preserves 180 grace ticks, then visibly decays for 45 ticks", () => {
    const combo = new ComboSystem();
    combo.step([reward("a")], 1);
    expect(combo.step([], 181).phase).toBe("grace");
    expect(combo.step([], 182).phase).toBe("decay");
    expect(combo.step([], 225).chain).toBe(1);
    expect(combo.step([], 226).chain).toBe(0);
    expect(combo.snapshot().maximumChain).toBe(1);
  });
  it("deduplicates targets and orders simultaneous causes independently of input order", () => {
    const a = new ComboSystem();
    const b = new ComboSystem();
    expect(a.step([reward("b", "infantry"), reward("a")], 1)).toEqual(b.step([reward("a"), reward("b", "infantry")], 1));
    expect(a.step([reward("a")], 2).chain).toBe(2);
    expect(a.step([], 2)).toEqual(a.snapshot());
  });
});
