import { expect, it } from "vitest";
import { RivalHunterController, type RivalPerception } from "../../src/game/domain/ai/RivalHunterController";
import { wantsRivalSkill } from "../../src/game/domain/ai/RivalSkillTactics";
import { spawnActor } from "../../src/game/data/actors";

const platforms = [{ id: "base", left: -1000, right: 1000, y: 0 }, { id: "up", left: -500, right: 500, y: -90 }];
function perception(): RivalPerception { return { self: { x: 0, y: -16 }, grounded: true, platformId: "base", surfaceY: 200, summitY: -1600, summit: { left: -700, right: 700 }, platforms, armedWithRpg: false, canFire: true, canDodge: true }; }

it("rivals take an exposed firing opportunity instead of endlessly choosing climb", () => {
  const p = { ...perception(), worm: { position: { x: 400, y: -60 }, exposed: true } };
  const decision = new RivalHunterController().step(p);
  expect(decision.fire).toBe(true); expect(decision.state).toBe("engage");
});
it("rivals shoot while urgently climbing, and choose a landing near them rather than a distant platform centre", () => {
  const decision = new RivalHunterController().step({ ...perception(), surfaceY: 80, self: { x: 200, y: -16 }, worm: { position: { x: 550, y: -60 }, exposed: true } });
  expect(decision.state).toBe("climb"); expect(decision.fire).toBe(true); expect(decision.jump).toBe(true); expect(decision.moveX).toBe(0);
});
it("rivals predict an incoming worm and dodge without jumping off a narrow ledge", () => {
  const incoming = { ...perception(), worm: { position: { x: -180, y: -40 }, velocity: { x: 500, y: 0 }, exposed: true } };
  expect(new RivalHunterController().step(incoming).dodge).toBe(true);
  const narrow = { ...incoming, platforms: [{ id: "base", left: -30, right: 30, y: 0 }] };
  expect(new RivalHunterController().step(narrow).dodge).not.toBe(true);
  expect(new RivalHunterController().step(perception()).fire).toBe(false);
});
it("an unarmed rooftop rival moves toward the crate, and an armed one keeps firing", () => {
  const p = { ...perception(), self: { x: 550, y: -1616 }, summitY: -1600, platformId: "summit" };
  expect(new RivalHunterController().step(p).moveX).toBe(-1);
  expect(new RivalHunterController().step({ ...p, armedWithRpg: true, worm: { position: { x: 200, y: -1700 }, exposed: true } }).fire).toBe(true);
});
it("each kit uses its skill for a useful situation, retaining cooldown ownership in CharacterSkills", () => {
  const owner = spawnActor("rival", "actor.hunter", { x: 0, y: -16 }), worm = { x: 170, y: -30 };
  for (const id of ["ranger", "siegebreaker", "engineer", "scout"] as const) expect(wantsRivalSkill(id, owner, worm, [owner], platforms, true)).toBe(true);
  expect(wantsRivalSkill("field-medic", owner, worm, [owner], platforms, true)).toBe(false);
  expect(wantsRivalSkill("field-medic", { ...owner, health: 50 }, undefined, [{ ...owner, health: 50 }], platforms, true)).toBe(true);
  expect(wantsRivalSkill("scout", owner, undefined, [owner], [], true)).toBe(false);
  expect(wantsRivalSkill("siegebreaker", owner, undefined, [owner], platforms, true)).toBe(false);
});
