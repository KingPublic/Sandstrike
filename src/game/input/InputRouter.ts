import { freezeVec2, isFiniteVec2 } from "../domain/math/Vector2";
import {
  ACTION_BUTTONS,
  type ActionButton,
  type ActionButtonState,
  type ActionFrame,
} from "./ActionFrame";
import type { InputSource, PartialActionFrame } from "./InputSource";

export interface InputRouterOptions {
  readonly analogDeadZone?: number;
}

interface NormalizedAxes {
  readonly x: number;
  readonly y: number;
}

interface SourceSample {
  readonly source: InputSource;
  readonly frame: PartialActionFrame;
  readonly move: NormalizedAxes;
  readonly aim: NormalizedAxes;
}

const DEFAULT_DEAD_ZONE = 0.18;

export class InputRouter {
  private readonly sources: readonly InputSource[];
  private readonly deadZone: number;
  private previousButtons = createHeldRecord(false);
  private awaitingNeutral = false;
  private currentSourceId = "none";

  constructor(
    sources: readonly InputSource[],
    options: InputRouterOptions = {},
  ) {
    const deadZone = options.analogDeadZone ?? DEFAULT_DEAD_ZONE;
    if (!Number.isFinite(deadZone) || deadZone < 0 || deadZone >= 1) {
      throw new RangeError("Input dead zone must be in the range [0, 1)." );
    }
    this.sources = Object.freeze([...sources]);
    this.deadZone = deadZone;
  }

  get activeSourceId(): string {
    return this.currentSourceId;
  }

  sample(tick: number): ActionFrame {
    if (!Number.isSafeInteger(tick) || tick < 0) {
      throw new RangeError("Input tick must be a non-negative safe integer.");
    }

    const samples = this.sources.map((source) => {
      const frame = source.sample(tick);
      return Object.freeze({
        source,
        frame,
        move: applyRadialDeadZone(frame.moveX, frame.moveY, this.deadZone),
        aim: applyRadialDeadZone(frame.aimX, frame.aimY, this.deadZone),
      });
    });
    const heldButtons = this.mergeButtons(samples);
    const owner = this.selectAnalogOwner(samples);
    const hasAnalog = owner !== undefined;
    const hasButtons = ACTION_BUTTONS.some((button) => heldButtons[button]);

    if (this.awaitingNeutral) {
      this.previousButtons = createHeldRecord(false);
      if (!hasAnalog && !hasButtons) {
        this.awaitingNeutral = false;
      }
      return createFrame(tick, undefined, createHeldRecord(false), this.previousButtons);
    }

    if (owner) {
      this.currentSourceId = owner.source.id;
    } else {
      const buttonOwner = samples.find((sample) =>
        ACTION_BUTTONS.some((button) => sample.frame.buttons?.[button] === true),
      );
      if (buttonOwner) {
        this.currentSourceId = buttonOwner.source.id;
      }
    }

    const frame = createFrame(tick, owner, heldButtons, this.previousButtons);
    this.previousButtons = heldButtons;
    return frame;
  }

  clear(): void {
    for (const source of this.sources) {
      source.clear();
    }
    this.previousButtons = createHeldRecord(false);
    this.awaitingNeutral = true;
    this.currentSourceId = "none";
  }

  private mergeButtons(samples: readonly SourceSample[]): Record<ActionButton, boolean> {
    const held = createHeldRecord(false);
    for (const sample of samples) {
      for (const button of ACTION_BUTTONS) {
        held[button] ||= sample.frame.buttons?.[button] === true;
      }
    }
    return held;
  }

  private selectAnalogOwner(
    samples: readonly SourceSample[],
  ): SourceSample | undefined {
    let owner: SourceSample | undefined;
    let latestSequence = Number.NEGATIVE_INFINITY;

    for (const sample of samples) {
      const hasAxes =
        sample.move.x !== 0 ||
        sample.move.y !== 0 ||
        sample.aim.x !== 0 ||
        sample.aim.y !== 0;
      const hasAimWorld =
        sample.frame.aimWorld !== undefined &&
        isFiniteVec2(sample.frame.aimWorld);
      if (!hasAxes && !hasAimWorld) {
        continue;
      }

      const sequence = finiteOr(sample.frame.analogSequence, 0);
      if (
        sequence > latestSequence ||
        (sequence === latestSequence && sample.source.id === this.currentSourceId)
      ) {
        owner = sample;
        latestSequence = sequence;
      }
    }

    return owner;
  }
}

function createFrame(
  tick: number,
  owner: SourceSample | undefined,
  heldButtons: Record<ActionButton, boolean>,
  previousButtons: Record<ActionButton, boolean>,
): ActionFrame {
  const buttonStates = Object.fromEntries(
    ACTION_BUTTONS.map((button) => [
      button,
      createButtonState(heldButtons[button], previousButtons[button]),
    ]),
  ) as Record<ActionButton, ActionButtonState>;

  const frame = {
    tick,
    moveX: owner?.move.x ?? 0,
    moveY: owner?.move.y ?? 0,
    aimX: owner?.aim.x ?? 0,
    aimY: owner?.aim.y ?? 0,
    ...buttonStates,
  };

  const aimWorld = owner?.frame.aimWorld;
  if (aimWorld && isFiniteVec2(aimWorld)) {
    return Object.freeze({
      ...frame,
      aimWorld: freezeVec2(aimWorld.x, aimWorld.y),
    });
  }
  return Object.freeze(frame);
}

function createButtonState(
  held: boolean,
  previouslyHeld: boolean,
): ActionButtonState {
  return Object.freeze({
    held,
    pressed: held && !previouslyHeld,
    released: !held && previouslyHeld,
  });
}

function createHeldRecord(initial: boolean): Record<ActionButton, boolean> {
  return Object.fromEntries(
    ACTION_BUTTONS.map((button) => [button, initial]),
  ) as Record<ActionButton, boolean>;
}

function applyRadialDeadZone(
  rawX: number | undefined,
  rawY: number | undefined,
  deadZone: number,
): NormalizedAxes {
  const x = clamp(finiteOr(rawX, 0), -1, 1);
  const y = clamp(finiteOr(rawY, 0), -1, 1);
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadZone) {
    return Object.freeze({ x: 0, y: 0 });
  }

  const clampedMagnitude = Math.min(1, magnitude);
  const scaledMagnitude = (clampedMagnitude - deadZone) / (1 - deadZone);
  return Object.freeze({
    x: (x / magnitude) * scaledMagnitude,
    y: (y / magnitude) * scaledMagnitude,
  });
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
