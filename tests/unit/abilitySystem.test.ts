import { describe, expect, it } from "vitest";
import { AbilitySystem } from "../../src/game/domain/abilities/AbilitySystem";
import { abilities } from "../../src/game/data/abilities";

describe("AbilitySystem", () => {
  it("activates Bite only on an edge with a six-tick window and 24-tick cooldown", () => {
    const system = new AbilitySystem(abilities.bite, ["worm"]);
    expect(system.step(1, false).activated).toBe(false);
    expect(system.step(2, true).activated).toBe(true);
    expect(system.step(7, true).state.active).toBe(true);
    expect(system.step(8, true).state.active).toBe(false);
    expect(system.step(25, true).activated).toBe(false);
    expect(system.step(26, true).activated).toBe(true);
    expect(system.contactProfile({ x: 0, y: -1 }).shape).toMatchObject({ kind: "circle", radius: 34, offset: { x: 0, y: -20 } });
  });

  it("rejects incompatible owners, strategies and invalid numeric definitions", () => {
    expect(() => new AbilitySystem(abilities.bite, ["human"])).toThrow();
    expect(() => new AbilitySystem({ ...abilities.bite, strategyId: "missing" }, ["worm"])).toThrow();
    expect(() => new AbilitySystem({ ...abilities.bite, cooldownTicks: -1 }, ["worm"])).toThrow();
    expect(Object.isFrozen(new AbilitySystem(abilities.bite, ["worm"]).snapshot(1))).toBe(true);
  });
});
