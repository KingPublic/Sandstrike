import type { Vec2 } from "../math/Vector2";

export type CollisionShape =
  | Readonly<{ kind: "circle"; radius: number; offset?: Vec2 }>
  | Readonly<{ kind: "capsule"; from: Vec2; to: Vec2; radius: number }>
  | Readonly<{ kind: "box"; halfWidth: number; halfHeight: number; offset?: Vec2 }>;

export interface CollisionProfile {
  readonly id: string;
  readonly layer: number;
  readonly mask: number;
  readonly shape: CollisionShape;
}

export interface Contact {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly kind: "projectile" | "impact" | "overlap";
  readonly priority: number;
  readonly position: Vec2;
}
