import { describe, expect, it } from "vitest";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { actor } from "../fixtures/actors";

describe("contact lifecycle boundary", () => {
  it("marks consume/destroy once and retains queryability until deferred commit", () => {
    const registry = new ActorRegistry([actor("prey")]);
    expect(registry.markForRemoval("prey", "consumed")).toBe(true);
    expect(registry.markForRemoval("prey", "destroyed")).toBe(false);
    expect(registry.get("prey")?.lifecycle).toBe("pending-removal");
    registry.deferSpawn(actor("next"));
    expect(registry.get("next")).toBeUndefined();
    expect(registry.commit().removed.map((value) => value.actor.id)).toEqual(["prey"]);
    expect(registry.get("prey")).toBeUndefined();
    expect(registry.get("next")).toBeDefined();
    expect(registry.commit().removed).toEqual([]);
  });

  it("publishes stable immutable contacts through the session boundary", () => {
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), actors: [actor("prey", 20, 180)] });
    const result = session.step(neutralActionFrame(1));
    expect(result.events.filter((event) => event.type === "contact")).toHaveLength(1);
    expect(result.snapshot.actors.map((value) => value.id)).toEqual(["prey", "worm"]);
    expect(result.snapshot.diagnostics.eventOverflowCount).toBe(0);
    expect(Object.isFrozen(result.snapshot.actors[0])).toBe(true);
  });
});
