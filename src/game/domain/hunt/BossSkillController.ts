import { bossBalance as b } from "../../data/bossBalance";
import { freezeRecord } from "../actors/Actor";

export interface BossSkillSnapshot {
  readonly phase: "idle" | "windup" | "active";
  readonly shieldActive: boolean;
  readonly activeUntilTick: number;
  readonly windupEndsTick: number;
  readonly cooldownEndsTick: number;
}

/**
 * Summit boss immunity cycle: a visible windup, a fixed immunity span and a
 * long cooldown so warned attacks stay readable and fair.
 */
export class BossSkillController {
  private phase: BossSkillSnapshot["phase"] = "idle";
  private windupEndsTick = 0;
  private activeUntilTick = 0;
  private cooldownEndsTick = 0;

  reset(tick = 0): void {
    this.phase = "idle";
    this.windupEndsTick = 0;
    this.activeUntilTick = 0;
    this.cooldownEndsTick = tick + b.entranceWarningTicks + b.shieldCooldownTicks;
  }

  step(tick: number): BossSkillSnapshot {
    if (this.phase === "idle" && tick >= this.cooldownEndsTick) {
      this.phase = "windup";
      this.windupEndsTick = tick + b.shieldWindupTicks;
    } else if (this.phase === "windup" && tick >= this.windupEndsTick) {
      this.phase = "active";
      this.activeUntilTick = tick + b.shieldActiveTicks;
    } else if (this.phase === "active" && tick >= this.activeUntilTick) {
      this.phase = "idle";
      this.cooldownEndsTick = tick + b.shieldCooldownTicks;
    }
    return this.snapshot();
  }

  get shieldActive(): boolean { return this.phase === "active"; }

  snapshot(): BossSkillSnapshot {
    return freezeRecord({
      phase: this.phase,
      shieldActive: this.phase === "active",
      activeUntilTick: this.activeUntilTick,
      windupEndsTick: this.windupEndsTick,
      cooldownEndsTick: this.cooldownEndsTick,
    });
  }
}
