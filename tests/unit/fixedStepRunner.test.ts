import { describe, expect, it, vi } from "vitest";

import { FixedStepRunner } from "../../src/game/domain/session/FixedStepRunner";

const STEP_MS = 1000 / 60;

describe("FixedStepRunner", () => {
  it("advances at 60 Hz and reports fractional interpolation", () => {
    const runner = new FixedStepRunner();
    const step = vi.fn<(dtSeconds: number) => void>();

    const first = runner.advance(STEP_MS * 1.5, step);

    expect(step).toHaveBeenCalledTimes(1);
    expect(step).toHaveBeenCalledWith(1 / 60);
    expect(first.steps).toBe(1);
    expect(first.alpha).toBeCloseTo(0.5, 8);
    expect(first.droppedMs).toBe(0);

    const second = runner.advance(STEP_MS * 0.5, step);
    expect(step).toHaveBeenCalledTimes(2);
    expect(second).toEqual({ steps: 1, alpha: 0, droppedMs: 0 });
  });

  it("runs at most five catch-up steps and discards whole excess steps", () => {
    const runner = new FixedStepRunner();
    const step = vi.fn<(dtSeconds: number) => void>();

    const report = runner.advance(250, step);

    expect(step).toHaveBeenCalledTimes(5);
    expect(report.steps).toBe(5);
    expect(report.alpha).toBeGreaterThanOrEqual(0);
    expect(report.alpha).toBeLessThan(1);
    expect(report.droppedMs).toBeCloseTo(STEP_MS * 10, 6);
  });

  it("caps a long frame at 250 ms and reports all discarded time", () => {
    const runner = new FixedStepRunner();

    const report = runner.advance(1000, () => undefined);

    expect(report.steps).toBe(5);
    expect(report.droppedMs).toBeCloseTo(750 + STEP_MS * 10, 6);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "ignores invalid delta %s without calling the simulation",
    (deltaMs) => {
      const runner = new FixedStepRunner();
      const step = vi.fn<(dtSeconds: number) => void>();

      expect(runner.advance(deltaMs, step)).toEqual({
        steps: 0,
        alpha: 0,
        droppedMs: 0,
      });
      expect(step).not.toHaveBeenCalled();
    },
  );
});
