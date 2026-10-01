import type { Vec2 } from "../math/Vector2";
import type { Contact } from "../collision/CollisionTypes";
import type { ActorId, RemovalCause } from "../actors/Actor";

interface WormEventBase {
  readonly tick: number;
  readonly position: Vec2;
}

export type DomainEvent =
  | Readonly<{ type: "contact"; tick: number; contact: Contact }>
  | Readonly<{ type: "actor-spawned"; tick: number; actorId: ActorId; definitionId: string; position: Vec2 }>
  | Readonly<{ type: "actor-removed"; tick: number; actorId: ActorId; cause: RemovalCause; position: Vec2 }>
  | Readonly<WormEventBase & { type: "worm-breached" }>
  | Readonly<WormEventBase & { type: "worm-became-airborne" }>
  | Readonly<WormEventBase & { type: "worm-reentered" }>
  | Readonly<WormEventBase & { type: "worm-returned-underground" }>
  | Readonly<
      WormEventBase & {
        type: "worm-burst";
        speed: number;
      }
    >;
