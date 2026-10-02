import type { ActionButton } from "./ActionFrame";
import {
  nextInputActivitySequence,
  type InputSource,
  type PartialActionFrame,
} from "./InputSource";

const BUTTON_CODES: Readonly<Partial<Record<string, ActionButton>>> = Object.freeze({
  Space: "primary",
  ControlLeft: "secondary",
  KeyR: "secondary",
  ControlRight: "secondary",
  KeyQ: "ability",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  KeyE: "interact",
  Escape: "pause",
  Enter: "confirm",
  Backspace: "back",
});

export class KeyboardInput implements InputSource {
  readonly id = "keyboard";
  private readonly heldCodes = new Set<string>();
  private readonly pendingCodes = new Set<string>();
  private analogSequence = 0;

  private readonly onKeyDown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent) || event.repeat) {
      return;
    }
    this.heldCodes.add(event.code);
    this.pendingCodes.add(event.code);
    this.analogSequence = nextInputActivitySequence();
  };

  private readonly onKeyUp = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    this.heldCodes.delete(event.code);
    this.analogSequence = nextInputActivitySequence();
  };

  constructor(private readonly target: EventTarget = window, private readonly skillOnSpace = false) {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
  }

  sample(): PartialActionFrame {
    const moveX =
      Number(this.isHeld("KeyD", "ArrowRight")) -
      Number(this.isHeld("KeyA", "ArrowLeft"));
    const moveY =
      Number(this.isHeld("KeyS", "ArrowDown")) -
      Number(this.isHeld("KeyW", "ArrowUp"));
    const buttons: Partial<Record<ActionButton, boolean>> = {};
    for (const [code, button] of Object.entries(BUTTON_CODES)) {
      if (button) {
        const action = code === "Space" && this.skillOnSpace ? "ability" : button;
        buttons[action] ||= this.heldCodes.has(code) || this.pendingCodes.has(code);
      }
    }

    this.pendingCodes.clear();
    return Object.freeze({
      moveX,
      moveY,
      buttons: Object.freeze(buttons),
      analogSequence: this.analogSequence,
    });
  }

  clear(): void {
    this.heldCodes.clear();
    this.pendingCodes.clear();
    this.analogSequence = nextInputActivitySequence();
  }

  destroy(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.clear();
  }

  private isHeld(...codes: readonly string[]): boolean {
    return codes.some((code) => this.heldCodes.has(code));
  }
}
