import type Phaser from "phaser";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import { characterForRole } from "../data/characters";
import type { CharacterDefinition } from "../data/characters";
import type { SkillSnapshot } from "../domain/abilities/CharacterSkills";
import type { ActorState } from "../domain/actors/Actor";

export class CharacterSkillView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene) { this.graphics = scene.add.graphics().setDepth(44); }
  render(snapshot: SessionSnapshot): void {
    const g = this.graphics; g.clear();
    const skill = snapshot.skill, character = characterForRole(snapshot.mode, snapshot.characterId);
    const owner = snapshot.actors.find(a => a.id === snapshot.playerActorId);
    if (skill && owner && owner.health > 0 && character) this.draw(snapshot, skill, character, owner);
    const supply = snapshot.hunt?.supplies?.active;
    const borrowed = supply ? characterForRole("hunt", supply.characterId) : undefined;
    if (supply && borrowed && owner && owner.health > 0) this.draw(snapshot, supply.skill, borrowed, owner);
    for (const rival of snapshot.rivals?.units ?? []) {
      const actor = snapshot.actors.find(a => a.id === rival.id), kit = characterForRole("hunt", rival.hunterId);
      if (actor && actor.health > 0 && kit && rival.skill) this.draw(snapshot, rival.skill, kit, actor);
    }
  }
  private draw(snapshot: SessionSnapshot, skill: SkillSnapshot, character: CharacterDefinition, owner: ActorState): void {
    const g = this.graphics, color = character.visual.light;
    for (const shot of skill.projectiles) {
      g.lineStyle(5, shot.kind === "fire" ? 0xffa858 : 0xb7ed8c, .65).lineBetween(shot.position.x - shot.direction.x * 30, shot.position.y - shot.direction.y * 30, shot.position.x, shot.position.y);
      g.fillStyle(color).fillCircle(shot.position.x, shot.position.y, 6);
    }
    if (!skill.ability.active) return;
    const phase = Math.max(0, Math.min(1, 1 - (skill.ability.activeUntilTick - snapshot.tick) / character.skill.activeTicks));
    if (character.id === "iron-burrower" || character.id === "field-medic") {
      const p = skill.origin ?? owner.position, radius = phase * (character.id === "iron-burrower" ? 220 : 300);
      g.lineStyle(4, color, 1 - phase).strokeCircle(p.x, p.y, radius);
      if (character.id === "field-medic") for (const actor of snapshot.actors.filter(a => a.faction === "hunter" && a.health > 0 && Math.hypot(a.position.x - p.x, a.position.y - p.y) <= 300)) g.lineStyle(3, color).lineBetween(actor.position.x - 5, actor.position.y - 35, actor.position.x + 5, actor.position.y - 35).lineBetween(actor.position.x, actor.position.y - 40, actor.position.x, actor.position.y - 30);
    }
    if (character.id === "scout" && skill.origin) g.lineStyle(2, color, 1 - phase).lineBetween(skill.origin.x, skill.origin.y, owner.position.x, owner.position.y - 4);
    if (character.id === "siegebreaker") g.lineStyle(3, color, .7 + Math.sin(snapshot.tick * .15) * .2).strokeEllipse(owner.position.x, owner.position.y - 3, 42, 62);
    if (skill.decoy) {
      const p = skill.decoy; g.fillStyle(0x40362e).fillRoundedRect(p.x - 8, p.y - 15, 16, 28, 3);
      g.lineStyle(2, color, .5).strokeCircle(p.x, p.y - 15, 18 + snapshot.tick % 30);
      g.fillStyle(color).fillCircle(p.x, p.y - 17, 5);
    }
    if (skill.markUntilTick && (snapshot.hunt?.tracking.band === "exposed" || snapshot.mode === "rampage" && snapshot.worm.head.position.y <= (snapshot.world?.surfaceY ?? 0)) && snapshot.wormLife?.phase !== "absent") {
      const p = snapshot.worm.head.position; g.lineStyle(3, color).strokeCircle(p.x, p.y, 44);
      for (const sign of [-1, 1]) g.lineBetween(p.x + sign * 34, p.y - 52, p.x + sign * 52, p.y - 34);
    }
    if (character.id === "storm-serpent") g.lineStyle(2, color, .7).strokeEllipse(owner.position.x, owner.position.y, 85, 60);
  }
  destroy(): void { this.graphics.destroy(); }
}
