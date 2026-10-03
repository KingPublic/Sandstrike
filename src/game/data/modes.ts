import { freezeRecord } from "../domain/actors/Actor";
import { ascentRampageBalance } from "./ascentRampage";
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
    { definitionId: "actor.vehicle", weight: 1, cap: rampageBalance.vehicleCap },
    { definitionId: "actor.aerial", weight: 1, cap: rampageBalance.aerialCap },
  ], warningTicks: rampageBalance.warningTicks,
} satisfies ModeDefinition,
/** Ascent rampage: carrion in the sand and the five rival Hunters. */
ascentRampage: {
  id: "mode.ascent-rampage", playerTags: ["worm"], abilityIds: ["ability.bite"],
  spawnRules: [
    { definitionId: "actor.carrion", weight: 1, cap: ascentRampageBalance.carrionCap + 32 },
    { definitionId: "actor.hunter", weight: 1, cap: ascentRampageBalance.rivals.length + 2 },
  ], warningTicks: ascentRampageBalance.rivalFireCadenceTicks,
} satisfies ModeDefinition });
