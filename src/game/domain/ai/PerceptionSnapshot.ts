import type { Vec2 } from "../math/Vector2";

export interface PerceptionSnapshot {
  readonly selfId: string;
  readonly selfPosition: Vec2;
  readonly tick: number;
  readonly visibleTarget: Readonly<{ id: string; position: Vec2 }> | undefined;
  readonly recentTarget: Readonly<{ position: Vec2; observedTick: number }> | undefined;
}
