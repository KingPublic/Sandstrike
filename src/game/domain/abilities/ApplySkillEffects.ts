import type { ActorRegistry } from "../actors/ActorRegistry";
import type { SkillFrame } from "./CharacterSkills";

export function applySkillEffects(registry: ActorRegistry, ownerId: string, frame: SkillFrame): void {
  const owner = registry.get(ownerId);
  if (!owner || owner.health <= 0) return;
  if (frame.invulnerableUntilTick !== undefined) registry.update({ ...owner, invulnerableUntilTick: Math.max(owner.invulnerableUntilTick ?? 0, frame.invulnerableUntilTick) });
  for (const heal of frame.heals) {
    const actor = registry.get(heal.actorId);
    if (actor && actor.health > 0 && actor.faction === owner.faction) registry.update({ ...actor, health: Math.min(actor.maxHealth, actor.health + heal.amount) });
  }
  for (const push of frame.knockback) {
    const actor = registry.get(push.actorId);
    if (actor && actor.health > 0) registry.update({ ...actor, position: push.position });
  }
}
