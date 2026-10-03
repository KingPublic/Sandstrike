import { characters, type CharacterDefinition, type HunterId } from "../../data/characters";
import { CharacterSkills, type SkillContext, type SkillFrame, type SkillSnapshot } from "../abilities/CharacterSkills";
import { freezeRecord, type ActorState } from "../actors/Actor";
import type { RandomStream } from "../random/RandomSource";
import type { Platform } from "../world/PlatformContacts";
import type { Vec2 } from "../math/Vector2";

export interface SkillCrate { readonly id: string; readonly position: Vec2; readonly characterId: HunterId; readonly claimed: boolean }
export interface SupplySkill { readonly characterId: HunterId; readonly name: string }
export interface SkillCrateSnapshot {
  readonly crates: readonly SkillCrate[];
  readonly stored?: SupplySkill;
  readonly active?: Readonly<{ characterId: HunterId; skill: SkillSnapshot }>;
}
export const skillCrateBalance = Object.freeze({ intervalTicks: 1080, capacity: 3, pickupRadius: 42 });

/** Run-local supplies reuse kit effects; the player's own skill is independent. */
export class SkillCrates {
  private crates: SkillCrate[] = [];
  private nextSpawnTick = 1;
  private sequence = 0;
  private stored: CharacterDefinition | undefined;
  private active: CharacterSkills | undefined;
  private readonly choices: readonly CharacterDefinition[];
  constructor(private readonly platforms: readonly Platform[], selectedId: HunterId) {
    this.choices = characters.filter(c => c.role === "hunter" && c.id !== selectedId);
  }

  step(owner: ActorState, tick: number, surfaceY: number, random: RandomStream): SupplySkill | undefined {
    this.crates = this.crates.filter(c => !c.claimed && c.position.y + 16 < surfaceY);
    if (owner.health <= 0 || owner.lifecycle !== "active") return undefined;
    if (tick >= this.nextSpawnTick && this.crates.length < skillCrateBalance.capacity) {
      const candidates = this.platforms.filter(p => p.y < surfaceY - 30 && p.y <= owner.position.y + 22 && p.y >= owner.position.y - 200 && p.right - p.left >= 200);
      const platform = candidates[random.integer(0, Math.max(0, candidates.length - 1))];
      if (platform) {
        const kit = this.choices[random.integer(0, this.choices.length - 1)];
        if (kit) {
          const left = Math.max(platform.left + 35, owner.position.x - 480), right = Math.min(platform.right - 35, owner.position.x + 480);
          const x = left <= right ? left + random.float() * (right - left) : (platform.left + platform.right) / 2;
          this.crates.push(freezeRecord({ id: `supply.${String(++this.sequence)}`, position: { x, y: platform.y - 16 }, characterId: kit.id as HunterId, claimed: false }));
        }
        this.nextSpawnTick = tick + skillCrateBalance.intervalTicks;
      }
    }
    if (this.stored || this.active?.snapshot(tick).ability.active) return undefined;
    const crate = this.crates.find(c => Math.abs(c.position.x - owner.position.x) <= skillCrateBalance.pickupRadius && Math.abs(c.position.y - owner.position.y) <= 24);
    if (!crate) return undefined;
    this.stored = this.choices.find(c => c.id === crate.characterId);
    this.crates = this.crates.filter(c => c.id !== crate.id);
    return this.stored ? { characterId: this.stored.id as HunterId, name: this.stored.skill.name } : undefined;
  }

  use(context: SkillContext): SkillFrame | undefined {
    if (this.active && !this.active.snapshot(context.tick).ability.active) this.active = undefined;
    if (context.pressed && this.stored && !this.active && context.owner.health > 0) {
      const effect = new CharacterSkills(this.stored);
      const frame = effect.step(context);
      // A grapple without a reachable ledge stays in the slot for a useful attempt.
      if (!frame.activated || (this.stored.id === "scout" && !frame.grapple)) return undefined;
      this.active = effect;
      this.stored = undefined;
      return frame;
    }
    return this.active?.step({ ...context, pressed: false });
  }

  snapshot(tick: number): SkillCrateSnapshot {
    const active = this.active?.snapshot(tick);
    return freezeRecord({ crates: [...this.crates], ...(this.stored ? { stored: { characterId: this.stored.id as HunterId, name: this.stored.skill.name } } : {}), ...(active?.ability.active && this.active ? { active: { characterId: this.active.character.id as HunterId, skill: active } } : {}) });
  }
}
