import { bossBalance } from "../../data/bossBalance";
import { freezeRecord } from "../actors/Actor";

export type HuntStage = "ascent" | "boss";

export interface HuntStageSnapshot {
  readonly stage: HuntStage;
  readonly warningTicks: number;
  readonly frozen: boolean;
}

export interface HuntStageInput {
  readonly hunterAtSummit: boolean;
  readonly ended: boolean;
}

/**
 * Owns the single summit transition: it freezes the hazard, cancels any pending
 * worm return and requests exactly one boss entrance with a visible warning.
 */
export class HuntStageDirector {
  private stage: HuntStage = "ascent";
  private warningTicks = 0;
  private spawnRequested = false;

  step(tick: number, input: HuntStageInput): HuntStageSnapshot {
    if (this.stage === "ascent" && input.hunterAtSummit && !input.ended) {
      this.stage = "boss";
      this.warningTicks = bossBalance.entranceWarningTicks;
      this.spawnRequested = true;
    } else if (this.stage === "boss" && this.warningTicks > 0) {
      this.warningTicks = Math.max(0, this.warningTicks - 1);
    }
    return this.snapshot();
  }

  consumeBossSpawn(): boolean {
    const requested = this.spawnRequested;
    this.spawnRequested = false;
    return requested;
  }

  snapshot(): HuntStageSnapshot {
    return freezeRecord({ stage: this.stage, warningTicks: this.warningTicks, frozen: this.stage === "boss" });
  }
}
