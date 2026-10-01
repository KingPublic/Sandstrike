import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { ActorState } from "../actors/Actor";
import type { AbilityState } from "../abilities/Ability";
import type { InfantryDecision } from "../ai/InfantryController";

export interface SessionSnapshot {
  readonly tick: number;
  readonly seed: number;
  readonly worm: WormMotionSnapshot;
  readonly actors: readonly ActorState[];
  readonly abilities: readonly AbilityState[];
  readonly ai: readonly Readonly<{ actorId: string; decision: InfantryDecision }>[];
  readonly diagnostics: Readonly<{ eventOverflowCount: number; projectileCount: number }>;
}
