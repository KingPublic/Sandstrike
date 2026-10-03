import type { HunterId } from "../../data/characters";
import type { ActorState } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import { crossedPlatform, type Platform } from "../world/PlatformContacts";

export function wantsRivalSkill(id: HunterId, owner: ActorState, worm: Vec2 | undefined, actors: readonly ActorState[], platforms: readonly Platform[], grounded: boolean): boolean {
  const distance = worm ? Math.hypot(worm.x - owner.position.x, worm.y - owner.position.y) : Infinity;
  switch (id) {
    case "ranger": return distance < 900;
    case "siegebreaker": return distance < 280;
    case "engineer": return distance < 380;
    case "field-medic": return actors.some(a => a.faction === owner.faction && a.lifecycle === "active" && a.health > 0 && a.maxHealth - a.health >= 30 && Math.hypot(a.position.x - owner.position.x, a.position.y - owner.position.y) <= 300);
    case "scout": return grounded && platforms.some(p => {
      const target = { x: Math.max(p.left + 16, Math.min(p.right - 16, owner.position.x)), y: p.y - 16 };
      return p.y < owner.position.y - 20 && Math.hypot(target.x - owner.position.x, target.y - owner.position.y) <= 260 && !crossedPlatform(owner.position, target, platforms, p.id);
    });
  }
}
