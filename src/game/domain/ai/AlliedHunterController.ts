import { allies } from "../../data/allies";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { Platform } from "../world/PlatformContacts";

export interface AllyPerception {
  readonly self: Vec2;
  readonly grounded: boolean;
  readonly platformId?: string | undefined;
  readonly surfaceY: number;
  readonly platforms: readonly Platform[];
  readonly worm?: Readonly<{ position: Vec2; exposed: boolean }> | undefined;
}

export interface AllyDecision {
  readonly moveX: number;
  readonly jump: boolean;
  readonly drop: boolean;
  readonly fire: boolean;
  readonly aim: Vec2;
  readonly state: "climb" | "advance" | "engage";
  readonly platformId?: string | undefined;
}

const HALF_HEIGHT = 16;

/**
 * Ground survivor ally: climbs to platforms above the rising hazard, advances
 * toward the worm's tremor and only fires at a worm that is actually exposed.
 */
export class AlliedHunterController {
  private state: AllyDecision["state"] = "advance";
  private platformId: string | undefined;

  reset(): void { this.state = "advance"; this.platformId = undefined; }

  step(p: AllyPerception): AllyDecision {
    const feet = p.self.y + HALF_HEIGHT;
    const safe = p.platforms.filter(platform => platform.y < p.surfaceY - 40);
    const support = p.platformId !== undefined ? safe.find(platform => platform.id === p.platformId) : undefined;
    const buried = feet > p.surfaceY - 12;
    const worm = p.worm;
    const engage = worm !== undefined && worm.exposed && !buried && Math.abs(worm.position.x - p.self.x) <= allies.groundRange;
    const aim = worm ? { x: worm.position.x, y: worm.position.y } : { x: p.self.x + (p.self.x >= 0 ? 1 : -1), y: p.self.y };

    if (engage) {
      this.state = "engage";
      return freezeRecord({ moveX: 0, jump: false, drop: false, fire: true, aim, state: "engage" });
    }

    const reach = jumpReach();
    const target = safe
      .filter(platform => feet - platform.y >= 24 && feet - platform.y <= reach)
      .reduce<Platform | undefined>((best, platform) => !best || feet - platform.y < feet - best.y ? platform : best, undefined);
    if (buried || support === undefined || target !== undefined) {
      const centreX = target ? (target.left + target.right) / 2 : 0;
      const offset = centreX - p.self.x;
      const jump = p.grounded && target !== undefined && Math.abs(offset) <= 180;
      this.state = "climb";
      return freezeRecord({ moveX: target !== undefined && Math.abs(offset) > 12 ? Math.sign(offset) : 0, jump, drop: false, fire: false, aim, state: "climb", platformId: target?.id ?? p.platformId });
    }

    this.state = "advance";
    const towardX = worm ? worm.position.x : 0;
    return freezeRecord({ moveX: Math.abs(towardX - p.self.x) > 90 ? Math.sign(towardX - p.self.x) : 0, jump: false, drop: false, fire: false, aim, state: "advance", platformId: p.platformId });
  }
}

function jumpReach(): number {
  return (allies.groundJumpSpeed ** 2) / (2 * allies.groundGravity) - 12;
}
