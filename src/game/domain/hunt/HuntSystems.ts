import { assistExposedAim } from "./HuntAiming";
import { ascentArena } from "../../data/ascentArena";
import { neutralActionFrame, type ActionFrame } from "../../input/ActionFrame";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
import type { ActorRegistry } from "../actors/ActorRegistry";
import { freezeRecord } from "../actors/Actor";
import { WormController, type WormDecision } from "../ai/WormController";
import { WormPerception } from "../ai/WormPerception";
import type { DomainEvent } from "../events/DomainEvent";
import type { WormMotionSnapshot, WormMovementConfig } from "../movement/WormMovementTypes";
import type { RandomStream } from "../random/RandomSource";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { HunterLocomotion } from "./HunterLocomotion";
import { RifleSystem } from "./RifleSystem";
import { SeismicSnare } from "./SeismicSnare";
import { TrackingSystem, type TrackingState } from "./TrackingSystem";
import { exposedWormRegions } from "./ExposedWormContacts";
import { HuntScoreSystem } from "./HuntScoreSystem";
import type { Vec2 } from "../math/Vector2";
import type { AllyState, BossState, HunterState, RifleState, RpgHudState, SnareState } from "./HuntTypes";
import { HuntStageDirector } from "./HuntStageDirector";
import { BossSkillController } from "./BossSkillController";
import { RpgSystem } from "./RpgSystem";
import { bossBalance } from "../../data/bossBalance";
import type { AscentWorld } from "../world/AscentWorld";
import { allies as allyBalance } from "../../data/allies";
import { spawnActor } from "../../data/actors";
import { AlliedHunterController } from "../ai/AlliedHunterController";
import { SupportHelicopterController } from "../ai/SupportHelicopterController";
import { supportPlatform, sweptLanding, type Platform } from "../world/PlatformContacts";
import type { DamageCommand } from "../combat/DamageResolver";
export interface HuntSnapshot {
  readonly hunter: HunterState; readonly rifle: RifleState; readonly snare: SnareState;
  readonly hunterHealth: number; readonly wormHealth: number; readonly relayIntegrity: number;
  readonly tracking: TrackingState; readonly score: number; readonly trapTriggers: number;
  readonly breachInterruptions: number; readonly shotsFired: number; readonly shotsHit: number;
  readonly exposureWindowsUsed: number; readonly eligibleForRecords: boolean;
  readonly allies: readonly AllyState[];
  readonly boss: BossState;
  readonly rpg: RpgHudState;
  readonly decision?: WormDecision | undefined;
  readonly shot?: Readonly<{ from: Vec2; to: Vec2; tick: number }> | undefined;
}

interface AllyUnit {
  readonly id: string;
  readonly kind: AllyState["kind"];
  readonly controller: AlliedHunterController | SupportHelicopterController;
  position: Vec2;
  velocity: Vec2;
  grounded: boolean;
  platformId?: string | undefined;
  health: number;
  dead: boolean;
  nextFireTick: number;
  firingUntilTick: number;
  aim: Vec2;
  fire: boolean;
  state: string;
}
export class HuntSystems {
  private readonly hunter: HunterLocomotion;
  private readonly rifle = new RifleSystem();
  private readonly snare = new SeismicSnare();
  private readonly ai: WormController;
  private readonly perception = new WormPerception();
  private readonly tracking = new TrackingSystem();
  private readonly scoring = new HuntScoreSystem();
  private trapTriggers = 0; private breachInterruptions = 0; private shotsFired = 0; private shotsHit = 0; private exposureWindowsUsed = 0;
  private exposedLast = false; private usedWindow = false; private wormAlive = true;
  private readonly stage = new HuntStageDirector();
  private readonly bossSkill = new BossSkillController();
  private readonly rpg = new RpgSystem();
  private readonly allyUnits: AllyUnit[] = [];
  private allySequence = 0;
  private nextAllySpawnTick = 0;
  private shot: HuntSnapshot["shot"];
  private interruptedAttack = -1;
  constructor(private readonly terrain: TerrainProfile, private readonly debugAI: boolean, movement: WormMovementConfig, initial = { x: -180, y: -16 }, private readonly aimAssist = .35, private readonly world?: AscentWorld) {
    this.hunter = new HunterLocomotion(terrain, { left: -2382, right: 2382 }, initial, this.world?.snapshot().platforms ?? []);
    this.ai = new WormController(movement, terrain, this.world ? ascentArena.riseSpeed : 0);
  }

  /** Absent worms keep the hunt running without AI, exposure or collision. */
  setWormAlive(alive: boolean): void { this.wormAlive = alive; }

  /** Fresh worm life: clean behaviour state with the current escalation. */
  restartWorm(generation: number): void { this.ai.reset(); this.ai.setAggression(generation); }
  prepare(action: ActionFrame, worm: WormMotionSnapshot, registry: ActorRegistry, random: RandomStream, tick: number) {
    const hunter = this.hunter.step(action, tick), actor = registry.get("hunter");
    if (actor) registry.update({ ...actor, position: hunter.position, direction: hunter.direction, velocity: hunter.velocity ?? { x: (hunter.position.x - actor.position.x) * 60, y: 0 } });
    const snare = this.snare.step(action, hunter.position, worm.head.position, tick);
    if (snare.events.length) {
      this.trapTriggers++;
      const attack = this.ai.snapshot()?.breachPrediction?.warningTick;
      if (attack !== undefined && attack !== this.interruptedAttack) { this.interruptedAttack = attack; this.breachInterruptions++; this.scoring.interrupt(); }
    }
    const surfaceY = this.terrain.surfaceY(hunter.position.x);
    const relay = registry.get("relay")?.position ?? { x: hunter.position.x, y: surfaceY + 200 };
    const perception = this.perception.observe(worm, hunter.position, relay, snare.state.position, tick, surfaceY);
    const decision = this.wormAlive ? this.ai.step(perception, tick, random) : this.ai.snapshot();
    this.stepStage(registry, hunter.position, tick);
    this.stepAllies(registry, worm, tick, surfaceY);
    return { action: decision?.action ?? neutralActionFrame(tick), effects: snare.effects, events: snare.events as readonly DomainEvent[] };
  }

  /** Summit transition, boss immunity cycle and the objective crate pickup. */
  private stepStage(registry: ActorRegistry, hunterPosition: Vec2, tick: number): void {
    if (!this.world) return;
    const snapshot = this.stage.step(tick, { hunterAtSummit: this.world.isAtSummit(hunterPosition), ended: false });
    if (snapshot.stage !== "boss") return;
    if (this.inCrateZone(hunterPosition)) this.rpg.pickup(tick);
    const skill = this.bossSkill.step(tick);
    const worm = registry.get("worm");
    if (worm && skill.shieldActive) registry.update({ ...worm, invulnerableUntilTick: Math.max(worm.invulnerableUntilTick ?? 0, skill.activeUntilTick) });
  }

  private inCrateZone(position: Vec2): boolean {
    const summit = this.world?.snapshot().summit;
    return summit !== undefined && Math.abs(position.x - 0) <= bossBalance.crateHalfWidth && position.y <= summit.y + 120 && position.y >= summit.y - 200;
  }

  /** Consumed once by the session when the boss entrance warning starts. */
  consumeBossSpawn(): boolean { return this.stage.consumeBossSpawn(); }

  /** The boss keeps the arena worm id so exposure, rifle and ally fire keep working. */
  beginBoss(): void {
    this.bossSkill.reset(0);
    this.ai.setAggression(5, { approachDepth: bossBalance.approachDepth, depthRequirement: bossBalance.depthRequirement });
  }

  get huntStage(): "ascent" | "boss" { return this.stage.snapshot().stage; }

  /** Bounded survivor support: at most two ground allies and one helicopter. */
  private stepAllies(registry: ActorRegistry, worm: WormMotionSnapshot, tick: number, surfaceY: number): void {
    if (!this.world) return;
    for (const unit of this.allyUnits) {
      const actor = registry.get(unit.id);
      if (!actor || actor.health <= 0) unit.dead = true;
      else unit.health = actor.health;
    }
    const alive = this.allyUnits.filter(unit => !unit.dead);
    if (tick >= this.nextAllySpawnTick) {
      const groundCount = alive.filter(unit => unit.kind === "ally.ground").length;
      const airCount = alive.filter(unit => unit.kind === "ally.air").length;
      if (groundCount < allyBalance.groundCap) this.spawnAlly("ally.ground", registry, surfaceY, tick);
      else if (airCount < allyBalance.airCap) this.spawnAlly("ally.air", registry, surfaceY, tick);
      this.nextAllySpawnTick = tick + allyBalance.replacementTicks;
    }
    const exposed = this.wormAlive ? exposedWormRegions(worm, this.terrain.surfaceY(worm.head.position.x)) : [];
    const sighted = this.wormAlive && exposed.length > 0 ? { position: worm.head.position, exposed: true } : undefined;
    const platforms = this.world.snapshot().platforms;
    const bounds = this.world.snapshot().bounds;
    for (const unit of alive) {
      if (unit.kind === "ally.ground") this.stepGroundAlly(unit, sighted, surfaceY, platforms, bounds, registry);
      else this.stepAirAlly(unit, sighted, surfaceY, bounds, registry);
    }
  }

  private stepGroundAlly(unit: AllyUnit, sighted: Readonly<{ position: Vec2; exposed: boolean }> | undefined, surfaceY: number, platforms: readonly Platform[], bounds: Readonly<{ left: number; right: number }>, registry: ActorRegistry): void {
    const controller = unit.controller as AlliedHunterController;
    const decision = controller.step({ self: unit.position, grounded: unit.grounded, platformId: unit.platformId, surfaceY, platforms, worm: sighted });
    unit.fire = decision.fire; unit.aim = decision.aim; unit.state = decision.state;
    const halfWidth = 10, halfHeight = 16;
    const previous = { position: unit.position, halfWidth, halfHeight };
    const x = clamp(unit.position.x + decision.moveX * allyBalance.groundSpeed / 60, bounds.left + 40, bounds.right - 40);
    let velocityY = unit.grounded ? 0 : unit.velocity.y;
    let grounded = unit.grounded;
    if (decision.jump && grounded) { velocityY = -allyBalance.groundJumpSpeed; grounded = false; }
    if (!grounded) velocityY = Math.min(velocityY + allyBalance.groundGravity / 60, 1200);
    const y = unit.position.y + velocityY / 60;
    const current = { position: { x, y }, halfWidth, halfHeight };
    const landed = grounded ? supportPlatform(current, platforms) : sweptLanding(previous, current, velocityY, platforms, unit.platformId);
    unit.position = landed ? { x, y: landed.y - halfHeight } : { x, y };
    unit.grounded = landed !== undefined;
    unit.platformId = landed?.id;
    unit.velocity = { x: decision.moveX * allyBalance.groundSpeed, y: landed ? 0 : velocityY };
    this.syncAlly(unit, registry);
  }

  private stepAirAlly(unit: AllyUnit, sighted: Readonly<{ position: Vec2; exposed: boolean }> | undefined, surfaceY: number, bounds: Readonly<{ left: number; right: number; top: number; bottom: number }>, registry: ActorRegistry): void {
    const controller = unit.controller as SupportHelicopterController;
    const decision = controller.step({ self: unit.position, surfaceY, bounds, worm: sighted });
    unit.fire = decision.fire; unit.aim = decision.aim; unit.state = decision.state;
    const x = clamp(unit.position.x + decision.moveX * allyBalance.airSpeed / 60, bounds.left + 60, bounds.right - 60);
    const y = clamp(unit.position.y + decision.moveY * allyBalance.airSpeed / 60, bounds.top + 80, surfaceY + 40);
    unit.position = { x, y };
    unit.grounded = false;
    unit.velocity = { x: decision.moveX * allyBalance.airSpeed, y: decision.moveY * allyBalance.airSpeed };
    this.syncAlly(unit, registry);
  }

  private syncAlly(unit: AllyUnit, registry: ActorRegistry): void {
    const actor = registry.get(unit.id);
    if (actor) registry.update({ ...actor, position: unit.position, velocity: unit.velocity, direction: { x: unit.velocity.x >= 0 ? 1 : -1, y: 0 } });
  }

  private spawnAlly(kind: AllyState["kind"], registry: ActorRegistry, surfaceY: number, tick: number): void {
    this.allySequence += 1;
    const id = kind === "ally.ground" ? `ally.ground.${String(this.allySequence)}` : `ally.heli.${String(this.allySequence)}`;
    const side = this.allySequence % 2 === 0 ? 1 : -1;
    const position = kind === "ally.ground"
      ? { x: side * (380 + this.allySequence * 20), y: -16 }
      : { x: side * 520, y: surfaceY - allyBalance.airAltitude };
    registry.deferSpawn(spawnActor(id, kind === "ally.ground" ? "actor.ally" : "actor.heli", position));
    const controller = kind === "ally.ground" ? new AlliedHunterController() : new SupportHelicopterController();
    this.allyUnits.push({ id, kind, controller, position, velocity: { x: 0, y: 0 }, grounded: kind === "ally.ground", health: kind === "ally.ground" ? allyBalance.groundHealth : allyBalance.airHealth, dead: false, nextFireTick: tick + 30, firingUntilTick: 0, aim: position, fire: false, state: "advance" });
  }

  /** Objective RPG fire, resolved with the post-movement worm pose. */
  bossFire(action: ActionFrame, worm: WormMotionSnapshot, tick: number): Readonly<{ commands: readonly DamageCommand[]; events: readonly DomainEvent[] }> {
    const regions = this.wormAlive ? exposedWormRegions(worm, this.terrain.surfaceY(worm.head.position.x)) : Object.freeze([]);
    const frame = this.rpg.step(action, { position: this.hunter.snapshot().position, regions }, tick);
    return Object.freeze({
      commands: Object.freeze([...frame.commands]),
      events: Object.freeze(frame.shot ? [{ type: "rpg-fired" as const, tick, position: frame.shot.from, to: frame.shot.to }] : []),
    });
  }

  /** Ally fire is resolved with the post-movement worm pose; the player is never a target. */
  alliesFire(worm: WormMotionSnapshot, tick: number): Readonly<{ commands: readonly DamageCommand[]; events: readonly DomainEvent[] }> {
    const commands: DamageCommand[] = [];
    const events: DomainEvent[] = [];
    if (!this.world || !this.wormAlive) return Object.freeze({ commands: Object.freeze(commands), events: Object.freeze(events) });
    const exposed = exposedWormRegions(worm, this.terrain.surfaceY(worm.head.position.x));
    for (const unit of this.allyUnits) {
      const range = unit.kind === "ally.ground" ? allyBalance.groundRange : allyBalance.airRange;
      const cadence = unit.kind === "ally.ground" ? allyBalance.groundCadence : allyBalance.airCadence;
      const damage = unit.kind === "ally.ground" ? allyBalance.groundDamage : allyBalance.airDamage;
      const contact = exposed
        .filter(region => Math.abs(region.position.x - unit.position.x) <= range)
        .reduce<(typeof exposed)[number] | undefined>((best, region) => !best || Math.abs(region.position.x - unit.position.x) < Math.abs(best.position.x - unit.position.x) ? region : best, undefined);
      if (!unit.dead && unit.fire && contact !== undefined && tick >= unit.nextFireTick) {
        unit.nextFireTick = tick + cadence;
        unit.firingUntilTick = tick + 6;
        unit.aim = contact.position;
        commands.push({ sourceId: unit.id, targetId: "worm", abilityId: unit.kind === "ally.ground" ? "ability.ally-rifle" : "ability.ally-air", tick, amount: damage, tags: ["ally", "rifle"], priority: 0 });
        events.push(Object.freeze({ type: "rifle-fired" as const, tick, position: unit.position, to: contact.position }));
      }
    }
    return Object.freeze({ commands: Object.freeze(commands), events: Object.freeze(events) });
  }

  private allySnapshot(registry: ActorRegistry, tick: number): readonly AllyState[] {
    return Object.freeze(this.allyUnits.filter(unit => !unit.dead).map(unit => {
      const actor = registry.get(unit.id);
      return Object.freeze({ id: unit.id, kind: unit.kind, position: unit.position, health: actor?.health ?? unit.health, maxHealth: actor?.maxHealth ?? unit.health, state: unit.state, firing: unit.fire && tick < unit.firingUntilTick + 6, aim: unit.aim });
    }));
  }

  fire(action: ActionFrame, worm: WormMotionSnapshot, tick: number) {
    const regions = this.wormAlive ? exposedWormRegions(worm, this.terrain.surfaceY(worm.head.position.x)) : Object.freeze([]);
    const exposed = regions.length > 0;
    if (exposed && !this.exposedLast) this.usedWindow = false;
    this.exposedLast = exposed;
    const position = this.hunter.snapshot().position;
    const aim = action.aimWorld ? { x: action.aimWorld.x - position.x, y: action.aimWorld.y - position.y } : { x: action.aimX, y: action.aimY };
    const assisted = assistExposedAim(position, aim, worm, this.aimAssist);
    const base = { ...action }; delete base.aimWorld;
    const frame = this.rifle.step({ ...base, aimX: assisted.x, aimY: assisted.y }, { position: this.hunter.snapshot().position, regions }, tick);
    if (frame.shot) { this.shotsFired++; this.shot = { ...frame.shot, tick }; }
    return { commands: frame.commands, events: frame.shot ? [{ type: "rifle-fired" as const, tick, position: frame.shot.from, to: frame.shot.to }] : [] };
  }
  observe(events: readonly DomainEvent[]): void {
    this.scoring.observe(events);
    for (const e of events) if (e.type === "damage-applied" && e.sourceId === "hunter" && e.targetId === "worm" && e.amount > 0) {
      this.shotsHit++; if (!this.usedWindow) { this.usedWindow = true; this.exposureWindowsUsed++; }
    }
  }
  snapshot(worm: WormMotionSnapshot, registry: ActorRegistry, tick: number): HuntSnapshot {
    const bossWorm = registry.get("worm");
    const skill = this.bossSkill.snapshot();
    const stage = this.stage.snapshot();
    const rpg = this.rpg.snapshot();
    return freezeRecord({ hunter: this.hunter.snapshot(), rifle: this.rifle.snapshot(), snare: this.snare.snapshot(), hunterHealth: registry.get("hunter")?.health ?? 0, wormHealth: bossWorm?.health ?? 0, relayIntegrity: registry.get("relay")?.health ?? 0, tracking: this.tracking.step(worm, this.ai.snapshot(), this.snare.snapshot(), tick), score: this.scoring.score, trapTriggers: this.trapTriggers, breachInterruptions: this.breachInterruptions, shotsFired: this.shotsFired, shotsHit: this.shotsHit, exposureWindowsUsed: this.exposureWindowsUsed, eligibleForRecords: !this.debugAI, allies: this.allySnapshot(registry, tick), boss: { stage: stage.stage, warningTicks: stage.warningTicks, health: bossWorm?.health ?? 0, maxHealth: this.stage.snapshot().stage === "boss" ? bossWorm?.maxHealth ?? 0 : 0, shieldPhase: skill.phase, shieldActive: skill.activeUntilTick > tick && skill.phase === "active", shieldTicksRemaining: Math.max(0, skill.activeUntilTick - tick) }, rpg: { owned: rpg.owned, rockets: rpg.rockets, reloading: rpg.reloadUntilTick > tick, crateReady: stage.stage === "boss" && tick >= rpg.crateReadyTick && this.world !== undefined, inCrateZone: this.world !== undefined && this.inCrateZone(this.hunter.snapshot().position) }, decision: this.debugAI ? this.ai.snapshot() : undefined, shot: this.shot && tick - this.shot.tick < 6 ? this.shot : undefined });
  }
}
