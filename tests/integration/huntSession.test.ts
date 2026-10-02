import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
it("uses fresh Hunt actors, seeded AI and one zero-time exit result", () => {
  const factory = new RunFactory("hunt");
  const run = factory.create({ seed: 88, mode: "hunt", fixtureId: "hunt-relay" });
  expect(run.snapshot().mode).toBe("hunt");
  expect(run.snapshot().actors.map(a => a.id)).toEqual(["hunter", "relay", "worm"]);
  expect(run.snapshot().hunt).toBeDefined();
  for (let tick = 1; tick <= 120; tick++) run.step(neutralActionFrame(tick));
  expect(run.snapshot().score.points).toBe(0);
  expect(run.snapshot().actors.every(a => !a.tags.includes("prey") && !a.tags.includes("infantry"))).toBe(true);
  run.queueCommand({ type: "RequestEnd", reason: "player-ended", requestedTick: run.tick });
  const end = run.flushControlCommands();
  expect(end.result?.mode).toBe("hunt"); expect(end.result?.reason).toBe("player-ended");
  expect(end.snapshot.tick).toBe(120); expect(end.events.filter(e => e.type === "run-ended")).toHaveLength(1);
  expect(run.flushControlCommands().result).toBeUndefined();
  const retry = factory.create({ seed: 88, mode: "hunt", fixtureId: "hunt-relay" });
  expect(retry.snapshot().sessionId).not.toBe(end.snapshot.sessionId);
  expect(retry.snapshot().hunt?.snare.phase).toBe("none");
});
it("keeps Hunt debug runs ineligible and decisions opt-in", () => {
  const factory = new RunFactory("debug");
  const normal = factory.create({ seed: 1, mode: "hunt" }); normal.step(neutralActionFrame(1));
  expect(normal.snapshot().hunt?.decision).toBeUndefined();
  const debug = factory.create({ seed: 1, mode: "hunt", debugAI: true }); debug.step(neutralActionFrame(1));
  expect(debug.snapshot().hunt?.decision).toBeDefined();
  expect(debug.snapshot().hunt?.eligibleForRecords).toBe(false);
});
it("normal start seed marks every natural breach with a full warning and reachable sector", () => {
  const run = new RunFactory("warning").create({ seed: 376940, mode: "hunt", fixtureId: "hunt-relay" });
  let crossings = 0;
  for (let tick = 1; tick <= 5400; tick++) {
    const frame = run.step(neutralActionFrame(tick));
    if (frame.events.some(e => e.type === "worm-breached")) {
      const bracket = frame.snapshot.hunt?.tracking.breachBracket;
      expect(bracket).toBeDefined();
      expect(tick - (bracket?.warningTick ?? tick)).toBeGreaterThanOrEqual(60);
      expect(frame.snapshot.worm.head.position.x).toBeGreaterThanOrEqual(bracket?.left ?? Infinity);
      expect(frame.snapshot.worm.head.position.x).toBeLessThanOrEqual(bracket?.right ?? -Infinity);
      crossings++;
    }
    if (frame.result) break;
  }
  expect(crossings).toBeGreaterThan(1);
});
