import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
function replay() {
  const run = new RunFactory("full").create({ seed: 881 }); const bands = new Set<number>(); const trace = [];
  for (let tick = 1; tick <= 18000; tick++) {
    const frame = run.step({ ...neutralActionFrame(tick), moveX: 1 }); bands.add(frame.snapshot.threat.band);
    const actors = frame.snapshot.actors;
    for (const [tag, cap] of [["prey", 8], ["infantry", 4], ["vehicle", 2], ["aerial", 1], ["projectile", 24]] as const) expect(actors.filter(a => a.tags.includes(tag)).length).toBeLessThanOrEqual(cap);
    expect(Number.isFinite(frame.snapshot.worm.head.position.x + frame.snapshot.worm.head.position.y)).toBe(true);
    expect(frame.snapshot.diagnostics.eventOverflowCount).toBe(0);
    if (frame.events.length) trace.push(frame.events);
  }
  expect([...bands]).toEqual([0, 1, 2, 3]);
  return [run.snapshot(), trace];
}
it("replays 18000 ticks with all response bands, caps and no overflow", () => { expect(replay()).toEqual(replay()); }, 30000);
