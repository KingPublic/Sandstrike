import { expect, it } from "vitest";
import { characters, characterForRole } from "../../src/game/data/characters";
import { CharacterSkills, type SkillContext } from "../../src/game/domain/abilities/CharacterSkills";
import { spawnActor } from "../../src/game/data/actors";

function required(id: string) { const character = characters.find(c => c.id === id); if (!character) throw new Error("Missing kit."); return character; }
const hunter = spawnActor("hunter", "actor.hunter", { x: 0, y: -16 });
const worm = spawnActor("worm", "actor.worm", { x: 0, y: -10 });
function context(tick = 1, pressed = true, owner = hunter): SkillContext {
  return { tick, pressed, owner, actors: [owner], direction: { x: 1, y: 0 }, phase: "underground", surfaceY: 0, platforms: [] };
}
it("defines five worms and five Hunters with distinct skills and real weapons", () => {
  expect(characters.filter(c => c.role === "worm")).toHaveLength(5);
  expect(characters.filter(c => c.role === "hunter")).toHaveLength(5);
  expect(new Set(characters.map(c => c.skill.id)).size).toBe(10);
  expect(characterForRole("rampage", "ranger")).toBeUndefined();
});
it("shield expires in three seconds and repeated taps cannot extend it", () => {
  const kit = new CharacterSkills(required("siegebreaker"));
  expect(kit.step(context()).invulnerableUntilTick).toBe(181);
  expect(kit.step(context(20)).ability.activeUntilTick).toBe(181);
  expect(kit.step(context(181, false)).ability.active).toBe(false);
});
it("medic heals 30 only to living nearby friendly actors", () => {
  const kit = new CharacterSkills(required("field-medic"));
  const self = { ...hunter, health: 40 }, ally = { ...spawnActor("ally", "actor.ally", { x: 100, y: -16 }), health: 10 };
  const dead = { ...ally, id: "dead", health: 0 }, enemy = spawnActor("enemy", "actor.infantry", { x: 5, y: -16 });
  const frame = kit.step({ ...context(1, true, self), actors: [self, ally, dead, enemy] });
  expect(frame.heals).toEqual([{ actorId: "hunter", amount: 30 }, { actorId: "ally", amount: 30 }]);
});
it("grapple accepts a visible reachable ledge and rejects intervening geometry", () => {
  const scout = required("scout");
  const goal = { id: "goal", left: 50, right: 150, y: -160 };
  expect(new CharacterSkills(scout).step({ ...context(), platforms: [goal] }).grapple).toBeDefined();
  const blocker = { id: "block", left: -100, right: 200, y: -80 };
  expect(new CharacterSkills(scout).step({ ...context(), platforms: [goal, blocker] }).grapple?.y).not.toBe(goal.y - 16);
});
it.each(["cinder-wyrm", "rift-spitter"] as const)("%s emits finite bounded projectiles and clears them on owner death", id => {
  const kit = new CharacterSkills(required(id));
  expect(kit.step(context(1, true, worm)).projectiles).toHaveLength(3);
  const frame = kit.step(context(2, false, worm));
  expect(frame.projectiles.every(p => Number.isFinite(p.position.x + p.position.y))).toBe(true);
  expect(kit.step(context(3, false, { ...worm, health: 0 })).projectiles).toHaveLength(0);
});

it("venom hits a real enemy, deals bounded damage over time and expires", () => {
  const kit = new CharacterSkills(required("rift-spitter"));
  const enemy = spawnActor("target", "actor.infantry", { x: 90, y: -10 });
  const hits: { tick: number; amount: number; id: string }[] = [];
  for (let tick = 1; tick <= 220; tick++) {
    const frame = kit.step({ ...context(tick, tick === 1, worm), actors: [worm, enemy] });
    hits.push(...frame.damage.map(d => ({ tick, amount: d.amount, id: d.abilityId })));
  }
  expect(hits.some(h => h.id === "skill.venom" && h.amount === 8)).toBe(true);
  const poison = hits.filter(h => h.id === "skill.venom-dot");
  expect(poison).toHaveLength(3);
  expect(poison.every(h => h.amount === 4 && h.tick < 200)).toBe(true);
  expect(kit.snapshot(220).projectiles).toHaveLength(0);
});
it("mark and decoy expire; sky surge cuts thrust above building height", () => {
  const ranger = new CharacterSkills(required("ranger"));
  expect(ranger.step(context()).markUntilTick).toBe(241);
  expect(ranger.step(context(241, false)).markUntilTick).toBe(0);
  const engineer = new CharacterSkills(required("engineer"));
  expect(engineer.step(context()).decoy).toEqual({ x: 90, y: -16 });
  expect(engineer.step(context(301, false)).decoy).toBeUndefined();
  const storm = new CharacterSkills(required("storm-serpent"));
  expect(storm.step(context(1, true, worm)).motion?.liftAcceleration).toBeGreaterThan(0);
  expect(storm.step(context(2, false, { ...worm, position: { x: 0, y: -180 } })).motion?.liftAcceleration).toBe(0);
});
