import { createActor, type ActorState } from "../domain/actors/Actor";
import type { Vec2 } from "../domain/math/Vector2";
import type { CollisionProfile } from "../domain/collision/CollisionTypes";
import { collisionProfiles } from "./collisionProfiles";
import { combatBalance } from "./combatBalance";

export interface ActorDefinition {
  readonly id: string;
  readonly faction: ActorState["faction"];
  readonly health: number;
  readonly armor: number;
  readonly tags: readonly string[];
  readonly collision: CollisionProfile;
}

export const actorDefinitions: readonly ActorDefinition[] = Object.freeze([
  Object.freeze({ id: "actor.worm", faction: "worm", health: combatBalance.wormHealth, armor: 0, tags: Object.freeze(["worm"]), collision: collisionProfiles.worm }),
  Object.freeze({ id: "actor.prey", faction: "world", health: combatBalance.preyHealth, armor: 0, tags: Object.freeze(["prey", "consumable"]), collision: collisionProfiles.prey }),
  Object.freeze({ id: "actor.infantry", faction: "military", health: 25, armor: 0, tags: Object.freeze(["infantry"]), collision: collisionProfiles.infantry }),
]);

export function spawnActor(id: string, definitionId: string, position: Vec2): ActorState {
  const definition = actorDefinitions.find((value) => value.id === definitionId);
  if (!definition) throw new Error(`Unknown actor definition ${definitionId}.`);
  return createActor({ id, definitionId, faction: definition.faction, position, velocity: { x: 0, y: 0 }, direction: { x: 1, y: 0 }, health: definition.health, maxHealth: definition.health, armor: definition.armor, tags: definition.tags, collision: definition.collision, lifecycle: "active" });
}
