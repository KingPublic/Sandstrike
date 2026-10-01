import { describe, expect, it } from "vitest";
import { collisionProfiles } from "../../src/game/data/collisionProfiles";
import { CollisionWorld } from "../../src/game/domain/collision/CollisionWorld";
import type { CollisionProfile, CollisionShape } from "../../src/game/domain/collision/CollisionTypes";
import { actor } from "../fixtures/actors";

function profile(shape: CollisionShape): CollisionProfile {
  return { id: "test", layer: 2, mask: 1, shape };
}

describe("CollisionWorld", () => {
  it.each<CollisionShape>([
    { kind: "circle", radius: 10 },
    { kind: "box", halfWidth: 9, halfHeight: 16 },
    { kind: "capsule", from: { x: -12, y: 0 }, to: { x: 12, y: 0 }, radius: 4 },
  ])("detects circle contact with $kind", (shape) => {
    const actors = [actor("worm", 0, 0, collisionProfiles.worm), actor("target", 24, 0, profile(shape))];
    expect(new CollisionWorld().query(actors, actors)).toHaveLength(1);
    const separated = [actors[0]!, actor("target", 100, 0, profile(shape))];
    expect(new CollisionWorld().query(separated, separated)).toHaveLength(0);
  });

  it("handles capsule/capsule, capsule/box and box/box overlap", () => {
    const capsule = { id: "capsule", layer: 1, mask: 2, shape: { kind: "capsule", from: { x: -20, y: 0 }, to: { x: 20, y: 0 }, radius: 3 } } as const;
    const box = { id: "box", layer: 1, mask: 2, shape: { kind: "box", halfWidth: 9, halfHeight: 16 } } as const;
    for (const first of [capsule, box]) {
      for (const second of [profile(capsule.shape), profile(box.shape)]) {
        const actors = [actor("a", 0, 0, first), actor("b", 10, 0, second)];
        expect(new CollisionWorld().query(actors, actors)).toHaveLength(1);
      }
    }
  });

  it("sweeps maximum-speed heads and projectiles through thin targets", () => {
    for (const sourceProfile of [collisionProfiles.worm, collisionProfiles.projectile]) {
      const targetProfile = sourceProfile === collisionProfiles.worm
        ? profile({ kind: "box", halfWidth: 0.5, halfHeight: 16 })
        : collisionProfiles.worm;
      const before = [actor("source", -50, 0, sourceProfile), actor("target", 0, 0, targetProfile)];
      const after = [actor("source", 50, 0, sourceProfile), before[1]!];
      const contacts = new CollisionWorld().query(before, after);
      expect(contacts).toHaveLength(1);
      expect(contacts[0]?.sourceId).toBe("source");
    }
  });

  it("rejects corner near-misses and disallowed masks", () => {
    const before = [actor("worm", -50, 40, collisionProfiles.worm), actor("target", 0, 0, collisionProfiles.infantry)];
    const after = [actor("worm", 50, 40, collisionProfiles.worm), before[1]!];
    expect(new CollisionWorld().query(before, after)).toHaveLength(0);
    const masked = [actor("a"), actor("b")];
    expect(new CollisionWorld().query(masked, masked)).toHaveLength(0);
  });

  it("returns unique contacts in stable priority/id order regardless of insertion", () => {
    const actors = [actor("worm", 0, 0, collisionProfiles.worm), actor("z"), actor("a"), actor("shot", 0, 0, collisionProfiles.projectile)];
    const world = new CollisionWorld();
    const forward = world.query(actors, actors);
    expect(world.query([...actors].reverse(), [...actors].reverse())).toEqual(forward);
    expect(new Set(forward.map((contact) => contact.id)).size).toBe(forward.length);
    expect(forward.map((contact) => contact.kind)).toEqual(["projectile", "impact", "impact"]);
    expect(forward.filter((contact) => contact.kind === "impact").map((contact) => contact.targetId)).toEqual(["a", "z"]);
  });
});
