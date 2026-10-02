export interface RampageRunResult {
  readonly sessionId: string; readonly seed: number; readonly mode: "rampage";
  readonly reason: "defeated" | "player-ended"; readonly score: number;
  readonly durationSeconds: number; readonly maximumCombo: number;
  readonly preyConsumed: number; readonly infantryDestroyed: number;
  readonly vehiclesDestroyed?: number; readonly aerialDestroyed?: number;
  readonly highestBand: number; readonly healthRecovered: number;
}
export interface HuntRunResult {
  readonly sessionId: string; readonly seed: number; readonly mode: "hunt";
  readonly reason: "victory" | "hunter-defeated" | "hunter-buried" | "relay-destroyed" | "player-ended";
  readonly score: number; readonly durationSeconds: number; readonly maximumCombo: number;
  readonly trapTriggers: number; readonly breachInterruptions: number;
  readonly shotsFired: number; readonly shotsHit: number; readonly exposureWindowsUsed: number;
  readonly hunterHealth: number; readonly relayIntegrity: number; readonly eligibleForRecords: boolean;
}
export type RunResult = RampageRunResult | HuntRunResult;
