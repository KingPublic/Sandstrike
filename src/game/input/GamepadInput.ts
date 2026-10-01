import type { ActionButton } from "./ActionFrame";
import {
  nextInputActivitySequence,
  type InputSource,
  type PartialActionFrame,
} from "./InputSource";

export type GamepadProvider = () => ArrayLike<Gamepad | null>;

export class GamepadInput implements InputSource {
  readonly id = "gamepad";
  private analogSequence = 0;
  private previousAxes = "";

  constructor(
    private readonly getGamepads: GamepadProvider = () => navigator.getGamepads(),
  ) {}

  sample(): PartialActionFrame {
    const gamepad = Array.from(this.getGamepads()).find(
      (candidate): candidate is Gamepad => candidate?.connected === true,
    );
    if (!gamepad) {
      return Object.freeze({});
    }

    const moveX = axis(gamepad, 0);
    const moveY = axis(gamepad, 1);
    const aimX = axis(gamepad, 2);
    const aimY = axis(gamepad, 3);
    const axesKey = [moveX, moveY, aimX, aimY].join(":");
    if (axesKey !== this.previousAxes) {
      this.previousAxes = axesKey;
      this.analogSequence = nextInputActivitySequence();
    }

    const buttons: Partial<Record<ActionButton, boolean>> = {
      primary: buttonPressed(gamepad, 7),
      secondary: buttonPressed(gamepad, 6),
      ability: buttonPressed(gamepad, 4),
      boost: buttonPressed(gamepad, 5),
      interact: buttonPressed(gamepad, 2),
      pause: buttonPressed(gamepad, 9),
      confirm: buttonPressed(gamepad, 0),
      back: buttonPressed(gamepad, 1),
    };

    return Object.freeze({
      moveX,
      moveY,
      aimX,
      aimY,
      buttons: Object.freeze(buttons),
      analogSequence: this.analogSequence,
    });
  }

  clear(): void {
    this.previousAxes = "";
    this.analogSequence = nextInputActivitySequence();
  }
}

function axis(gamepad: Gamepad, index: number): number {
  const value = gamepad.axes[index];
  return value !== undefined && Number.isFinite(value) ? value : 0;
}

function buttonPressed(gamepad: Gamepad, index: number): boolean {
  const button = gamepad.buttons[index];
  return button?.pressed === true || (button?.value ?? 0) > 0.5;
}
