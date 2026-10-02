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
  private recoverTicks = 120;
  private decisionTicks = 12;
  private breachBoost = false;
  private approachDepth = 960;
  private depthRequirement = 760;
  constructor(private readonly movement: WormMovementConfig, private readonly terrain: TerrainProfile, private readonly surfaceRisePerSecond = 0, private readonly relayObjective = true) {}

  /** Escalation from the life director: shorter recovery and cadence, capped. */
  setAggression(generation: number, tuning: Readonly<{ approachDepth?: number; depthRequirement?: number }> = {}): void {
    const profile = aggressionProfile(generation);
    this.recoverTicks = profile.recoverTicks;
    this.decisionTicks = profile.decisionTicks;
    this.breachBoost = profile.breachBoost;
    this.approachDepth = tuning.approachDepth ?? 960;
    this.depthRequirement = tuning.depthRequirement ?? 760;
  }

  /** Fresh worm life keeps the escalation but starts from a clean behaviour state. */
  reset(): void {
    this.state = "roam";
    this.enteredTick = 0;
    this.warning = undefined;
    this.decision = undefined;
    this.side = 1;
  }

  step(p: WormPerceptionSnapshot, tick: number, random: RandomStream): WormDecision {
    const head = p.self.head.position;
    const surfaceY = p.surfaceY;
    const relayUtility = this.relayObjective ? (tick >= 3600 ? 1 : .65) : 0;
    const airborne = p.self.phase === "airborne" || p.self.phase === "breaching";
    if (tick % this.decisionTicks === 1 && tick - this.enteredTick >= this.decisionTicks) {
      if (airborne && this.state !== "evade") this.transition("evade", tick);
      else if (!airborne && this.state === "evade") { this.transition("recover", tick); this.warning = undefined; }
      else if (this.state === "roam" || this.state === "recover" && tick - this.enteredTick >= this.recoverTicks) this.transition("acquire", tick);
      else if (this.state === "acquire") {
        const hunterUtility = p.hunter ? .9 : 0;
        this.target = hunterUtility > relayUtility ? (p.hunter?.position ?? p.relay) : p.relay;
        this.side = random.float() < .5 ? -1 : 1;
        const bounds = this.movement.worldBounds;
        if (bounds && this.target.x > bounds.right - 600) this.side = 1;
        else if (bounds && this.target.x < bounds.left + 600) this.side = -1;
        this.transition("reposition", tick);
      } else if (this.state === "reposition" && Math.abs(head.x - (this.target.x - this.side * 260)) < 120 && head.y > surfaceY + this.depthRequirement) this.transition("stalk", tick);
      else if (this.state === "stalk") {
        const crossingX = predictBreachX(p.self, { x: this.target.x, y: Math.min(surfaceY - 260, this.target.y - 160) }, this.movement, this.terrain, this.surfaceRisePerSecond);
        if (crossingX !== undefined) {
          this.warning = { x: Math.floor(crossingX / 120) * 120 + 60, warningTick: tick, committedTick: tick + 60 };
          this.transition("accelerate", tick);
        } else this.transition("recover", tick);
      } else if (this.state === "accelerate" && tick >= (this.warning?.committedTick ?? Infinity)) this.transition("breach", tick);
      else if (this.state === "breach" && tick - this.enteredTick > 600) { this.transition("recover", tick); this.warning = undefined; }
    }
    // Depths are relative to the hazard surface so an elevated Hunter stays reachable.
    let steeringTarget: Vec2;
    if (this.state === "breach" || this.state === "accelerate") steeringTarget = { x: this.target.x, y: Math.min(surfaceY - 260, this.target.y - 160) };
    else if (this.state === "evade") steeringTarget = { x: this.target.x + this.side * 320, y: surfaceY + 200 };
    else if (this.state === "recover" || this.state === "roam") steeringTarget = { x: this.target.x - this.side * 360, y: surfaceY + this.approachDepth + 240 };
    else steeringTarget = { x: this.target.x - this.side * 260, y: surfaceY + this.approachDepth };
    const bounds = this.movement.worldBounds;
    if (bounds && this.state !== "accelerate" && this.state !== "breach") steeringTarget = { ...steeringTarget, x: Math.max(bounds.left + 200, Math.min(bounds.right - 200, steeringTarget.x)) };
    const dx = steeringTarget.x - head.x, dy = steeringTarget.y - head.y, length = Math.hypot(dx, dy) || 1;
    const boost = this.state === "breach" && (tick === this.enteredTick || (this.breachBoost && tick === this.enteredTick + 12));
    const action = { ...neutralActionFrame(tick), moveX: dx / length, moveY: dy / length, boost: { held: boost, pressed: boost, released: false } };
    this.decision = freezeRecord({ action, state: this.state, target: this.target, steeringTarget, utility: { hunter: p.hunter ? .9 : 0, relay: relayUtility }, reason: `${this.state}: ${p.hunter ? "observed hunter" : "relay pressure"}`, route: [steeringTarget, this.target], breachPrediction: this.warning });
    return this.decision;
  }
  snapshot(): WormDecision | undefined { return this.decision; }
  private transition(state: WormAIState, tick: number): void { this.state = state; this.enteredTick = tick; }
}
