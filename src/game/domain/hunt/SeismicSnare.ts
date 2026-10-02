import { huntBalance as b } from "../../data/huntBalance";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { SnareEvent, SnareState, SnareStep } from "./HuntTypes";
export class SeismicSnare {
  private state: SnareState = Object.freeze({ phase: "none", placedTick: 0, triggeredTick: 0, readyTick: 0, revealUntilTick: 0 });
  step(action: ActionFrame, hunterPosition: Vec2, wormPose: Vec2, tick: number): SnareStep {
    let state = this.state;
    const events: SnareEvent[] = [];
    if ((state.phase === "triggered" && tick >= state.revealUntilTick) || (state.phase !== "none" && state.phase !== "triggered" && tick >= state.placedTick + b.snareExpiry)) state = { ...state, phase: "none", position: undefined };
    if (action.ability.pressed) {
      if (state.phase === "armed" || state.phase === "arming") state = { ...state, phase: "none", position: undefined };
      else if (state.phase === "none" && tick >= state.readyTick) state = { ...state, phase: "arming", position: { x: hunterPosition.x, y: hunterPosition.y + 16 }, placedTick: tick, readyTick: tick + b.snareCooldown };
    }
    if (state.phase === "arming" && tick >= state.placedTick + b.snareArm) state = { ...state, phase: "armed" };
    if (state.phase === "armed" && state.position && wormPose.y >= state.position.y && wormPose.y - state.position.y <= b.snareDepth && Math.abs(wormPose.x - state.position.x) <= b.snareRadius) {
      state = { ...state, phase: "triggered", triggeredTick: tick, revealUntilTick: tick + b.snareReveal };
      events.push({ type: "snare-triggered", tick, position: state.position ?? hunterPosition });
    }
    this.state = freezeRecord(state);
    const effects = state.phase === "triggered" && tick < state.triggeredTick + b.snareRestrict ? { turnScale: b.trappedTurnScale, liftAcceleration: b.liftAcceleration } : undefined;
    return freezeRecord({ state: this.state, events, ...(effects ? { effects } : {}) });
  }
  snapshot(): SnareState { return this.state; }
}
