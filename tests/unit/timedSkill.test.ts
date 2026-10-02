import { expect, it } from "vitest";
import { TimedSkill } from "../../src/game/domain/abilities/TimedSkill";
it("Sandguard expires at180 ticks and can activate again at1200", () => {
  const skill = new TimedSkill("skill.sandguard", 180, 1200);
  expect(skill.step(0, true).active).toBe(true);
  expect(skill.step(179, true).active).toBe(true);
  expect(skill.step(180, true).active).toBe(false);
  expect(skill.step(1199, true).active).toBe(false);
  expect(skill.step(1200, true).active).toBe(true);
});
