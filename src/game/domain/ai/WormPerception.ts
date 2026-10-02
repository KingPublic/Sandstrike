import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";

export interface WormPerceptionSnapshot {
  readonly self: WormMotionSnapshot;
  readonly relay: Vec2;
  /** Precise sighting: only while the worm's head is close to the surface. */
  readonly hunter?: Readonly<{ position: Vec2; observedTick: number }> | undefined;
  /** Vibration sense: approximate, refreshed on a cadence, always available. */
  readonly seismic?: Vec2 | undefined;
  /** Hunter travel, used to lead the crossing instead of aiming at the last position. */
  readonly hunterVelocity?: Vec2 | undefined;
  readonly trap?: Vec2 | undefined;
  readonly surfaceY: number;
}

const SEISMIC_CELL = 80;
const SEISMIC_INTERVAL_TICKS = 20;

/**
 * Seismic sensing keeps the worm a credible predator underground: surface
 * footsteps and gunfire are felt as an approximate, coarse and slightly delayed
 * bearing, while an actual sighting stays precise and short-lived.
 */
export class WormPerception {
  private sighting: Readonly<{ position: Vec2; observedTick: number }> | undefined;
  private seismic: Vec2 | undefined;

  observe(self: WormMotionSnapshot, hunter: Readonly<{ position: Vec2; velocity: Vec2 }>, relay: Vec2, trap: Vec2 | undefined, tick: number, surfaceY = 0, decoy?: Vec2): WormPerceptionSnapshot {
    const p = self.head.position;
    if (p.y <= surfaceY + 60 && Math.hypot(p.x - hunter.position.x, p.y - hunter.position.y) <= 500) this.sighting = { position: hunter.position, observedTick: tick };
    if (this.sighting && tick - this.sighting.observedTick >= 120) this.sighting = undefined;

    // The Engineer's beacon is a louder vibration source than footsteps, so the
    // seismic bearing follows it while it lasts.
    const source = decoy ?? hunter.position;
    if (this.seismic === undefined || tick % SEISMIC_INTERVAL_TICKS === 0) this.seismic = freezeRecord({ x: Math.round(source.x / SEISMIC_CELL) * SEISMIC_CELL, y: Math.round(source.y / SEISMIC_CELL) * SEISMIC_CELL });

    const observedTrap = trap && p.y <= surfaceY + 100 && Math.hypot(p.x - trap.x, p.y - trap.y) < 500 ? trap : undefined;
    return freezeRecord({
      self,
      relay,
      hunter: this.sighting,
      seismic: this.seismic,
      hunterVelocity: freezeRecord({ x: hunter.velocity.x, y: hunter.velocity.y }),
      trap: observedTrap,
      surfaceY,
    });
  }
}
