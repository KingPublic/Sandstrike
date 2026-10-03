import { ascentArena, ascentHunterBalance as climb } from "../../data/ascentArena";
import { ascentRampageBalance as b } from "../../data/ascentRampage";
import { characterForRole, type HunterId, type WeaponDefinition } from "../../data/characters";
import { spawnActor } from "../../data/actors";
import { freezeRecord, type ActorState } from "../actors/Actor";
import type { ActorRegistry } from "../actors/ActorRegistry";
import { clampHealth } from "../combat/Health";
import type { DomainEvent } from "../events/DomainEvent";
import { HunterLocomotion } from "../hunt/HunterLocomotion";
import { freezeVec2, type Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { RandomStream } from "../random/RandomSource";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { RivalHunterController, type RivalActivity } from "../ai/RivalHunterController";
import { wantsRivalSkill } from "../ai/RivalSkillTactics";
import { CharacterSkills, type SkillSnapshot } from "../abilities/CharacterSkills";
import { applySkillEffects } from "../abilities/ApplySkillEffects";

export interface RivalUnit {
  readonly id: string;
  readonly hunterId: HunterId;
  readonly armed: boolean;
  readonly health: number;
  readonly maxHealth: number;
  readonly activity: RivalActivity;
  readonly position: Vec2;
  readonly defeated: boolean;
  readonly skill?: SkillSnapshot;
  readonly aim?: Vec2;
  readonly firing?: boolean;
}

export interface RivalSnapshot {
  readonly deployed: number;
  readonly total: number;
  readonly remaining: number;
  readonly defeated: number;
  readonly armed: number;
  readonly units: readonly RivalUnit[];
}

export interface RivalFire {
  readonly actorId: string;
  readonly from: Vec2;
  readonly to: Vec2;
  readonly heavy: boolean;
  readonly weaponId: string;
  readonly damage: number;
}

interface RivalSlot {
  readonly id: string;
  readonly hunterId: HunterId;
  readonly controller: RivalHunterController;
  readonly locomotion: HunterLocomotion;
  readonly skill: CharacterSkills;
  readonly weapon: WeaponDefinition;
  ammo: number;
  reloadUntilTick: number;
  readyTick: number;
  armed: boolean;
  activity: RivalActivity;
  sawAlive: boolean;
  burialTicks: number;
  burialDamage: number;
  burstRemaining: number;
  aim?: Vec2 | undefined;
  firingUntilTick: number;
}

/**
 * Ascent rampage opponents: Hunter bots that race the rising sand to the summit
 * crate and then turn the objective weapon on the player worm. Carrion dropped in
 * the sand is spawned here too, because it is the worm's only healing in this mode.
 */
export class RivalSystems {
  private readonly slots: RivalSlot[] = [];
  private nextPlanIndex = 0;
  private nextCarrionTick: number = b.carrionCadenceTicks;
  private currentTick = 0;

  constructor(private readonly terrain: TerrainProfile, private readonly wormGravity = 720) {}

  step(
    registry: ActorRegistry,
    worm: WormMotionSnapshot,
    tick: number,
    random: RandomStream,
  ): Readonly<{ events: readonly DomainEvent[]; fires: readonly RivalFire[] }> {
    const events: DomainEvent[] = [];
    const fires: RivalFire[] = [];
    this.currentTick = tick;
    this.deploy(registry, worm.head.position.x, tick);
    this.spawnCarrion(registry, tick, random);
    for (const slot of this.slots) {
      const actor = registry.get(slot.id);
      if (actor?.lifecycle !== "active" || actor.health <= 0) continue;
      slot.sawAlive = true;
      const surfaceY = this.terrain.surfaceY(actor.position.x);
      const state = slot.locomotion.snapshot();
      const exposed = wormIsExposed(worm, surfaceY);
      const decision = slot.controller.step(freezeRecord({
        self: state.position,
        grounded: state.grounded === true,
        platformId: state.platformId,
        surfaceY,
        summitY: ascentArena.summit.y,
        summit: { left: ascentArena.summit.left, right: ascentArena.summit.right },
        platforms: ascentArena.platforms,
        armedWithRpg: slot.armed,
        canFire: slot.reloadUntilTick <= tick && slot.readyTick <= tick,
        canDodge: state.dodgeReadyTick <= tick,
        worm: exposed ? { position: worm.head.position, velocity: worm.head.velocity, exposed: true } : undefined,
      }));
      slot.activity = decision.state;
      let next = slot.locomotion.step(planAction(tick, decision.moveX, decision.jump, decision.drop, decision.dodge === true), tick);
      const direction = decision.moveX === 0 ? state.direction : freezeVec2(Math.sign(decision.moveX), 0);
      registry.update({ ...actor, position: next.position, velocity: { x: next.velocity?.x ?? 0, y: next.velocity?.y ?? 0 }, direction, invulnerableUntilTick: Math.max(actor.invulnerableUntilTick ?? 0, next.dodgeUntilTick) });
      const owner = registry.get(slot.id);
      if (!owner) continue;
      const effect = slot.skill.step({ tick, pressed: wantsRivalSkill(slot.hunterId, owner, exposed ? worm.head.position : undefined, registry.snapshot(), ascentArena.platforms, state.grounded === true), owner, actors: registry.snapshot(), direction, phase: "hunter", surfaceY, platforms: ascentArena.platforms });
      applySkillEffects(registry, slot.id, effect);
      if (effect.grapple) {
        slot.locomotion.grappleTo(effect.grapple); next = slot.locomotion.snapshot();
        const moved = registry.get(slot.id); if (moved) registry.update({ ...moved, position: next.position, velocity: next.velocity ?? { x: 0, y: 0 } });
      }
      if (effect.activated) events.push({ type: "ability-activated", tick, actorId: slot.id, abilityId: effect.ability.id, position: next.position });
      const atCrate = next.grounded && next.platformId === "summit" && Math.abs(next.position.x) <= b.summitCrateHalfWidth;
      if (atCrate && !slot.armed) { slot.armed = true; slot.readyTick = tick + 45; events.push({ type: "ability-activated", tick, actorId: slot.id, abilityId: "ability.rpg-pickup", position: next.position }); }
      if (slot.armed && (next.position.y + climb.halfHeight > surfaceY || (registry.get(slot.id)?.health ?? 0) <= 0)) slot.armed = false;
      slot.aim = decision.aim;
      if (decision.fire && decision.aim !== undefined && tick >= slot.readyTick) {
        fires.push(freezeRecord({
          actorId: slot.id,
          from: freezeVec2(next.position.x + direction.x * 16, next.position.y - 6),
          to: leadAim(decision.aim, worm, next.position, slot.armed ? b.heavySpeed : 520, surfaceY, this.wormGravity),
          heavy: slot.armed,
          weaponId: slot.armed ? "rpg" : slot.weapon.id,
          damage: (slot.armed ? b.heavyDamage : slot.weapon.damage) * (this.markedNear(next.position, tick, registry) ? 1.5 : 1),
        }));
        slot.firingUntilTick = tick + 6;
        if (slot.armed) {
          slot.readyTick = tick + b.heavyCadenceTicks;
        } else {
          slot.ammo -= 1;
          if (slot.burstRemaining === 0) slot.burstRemaining = slot.weapon.burst;
          slot.burstRemaining -= 1;
          slot.readyTick = tick + (slot.burstRemaining > 0 ? 4 : slot.weapon.cadence);
          if (slot.ammo <= 0) { slot.ammo = slot.weapon.magazine; slot.burstRemaining = 0; slot.reloadUntilTick = tick + slot.weapon.reloadTicks; }
        }
      }
      const currentOwner = registry.get(slot.id);
      const burial = currentOwner ? this.bury(slot, registry, currentOwner, next.position.y + climb.halfHeight, surfaceY, tick) : undefined;
      if (burial !== undefined) events.push(burial);
    }
    return freezeRecord({ events: freezeRecord(events), fires: freezeRecord(fires) });
  }

  snapshot(registry: ActorRegistry): RivalSnapshot {
    const units = this.slots.map((slot) => {
      const actor = registry.get(slot.id);
      return freezeRecord({
        id: slot.id,
        hunterId: slot.hunterId,
        armed: slot.armed && actor?.lifecycle === "active" && actor.health > 0,
        health: actor?.health ?? 0,
        maxHealth: actor?.maxHealth ?? b.rivalHealth,
        activity: slot.activity,
        position: actor?.position ?? freezeVec2(0, 0),
        defeated: slot.sawAlive && (actor === undefined || actor.health <= 0 || actor.lifecycle !== "active"),
        skill: slot.skill.snapshot(this.currentTick),
        ...(slot.aim ? { aim: slot.aim } : {}),
        firing: slot.firingUntilTick > this.currentTick,
      });
    });
    const defeated = units.filter((unit) => unit.defeated).length;
    return freezeRecord({
      deployed: this.slots.length,
      total: b.rivals.length,
      remaining: Math.max(0, b.rivals.length - defeated),
      defeated,
      armed: units.filter((unit) => unit.armed).length,
      units: freezeRecord(units),
    });
  }

  private deploy(registry: ActorRegistry, wormX: number, tick: number): void {
    const plan = b.rivals[this.nextPlanIndex];
    if (plan === undefined || plan.afterTicks > tick) return;
    let active = 0;
    for (const slot of this.slots) {
      const actor = registry.get(slot.id);
      if (actor?.lifecycle === "active" && actor.health > 0) active += 1;
    }
    if (active >= b.maxActiveRivals) return;
    this.nextPlanIndex += 1;
    const position = this.spawnPoint(wormX);
    const id = `rival.${plan.hunterId}`;
    const kit = characterForRole("hunt", plan.hunterId);
    if (!kit?.weapon) throw new Error("Rival requires a Hunter kit.");
    registry.deferSpawn({ ...spawnActor(id, "actor.hunter", position), health: b.rivalHealth, maxHealth: b.rivalHealth, armor: kit.armor });
    this.slots.push({
      id,
      hunterId: plan.hunterId,
      controller: new RivalHunterController(),
      locomotion: new HunterLocomotion(this.terrain, ascentArena.bounds, position, ascentArena.platforms),
      skill: new CharacterSkills(kit),
      weapon: kit.weapon,
      ammo: kit.weapon.magazine,
      reloadUntilTick: 0,
      readyTick: tick + 40,
      armed: false,
      activity: "climb",
      sawAlive: false,
      burialTicks: 0,
      burialDamage: 0,
      burstRemaining: 0,
      firingUntilTick: 0,
    });
  }

  private markedNear(position: Vec2, tick: number, registry: ActorRegistry): boolean {
    return this.slots.some(slot => (registry.get(slot.id)?.health ?? 0) > 0 && registry.get(slot.id)?.lifecycle === "active" && slot.skill.snapshot(tick).markUntilTick > tick && Math.hypot(slot.locomotion.snapshot().position.x - position.x, slot.locomotion.snapshot().position.y - position.y) <= 900);
  }

  /** A safe ledge near the worm, so rivals start their climb alongside the player. */
  private spawnPoint(wormX: number): Vec2 {
    const surfaceY = this.terrain.surfaceY(wormX);
    const safe = ascentArena.platforms.filter((platform) => platform.id !== "summit" && platform.y < surfaceY - 60);
    if (safe.length === 0) return freezeVec2(wormX, surfaceY - 200);
    const nearest = safe.reduce((best, platform) => Math.abs(platform.y - surfaceY) < Math.abs(best.y - surfaceY) ? platform : best);
    const x = clamp(wormX + Math.sign((nearest.left + nearest.right) / 2 - wormX || 1) * b.deployMinDistance, nearest.left + 40, nearest.right - 40);
    return freezeVec2(clamp(x, wormX - b.deployMaxDistance, wormX + b.deployMaxDistance), nearest.y - climb.halfHeight);
  }

  private spawnCarrion(registry: ActorRegistry, tick: number, random: RandomStream): void {
    if (tick < this.nextCarrionTick) return;
    const existing = registry.snapshot().filter((actor) => actor.definitionId === "actor.carrion" && actor.lifecycle === "active").length;
    if (existing >= b.carrionCap) return;
    this.nextCarrionTick = tick + b.carrionCadenceTicks;
    const x = random.integer(-b.carrionHalfWidth, b.carrionHalfWidth);
    const depth = b.carrionMinDepth + random.integer(0, b.carrionMaxDepth - b.carrionMinDepth);
    registry.deferSpawn(spawnActor(`carrion.${String(tick)}`, "actor.carrion", freezeVec2(x, this.terrain.surfaceY(x) + depth)));
  }

  /** Buried rivals take damage after the same visible grace the Hunter gets. */
  private bury(slot: RivalSlot, registry: ActorRegistry, actor: ActorState, feet: number, surfaceY: number, tick: number): DomainEvent | undefined {
    if (feet <= surfaceY + 1) { slot.burialTicks = 0; return undefined; }
    slot.burialTicks += 1;
    if (slot.burialTicks <= ascentArena.burialGraceTicks) return undefined;
    slot.burialDamage += ascentArena.burialDamagePerTick;
    const amount = Math.floor(slot.burialDamage);
    if (amount <= 0) return undefined;
    slot.burialDamage -= amount;
    const health = clampHealth(actor.health - amount, actor.maxHealth);
    registry.update({ ...actor, health });
    return freezeRecord({ type: "damage-applied" as const, tick, sourceId: "hazard", targetId: slot.id, abilityId: "hazard.burial", amount: actor.health - health, tags: freezeRecord(["hazard"]), position: actor.position });
  }
}

/** The worm is only a fair target while it is out of the sand. */
function wormIsExposed(worm: WormMotionSnapshot, surfaceY: number): boolean {
  return worm.head.position.y <= surfaceY + 8 && worm.phase !== "underground";
}

/** Rivals lean their aim ahead of the worm's travel so shots read as intent. */
function leadAim(aim: Vec2, worm: WormMotionSnapshot, from: Vec2, speed: number, surfaceY: number, gravity: number): Vec2 {
  const travel = Math.min(.65, Math.hypot(aim.x - from.x, aim.y - from.y) / speed);
  return freezeVec2(aim.x + worm.head.velocity.x * travel, Math.min(surfaceY - 4, aim.y + worm.head.velocity.y * travel + gravity * travel * travel * .5));
}

function planAction(tick: number, moveX: number, jump: boolean, drop: boolean, dodge: boolean) {
  const off = Object.freeze({ held: false, pressed: false, released: false });
  return Object.freeze({
    tick, moveX, moveY: 0, aimX: 0, aimY: 0,
    primary: off, secondary: off, ability: off, boost: Object.freeze({ held: dodge, pressed: dodge, released: false }),
    jump: Object.freeze({ held: jump, pressed: jump, released: false }),
    drop: Object.freeze({ held: drop, pressed: drop, released: false }),
    interact: off, pause: off, confirm: off, back: off,
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
