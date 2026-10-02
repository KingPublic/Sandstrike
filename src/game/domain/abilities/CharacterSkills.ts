import type { CharacterDefinition } from "../../data/characters";
import { freezeRecord, type ActorState } from "../actors/Actor";
import type { AbilityState } from "./Ability";
import { TimedSkill } from "./TimedSkill";
import { SkillProjectiles, type SkillProjectile } from "./SkillProjectiles";
import type { DamageCommand } from "../combat/DamageResolver";
import type { Vec2 } from "../math/Vector2";
import type { WormMotionEffects } from "../movement/WormMovementTypes";
import { crossedPlatform, type Platform } from "../world/PlatformContacts";

export interface SkillContext {
  readonly tick: number; readonly pressed: boolean; readonly owner: ActorState;
  readonly actors: readonly ActorState[]; readonly direction: Vec2; readonly phase: string;
  readonly surfaceY: number; readonly platforms: readonly Platform[];
}
export interface SkillSnapshot { readonly ability: AbilityState; readonly projectiles: readonly SkillProjectile[]; readonly decoy?: Vec2; readonly markUntilTick: number; readonly origin?: Vec2 }
export interface SkillFrame extends SkillSnapshot {
  readonly activated: boolean; readonly damage: readonly DamageCommand[];
  readonly heals: readonly Readonly<{ actorId: string; amount: number }>[];
  readonly knockback: readonly Readonly<{ actorId: string; position: Vec2 }>[];
  readonly invulnerableUntilTick?: number; readonly grapple?: Vec2; readonly motion?: WormMotionEffects;
}
export class CharacterSkills {
  private readonly timer: TimedSkill;
  private readonly shots = new SkillProjectiles();
  private readonly poisoned = new Map<string, { nextTick: number; untilTick: number }>();
  private decoy: Vec2 | undefined;
  private origin: Vec2 | undefined;
  constructor(readonly character: CharacterDefinition) { this.timer = new TimedSkill(character.skill.id, character.skill.activeTicks, character.skill.cooldownTicks); }
  step(c: SkillContext): SkillFrame {
    if (c.owner.health <= 0) { this.shots.clear(); this.poisoned.clear(); this.decoy = undefined; this.timer.cancel(); }
    const previous = this.timer.snapshot(c.tick);
    const ability = this.timer.step(c.tick, c.pressed && c.owner.health > 0);
    const activated = previous.activeUntilTick !== ability.activeUntilTick;
    const damage: DamageCommand[] = [], heals: { actorId: string; amount: number }[] = [], knockback: { actorId: string; position: Vec2 }[] = [];
    let invulnerableUntilTick: number | undefined, grapple: Vec2 | undefined, motion: WormMotionEffects | undefined;
    if (activated) {
      this.origin = c.owner.position;
      switch (this.character.id) {
        case "cinder-wyrm": this.shots.volley("fire", c.owner, c.direction, c.tick); break;
        case "rift-spitter": this.shots.volley("venom", c.owner, c.direction, c.tick); break;
        case "iron-burrower":
          for (const target of c.actors) if (target.faction === "military" && target.health > 0 && target.position.y < c.surfaceY + 50 && Math.hypot(target.position.x - c.owner.position.x, target.position.y - c.owner.position.y) <= 220) {
            damage.push({ sourceId: c.owner.id, targetId: target.id, abilityId: ability.id, tick: c.tick, amount: 30, tags: ["shock"], priority: 0 });
            knockback.push({ actorId: target.id, position: { x: Math.max(-2350, Math.min(2350, target.position.x + Math.sign(target.position.x - c.owner.position.x || 1) * 90)), y: target.position.y } });
          }
          break;
        case "scout": {
          const candidates = c.platforms.filter(p => p.y < c.owner.position.y - 20).map(p => ({ platform: p, position: { x: Math.max(p.left + 16, Math.min(p.right - 16, c.owner.position.x)), y: p.y - 16 } }))
            .filter(p => Math.hypot(p.position.x - c.owner.position.x, p.position.y - c.owner.position.y) <= 260 && !crossedPlatform(c.owner.position, p.position, c.platforms, p.platform.id))
            .sort((a, b) => Math.hypot(a.position.x - c.owner.position.x, a.position.y - c.owner.position.y) - Math.hypot(b.position.x - c.owner.position.x, b.position.y - c.owner.position.y));
          grapple = candidates[0]?.position; break;
        }
        case "engineer": this.decoy = { x: c.owner.position.x + c.direction.x * 90, y: c.owner.position.y }; break;
        case "field-medic":
          for (const target of c.actors) if (target.faction === c.owner.faction && target.health > 0 && target.lifecycle === "active" && Math.hypot(target.position.x - c.owner.position.x, target.position.y - c.owner.position.y) <= 300) heals.push({ actorId: target.id, amount: 30 });
          break;
      }
    }
    if (ability.active && (this.character.id === "dune-maw" || this.character.id === "siegebreaker")) invulnerableUntilTick = ability.activeUntilTick;
    if (ability.active && this.character.id === "storm-serpent") motion = { turnScale: 1.3, liftAcceleration: c.surfaceY - c.owner.position.y < 150 ? 1300 : 0 };
    if (!ability.active) this.decoy = undefined;
    const projectiles = this.shots.step(c.owner, c.actors, c.tick);
    damage.push(...projectiles.commands);
    for (const id of projectiles.poison) this.poisoned.set(id, { nextTick: c.tick + 60, untilTick: c.tick + 180 });
    for (const [id, effect] of this.poisoned) {
      if (c.tick > effect.untilTick || !c.actors.some(a => a.id === id && a.health > 0)) this.poisoned.delete(id);
      else if (c.tick >= effect.nextTick) { damage.push({ sourceId: c.owner.id, targetId: id, abilityId: "skill.venom-dot", tick: c.tick, amount: 4, tags: ["venom"], priority: 0 }); effect.nextTick += 60; }
    }
    return freezeRecord({ ...this.snapshot(c.tick), activated, damage, heals, knockback, ...(invulnerableUntilTick !== undefined ? { invulnerableUntilTick } : {}), ...(grapple ? { grapple } : {}), ...(motion ? { motion } : {}) });
  }
  snapshot(tick: number): SkillSnapshot {
    const ability = this.timer.snapshot(tick);
    return freezeRecord({ ability, projectiles: this.shots.snapshot(), markUntilTick: this.character.id === "ranger" && ability.active ? ability.activeUntilTick : 0, ...(this.decoy && ability.active ? { decoy: this.decoy } : {}), ...(this.origin && ability.active ? { origin: this.origin } : {}) });
  }
}
