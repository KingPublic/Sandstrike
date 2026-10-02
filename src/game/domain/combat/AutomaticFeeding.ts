import { createActor, type ActorState } from "../actors/Actor";
import { CollisionWorld } from "../collision/CollisionWorld";
import type { DamageCommand } from "./DamageResolver";

const contacts = new CollisionWorld();
export function automaticMouthCommands(previous: readonly ActorState[], current: readonly ActorState[], tick: number): readonly DamageCommand[] {
  const mouth = (actor: ActorState): ActorState => actor.id !== "worm" ? actor : createActor({ ...actor, collision: {
    id: "contact.mouth", layer: 1, mask: 2 | 4,
    shape: { kind: "circle", radius: 16, offset: { x: actor.direction.x * 24, y: actor.direction.y * 24 } },
  } });
  return Object.freeze(contacts.query(previous.map(mouth), current.map(mouth))
    .filter(contact => contact.sourceId === "worm")
    .map(contact => Object.freeze({ sourceId: "worm", targetId: contact.targetId, tick, abilityId: "ability.feed", amount: 15, tags: Object.freeze(["bite"]), priority: 1 })));
}
