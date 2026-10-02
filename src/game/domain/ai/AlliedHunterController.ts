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
  /** The player is the squad anchor: allies escort and climb with the Hunter. */
  readonly hunter: Readonly<{ position: Vec2; platformId?: string | undefined }>;
  readonly worm?: Readonly<{ position: Vec2; exposed: boolean }> | undefined;
}

export type AllyActivity = "escort" | "regroup" | "climb" | "engage";

export interface AllyDecision {
  readonly moveX: number;
  readonly jump: boolean;
  readonly drop: boolean;
  readonly fire: boolean;
  readonly aim: Vec2;
  readonly state: AllyActivity;
  readonly platformId?: string | undefined;
}

const HALF_HEIGHT = 16;

/**
 * Ground survivor ally: stays with the Hunter, climbs with them above the rising
 * hazard and only fires at an exposed worm it can actually see.
 */
export class AlliedHunterController {
  private state: AllyActivity = "escort";

  reset(): void { this.state = "escort"; }

  step(p: AllyPerception): AllyDecision {
    const feet = p.self.y + HALF_HEIGHT;
    const hunterFeet = p.hunter.position.y + HALF_HEIGHT;
    const leash = p.hunter.position.x - p.self.x;
    const buried = feet > p.surfaceY - 14;
    const reach = jumpReach();
    const safe = p.platforms.filter(platform => platform.y < p.surfaceY - 40);
    const hunterPlatform = p.hunter.platformId !== undefined ? safe.find(platform => platform.id === p.hunter.platformId) : undefined;
    const climbTarget = safe
      .filter(platform => feet - platform.y >= 24 && feet - platform.y <= reach)
      .reduce<Platform | undefined>((best, platform) => !best || feet - platform.y < feet - best.y ? platform : best, undefined);
    const worm = p.worm;
    const engage = worm !== undefined && worm.exposed && !buried
      && Math.abs(worm.position.x - p.self.x) <= allies.groundRange
      && Math.abs(leash) <= allies.groundRange * 0.7;
    const direction = leash >= 0 ? 1 : -1;
    const aim = worm !== undefined && engage ? { x: worm.position.x, y: worm.position.y } : { x: p.self.x + direction, y: p.surfaceY };

    if (engage) {
      this.state = "engage";
      return freezeRecord({ moveX: 0, jump: false, drop: false, fire: true, aim, state: "engage" });
    }

    // Buried or lagging behind the Hunter: close the gap, taking the next ledge up.
    if (buried || Math.abs(leash) > allies.regroupLeash) {
      this.state = "regroup";
      const standOff = Math.abs(leash) - allies.escortOffset;
      const wantsHigher = hunterFeet < feet - 20;
      const canJump = p.grounded && wantsHigher && climbTarget !== undefined && Math.abs(centreOf(climbTarget) - p.self.x) <= 200;
      const moveX = canJump ? Math.sign(centreOf(climbTarget) - p.self.x) : Math.abs(standOff) < 24 ? 0 : Math.sign(standOff);
      return freezeRecord({ moveX, jump: canJump, drop: false, fire: false, aim, state: "regroup", platformId: hunterPlatform?.id });
    }

    // The Hunter climbed above the ally: follow onto the next reachable ledge.
    if (hunterFeet < feet - 40 && climbTarget !== undefined) {
      this.state = "climb";
      const offset = centreOf(climbTarget) - p.self.x;
      return freezeRecord({ moveX: Math.abs(offset) <= 16 ? 0 : Math.sign(offset), jump: p.grounded && Math.abs(offset) <= 200, drop: false, fire: false, aim, state: "climb", platformId: climbTarget.id });
    }

    this.state = "escort";
    const standOff = Math.abs(leash) - allies.escortOffset;
    return freezeRecord({ moveX: standOff < 20 ? 0 : direction, jump: false, drop: false, fire: false, aim, state: "escort", platformId: p.platformId });
  }
}

function centreOf(platform: Platform): number { return (platform.left + platform.right) / 2; }

function jumpReach(): number {
  return (allies.groundJumpSpeed ** 2) / (2 * allies.groundGravity) - 12;
}
