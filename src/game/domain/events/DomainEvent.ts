import type { Vec2 } from "../math/Vector2";

interface WormEventBase {
  readonly tick: number;
  readonly position: Vec2;
}

export type DomainEvent =
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
