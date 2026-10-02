import { freezeRecord } from "../actors/Actor";

export const WORM_RETURN_TICKS = 600;
export const WORM_GENERATION_CAP = 5;

export interface WormLifeInput {
  readonly wormDead: boolean;
  readonly summitReached: boolean;
  readonly ended: boolean;
}

export interface WormLifeSnapshot {
  readonly phase: "alive" | "absent" | "boss";
  readonly generation: number;
  readonly kills: number;
  readonly returnTick: number;
  readonly returnInTicks: number;
}

/** Recovery and cadence scale with the number of ordinary kills, capped for fairness. */
export function aggressionProfile(generation: number): Readonly<{ recoverTicks: number; decisionTicks: number; breachBoost: boolean }> {
  const level = Math.max(0, Math.min(WORM_GENERATION_CAP, Math.floor(generation)));
  return Object.freeze({ recoverTicks: Math.round(120 - level * 14.4), decisionTicks: Math.max(8, 12 - level), breachBoost: level >= 3 });
}

/**
 * Owns the ascent worm's alive/absent/boss life cycle. One worm at a time; an
 * ordinary kill removes it for 600 ticks and the next one returns stronger.
 */
export class WormLifeDirector {
  private phase: WormLifeSnapshot["phase"] = "alive";
  private generation = 0;
  private kills = 0;
  private returnTick = 0;
  private arrived = false;
  private spawnRequested = false;

  step(tick: number, input: WormLifeInput): WormLifeSnapshot {
    if (!Number.isSafeInteger(tick) || tick < 0) throw new RangeError("Worm life tick must be a non-negative safe integer.");
    if (input.summitReached || input.ended) this.arrived = this.arrived || input.summitReached;
    if (!input.ended) {
      if (input.summitReached) {
        this.phase = "boss";
      } else if (this.phase === "alive" && input.wormDead) {
        this.phase = "absent";
        this.kills += 1;
        this.returnTick = tick + WORM_RETURN_TICKS;
      } else if (this.phase === "absent" && tick >= this.returnTick) {
        this.phase = "alive";
        this.generation = Math.min(WORM_GENERATION_CAP, this.generation + 1);
        this.spawnRequested = true;
      }
    }
    return this.snapshot(tick);
  }

  /** True once per return; consumed by the session so a worm spawns exactly once. */
  consumeSpawnRequest(): boolean {
    const requested = this.spawnRequested;
    this.spawnRequested = false;
    return requested;
  }

  snapshot(tick: number): WormLifeSnapshot {
    return freezeRecord({
      phase: this.phase,
      generation: this.generation,
      kills: this.kills,
      returnTick: this.returnTick,
      returnInTicks: this.phase === "absent" ? Math.max(0, this.returnTick - tick) : 0,
    });
  }
}
