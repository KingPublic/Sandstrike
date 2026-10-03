import { rampageBalance } from "../../data/rampageBalance";
import type { DomainEvent } from "../events/DomainEvent";
import { rewardEvents } from "./RewardEvents";

export interface ComboState {
  readonly chain: number;
  readonly multiplier: number;
  readonly graceTicksRemaining: number;
  readonly decayTicksRemaining: number;
  readonly phase: "idle" | "grace" | "decay";
  readonly maximumChain: number;
  readonly lastCreditedCategory: string | undefined;
}
export class ComboSystem {
  private readonly credited = new Set<string>();
  private chain = 0;
  private maximum = 0;
  private lastCategory: string | undefined;
  private lastCreditTick = 0;
  private tick = 0;

  step(events: readonly DomainEvent[], tick: number): ComboState {
    if (tick < this.tick) throw new RangeError("Combo tick cannot go backward.");
    this.tick = tick;
    if (tick - this.lastCreditTick >= rampageBalance.graceTicks + rampageBalance.decayTicks && this.chain > 0) { this.chain = 0; this.lastCategory = undefined; }
    for (const event of rewardEvents(events)) {
      if (this.credited.has(event.targetId)) continue;
      this.credited.add(event.targetId);
      this.chain += event.category === this.lastCategory ? rampageBalance.repeatFactor : 1;
      this.maximum = Math.max(this.maximum, this.chain);
      this.lastCategory = event.category;
      this.lastCreditTick = tick;
    }
    return this.snapshot();
  }

  snapshot(): ComboState {
    const elapsed = this.tick - this.lastCreditTick;
    return Object.freeze({ chain: this.chain, multiplier: this.chain >= 6 ? 3 : this.chain >= 3 ? 2 : 1, maximumChain: this.maximum,
      lastCreditedCategory: this.lastCategory, phase: this.chain === 0 ? "idle" : elapsed > rampageBalance.graceTicks ? "decay" : "grace",
      graceTicksRemaining: this.chain > 0 ? Math.max(0, rampageBalance.graceTicks - elapsed) : 0,
      decayTicksRemaining: this.chain > 0 && elapsed > rampageBalance.graceTicks ? Math.max(0, rampageBalance.graceTicks + rampageBalance.decayTicks - elapsed) : 0 });
  }
}
