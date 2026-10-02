import type { ActionFrame } from "../../input/ActionFrame";
import type { ActorRegistry } from "../actors/ActorRegistry";
import { freezeRecord } from "../actors/Actor";
import { WormController, type WormDecision } from "../ai/WormController";
import { WormPerception } from "../ai/WormPerception";
import type { DomainEvent } from "../events/DomainEvent";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { RandomStream } from "../random/RandomSource";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { HunterLocomotion } from "./HunterLocomotion";
import { RifleSystem } from "./RifleSystem";
import { SeismicSnare } from "./SeismicSnare";
import { TrackingSystem, type TrackingState } from "./TrackingSystem";
import { exposedWormRegions } from "./ExposedWormContacts";
import { HuntScoreSystem } from "./HuntScoreSystem";
import type { HunterState, RifleState, SnareState } from "./HuntTypes";
export interface HuntSnapshot {
  readonly hunter: HunterState; readonly rifle: RifleState; readonly snare: SnareState;
  readonly hunterHealth: number; readonly wormHealth: number; readonly relayIntegrity: number;
  readonly tracking: TrackingState; readonly score: number; readonly trapTriggers: number;
  readonly breachInterruptions: number; readonly shotsFired: number; readonly shotsHit: number;
  readonly exposureWindowsUsed: number; readonly eligibleForRecords: boolean;
  readonly decision?: WormDecision | undefined;
  readonly shot?: Readonly<{ from: import("../math/Vector2").Vec2; to: import("../math/Vector2").Vec2; tick: number }> | undefined;
}
export class HuntSystems {
  private readonly hunter: HunterLocomotion;
  private readonly rifle = new RifleSystem();
  private readonly snare = new SeismicSnare();
  private readonly ai = new WormController();
  private readonly perception = new WormPerception();
  private readonly tracking = new TrackingSystem();
  private readonly scoring = new HuntScoreSystem();
  private trapTriggers = 0; private breachInterruptions = 0; private shotsFired = 0; private shotsHit = 0; private exposureWindowsUsed = 0;
  private exposedLast = false; private usedWindow = false;
  private shot: HuntSnapshot["shot"];
  private interruptedAttack = -1;
  constructor(private readonly terrain: TerrainProfile, private readonly debugAI: boolean, initial = { x: -180, y: -16 }) {
    this.hunter = new HunterLocomotion(terrain, { left: -2382, right: 2382 }, initial);
  }
  prepare(action: ActionFrame, worm: WormMotionSnapshot, registry: ActorRegistry, random: RandomStream, tick: number) {
    const hunter = this.hunter.step(action, tick), actor = registry.get("hunter");
    if (actor) registry.update({ ...actor, position: hunter.position, direction: hunter.direction });
    const snare = this.snare.step(action, hunter.position, worm.head.position, tick);
    if (snare.events.length) {
      this.trapTriggers++;
      const attack = this.ai.snapshot()?.breachPrediction?.warningTick;
      if (attack !== undefined && attack !== this.interruptedAttack) { this.interruptedAttack = attack; this.breachInterruptions++; this.scoring.interrupt(); }
    }
    const relay = registry.get("relay")?.position ?? { x: 0, y: -30 };
    const perception = this.perception.observe(worm, hunter.position, relay, snare.state.position, tick);
    const decision = this.ai.step(perception, tick, random);
    return { action: decision.action, effects: snare.effects, events: snare.events as readonly DomainEvent[] };
  }
  fire(action: ActionFrame, worm: WormMotionSnapshot, tick: number) {
    const regions = exposedWormRegions(worm, this.terrain.surfaceY(worm.head.position.x));
    const exposed = regions.length > 0;
    if (exposed && !this.exposedLast) this.usedWindow = false;
    this.exposedLast = exposed;
    const frame = this.rifle.step(action, { position: this.hunter.snapshot().position, regions }, tick);
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
    return freezeRecord({ hunter: this.hunter.snapshot(), rifle: this.rifle.snapshot(), snare: this.snare.snapshot(), hunterHealth: registry.get("hunter")?.health ?? 0, wormHealth: registry.get("worm")?.health ?? 0, relayIntegrity: registry.get("relay")?.health ?? 0, tracking: this.tracking.step(worm, this.ai.snapshot(), this.snare.snapshot(), tick), score: this.scoring.score, trapTriggers: this.trapTriggers, breachInterruptions: this.breachInterruptions, shotsFired: this.shotsFired, shotsHit: this.shotsHit, exposureWindowsUsed: this.exposureWindowsUsed, eligibleForRecords: !this.debugAI, decision: this.debugAI ? this.ai.snapshot() : undefined, shot: this.shot && tick - this.shot.tick < 6 ? this.shot : undefined });
  }
}
