import { huntBalance as b } from "../../data/huntBalance";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import type { HunterState } from "./HuntTypes";
export class HunterLocomotion {
  private state: HunterState;
  constructor(private readonly terrain: TerrainProfile, private readonly bounds: Readonly<{ left: number; right: number }>, initial: Vec2) {
    this.state = freezeRecord({ position: initial, direction: { x: 1, y: 0 }, dodgeUntilTick: 0, dodgeReadyTick: 0 });
  }
  step(action: ActionFrame, tick: number): HunterState {
    const move = Number.isFinite(action.moveX) ? Math.max(-1, Math.min(1, action.moveX)) : 0;
    const direction = Math.abs(move) > 0.01 ? { x: Math.sign(move), y: 0 } : this.state.direction;
    let { dodgeUntilTick, dodgeReadyTick } = this.state;
    if (action.boost.pressed && tick >= dodgeReadyTick) { dodgeUntilTick = tick + b.dodgeTicks; dodgeReadyTick = tick + b.dodgeCooldown; }
    const velocity = tick < dodgeUntilTick ? direction.x * b.dodgeSpeed : move * b.moveSpeed;
    const x = Math.max(this.bounds.left, Math.min(this.bounds.right, this.state.position.x + velocity / 60));
    this.state = freezeRecord({ position: { x, y: this.terrain.surfaceY(x) - 16 }, direction, dodgeUntilTick, dodgeReadyTick });
    return this.state;
  }
  snapshot(): HunterState { return this.state; }
}
