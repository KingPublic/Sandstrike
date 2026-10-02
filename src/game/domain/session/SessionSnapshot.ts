import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { ActorState } from "../actors/Actor";
import type { AbilityState } from "../abilities/Ability";
import type { InfantryDecision } from "../ai/InfantryController";
import type { ComboState } from "../scoring/ComboSystem";
import type { ScoreState } from "../scoring/ScoreSystem";
import type { ThreatState } from "../spawning/ThreatDirector";

import type { HuntSnapshot } from "../hunt/HuntSystems";

import type { ThemeId } from "../../data/themes";

export interface SessionSnapshot {
  readonly themeId?: ThemeId;
  readonly arcade?: boolean;
  readonly mode: "rampage" | "hunt";
  readonly playerActorId: "worm" | "hunter";
  readonly hunt?: HuntSnapshot;
  readonly sessionId: string;
  readonly tick: number;
  readonly seed: number;
  readonly score: ScoreState;
  readonly combo: ComboState;
  readonly threat: ThreatState;
  readonly worm: WormMotionSnapshot;
  readonly actors: readonly ActorState[];
  readonly abilities: readonly AbilityState[];
  readonly ai: readonly Readonly<{ actorId: string; decision: InfantryDecision }>[];
  readonly diagnostics: Readonly<{ eventOverflowCount: number; projectileCount: number }>;
}
