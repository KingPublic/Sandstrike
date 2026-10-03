import { neutralActionFrame, type ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { RandomStream } from "../random/RandomSource";
import type { WormPerceptionSnapshot } from "./WormPerception";
import type { WormMovementConfig } from "../movement/WormMovementTypes";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { predictBreachX } from "./WormBreachPlanner";
import { aggressionProfile } from "../hunt/WormLifeDirector";
export type WormAIState = "roam" | "acquire" | "stalk" | "accelerate" | "breach" | "evade" | "recover" | "reposition";
export interface WormDecision { readonly action: ActionFrame; readonly state: WormAIState; readonly target: Vec2; readonly steeringTarget: Vec2; readonly utility: Readonly<{ hunter: number; relay: number }>; readonly reason: string; readonly route: readonly Vec2[]; readonly breachPrediction?: Readonly<{ x: number; warningTick: number; committedTick: number }> | undefined }
export class WormController {
  private state: WormAIState = "roam";
  private enteredTick = 0;
  private target: Vec2 = { x: 0, y: -30 };
  private side = 1;
  private warning: WormDecision["breachPrediction"];
  private decision: WormDecision | undefined;
  private recoverTicks = 60;
  private decisionTicks = 12;
  private breachBoost = false;
  private approachDepth = 620;
  private depthRequirement = 420;
  private crossedSurface = false;
  private attackTarget: Vec2 | undefined;
  private lureTarget: Vec2 | undefined;
  private previousLure: Vec2 | undefined;
  private lureUntilTick = 0;
  private attackIsLure = false;
  private diveSide: number | undefined;
  constructor(private readonly movement: WormMovementConfig, private readonly terrain: TerrainProfile, private readonly surfaceRisePerSecond = 0, private readonly relayObjective = true) {}

  /** Escalation from the life director: shorter recovery and cadence, capped. */
  setAggression(generation: number, tuning: Readonly<{ approachDepth?: number; depthRequirement?: number }> = {}): void {
    const profile = aggressionProfile(generation);
    this.recoverTicks = Math.min(profile.recoverTicks, 60);
    this.decisionTicks = profile.decisionTicks;
    this.breachBoost = profile.breachBoost;
    this.approachDepth = tuning.approachDepth ?? 620;
    this.depthRequirement = tuning.depthRequirement ?? 420;
  }

  /** Fresh worm life keeps the escalation but starts from a clean behaviour state. */
  reset(): void {
    this.state = "roam";
    this.enteredTick = 0;
    this.warning = undefined;
    this.decision = undefined;
    this.side = 1;
    this.crossedSurface = false;
    this.attackTarget = undefined;
    this.lureTarget = undefined; this.previousLure = undefined; this.lureUntilTick = 0; this.attackIsLure = false;
    this.diveSide = undefined;
  }

  step(p: WormPerceptionSnapshot, tick: number, random: RandomStream): WormDecision {
    const head = p.self.head.position;
    const surfaceY = p.surfaceY;
    const relayUtility = this.relayObjective ? (tick >= 3600 ? 1 : .65) : 0;
    const airborne = p.self.phase === "airborne" || p.self.phase === "breaching";
    if (p.lure && (!this.previousLure || Math.hypot(p.lure.x - this.previousLure.x, p.lure.y - this.previousLure.y) > 1)) {
      this.lureTarget = p.lure; this.lureUntilTick = tick + 480;
    }
    this.previousLure = p.lure;
    if (tick >= this.lureUntilTick || airborne && this.attackIsLure) this.lureTarget = undefined;
    if (airborne) { this.crossedSurface = true; if (this.state === "evade") this.attackIsLure = false; }
    // A sensed Hunter is always a better target than a static objective.
    const lure = this.lureTarget;
    const sensed = lure ?? p.noise?.position ?? p.hunter?.position ?? p.seismic;
    const hunterUtility = sensed ? .9 : 0;
    const shielded = !lure && (p.shieldUntilTick ?? 0) > tick;
    const provoked = lure !== undefined || p.noise !== undefined || (p.markedUntilTick ?? 0) > tick;
    // Track movement until the warning starts, then finish the advertised charge.
    if (!airborne && this.state !== "accelerate" && this.state !== "breach" && sensed) {
      this.target = { x: sensed.x + (shielded ? this.side * 110 : 0), y: sensed.y };
      if (provoked && (this.state === "recover" || this.state === "roam")) this.transition("acquire", tick);
    }
    if (tick % this.decisionTicks === 1 && tick - this.enteredTick >= this.decisionTicks) {
      if (airborne && this.state !== "evade" && (p.self.head.velocity.y >= 0 || Math.hypot(head.x - this.target.x, head.y - this.target.y) < 90 || tick - this.enteredTick > 180)) this.transition("evade", tick);
      else if (!airborne && this.state === "evade") { this.transition("recover", tick); this.warning = undefined; }
      // Once the surface has been broken and the worm is safely back down, line up
      // the next attack immediately instead of idling for ten seconds.
      else if (!airborne && this.state === "breach" && this.crossedSurface) { this.crossedSurface = false; this.transition("acquire", tick); this.warning = undefined; }
      else if (this.state === "roam" || this.state === "recover" && tick - this.enteredTick >= this.recoverTicks) this.transition("acquire", tick);
      else if (this.state === "acquire") {
        this.target = hunterUtility > relayUtility ? (sensed ?? p.relay) : p.relay;
        this.side = Math.sign(this.target.x - head.x) || (random.float() < .5 ? -1 : 1);
        const bounds = this.movement.worldBounds;
        if (bounds && this.target.x > bounds.right - 600) this.side = 1;
        else if (bounds && this.target.x < bounds.left + 600) this.side = -1;
        this.transition("reposition", tick);
      } else if (this.state === "reposition" && Math.abs(head.x - (this.target.x - this.side * 100)) < 140 && head.y > surfaceY + this.depthRequirement && (!shielded || (p.shieldUntilTick ?? 0) <= tick + 60)) this.transition("stalk", tick);
      else if (this.state === "stalk") {
        // Lead the Hunter's current travel so the crossing meets them, not their old spot.
        const lead = lure ? 0 : (p.hunterVelocity?.x ?? 0) * .55;
        const aimX = this.target.x + lead;
        this.attackTarget = { x: aimX, y: Math.min(surfaceY - 260, this.target.y - 160) };
        let crossingX = predictBreachX(p.self, this.attackTarget, this.movement, this.terrain, this.surfaceRisePerSecond);
        // Correct for momentum/turn radius instead of accepting an off-target breach.
        for (let attempt = 0; attempt < 3 && crossingX !== undefined && Math.abs(crossingX - aimX) > 100; attempt++) {
          this.attackTarget = { ...this.attackTarget, x: this.attackTarget.x + Math.max(-260, Math.min(260, aimX - crossingX)) * 1.4 };
          crossingX = predictBreachX(p.self, this.attackTarget, this.movement, this.terrain, this.surfaceRisePerSecond);
        }
        if (crossingX !== undefined && Math.abs(crossingX - aimX) <= 260) {
          this.attackIsLure = lure !== undefined;
          this.warning = { x: Math.floor(crossingX / 120) * 120 + 60, warningTick: tick, committedTick: tick + 60 };
          this.transition("accelerate", tick);
        } else this.transition("reposition", tick);
      } else if (this.state === "accelerate" && tick >= (this.warning?.committedTick ?? Infinity)) this.transition("breach", tick);
      else if (this.state === "breach" && tick - this.enteredTick > 600) { this.transition("recover", tick); this.warning = undefined; }
    }
    // Depths are relative to the hazard surface so an elevated Hunter stays reachable.
    let steeringTarget: Vec2;
    if (this.state === "breach" || this.state === "accelerate") steeringTarget = airborne ? this.target : this.attackTarget ?? this.target;
    else if (this.state === "evade") steeringTarget = { x: this.target.x + this.side * 320, y: surfaceY + 200 };
    else if (this.state === "recover" || this.state === "roam") steeringTarget = { x: this.target.x - this.side * 240, y: surfaceY + this.approachDepth + 240 };
    else steeringTarget = { x: this.target.x - this.side * 160, y: surfaceY + this.approachDepth };
    const bounds = this.movement.worldBounds;
    if (bounds && this.state !== "accelerate" && this.state !== "breach") steeringTarget = { ...steeringTarget, x: Math.max(bounds.left + 200, Math.min(bounds.right - 200, steeringTarget.x)) };
    const dx = steeringTarget.x - head.x, dy = steeringTarget.y - head.y, length = Math.hypot(dx, dy) || 1;
    const boost = this.state === "breach" && (tick === this.enteredTick || (this.breachBoost && tick === this.enteredTick + 12));
    // Attacks aside, the worm must not loiter at the surface: an accidental
    // crossing would arrive without a warning sector.
    const safeTurnDepth = Math.max(280, p.self.speed / (this.movement.lowSpeedTurnRate * this.movement.highSpeedTurnFactor) + 80);
    const mustDive = this.state !== "accelerate" && this.state !== "breach" && head.y < surfaceY + safeTurnDepth;
    // Lock the escape turn until deep enough; changing its sign can stall at 180 degrees.
    if (mustDive) this.diveSide ??= Math.sign(p.self.head.tangent.x) || this.side;
    else this.diveSide = undefined;
    const action = mustDive
      ? { ...neutralActionFrame(tick), moveX: (this.diveSide ?? this.side) * .55, moveY: 1, boost: { held: false, pressed: false, released: false } }
      : { ...neutralActionFrame(tick), moveX: dx / length, moveY: dy / length, boost: { held: boost, pressed: boost, released: false } };
    const sensedBy = lure || this.attackIsLure ? "beacon attack" : p.noise?.kind === "grapple" ? "grapple landing pursuit" : p.noise?.kind === "heal" ? "healing pulse pursuit" : shielded ? "shield flank" : (p.markedUntilTick ?? 0) > tick ? "marked retaliation" : p.hunter ? "observed hunter" : p.seismic ? "seismic track" : "relay pressure";
    this.decision = freezeRecord({ action, state: this.state, target: this.target, steeringTarget, utility: { hunter: hunterUtility, relay: relayUtility }, reason: `${this.state}: ${sensedBy}`, route: [steeringTarget, this.target], breachPrediction: this.warning });
    return this.decision;
  }
  snapshot(): WormDecision | undefined { return this.decision; }
  private transition(state: WormAIState, tick: number): void { this.state = state; this.enteredTick = tick; }
}
