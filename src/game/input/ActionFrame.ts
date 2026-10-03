import type { Vec2 } from "../domain/math/Vector2";

export const ACTION_BUTTONS = Object.freeze([
  "primary",
  "secondary",
  "ability",
  "boost",
  "jump",
  "drop",
  "interact",
  "pause",
  "confirm",
  "back",
] as const);

export type ActionButton = (typeof ACTION_BUTTONS)[number];

export interface ActionButtonState {
  readonly held: boolean;
  readonly pressed: boolean;
  readonly released: boolean;
}

export interface ActionFrame {
  readonly tick: number;
  readonly moveX: number;
  readonly moveY: number;
  readonly aimX: number;
  readonly aimY: number;
  readonly aimWorld?: Vec2;
  readonly primary: ActionButtonState;
  readonly secondary: ActionButtonState;
  readonly ability: ActionButtonState;
  readonly boost: ActionButtonState;
  readonly jump: ActionButtonState;
  readonly drop: ActionButtonState;
  readonly interact: ActionButtonState;
  readonly pause: ActionButtonState;
  readonly confirm: ActionButtonState;
  readonly back: ActionButtonState;
}

function neutralButtonState(): ActionButtonState {
  return Object.freeze({
    held: false,
    pressed: false,
    released: false,
  });
}

export function neutralActionFrame(tick: number): ActionFrame {
  return Object.freeze({
    tick,
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    primary: neutralButtonState(),
    secondary: neutralButtonState(),
    ability: neutralButtonState(),
    boost: neutralButtonState(),
    jump: neutralButtonState(),
    drop: neutralButtonState(),
    interact: neutralButtonState(),
    pause: neutralButtonState(),
    confirm: neutralButtonState(),
    back: neutralButtonState(),
  });
}
