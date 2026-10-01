import { freezeVec2, type Vec2 } from "../domain/math/Vector2";
import type { ActionButton } from "./ActionFrame";
import {
  nextInputActivitySequence,
  type InputSource,
  type PartialActionFrame,
} from "./InputSource";

export class TouchInput implements InputSource {
  readonly id = "touch";
  private moveX = 0;
  private moveY = 0;
  private aimX = 0;
  private aimY = 0;
  private aimWorld: Vec2 | undefined;
  private buttons: Partial<Record<ActionButton, boolean>> = {};
  private analogSequence = 0;

  sample(): PartialActionFrame {
    const base = {
      moveX: this.moveX,
      moveY: this.moveY,
      aimX: this.aimX,
      aimY: this.aimY,
      buttons: Object.freeze({ ...this.buttons }),
      analogSequence: this.analogSequence,
    };
    return this.aimWorld
      ? Object.freeze({ ...base, aimWorld: this.aimWorld })
      : Object.freeze(base);
  }

  setMove(x: number, y: number): void {
    this.moveX = finiteOrZero(x);
    this.moveY = finiteOrZero(y);
    this.analogSequence = nextInputActivitySequence();
  }

  setAim(x: number, y: number, world?: Vec2): void {
    this.aimX = finiteOrZero(x);
    this.aimY = finiteOrZero(y);
    this.aimWorld =
      world && Number.isFinite(world.x) && Number.isFinite(world.y)
        ? freezeVec2(world.x, world.y)
        : undefined;
    this.analogSequence = nextInputActivitySequence();
  }

  setButton(button: ActionButton, held: boolean): void {
    this.buttons[button] = held;
    this.analogSequence = nextInputActivitySequence();
  }

  clear(): void {
    this.moveX = 0;
    this.moveY = 0;
    this.aimX = 0;
    this.aimY = 0;
    this.aimWorld = undefined;
    this.buttons = {};
    this.analogSequence = nextInputActivitySequence();
  }
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
