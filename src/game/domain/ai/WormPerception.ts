import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
export interface WormPerceptionSnapshot { readonly self: WormMotionSnapshot; readonly relay: Vec2; readonly hunter?: Readonly<{ position: Vec2; observedTick: number }> | undefined; readonly trap?: Vec2 | undefined }
export class WormPerception {
  private sighting: WormPerceptionSnapshot["hunter"];
  observe(self: WormMotionSnapshot, hunter: Vec2, relay: Vec2, trap: Vec2 | undefined, tick: number): WormPerceptionSnapshot {
    const p = self.head.position;
    if (p.y <= 60 && Math.hypot(p.x - hunter.x, p.y - hunter.y) <= 500) this.sighting = { position: hunter, observedTick: tick };
    if (this.sighting && tick - this.sighting.observedTick >= 120) this.sighting = undefined;
    const observedTrap = trap && p.y <= 100 && Math.hypot(p.x - trap.x, p.y - trap.y) < 500 ? trap : undefined;
    return freezeRecord({ self, relay, hunter: this.sighting, trap: observedTrap });
  }
}
