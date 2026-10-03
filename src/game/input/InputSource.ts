import type { Vec2 } from "../domain/math/Vector2";
import type { ActionButton } from "./ActionFrame";

export interface PartialActionFrame {
  readonly moveX?: number;
  readonly moveY?: number;
  readonly aimX?: number;
  readonly aimY?: number;
  readonly aimWorld?: Vec2;
  readonly buttons?: Readonly<Partial<Record<ActionButton, boolean>>>;
  readonly analogSequence?: number;
}

export interface InputSource {
  readonly id: string;
  sample(tick: number): PartialActionFrame;
  clear(): void;
}

let activitySequence = 0;

export function nextInputActivitySequence(): number {
  activitySequence += 1;
  return activitySequence;
}
