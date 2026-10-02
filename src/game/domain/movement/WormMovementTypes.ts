import type { Vec2 } from "../math/Vector2";

export interface WormMotionEffects { readonly turnScale: number; readonly liftAcceleration: number }
import type { PathPose } from "./PathHistory";

export type WormMotionPhase =
  | "underground"
  | "breaching"
  | "airborne"
  | "reentering";

export interface WormMovementConfig {
  readonly worldBounds?: Readonly<{ left: number; right: number; top: number; bottom: number }>;
  readonly segmentCount: number;
  readonly segmentSpacing: number;
  readonly pathCapacity: number;
  readonly pathMinSampleDistance: number;
  readonly pathMaxTickGap: number;
  readonly initialPosition: Vec2;
  readonly initialDirection: Vec2;
  readonly initialSpeed: number;
  readonly minimumUndergroundSpeed: number;
  readonly undergroundAcceleration: number;
  readonly cruiseSpeed: number;
  readonly lowSpeedTurnRate: number;
  readonly highSpeedTurnFactor: number;
  readonly airTurnFactor: number;
  readonly ballisticAirControl?: boolean;
  readonly gravity: number;
  readonly burstSpeedGain: number;
  readonly burstSpeedCap: number;
  readonly burstCooldownSeconds: number;
  readonly surfaceHysteresis: number;
  readonly maxForcedReentrySeconds: number;
  readonly cameraLookAheadX: number;
  readonly cameraLookAheadY: number;
  readonly cameraSmoothingHalfLife: number;
}

export interface WormHeadPose extends PathPose {
  readonly velocity: Vec2;
}

export interface WormMotionSnapshot {
  readonly tick: number;
  readonly head: WormHeadPose;
  readonly followers: readonly PathPose[];
  readonly speed: number;
  readonly phase: WormMotionPhase;
  readonly burstCooldownSeconds: number;
}

export type WormMotionEvent =
  | Readonly<{
      type: "phase-changed";
      tick: number;
      from: WormMotionPhase;
      to: WormMotionPhase;
      position: Vec2;
    }>
  | Readonly<{
      type: "burst";
      tick: number;
      speed: number;
      position: Vec2;
    }>;
