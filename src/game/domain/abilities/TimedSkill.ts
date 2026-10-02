import type { AbilityState } from "./Ability";

export class TimedSkill {
  private activeUntil = 0;
  private cooldownUntil = 0;
  constructor(private readonly id: string, private readonly activeTicks: number, private readonly cooldownTicks: number) {
    if (!id || !Number.isSafeInteger(activeTicks) || !Number.isSafeInteger(cooldownTicks) || activeTicks <= 0 || cooldownTicks < activeTicks) throw new RangeError("Invalid skill timing.");
  }
  step(tick: number, pressed: boolean): AbilityState {
    if (!Number.isSafeInteger(tick) || tick < 0) throw new RangeError("Invalid skill tick.");
    if (pressed && tick >= this.cooldownUntil) { this.activeUntil = tick + this.activeTicks; this.cooldownUntil = tick + this.cooldownTicks; }
    return this.snapshot(tick);
  }
  snapshot(tick: number): AbilityState {
    return Object.freeze({ id: this.id, active: tick < this.activeUntil, activeUntilTick: this.activeUntil, cooldownUntilTick: this.cooldownUntil, cooldownTicksRemaining: Math.max(0, this.cooldownUntil - tick) });
  }
  cancel(): void { this.activeUntil = 0; }
}
