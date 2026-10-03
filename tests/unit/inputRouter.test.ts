import { describe, expect, it, vi } from "vitest";

import { InputRouter } from "../../src/game/input/InputRouter";
import type {
  InputSource,
  PartialActionFrame,
} from "../../src/game/input/InputSource";

class FakeInput implements InputSource {
  frame: PartialActionFrame = Object.freeze({});
  readonly clear = vi.fn<() => void>();

  constructor(readonly id: string) {}

  sample(): PartialActionFrame {
    return this.frame;
  }
}

describe("InputRouter", () => {
  it("clamps axes and applies a radial 0.18 dead zone", () => {
    const gamepad = new FakeInput("gamepad");
    const router = new InputRouter([gamepad]);

    gamepad.frame = { moveX: 0.17, moveY: 0, analogSequence: 1 };
    expect(router.sample(1)).toMatchObject({ moveX: 0, moveY: 0 });

    gamepad.frame = { moveX: 0.2, moveY: 0, analogSequence: 2 };
    const outsideDeadZone = router.sample(2);
    expect(outsideDeadZone.moveX).toBeCloseTo((0.2 - 0.18) / 0.82, 10);
    expect(outsideDeadZone.moveY).toBe(0);

    gamepad.frame = { moveX: 4, moveY: -4, analogSequence: 3 };
    const clamped = router.sample(3);
    expect(Math.hypot(clamped.moveX, clamped.moveY)).toBeCloseTo(1, 10);
    expect(clamped.moveX).toBeGreaterThan(0);
    expect(clamped.moveY).toBeLessThan(0);
  });

  it("derives held, pressed, and released edges once", () => {
    const keyboard = new FakeInput("keyboard");
    const router = new InputRouter([keyboard]);

    keyboard.frame = { buttons: { primary: true } };
    expect(router.sample(1).primary).toEqual({
      held: true,
      pressed: true,
      released: false,
    });
    expect(router.sample(2).primary).toEqual({
      held: true,
      pressed: false,
      released: false,
    });

    keyboard.frame = { buttons: { primary: false } };
    expect(router.sample(3).primary).toEqual({
      held: false,
      pressed: false,
      released: true,
    });
  });

  it("merges duplicate device buttons without duplicate edges", () => {
    const keyboard = new FakeInput("keyboard");
    const gamepad = new FakeInput("gamepad");
    const router = new InputRouter([keyboard, gamepad]);

    keyboard.frame = { buttons: { boost: true } };
    gamepad.frame = { buttons: { boost: true } };
    expect(router.sample(1).boost.pressed).toBe(true);
    expect(router.sample(2).boost.pressed).toBe(false);

    keyboard.frame = { buttons: { boost: false } };
    expect(router.sample(3).boost).toMatchObject({ held: true, released: false });

    gamepad.frame = { buttons: { boost: false } };
    expect(router.sample(4).boost).toEqual({
      held: false,
      pressed: false,
      released: true,
    });
  });

  it("gives analog ownership to the most recently active source", () => {
    const keyboard = new FakeInput("keyboard");
    const touch = new FakeInput("touch");
    const router = new InputRouter([keyboard, touch]);

    keyboard.frame = { moveX: 1, analogSequence: 10 };
    touch.frame = { moveY: 1, analogSequence: 11 };
    expect(router.sample(1)).toMatchObject({ moveX: 0, moveY: 1 });
    expect(router.activeSourceId).toBe("touch");

    keyboard.frame = { moveX: -1, analogSequence: 12 };
    expect(router.sample(2)).toMatchObject({ moveX: -1, moveY: 0 });
    expect(router.activeSourceId).toBe("keyboard");
  });

  it("clears every source and requires a neutral sample before fresh input", () => {
    const keyboard = new FakeInput("keyboard");
    const touch = new FakeInput("touch");
    const router = new InputRouter([keyboard, touch]);

    keyboard.frame = {
      moveX: 1,
      analogSequence: 1,
      buttons: { boost: true },
    };
    expect(router.sample(1).boost.pressed).toBe(true);

    router.clear();
    expect(keyboard.clear).toHaveBeenCalledOnce();
    expect(touch.clear).toHaveBeenCalledOnce();
    expect(router.sample(2)).toMatchObject({
      moveX: 0,
      moveY: 0,
      boost: { held: false, pressed: false, released: false },
    });

    keyboard.frame = { buttons: { boost: false } };
    expect(router.sample(3).boost.pressed).toBe(false);
    keyboard.frame = { buttons: { boost: true } };
    expect(router.sample(4).boost).toEqual({
      held: true,
      pressed: true,
      released: false,
    });
  });

  it("returns immutable finite frames with the requested simulation tick", () => {
    const source = new FakeInput("scripted");
    source.frame = {
      moveX: Number.NaN,
      moveY: Number.POSITIVE_INFINITY,
      aimX: -2,
      aimY: 0,
      analogSequence: 1,
    };
    const frame = new InputRouter([source]).sample(99);

    expect(frame.tick).toBe(99);
    expect([frame.moveX, frame.moveY, frame.aimX, frame.aimY].every(Number.isFinite)).toBe(
      true,
    );
    expect(Object.isFrozen(frame)).toBe(true);
    expect(Object.isFrozen(frame.primary)).toBe(true);
  });
});
