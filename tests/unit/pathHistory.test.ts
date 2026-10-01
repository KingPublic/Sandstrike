import { describe, expect, it } from "vitest";

import { PathHistory } from "../../src/game/domain/movement/PathHistory";

const RIGHT = Object.freeze({ x: 1, y: 0 });
const DOWN = Object.freeze({ x: 0, y: 1 });

function createHistory(capacity = 8): PathHistory {
  return new PathHistory({
    capacity,
    minSampleDistance: 4,
    maxTickGap: 4,
  });
}

describe("PathHistory", () => {
  it("appends only after the distance threshold or maximum tick gap", () => {
    const history = createHistory();
    history.reset({ x: 0, y: 0 }, RIGHT, 0);

    expect(history.append({ x: 3.99, y: 0 }, RIGHT, 1)).toBe(false);
    expect(history.sampleCount).toBe(1);
    expect(history.append({ x: 4, y: 0 }, RIGHT, 2)).toBe(true);
    expect(history.sampleCount).toBe(2);

    expect(history.append({ x: 4, y: 0 }, DOWN, 5)).toBe(false);
    expect(history.append({ x: 4, y: 0 }, DOWN, 6)).toBe(true);
    expect(history.sampleCount).toBe(3);
    expect(history.sampleDistanceBehind(0).tangent).toEqual(DOWN);
  });

  it("interpolates by cumulative travel distance and normalizes the tangent", () => {
    const history = createHistory();
    history.reset({ x: 0, y: 0 }, RIGHT, 0);
    history.append({ x: 10, y: 0 }, RIGHT, 1);
    history.append({ x: 20, y: 0 }, DOWN, 2);

    const midpoint = history.sampleDistanceBehind(5);
    expect(midpoint.position).toEqual({ x: 15, y: 0 });
    expect(midpoint.tangent.x).toBeCloseTo(Math.SQRT1_2, 12);
    expect(midpoint.tangent.y).toBeCloseTo(Math.SQRT1_2, 12);
    expect(history.sampleDistanceBehind(15)).toEqual({
      position: { x: 5, y: 0 },
      tangent: RIGHT,
    });
  });

  it("clamps distances beyond available history to the oldest pose", () => {
    const history = createHistory();
    history.reset({ x: 7, y: 9 }, DOWN, 12);
    history.append({ x: 7, y: 15 }, DOWN, 13);

    expect(history.sampleDistanceBehind(10_000)).toEqual({
      position: { x: 7, y: 9 },
      tangent: DOWN,
    });
  });

  it("keeps finite tangents across duplicate-position samples", () => {
    const history = createHistory();
    history.reset({ x: 1, y: 2 }, RIGHT, 0);
    history.append({ x: 1, y: 2 }, DOWN, 4);

    const newest = history.sampleDistanceBehind(0);
    expect(newest.tangent).toEqual(DOWN);
    expect(Number.isFinite(newest.tangent.x)).toBe(true);
    expect(Number.isFinite(newest.tangent.y)).toBe(true);
  });

  it("preserves chronological sampling after fixed-capacity wrap", () => {
    const history = createHistory(3);
    history.reset({ x: 0, y: 0 }, RIGHT, 0);
    history.append({ x: 4, y: 0 }, RIGHT, 1);
    history.append({ x: 8, y: 0 }, RIGHT, 2);
    history.append({ x: 12, y: 0 }, RIGHT, 3);

    expect(history.sampleCount).toBe(3);
    expect(history.sampleDistanceBehind(0).position).toEqual({ x: 12, y: 0 });
    expect(history.sampleDistanceBehind(4).position).toEqual({ x: 8, y: 0 });
    expect(history.sampleDistanceBehind(100).position).toEqual({ x: 4, y: 0 });
  });

  it("drops all old travel after reset and remains immutable", () => {
    const history = createHistory();
    history.reset({ x: 0, y: 0 }, RIGHT, 0);
    history.append({ x: 20, y: 0 }, RIGHT, 1);

    history.reset({ x: 400, y: 250 }, DOWN, 40);
    const pose = history.sampleDistanceBehind(100);

    expect(history.sampleCount).toBe(1);
    expect(pose).toEqual({
      position: { x: 400, y: 250 },
      tangent: DOWN,
    });
    expect(Object.isFrozen(pose)).toBe(true);
    expect(Object.isFrozen(pose.position)).toBe(true);
    expect(Object.isFrozen(pose.tangent)).toBe(true);
  });

  it("rejects invalid configuration, samples, tick order, and queries", () => {
    expect(
      () =>
        new PathHistory({
          capacity: 1,
          minSampleDistance: 4,
          maxTickGap: 4,
        }),
    ).toThrow(RangeError);

    const history = createHistory();
    expect(() => history.sampleDistanceBehind(0)).toThrow(Error);
    expect(() => {
      history.reset({ x: Number.NaN, y: 0 }, RIGHT, 0);
    }).toThrow(RangeError);
    expect(() => {
      history.reset({ x: 0, y: 0 }, { x: 0, y: 0 }, 0);
    }).toThrow(RangeError);

    history.reset({ x: 0, y: 0 }, RIGHT, 2);
    expect(() =>
      history.append({ x: Number.POSITIVE_INFINITY, y: 0 }, RIGHT, 3),
    ).toThrow(RangeError);
    expect(() => history.append({ x: 4, y: 0 }, RIGHT, 1)).toThrow(RangeError);
    expect(() => history.sampleDistanceBehind(Number.NaN)).toThrow(RangeError);
    expect(() => history.sampleDistanceBehind(-1)).toThrow(RangeError);
  });
});
