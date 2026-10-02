import { createActor, type ActorState } from "../domain/actors/Actor";
import type { Vec2 } from "../domain/math/Vector2";
import type { CollisionProfile } from "../domain/collision/CollisionTypes";
import { collisionProfiles } from "./collisionProfiles";
import { combatBalance } from "./combatBalance";
import { enemies } from "./enemies";
import { huntBalance } from "./huntBalance";
import { allies } from "./allies";

export interface ActorDefinition {
  readonly id: string;
  readonly faction: ActorState["faction"];
  readonly health: number;
  readonly armor: number;
  readonly tags: readonly string[];
  readonly collision: CollisionProfile;
}

export const actorDefinitions: readonly ActorDefinition[] = Object.freeze([
  Object.freeze({ id: "actor.hunter", faction: "hunter", health: huntBalance.hunterHealth, armor: 0, tags: Object.freeze(["hunter"]), collision: collisionProfiles.hunter }),
  Object.freeze({ id: "actor.vehicle", faction: "military", health: enemies.vehicleHealth, armor: enemies.vehicleArmor, tags: Object.freeze(["vehicle"]), collision: collisionProfiles.vehicle }),
  Object.freeze({ id: "actor.aerial", faction: "military", health: enemies.aerialHealth, armor: 0, tags: Object.freeze(["aerial"]), collision: collisionProfiles.aerial }),
  Object.freeze({ id: "actor.relay", faction: "hunter", health: huntBalance.relayHealth, armor: 0, tags: Object.freeze(["relay"]), collision: collisionProfiles.relay }),
  Object.freeze({ id: "actor.ally", faction: "hunter", health: allies.groundHealth, armor: 0, tags: Object.freeze(["ally", "hunter"]), collision: collisionProfiles.hunter }),
  Object.freeze({ id: "actor.heli", faction: "hunter", health: allies.airHealth, armor: 0, tags: Object.freeze(["ally", "ally-air"]), collision: collisionProfiles.aerial }),
  Object.freeze({ id: "actor.worm", faction: "worm", health: combatBalance.wormHealth, armor: 0, tags: Object.freeze(["worm"]), collision: collisionProfiles.worm }),
  Object.freeze({ id: "actor.prey", faction: "world", health: combatBalance.preyHealth, armor: 0, tags: Object.freeze(["prey", "consumable"]), collision: collisionProfiles.prey }),
  // Bait carcass in the rising sand: the only healing the rampaging worm gets.
  Object.freeze({ id: "actor.carrion", faction: "world", health: combatBalance.preyHealth, armor: 0, tags: Object.freeze(["prey", "consumable", "carrion"]), collision: collisionProfiles.prey }),
  Object.freeze({ id: "actor.infantry", faction: "military", health: enemies.infantryHealth, armor: 0, tags: Object.freeze(["infantry"]), collision: collisionProfiles.infantry }),
]);

export function spawnActor(id: string, definitionId: string, position: Vec2): ActorState {
  const definition = actorDefinitions.find((value) => value.id === definitionId);
  if (!definition) throw new Error(`Unknown actor definition ${definitionId}.`);
  return createActor({ id, definitionId, faction: definition.faction, position, velocity: { x: 0, y: 0 }, direction: { x: 1, y: 0 }, health: definition.health, maxHealth: definition.health, armor: definition.armor, tags: definition.tags, collision: definition.collision, lifecycle: "active" });
}
