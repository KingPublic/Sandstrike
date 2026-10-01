import { rampageBalance } from "../../data/rampageBalance";
import type { DomainEvent } from "../events/DomainEvent";

export interface ThreatState { readonly band: 0 | 1; readonly warningTicksRemaining: number; readonly warningStartedTick: number | undefined }
export class ThreatDirector {
  private band: 0 | 1 = 0;
  private started: number | undefined;
  private tick = 0;
  step(snapshot: Readonly<{ tick: number; basePoints: number }>, events: readonly DomainEvent[]): ThreatState {
    if (events.some((event) => event.tick > snapshot.tick)) throw new RangeError("Threat cannot observe future events.");
    this.tick = snapshot.tick;
    if (this.started === undefined && (snapshot.tick >= rampageBalance.bandTimeTicks || snapshot.basePoints >= rampageBalance.bandBasePoints)) this.started = snapshot.tick;
    if (this.started !== undefined && snapshot.tick - this.started >= rampageBalance.warningTicks) this.band = 1;
    return this.snapshot();
  }
  snapshot(): ThreatState { return Object.freeze({ band: this.band, warningStartedTick: this.started, warningTicksRemaining: this.started === undefined ? 0 : Math.max(0, rampageBalance.warningTicks - (this.tick - this.started)) }); }
}
