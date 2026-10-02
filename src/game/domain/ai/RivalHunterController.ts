import { ascentRampageBalance as b } from "../../data/ascentRampage";
import { ascentHunterBalance as climb } from "../../data/ascentArena";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { Platform } from "../world/PlatformContacts";

export interface RivalPerception {
  readonly self: Vec2;
  readonly grounded: boolean;
  readonly platformId?: string | undefined;
  readonly surfaceY: number;
  readonly summitY: number;
  readonly summit: Readonly<{ left: number; right: number }>;
  readonly platforms: readonly Platform[];
  /** Armed by the summit crate: heavy rounds instead of rifle fire. */
  readonly armedWithRpg: boolean;
  readonly canFire: boolean;
  readonly worm?: Readonly<{ position: Vec2; exposed: boolean }> | undefined;
}

export type RivalActivity = "climb" | "advance" | "engage" | "rpg";

export interface RivalDecision {
  readonly moveX: number;
  readonly jump: boolean;
  readonly drop: boolean;
  readonly fire: boolean;
  /** Aim point the rival shoots at, kept readable for the player. */
  readonly aim?: Vec2 | undefined;
  readonly state: RivalActivity;
  readonly platformId?: string | undefined;
}

const HALF_HEIGHT = 16;
const ADVANCE_LEASH = 420;

/**
 * Rival Hunter bot for ascent rampage: races the rising sand to the summit crate,
 * then turns the objective weapon on the player worm. It only shoots at an
 * exposed worm, so diving under the sand stays a reliable escape.
 */
export class RivalHunterController {
  private state: RivalActivity = "climb";

  reset(): void { this.state = "climb"; }

  step(p: RivalPerception): RivalDecision {
    const feet = p.self.y + HALF_HEIGHT;
    const reach = jumpReach();
    const buried = feet > p.surfaceY - 12;
    const atSummit = feet <= p.summitY + 8 && p.self.x >= p.summit.left && p.self.x <= p.summit.right;
    const worm = p.worm;
    const aim = worm !== undefined ? { x: worm.position.x, y: worm.position.y } : undefined;
    const canEngage = worm !== undefined && worm.exposed && !buried
      && Math.abs(worm.position.x - p.self.x) <= b.rivalRange
      && Math.abs(worm.position.y - p.self.y) <= b.rivalRange;

    if (atSummit && p.armedWithRpg) {
      this.state = "rpg";
      const offset = p.self.x - 0;
      const wantsCentre = Math.abs(offset) > 40;
      return freezeRecord({
        moveX: wantsCentre ? (worm !== undefined && Math.abs(worm.position.x - p.self.x) > 80 ? Math.sign(worm.position.x - p.self.x) : -Math.sign(offset)) : 0,
        jump: false, drop: false, fire: p.canFire && canEngage, aim, state: "rpg", platformId: p.platformId,
      });
    }

    // The sand is the clock: keep climbing whenever it closes in.
    const climbTarget = nextLedgeUp(p, feet, reach);
    const mustClimb = buried || p.surfaceY - feet > b.climbPanicDistance;
    if ((mustClimb || this.state === "climb") && climbTarget !== undefined) {
      this.state = "climb";
      const offset = centreOf(climbTarget) - p.self.x;
      return freezeRecord({
        moveX: Math.abs(offset) <= 14 ? 0 : Math.sign(offset),
        jump: p.grounded && Math.abs(offset) <= 220,
        drop: false, fire: false, state: "climb", platformId: climbTarget.id,
      });
    }

    if (canEngage && p.canFire) {
      this.state = "engage";
      const offset = worm.position.x - p.self.x;
      return freezeRecord({ moveX: Math.abs(offset) > ADVANCE_LEASH ? Math.sign(offset) : 0, jump: false, drop: false, fire: true, aim, state: "engage", platformId: p.platformId });
    }

    this.state = "advance";
    const forward = worm !== undefined && Math.abs(worm.position.x - p.self.x) > ADVANCE_LEASH / 2 ? Math.sign(worm.position.x - p.self.x) : 0;
    return freezeRecord({ moveX: forward, jump: false, drop: false, fire: false, ...(aim ? { aim } : {}), state: "advance", platformId: p.platformId });
  }
}

/** Highest ledge the rival can actually reach from where it stands. */
function nextLedgeUp(p: RivalPerception, feet: number, reach: number): Platform | undefined {
  let best: Platform | undefined;
  for (const platform of p.platforms) {
    if (platform.y < p.summitY - 40) continue;
    const rise = feet - platform.y;
    if (rise < 24 || rise > reach) continue;
    if (!best || rise < feet - best.y) best = platform;
  }
  return best;
}

function centreOf(platform: Platform): number { return (platform.left + platform.right) / 2; }

function jumpReach(): number {
  return (climb.jumpSpeed ** 2) / (2 * climb.gravity) - 12;
}
