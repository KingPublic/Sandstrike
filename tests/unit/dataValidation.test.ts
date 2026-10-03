import { describe, expect, it } from "vitest";
import { validateDefinitions } from "../../src/game/data/validateDefinitions";
import { actorDefinitions } from "../../src/game/data/actors";
import { abilities } from "../../src/game/data/abilities";
import { modes } from "../../src/game/data/modes";

const valid = () => ({ actors: actorDefinitions, abilities: [abilities.bite], mode: modes.rampage });
describe("run definition validation", () => {
  it("copies and freezes validated definitions", () => {
    const data = validateDefinitions(valid());
    expect(Object.isFrozen(data.mode.spawnRules)).toBe(true);
    expect(data.actors).not.toBe(actorDefinitions);
  });
  it("rejects duplicate IDs, missing references and role-incompatible abilities", () => {
    const first = actorDefinitions[0];
    if (!first) throw new Error("Fixture missing actor.");
    expect(() => validateDefinitions({ ...valid(), actors: [...actorDefinitions, first] })).toThrow();
    expect(() => validateDefinitions({ ...valid(), mode: { ...modes.rampage, abilityIds: ["absent"] } })).toThrow();
    expect(() => validateDefinitions({ ...valid(), mode: { ...modes.rampage, playerTags: ["hunter"] } })).toThrow();
  });
  it("rejects unsafe geometry, masks, health, weights, caps and timing", () => {
    const first = actorDefinitions[0];
    if (!first) throw new Error("Fixture missing actor.");
    for (const invalid of [{ ...first, health: -1 }, { ...first, collision: { ...first.collision, mask: 64 } }, { ...first, collision: { ...first.collision, shape: { kind: "circle" as const, radius: -1 } } }]) expect(() => validateDefinitions({ ...valid(), actors: [invalid, ...actorDefinitions.slice(1)] })).toThrow();
    const rule = modes.rampage.spawnRules[0];
    if (!rule) throw new Error("Fixture missing spawn.");
    for (const patch of [{ weight: 0 }, { cap: -1 }, { definitionId: "absent" }]) expect(() => validateDefinitions({ ...valid(), mode: { ...modes.rampage, spawnRules: [{ ...rule, ...patch }] } })).toThrow();
    expect(() => validateDefinitions({ ...valid(), mode: { ...modes.rampage, warningTicks: NaN } })).toThrow();
  });
});
