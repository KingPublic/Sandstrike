import type { ActionFrame } from "../../input/ActionFrame";
import { spawnActor, actorDefinitions } from "../../data/actors";
import { rampageBalance } from "../../data/rampageBalance";
import { isThemeId, type ThemeId } from "../../data/themes";
import { modes } from "../../data/modes";
import { validateDefinitions } from "../../data/validateDefinitions";
import { ScoreSystem } from "../scoring/ScoreSystem";
import { ComboSystem } from "../scoring/ComboSystem";
import { SpawnDirector } from "../spawning/SpawnDirector";
import { ThreatDirector } from "../spawning/ThreatDirector";
import { abilities } from "../../data/abilities";
import { TimedSkill } from "../abilities/TimedSkill";
import { automaticMouthCommands } from "../combat/AutomaticFeeding";
import { AbilitySystem } from "../abilities/AbilitySystem";
import { CombatSystem } from "../combat/CombatSystem";
import { impactDamage, type DamageCommand } from "../combat/DamageResolver";
import { createActor, type ActorState } from "../actors/Actor";
import { ActorRegistry } from "../actors/ActorRegistry";
import { CollisionWorld } from "../collision/CollisionWorld";
import { EventQueue } from "../events/EventQueue";
import { RandomSource } from "../random/RandomSource";
import { VehicleController } from "../ai/VehicleController";
import { AerialController } from "../ai/AerialController";
import { enemies, projectiles } from "../../data/enemies";
import { InfantryController } from "../ai/InfantryController";
import type { PerceptionSnapshot } from "../ai/PerceptionSnapshot";
import { ProjectileSystem } from "../actors/enemies/ProjectileSystem";
import { aiBalance } from "../../data/aiBalance";
import type { Vec2 } from "../math/Vector2";
import type { DomainEvent } from "../events/DomainEvent";
import { freezeVec2 } from "../math/Vector2";
import { WormLocomotion } from "../movement/WormLocomotion";
import type {
  WormMotionEvent,
  WormMovementConfig,
} from "../movement/WormMovementTypes";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import type { SessionSnapshot } from "./SessionSnapshot";
import type { SessionStepResult } from "./SessionStepResult";
import { RampageRules } from "../modes/RampageRules";
import type { RunResult } from "../modes/RunResult";
import type { SessionCommand } from "./SessionCommand";
import { ascentArena, ascentHunterBalance, type AscentStage } from "../../data/ascentArena";
import { AscentWorld } from "../world/AscentWorld";
import { clampHealth } from "../combat/Health";
import { HuntSystems } from "../hunt/HuntSystems";
import { WormLifeDirector } from "../hunt/WormLifeDirector";
import { collisionProfiles } from "../../data/collisionProfiles";
import { HuntRules } from "../modes/HuntRules";
import type { ModeRules } from "../modes/ModeRules";
import type { ResponseBand } from "../spawning/ThreatDirector";

export interface GameSessionOptions {
  readonly themeId?: ThemeId;
  readonly arcade?: boolean;
  readonly sessionId?: string;
  readonly mode?: "rampage" | "hunt";
  readonly ascent?: boolean;
  /** Scenario override for the initial hazard surface; defaults to the arena value. */
  readonly ascentSurface?: number;
  readonly debugAI?: boolean;
  readonly aimAssist?: number;
  readonly initialBand?: ResponseBand;
  readonly seed: number;
  readonly movement: WormMovementConfig;
  readonly terrain: TerrainProfile;
  readonly stepSeconds?: number;
  readonly actors?: readonly ActorState[];
  readonly playerHealth?: number;
  readonly initialProjectiles?: readonly Readonly<{ position: Vec2; direction: Vec2 }>[];
}

export class GameSession {
  private readonly locomotion: WormLocomotion;
  private readonly stepSeconds: number;
  private currentTick = 0;
  private readonly actors: ActorRegistry;
  private readonly collisions = new CollisionWorld();
  private readonly events = new EventQueue();
  private readonly bite = new AbilitySystem(abilities.bite, ["worm"]);
  private readonly sandguard = new TimedSkill("skill.sandguard", 180, 1200);
  private readonly combat = new CombatSystem();
  private readonly random: RandomSource;
  private readonly infantry = new Map<string, InfantryController | VehicleController | AerialController>();
  private readonly perceived = new Map<string, Readonly<{ position: Vec2; observedTick: number }>>();
  private readonly projectiles: ProjectileSystem;
  private readonly score = new ScoreSystem();
  private readonly combo = new ComboSystem();
  private readonly spawning = new SpawnDirector();
  private readonly threat: ThreatDirector;
  private readonly rules: ModeRules;
  private readonly hunt: HuntSystems | undefined;
  private readonly world: AscentWorld | undefined;
  private readonly wormLife: WormLifeDirector | undefined;
  private readonly wormMovement: WormMovementConfig;
  private readonly commands: SessionCommand[] = [];
  private burialTicks = 0;
  private burialDamage = 0;
  private ended: RunResult | undefined;

  constructor(private readonly options: GameSessionOptions) {
    if (options.themeId !== undefined && !isThemeId(options.themeId)) throw new RangeError("Unknown environment theme.");
    if (!Number.isSafeInteger(options.seed)) {
      throw new RangeError("Session seed must be a safe integer.");
    }
    const stepSeconds = options.stepSeconds ?? 1 / 60;
    if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
      throw new RangeError("Session step must be finite and positive.");
    }
    this.stepSeconds = stepSeconds;
    this.rules = options.mode === "hunt" ? new HuntRules() : new RampageRules(stepSeconds);
    this.threat = new ThreatDirector(options.initialBand ?? 0);
    if (options.mode === "rampage") validateDefinitions({ actors: actorDefinitions, abilities: [abilities.bite], mode: modes.rampage });
    this.world = options.ascent === true
      ? new AscentWorld(options.ascentSurface === undefined ? ascentArena : { ...ascentArena, initialSurface: options.ascentSurface })
      : undefined;
    const bounds = this.world ? ascentArena.bounds : rampageBalance.arena;
    const movement = options.mode
      ? { ...options.movement, ...(this.world ? { initialPosition: { x: 0, y: 900 }, initialDirection: { x: 1, y: 0 } } : {}), worldBounds: { left: bounds.left + 18, right: bounds.right - 18, top: bounds.top + 18, bottom: bounds.bottom - 18 } }
      : options.movement;
    this.wormMovement = movement;
    this.wormLife = this.world ? new WormLifeDirector() : undefined;
    this.locomotion = new WormLocomotion(movement);
    const worm = this.locomotion.snapshot();
    this.actors = new ActorRegistry([
      createActor({ ...spawnActor("worm", "actor.worm", worm.head.position), direction: worm.head.tangent, velocity: worm.head.velocity, health: options.playerHealth ?? spawnActor("worm", "actor.worm", worm.head.position).health }),
      ...(options.actors ?? []),
    ]);
    this.random = new RandomSource(options.seed);
    this.hunt = options.mode === "hunt" ? new HuntSystems(this.terrain, options.debugAI ?? false, movement, this.actors.get("hunter")?.position, options.aimAssist ?? .35, this.world) : undefined;
    this.projectiles = new ProjectileSystem(this.actors);
    for (const shot of options.initialProjectiles ?? []) this.projectiles.spawn("fixture", shot.position, shot.direction, 0);
    this.actors.commit();
  }

  get tick(): number {
    return this.currentTick;
  }

  get nextTick(): number {
    return this.currentTick + 1;
  }

  step(action: ActionFrame): SessionStepResult {
    if (this.ended) return Object.freeze({ snapshot: this.snapshot(), events: Object.freeze([]), result: undefined });
    if (action.tick !== this.nextTick) {
      throw new RangeError(
        `Expected action tick ${String(this.nextTick)}, received ${String(action.tick)}.`,
      );
    }

    const previousActors = this.actors.snapshot();
    this.currentTick = action.tick;
    this.world?.step(this.currentTick, this.currentStage());
    const huntStep = this.hunt?.prepare(action, this.locomotion.snapshot(), this.actors, this.random.stream("ai.worm"), this.currentTick);
    for (const event of huntStep?.events ?? []) this.events.publish(event);
    const movementEvents = this.wormIsAbsent()
      ? []
      : this.locomotion.step(
        huntStep?.action ?? action,
        this.stepSeconds,
        this.terrain,
        huntStep?.effects,
      );
    for (const event of movementEvents) this.events.publish(mapMovementEvent(event));
    const worm = this.locomotion.snapshot();
    const wormActor = this.actors.get("worm");
    if (!wormActor) throw new Error("Session has no player worm.");
    this.actors.update({ ...wormActor, position: worm.head.position, direction: worm.head.tangent, velocity: worm.head.velocity });
    if (this.options.arcade && !this.hunt) {
      const previousSkill = this.sandguard.snapshot(this.currentTick);
      const skill = this.sandguard.step(this.currentTick, action.ability.pressed);
      if (skill.activeUntilTick > previousSkill.activeUntilTick) {
        const player = this.actors.get("worm");
        if (player) this.actors.update({ ...player, invulnerableUntilTick: Math.max(player.invulnerableUntilTick ?? 0, skill.activeUntilTick) });
        this.events.publish({ type: "ability-activated", tick: this.currentTick, actorId: "worm", abilityId: skill.id, position: worm.head.position });
      }
    }
    for (const event of this.applyBurialDamage()) this.events.publish(event);
    this.stepInfantry();
    const projectileFrame = this.projectiles.step(this.stepSeconds, this.collisions, this.currentTick, previousActors);
    for (const event of projectileFrame.events) this.events.publish(event);
    const ability = this.bite.step(this.currentTick, this.hunt || this.options.arcade ? false : action.primary.pressed);
    if (ability.activated) this.events.publish({ type: "ability-activated", tick: this.currentTick, actorId: "worm", abilityId: abilities.bite.id, position: worm.head.position });
    const currentActors = this.actors.snapshot();
    const commands: DamageCommand[] = [...projectileFrame.commands];
    if (this.options.arcade && !this.hunt) commands.push(...automaticMouthCommands(previousActors, currentActors, this.currentTick));
    const rifle = this.hunt?.fire(action, worm, this.currentTick);
    commands.push(...(rifle?.commands ?? []));
    for (const event of rifle?.events ?? []) this.events.publish(event);
    const support = this.hunt?.alliesFire(worm, this.currentTick);
    commands.push(...(support?.commands ?? []));
    for (const event of support?.events ?? []) this.events.publish(event);
    for (const contact of this.collisions.query(previousActors, currentActors)) {
      if (contact.kind === "projectile") continue;
      this.events.publish({ type: "contact", tick: this.currentTick, contact });
      if (contact.sourceId === "worm") commands.push({ sourceId: "worm", targetId: contact.targetId, tick: this.currentTick, abilityId: "ability.impact", amount: impactDamage(worm.speed), tags: ["impact"], priority: 2 });
    }
    if (ability.state.active) {
      const withBite = (actor: ActorState): ActorState => actor.id === "worm" ? createActor({ ...actor, collision: this.bite.contactProfile(actor.direction) }) : actor;
      for (const contact of this.collisions.query(previousActors.map(withBite), currentActors.map(withBite))) {
        if (contact.sourceId !== "worm") continue;
        commands.push({ sourceId: "worm", targetId: contact.targetId, tick: this.currentTick, abilityId: abilities.bite.id, amount: abilities.bite.damage, tags: abilities.bite.debugTags, priority: 1 });
      }
    }
    for (const event of this.combat.resolve(this.actors, commands)) this.events.publish(event);
    const healthAfterCombat = this.actors.get("worm")?.health ?? 0;
    if (wormActor.health > 25 && healthAfterCombat <= 25) this.events.publish({ type: "low-health-warning", tick: this.currentTick, position: worm.head.position });
    if (wormActor.health > 0 && healthAfterCombat <= 0) this.events.publish({ type: "worm-defeated", tick: this.currentTick, position: worm.head.position });
    const combatEvents = this.events.drain();
    this.hunt?.observe(combatEvents);
    const combo = this.combo.step(combatEvents, this.currentTick);
    const award = this.score.consume(combatEvents, combo);
    for (const event of combatEvents) this.events.publish(event);
    if (award.points > 0) this.events.publish({ type: "score-awarded", tick: this.currentTick, points: award.points, total: this.score.snapshot().points });
    if (this.options.mode === "rampage") {
      const previousThreat = this.threat.snapshot();
      const threat = this.threat.step({ tick: this.currentTick, basePoints: this.score.snapshot().basePoints }, combatEvents);
      if (previousThreat.warningStartedTick === undefined && threat.warningStartedTick !== undefined) this.events.publish({ type: "response-warning", tick: this.currentTick, band: (threat.band + 1) as 1 | 2 | 3 });
      if (previousThreat.band !== threat.band) this.events.publish({ type: "response-band-changed", tick: this.currentTick, band: threat.band as 1 | 2 | 3 });
      const player = this.actors.get("worm");
      if (player) for (const command of this.spawning.step({ tick: this.currentTick, actors: this.actors.snapshot(), playerPosition: player.position, playerHealth: player.health, band: threat.band, cameraHalfWidth: 600, surfaceY: this.options.terrain.surfaceY(player.position.x) }, this.random.stream("spawn"))) this.actors.deferSpawn(spawnActor(command.id, command.definitionId, command.position));
    }
    const changes = this.actors.commit();
    for (const { actor } of changes.removed) { this.infantry.delete(actor.id); this.perceived.delete(actor.id); }
    for (const actor of changes.spawned) this.events.publish({ type: "actor-spawned", tick: this.currentTick, actorId: actor.id, definitionId: actor.definitionId, position: actor.position });
    for (const { actor, cause } of changes.removed) this.events.publish({ type: "actor-removed", tick: this.currentTick, actorId: actor.id, cause, position: actor.position });
    const events = this.events.drain();
    return this.resolveBoundary(events);
  }

  queueCommand(command: SessionCommand): void {
    if (this.ended) return;
    if (!Number.isSafeInteger(command.requestedTick) || command.requestedTick < 0 || command.requestedTick > this.currentTick) throw new RangeError("Invalid control-command boundary.");
    if (this.commands.length === 0) this.commands.push(Object.freeze({ ...command }));
  }

  flushControlCommands(): SessionStepResult { return this.ended ? Object.freeze({ snapshot: this.snapshot(), events: Object.freeze([]), result: undefined }) : this.resolveBoundary([]); }

  private resolveBoundary(events: readonly DomainEvent[]): SessionStepResult {
    const lifeEvents = this.applyWormLife();
    const snapshot = this.snapshot();
    const update = this.rules.observe(snapshot, [...events, ...lifeEvents], this.commands.splice(0));
    this.ended ??= update.result;
    return Object.freeze({ snapshot, events: Object.freeze([...events, ...lifeEvents, ...update.events]), result: update.result });
  }

  private wormIsAbsent(): boolean {
    return this.wormLife?.snapshot(this.currentTick).phase === "absent";
  }

  /** One ordinary ascent kill removes the worm for 600 ticks, then a stronger one returns. */
  private applyWormLife(): readonly DomainEvent[] {
    const life = this.wormLife;
    if (!life) return [];
    const worm = this.actors.get("worm");
    const before = life.snapshot(this.currentTick).phase;
    const state = life.step(this.currentTick, { wormDead: worm === undefined || worm.health <= 0, summitReached: false, ended: this.ended !== undefined });
    const events: DomainEvent[] = [];
    if (before !== "absent" && state.phase === "absent") {
      if (worm) this.actors.update({ ...worm, collision: collisionProfiles.hidden });
      this.hunt?.setWormAlive(false);
      events.push(Object.freeze({ type: "actor-removed" as const, tick: this.currentTick, actorId: "worm", cause: "destroyed" as const, position: worm?.position ?? { x: 0, y: 0 } }));
    }
    if (life.consumeSpawnRequest()) {
      const position = freezeVec2(this.wormMovement.initialPosition.x, this.world ? this.world.surfaceY() + 900 : this.wormMovement.initialPosition.y);
      this.locomotion.reset({ position, direction: this.wormMovement.initialDirection, speed: this.wormMovement.initialSpeed }, this.currentTick);
      if (worm) this.actors.update({ ...worm, health: worm.maxHealth, position, velocity: freezeVec2(this.wormMovement.initialDirection.x * this.wormMovement.initialSpeed, this.wormMovement.initialDirection.y * this.wormMovement.initialSpeed), direction: freezeVec2(this.wormMovement.initialDirection.x, this.wormMovement.initialDirection.y), collision: collisionProfiles.worm, lifecycle: "active" });
      this.hunt?.setWormAlive(true);
      this.hunt?.restartWorm(state.generation);
      events.push(Object.freeze({ type: "actor-spawned" as const, tick: this.currentTick, actorId: "worm", definitionId: "actor.worm", position }));
    }
    return Object.freeze(events);
  }

  private currentStage(): AscentStage {
    return "ascent";
  }

  /** Terrain every actor follows: the rising hazard surface in ascent runs. */
  private get terrain(): TerrainProfile {
    return this.world ?? this.options.terrain;
  }

  /** Buried Hunters take escalating damage after a visible grace period. */
  private applyBurialDamage(): readonly DomainEvent[] {
    if (!this.world) return [];
    const hunter = this.actors.get("hunter");
    if (hunter?.lifecycle !== "active" || hunter.health <= 0) { this.burialTicks = 0; return []; }
    const feet = hunter.position.y + ascentHunterBalance.halfHeight;
    if (feet <= this.world.surfaceY() + 1) { this.burialTicks = 0; return []; }
    this.burialTicks += 1;
    if (this.burialTicks <= ascentArena.burialGraceTicks) return [];
    this.burialDamage += ascentArena.burialDamagePerTick;
    const amount = Math.floor(this.burialDamage);
    if (amount <= 0) return [];
    this.burialDamage -= amount;
    const health = clampHealth(hunter.health - amount, hunter.maxHealth);
    this.actors.update({ ...hunter, health });
    return [Object.freeze({ type: "damage-applied" as const, tick: this.currentTick, sourceId: "hazard", targetId: "hunter", abilityId: "hazard.burial", amount: hunter.health - health, tags: Object.freeze(["hazard"]), position: hunter.position })];
  }

  snapshot(): SessionSnapshot {
    return Object.freeze({
      themeId: this.options.themeId ?? "desert",
      arcade: this.options.arcade ?? false,
      ...(this.world ? { world: this.world.snapshot() } : {}),
      ...(this.wormLife ? { wormLife: this.wormLife.snapshot(this.currentTick) } : {}),
      sessionId: this.options.sessionId ?? `seed.${String(this.options.seed)}`,
      mode: this.options.mode ?? "rampage",
      playerActorId: this.hunt ? "hunter" : "worm",
      ...(this.hunt ? { hunt: this.hunt.snapshot(this.locomotion.snapshot(), this.actors, this.currentTick) } : {}),
      tick: this.currentTick,
      seed: this.options.seed,
      score: this.score.snapshot(),
      combo: this.combo.snapshot(),
      threat: this.threat.snapshot(),
      worm: this.locomotion.snapshot(),
      actors: this.actors.snapshot(),
      abilities: Object.freeze([this.options.arcade && !this.hunt ? this.sandguard.snapshot(this.currentTick) : this.bite.snapshot(this.currentTick)]),
      ai: Object.freeze([...this.infantry].sort(([a], [b]) => a.localeCompare(b)).map(([actorId, controller]) => Object.freeze({ actorId, decision: controller.snapshot() }))),
      diagnostics: Object.freeze({ eventOverflowCount: this.events.overflowCount, projectileCount: this.projectiles.activeCount }),
    });
  }

  private stepInfantry(): void {
    const worm = this.locomotion.snapshot();
    for (const actor of this.actors.snapshot()) {
      if (!actor.tags.some(tag => ["infantry", "vehicle", "aerial"].includes(tag)) || actor.lifecycle !== "active") continue;
      let controller = this.infantry.get(actor.id);
      if (!controller) { controller = actor.tags.includes("vehicle") ? new VehicleController() : actor.tags.includes("aerial") ? new AerialController() : new InfantryController(); this.infantry.set(actor.id, controller); }
      const visible = worm.head.position.y <= this.options.terrain.surfaceY(worm.head.position.x) + aiBalance.surfaceVisibilityMargin && Math.hypot(worm.head.position.x - actor.position.x, worm.head.position.y - actor.position.y) <= aiBalance.perceptionRange;
      if (visible) this.perceived.set(actor.id, { position: worm.head.position, observedTick: this.currentTick });
      const perception: PerceptionSnapshot = Object.freeze({ selfId: actor.id, selfPosition: actor.position, tick: this.currentTick, visibleTarget: visible ? Object.freeze({ id: "worm", position: worm.head.position }) : undefined, recentTarget: this.perceived.get(actor.id) });
      const previousState = controller.snapshot().state;
      const decision = controller.step(perception, this.currentTick, this.random.stream(`ai.${actor.id}`));
      const speed = actor.tags.includes("vehicle") ? enemies.vehicleSpeed : actor.tags.includes("aerial") ? enemies.aerialSpeed : aiBalance.repositionSpeed;
      const position = { x: Math.max(-2350, Math.min(2350, actor.position.x + decision.moveX * speed * this.stepSeconds)), y: actor.position.y };
      this.actors.update({ ...actor, position, velocity: { x: decision.moveX * speed, y: 0 } });
      if (decision.state === "telegraph" && previousState !== "telegraph" && decision.aimPoint) this.events.publish({ type: "infantry-telegraph", tick: this.currentTick, actorId: actor.id, aimPoint: decision.aimPoint, position });
      if (decision.fire && decision.aimPoint) {
        const direction = { x: decision.aimPoint.x - position.x, y: decision.aimPoint.y - position.y };
        if (Math.hypot(direction.x, direction.y) === 0) direction.x = 1;
        const projectileId = this.projectiles.spawn(actor.id, position, direction, this.currentTick, actor.tags.includes("vehicle") ? projectiles.vehicle : actor.tags.includes("aerial") ? projectiles.aerial : projectiles.infantry);
        if (projectileId) this.events.publish({ type: "projectile-fired", tick: this.currentTick, actorId: actor.id, projectileId, position });
      }
    }
  }
}

function mapMovementEvent(event: WormMotionEvent): DomainEvent {
  const position = freezeVec2(event.position.x, event.position.y);

  if (event.type === "burst") {
    return Object.freeze({
      type: "worm-burst",
      tick: event.tick,
      speed: event.speed,
      position,
    });
  }

  switch (event.to) {
    case "breaching":
      return Object.freeze({ type: "worm-breached", tick: event.tick, position });
    case "airborne":
      return Object.freeze({
        type: "worm-became-airborne",
        tick: event.tick,
        position,
      });
    case "reentering":
      return Object.freeze({ type: "worm-reentered", tick: event.tick, position });
    case "underground":
      return Object.freeze({
        type: "worm-returned-underground",
        tick: event.tick,
        position,
      });
  }
}
