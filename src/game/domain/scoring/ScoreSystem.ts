import { rampageBalance } from "../../data/rampageBalance";
import type { DomainEvent } from "../events/DomainEvent";
import type { ComboState } from "./ComboSystem";
import { rewardEvents } from "./RewardEvents";

export interface ScoreState { readonly points: number; readonly basePoints: number; readonly preyConsumed: number; readonly infantryDestroyed: number }
export interface ScoreDelta { readonly points: number; readonly basePoints: number }
export class ScoreSystem {
  private readonly credited = new Set<string>();
  private state: ScoreState = Object.freeze({ points: 0, basePoints: 0, preyConsumed: 0, infantryDestroyed: 0 });
  private lastCategory: string | undefined;
  private breachTargets: number | undefined;

  consume(events: readonly DomainEvent[], combo: ComboState): ScoreDelta {
    if (events.some((event) => event.type === "worm-breached")) this.breachTargets = 0;
    let points = 0;
    let basePoints = 0;
    let prey = 0;
    let infantry = 0;
    for (const event of rewardEvents(events)) {
      if (this.credited.has(event.targetId)) continue;
      this.credited.add(event.targetId);
      const base = event.category === "prey" ? rampageBalance.preyPoints : rampageBalance.infantryPoints;
      const factor = event.category === this.lastCategory ? rampageBalance.repeatFactor : this.lastCategory ? 1 + rampageBalance.varietyBonus : 1;
      const bonus = this.breachTargets !== undefined && this.breachTargets > 0 ? rampageBalance.breachBonus : 0;
      points += Math.floor(base * (factor + bonus) * combo.multiplier);
      basePoints += base;
      if (event.category === "prey") prey += 1; else infantry += 1;
      if (this.breachTargets !== undefined) this.breachTargets += 1;
      this.lastCategory = event.category;
    }
    if (events.some((event) => event.type === "worm-returned-underground")) this.breachTargets = undefined;
    this.state = Object.freeze({ points: this.state.points + points, basePoints: this.state.basePoints + basePoints, preyConsumed: this.state.preyConsumed + prey, infantryDestroyed: this.state.infantryDestroyed + infantry });
    return Object.freeze({ points, basePoints });
  }
  snapshot(): ScoreState { return this.state; }
}
