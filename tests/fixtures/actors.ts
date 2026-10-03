import { createActor, type ActorState } from "../../src/game/domain/actors/Actor";
import { collisionProfiles } from "../../src/game/data/collisionProfiles";
import type { CollisionProfile } from "../../src/game/domain/collision/CollisionTypes";

export function actor(
  id: string,
  x = 0,
  y = 0,
  profile: CollisionProfile = collisionProfiles.prey,
): ActorState {
  return createActor({
    id,
    definitionId: "test.actor",
    faction: profile.layer === 1 ? "worm" : "world",
    position: { x, y },
    velocity: { x: 0, y: 0 },
    direction: { x: 1, y: 0 },
    health: 10,
    maxHealth: 10,
    armor: 0,
    tags: [],
    collision: profile,
    lifecycle: "active",
  });
}
