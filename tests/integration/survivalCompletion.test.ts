import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import type { CharacterId } from "../../src/game/data/characters";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { exposedWormRegions } from "../../src/game/domain/hunt/ExposedWormContacts";

const measurements: { characterId: CharacterId; ascentSeconds: number; totalSeconds: number; bossHealth: number | undefined; hunterHealth: number | undefined; outcome: string | undefined }[] = [];
afterAll(() => {
  const path = "docs/SURVIVAL_PLAYTHROUGH.json";
  const previous = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) as { runs?: typeof measurements } : {};
  const runs = [...(previous.runs ?? []).filter(r => !measurements.some(m => m.characterId === r.characterId)), ...measurements];
  writeFileSync(path, JSON.stringify({ date: "2026-10-02", method: "Seed 33, normal simulation, exposed-target aiming, no traversal skill, no teleport or health override", runs }, null, 2));
});
it.each<CharacterId>(["ranger", "siegebreaker", "scout", "engineer", "field-medic"])("%s can complete a natural climb and boss", (characterId) => {
  const run = new RunFactory("natural-completion").create({ seed: 33, mode: "hunt", characterId });
  let ascentTicks = 0, outcome: string | undefined;
  for (let tick = 1; tick <= 30_000; tick++) {
    const snapshot = run.snapshot(), h = snapshot.hunt, world = snapshot.world;
    if (!h || !world) throw new Error("Missing ascent.");
    let moveX = 0, jump = false, dodge = false;
    const feet = h.hunter.position.y + 16;
    if (h.boss.stage === "ascent") {
      const target = world.platforms.filter(p => p.y < feet - 20 && feet - p.y <= 121)
        .sort((a, b) => b.y - a.y)[0];
      if (target) {
        const goalX = Math.max(target.left + 30, Math.min(target.right - 30, h.hunter.position.x));
        moveX = Math.abs(goalX - h.hunter.position.x) > 5 ? Math.sign(goalX - h.hunter.position.x) : 0;
        jump = h.hunter.grounded === true && Math.abs(goalX - h.hunter.position.x) < 10;
      }
    } else {
      ascentTicks ||= tick;
      if (!h.rpg.owned) moveX = Math.abs(h.hunter.position.x) > 40 ? -Math.sign(h.hunter.position.x) : 0;
      const bracket = h.tracking.breachBracket;
      if (bracket && h.hunter.position.x > bracket.left - 100 && h.hunter.position.x < bracket.right + 100) {
        moveX = h.hunter.position.x < (bracket.left + bracket.right) / 2 ? -1 : 1;
        if (Math.abs(h.hunter.position.x) > 540) moveX *= -1;
        dodge = h.hunter.dodgeReadyTick <= tick;
      }
    }
    const warning = h.tracking.breachBracket;
    if (h.boss.stage === "ascent" && warning && h.hunter.position.x > warning.left - 120 && h.hunter.position.x < warning.right + 120) dodge = h.hunter.dodgeReadyTick <= tick;
    const useSkill = characterId !== "scout" && snapshot.skill?.ability.cooldownTicksRemaining === 0;
    const target = exposedWormRegions(snapshot.worm, world.surfaceY).find(p => p.position.y < world.surfaceY);
    const fire = target !== undefined && !h.boss.shieldActive;
    const frame = run.step({ ...neutralActionFrame(tick), moveX, ability: { held: useSkill, pressed: useSkill, released: false }, jump: { held: jump, pressed: jump, released: false }, boost: { held: dodge, pressed: dodge, released: false }, ...(target ? { aimWorld: target.position } : {}), primary: { held: fire, pressed: fire, released: false } });
    if (frame.result) { outcome = frame.result.reason; break; }
  }
  measurements.push({ characterId, ascentSeconds: ascentTicks / 60, totalSeconds: run.tick / 60, bossHealth: run.snapshot().hunt?.boss.health, hunterHealth: run.snapshot().hunt?.hunterHealth, outcome });
  expect(outcome).toBe("victory");
  expect(run.tick / 60).toBeGreaterThan(240);
  expect(run.tick / 60).toBeLessThan(420);
}, 60_000);
