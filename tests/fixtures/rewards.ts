import type { DomainEvent } from "../../src/game/domain/events/DomainEvent";

export function reward(id: string, category: "prey" | "infantry" = "prey", tick = 1): DomainEvent {
  const common = { tick, sourceId: "worm", targetId: id, definitionId: `actor.${category}`, category, abilityId: "ability.bite", tags: ["bite"], position: { x: 0, y: 0 } };
  return category === "prey" ? { ...common, category, type: "target-consumed" } : { ...common, category, type: "actor-destroyed" };
}
