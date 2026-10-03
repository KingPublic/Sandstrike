import { expect, it } from "vitest";
import { SkillCrates, skillCrateBalance } from "../../src/game/domain/hunt/SkillCrates";
import { RandomSource, type RandomStream } from "../../src/game/domain/random/RandomSource";
import { spawnActor } from "../../src/game/data/actors";
import { characters, type HunterId } from "../../src/game/data/characters";
import type { SkillContext } from "../../src/game/domain/abilities/CharacterSkills";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import { applySkillEffects } from "../../src/game/domain/abilities/ApplySkillEffects";

const base = { id: "base", left: -1000, right: 1000, y: 0 };
const platforms = [{ id: "base", left: -1000, right: 1000, y: 0 }, { id: "ledge", left: -100, right: 100, y: -90 }];
const owner = spawnActor("hunter", "actor.hunter", { x: 0, y: -16 });
function random(choice = 0, position = .5): RandomStream {
  let calls = 0;
  return { float: () => position, integer: () => ++calls % 2 === 1 ? 0 : choice };
}
function context(tick: number, pressed = true): SkillContext { return { tick, pressed, owner, actors: [owner], direction: { x: 1, y: 0 }, phase: "hunter", surfaceY: 200, platforms }; }

it("draws only the four other kits, consumes one charge and preserves full-slot crates", () => {
  for (const selected of characters.filter(c => c.role === "hunter")) {
    for (let choice = 0; choice < 4; choice++) {
      const supplies = new SkillCrates(platforms, selected.id as HunterId);
      const pickup = supplies.step(owner, 1, 200, random(choice));
      expect(pickup?.characterId).not.toBe(selected.id);
      expect(pickup).toBeDefined();
      const frame = supplies.use(context(2));
      expect(frame?.activated).toBe(true);
      expect(supplies.snapshot(2).stored).toBeUndefined();
      expect(supplies.use(context(3))?.activated).toBe(false);
      expect(supplies.use(context(500))).toBeUndefined();
    }
  }
  const supplies = new SkillCrates(platforms, "scout");
  supplies.step(owner, 1, 200, random());
  expect(supplies.step(owner, 1081, 200, random())).toBeUndefined();
  expect(supplies.snapshot(1081).crates).toHaveLength(1);
  supplies.use(context(1082));
  expect(supplies.step(owner, 1500, 200, random())).toBeDefined();
});

it("keeps failed grapples, applies borrowed shield/heal/decoy/mark and ends their effects", () => {
  const shield = new SkillCrates(platforms, "scout");
  shield.step(owner, 1, 200, random(1));
  const frame = shield.use(context(2));
  expect(frame?.invulnerableUntilTick).toBe(182);
  const registry = new ActorRegistry([owner]);
  if (frame) applySkillEffects(registry, owner.id, frame);
  expect(registry.get(owner.id)?.invulnerableUntilTick).toBe(182);
  expect(shield.snapshot(182).active).toBeUndefined();
  const heal = new SkillCrates(platforms, "scout");
  heal.step(owner, 1, 200, random(3));
  const wounded = { ...owner, health: 45 };
  const healed = heal.use({ ...context(2), owner: wounded, actors: [wounded, { ...owner, id: "dead", health: 0 }] });
  expect(healed?.heals).toEqual([{ actorId: "hunter", amount: 30 }]);
  const decoy = new SkillCrates(platforms, "scout"); decoy.step(owner, 1, 200, random(2));
  expect(decoy.use(context(2))?.decoy).toEqual({ x: -120, y: -16 });
  expect(decoy.use(context(302, false))?.decoy).toBeUndefined();
  const mark = new SkillCrates(platforms, "scout"); mark.step(owner, 1, 200, random(0));
  expect(mark.use(context(2))?.markUntilTick).toBe(242);
  const grapple = new SkillCrates([base], "ranger"); grapple.step(owner, 1, 200, random(1));
  expect(grapple.use({ ...context(2), platforms: [] })).toBeUndefined();
  expect(grapple.snapshot(2).stored?.characterId).toBe("scout");
  expect(grapple.use(context(3))?.grapple).toEqual({ x: 0, y: -106 });
});

it("spawns deterministically on safe platforms, stays bounded and excludes dead pickup", () => {
  const a = new SkillCrates(platforms, "scout"), b = new SkillCrates(platforms, "scout");
  a.step(owner, 1, 200, new RandomSource(33).stream("supplies"));
  b.step(owner, 1, 200, new RandomSource(33).stream("supplies"));
  expect(a.snapshot(1)).toEqual(b.snapshot(1));
  const supplies = new SkillCrates([base], "scout");
  for (let tick = 1; tick <= 10800; tick += 1080) supplies.step(owner, tick, 200, random(0, 1));
  expect(supplies.snapshot(10800).crates).toHaveLength(skillCrateBalance.capacity);
  const crate = supplies.snapshot(10800).crates[0];
  if (!crate) throw new Error("Missing supply");
  expect(supplies.step({ ...owner, position: crate.position, health: 0 }, 10801, 200, random())).toBeUndefined();
  expect(supplies.step(owner, 10802, -20, random())).toBeUndefined();
  expect(supplies.snapshot(10802).crates).toHaveLength(0);
});
