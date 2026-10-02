import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { DamageResolver } from "../../src/game/domain/combat/DamageResolver";

it("the rooftop trigger fires the equipped RPG once without spending rifle ammunition", () => {
  const run = new RunFactory("weapon-owner").create({ seed: 1, mode: "hunt", fixtureId: "ascent-boss" });
  const frame = run.step({ ...neutralActionFrame(1), aimX: 1, primary: { held: true, pressed: true, released: false } });
  expect(frame.snapshot.hunt?.rpg.owned).toBe(true);
  expect(frame.snapshot.hunt?.rifle.ammo).toBe(6);
  expect(frame.snapshot.hunt?.shotsFired).toBe(1);
});
it("ordinary enemy hit recovery does not eat a following RPG hit; explicit shield still blocks", () => {
  const run = new RunFactory("damage").create({ seed: 1, mode: "hunt" });
  const target = run.snapshot().actors.find(a => a.id === "worm"); if (!target) throw new Error("Missing worm.");
  const resolver = new DamageResolver();
  const command = { sourceId: "hunter", targetId: "worm", abilityId: "ability.rifle", tick: 1, amount: 8, tags: ["rifle"], priority: 0 };
  const first = resolver.resolve(target, command).actor;
  expect(resolver.resolve(first, { ...command, tick: 2, amount: 80, tags: ["rpg"] }).applied).toBe(80);
  expect(resolver.resolve({ ...first, invulnerableUntilTick: 181 }, { ...command, tick: 2, amount: 80, tags: ["rpg"] }).applied).toBe(0);
});

it("the starting firearm stays usable while the RPG reloads without double firing", () => {
  const run = new RunFactory("fallback").create({ seed: 1, mode: "hunt", fixtureId: "ascent-boss", characterId: "engineer" });
  const fire = (tick: number) => run.step({ ...neutralActionFrame(tick), aimX: 1, primary: { held: true, pressed: tick === 1, released: false } });
  let frame = fire(1);
  for (let tick = 2; tick <= 85; tick++) frame = fire(tick);
  expect(frame.snapshot.hunt?.rpg.reloading).toBe(true);
  expect(frame.snapshot.hunt?.rifle.ammo).toBeLessThan(12);
});
