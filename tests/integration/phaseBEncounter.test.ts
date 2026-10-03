import { describe, expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

describe("Phase B combined-boundary stress fixture", () => {
  it("takes one protected projectile hit, heals and credits each overlapping target once", () => {
    const session = new RunFactory("fixture").create({ seed: 901, fixtureId: "phase-b-smoke" });
    const events = [];
    for (let tick = 1; tick <= 150; tick += 1) events.push(...session.step(neutralActionFrame(tick)).events);
    const snapshot = session.snapshot();
    expect(snapshot.score.preyConsumed).toBe(3); expect(snapshot.score.infantryDestroyed).toBe(4);
    expect(snapshot.actors.find((actor) => actor.id === "worm")?.health).toBe(44);
    expect(snapshot.threat.band).toBe(1);
    expect(events.filter((event) => event.type === "response-warning")).toHaveLength(1);
    expect(events.find((event) => event.type === "response-band-changed")?.tick).toBe(122);
    expect(events.filter((event) => event.type === "target-consumed")).toHaveLength(3);
    expect(snapshot.diagnostics.eventOverflowCount).toBe(0);
  });
  it("keeps ten high-speed contact runs finite with identical outcomes", () => {
    const runs = [];
    for (let repeat = 0; repeat < 10; repeat += 1) {
      const session = new RunFactory("fixture").create({ seed: 901, fixtureId: "phase-b-smoke" });
      for (let tick = 1; tick <= 120; tick += 1) {
        session.step(neutralActionFrame(tick));
        for (const pose of [session.snapshot().worm.head, ...session.snapshot().worm.followers]) expect([pose.position.x, pose.position.y, pose.tangent.x, pose.tangent.y].every(Number.isFinite)).toBe(true);
      }
      runs.push(session.snapshot());
    }
    for (const run of runs) expect(run).toEqual(runs[0]);
    expect(runs[0]?.score.infantryDestroyed).toBe(4);
  });
});
