import { allies } from "../../data/allies";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";

export interface HelicopterPerception {
  readonly self: Vec2;
  readonly surfaceY: number;
  readonly bounds: Readonly<{ left: number; right: number }>;
  /** The player's position keeps the patrol escorting the Hunter. */
  readonly hunter: Vec2;
  readonly worm?: Readonly<{ position: Vec2; exposed: boolean }> | undefined;
}

export interface HelicopterDecision {
  readonly moveX: number;
  readonly moveY: number;
  readonly fire: boolean;
  readonly aim: Vec2;
  readonly state: "patrol" | "engage";
}

/**
 * Support helicopter: patrols at a fixed altitude above the rising hazard and
 * only fires at exposed worm regions it can actually see.
 */
export class SupportHelicopterController {
  private direction = 1;
  reset(): void { this.direction = 1; }

  step(p: HelicopterPerception): HelicopterDecision {
    const altitude = p.surfaceY - allies.airAltitude;
    const worm = p.worm;
    const visible = worm !== undefined && worm.exposed && Math.abs(worm.position.x - p.self.x) <= allies.airRange;
    const aim = worm ? { x: worm.position.x, y: worm.position.y } : { x: p.self.x + this.direction * 120, y: p.surfaceY };
    const patrolTarget = worm ? worm.position.x : p.hunter.x + this.direction * allies.airPatrolHalfWidth;
    const moveX = Math.abs(patrolTarget - p.self.x) > 40 ? Math.sign(patrolTarget - p.self.x) : this.direction;
    if (Math.abs(patrolTarget - p.self.x) > 40) this.direction = moveX;
    if (p.self.x <= p.bounds.left + 120) this.direction = 1;
    else if (p.self.x >= p.bounds.right - 120) this.direction = -1;
    const level = altitude - p.self.y;
    const moveY = Math.abs(level) > 8 ? Math.sign(level) : 0;
    return freezeRecord({ moveX, moveY, fire: visible, aim, state: visible ? "engage" : "patrol" });
  }
}
