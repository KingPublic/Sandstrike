import type { DomainEvent } from "../events/DomainEvent";

export type RewardEvent = Extract<DomainEvent, { type: "target-consumed" | "actor-destroyed" }>;
export function rewardEvents(events: readonly DomainEvent[]): readonly RewardEvent[] {
  return events.filter((event): event is RewardEvent => (event.type === "target-consumed" || event.type === "actor-destroyed") && event.sourceId === "worm" && (event.category === "prey" || event.category === "infantry"))
    .sort((a, b) => a.tick - b.tick || a.targetId.localeCompare(b.targetId));
}
