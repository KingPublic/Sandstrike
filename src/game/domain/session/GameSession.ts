import type { ActionFrame } from "../../input/ActionFrame";
import { collisionProfiles } from "../../data/collisionProfiles";
import { createActor, type ActorState } from "../actors/Actor";
import { ActorRegistry } from "../actors/ActorRegistry";
import { CollisionWorld } from "../collision/CollisionWorld";
import { EventQueue } from "../events/EventQueue";
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
  readonly actors?: readonly ActorState[];
}

export class GameSession {
  private readonly locomotion: WormLocomotion;
  private readonly stepSeconds: number;
  private currentTick = 0;
  private readonly actors: ActorRegistry;
  private readonly collisions = new CollisionWorld();
  private readonly events = new EventQueue();

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
    const worm = this.locomotion.snapshot();
    this.actors = new ActorRegistry([
      createActor({ id: "worm", definitionId: "actor.worm", faction: "worm", position: worm.head.position, direction: worm.head.tangent, velocity: worm.head.velocity, health: 100, maxHealth: 100, armor: 0, tags: ["worm"], collision: collisionProfiles.worm, lifecycle: "active" }),
      ...(options.actors ?? []),
    ]);
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

    const previousActors = this.actors.snapshot();
    this.currentTick = action.tick;
    const movementEvents = this.locomotion.step(
      action,
      this.stepSeconds,
      this.options.terrain,
    );
    for (const event of movementEvents) this.events.publish(mapMovementEvent(event));
    const worm = this.locomotion.snapshot();
    const wormActor = this.actors.get("worm");
    if (!wormActor) throw new Error("Session has no player worm.");
    this.actors.update({ ...wormActor, position: worm.head.position, direction: worm.head.tangent, velocity: worm.head.velocity });
    for (const contact of this.collisions.query(previousActors, this.actors.snapshot())) {
      this.events.publish({ type: "contact", tick: this.currentTick, contact });
    }
    const changes = this.actors.commit();
    for (const actor of changes.spawned) this.events.publish({ type: "actor-spawned", tick: this.currentTick, actorId: actor.id, definitionId: actor.definitionId, position: actor.position });
    for (const { actor, cause } of changes.removed) this.events.publish({ type: "actor-removed", tick: this.currentTick, actorId: actor.id, cause, position: actor.position });
    const events = this.events.drain();
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
      actors: this.actors.snapshot(),
      diagnostics: Object.freeze({ eventOverflowCount: this.events.overflowCount }),
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
