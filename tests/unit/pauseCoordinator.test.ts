import { describe, expect, it, vi } from "vitest";

import { PauseCoordinator } from "../../src/app/PauseCoordinator";

describe("PauseCoordinator", () => {
  it("stacks reasons and remains paused until the final reason is removed", () => {
    const onChange = vi.fn();
    const pause = new PauseCoordinator(onChange);

    pause.add("visibility");
    pause.add("focus");
    pause.add("visibility");

    expect(pause.has("visibility")).toBe(true);
    expect(pause.reasons).toEqual(["visibility", "focus"]);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(true, ["visibility", "focus"]);

    pause.remove("visibility");
    expect(pause.reasons).toEqual(["focus"]);
    expect(onChange).toHaveBeenLastCalledWith(true, ["focus"]);

    pause.remove("focus");
    expect(pause.reasons).toEqual([]);
    expect(onChange).toHaveBeenLastCalledWith(false, []);
  });

  it("returns an immutable ordered snapshot of supported reasons", () => {
    const pause = new PauseCoordinator();
    pause.add("system");
    pause.add("orientation");
    pause.add("user");

    const reasons = pause.reasons;
    expect(reasons).toEqual(["user", "orientation", "system"]);
    expect(Object.isFrozen(reasons)).toBe(true);
    expect(() => {
      pause.add("unsupported" as "user");
    }).toThrow(RangeError);
  });
});
