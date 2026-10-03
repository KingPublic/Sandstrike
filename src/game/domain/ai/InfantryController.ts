import { aiBalance } from "../../data/aiBalance";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { RandomStream } from "../random/RandomSource";
import type { PerceptionSnapshot } from "./PerceptionSnapshot";

export type InfantryState = "idle" | "reposition" | "telegraph" | "fire" | "recover";
export interface InfantryDecision {
  readonly state: InfantryState;
  readonly transitionReason: string;
  readonly moveX: number;
  readonly fire: boolean;
  readonly aimPoint: Vec2 | undefined;
  readonly perceivedTarget: Vec2 | undefined;
  readonly cooldownTicks: number;
}

export class InfantryController {
  private state: InfantryState = "idle";
  private enteredTick = 0;
  private reason = "waiting";
  private aimPoint: Vec2 | undefined;
  private escapeDirection = 0;
  private decision: InfantryDecision = freezeRecord({ state: "idle", transitionReason: "waiting", moveX: 0, fire: false, aimPoint: undefined, perceivedTarget: undefined, cooldownTicks: 0 });

  step(perception: PerceptionSnapshot, tick: number, random: RandomStream): InfantryDecision {
    const target = perception.visibleTarget?.position ??
      (perception.recentTarget && tick - perception.recentTarget.observedTick <= aiBalance.recentTargetTicks ? perception.recentTarget.position : undefined);
    const elapsed = tick - this.enteredTick;
    let fire = false;
    if (this.state === "idle" && target) {
      if (Math.abs(target.x - perception.selfPosition.x) < aiBalance.closeDistance) {
        this.escapeDirection = target.x === perception.selfPosition.x ? (random.integer(0, 1) === 0 ? -1 : 1) : Math.sign(perception.selfPosition.x - target.x);
        this.transition("reposition", "target-too-close", tick);
      } else {
        this.aimPoint = { ...target };
        this.transition("telegraph", "target-acquired", tick);
      }
    } else if (this.state === "reposition" && elapsed >= aiBalance.repositionTicks) {
      if (target) {
        this.aimPoint = { ...target };
        this.transition("telegraph", "target-acquired", tick);
      } else this.transition("idle", "target-lost", tick);
    } else if (this.state === "telegraph" && elapsed >= aiBalance.telegraphTicks) {
      if (target && this.aimPoint) { this.transition("fire", "telegraph-complete", tick); fire = true; }
      else this.transition("idle", "target-lost", tick);
    } else if (this.state === "fire" && elapsed >= 1) {
      this.transition("recover", "shot-fired", tick);
    } else if (this.state === "recover" && elapsed >= aiBalance.recoveryTicks) {
      if (target) { this.aimPoint = { ...target }; this.transition("telegraph", "target-acquired", tick); }
      else this.transition("idle", "target-lost", tick);
    }
    this.decision = freezeRecord({
      state: this.state, transitionReason: this.reason,
      moveX: this.state === "reposition" ? this.escapeDirection : 0,
      fire, aimPoint: this.aimPoint, perceivedTarget: target,
      cooldownTicks: this.state === "recover" ? Math.max(0, aiBalance.recoveryTicks - (tick - this.enteredTick)) : 0,
    });
    return this.decision;
  }

  snapshot(): InfantryDecision { return this.decision; }

  private transition(state: InfantryState, reason: string, tick: number): void {
    this.state = state;
    this.reason = reason;
    this.enteredTick = tick;
    if (state === "idle") this.aimPoint = undefined;
  }
}
