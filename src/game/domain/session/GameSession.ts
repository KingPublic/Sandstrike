import type { ActionFrame } from "../../input/ActionFrame";
import type { DomainEvent } from "../events/DomainEvent";
import { freezeVec2 } from "../math/Vector2";
import { WormLocomotion } from "../movement/WormLocomotion";
import type {
  WormMotionEvent,
  WormMovementConfig,
} from "../movement/WormMovementTypes";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import type { SessionSnapshot } from "./SessionSnapshot";
import type { SessionStepResult } from "./SessionStepResult";

export interface GameSessionOptions {
  readonly seed: number;
  readonly movement: WormMovementConfig;
  readonly terrain: TerrainProfile;
  readonly stepSeconds?: number;
}

export class GameSession {
  private readonly locomotion: WormLocomotion;
  private readonly stepSeconds: number;
  private currentTick = 0;

  constructor(private readonly options: GameSessionOptions) {
    if (!Number.isSafeInteger(options.seed)) {
      throw new RangeError("Session seed must be a safe integer.");
    }
    const stepSeconds = options.stepSeconds ?? 1 / 60;
    if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
      throw new RangeError("Session step must be finite and positive.");
    }
    this.stepSeconds = stepSeconds;
    this.locomotion = new WormLocomotion(options.movement);
  }

  get tick(): number {
    return this.currentTick;
  }

  get nextTick(): number {
    return this.currentTick + 1;
  }

  step(action: ActionFrame): SessionStepResult {
    if (action.tick !== this.nextTick) {
      throw new RangeError(
        `Expected action tick ${String(this.nextTick)}, received ${String(action.tick)}.`,
      );
    }

    this.currentTick = action.tick;
    const movementEvents = this.locomotion.step(
      action,
      this.stepSeconds,
      this.options.terrain,
    );
    const events = movementEvents.map(mapMovementEvent);
    return Object.freeze({
      snapshot: this.snapshot(),
      events: Object.freeze(events),
    });
  }

  snapshot(): SessionSnapshot {
    return Object.freeze({
      tick: this.currentTick,
      seed: this.options.seed,
      worm: this.locomotion.snapshot(),
    });
  }
}

function mapMovementEvent(event: WormMotionEvent): DomainEvent {
  const position = freezeVec2(event.position.x, event.position.y);

  if (event.type === "burst") {
    return Object.freeze({
      type: "worm-burst",
      tick: event.tick,
      speed: event.speed,
      position,
    });
  }

  switch (event.to) {
    case "breaching":
      return Object.freeze({ type: "worm-breached", tick: event.tick, position });
    case "airborne":
      return Object.freeze({
        type: "worm-became-airborne",
        tick: event.tick,
        position,
      });
    case "reentering":
      return Object.freeze({ type: "worm-reentered", tick: event.tick, position });
    case "underground":
      return Object.freeze({
        type: "worm-returned-underground",
        tick: event.tick,
        position,
      });
  }
}
