import { freezeRecord } from "../domain/actors/Actor";
import { rampageBalance } from "./rampageBalance";

export interface SpawnRule {
  readonly definitionId: string;
  readonly weight: number;
  readonly cap: number;
}
export interface ModeDefinition {
  readonly id: string;
  readonly playerTags: readonly string[];
  readonly abilityIds: readonly string[];
  readonly spawnRules: readonly SpawnRule[];
  readonly warningTicks: number;
}
export const modes = freezeRecord({ rampage: {
  id: "mode.rampage", playerTags: ["worm"], abilityIds: ["ability.bite"],
  spawnRules: [
    { definitionId: "actor.prey", weight: 1, cap: rampageBalance.preyCap },
    { definitionId: "actor.infantry", weight: 1, cap: rampageBalance.infantryCap },
  ], warningTicks: rampageBalance.warningTicks,
} satisfies ModeDefinition });
