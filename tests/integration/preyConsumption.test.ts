import { describe, expect, it } from "vitest";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { spawnActor } from "../../src/game/data/actors";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import type { DomainEvent } from "../../src/game/domain/events/DomainEvent";

function fixture(definitionId: string, speed: number, bite: boolean): { session: GameSession; events: DomainEvent[] } {
  const session = new GameSession({ seed: 7, movement: { ...movementBalance, initialSpeed: speed }, terrain: new FlatTerrainProfile(0), playerHealth: 94, actors: [spawnActor("target", definitionId, { x: 24, y: 180 })] });
  const events: DomainEvent[] = [];
  for (let tick = 1; tick <= 30; tick += 1) {
    events.push(...session.step({ ...neutralActionFrame(tick), primary: { held: bite, pressed: bite && tick === 1, released: false } }).events);
  }
  return { session, events };
}

describe("prey sustain", () => {
  it.each([[120, true], [360, false], [360, true]])("consumes once at speed %s with Bite=%s", (speed, bite) => {
    const { session, events } = fixture("actor.prey", speed, bite);
    expect(events.filter((event) => event.type === "target-consumed")).toHaveLength(1);
    expect(events.filter((event) => event.type === "actor-removed")).toHaveLength(1);
    const heals = events.filter((event) => event.type === "actor-healed");
    expect(heals).toHaveLength(1);
    expect(heals[0]).toMatchObject({ amount: 6 });
    expect(session.snapshot().actors.find((value) => value.id === "worm")?.health).toBe(100);
    expect(session.snapshot().actors.some((value) => value.id === "target")).toBe(false);
  });
  it("destroys infantry without healing and preserves identical event order", () => {
    const first = fixture("actor.infantry", 460, true);
    const second = fixture("actor.infantry", 460, true);
    expect(first.events).toEqual(second.events);
    expect(first.events.filter((event) => event.type === "actor-destroyed")).toHaveLength(1);
    expect(first.events.filter((event) => event.type === "actor-healed")).toHaveLength(0);
  });
});
