import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { ActorState } from "../actors/Actor";

export interface SessionSnapshot {
  readonly tick: number;
  readonly seed: number;
  readonly worm: WormMotionSnapshot;
  readonly actors: readonly ActorState[];
  readonly diagnostics: Readonly<{ eventOverflowCount: number }>;
}
