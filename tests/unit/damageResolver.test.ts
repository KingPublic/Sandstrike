import { describe, expect, it } from "vitest";
import { DamageResolver, impactDamage, type DamageCommand } from "../../src/game/domain/combat/DamageResolver";
import { clampHealth, healHealth } from "../../src/game/domain/combat/Health";
import { actor } from "../fixtures/actors";

const command: DamageCommand = { sourceId: "worm", targetId: "target", abilityId: "ability.bite", tick: 2, amount: 15, tags: ["bite"], priority: 1 };

describe("damage and health", () => {
  it("protects configured Hunter recovery until expiry without changing ordinary targets", () => {
    const resolver = new DamageResolver();
    const first = resolver.resolve({ ...actor("hunter"), health: 100, maxHealth: 100, hitInvulnerabilityTicks: 60 }, command);
    expect(first.actor.health).toBe(85);
    expect(resolver.resolve(first.actor, { ...command, tick: 61 }).applied).toBe(0);
    expect(resolver.resolve(first.actor, { ...command, tick: 62 }).applied).toBe(15);
    expect(resolver.resolve(actor("ordinary"), command).actor.invulnerableUntilTick).toBe(0);
  });
  it("uses bounded speed-scaled impact damage", () => {
    expect(impactDamage(219)).toBe(0);
    expect(impactDamage(220)).toBe(10);
    expect(impactDamage(340)).toBe(25);
    expect(impactDamage(460)).toBe(40);
    expect(impactDamage(900)).toBe(40);
  });
  it("routes armor/tags, clamps health and honors tick invulnerability", () => {
    const resolver = new DamageResolver();
    const target = { ...actor("target"), armor: 7 };
    expect(resolver.resolve(target, command).actor.health).toBe(2);
    expect(resolver.resolve(target, { ...command, tags: ["armor-piercing"] }).actor.health).toBe(0);
    expect(resolver.resolve({ ...target, armor: 20 }, command).blocked).toBe("armor");
    expect(resolver.resolve({ ...target, invulnerableUntilTick: 3 }, command).blocked).toBe("invulnerable");
    expect(resolver.resolve({ ...target, invulnerableUntilTick: 2 }, command).applied).toBe(8);
    expect(clampHealth(-10, 100)).toBe(0);
    expect(healHealth(98, 8, 100)).toEqual({ health: 100, recovered: 2 });
    expect(() => clampHealth(Number.NaN, 100)).toThrow(RangeError);
  });
  it("keeps source and cause metadata immutable", () => {
    const result = new DamageResolver().resolve(actor("target"), command);
    expect(result.command).toEqual(command);
    expect(Object.isFrozen(result.command.tags)).toBe(true);
    expect(result.actor.health).toBe(0);
  });
});
