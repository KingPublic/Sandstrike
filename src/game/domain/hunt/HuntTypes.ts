import type { Vec2 } from "../math/Vector2";
import type { WormMotionEffects } from "../movement/WormMovementTypes";
export interface HunterState {
  readonly position: Vec2;
  readonly direction: Vec2;
  readonly velocity?: Vec2;
  readonly grounded?: boolean;
  readonly platformId?: string | undefined;
  readonly dodgeUntilTick: number;
  readonly dodgeReadyTick: number;
}
export interface RifleState { readonly ammo: number; readonly reloadUntilTick: number; readonly readyTick: number; readonly weaponId?: string }
export interface SnareState { readonly phase: "none" | "arming" | "armed" | "triggered"; readonly position?: Vec2 | undefined; readonly placedTick: number; readonly triggeredTick: number; readonly readyTick: number; readonly revealUntilTick: number }
export interface SnareEvent { readonly type: "snare-triggered"; readonly tick: number; readonly position: Vec2 }
export interface SnareStep { readonly state: SnareState; readonly events: readonly SnareEvent[]; readonly effects?: WormMotionEffects }
export interface ExposedRegion { readonly position: Vec2; readonly radius: number; readonly index: number }
export interface BossState {
  readonly stage: "ascent" | "boss";
  readonly warningTicks: number;
  readonly health: number;
  readonly maxHealth: number;
  readonly shieldPhase: "idle" | "windup" | "active";
  readonly shieldActive: boolean;
  readonly shieldTicksRemaining: number;
}

export interface RpgHudState {
  readonly owned: boolean;
  readonly rockets: number;
  readonly reloading: boolean;
  /** Ticks of reload still to run, so UI can draw a progress ring. */
  readonly reloadTicksRemaining: number;
  readonly crateReady: boolean;
  readonly inCrateZone: boolean;
}

export interface AllyState {
  readonly id: string;
  readonly kind: "ally.ground" | "ally.air";
  readonly position: Vec2;
  readonly health: number;
  readonly maxHealth: number;
  readonly state: string;
  readonly firing: boolean;
  readonly aim: Vec2;
}
export interface ExposedContact { readonly targetId: "worm"; readonly regionIndex: number; readonly position: Vec2; readonly distance: number }
