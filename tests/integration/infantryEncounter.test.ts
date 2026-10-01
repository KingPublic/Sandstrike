import { describe, expect, it } from "vitest";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { spawnActor } from "../../src/game/data/actors";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

function run() {
  const session = new GameSession({ seed: 70, movement: { ...movementBalance, initialPosition: { x: 0, y: -40 }, initialDirection: { x: 0, y: 1 } }, terrain: new FlatTerrainProfile(0), actors: [spawnActor("soldier", "actor.infantry", { x: 200, y: -16 })] });
  const events = [];
  for (let tick = 1; tick <= 400; tick += 1) events.push(...session.step(neutralActionFrame(tick)).events);
  return { snapshot: session.snapshot(), events };
}

describe("infantry encounter", () => {
  it("replays AI diagnostics, telegraphs, shots and projectiles deterministically", () => {
    const first = run();
    expect(first).toEqual(run());
    expect(first.events.some((event) => event.type === "infantry-telegraph")).toBe(true);
    expect(first.events.some((event) => event.type === "projectile-fired")).toBe(true);
    expect(first.snapshot.ai[0]?.decision.state).toBeDefined();
    expect(first.snapshot.diagnostics.projectileCount).toBeLessThanOrEqual(24);
  });
  it("applies one projectile hit and rejects simultaneous damage within protection", () => {
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), initialProjectiles: [
      { position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } },
      { position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } },
    ] });
    const result = session.step(neutralActionFrame(1));
    expect(result.snapshot.actors.find((value) => value.id === "worm")?.health).toBe(90);
    const hits = result.events.filter((event) => event.type === "damage-applied");
    expect(hits.map((event) => event.amount)).toEqual([10, 0]);
  });
});
