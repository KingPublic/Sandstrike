import { combatBalance } from "../../data/combatBalance";
import type { ActorRegistry } from "../actors/ActorRegistry";
import type { DomainEvent } from "../events/DomainEvent";
import { DamageResolver, type DamageCommand } from "./DamageResolver";
import { healHealth } from "./Health";

export class CombatSystem {
  private readonly resolver = new DamageResolver();

  resolve(registry: ActorRegistry, commands: readonly DamageCommand[], preserveCommittedImpacts = false): readonly DomainEvent[] {
    const events: DomainEvent[] = [];
    const committedSources = new Set(preserveCommittedImpacts ? registry.snapshot().filter(a => a.lifecycle === "active" && a.health > 0).map(a => a.id) : []);
    const sorted = [...commands].sort((a, b) => a.priority - b.priority || a.targetId.localeCompare(b.targetId) || a.sourceId.localeCompare(b.sourceId));
    for (const command of sorted) {
      const target = registry.get(command.targetId);
      const source = registry.get(command.sourceId);
      if (target?.lifecycle !== "active" || (!command.tags.includes("projectile") && !(command.tags.includes("impact") && committedSources.has(command.sourceId)) && (source?.lifecycle !== "active" || source.health <= 0)) || target.health <= 0 || command.amount <= 0) continue;
      const result = this.resolver.resolve(target, command);
      registry.update(result.actor);
      events.push({ type: "damage-applied", tick: command.tick, sourceId: command.sourceId, targetId: target.id, abilityId: command.abilityId, amount: result.applied, ...(result.blocked ? { blocked: result.blocked } : {}), tags: command.tags, position: target.position });
      if (result.actor.health > 0 || target.tags.includes("worm")) continue;
      const consumed = target.tags.includes("consumable") && (source?.tags.includes("worm") ?? false);
      if (!registry.markForRemoval(target.id, consumed ? "consumed" : "destroyed")) continue;
      if (consumed && source) {
        events.push({ type: "target-consumed", tick: command.tick, sourceId: source.id, targetId: target.id, definitionId: target.definitionId, category: "prey", abilityId: command.abilityId, tags: command.tags, position: target.position });
        const healing = healHealth(source.health, combatBalance.preyHealing, source.maxHealth);
        registry.update({ ...source, health: healing.health });
        events.push({ type: "actor-healed", tick: command.tick, actorId: source.id, amount: healing.recovered, position: source.position });
      } else {
        events.push({ type: "actor-destroyed", tick: command.tick, sourceId: command.sourceId, targetId: target.id, definitionId: target.definitionId, category: target.tags.includes("infantry") ? "infantry" : target.tags.includes("vehicle") ? "vehicle" : target.tags.includes("aerial") ? "aerial" : "other", abilityId: command.abilityId, tags: command.tags, position: target.position });
      }
    }
    return Object.freeze(events);
  }
}
