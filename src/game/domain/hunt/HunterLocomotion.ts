import { ascentArena, ascentHunterBalance as ascent } from "../../data/ascentArena";
import { huntBalance as b } from "../../data/huntBalance";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { supportPlatform, sweptLanding, type Platform, type VerticalBody } from "../world/PlatformContacts";
import type { HunterState } from "./HuntTypes";

/**
 * Horizontal surface runner for legacy relay scenarios, and a swept vertical
 * platformer (run, jump, one-way landing, drop-through) for ascent runs.
 */
export class HunterLocomotion {
  private state: HunterState;
  private coyoteUntilTick = 0;
  private jumpBufferedUntilTick = 0;
  private ignorePlatformId: string | undefined;

  constructor(
    private readonly terrain: TerrainProfile,
    private readonly bounds: Readonly<{ left: number; right: number }>,
    initial: Vec2,
    private readonly platforms: readonly Platform[] = [],
  ) {
    this.state = freezeRecord({ position: { ...initial }, direction: { x: 1, y: 0 }, velocity: { x: 0, y: 0 }, grounded: platforms.length > 0, dodgeUntilTick: 0, dodgeReadyTick: 0 });
  }

  step(action: ActionFrame, tick: number): HunterState {
    const move = Number.isFinite(action.moveX) ? Math.max(-1, Math.min(1, action.moveX)) : 0;
    const direction = Math.abs(move) > 0.01 ? { x: Math.sign(move), y: 0 } : this.state.direction;
    let { dodgeUntilTick, dodgeReadyTick } = this.state;
    if (action.boost.pressed && tick >= dodgeReadyTick) { dodgeUntilTick = tick + b.dodgeTicks; dodgeReadyTick = tick + b.dodgeCooldown; }
    const velocityX = tick < dodgeUntilTick ? direction.x * b.dodgeSpeed : move * b.moveSpeed;

    if (this.platforms.length === 0) {
      const x = clamp(this.state.position.x + velocityX / 60, this.bounds.left, this.bounds.right);
      this.state = freezeRecord({ position: { x, y: this.terrain.surfaceY(x) - ascent.halfHeight }, direction, velocity: { x: velocityX, y: 0 }, grounded: true, dodgeUntilTick, dodgeReadyTick });
      return this.state;
    }

    const previous = this.state;
    const halfWidth = b.bodyRadius;
    const halfHeight = ascent.halfHeight;
    const x = clamp(previous.position.x + velocityX / 60, this.bounds.left, this.bounds.right);
    let velocityY = previous.grounded ? 0 : previous.velocity?.y ?? 0;
    let grounded = previous.grounded;

    if (action.jump.pressed) this.jumpBufferedUntilTick = tick + ascent.jumpBufferTicks;
    if (grounded) this.coyoteUntilTick = tick + ascent.coyoteTicks;
    if (this.jumpBufferedUntilTick >= tick && tick <= this.coyoteUntilTick && velocityY >= 0) {
      velocityY = -ascent.jumpSpeed;
      grounded = false;
      this.jumpBufferedUntilTick = 0;
      this.coyoteUntilTick = 0;
    }
    if (grounded && action.drop.pressed) {
      this.ignorePlatformId = previous.platformId;
      velocityY = 60;
      grounded = false;
    }
    if (!grounded) velocityY = Math.min(velocityY + ascent.gravity / 60, ascent.maximumFallSpeed);

    const y = clamp(previous.position.y + velocityY / 60, ascentArena.bounds.top + halfHeight, ascentArena.bounds.bottom - halfHeight);
    const current: VerticalBody = { position: { x, y }, halfWidth, halfHeight };
    const landed = grounded
      ? supportPlatform(current, this.platforms)
      : sweptLanding({ position: previous.position, halfWidth, halfHeight }, current, velocityY, this.platforms, this.ignorePlatformId);

    if (landed) {
      this.ignorePlatformId = undefined;
      this.state = freezeRecord({ position: { x, y: landed.y - halfHeight }, direction, velocity: { x: velocityX, y: 0 }, grounded: true, platformId: landed.id, dodgeUntilTick, dodgeReadyTick });
      return this.state;
    }

    this.state = freezeRecord({ position: { x, y }, direction, velocity: { x: velocityX, y: velocityY }, grounded: false, dodgeUntilTick, dodgeReadyTick });
    return this.state;
  }

  snapshot(): HunterState { return this.state; }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
