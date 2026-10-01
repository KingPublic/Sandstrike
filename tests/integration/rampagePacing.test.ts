import { describe, expect, it } from "vitest";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

function run() {
  const session = new GameSession({ seed: 811, movement: movementBalance, terrain: new FlatTerrainProfile(0), mode: "rampage" });
  const events = [];
  for (let tick = 1; tick <= 5400; tick += 1) {
    const angle = tick / 100;
    const result = session.step({ ...neutralActionFrame(tick), moveX: Math.cos(angle), moveY: Math.sin(angle), primary: { held: true, pressed: tick % 25 === 1, released: false } });
    expect(result.snapshot.actors.filter((a) => a.tags.includes("prey")).length).toBeLessThanOrEqual(8);
    expect(result.snapshot.actors.filter((a) => a.tags.includes("infantry")).length).toBeLessThanOrEqual(4);
    expect(Math.abs(result.snapshot.worm.head.position.x)).toBeLessThanOrEqual(2382);
    events.push(...result.events);
  }
  return { snapshot: session.snapshot(), events };
}
describe("90-second Rampage pacing", () => {
  it("replays all outcomes, warning and legal populations with only bands 0–1", () => {
    const first = run();
    expect(first).toEqual(run());
    expect(first.snapshot.threat.band).toBe(1);
    expect(first.events.filter((e) => e.type === "response-warning")).toHaveLength(1);
    expect(first.events.find((e) => e.type === "response-band-changed")?.tick).toBe(2820);
    expect(first.snapshot.diagnostics.eventOverflowCount).toBe(0);
  });
});
