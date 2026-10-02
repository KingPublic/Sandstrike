import { describe, expect, it } from "vitest";

import { RunFactory } from "../../src/game/application/RunFactory";
import { arcadeMovementBalance } from "../../src/game/data/arcadeMovementBalance";
import { ascentArena } from "../../src/game/data/ascentArena";
import { bossBalance } from "../../src/game/data/bossBalance";
import { spawnActor } from "../../src/game/data/actors";
import { BossSkillController } from "../../src/game/domain/hunt/BossSkillController";
import { RpgSystem } from "../../src/game/domain/hunt/RpgSystem";
import { HuntRules } from "../../src/game/domain/modes/HuntRules";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame, type ActionFrame } from "../../src/game/input/ActionFrame";

const bossRun = (): GameSession => new RunFactory("boss").create({ seed: 33, mode: "hunt", fixtureId: "ascent-boss" });
const firing = (tick: number, aim: { x: number; y: number }): ActionFrame => ({
  ...neutralActionFrame(tick),
  primary: { held: true, pressed: false, released: false },
  aimWorld: aim,
});

describe("summit boss stage", () => {
  it("freezes the hazard, cancels returns and introduces one full-health boss", () => {
    const run = bossRun();
    const first = run.step(neutralActionFrame(1));
    expect(first.events.some(event => event.type === "boss-entrance")).toBe(true);
    expect(first.snapshot.wormLife?.phase).toBe("boss");
    for (let tick = 2; tick <= 120; tick += 1) run.step(neutralActionFrame(tick));
    const staged = run.snapshot();
    expect(staged.hunt?.boss.stage).toBe("boss");
    expect(staged.world?.frozen).toBe(true);
    expect(staged.wormLife?.phase).toBe("boss");
    expect(staged.actors.filter(actor => actor.id === "worm")).toHaveLength(1);
    expect(staged.actors.find(actor => actor.id === "worm")?.maxHealth).toBe(bossBalance.bossHealth);
    const surface = staged.world?.surfaceY ?? 0;
    for (let tick = 121; tick <= 400; tick += 1) run.step(neutralActionFrame(tick));
    expect(run.snapshot().world?.surfaceY).toBe(surface);
    expect(run.snapshot().wormLife?.generation).toBe(0);
  });

  it("still starts one boss when the summit is reached while the worm is absent", () => {
    const session = new GameSession({
      seed: 9, mode: "hunt", ascent: true, movement: arcadeMovementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 1,
      actors: [spawnActor("hunter", "actor.hunter", { x: 0, y: ascentArena.summitY - 16 })],
      initialProjectiles: [{ position: { x: 0, y: 900 }, direction: { x: 1, y: 0 } }],
    });
    session.step(neutralActionFrame(1));
    for (let tick = 2; tick <= 700; tick += 1) session.step(neutralActionFrame(tick));
    const snapshot = session.snapshot();
    expect(snapshot.wormLife).toMatchObject({ phase: "boss", generation: 0, kills: 1 });
    expect(snapshot.actors.filter(actor => actor.id === "worm")).toHaveLength(1);
    expect(snapshot.actors.find(actor => actor.id === "worm")?.health).toBe(bossBalance.bossHealth);
    expect(snapshot.hunt?.boss.stage).toBe("boss");
  });

  it("cycles the boss shield with exact windup, immunity and cooldown ticks", () => {
    const skill = new BossSkillController();
    skill.reset(0);
    expect(skill.step(989).phase).toBe("idle");
    expect(skill.step(990).phase).toBe("windup");
    expect(skill.step(1019).phase).toBe("windup");
    expect(skill.step(1020).phase).toBe("active");
    expect(skill.step(1199).phase).toBe("active");
    expect(skill.step(1200).phase).toBe("idle");
    expect(skill.snapshot().cooldownEndsTick).toBe(2100);
  });

  it("deals objective damage, spends a finite magazine and restocks at the crate", () => {
    const weapon = new RpgSystem();
    expect(weapon.pickup(0)).toBe(true);
    expect(weapon.snapshot()).toMatchObject({ owned: true, rockets: bossBalance.rpgMagazine });
    expect(weapon.pickup(10)).toBe(false);
    const region = [{ position: { x: 240, y: -16 }, radius: 18, index: 0 }];
    const first = weapon.step(firing(1, { x: 240, y: -16 }), { position: { x: 0, y: -16 }, regions: region }, 1);
    expect(first.commands).toHaveLength(1);
    expect(first.commands[0]).toMatchObject({ targetId: "worm", abilityId: "ability.rpg", amount: bossBalance.rpgDamage });
    expect(weapon.snapshot().rockets).toBe(1);
    expect(weapon.step(firing(2, { x: 240, y: -16 }), { position: { x: 0, y: -16 }, regions: region }, 2).commands).toHaveLength(0);
    expect(weapon.step(firing(73, { x: 240, y: -16 }), { position: { x: 0, y: -16 }, regions: region }, 73).commands).toHaveLength(1);
    expect(weapon.snapshot()).toMatchObject({ rockets: 0, reloadUntilTick: 73 + bossBalance.rpgReloadTicks });
    expect(weapon.step(neutralActionFrame(74), { position: { x: 0, y: -16 }, regions: region }, 74).commands).toHaveLength(0);
    expect(weapon.pickup(bossBalance.rpgReloadTicks + 200)).toBe(true);
    expect(weapon.snapshot().rockets).toBe(bossBalance.rpgMagazine);
  });

  it("blocks objective fire while the boss shield is up and damages it otherwise", () => {
    const run = bossRun();
    const stats: { shieldedShots: number; blocked: number; bestHealth: number } = { shieldedShots: 0, blocked: 0, bestHealth: bossBalance.bossHealth };
    for (let tick = 1; tick <= 4000 && stats.blocked === 0; tick += 1) {
      const snapshot = run.snapshot();
      const boss = snapshot.hunt?.boss;
      const surfaceY = snapshot.world?.surfaceY ?? 0;
      const head = snapshot.worm.head.position;
      const exposed = head.y - 18 < surfaceY;
      const frame = run.step(exposed && boss?.shieldActive === true ? firing(tick, head) : neutralActionFrame(tick));
      for (const event of frame.events) {
        if (event.type !== "damage-applied" || event.abilityId !== "ability.rpg") continue;
        stats.shieldedShots += 1;
        if (event.blocked === "invulnerable") stats.blocked += 1;
      }
    }
    expect(stats.shieldedShots).toBeGreaterThan(0);
    expect(stats.blocked).toBeGreaterThan(0);
    const start = run.snapshot().tick;
    for (let tick = start + 1; tick <= start + 3600; tick += 1) {
      run.step(neutralActionFrame(tick));
      stats.bestHealth = Math.min(stats.bestHealth, run.snapshot().hunt?.boss.health ?? bossBalance.bossHealth);
    }
    // The squad alone keeps pressure on the boss while the player is passive.
    expect(stats.bestHealth).toBeLessThan(bossBalance.bossHealth);
  }, 30_000);

  it("turns a boss defeat into exactly one victory and never wins on a normal kill", () => {
    const run = bossRun();
    run.step(neutralActionFrame(1));
    for (let tick = 2; tick <= 30; tick += 1) run.step(neutralActionFrame(tick));
    const snapshot = run.snapshot();
    if (!snapshot.hunt) throw new Error("Missing hunt snapshot.");
    const deadBoss = { ...snapshot, actors: snapshot.actors.map(actor => actor.id === "worm" ? { ...actor, health: 0 } : actor) };
    const rules = new HuntRules();
    const victory = rules.observe(deadBoss, [], []).result;
    expect(victory?.reason).toBe("victory");
    expect(victory?.mode === "hunt" && victory.bossDefeated).toBe(true);
    expect(rules.observe(deadBoss, [], []).result).toBeUndefined();
    const bothDead = { ...deadBoss, actors: deadBoss.actors.map(actor => actor.id === "hunter" ? { ...actor, health: 0 } : actor) };
    expect(new HuntRules().observe(bothDead, [], []).result?.reason).toBe("hunter-defeated");
    const normalKill = { ...deadBoss, hunt: { ...snapshot.hunt, boss: { ...snapshot.hunt.boss, stage: "ascent" as const } } };
    expect(new HuntRules().observe(normalKill, [], []).result).toBeUndefined();
    const ascentKill = new RunFactory("normalkill").create({ seed: 4, mode: "hunt", fixtureId: "ascent-kill" });
    for (let tick = 1; tick <= 700; tick += 1) expect(ascentKill.step(neutralActionFrame(tick)).result).toBeUndefined();
  });

  it("keeps a six-minute run finite and internally consistent", () => {
    const run = bossRun();
    for (let tick = 1; tick <= 21600; tick += 1) {
      const frame = run.step(neutralActionFrame(tick));
      if (tick % 1200 === 0) for (const actor of frame.snapshot.actors) expect(Number.isFinite(actor.position.x + actor.position.y)).toBe(true);
    }
    const snapshot = run.snapshot();
    expect(snapshot.tick).toBeLessThanOrEqual(21600);
    expect(Number.isFinite(snapshot.worm.head.position.y)).toBe(true);
    for (const follower of snapshot.worm.followers) expect(Number.isFinite(follower.position.x + follower.position.y)).toBe(true);
    for (const ally of snapshot.hunt?.allies ?? []) expect(Number.isFinite(ally.position.x + ally.position.y)).toBe(true);
  }, 60_000);
});
