import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it("Scout walks into a supply, uses the borrowed shield once with E and retains Q grapple", () => {
  const seed = Array.from({ length: 100 }, (_, i) => i + 1).find(value => { const r = new RandomSource(value).stream("supplies"); return r.integer(0, 2) === 0 && r.integer(0, 3) === 1; });
  expect(seed).toBeDefined();
  const run = new RunFactory("supply").create({ mode: "hunt", seed: seed ?? 1, characterId: "scout" });
  run.step(neutralActionFrame(1));
  const crate = run.snapshot().hunt?.supplies?.crates[0];
  expect(crate).toBeDefined();
  if (!crate) throw new Error("Missing opening crate");
  for (let tick = 2; tick < 200 && !run.snapshot().hunt?.supplies?.stored; tick++) {
    const player = run.snapshot().hunt?.hunter.position ?? { x: 0, y: -16 };
    run.step({ ...neutralActionFrame(tick), moveX: Math.sign(crate.position.x - player.x) });
  }
  expect(run.snapshot().hunt?.supplies?.stored?.characterId).toBe("siegebreaker");
  const activated = run.step({ ...neutralActionFrame(run.nextTick), interact: { held: true, pressed: true, released: false } });
  expect(activated.events.some(e => e.type === "ability-activated" && e.abilityId === "skill.shield")).toBe(true);
  expect(activated.snapshot.skill?.ability.id).toBe("skill.grapple");
  expect(activated.snapshot.skill?.ability.cooldownTicksRemaining).toBe(0);
  const expiry = activated.snapshot.actors.find(a => a.id === "hunter")?.invulnerableUntilTick;
  for (let i = 0; i < 10; i++) run.step({ ...neutralActionFrame(run.nextTick), interact: { held: true, pressed: true, released: false } });
  expect(run.snapshot().hunt?.supplies?.stored).toBeUndefined();
  expect(run.snapshot().actors.find(a => a.id === "hunter")?.invulnerableUntilTick).toBe(expiry);
});

it("borrowed Attract Maw produces the same real beacon pursuit while Ranger retains its mark", () => {
  const seed = Array.from({ length: 100 }, (_, i) => i + 1).find(value => { const r = new RandomSource(value).stream("supplies"); return r.integer(0, 2) === 0 && r.integer(0, 3) === 2; });
  const run = new RunFactory("borrowed-beacon").create({ mode: "hunt", seed: seed ?? 1, characterId: "ranger", debugAI: true });
  run.step(neutralActionFrame(1));
  const crate = run.snapshot().hunt?.supplies?.crates[0];
  if (!crate) throw new Error("Missing opening crate");
  for (let tick = 2; tick < 240 && !run.snapshot().hunt?.supplies?.stored; tick++) {
    const player = run.snapshot().hunt?.hunter.position;
    run.step({ ...neutralActionFrame(tick), moveX: Math.sign(crate.position.x - (player?.x ?? 0)) });
  }
  expect(run.snapshot().hunt?.supplies?.stored?.characterId).toBe("engineer");
  run.step({ ...neutralActionFrame(run.nextTick), interact: { held: true, pressed: true, released: false } });
  const beacon = run.snapshot().hunt?.supplies?.active?.skill.decoy;
  expect(beacon).toBeDefined();
  for (let i = 0; i < 400 && JSON.stringify(run.snapshot().hunt?.decision?.target) !== JSON.stringify(beacon); i++) run.step(neutralActionFrame(run.nextTick));
  expect(run.snapshot().hunt?.decision?.target).toEqual(beacon);
  expect(run.snapshot().hunt?.supplies?.stored).toBeUndefined();
  expect(run.snapshot().skill?.ability.id).toBe("skill.target-mark");
  expect(run.snapshot().skill?.ability.cooldownTicksRemaining).toBe(0);
});
