import { ascentArena, ascentHunterBalance as climb } from "../../data/ascentArena";
import { ascentRampageBalance as b } from "../../data/ascentRampage";
import type { HunterId } from "../../data/characters";
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

export interface RivalUnit {
  readonly id: string;
  readonly hunterId: HunterId;
  readonly armed: boolean;
  readonly health: number;
  readonly maxHealth: number;
  readonly activity: RivalActivity;
  readonly position: Vec2;
  readonly defeated: boolean;
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
}

interface RivalSlot {
  readonly id: string;
  readonly hunterId: HunterId;
  readonly controller: RivalHunterController;
  readonly locomotion: HunterLocomotion;
  ammo: number;
  reloadUntilTick: number;
  readyTick: number;
  armed: boolean;
  activity: RivalActivity;
  sawAlive: boolean;
  burialTicks: number;
  burialDamage: number;
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

  constructor(private readonly terrain: TerrainProfile) {}

  step(
    registry: ActorRegistry,
    worm: WormMotionSnapshot,
    tick: number,
    random: RandomStream,
  ): Readonly<{ events: readonly DomainEvent[]; fires: readonly RivalFire[] }> {
    const events: DomainEvent[] = [];
    const fires: RivalFire[] = [];
    this.deploy(registry, worm.head.position.x, tick);
    this.spawnCarrion(registry, tick, random);
    for (const slot of this.slots) {
      const actor = registry.get(slot.id);
      if (actor?.lifecycle !== "active" || actor.health <= 0) continue;
      slot.sawAlive = true;
      const surfaceY = this.terrain.surfaceY(actor.position.x);
      const state = slot.locomotion.snapshot();
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
        worm: wormIsExposed(worm, surfaceY) ? { position: worm.head.position, exposed: true } : undefined,
      }));
      slot.activity = decision.state;
      const next = slot.locomotion.step(planAction(tick, decision.moveX, decision.jump, decision.drop), tick);
      const direction = decision.moveX === 0 ? state.direction : freezeVec2(Math.sign(decision.moveX), 0);
      registry.update({ ...actor, position: next.position, velocity: { x: next.velocity?.x ?? 0, y: next.velocity?.y ?? 0 }, direction });
      if (decision.fire && decision.aim !== undefined) {
        fires.push(freezeRecord({
          actorId: slot.id,
          from: freezeVec2(next.position.x + direction.x * 16, next.position.y - 6),
          to: slot.armed ? decision.aim : leadAim(decision.aim, worm),
          heavy: slot.armed,
        }));
        if (slot.armed) {
          slot.readyTick = tick + b.heavyCadenceTicks;
        } else {
          slot.ammo -= 1;
          slot.readyTick = tick + b.rivalFireCadenceTicks;
          if (slot.ammo <= 0) { slot.ammo = b.rivalMagazine; slot.reloadUntilTick = tick + b.rivalReloadTicks; }
        }
      }
      const burial = this.bury(slot, registry, actor, next.position.y + climb.halfHeight, surfaceY, tick);
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
        armed: slot.armed,
        health: actor?.health ?? 0,
        maxHealth: actor?.maxHealth ?? b.rivalHealth,
        activity: slot.activity,
        position: actor?.position ?? freezeVec2(0, 0),
        defeated: slot.sawAlive && (actor === undefined || actor.health <= 0 || actor.lifecycle !== "active"),
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
    registry.deferSpawn({ ...spawnActor(id, "actor.hunter", position), health: b.rivalHealth, maxHealth: b.rivalHealth });
    this.slots.push({
      id,
      hunterId: plan.hunterId,
      controller: new RivalHunterController(),
      locomotion: new HunterLocomotion(this.terrain, ascentArena.bounds, position, ascentArena.platforms),
      ammo: b.rivalMagazine,
      reloadUntilTick: 0,
      readyTick: tick + 40,
      armed: false,
      activity: "climb",
      sawAlive: false,
      burialTicks: 0,
      burialDamage: 0,
    });
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
function leadAim(aim: Vec2, worm: WormMotionSnapshot): Vec2 {
  return freezeVec2(aim.x + worm.head.velocity.x * 0.16, aim.y + worm.head.velocity.y * 0.08);
}

function planAction(tick: number, moveX: number, jump: boolean, drop: boolean) {
  const off = Object.freeze({ held: false, pressed: false, released: false });
  return Object.freeze({
    tick, moveX, moveY: 0, aimX: 0, aimY: 0,
    primary: off, secondary: off, ability: off, boost: off,
    jump: Object.freeze({ held: jump, pressed: jump, released: false }),
    drop: Object.freeze({ held: drop, pressed: drop, released: false }),
    interact: off, pause: off, confirm: off, back: off,
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
