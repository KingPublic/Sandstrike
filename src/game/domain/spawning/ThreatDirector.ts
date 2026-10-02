import { rampageBalance } from "../../data/rampageBalance";
import type { DomainEvent } from "../events/DomainEvent";

export type ResponseBand = 0 | 1 | 2 | 3;
export interface ThreatState { readonly band: ResponseBand; readonly warningTicksRemaining: number; readonly warningStartedTick: number | undefined }
export class ThreatDirector {
  private band: ResponseBand = 0;
  private started: number | undefined;
  private tick = 0;
  constructor(initialBand: ResponseBand = 0) { this.band = initialBand; }
  step(snapshot: Readonly<{ tick: number; basePoints: number }>, events: readonly DomainEvent[]): ThreatState {
    if (events.some((event) => event.tick > snapshot.tick)) throw new RangeError("Threat cannot observe future events.");
    this.tick = snapshot.tick;
    const thresholds: readonly (readonly [number, number])[] = [[rampageBalance.bandTimeTicks, rampageBalance.bandBasePoints], [rampageBalance.band2TimeTicks, rampageBalance.band2BasePoints], [rampageBalance.band3TimeTicks, rampageBalance.band3BasePoints]];
    const threshold = this.band < 3 ? thresholds[this.band] : undefined;
    if (this.started === undefined && threshold && (snapshot.tick >= threshold[0] || snapshot.basePoints >= threshold[1])) this.started = snapshot.tick;
    if (this.started !== undefined && snapshot.tick - this.started >= rampageBalance.warningTicks) { this.band = Math.min(3, this.band + 1) as ResponseBand; this.started = undefined; }
    return this.snapshot();
  }
  snapshot(): ThreatState { return Object.freeze({ band: this.band, warningStartedTick: this.started, warningTicksRemaining: this.started === undefined ? 0 : Math.max(0, rampageBalance.warningTicks - (this.tick - this.started)) }); }
}
