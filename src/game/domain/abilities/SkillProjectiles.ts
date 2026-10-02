import { createActor, type ActorState } from "../actors/Actor";
import { CollisionWorld } from "../collision/CollisionWorld";
import type { DamageCommand } from "../combat/DamageResolver";
import type { Vec2 } from "../math/Vector2";

export interface SkillProjectile { readonly id: string; readonly position: Vec2; readonly direction: Vec2; readonly kind: "fire" | "venom"; readonly expiresTick: number }
export class SkillProjectiles {
  private items: SkillProjectile[] = [];
  private sequence = 0;
  private readonly collisions = new CollisionWorld();
  volley(kind: SkillProjectile["kind"], owner: ActorState, direction: Vec2, tick: number): void {
    const heading = Math.atan2(direction.y, direction.x);
    for (const angle of [-.24, 0, .24]) {
      if (this.items.length >= 12) break;
      const d = { x: Math.cos(heading + angle), y: Math.sin(heading + angle) };
      this.items.push({ id: `skill-shot.${String(++this.sequence)}`, position: { x: owner.position.x + d.x * 36, y: owner.position.y + d.y * 36 }, direction: d, kind, expiresTick: tick + 90 });
    }
  }
  step(owner: ActorState, actors: readonly ActorState[], tick: number): Readonly<{ commands: readonly DamageCommand[]; poison: readonly string[] }> {
    const commands: DamageCommand[] = [], poison: string[] = [], remaining: SkillProjectile[] = [];
    const targets = actors.filter(a => a.health > 0 && a.lifecycle === "active" && (a.faction === "military" || a.faction === "world") && a.collision.layer !== 8)
      .map(a => createActor({ ...a, collision: { ...a.collision, mask: a.collision.mask | 8 } }));
    for (const item of this.items) {
      if (tick >= item.expiresTick) continue;
      const current = { ...item, position: { x: item.position.x + item.direction.x * 620 / 60, y: item.position.y + item.direction.y * 620 / 60 } };
      const actor = (shot: SkillProjectile) => createActor({ ...owner, id: shot.id, position: shot.position, collision: { id: "skill-projectile", layer: 8, mask: 2 | 4, shape: { kind: "circle", radius: 6 } } });
      const hit = this.collisions.query([actor(item), ...targets], [actor(current), ...targets]).find(c => c.sourceId === item.id);
      if (hit) {
        commands.push({ sourceId: owner.id, targetId: hit.targetId, abilityId: `skill.${item.kind}`, tick, amount: item.kind === "fire" ? 18 : 8, tags: [item.kind], priority: 0 });
        if (item.kind === "venom") poison.push(hit.targetId);
      } else if (Math.abs(current.position.x) < 2600 && current.position.y > -3000 && current.position.y < 3300) remaining.push(current);
    }
    this.items = remaining;
    return { commands, poison };
  }
  clear(): void { this.items = []; }
  snapshot(): readonly SkillProjectile[] { return Object.freeze(this.items.map(p => Object.freeze({ ...p, position: Object.freeze({ ...p.position }), direction: Object.freeze({ ...p.direction }) }))); }
}
