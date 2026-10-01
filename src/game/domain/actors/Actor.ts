import type { CollisionProfile } from "../collision/CollisionTypes";
import { freezeVec2, isFiniteVec2, type Vec2 } from "../math/Vector2";

export type ActorId = string;
export type RemovalCause = "consumed" | "destroyed" | "expired";

export interface ActorState {
  readonly id: ActorId;
  readonly definitionId: string;
  readonly faction: "worm" | "world" | "military";
  readonly position: Vec2;
  readonly velocity: Vec2;
  readonly direction: Vec2;
  readonly health: number;
  readonly maxHealth: number;
  readonly armor: number;
  readonly tags: readonly string[];
  readonly collision: CollisionProfile;
  readonly lifecycle: "active" | "pending-removal";
  readonly invulnerableUntilTick?: number;
}

export function createActor(state: ActorState): ActorState {
  if (!state.id || !state.definitionId || !isFiniteVec2(state.position) ||
      !isFiniteVec2(state.velocity) || !isFiniteVec2(state.direction) ||
      !Number.isFinite(state.health) || !Number.isFinite(state.maxHealth) ||
      state.health < 0 || state.maxHealth <= 0 || state.health > state.maxHealth ||
      !Number.isFinite(state.armor) || state.armor < 0) {
    throw new RangeError("Invalid actor state.");
  }
  return Object.freeze({
    ...state,
    position: freezeVec2(state.position.x, state.position.y),
    velocity: freezeVec2(state.velocity.x, state.velocity.y),
    direction: freezeVec2(state.direction.x, state.direction.y),
    tags: Object.freeze([...state.tags]),
    collision: freezeRecord(state.collision),
  });
}

export function freezeRecord<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map((item: unknown) => freezeRecord(item))) as T;
  if (value !== null && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]: [string, unknown]) => [key, freezeRecord(item)]),
    )) as T;
  }
  return value;
}
