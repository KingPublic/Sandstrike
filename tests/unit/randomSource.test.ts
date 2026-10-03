import { describe, expect, it } from "vitest";
import { RandomSource } from "../../src/game/domain/random/RandomSource";

describe("named randomness", () => {
  it("replays sequences and isolates named streams", () => {
    const first = new RandomSource(123);
    const second = new RandomSource(123);
    for (let index = 0; index < 100; index += 1) {
      first.stream("cosmetic").float();
      expect(first.stream("spawn").float()).toBe(second.stream("spawn").float());
      expect(first.stream("ai").integer(-3, 4)).toBe(second.stream("ai").integer(-3, 4));
    }
    expect(first.stream("ai")).not.toBe(first.stream("spawn"));
    expect(new RandomSource(124).stream("spawn").float()).not.toBe(new RandomSource(123).stream("spawn").float());
  });
  it("keeps float and integer outputs bounded", () => {
    const random = new RandomSource(0).stream("spawn");
    for (let index = 0; index < 1_000; index += 1) {
      expect(random.float()).toBeGreaterThanOrEqual(0);
      expect(random.float()).toBeLessThan(1);
      expect(random.integer(3, 7)).toBeGreaterThanOrEqual(3);
      expect(random.integer(3, 7)).toBeLessThanOrEqual(7);
    }
    expect(() => random.integer(7, 3)).toThrow(RangeError);
  });
});
