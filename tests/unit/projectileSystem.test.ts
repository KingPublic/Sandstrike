import { describe, expect, it } from "vitest";
import { ProjectileSystem } from "../../src/game/domain/actors/enemies/ProjectileSystem";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import { CollisionWorld } from "../../src/game/domain/collision/CollisionWorld";
import { spawnActor } from "../../src/game/data/actors";

describe("pooled projectiles", () => {
  it("sweeps a fast shot once, resets slots and keeps IDs unique", () => {
    const registry = new ActorRegistry([spawnActor("worm", "actor.worm", { x: 0, y: 0 })]);
    const system = new ProjectileSystem(registry, 1);
    expect(system.spawn("soldier", { x: -50, y: 0 }, { x: 1, y: 0 }, 1)).toBeDefined();
    expect(system.spawn("soldier", { x: -50, y: 0 }, { x: 1, y: 0 }, 1)).toBeUndefined();
    registry.commit();
    const first = system.step(0.25, new CollisionWorld(), 2);
    expect(first.commands).toHaveLength(1);
    expect(first.commands[0]).toMatchObject({ amount: 10, targetId: "worm" });
    expect(system.step(1 / 60, new CollisionWorld(), 3).commands).toHaveLength(0);
    registry.commit();
    const nextId = system.spawn("soldier", { x: 200, y: 0 }, { x: -1, y: 0 }, 4);
    expect(nextId).not.toBe(first.commands[0]?.sourceId);
    expect(system.activeCount).toBe(1);
  });
  it("expires by simulation lifetime/world bounds with no subsequent hit", () => {
    const registry = new ActorRegistry();
    const system = new ProjectileSystem(registry);
    system.spawn("soldier", { x: 0, y: 0 }, { x: 1, y: 0 }, 1);
    registry.commit();
    system.step(3, new CollisionWorld(), 2);
    registry.commit();
    expect(system.activeCount).toBe(0);
    expect(system.step(1 / 60, new CollisionWorld(), 3).commands).toHaveLength(0);
    system.spawn("soldier", { x: 30_000, y: 0 }, { x: 1, y: 0 }, 4);
    registry.commit();
    system.step(1 / 60, new CollisionWorld(), 5);
    expect(system.activeCount).toBe(0);
  });
});
