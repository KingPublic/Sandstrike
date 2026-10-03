import type { ActionFrame } from "./ActionFrame";
import type { InputSource, PartialActionFrame } from "./InputSource";

export class ScriptedInput implements InputSource {
  readonly id = "scripted";
  private readonly frames = new Map<number, ActionFrame>();

  constructor(frames: readonly ActionFrame[] = []) {
    this.enqueueActions(frames);
  }

  enqueueActions(frames: readonly ActionFrame[]): void {
    for (const frame of frames) {
      this.frames.set(frame.tick, frame);
    }
  }

  sample(tick: number): PartialActionFrame {
    const frame = this.frames.get(tick);
    if (!frame) {
      return Object.freeze({});
    }
    this.frames.delete(tick);
    const buttons = Object.freeze({
      primary: frame.primary.held,
      secondary: frame.secondary.held,
      ability: frame.ability.held,
      boost: frame.boost.held,
      jump: frame.jump.held,
      drop: frame.drop.held,
      interact: frame.interact.held,
      pause: frame.pause.held,
      confirm: frame.confirm.held,
      back: frame.back.held,
    });
    const base = {
      moveX: frame.moveX,
      moveY: frame.moveY,
      aimX: frame.aimX,
      aimY: frame.aimY,
      buttons,
      analogSequence: tick,
    };
    return frame.aimWorld
      ? Object.freeze({ ...base, aimWorld: frame.aimWorld })
      : Object.freeze(base);
  }

  clear(): void {
    this.frames.clear();
  }
}
