import type { AbilityDefinition } from "../domain/abilities/Ability";

export const abilities = Object.freeze({
  bite: Object.freeze({
    id: "ability.bite", ownerTags: Object.freeze(["worm"]),
    cooldownTicks: 24, activeTicks: 6,
    activationConditionId: "ready", strategyId: "forward-circle",
    debugTags: Object.freeze(["bite"]), feedbackHooks: Object.freeze(["bite-hit"]),
    radius: 34, forwardOffset: 20, damage: 15,
  } satisfies AbilityDefinition),
});
