import type { Vec2 } from "../math/Vector2";
import type { Contact } from "../collision/CollisionTypes";
import type { ActorId, RemovalCause } from "../actors/Actor";
import type { RunResult } from "../modes/RunResult";

interface WormEventBase {
  readonly tick: number;
  readonly position: Vec2;
}

export type DomainEvent =
  | Readonly<{ type: "run-ended"; tick: number; result: RunResult }>
  | Readonly<WormEventBase & { type: "worm-defeated" }>
  | Readonly<WormEventBase & { type: "low-health-warning" }>
  | Readonly<{ type: "score-awarded"; tick: number; points: number; total: number }>
  | Readonly<{ type: "response-warning"; tick: number; band: 1 }>
  | Readonly<{ type: "response-band-changed"; tick: number; band: 1 }>
  | Readonly<{ type: "infantry-telegraph"; tick: number; actorId: ActorId; aimPoint: Vec2; position: Vec2 }>
  | Readonly<{ type: "projectile-fired"; tick: number; actorId: ActorId; projectileId: ActorId; position: Vec2 }>
  | Readonly<{ type: "ability-activated"; tick: number; actorId: ActorId; abilityId: string; position: Vec2 }>
  | Readonly<{ type: "damage-applied"; tick: number; sourceId: ActorId; targetId: ActorId; abilityId: string; amount: number; blocked?: "armor" | "invulnerable"; tags: readonly string[]; position: Vec2 }>
  | Readonly<{ type: "actor-healed"; tick: number; actorId: ActorId; amount: number; position: Vec2 }>
  | Readonly<{ type: "target-consumed"; tick: number; sourceId: ActorId; targetId: ActorId; definitionId: string; category: "prey"; abilityId: string; tags: readonly string[]; position: Vec2 }>
  | Readonly<{ type: "actor-destroyed"; tick: number; sourceId: ActorId; targetId: ActorId; definitionId: string; category: "infantry" | "other"; abilityId: string; tags: readonly string[]; position: Vec2 }>
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
