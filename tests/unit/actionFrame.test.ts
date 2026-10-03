import { describe, expect, it } from "vitest";

import {
  ACTION_BUTTONS,
  neutralActionFrame,
} from "../../src/game/input/ActionFrame";

describe("neutralActionFrame", () => {
  it("preserves the tick and returns finite neutral axes", () => {
    const frame = neutralActionFrame(37);

    expect(frame.tick).toBe(37);
    expect([frame.moveX, frame.moveY, frame.aimX, frame.aimY]).toEqual([
      0, 0, 0, 0,
    ]);
    expect(
      [frame.moveX, frame.moveY, frame.aimX, frame.aimY].every(Number.isFinite),
    ).toBe(true);
    expect(frame.aimWorld).toBeUndefined();
  });

  it("creates a deeply immutable neutral state for every semantic button", () => {
    const frame = neutralActionFrame(4);

    for (const button of ACTION_BUTTONS) {
      expect(frame[button]).toEqual({
        held: false,
        pressed: false,
        released: false,
      });
      expect(Object.isFrozen(frame[button])).toBe(true);
    }

    expect(Object.isFrozen(frame)).toBe(true);
    expect(Object.isFrozen(ACTION_BUTTONS)).toBe(true);
  });

  it("does not share mutable button objects between frames", () => {
    const first = neutralActionFrame(1);
    const second = neutralActionFrame(2);

    expect(first.primary).not.toBe(second.primary);
    expect(first.pause).not.toBe(second.pause);
  });
});
