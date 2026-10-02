import type { CharacterId } from "../../data/characters";
import type { ThemeId } from "../../data/themes";
interface RunOwnership { readonly gameplayVersion?: 3; readonly characterId?: CharacterId; readonly themeId?: ThemeId }
export interface RampageRunResult extends RunOwnership {
  readonly sessionId: string; readonly seed: number; readonly mode: "rampage";
  readonly reason: "defeated" | "player-ended" | "all-hunters-defeated"; readonly score: number;
  readonly durationSeconds: number; readonly maximumCombo: number;
  readonly preyConsumed: number; readonly infantryDestroyed: number;
  readonly vehiclesDestroyed?: number; readonly aerialDestroyed?: number;
  readonly highestBand: number; readonly healthRecovered: number;
  /** True for the ascent variant, where five Hunter bots are the opposition. */
  readonly ascentRampage?: true;
  readonly huntersDefeated?: number; readonly huntersTotal?: number;
}
export interface HuntRunResult extends RunOwnership {
  readonly sessionId: string; readonly seed: number; readonly mode: "hunt";
  readonly reason: "victory" | "hunter-defeated" | "hunter-buried" | "relay-destroyed" | "player-ended";
  readonly score: number; readonly durationSeconds: number; readonly maximumCombo: number;
  readonly trapTriggers: number; readonly breachInterruptions: number;
  readonly shotsFired: number; readonly shotsHit: number; readonly exposureWindowsUsed: number;
  readonly hunterHealth: number; readonly relayIntegrity: number; readonly eligibleForRecords: boolean;
  readonly bossDefeated?: boolean;
}
export type RunResult = RampageRunResult | HuntRunResult;
