export interface RunResult {
  readonly sessionId: string; readonly seed: number; readonly mode: "rampage";
  readonly reason: "defeated" | "player-ended"; readonly score: number;
  readonly durationSeconds: number; readonly maximumCombo: number;
  readonly preyConsumed: number; readonly infantryDestroyed: number;
  readonly highestBand: number; readonly healthRecovered: number;
}
