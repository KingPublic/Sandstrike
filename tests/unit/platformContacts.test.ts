import { describe, expect, it } from "vitest";

import { ascentArena, ascentHunterBalance } from "../../src/game/data/ascentArena";
import { crossedPlatform, supportPlatform, sweptLanding, type Platform, type VerticalBody } from "../../src/game/domain/world/PlatformContacts";

const body = (x: number, y: number): VerticalBody => ({ position: { x, y }, halfWidth: 12, halfHeight: ascentHunterBalance.halfHeight });
const platforms: readonly Platform[] = Object.freeze([
  Object.freeze({ id: "upper", left: -100, right: 100, y: -100 }),
  Object.freeze({ id: "lower", left: -100, right: 300, y: -40 }),
]);

describe("platform contacts", () => {
  it("reports the supported platform only while the feet rest on it", () => {
    expect(supportPlatform(body(0, -100 - ascentHunterBalance.halfHeight), platforms)?.id).toBe("upper");
    expect(supportPlatform(body(0, -40 - ascentHunterBalance.halfHeight), platforms)?.id).toBe("lower");
    expect(supportPlatform(body(400, -100 - ascentHunterBalance.halfHeight), platforms)).toBeUndefined();
  });

  it("lands on the first platform crossed while descending and ignores ascents", () => {
    const landed = sweptLanding(body(0, -200), body(0, -60), 900, platforms);
    expect(landed?.id).toBe("upper");
    expect(sweptLanding(body(0, -60), body(0, -200), -900, platforms)).toBeUndefined();
  });

  it("does not tunnel through a ledge at high fall speed and honours drop-through", () => {
    const fast = sweptLanding(body(0, -400), body(0, 320), ascentHunterBalance.maximumFallSpeed, platforms);
    expect(fast?.id).toBe("upper");
    const dropping = sweptLanding(body(0, -200), body(0, -20), 900, platforms, "upper");
    expect(dropping?.id).toBe("lower");
  });

  it("blocks a line that would pass through a platform edge", () => {
    expect(crossedPlatform({ x: 0, y: 200 }, { x: 0, y: -200 }, platforms)?.id).toBe("upper");
    expect(crossedPlatform({ x: 0, y: 200 }, { x: 0, y: -200 }, platforms, "upper")?.id).toBe("lower");
    expect(crossedPlatform({ x: 400, y: 200 }, { x: 400, y: -200 }, platforms)).toBeUndefined();
  });

  it("authors a climbable route from the base to the summit", () => {
    const sorted = [...ascentArena.platforms].sort((a, b) => b.y - a.y);
    expect(sorted[0]?.id).toBe("base");
    expect(sorted[sorted.length - 1]?.id).toBe("summit");
    const ids = new Set(ascentArena.platforms.map(platform => platform.id));
    expect(ids.size).toBe(ascentArena.platforms.length);
    for (let index = 1; index < sorted.length; index += 1) {
      const lower = sorted[index - 1], upper = sorted[index];
      if (!lower || !upper) throw new Error("Missing platform.");
      const jumpHeight = (ascentHunterBalance.jumpSpeed ** 2) / (2 * ascentHunterBalance.gravity);
      const airTime = (2 * ascentHunterBalance.jumpSpeed) / ascentHunterBalance.gravity;
      const reach = airTime * ascentHunterBalance.runSpeed;
      expect(lower.y - upper.y).toBeLessThan(jumpHeight);
      const horizontalGap = Math.max(0, lower.left - upper.right, upper.left - lower.right);
      expect(horizontalGap).toBeLessThan(reach);
    }
  });
});
