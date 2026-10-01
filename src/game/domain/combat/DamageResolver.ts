import { combatBalance } from "../../data/combatBalance";
import { createActor, freezeRecord, type ActorId, type ActorState } from "../actors/Actor";
import { clampHealth } from "./Health";

export interface DamageCommand {
  readonly sourceId: ActorId;
  readonly targetId: ActorId;
  readonly abilityId: string;
  readonly tick: number;
  readonly amount: number;
  readonly tags: readonly string[];
  readonly priority: number;
}

export interface DamageResult {
  readonly actor: ActorState;
  readonly command: DamageCommand;
  readonly applied: number;
  readonly blocked: "armor" | "invulnerable" | undefined;
}

export class DamageResolver {
  resolve(target: ActorState, command: DamageCommand): DamageResult {
    if (!Number.isFinite(command.amount) || command.amount < 0 || !Number.isSafeInteger(command.tick) || command.tick < 0) throw new RangeError("Invalid damage command.");
    const blocked = command.tick < (target.invulnerableUntilTick ?? 0)
      ? "invulnerable" : undefined;
    const damage = blocked ? 0 : Math.max(0, command.amount - (command.tags.includes("armor-piercing") ? 0 : target.armor));
    const health = clampHealth(target.health - damage, target.maxHealth);
    const applied = target.health - health;
    const actor = createActor({ ...target, health,
      invulnerableUntilTick: applied > 0 && target.tags.includes("worm")
        ? command.tick + combatBalance.wormInvulnerabilityTicks : (target.invulnerableUntilTick ?? 0),
    });
    return Object.freeze({ actor, command: freezeRecord(command), applied, blocked: blocked ?? (damage === 0 && command.amount > 0 ? "armor" : undefined) });
  }
}

export function impactDamage(speed: number): number {
  if (!Number.isFinite(speed) || speed < combatBalance.impactThreshold) return 0;
  const ratio = Math.min(1, (speed - combatBalance.impactThreshold) / (combatBalance.impactMaximumSpeed - combatBalance.impactThreshold));
  return combatBalance.impactMinimumDamage + ratio * (combatBalance.impactMaximumDamage - combatBalance.impactMinimumDamage);
}
