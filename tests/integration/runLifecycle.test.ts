import { describe, expect, it } from "vitest";
import { SessionController } from "../../src/game/application/SessionController";
import { RunFactory } from "../../src/game/application/RunFactory";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

describe("session lifecycle boundaries", () => {
  it("flushes paused exit without ticking movement, AI, combo or projectiles", () => {
    const controller = new SessionController(new RunFactory("fixture"));
    controller.start({ seed: 7 }); controller.advance(100);
    controller.pause(); const before = controller.snapshot();
    controller.advance(5000);
    expect(controller.snapshot()).toEqual(before);
    const result = controller.requestEnd();
    expect(result.snapshot).toEqual(before);
    expect(result.result?.reason).toBe("player-ended");
    expect(controller.requestEnd().events).toHaveLength(0);
  });
  it("chooses lethal damage over a queued exit at the combat boundary", () => {
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 10, initialProjectiles: [{ position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } }] });
    session.queueCommand({ type: "RequestEnd", reason: "player-ended", requestedTick: 0 });
    const result = session.step(neutralActionFrame(1));
    expect(result.result?.reason).toBe("defeated");
    expect(result.events.filter((event) => event.type === "run-ended")).toHaveLength(1);
    expect(session.step(neutralActionFrame(2)).events).toHaveLength(0);
    expect(session.snapshot().tick).toBe(1);
  });
  it("clears stale input on pause/resume, restarts with fresh identity and tears down its port", () => {
    let held = true; let clears = 0;
    const input = { sample: (tick: number) => ({ ...neutralActionFrame(tick), moveY: held ? 1 : 0 }), clear: () => { held = false; clears += 1; } };
    const controller = new SessionController(new RunFactory("fixture"));
    controller.attachInput(input); controller.start({ seed: 3 }); const first = controller.snapshot();
    held = true; controller.pause(); controller.resume(); controller.advance(17);
    expect(controller.snapshot().worm.head.tangent.y).toBe(0);
    controller.restart();
    expect(controller.snapshot().sessionId).not.toBe(first.sessionId);
    expect(controller.snapshot().seed).not.toBe(first.seed);
    controller.destroy(); expect(clears).toBeGreaterThanOrEqual(4);
    expect(() => controller.snapshot()).toThrow();
  });
});
