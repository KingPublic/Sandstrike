import { freezeRecord } from "../domain/actors/Actor";
import type { AbilityDefinition } from "../domain/abilities/Ability";
import type { ActorDefinition } from "./actors";
import type { ModeDefinition } from "./modes";

export interface RunDefinitions {
  readonly actors: readonly ActorDefinition[];
  readonly abilities: readonly AbilityDefinition[];
  readonly mode: ModeDefinition;
}

export function validateDefinitions(data: RunDefinitions): RunDefinitions {
  const ids = new Set<string>();
  for (const definition of [...data.actors, ...data.abilities, data.mode]) {
    if (!definition.id || ids.has(definition.id)) throw new Error("Duplicate or empty definition ID.");
    ids.add(definition.id);
  }
  for (const actor of data.actors) {
    positive(actor.health);
    if (!Number.isFinite(actor.armor) || actor.armor < 0 || actor.armor > actor.health) throw new RangeError("Invalid armor.");
    const { layer, mask, shape } = actor.collision;
    if (!Number.isInteger(layer) || layer <= 0 || layer > 8 || (layer & (layer - 1)) !== 0 || !Number.isInteger(mask) || mask <= 0 || (mask & ~15) !== 0 || (mask & layer) !== 0) throw new RangeError("Impossible collision mask.");
    if (shape.kind === "circle" || shape.kind === "capsule") positive(shape.radius);
    if (shape.kind === "box") { positive(shape.halfWidth); positive(shape.halfHeight); }
    if (shape.kind === "capsule" && [shape.from.x, shape.from.y, shape.to.x, shape.to.y].some((n) => !Number.isFinite(n))) throw new RangeError("Invalid capsule.");
    if ("offset" in shape && (!Number.isFinite(shape.offset.x) || !Number.isFinite(shape.offset.y))) throw new RangeError("Invalid offset.");
  }
  for (const ability of data.abilities) {
    ticks(ability.cooldownTicks); ticks(ability.activeTicks);
    positive(ability.radius); positive(ability.damage);
    if (ability.activeTicks > ability.cooldownTicks || !Number.isFinite(ability.forwardOffset) || (ability.resourceCost !== undefined && (!Number.isFinite(ability.resourceCost) || ability.resourceCost < 0))) throw new RangeError("Invalid ability values.");
    if (ability.strategyId !== "forward-circle" || ability.activationConditionId !== "ready") throw new Error("Unknown ability strategy.");
  }
  ticks(data.mode.warningTicks);
  for (const id of data.mode.abilityIds) {
    const ability = data.abilities.find((value) => value.id === id);
    if (!ability?.ownerTags.some((tag) => data.mode.playerTags.includes(tag))) throw new Error("Missing or role-incompatible ability.");
  }
  for (const rule of data.mode.spawnRules) {
    if (!data.actors.some((value) => value.id === rule.definitionId)) throw new Error("Missing spawn definition.");
    positive(rule.weight); ticks(rule.cap);
    if (rule.cap > 128) throw new RangeError("Spawn cap exceeds budget.");
  }
  return freezeRecord(data);
}

function positive(value: number): void { if (!Number.isFinite(value) || value <= 0) throw new RangeError("Expected positive finite value."); }
function ticks(value: number): void { positive(value); if (!Number.isSafeInteger(value)) throw new RangeError("Expected simulation ticks."); }
