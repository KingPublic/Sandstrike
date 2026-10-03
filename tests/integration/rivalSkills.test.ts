import { expect, it } from "vitest";
import { RivalSystems } from "../../src/game/domain/rivals/RivalSystems";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { movementBalance } from "../../src/game/data/movementBalance";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";

const baseWorm = new WormLocomotion(movementBalance).snapshot();
const hidden = { ...baseWorm, head: { ...baseWorm.head, position: { x: 0, y: 700 } } };
const exposed = { ...baseWorm, phase: "airborne" as const, head: { ...baseWorm.head, position: { x: 0, y: -120 }, velocity: { x: 150, y: -100 } } };

function deployThrough(lastTick: number) {
  const bots = new RivalSystems(new FlatTerrainProfile(0)), registry = new ActorRegistry(), random = new RandomSource(4).stream("bots");
  for (const tick of [1, 900, 2100, 3600, 5400]) {
    if (tick > lastTick) break;
    bots.step(registry, hidden, tick, random); registry.commit();
    if (tick < lastTick) for (const actor of registry.snapshot()) if (actor.id.startsWith("rival.")) registry.update({ ...actor, health: 0 });
  }
  return { bots, registry, random };
}

it("Ranger marks exposed Maw and fires real kit rounds with coordinated damage", () => {
  const bots = new RivalSystems(new FlatTerrainProfile(0)), registry = new ActorRegistry(), random = new RandomSource(1).stream("bots");
  bots.step(registry, hidden, 1, random); registry.commit();
  const frame = bots.step(registry, exposed, 42, random);
  expect(frame.events.some(e => e.type === "ability-activated" && e.abilityId === "skill.target-mark")).toBe(true);
  expect(frame.fires[0]?.weaponId).toBe("rifle"); expect(frame.fires[0]?.damage).toBe(12);
  expect(frame.fires[0]?.to.x).toBeGreaterThan(exposed.head.position.x);
});

it("Scout really grapples to a reachable upper floor and observes cooldown", () => {
  const bots = new RivalSystems(new FlatTerrainProfile(0)), registry = new ActorRegistry(), random = new RandomSource(2).stream("bots");
  bots.step(registry, hidden, 1, random); registry.commit();
  bots.step(registry, hidden, 900, random); registry.commit();
  const before = registry.get("rival.scout")?.position.y ?? 0;
  const frame = bots.step(registry, hidden, 901, random);
  expect(frame.events.some(e => e.type === "ability-activated" && e.actorId === "rival.scout" && e.abilityId === "skill.grapple")).toBe(true);
  expect(registry.get("rival.scout")?.position.y).toBeLessThan(before - 60);
  expect(bots.snapshot(registry).units.find(u => u.hunterId === "scout")?.skill?.ability.cooldownTicksRemaining).toBe(720);
});

it("a rooftop bot actually collects the RPG, delays its first shot, and loses it to burial", () => {
  let surface = -1530;
  const bots = new RivalSystems({ surfaceY: () => surface }), registry = new ActorRegistry(), random = new RandomSource(3).stream("bots");
  let pickupTick = 0;
  for (let tick = 1; tick <= 90; tick++) {
    const frame = bots.step(registry, hidden, tick, random); registry.commit();
    if (frame.events.some(e => e.type === "ability-activated" && e.abilityId === "ability.rpg-pickup")) { pickupTick = tick; break; }
  }
  expect(pickupTick).toBeGreaterThan(0); expect(bots.snapshot(registry).armed).toBe(1);
  const visible = { ...exposed, head: { ...exposed.head, position: { x: 300, y: -1700 } } };
  expect(bots.step(registry, visible, pickupTick + 1, random).fires).toHaveLength(0);
  expect(bots.step(registry, visible, pickupTick + 46, random).fires[0]?.heavy).toBe(true);
  surface = -1700;
  bots.step(registry, hidden, pickupTick + 47, random);
  expect(bots.snapshot(registry).armed).toBe(0);
});

it("Engineer deploys a persistent visible beacon against an approaching worm", () => {
  const { bots, registry, random } = deployThrough(2100);
  const frame = bots.step(registry, exposed, 2101, random);
  expect(frame.events.some(e => e.type === "ability-activated" && e.abilityId === "skill.decoy")).toBe(true);
  expect(bots.snapshot(registry).units.find(u => u.hunterId === "engineer")?.skill?.decoy).toBeDefined();
});

it("Siegebreaker activates real protection and Medic heals once without health being overwritten", () => {
  const shield = deployThrough(3600);
  shield.bots.step(shield.registry, exposed, 3601, shield.random);
  expect(shield.registry.get("rival.siegebreaker")?.invulnerableUntilTick).toBe(3781);
  const medic = deployThrough(5400), actor = medic.registry.get("rival.field-medic");
  if (!actor) throw new Error("Missing Medic");
  medic.registry.update({ ...actor, health: 50 });
  medic.bots.step(medic.registry, hidden, 5401, medic.random);
  expect(medic.registry.get(actor.id)?.health).toBe(80);
  medic.bots.step(medic.registry, hidden, 5402, medic.random);
  expect(medic.registry.get(actor.id)?.health).toBe(80);
});
