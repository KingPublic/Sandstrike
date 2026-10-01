import type { WormMotionSnapshot } from "../movement/WormMovementTypes";

export interface SessionSnapshot {
  readonly tick: number;
  readonly seed: number;
  readonly worm: WormMotionSnapshot;
}
