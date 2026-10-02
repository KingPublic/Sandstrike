import { freezeRecord } from "../actors/Actor";
import type { WormDecision } from "../ai/WormController";
import type { Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { SnareState } from "./HuntTypes";
export interface TrackingState { readonly cueX: number; readonly band: "deep" | "near" | "exposed"; readonly text: string; readonly breachBracket?: Readonly<{ left: number; right: number; warningTick: number }> | undefined; readonly exactTrace?: Vec2 | undefined }
export class TrackingSystem {
  step(worm: WormMotionSnapshot, decision: WormDecision | undefined, snare: SnareState, tick: number): TrackingState {
    const band = worm.head.position.y > 100 ? "deep" : worm.head.position.y > 0 ? "near" : "exposed";
    const prediction = decision?.breachPrediction;
    return freezeRecord({ cueX: Math.floor(worm.head.position.x / 120) * 120 + 60, band, text: prediction ? "BREACH INCOMING — watch the marked sector" : band === "near" ? "SHALLOW TREMOR — snare opportunity" : band === "exposed" ? "EXPOSED — fire now" : "DEEP MOVEMENT — track the tremor", breachBracket: prediction ? { left: prediction.x - 120, right: prediction.x + 120, warningTick: prediction.warningTick } : undefined, exactTrace: tick < snare.revealUntilTick ? worm.head.position : undefined });
  }
}
