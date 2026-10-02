import type { Vec2 } from "../math/Vector2";
import type { WormMotionEffects } from "../movement/WormMovementTypes";
export interface HunterState { readonly position: Vec2; readonly direction: Vec2; readonly dodgeUntilTick: number; readonly dodgeReadyTick: number }
export interface RifleState { readonly ammo: number; readonly reloadUntilTick: number; readonly readyTick: number }
export interface SnareState { readonly phase: "none" | "arming" | "armed" | "triggered"; readonly position?: Vec2 | undefined; readonly placedTick: number; readonly triggeredTick: number; readonly readyTick: number; readonly revealUntilTick: number }
export interface SnareEvent { readonly type: "snare-triggered"; readonly tick: number; readonly position: Vec2 }
export interface SnareStep { readonly state: SnareState; readonly events: readonly SnareEvent[]; readonly effects?: WormMotionEffects }
export interface ExposedRegion { readonly position: Vec2; readonly radius: number; readonly index: number }
export interface ExposedContact { readonly targetId: "worm"; readonly regionIndex: number; readonly position: Vec2; readonly distance: number }
