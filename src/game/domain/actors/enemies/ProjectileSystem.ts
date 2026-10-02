import { enemies, projectiles, type ProjectileDefinition } from "../../../data/enemies";
import { collisionProfiles } from "../../../data/collisionProfiles";
import { createActor, type ActorState } from "../Actor";
import type { ActorRegistry } from "../ActorRegistry";
import type { CollisionWorld } from "../../collision/CollisionWorld";
import type { DamageCommand } from "../../combat/DamageResolver";
import type { DomainEvent } from "../../events/DomainEvent";
import { isFiniteVec2, type Vec2 } from "../../math/Vector2";

interface ProjectileSlot { id: string | undefined; remainingSeconds: number; definition: ProjectileDefinition; ownerId: string }

export class ProjectileSystem {
  private readonly slots: ProjectileSlot[];
  private sequence = 0;

  constructor(private readonly registry: ActorRegistry, capacity: number = enemies.projectileCapacity) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new RangeError("Invalid projectile capacity.");
    this.slots = Array.from({ length: capacity }, () => ({ id: undefined, remainingSeconds: 0, definition: projectiles.infantry, ownerId: "" }));
  }

  get activeCount(): number { return this.slots.filter((slot) => slot.id !== undefined).length; }

  spawn(ownerId: string, position: Vec2, direction: Vec2, tick: number, definition: ProjectileDefinition = projectiles.infantry): string | undefined {
    if (!definition.id || [definition.damage, definition.speed, definition.lifetimeSeconds].some(v => !Number.isFinite(v) || v <= 0)) throw new RangeError("Invalid projectile definition.");
    if (!isFiniteVec2(position) || !isFiniteVec2(direction) || Math.hypot(direction.x, direction.y) === 0) throw new RangeError("Invalid projectile pose.");
    const slot = this.slots.find((value) => value.id === undefined);
    if (!slot) return undefined;
    const magnitude = Math.hypot(direction.x, direction.y);
    const id = `projectile.${String(++this.sequence)}`;
    this.registry.deferSpawn(createActor({ id, definitionId: definition.id, faction: "military", position, velocity: { x: direction.x / magnitude * definition.speed, y: direction.y / magnitude * definition.speed }, direction: { x: direction.x / magnitude, y: direction.y / magnitude }, health: 1, maxHealth: 1, armor: 0, tags: ["projectile", `owner:${ownerId}`, `fired:${String(tick)}`], collision: collisionProfiles.projectile, lifecycle: "active" }));
    slot.id = id;
    slot.remainingSeconds = definition.lifetimeSeconds; slot.definition = Object.freeze({ ...definition }); slot.ownerId = ownerId;
    return id;
  }

  step(dtSeconds: number, collisionWorld: CollisionWorld, tick = 0, previousTargets?: readonly ActorState[]): Readonly<{ commands: readonly DamageCommand[]; events: readonly DomainEvent[] }> {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) throw new RangeError("Invalid projectile step.");
    const previous = previousTargets ?? this.registry.snapshot();
    for (const slot of this.slots) {
      if (!slot.id) continue;
      const actor = this.registry.get(slot.id);
      if (!actor) continue;
      slot.remainingSeconds -= dtSeconds;
      const position = { x: actor.position.x + actor.velocity.x * dtSeconds, y: actor.position.y + actor.velocity.y * dtSeconds };
      if (slot.remainingSeconds <= 0 || position.x < enemies.bounds.left || position.x > enemies.bounds.right || position.y < enemies.bounds.top || position.y > enemies.bounds.bottom) {
        this.retire(slot, "expired");
        continue;
      }
      this.registry.update({ ...actor, position });
    }
    const commands: DamageCommand[] = [];
    const events: DomainEvent[] = [];
    for (const contact of collisionWorld.query(previous, this.registry.snapshot())) {
      if (contact.kind !== "projectile") continue;
      const slot = this.slots.find((value) => value.id === contact.sourceId);
      if (!slot) continue;
      commands.push({ sourceId: contact.sourceId, targetId: contact.targetId, tick, abilityId: slot.definition.id, amount: slot.definition.damage, tags: ["projectile"], priority: 0 });
      events.push({ type: "contact", tick, contact });
      this.retire(slot, "destroyed");
    }
    return Object.freeze({ commands: Object.freeze(commands), events: Object.freeze(events) });
  }

  private retire(slot: ProjectileSlot, cause: "expired" | "destroyed"): void {
    if (slot.id) this.registry.markForRemoval(slot.id, cause);
    slot.id = undefined;
    slot.remainingSeconds = 0;
    slot.definition = projectiles.infantry; slot.ownerId = "";
  }
}
