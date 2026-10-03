import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { RandomStream } from "../random/RandomSource";
import type { PerceptionSnapshot } from "./PerceptionSnapshot";
import type { InfantryDecision, InfantryState } from "./InfantryController";
export class ThreatController {
  private state: InfantryState = "idle"; private started = 0; private nextTelegraph = 0;
  private aimPoint: Vec2 | undefined; private direction = 0;
  private decision: InfantryDecision = freezeRecord({ state: "idle", transitionReason: "patrol", moveX: 0, fire: false, aimPoint: undefined, perceivedTarget: undefined, cooldownTicks: 0 });
  step(p: PerceptionSnapshot, tick: number, random: RandomStream): InfantryDecision {
    if (!this.direction) this.direction = random.integer(0, 1) ? 1 : -1;
    if (p.selfPosition.x > 2300) this.direction = -1; if (p.selfPosition.x < -2300) this.direction = 1;
    const target = p.visibleTarget?.position ?? (p.recentTarget && tick - p.recentTarget.observedTick < 60 ? p.recentTarget.position : undefined);
    let fire = false;
    if ((this.state === "idle" || this.state === "recover") && tick >= this.nextTelegraph && target) { this.state = "telegraph"; this.started = tick; this.aimPoint = { ...target }; }
    else if (this.state === "telegraph" && tick - this.started >= 60) {
      if (p.visibleTarget) { this.state = "fire"; fire = true; this.nextTelegraph = tick + 120; }
      else { this.state = "idle"; this.aimPoint = undefined; }
    } else if (this.state === "fire") this.state = "recover";
    this.decision = freezeRecord({ state: this.state, transitionReason: fire ? "locked-shot" : this.state === "telegraph" ? "60-tick warning" : "bounded patrol", moveX: this.state === "telegraph" || fire ? 0 : this.direction, fire, aimPoint: this.aimPoint, perceivedTarget: target, cooldownTicks: Math.max(0, this.nextTelegraph - tick) });
    return this.decision;
  }
  snapshot(): InfantryDecision { return this.decision; }
}
