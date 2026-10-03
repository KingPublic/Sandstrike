import { expect, it } from "vitest";
import { VehicleController } from "../../src/game/domain/ai/VehicleController";
import { AerialController } from "../../src/game/domain/ai/AerialController";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { ProjectileSystem } from "../../src/game/domain/actors/enemies/ProjectileSystem";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import { spawnActor } from "../../src/game/data/actors";
import { CollisionWorld } from "../../src/game/domain/collision/CollisionWorld";
for (const kind of ["vehicle", "aerial"] as const) it(`${kind} telegraphs 60 ticks, locks aim and never fires without sight`, () => {
  const controller = kind === "vehicle" ? new VehicleController() : new AerialController();
  const random = new RandomSource(1).stream("ai.enemy"), fired: number[] = [];
  for (let tick = 1; tick <= 361; tick++) {
    const decision = controller.step({ selfId: kind, selfPosition: { x: 300, y: kind === "aerial" ? -220 : -20 }, tick, visibleTarget: { id: "worm", position: { x: tick, y: 0 } }, recentTarget: undefined }, tick, random);
    if (decision.fire) fired.push(tick);
    if (tick === 40) expect(decision.aimPoint?.x).toBe(1);
  }
  expect(fired).toEqual([61, 241]);
  for (let tick = 362; tick < 800; tick++) expect(controller.step({ selfId: kind, selfPosition: { x: 300, y: -20 }, tick, visibleTarget: undefined, recentTarget: undefined }, tick, random).fire).toBe(false);
});
it("resets weapon damage and owner when a projectile slot is reused", () => {
  const registry = new ActorRegistry([spawnActor("worm", "actor.worm", { x: 0, y: 0 })]), projectiles = new ProjectileSystem(registry, 1);
  projectiles.spawn("vehicle", { x: -50, y: 0 }, { x: 1, y: 0 }, 1, { id: "vehicle-shell", damage: 15, speed: 500, lifetimeSeconds: 2 }); registry.commit();
  expect(projectiles.step(.2, new CollisionWorld(), 2).commands[0]?.amount).toBe(15); registry.commit();
  projectiles.spawn("aerial", { x: -50, y: 0 }, { x: 1, y: 0 }, 3, { id: "aerial-round", damage: 10, speed: 500, lifetimeSeconds: 2 }); registry.commit();
  const second = projectiles.step(.2, new CollisionWorld(), 4).commands[0]; expect(second?.amount).toBe(10); expect(second?.abilityId).toBe("aerial-round");
});
